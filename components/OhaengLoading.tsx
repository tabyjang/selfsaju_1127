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
    </div>
  );
};