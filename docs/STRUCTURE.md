# Project structure

SIMPUL STUDY 저장소는 루트에 진입 HTML과 서버만 두고, 기능별 파일은 하위 폴더로 분리합니다.

| Path | Purpose |
| --- | --- |
| `index.html`, `portal.html` | 사용자가 직접 여는 주요 페이지 |
| `server.mjs` | Express 정적 서버와 AI 분석 API |
| `scripts/` | 브라우저 스크립트와 검증 스크립트 |
| `styles/` | 페이지별 CSS |
| `assets/` | 이미지, 오디오, 다운로드 자료 등 정적 에셋 |
| `subjects/` | 포털 iframe에 로드되는 과목별 학습 HTML |
| `docs/` | 저장소 구조와 운영 문서 |

새 에셋은 `assets/` 아래의 유형별 폴더에 넣고, 새 학습 페이지는 `subjects/` 아래에 추가합니다.
