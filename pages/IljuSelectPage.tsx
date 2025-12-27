import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  CHEONGAN,
  CHEONGAN_HANJA,
  CHEONGAN_OHAENG,
  CHEONGAN_IMAGE_DESC,
  CHEONGAN_IMAGE_PATH,
  ILJU_BY_CHEONGAN,
  type Cheongan,
} from '../utils/ilju/iljuData';

// 지지 한자 매핑
const JIJI_HANJA: Record<string, string> = {
  '자': '子', '축': '丑', '인': '寅', '묘': '卯',
  '진': '辰', '사': '巳', '오': '午', '미': '未',
  '신': '申', '유': '酉', '술': '戌', '해': '亥',
};

// 지지 오행 매핑
const JIJI_OHAENG: Record<string, string> = {
  '자': '수', '축': '토', '인': '목', '묘': '목',
  '진': '토', '사': '화', '오': '화', '미': '토',
  '신': '금', '유': '금', '술': '토', '해': '수',
};

// 지지 오행별 두꺼운 테두리 색상
const JIJI_BORDER: Record<string, string> = {
  '목': 'border-[10px] border-[#00B050]',
  '화': 'border-[10px] border-[#FF0000]',
  '토': 'border-[10px] border-[#FEC100]',
  '금': 'border-[10px] border-slate-400',
  '수': 'border-[10px] border-gray-900',
};

// 일주 카드 컴포넌트
const IljuCard: React.FC<{
  ilju: string;
  cheongan: Cheongan;
  onClick: () => void;
}> = ({ ilju, cheongan, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const jiji = ilju.charAt(1);
  const cheonganHanja = CHEONGAN_HANJA[cheongan];
  const jijiHanja = JIJI_HANJA[jiji];
  const ohaeng = CHEONGAN_OHAENG[cheongan];
  const jijiOhaeng = JIJI_OHAENG[jiji];
  const imagePath = CHEONGAN_IMAGE_PATH[cheongan];

  // 오행별 색상 (result 페이지와 동일)
  const ohaengColors: Record<string, { bg: string; text: string; border: string }> = {
    '목': { bg: 'bg-[#00B050]', text: 'text-white', border: 'border-2 border-gray-800' },
    '화': { bg: 'bg-[#FF0000]', text: 'text-white', border: 'border-2 border-gray-800' },
    '토': { bg: 'bg-[#FEC100]', text: 'text-white', border: 'border-2 border-gray-800' },
    '금': { bg: 'bg-slate-200', text: 'text-gray-800', border: 'border-2 border-gray-800' },
    '수': { bg: 'bg-black', text: 'text-white', border: 'border-2 border-gray-800' },
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        ${ohaengColors[ohaeng].bg} ${JIJI_BORDER[jijiOhaeng]}
        ${isHovered ? 'scale-105 shadow-lg shadow-black/50' : 'shadow-md'}
      `}
      style={{ height: '160px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 이미지 배경 (호버 시) */}
      {!imageError && (
        <div
          className={`
            absolute inset-0 transition-opacity duration-500
            ${isHovered && imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <img
            src={imagePath}
            alt={`${cheongan} 이미지`}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center py-4 px-2">
        {/* 한자 */}
        <div
          className={`
            flex gap-0.5 text-xl md:text-2xl font-bold
            ${isHovered ? 'text-white' : ohaengColors[ohaeng].text}
            transition-all duration-300
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
          style={isHovered ? { textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}
        >
          <span>{cheonganHanja}</span>
          <span>{jijiHanja}</span>
        </div>

        {/* 한글 이름 */}
        <div
          className={`text-base md:text-lg font-bold mt-1 ${isHovered ? 'text-white' : ohaengColors[ohaeng].text}`}
          style={isHovered ? { textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}
        >
          {ilju}
        </div>
      </div>
    </div>
  );
};

const IljuSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { cheongan } = useParams<{ cheongan: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cheongan]);

  // 유효한 천간인지 확인
  const isValidCheongan = cheongan && CHEONGAN.includes(cheongan as Cheongan);

  if (!isValidCheongan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">잘못된 접근입니다</h1>
          <Link to="/60ilju" className="text-blue-400 hover:underline">
            60일주 메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const currentCheongan = cheongan as Cheongan;
  const iljuList = ILJU_BY_CHEONGAN[currentCheongan];
  const ohaeng = CHEONGAN_OHAENG[currentCheongan];
  const hanja = CHEONGAN_HANJA[currentCheongan];
  const imageDesc = CHEONGAN_IMAGE_DESC[currentCheongan];

  // 이전/다음 천간
  const currentIndex = CHEONGAN.indexOf(currentCheongan);
  const prevCheongan = currentIndex > 0 ? CHEONGAN[currentIndex - 1] : null;
  const nextCheongan = currentIndex < CHEONGAN.length - 1 ? CHEONGAN[currentIndex + 1] : null;

  const handleIljuClick = (ilju: string) => {
    navigate(`/60ilju/${currentCheongan}/${ilju}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* 뒤로가기 */}
        <Link
          to="/60ilju"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>천간 선택으로 돌아가기</span>
        </Link>

        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm mb-6">
            <span className="text-5xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {hanja}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {currentCheongan}{ohaeng} 일주
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            {imageDesc}의 기운을 가진 6개의 일주
          </p>
          <p className="text-gray-400 text-sm">
            일주를 선택하면 상세 정보를 확인할 수 있습니다
          </p>
        </div>

        {/* 일주 카드 그리드 - 한 줄에 6개 */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 max-w-4xl mx-auto">
          {iljuList.map((ilju) => (
            <IljuCard
              key={ilju}
              ilju={ilju}
              cheongan={currentCheongan}
              onClick={() => handleIljuClick(ilju)}
            />
          ))}
        </div>

        {/* 이전/다음 천간 네비게이션 */}
        <div className="flex justify-between mt-12">
          {prevCheongan ? (
            <Link
              to={`/60ilju/${prevCheongan}`}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-white font-medium">
                {CHEONGAN_HANJA[prevCheongan]} {prevCheongan}{CHEONGAN_OHAENG[prevCheongan]}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextCheongan ? (
            <Link
              to={`/60ilju/${nextCheongan}`}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-white font-medium">
                {CHEONGAN_HANJA[nextCheongan]} {nextCheongan}{CHEONGAN_OHAENG[nextCheongan]}
              </span>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IljuSelectPage;
