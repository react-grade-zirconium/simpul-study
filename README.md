# SIMPUL STUDY

## 실행

```bash
npm install
OPENAI_API_KEY=your_api_key npm start
```

- `npm start`는 `server.mjs`를 실행하고 정적 파일과 `/api/ai/analyze` API를 함께 제공합니다.
- `OPENAI_API_KEY`가 없으면 AI 위젯은 자동으로 브라우저 로컬 모드로 전환됩니다.
- 모델은 기본값 `gpt-4.1-mini`를 사용하며, 필요하면 `OPENAI_MODEL` 환경 변수로 바꿀 수 있습니다.

## Assets

- 로고는 저장소 루트의 `simpul-logo.png`를 사용합니다.
- `index.html`/`portal.html`은 `styles/`와 `scripts/` 아래의 파일을 로드합니다.
