import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const staticAssetPattern = /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i;

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});
app.use(express.static(rootDir, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (staticAssetPattern.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));


const FREECONVERT_API_BASE = 'https://api.freeconvert.com/v1';
const FREECONVERT_POLL_LIMIT = 8;
const FREECONVERT_POLL_DELAY_MS = 1200;
const youtubeHostPattern = /(^|\.)youtube\.com$|^youtu\.be$/i;
const supportedConvertInputPattern = /\.(?:mp3|wav|ogg|m4a|aac|flac|mp4|webm|mov|mkv|avi)(?:$|[?#])/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFreeConvertKey() {
  return process.env.FREECONVERT_API_KEY || '';
}

function normalizeConvertibleUrl(rawUrl) {
  const url = new URL(String(rawUrl || '').trim());
  if (!['http:', 'https:'].includes(url.protocol)) {
    const error = new Error('HTTP/HTTPS URL만 변환할 수 있습니다.');
    error.statusCode = 400;
    throw error;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (youtubeHostPattern.test(host)) {
    const error = new Error('YouTube 링크의 자동 MP3 변환은 지원하지 않습니다. Ragtag 보관본 또는 파일 업로드를 사용해 주세요.');
    error.statusCode = 400;
    throw error;
  }
  if (!supportedConvertInputPattern.test(url.pathname)) {
    const error = new Error('직접 다운로드 가능한 오디오/비디오 파일 URL만 MP3로 변환할 수 있습니다.');
    error.statusCode = 400;
    throw error;
  }
  return url.href;
}

async function freeConvertFetch(pathname, options = {}) {
  const apiKey = getFreeConvertKey();
  if (!apiKey) {
    const error = new Error('FREECONVERT_API_KEY 환경 변수가 설정되지 않았습니다.');
    error.statusCode = 503;
    throw error;
  }
  const response = await fetch(`${FREECONVERT_API_BASE}${pathname}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error || `FreeConvert API 요청에 실패했습니다. (${response.status})`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function findFreeConvertDownloadUrl(value) {
  if (!value || typeof value !== 'object') return '';
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFreeConvertDownloadUrl(item);
      if (found) return found;
    }
    return '';
  }
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' && /^https?:\/\//i.test(item) && /url|download/i.test(key)) return item;
    const found = findFreeConvertDownloadUrl(item);
    if (found) return found;
  }
  return '';
}

function simplifyFreeConvertJob(job) {
  const status = job?.status || job?.job?.status || 'unknown';
  const id = job?.id || job?.job?.id || '';
  return {
    id,
    status,
    downloadUrl: findFreeConvertDownloadUrl(job),
    rawStatus: status
  };
}

async function pollFreeConvertJob(jobId) {
  let job = null;
  for (let attempt = 0; attempt < FREECONVERT_POLL_LIMIT; attempt += 1) {
    job = await freeConvertFetch(`/process/jobs/${encodeURIComponent(jobId)}`);
    const summary = simplifyFreeConvertJob(job);
    if (summary.status === 'completed' || summary.status === 'failed' || summary.status === 'canceled' || summary.downloadUrl) {
      return summary;
    }
    await sleep(FREECONVERT_POLL_DELAY_MS);
  }
  return simplifyFreeConvertJob(job);
}

app.post('/api/music/convert-mp3', async (req, res) => {
  try {
    const url = normalizeConvertibleUrl(req.body?.url);
    const job = await freeConvertFetch('/process/jobs', {
      method: 'POST',
      body: JSON.stringify({
        tasks: {
          import_file: { operation: 'import/url', url },
          convert_file: { operation: 'convert', input: 'import_file', output_format: 'mp3' },
          export_file: { operation: 'export/url', input: 'convert_file' }
        }
      })
    });
    const summary = simplifyFreeConvertJob(job);
    const jobId = summary.id || job?.id;
    if (!jobId) return res.status(502).json({ error: 'FreeConvert 작업 ID를 받지 못했습니다.' });
    const polled = await pollFreeConvertJob(jobId);
    res.json({ ...polled, id: jobId });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'MP3 변환 요청에 실패했습니다.' });
  }
});

app.get('/api/music/convert-mp3/:jobId', async (req, res) => {
  try {
    const summary = await pollFreeConvertJob(req.params.jobId);
    res.json({ ...summary, id: req.params.jobId });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'MP3 변환 상태 확인에 실패했습니다.' });
  }
});

function parseAiJson(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

function normalizeAiResult(result) {
  const summaryPoints = Array.isArray(result?.summary_points) ? result.summary_points : [];
  const questions = Array.isArray(result?.questions) ? result.questions : [];
  return {
    summary_points: summaryPoints.map(String).filter(Boolean).slice(0, 3),
    questions: questions.map(String).filter(Boolean).slice(0, 5)
  };
}

app.post('/api/ai/analyze', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({ error: 'OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.' });
    }

    const rawText = String(req.body?.text || '').replace(/\s+/g, ' ').trim();
    const subject = String(req.body?.subject || '선택 과목').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (rawText.length < 10) {
      return res.status(400).json({ error: '분석할 학습 내용이 너무 짧습니다.' });
    }

    const input = rawText.slice(0, 12000);
    const response = await client.responses.create({
      model,
      instructions: [
        '너는 한국어로 답하는 중고등학생용 학습 코치다.',
        '입력된 학습 내용을 바탕으로 개념을 익히게 하는 연습문제를 만든다.',
        '각 문제는 짧은 개념 설명, 적용 문제, 풀이 방향을 함께 담아 학습용으로 만든다.',
        '과목명이 있으면 해당 과목 시험 대비에 맞는 연습문제로 만든다.',
        '반드시 JSON만 출력한다. 형식: {"summary_points":["..."],"questions":["..."]}'
      ].join(' '),
      input: `과목: ${subject || '선택 과목'}\n학습 내용:\n${input}\n\n요구사항:\n- summary_points는 3개 이하\n- questions는 5개\n- 각 questions 항목은 '개념 설명 → 연습문제 → 풀이 방향' 순서로 구성\n- 한국어로 작성`,
      text: {
        format: {
          type: 'json_schema',
          name: 'study_coach_result',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary_points: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 3
              },
              questions: {
                type: 'array',
                items: { type: 'string' },
                minItems: 4,
                maxItems: 5
              }
            },
            required: ['summary_points', 'questions']
          }
        }
      }
    });

    const parsed = normalizeAiResult(parseAiJson(response.output_text));
    if (!parsed.summary_points.length || !parsed.questions.length) {
      return res.status(502).json({ error: 'AI 응답 형식이 올바르지 않습니다.' });
    }

    res.json(parsed);
  } catch (error) {
    console.error('OpenAI analyze failed:', error);
    res.status(500).json({ error: 'OpenAI API 호출에 실패했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`SIMPUL server listening on http://localhost:${port}`);
});
