import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(process.cwd()));

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
    if (rawText.length < 10) {
      return res.status(400).json({ error: '분석할 학습 내용이 너무 짧습니다.' });
    }

    const input = rawText.slice(0, 12000);
    const response = await client.responses.create({
      model,
      instructions: [
        '너는 한국어로 답하는 중고등학생용 학습 코치다.',
        '입력된 학습 내용을 바탕으로 핵심 포인트와 자기점검 문제를 만든다.',
        '반드시 JSON만 출력한다. 형식: {"summary_points":["..."],"questions":["..."]}'
      ].join(' '),
      input: `학습 내용:\n${input}\n\n요구사항:\n- summary_points는 3개 이하\n- questions는 4~5개\n- 질문은 짧고 명확하게\n- 한국어로 작성`,
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
