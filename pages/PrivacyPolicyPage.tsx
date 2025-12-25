import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../LandingPage.css';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7, #ffe4e1)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            marginBottom: '2rem',
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(45deg, #ffb7b2, #d4af37)',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          홈으로 돌아가기
        </button>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#4a4a4a' }}>
          개인정보처리방침
        </h1>

        <div style={{ lineHeight: '1.8', color: '#4a4a4a' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              아사주달(이하 '회사')은 다음의 목적을 위하여 개인정보를 처리합니다.
              처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며,
              이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공, 본인 확인</li>
              <li>사주 분석 서비스 제공: 생년월일시 기반 사주팔자 계산 및 분석 결과 제공</li>
              <li>사주 정보 저장 및 관리: 사용자가 요청한 사주 정보의 저장 및 재열람 서비스</li>
              <li>서비스 개선 및 통계: 서비스 이용 기록 분석을 통한 서비스 품질 향상</li>
              <li>고객 지원: 문의사항 응대, 공지사항 전달</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              2. 수집하는 개인정보의 항목
            </h2>
            <p>회사는 다음과 같은 개인정보를 수집합니다:</p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>필수 항목: 이메일 주소, 비밀번호(암호화 저장)</li>
              <li>서비스 이용 시 수집: 생년월일시(사주 분석용), IP 주소, 쿠키, 서비스 이용 기록</li>
              <li>선택 항목: 닉네임, 프로필 이미지</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를
              수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>회원 정보: 회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보관)</li>
              <li>사주 분석 정보: 회원 탈퇴 시 또는 삭제 요청 시까지</li>
              <li>서비스 이용 기록: 3년 (전자상거래법 등 관련 법령에 따름)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              5. 개인정보 처리의 위탁
            </h2>
            <p>
              회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 외부 전문업체에 위탁하고 있습니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>Clerk (사용자 인증 및 회원 관리)</li>
              <li>Supabase (데이터베이스 관리 및 저장)</li>
              <li>Google Cloud Platform (서버 호스팅 및 데이터 저장)</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>
              위탁 계약 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외
              개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독,
              손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고 수탁자가 개인정보를
              안전하게 처리하는지를 감독하고 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              6. 정보주체의 권리·의무 및 행사 방법
            </h2>
            <p>
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>
              위 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며,
              회사는 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              7. 개인정보의 파기
            </h2>
            <p>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>전자적 파일 형태: 복구 및 재생되지 않도록 안전하게 삭제</li>
              <li>기록물, 인쇄물, 서면 등: 분쇄 또는 소각</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              8. 개인정보 보호책임자
            </h2>
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제를 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
            </p>
            <div style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <p><strong>개인정보 보호책임자</strong></p>
              <p>담당부서: 고객지원팀</p>
              <p>이메일: privacy@asajudal.com</p>
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              9. 개인정보의 안전성 확보 조치
            </h2>
            <p>
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보에 대한 접근 제한</li>
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>접속기록의 보관 및 위변조 방지</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>
              10. 개인정보 처리방침의 변경
            </h2>
            <p>
              이 개인정보 처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른
              변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터
              공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <p style={{ marginTop: '2rem', fontWeight: '600' }}>
              공고일자: 2025년 1월 1일<br />
              시행일자: 2025년 1월 1일
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
