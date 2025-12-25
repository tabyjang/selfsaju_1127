import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../LandingPage.css';

const TermsOfServicePage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7, #ffe4e1)',
      padding: '2rem',
    }}>
      <Header />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '3rem',
        paddingTop: '5rem',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      }}>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#4a4a4a' }}>
          이용약관
        </h1>

        <div style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제1조 (목적)
            </h2>
            <p>
              본 약관은 아사주달(이하 '회사')이 제공하는 사주 분석 서비스(이하 '서비스')의
              이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
              규정함을 목적으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제2조 (정의)
            </h2>
            <ul style={{ marginLeft: '2rem' }}>
              <li>
                '서비스'란 회사가 제공하는 사주팔자 분석, 격국 판정, 대운 분석, 사주 캘린더 등
                사주명리학 기반의 모든 온라인 서비스를 의미합니다.
              </li>
              <li>
                '회원'이란 회사와 서비스 이용 계약을 체결하고 회사가 제공하는 서비스를
                이용하는 자를 의미합니다.
              </li>
              <li>
                '비회원'이란 회원 가입 없이 회사가 제공하는 일부 서비스를 이용하는 자를 의미합니다.
              </li>
              <li>
                '아이디(ID)'란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고
                회사가 승인한 이메일 주소를 의미합니다.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제3조 (약관의 게시와 개정)
            </h2>
            <p>
              1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 및
              웹사이트에 게시합니다.
            </p>
            <p>
              2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
            </p>
            <p>
              3. 약관이 개정되는 경우 회사는 개정내용과 적용일자를 명시하여 적용일자
              7일 전부터 서비스 공지사항을 통해 공지합니다.
            </p>
            <p>
              4. 회원이 개정약관의 적용에 동의하지 않는 경우 회원 탈퇴를 할 수 있습니다.
              개정약관 공지 후 7일 이내에 거부 의사를 표시하지 않으면 승인한 것으로 간주합니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제4조 (서비스의 제공)
            </h2>
            <p>회사가 제공하는 서비스는 다음과 같습니다:</p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>사주팔자 계산 및 기본 분석</li>
              <li>오행 균형 분석</li>
              <li>격국 판정 및 용신 분석</li>
              <li>대운 분석 서비스</li>
              <li>사주 캘린더 및 일진 정보 제공</li>
              <li>사주 정보 저장 및 관리 (회원 전용)</li>
              <li>기타 회사가 추가 개발하거나 제휴 계약 등을 통해 회원에게 제공하는 서비스</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제5조 (회원가입)
            </h2>
            <p>
              1. 회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고
              회사가 이러한 신청에 대하여 승인함으로써 체결됩니다.
            </p>
            <p>
              2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승인을 하지 않거나 사후에
              이용계약을 해지할 수 있습니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>타인의 명의를 도용한 경우</li>
              <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
              <li>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제6조 (회원 탈퇴 및 자격 상실)
            </h2>
            <p>
              1. 회원은 언제든지 서비스 내 설정 페이지 또는 회사에 탈퇴 요청을 하여
              이용계약을 해지할 수 있습니다.
            </p>
            <p>
              2. 회사는 회원이 다음 각 호의 사유에 해당하는 경우, 사전통지 후 회원자격을
              제한 및 정지시킬 수 있습니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>가입 신청 시에 허위 내용을 등록한 경우</li>
              <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
              <li>서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제7조 (서비스의 변경 및 중단)
            </h2>
            <p>
              1. 회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는
              서비스를 변경할 수 있습니다.
            </p>
            <p>
              2. 회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를 제한하거나
              중단할 수 있습니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
              <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지했을 경우</li>
              <li>국가비상사태, 서비스 설비의 장애 또는 서비스 이용의 폭주 등으로 서비스 이용에 지장이 있는 경우</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제8조 (회원의 의무)
            </h2>
            <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제9조 (서비스 이용의 제한)
            </h2>
            <p>
              1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴,
              1일 24시간을 원칙으로 합니다.
            </p>
            <p>
              2. 제1항의 이용시간은 정기점검 등의 필요로 인하여 회사가 정한 날 또는
              시간은 예외로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제10조 (저작권의 귀속 및 이용제한)
            </h2>
            <p>
              1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
            </p>
            <p>
              2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된
              정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여
              영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제11조 (면책조항)
            </h2>
            <p>
              1. 회사는 천재지변, 전쟁 또는 기타 이에 준하는 불가항력으로 인하여 서비스를
              제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
            </p>
            <p>
              2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
            </p>
            <p>
              3. 회사가 제공하는 사주 분석은 전통 사주명리학 이론에 기반한 참고 자료이며,
              개인의 운명을 확정하거나 미래를 예측하는 절대적 기준이 아닙니다.
              사주 분석 결과에 대한 해석과 활용은 전적으로 이용자의 책임입니다.
            </p>
            <p>
              4. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나
              상실한 것에 대하여 책임을 지지 않습니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              제12조 (분쟁의 해결)
            </h2>
            <p>
              1. 회사와 회원은 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여
              필요한 모든 노력을 하여야 합니다.
            </p>
            <p>
              2. 제1항의 규정에도 불구하고 분쟁으로 인한 소송이 제기될 경우
              소송은 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <p style={{ marginTop: '2rem', fontWeight: '600' }}>
              부칙<br />
              본 약관은 2025년 1월 1일부터 적용됩니다.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
