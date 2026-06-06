# SIMPUL STUDY

## 실행

```bash
npm install
OPENAI_API_KEY=your_api_key npm start
```

- `npm start`는 `server.mjs`를 실행하고 정적 파일과 `/api/ai/analyze` API를 함께 제공합니다.
- 서버로 실행할 때는 `OPENAI_API_KEY` 환경 변수를 사용합니다. 환경 변수가 없으면 스마트 AI 학습 코치는 브라우저 로컬 모드로 전환됩니다.
- GitHub Pages처럼 정적 사이트로 배포하면서 키를 코드에 직접 넣을 때는 `scripts/ai-config.js`의 `window.SIMPUL_OPENAI_API_KEY = '';` 따옴표 안에 API 키를 붙여넣으세요.
- 모델은 기본값 `gpt-4.1-mini`를 사용하며, 정적 배포에서는 `scripts/ai-config.js`의 `window.SIMPUL_OPENAI_MODEL`, 서버 실행에서는 `OPENAI_MODEL` 환경 변수로 바꿀 수 있습니다.
- 별도 백엔드를 쓸 때만 `scripts/ai-config.js`의 `window.SIMPUL_AI_API_URL`을 백엔드/프록시 주소로 설정하세요. 필요하면 서버의 `ALLOWED_ORIGIN`으로 허용할 사이트 주소를 제한할 수 있습니다.

## Assets

- 로고는 저장소 루트의 `simpul-logo.png`를 사용합니다.
- `index.html`/`portal.html`은 `styles/`와 `scripts/` 아래의 파일을 로드합니다.

## BGM MP3 변환

BGM 위젯의 `MP3` 버튼은 서버 실행 환경에서 `FREECONVERT_API_KEY`가 설정되어 있을 때만 동작합니다.

```bash
OPENAI_API_KEY=your_openai_key FREECONVERT_API_KEY=your_freeconvert_key npm start
```

- 키는 서버 환경 변수로만 읽고 브라우저 코드에는 내려보내지 않습니다.
- 직접 다운로드 가능한 오디오/비디오 파일 URL만 변환 대상으로 허용합니다.
- YouTube URL의 자동 MP3 변환은 지원하지 않으며, BGM 위젯은 기존처럼 Ragtag Archive 보관본을 먼저 사용합니다.
