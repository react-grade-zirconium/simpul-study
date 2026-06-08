# SIMPUL STUDY

## 실행

```bash
npm install
npm start
```

- `npm start`는 `server.mjs`를 실행하고 정적 파일을 제공합니다.
- 별도 API 키나 추가 백엔드 설정은 필요하지 않습니다.

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
