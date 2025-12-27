import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getUserSajuRecords } from './utils/sajuStorage';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // 무료 사주 분석하기 버튼 클릭 핸들러
  const handleStartAnalysis = async () => {
    // Clerk 로딩 중이거나 로그인하지 않은 경우 → 입력 페이지로 이동
    if (!isLoaded || !isSignedIn || !user) {
      navigate('/input');
      return;
    }

    // 로그인한 경우 → DB에서 "내 사주" 불러오기
    try {
      setIsLoading(true);

      const result = await getUserSajuRecords(user.id);

      if (result.success && result.data && result.data.length > 0) {
        // DB에 저장된 사주가 있으면 → localStorage에 저장하고 대시보드로 이동
        const mySaju = result.data[0].saju_data; // 가장 최신 사주
        localStorage.setItem('currentSajuData', JSON.stringify(mySaju));
        navigate('/dashboard');
      } else {
        // DB에 사주가 없으면 → 입력 페이지로 이동 (처음 사용하는 유저)
        navigate('/input');
      }
    } catch (error) {
      console.error('사주 불러오기 실패:', error);
      // 에러 발생 시에도 입력 페이지로 이동
      navigate('/input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page-wrapper page-fade-in">
      {/* 메인 히어로 섹션 */}
      <main className="landing-container">
        <img
          src="/logo.png"
          alt="아사주달 로고"
          className="landing-logo fade-in"
        />
        <h1 className="landing-title fade-in"></h1>
        <p className="landing-description fade-in delay-2">
          <span className="free-text">무료</span>로 볼 수 있는 가장 풍성한 사주정보를 제공합니다.<br />
          <span className="free-text">무료</span>로 <span className="highlight-feature">격국</span>과 <span className="highlight-feature">대운정보</span>,  <span className="highlight-feature">사주 캘린더</span>까지 볼 수 있는 유일한 곳!<br />
          아낌 없는 사주 정보가 기다립니다.
        </p>
        <div className="cta-container fade-in delay-3">
          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="glow-button"
          >
            {isLoading ? '불러오는 중...' : '무료 사주 분석하기'}
          </button>
        </div>
      </main>

      {/* 사주 분석 프로그램 소개 */}
      <section className="content-section">
        <h2 className="section-title">아사주달이란?</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem', textAlign: 'center' }}>
          아사주달은 전통 사주명리학을 현대적으로 재해석한 온라인 사주 분석 플랫폼입니다.<br />
          복잡한 사주 이론을 누구나 쉽게 이해할 수 있도록 체계화하여 제공합니다.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">정밀한 사주 분석</h3>
            <p className="feature-description">
              생년월일시를 기반으로 사주팔자를 정확하게 계산하고, 오행의 균형, 십성, 신살 등
              다양한 요소를 종합적으로 분석합니다. 천간지지의 상호작용과 음양오행의 흐름을
              체계적으로 파악하여 당신의 사주를 깊이 있게 해석합니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">격국 판정</h3>
            <p className="feature-description">
              사주의 핵심인 격국을 정확하게 판단합니다. 정격과 외격을 구분하고,
              용신과 희신을 찾아내어 당신의 사주가 어떤 기운으로 이루어져 있는지 명확하게
              제시합니다. 격국에 따른 성격, 재능, 적성을 상세하게 안내합니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔮</div>
            <h3 className="feature-title">대운 분석</h3>
            <p className="feature-description">
              10년마다 변화하는 대운의 흐름을 분석하여 인생의 큰 전환점과 중요한 시기를
              미리 파악할 수 있습니다. 각 대운별로 어떤 기회와 도전이 찾아올지,
              어떻게 대비해야 할지 구체적인 조언을 제공합니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">사주 캘린더</h3>
            <p className="feature-description">
              매일매일의 운세를 일주별로 확인할 수 있는 오늘의 운세와 사주 캘린더를 제공합니다.
              오늘의 일진이 당신의 사주와 어떻게 상호작용하는지,
              좋은 날과 조심해야 할 날을 한눈에 파악하여 일상생활에 활용할 수 있습니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">오행 궤도 분석</h3>
            <p className="feature-description">
              오행의 순환과 상생상극 관계를 시각적으로 표현한 오행 궤도를 통해
              당신의 에너지 흐름을 직관적으로 이해할 수 있습니다.
              어떤 오행이 강하고 약한지, 보완이 필요한 부분은 무엇인지 명확하게 보여줍니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3 className="feature-title">용신 분석(준비중)</h3>
            <p className="feature-description">
              사주의 균형을 맞추고 운명을 개선하는 핵심인 용신을 찾아냅니다.
              용신에 해당하는 색상, 방향, 직업, 식습관 등 일상생활에서 실천할 수 있는
              구체적인 개운 방법을 제시합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 이용 방법 가이드 */}
      <section className="content-section">
        <h2 className="section-title">이용 방법</h2>
        <div className="guide-steps">
          <div className="guide-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>생년월일시 입력</h3>
              <p>
                정확한 사주 분석을 위해 태어난 년, 월, 일, 시를 입력해주세요.
                양력을 기준으로 보며, 시간을 몰라도 오늘의 운세와 일주까지 분석이 가능합니다.
                태어난 시각이 정확할수록 더욱 정밀한 분석 결과를 얻을 수 있습니다.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>사주팔자 확인</h3>
              <p>
                입력한 정보를 바탕으로 분석이 완료된 사주팔자를 확인하세요.
                년주, 월주, 일주, 시주의 천간과 지지가 표시되며, 각 글자가 나타내는
                오행과 십성의 의미를 쉽게 이해할 수 있도록 설명합니다.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>기본 분석 결과 보기</h3>
              <p>
                오행의 균형, 십성 분포, 주요 신살 등 기본적인 사주 분석 결과를 확인하세요.
                당신의 성격적 특성, 재능, 건강 주의사항 등이 포함됩니다.
                이 단계에서는 무료로 상세한 정보를 제공받을 수 있습니다.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>격국 및 대운 분석</h3>
              <p>
                더 깊이 있는 분석을 원하시면 격국 판정(서비스 중)과 대운 분석(준비중)을 확인하세요.
                당신의 사주가 어떤 격국에 해당하는지, 앞으로 어떤 대운이 펼쳐질지,
                인생의 중요한 전환점은 언제인지 등을 알 수 있습니다.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>사주 캘린더 활용</h3>
              <p>
                일상생활에 사주 지식을 활용하고 싶다면 사주 캘린더를 이용하세요.
                매일의 운세를 확인하고, 중요한 일정을 계획할 때 참고할 수 있습니다.
                좋은 날을 선택하여 중요한 결정을 내리거나, 조심해야 할 날을 미리 파악하여
                대비할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3>사주 저장 및 관리</h3>
              <p>
                회원가입 후 로그인하시면 자신의 사주를 저장하여, 다시 입력하지 않더라도
                바로 자신의 사주를 확인할 수 있습니다.
                추가로 다른 사람의 사주도 볼 수 있으며, 저장은 한 명만 가능합니다.
                추후 여러 사람의 사주를 저장하고 관리할 수 있는 기능도 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="content-section">
        <h2 className="section-title">자주 묻는 질문</h2>

        <div className="faq-item">
          <div className="faq-question">
            <span>사주팔자란 무엇인가요?</span>
          </div>
          <div className="faq-answer">
            사주팔자는 태어난 년(年), 월(月), 일(日), 시(時)를 천간(天干)과 지지(地支)로
            표현한 것으로, 총 8개의 글자로 이루어져 있습니다. 이 8개의 글자는 각각
            음양오행의 기운을 담고 있으며, 이들의 조합과 상호작용을 통해 개인의 성격, 재능,
            운명의 흐름을 파악할 수 있습니다. 사주명리학은 이러한 사주팔자를 분석하여
            인생의 방향성을 제시하는 전통적인 학문입니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>정확한 출생시간을 모르면 어떻게 하나요?</span>
          </div>
          <div className="faq-answer">
            출생시간을 정확히 모르시는 경우에도 년, 월, 일만으로 많은 정보를 얻을 수 있습니다.
            다만 시주(時柱)가 빠지게 되면 시간대별 운세나 일부 신살 정보가 제한될 수 있습니다.
            가능하다면 부모님께 여쭤보거나 출생증명서를 확인하여 정확한 시간을 파악하시는 것이
            좋습니다. 대략적인 시간대(오전/오후)만 아셔도 더 정확한 분석이 가능합니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>음력과 양력 중 어떤 것을 입력해야 하나요?</span>
          </div>
          <div className="faq-answer">
            아사주달에서는 양력을 기준으로 보며, 양력을 입력하시면 됩니다.
            정확한 분석을 위해 출생증명서나 가족관계증명서에 기재된 양력 생일을 확인하시는 것을 권장합니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>무료로 어디까지 볼 수 있나요?</span>
          </div>
          <div className="faq-answer">
            아사주달은 기본적인 사주팔자 분석, 오행 균형, 십성 분포, 격국 판정, 대운의 흐름,
            사주 캘린더, 오늘의 운세까지 대부분의 핵심 기능을 무료로 제공합니다. 
            다른 사이트에서는 유료로 제공되는 격국 정보와 오늘의 운세세도 아사주달에서는 무료로 확인하실 수 있습니다.
            단, 더욱 심화된 개인 맞춤형 상담이나 특수한 분석이 필요하신 경우에만 프리미엄 서비스를 이용하실 수 있습니다. 
            프리미엄 서비스는 추후 추가될 예정입니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>사주 분석 결과를 저장할 수 있나요?</span>
          </div>
          <div className="faq-answer">
            네, 가능합니다. 회원가입 후 로그인하시면 분석한 사주 정보를 저장하고
            언제든지 다시 불러올 수 있습니다. 비회원으로도 사주분석은 얼마든지 할 수 있습니다.
            저장 기능은 저장하기를 누른 회원에게만 제공되며, 저장한 이후에는 로그인 시 바로 로딩 된 사주를 확인할 수 있습니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>격국이란 무엇인가요?</span>
          </div>
          <div className="faq-answer">
            격국(格局)은 사주팔자의 전체적인 구조와 패턴을 의미합니다. 사주를 이루는
            천간과 지지의 배치, 오행의 균형, 십성의 분포 등을 종합하여 판단하며,
            크게 정격(正格)과 외격(外格)으로 나뉩니다. 격국을 파악하면 그 사람의
            타고난 성향, 강점, 약점, 적합한 직업, 인생의 방향성 등을 보다 명확하게
            이해할 수 있습니다. 같은 사주라도 격국에 따라 해석이 달라질 수 있어
            사주 분석에서 매우 중요한 요소입니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>대운은 어떻게 활용하나요?</span>
          </div>
          <div className="faq-answer">
            대운(大運)은 10년을 주기로 변화하는 큰 운의 흐름입니다. 현재 어떤 대운
            시기에 있는지 파악하면 향후 10년간의 전반적인 운세와 중요한 변화의 시기를
            예측할 수 있습니다. 좋은 대운이 들어올 때는 새로운 도전과 투자를 계획하고,
            어려운 대운 시기에는 보수적으로 대비하는 등 인생의 중요한 결정을 내릴 때
            참고 자료로 활용할 수 있습니다. 대운 분석을 통해 장기적인 인생 계획을
            세우는 데 도움을 받으실 수 있습니다.
            대운의 흐름은 무료로 제공되며, 대운의 해석은 서비스 준비중입니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>사주 캘린더는 어떻게 사용하나요?</span>
          </div>
          <div className="faq-answer">
            사주 캘린더는 매일의 일진(日辰)과 당신의 사주가 어떻게 상호작용하는지
            보여줍니다. 중요한 계약, 이사, 개업, 면접 등의 일정을 잡을 때 좋은 날을
            선택하거나, 조심해야 할 날을 미리 파악하여 대비할 수 있습니다.
            또한 오늘의 운세를 확인하여 하루를 시작하는 마음가짐을 다잡을 수 있으며,
            월별로 운세의 흐름을 파악하여 한 달 계획을 세우는 데에도 활용하실 수 있습니다.
            사주 캘린더의 일진에서 십성과 십이운성을 통해 자신의 에너지를 확인할 수 있습니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>사주 분석이 얼마나 정확한가요?</span>
          </div>
          <div className="faq-answer">
            아사주달은 전통 사주명리학의 이론을 충실히 따르며, 검증된 알고리즘을
            사용하여 사주를 계산하고 분석합니다. 다만 사주는 확정된 운명을
            보여주는 것이 아니라, 타고난 성향과 가능성의 방향을 제시하는 것입니다.
            같은 사주를 가진 사람이라도 개인의 노력, 환경, 선택에 따라 인생은
            다르게 펼쳐질 수 있습니다. 사주 분석은 자신을 이해하고 더 나은 선택을
            하기 위한 참고 자료로 활용하시면 좋습니다.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-question">
            <span>개인정보는 안전하게 보호되나요?</span>
          </div>
          <div className="faq-answer">
            네, 아사주달은 회원님의 개인정보를 매우 중요하게 생각합니다.
            생년월일시 등의 정보는 암호화되어 안전하게 저장되며, 사주 분석 목적 외에는
            절대 사용되지 않습니다. 제3자에게 정보를 제공하거나 판매하는 일은 없으며,
            관련 법규를 준수하여 개인정보를 철저히 보호하고 있습니다.
            자세한 내용은 개인정보처리방침을 참고해주시기 바랍니다.
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '3rem 2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        maxWidth: '1200px',
        width: '90%',
        margin: '0 auto'
      }}>
        <p style={{ marginBottom: '1rem' }}>
          아사주달의 분석을 통해 건강과 행복이 함께 하시길 기원합니다.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <a href="/privacy" style={{ margin: '0 1rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            개인정보처리방침
          </a>
          <a href="/terms" style={{ margin: '0 1rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            서비스 이용약관
          </a>
        </div>
        <p>
          &copy; {new Date().getFullYear()} asajudal.com. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;