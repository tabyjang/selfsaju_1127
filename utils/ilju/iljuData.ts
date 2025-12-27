// 60일주 데이터 정의

// 천간 (10개)
export const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export type Cheongan = typeof CHEONGAN[number];

// 지지 (12개)
export const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export type Jiji = typeof JIJI[number];

// 천간별 영문 ID (파일명용)
export const CHEONGAN_ID: Record<Cheongan, string> = {
  '갑': 'gap',
  '을': 'eul',
  '병': 'byeong',
  '정': 'jeong',
  '무': 'mu',
  '기': 'gi',
  '경': 'gyeong',
  '신': 'sin',
  '임': 'im',
  '계': 'gye',
};

// 천간별 한자
export const CHEONGAN_HANJA: Record<Cheongan, string> = {
  '갑': '甲',
  '을': '乙',
  '병': '丙',
  '정': '丁',
  '무': '戊',
  '기': '己',
  '경': '庚',
  '신': '辛',
  '임': '壬',
  '계': '癸',
};

// 천간별 오행
export const CHEONGAN_OHAENG: Record<Cheongan, string> = {
  '갑': '목',
  '을': '목',
  '병': '화',
  '정': '화',
  '무': '토',
  '기': '토',
  '경': '금',
  '신': '금',
  '임': '수',
  '계': '수',
};

// 천간별 오행 색상 (Tailwind CSS)
export const CHEONGAN_COLOR: Record<Cheongan, { bg: string; glow: string; text: string }> = {
  '갑': { bg: 'bg-green-600', glow: 'shadow-green-500/50', text: 'text-green-600' },
  '을': { bg: 'bg-green-500', glow: 'shadow-green-400/50', text: 'text-green-500' },
  '병': { bg: 'bg-red-600', glow: 'shadow-red-500/50', text: 'text-red-600' },
  '정': { bg: 'bg-red-500', glow: 'shadow-red-400/50', text: 'text-red-500' },
  '무': { bg: 'bg-yellow-600', glow: 'shadow-yellow-500/50', text: 'text-yellow-600' },
  '기': { bg: 'bg-yellow-500', glow: 'shadow-yellow-400/50', text: 'text-yellow-500' },
  '경': { bg: 'bg-gray-500', glow: 'shadow-gray-400/50', text: 'text-gray-500' },
  '신': { bg: 'bg-gray-400', glow: 'shadow-gray-300/50', text: 'text-gray-400' },
  '임': { bg: 'bg-blue-600', glow: 'shadow-blue-500/50', text: 'text-blue-600' },
  '계': { bg: 'bg-blue-500', glow: 'shadow-blue-400/50', text: 'text-blue-500' },
};

// 천간별 이미지 설명 (마우스 오버 시 표시될 이미지)
export const CHEONGAN_IMAGE_DESC: Record<Cheongan, string> = {
  '갑': '큰 나무',
  '을': '푸른 풀잎',
  '병': '태양',
  '정': '촛불',
  '무': '거대한 산맥',
  '기': '작은 텃밭',
  '경': '거대한 바위',
  '신': '보석',
  '임': '바다',
  '계': '비내리는 모습',
};

// 천간별 이미지 경로
export const CHEONGAN_IMAGE_PATH: Record<Cheongan, string> = {
  '갑': '/theories/content/60ilju/cheongan/gap.webp',
  '을': '/theories/content/60ilju/cheongan/eul.webp',
  '병': '/theories/content/60ilju/cheongan/byeong.webp',
  '정': '/theories/content/60ilju/cheongan/jeong.webp',
  '무': '/theories/content/60ilju/cheongan/mu.webp',
  '기': '/theories/content/60ilju/cheongan/gi.webp',
  '경': '/theories/content/60ilju/cheongan/gyeong.webp',
  '신': '/theories/content/60ilju/cheongan/sin.webp',
  '임': '/theories/content/60ilju/cheongan/im.webp',
  '계': '/theories/content/60ilju/cheongan/gye.webp',
};

// 60갑자 순서 (천간 + 지지 조합)
export const SIXTY_GANJI: string[] = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임술', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임자', '계해',
];

// 천간별 일주 목록
export const ILJU_BY_CHEONGAN: Record<Cheongan, string[]> = {
  '갑': ['갑자', '갑인', '갑진', '갑오', '갑신', '갑술'],
  '을': ['을축', '을묘', '을사', '을미', '을유', '을해'],
  '병': ['병인', '병진', '병오', '병신', '병술', '병자'],
  '정': ['정묘', '정사', '정미', '정유', '정해', '정축'],
  '무': ['무진', '무오', '무신', '무술', '무자', '무인'],
  '기': ['기사', '기미', '기유', '기해', '기축', '기묘'],
  '경': ['경오', '경신', '경술', '경자', '경인', '경진'],
  '신': ['신미', '신유', '신해', '신축', '신묘', '신사'],
  '임': ['임신', '임술', '임자', '임인', '임진', '임오'],
  '계': ['계유', '계해', '계축', '계묘', '계사', '계미'],
};

// 일주 한글 → 영문 ID 매핑 (MD 파일명용)
export const ILJU_TO_FILENAME: Record<string, string> = {
  '갑자': '갑자', '갑인': '갑인', '갑진': '갑진', '갑오': '갑오', '갑신': '갑신', '갑술': '갑술',
  '을축': '을축', '을묘': '을묘', '을사': '을사', '을미': '을미', '을유': '을유', '을해': '을해',
  '병인': '병인', '병진': '병진', '병오': '병오', '병신': '병신', '병술': '병술', '병자': '병자',
  '정묘': '정묘', '정사': '정사', '정미': '정미', '정유': '정유', '정해': '정해', '정축': '정축',
  '무진': '무진', '무오': '무오', '무신': '무신', '무술': '무술', '무자': '무자', '무인': '무인',
  '기사': '기사', '기미': '기미', '기유': '기유', '기해': '기해', '기축': '기축', '기묘': '기묘',
  '경오': '경오', '경신': '경신', '경술': '경술', '경자': '경자', '경인': '경인', '경진': '경진',
  '신미': '신미', '신유': '신유', '신해': '신해', '신축': '신축', '신묘': '신묘', '신사': '신사',
  '임신': '임신', '임술': '임술', '임자': '임자', '임인': '임인', '임진': '임진', '임오': '임오',
  '계유': '계유', '계해': '계해', '계축': '계축', '계묘': '계묘', '계사': '계사', '계미': '계미',
};

// 일주별 orderIndex (60갑자 순서)
export const ILJU_ORDER_INDEX: Record<string, number> = Object.fromEntries(
  SIXTY_GANJI.map((ilju, index) => [ilju, index + 1])
);

// 천간에서 일주 추출
export function getCheonganFromIlju(ilju: string): Cheongan {
  return ilju.charAt(0) as Cheongan;
}

// 지지에서 일주 추출
export function getJijiFromIlju(ilju: string): Jiji {
  return ilju.charAt(1) as Jiji;
}

// 다음/이전 일주 가져오기
export function getAdjacentIlju(ilju: string): { prev: string | null; next: string | null } {
  const index = SIXTY_GANJI.indexOf(ilju);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? SIXTY_GANJI[index - 1] : null,
    next: index < SIXTY_GANJI.length - 1 ? SIXTY_GANJI[index + 1] : null,
  };
}

// 일주 정보 타입
export interface IljuInfo {
  name: string;
  cheongan: Cheongan;
  jiji: Jiji;
  orderIndex: number;
  imagePath: string;
}

// 일주 상세 정보 가져오기
export function getIljuInfo(ilju: string): IljuInfo | null {
  if (!SIXTY_GANJI.includes(ilju)) return null;

  const cheongan = getCheonganFromIlju(ilju);
  const jiji = getJijiFromIlju(ilju);

  return {
    name: ilju,
    cheongan,
    jiji,
    orderIndex: ILJU_ORDER_INDEX[ilju],
    imagePath: `/60ilju/${ilju}/img-01.webp`,
  };
}
