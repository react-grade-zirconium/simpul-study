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

## 폴더 구조

- `assets/`: 이미지/오디오/다운로드 자료 같은 정적 에셋을 모아둡니다. 로고는 `assets/images/simpul-logo.png`를 사용합니다.
- `subjects/`: 포털 iframe에 로드되는 과목별 학습 HTML을 모아둡니다.
- `scripts/`: 브라우저 스크립트와 검증 스크립트를 모아둡니다.
- `styles/`: 페이지별 CSS를 모아둡니다.
- `docs/`: 저장소 구조와 운영 문서를 모아둡니다.

자세한 구조는 `docs/STRUCTURE.md`를 참고하세요.
