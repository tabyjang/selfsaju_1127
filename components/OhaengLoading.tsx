import React from 'react';

export const OhaengLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-1 h-1">
            <div className="ohaeng-orb wood"></div>
            <div className="ohaeng-orb fire"></div>
            <div className="ohaeng-orb earth"></div>
            <div className="ohaeng-orb metal"></div>
            <div className="ohaeng-orb water"></div>
        </div>
      </div>
      <p className="relative mt-40 text-center text-xl font-semibold text-gray-800 bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-lg pointer-events-auto">
        오행의 기운을 모아
        <br />
        사주를 분석하고 있습니다...
      </p>
    </div>
  );
};