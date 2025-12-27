import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  CHEONGAN,
  CHEONGAN_HANJA,
  CHEONGAN_OHAENG,
  CHEONGAN_IMAGE_DESC,
  CHEONGAN_IMAGE_PATH,
  type Cheongan,
} from '../utils/ilju/iljuData';

// 천간 카드 컴포넌트
const CheonganCard: React.FC<{
  cheongan: Cheongan;
  onClick: () => void;
}> = ({ cheongan, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hanja = CHEONGAN_HANJA[cheongan];
  const ohaeng = CHEONGAN_OHAENG[cheongan];
  const imageDesc = CHEONGAN_IMAGE_DESC[cheongan];
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
        ${ohaengColors[ohaeng].bg} ${ohaengColors[ohaeng].border}
        ${isHovered ? 'scale-105 shadow-lg shadow-black/50' : 'shadow-md'}
      `}
      style={{ height: '180px' }}
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
            alt={imageDesc}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        {/* 한자 */}
        <div
          className={`
            text-4xl md:text-5xl font-bold ${ohaengColors[ohaeng].text}
            transition-all duration-300
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
        >
          {hanja}
        </div>

        {/* 한글 이름 */}
        <div className={`text-lg md:text-xl font-bold mt-2 ${ohaengColors[ohaeng].text}`}>
          {cheongan}{ohaeng}
        </div>

        {/* 이미지 설명 (호버 시) */}
        <div
          className={`
            text-sm text-white/80 mt-1
            transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {imageDesc}
        </div>
      </div>
    </div>
  );
};

const IljuMainPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheonganClick = (cheongan: Cheongan) => {
    navigate(`/60ilju/${cheongan}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            60일주
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            천간을 선택하여 각 일주의 특성과 운명을 알아보세요
          </p>
        </div>

        {/* 천간 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 md:gap-6">
          {CHEONGAN.map((cheongan) => (
            <CheonganCard
              key={cheongan}
              cheongan={cheongan}
              onClick={() => handleCheonganClick(cheongan)}
            />
          ))}
        </div>

        {/* 오행 범례 */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {[
            { name: '목(木)', color: 'bg-green-500', desc: '갑·을' },
            { name: '화(火)', color: 'bg-red-500', desc: '병·정' },
            { name: '토(土)', color: 'bg-yellow-500', desc: '무·기' },
            { name: '금(金)', color: 'bg-gray-400', desc: '경·신' },
            { name: '수(水)', color: 'bg-white', desc: '임·계' },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg"
            >
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-white text-sm font-medium">{item.name}</span>
              <span className="text-gray-400 text-xs">({item.desc})</span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IljuMainPage;
