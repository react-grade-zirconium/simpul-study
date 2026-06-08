import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const staticAssetPattern = /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i;
const societyOriginalHtmlPath = process.env.SIMPUL_SOCIETY_HTML_PATH || 'C:/Users/a3327/Downloads/통합사회_4단원_정리.html';

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

app.get('/society-original.html', async (_req, res) => {
  try {
    const html = await readFile(societyOriginalHtmlPath, 'utf8');
    res.setHeader('Cache-Control', 'no-cache');
    res.type('html').send(html);
  } catch (_) {
    res.status(404).type('html').send([
      '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '<title>통합사회 원본 파일을 찾을 수 없습니다</title>',
      '<style>body{font-family:system-ui,sans-serif;margin:0;padding:28px;color:#0f172a;background:#f8fafc;line-height:1.7}.box{max-width:760px;margin:auto;background:#fff;border:1px solid #dbe3ef;border-radius:18px;padding:22px;box-shadow:0 12px 28px rgba(15,23,42,.08)}code{background:#f1f5f9;border-radius:6px;padding:2px 6px}</style>',
      '</head><body><main class="box"><h1>통합사회 원본 파일을 찾을 수 없습니다.</h1>',
      `<p>원본을 변형하지 않기 위해 서버가 로컬 파일 <code>${societyOriginalHtmlPath}</code>을 그대로 읽어 표시하도록 설정되어 있습니다.</p>`,
      '<p>해당 파일을 그 위치에 두고 서버를 다시 실행하거나, <code>SIMPUL_SOCIETY_HTML_PATH</code> 환경 변수로 원본 HTML 경로를 지정해 주세요.</p>',
      '</main></body></html>'
    ].join(''));
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
