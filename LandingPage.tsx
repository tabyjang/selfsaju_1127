import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getUserSajuRecords } from './utils/sajuStorage';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas?.width || 0);
        this.y = Math.random() * (canvas?.height || 0);
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        const colors = ['rgba(255, 183, 178, 0.5)', 'rgba(255, 218, 193, 0.5)', 'rgba(226, 240, 203, 0.5)', 'rgba(255, 255, 255, 0.8)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (!canvas) return;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particlesArray = [];
      const numberOfParticles = 100;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 무료 사주 분석하기 버튼 클릭 핸들러
  const handleStartAnalysis = async () => {
    // Clerk 로딩 중이면 대기
    if (!isLoaded) {
      return;
    }

    // 로그인하지 않은 경우 → 입력 페이지로 이동
    if (!isSignedIn || !user) {
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
      <canvas ref={canvasRef} id="particles-canvas"></canvas>
      <main className="landing-container">

        {/* ▼▼▼ 로고 이미지 추가된 부분 ▼▼▼ */}
        <img
          src="/logo.png"
          alt="아사주달 로고"
          className="landing-logo fade-in"
        />
        {/* ▲▲▲ 여기까지 ▲▲▲ */}

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

    </div>
  );
};

export default LandingPage;