import React from 'react';
import { ArrowRightIcon, DownloadIcon, DesktopIcon } from './components/icons';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans p-4 overflow-hidden relative">
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-100/50 via-lime-100/50 to-white z-0"></div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
        
        {/* Left Content */}
        <div className="flex flex-col items-center lg:items-start max-w-lg animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            가장 정확한 사주
            <br />
            <span className="text-yellow-500">운명의 사주분석</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            당신의 생년월일에 담긴 우주의 코드를 실시간으로 분석합니다.
            단순한 운세 풀이를 넘어, 당신의 잠재력과 인생의 흐름을 입체적으로 조명하는 새로운 차원의 사주를 경험해보세요.
          </p>
          <button
            onClick={onStart}
            className="mt-10 flex items-center justify-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
          >
            <DesktopIcon className="w-6 h-6" />
            <span>무료 사주 보기</span>
          </button>
        </div>

        {/* Right Content - 3D Monitor Effect */}
        <div className="w-full max-w-xl lg:w-1/2 flex items-center justify-center perspective-1000 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full aspect-[4/3] transform rotate-y-[-25deg] rotate-x-[10deg] transform-style-3d shadow-2xl">
                {/* Monitor Screen */}
                <div className="absolute inset-0 bg-white rounded-lg border-8 border-gray-800 p-4 overflow-hidden">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                       <p className="text-gray-400 font-semibold text-lg"> 분석 결과 예시</p>
                    </div>
                </div>
                {/* Monitor Stand */}
                <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] bg-gray-700 transform translate-z-[-50px]"></div>
                <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-1/2 h-[10px] bg-gray-600 rounded-b-md transform translate-z-[-70px]"></div>
            </div>
        </div>

      </div>

      {/* Floating Icons */}
      <div className="absolute bottom-10 right-10">
        <button
            onClick={onStart}
            className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
            aria-label="무료 사주 보기"
        >
            <DownloadIcon className="w-8 h-8 text-white"/>
        </button>
      </div>

       <div className="absolute top-20 left-20 w-24 h-24 bg-lime-200/50 rounded-full filter blur-2xl animate-pulse"></div>
       <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-yellow-200/50 rounded-full filter blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
    </div>
  );
};

export default LandingPage;

// Add some CSS for the 3D effect
const style = document.createElement('style');
style.textContent = `
  .perspective-1000 { perspective: 1000px; }
  .transform-style-3d { transform-style: preserve-3d; }
  .rotate-y-\\[-25deg\\] { transform: rotateY(-25deg); }
  .rotate-x-\\[10deg\\] { transform: rotateX(10deg); }
  .translate-z-\\[-50px\\] { transform: translateZ(-50px); }
  .translate-z-\\[-70px\\] { transform: translateZ(-70px); }
`;
document.head.appendChild(style);
