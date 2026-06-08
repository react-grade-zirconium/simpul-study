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
