# SIMPUL STUDY

## 실행

```bash
npm install
npm start
```

- `npm start`는 `server.mjs`를 실행하고 정적 파일과 사용량 API를 함께 제공합니다.
- 서버 기본 주소는 `http://localhost:5000`입니다. 배포 환경에서 `PORT`를 제공하면 그 값을 자동으로 사용합니다.
- 관리자 통계는 서버 API(`/api/usage-event`, `/api/usage-stats`)가 켜져 있어야 전체 학생 기록을 모아서 볼 수 있습니다.

## 서버/관리자 설정

1. `.env.example`을 참고해서 배포 환경의 Secrets 또는 환경변수에 값을 넣습니다.
2. 최소한 `ADMIN_PASSWORD`는 학생들에게 공유되지 않는 값으로 꼭 바꿔 주세요.
3. Replit에서는 이 저장소의 `.replit` 설정이 `npm start`를 실행하고 5000번 포트를 웹으로 연결합니다.

권장 환경변수:

```bash
PORT=5000
HOST=0.0.0.0
ADMIN_PASSWORD=원하는_관리자_비밀번호
USAGE_DATA_DIR=data
USAGE_DATA_FILE=usage-stats.json
```

서버 확인:

```bash
npm run smoke:server
```

관리자 화면 사용 방법:

- 첫 화면 오른쪽 아래의 `관리자` 버튼을 누릅니다.
- 설정한 `ADMIN_PASSWORD`를 입력하면 전체 학생의 방문/학습 시작/과목 열람/이용 시간 통계를 볼 수 있습니다.
- 서버 API에 연결되지 않는 정적 파일 실행 환경에서는 현재 기기의 로컬 기록만 표시됩니다.

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
