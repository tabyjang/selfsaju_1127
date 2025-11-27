// 백엔드 API URL 설정
// 로컬 개발: 비어있음 (CORS 이슈로 localhost에서는 mock 데이터 사용)
// 프로덕션: Vercel에 배포된 API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 예: 'https://your-project.vercel.app'
// Vercel에 배포 후 이 값을 설정하세요
