import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  CHEONGAN,
  CHEONGAN_HANJA,
  CHEONGAN_OHAENG,
  ILJU_BY_CHEONGAN,
  SIXTY_GANJI,
  getAdjacentIlju,
  getCheonganFromIlju,
  type Cheongan,
} from '../utils/ilju/iljuData';
import { loadIljuContent, type IljuContent } from '../utils/ilju/iljuLoader';

// 이미지 갤러리 컴포넌트
const ImageGallery: React.FC<{ images: string[]; iljuName: string }> = ({ images, iljuName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const validImages = images.filter((_, index) => !imageErrors.has(index));

  if (validImages.length === 0) return null;

  return (
    <div className="mb-8">
      {/* 메인 이미지 */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-800 mb-4">
        <img
          src={images[selectedImage]}
          alt={`${iljuName} 이미지 ${selectedImage + 1}`}
          className="w-full h-64 md:h-96 object-cover"
          onError={() => handleImageError(selectedImage)}
        />
      </div>

      {/* 썸네일 */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((img, index) => (
            !imageErrors.has(index) && (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden
                  transition-all duration-300
                  ${selectedImage === index ? 'ring-2 ring-white scale-105' : 'opacity-60 hover:opacity-100'}
                `}
              >
                <img
                  src={img}
                  alt={`썸네일 ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

// 마크다운 렌더러 컴포넌트
const MarkdownRenderer: React.FC<{ html: string }> = ({ html }) => {
  return (
    <div
      className="max-w-none text-gray-700"
      style={{ fontSize: '17px', lineHeight: '2' }}
    >
      <style>{`
        .md-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #292524;
          margin-top: 3rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 3px solid #d97706;
        }
        .md-content h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #92400e;
          margin-top: 4rem;
          margin-bottom: 1.5rem;
          padding-left: 1rem;
          border-left: 5px solid #d97706;
          background: linear-gradient(to right, #fef3c7, transparent);
          padding-top: 0.8rem;
          padding-bottom: 0.8rem;
        }
        .md-content h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #78350f;
          margin-top: 3rem;
          margin-bottom: 1.2rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #fcd34d;
        }
        .md-content h4 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #44403c;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .md-content p {
          margin-bottom: 1.8rem;
          line-height: 2.1;
        }
        .md-content strong {
          color: #1c1917;
          font-weight: 700;
        }
        .md-content em {
          color: #b45309;
          font-style: italic;
        }
        .md-content ul, .md-content ol {
          margin: 1.5rem 0 2rem 1.5rem;
        }
        .md-content li {
          margin: 1rem 0;
          line-height: 1.9;
        }
        .md-content blockquote {
          border-left: 5px solid #f59e0b;
          background: linear-gradient(to right, #fef3c7, #fffbeb);
          padding: 1.5rem 2rem;
          margin: 2.5rem 0;
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          color: #57534e;
          font-size: 1.1rem;
        }
        .md-content table {
          width: 100%;
          margin: 2rem 0;
          border-collapse: collapse;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-radius: 8px;
          overflow: hidden;
        }
        .md-content th {
          background: #fef3c7;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #292524;
          border: 1px solid #e7e5e4;
        }
        .md-content td {
          padding: 1rem;
          border: 1px solid #e7e5e4;
        }
        .md-content img {
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          margin: 2.5rem 0;
        }
        .md-content a {
          color: #b45309;
          font-weight: 500;
          text-decoration: none;
        }
        .md-content a:hover {
          text-decoration: underline;
          color: #92400e;
        }
        .md-content hr {
          margin: 4rem 0;
          border: none;
          border-top: 2px solid #e7e5e4;
        }
        .md-content code {
          background: #fef3c7;
          color: #92400e;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.9em;
        }
      `}</style>
      <div
        className="md-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

const IljuDetailPage: React.FC = () => {
  const { cheongan, ilju } = useParams<{ cheongan: string; ilju: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<IljuContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ilju]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!ilju) return;

      setLoading(true);
      setError(null);

      try {
        const data = await loadIljuContent(ilju);
        if (data) {
          setContent(data);
        } else {
          setError('콘텐츠를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('콘텐츠 로드 실패:', err);
        setError('콘텐츠를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [ilju]);

  // 유효성 검사
  const isValidCheongan = cheongan && CHEONGAN.includes(cheongan as Cheongan);
  const isValidIlju = ilju && SIXTY_GANJI.includes(ilju);

  if (!isValidCheongan || !isValidIlju) {
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
  const { prev, next } = getAdjacentIlju(ilju);
  const ohaeng = CHEONGAN_OHAENG[currentCheongan];
  const iljuList = ILJU_BY_CHEONGAN[currentCheongan];

  // 같은 천간 내에서 이전/다음
  const currentIljuIndex = iljuList.indexOf(ilju);
  const prevInGroup = currentIljuIndex > 0 ? iljuList[currentIljuIndex - 1] : null;
  const nextInGroup = currentIljuIndex < iljuList.length - 1 ? iljuList[currentIljuIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-64 bg-gray-700 rounded-2xl mb-8" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-red-400 text-xl mb-4">{error || '콘텐츠를 불러올 수 없습니다.'}</div>
          <Link to={`/60ilju/${cheongan}`} className="text-blue-400 hover:underline">
            일주 목록으로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/60ilju" className="hover:text-white transition-colors">60일주</Link>
          <span>/</span>
          <Link to={`/60ilju/${cheongan}`} className="hover:text-white transition-colors">
            {CHEONGAN_HANJA[currentCheongan]} {currentCheongan}{ohaeng}
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{ilju}</span>
        </nav>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 rounded-full text-sm text-gray-300 mb-4">
            <span>#{content.orderIndex}</span>
            <span>|</span>
            <span>{currentCheongan}{ohaeng}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-xl text-gray-300">{content.subtitle}</p>
          )}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-900/50 text-purple-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 이미지 갤러리 */}
        <ImageGallery images={content.images} iljuName={ilju} />

        {/* 본문 콘텐츠 */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl">
          <MarkdownRenderer html={content.contentHtml} />
        </div>

        {/* 같은 천간 일주 네비게이션 */}
        <div className="mt-12 bg-gray-900/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">
            {CHEONGAN_HANJA[currentCheongan]} {currentCheongan}{ohaeng} 일주
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {iljuList.map((item) => (
              <Link
                key={item}
                to={`/60ilju/${cheongan}/${item}`}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${item === ilju
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }
                `}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* 이전/다음 네비게이션 */}
        <div className="flex justify-between mt-8">
          {prev ? (
            <Link
              to={`/60ilju/${getCheonganFromIlju(prev)}/${prev}`}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-white font-medium">{prev}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/60ilju/${getCheonganFromIlju(next)}/${next}`}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-white font-medium">{next}</span>
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

export default IljuDetailPage;
