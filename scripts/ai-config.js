// 스마트 AI 설정 파일
// 문제 생성은 기본적으로 서버의 내장 API(/api/ai/analyze)가 담당합니다.
// 브라우저에 API 키를 저장하지 않습니다. 서버 환경 변수 OPENAI_API_KEY를 설정하세요.
window.SIMPUL_OPENAI_API_KEY = '';
window.SIMPUL_OPENAI_MODEL = window.SIMPUL_OPENAI_MODEL || 'gpt-4.1-mini';

// 별도 백엔드 엔드포인트를 사용할 때만 입력합니다. 비워두면 /api/ai/analyze를 사용합니다.
window.SIMPUL_AI_API_URL = window.SIMPUL_AI_API_URL || '';
