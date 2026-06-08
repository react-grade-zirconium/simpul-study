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

## 통합사회 4단원 원본 HTML 가져오기

사회 탭은 저장소의 `통합사회_4단원_정리.html`을 iframe으로 그대로 표시합니다. 원본 파일이 사용자 PC의 다운로드 폴더에 있다면 아래 명령으로 원본 소스 코드를 변형 없이 저장소 파일로 복사하세요.

```bash
npm run import:society
```

기본 원본 경로는 `C:/Users/a3327/Downloads/통합사회_4단원_정리.html`입니다. 파일 위치가 다르면 다음처럼 `SIMPUL_SOCIETY_HTML_PATH`를 지정할 수 있습니다.

```bash
SIMPUL_SOCIETY_HTML_PATH="C:/path/to/통합사회_4단원_정리.html" npm run import:society
```
