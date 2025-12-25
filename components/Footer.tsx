import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-8 text-sm text-gray-500 pb-4">
      <p>아사주달의 분석을 통해 건강과 행복이 함께 하시길 기원합니다.</p>
      <div className="mt-1 mb-1">
        <a href="/privacy" className="mx-3 hover:text-gray-700 underline">
          개인정보처리방침
        </a>
        <a href="/terms" className="mx-3 hover:text-gray-700 underline">
          이용약관
        </a>
      </div>
      <p>
        &copy; {new Date().getFullYear()} asajudal.com. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
