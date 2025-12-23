// 마크다운 렌더러 컴포넌트 (파싱된 HTML 표시)

import React from 'react';

interface TheoryMarkdownRendererProps {
  htmlContent: string;
}

const TheoryMarkdownRenderer: React.FC<TheoryMarkdownRendererProps> = ({
  htmlContent
}) => {
  return (
    <div
      className="theory-content prose prose-amber max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default TheoryMarkdownRenderer;
