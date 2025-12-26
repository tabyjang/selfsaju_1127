import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Trail, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { SajuInfo, Ohaeng } from "../types";

// 5행 에너지 타입 정의
interface ElementConfig {
  id: string;
  name: string;
  color: string;
  baseRadius: number;
  baseSpeed: number;
}

interface ElementSizes {
  [key: string]: number;
}

interface ElementColors {
  [key: string]: string;
}

// 색상 팔레트 (오행 5가지만)
const COLOR_PALETTE = [
  { name: "목 (녹색)", color: "#22c55e" },
  { name: "화 (빨강)", color: "#ef4444" },
  { name: "토 (주황)", color: "#f59e0b" },
  { name: "금 (흰색)", color: "#e5e7eb" },
  { name: "수 (남색)", color: "#1e40af" },
];

// 오행 → 색깔 매핑
const OHAENG_COLOR_MAP: Record<Ohaeng, string> = {
  wood: "#22c55e", // 목 - 녹색
  fire: "#ef4444", // 화 - 빨강
  earth: "#f59e0b", // 토 - 주황
  metal: "#e5e7eb", // 금 - 흰색
  water: "#1e40af", // 수 - 남색
};

// 5행 에너지 기본 정의
const FIVE_ELEMENTS_BASE: ElementConfig[] = [
  { id: "wood", name: "월주", color: "#22c55e", baseRadius: 1, baseSpeed: 0.5 },
  { id: "fire", name: "대운", color: "#ef4444", baseRadius: 1, baseSpeed: 0.7 },
  {
    id: "earth",
    name: "일주",
    color: "#f59e0b",
    baseRadius: 1,
    baseSpeed: 0.4,
  },
  {
    id: "water",
    name: "시간",
    color: "#60a5fa",
    baseRadius: 1,
    baseSpeed: 0.6,
  },
  {
    id: "metal",
    name: "시지",
    color: "#e5e7eb",
    baseRadius: 1,
    baseSpeed: 0.7,
  },
];

// 궤도를 도는 행성 컴포넌트
function OrbitingPlanet({
  element,
  index,
  totalCount,
  sizeMultiplier,
  speedMultiplier,
  sunPosition,
  planetColor,
  trailWidth,
  trailLength,
}: {
  element: ElementConfig;
  index: number;
  totalCount: number;
  sizeMultiplier: number;
  speedMultiplier: number;
  sunPosition: THREE.Vector3;
  planetColor: string;
  trailWidth: number;
  trailLength: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const initialAngle = (index * Math.PI * 2) / totalCount;
  const orbitRadius = 4 + index * 3;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      const angle = initialAngle + time * element.baseSpeed * speedMultiplier;

      // 태양의 위치를 중심으로 공전
      groupRef.current.position.x =
        sunPosition.x + Math.cos(angle) * orbitRadius;
      groupRef.current.position.z =
        sunPosition.z + Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = sunPosition.y + Math.sin(time * 0.5) * 0.5;

      // 자전
      groupRef.current.rotation.y += 0.01;
      groupRef.current.rotation.x += 0.005;
    }
  });

  const actualRadius = element.baseRadius * sizeMultiplier;

  // 어두운 색상인지 확인 (검은색 계열 - #0으로 시작하는 경우만)
  const isDarkColor =
    planetColor === "#0a0a0a" || planetColor.toLowerCase().startsWith("#0");

  return (
    <Trail
      width={hovered ? trailWidth * 2.5 : trailWidth}
      length={trailLength}
      color={planetColor}
      attenuation={(t) => t * t}
    >
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        {/* 메인 행성 */}
        <mesh>
          <sphereGeometry args={[actualRadius, 32, 32]} />
          <meshStandardMaterial
            color={planetColor}
            emissive={isDarkColor ? "#60a5fa" : planetColor}
            emissiveIntensity={
              hovered ? (isDarkColor ? 1.5 : 0.8) : isDarkColor ? 0.8 : 0.3
            }
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      </group>
    </Trail>
  );
}

// 궤도 링 컴포넌트
function OrbitRing({
  radius,
  sunPosition,
}: {
  radius: number;
  sunPosition: THREE.Vector3;
}) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        sunPosition.x + Math.cos(angle) * radius,
        sunPosition.y,
        sunPosition.z + Math.sin(angle) * radius
      )
    );
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#ffffff" opacity={0.1} transparent />
    </line>
  );
}

// 궤도 벨트 컴포넌트 (카이퍼 벨트 스타일)
function OrbitBelt({
  radius,
  color,
  sunPosition,
  density = 1,
  opacity = 0.4,
}: {
  radius: number;
  color: string;
  sunPosition: THREE.Vector3;
  density?: number;
  opacity?: number;
}) {
  const particlesRef = useRef<THREE.Points>(null);

  // 벨트 파티클 수 (density에 따라 조절: 100 ~ 2000)
  const particleCount = Math.floor(100 + density * 1900);

  // 파티클 위치 생성
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    // 벨트 두께를 위한 랜덤 오프셋
    const radiusOffset = (Math.random() - 0.5) * 0.8;
    const heightOffset = (Math.random() - 0.5) * 0.3;

    const currentRadius = radius + radiusOffset;

    positions[i * 3] = Math.cos(angle) * currentRadius;
    positions[i * 3 + 1] = heightOffset;
    positions[i * 3 + 2] = Math.sin(angle) * currentRadius;

    // 크기 랜덤화 (density가 높을수록 입자가 작아짐)
    const sizeBase = Math.max(0.05, 0.2 - density * 0.1);
    sizes[i] = Math.random() * 0.15 + sizeBase;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      // 벨트가 천천히 회전
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.01;

      // 태양 위치에 따라 벨트 이동
      particlesRef.current.position.copy(sunPosition);
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.1}
        transparent
        opacity={opacity}
        sizeAttenuation
        vertexColors={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 중심 태양 컴포넌트
function CentralSun({
  sunColor,
  sunSize,
}: {
  sunColor: string;
  sunSize: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // 태양 자전
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[sunSize, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={sunColor}
          emissive={sunColor}
          emissiveIntensity={hovered ? 1.2 : 0.8}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>
      {/* 태양 주변 발광 효과 */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color={sunColor}
        distance={50}
      />
    </group>
  );
}

// 파티클 효과
function Particles() {
  const count = 1000;
  const particlesRef = useRef<THREE.Points>(null);

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// 3D 씬 컴포넌트
function Scene({
  elementOrder,
  elementSizes,
  elementColors,
  speedMultiplier,
  sunColor,
  sunSize,
  beltDensity,
  beltOpacity,
  galaxyOrbitSpeed,
  trailWidth,
  trailLength,
}: {
  elementOrder: ElementConfig[];
  elementSizes: ElementSizes;
  elementColors: ElementColors;
  speedMultiplier: number;
  sunColor: string;
  sunSize: number;
  beltDensity: number;
  beltOpacity: number;
  galaxyOrbitSpeed: number;
  trailWidth: number;
  trailLength: number;
}) {
  const sunPosition = new THREE.Vector3(0, 0, 0); // 태양을 정 가운데에 배치
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * galaxyOrbitSpeed;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <group ref={groupRef}>
        <CentralSun sunColor={sunColor} sunSize={sunSize} />

        {elementOrder.map((element, index) => {
          const orbitRadius = 4 + index * 3;
          const sizeMultiplier = elementSizes[element.name] || 1;
          const planetColor = elementColors[element.name] || element.color;
          // 파티클 색상도 행성과 동일하게 설정
          const beltColor = planetColor;

          return (
            <React.Fragment key={element.id}>
              <OrbitRing radius={orbitRadius} sunPosition={sunPosition} />
              <OrbitBelt
                radius={orbitRadius}
                color={beltColor}
                sunPosition={sunPosition}
                density={beltDensity}
                opacity={beltOpacity}
              />
              <OrbitingPlanet
                element={element}
                index={index}
                totalCount={elementOrder.length}
                sizeMultiplier={sizeMultiplier}
                speedMultiplier={speedMultiplier}
                sunPosition={sunPosition}
                planetColor={planetColor}
                trailWidth={trailWidth}
                trailLength={trailLength}
              />
            </React.Fragment>
          );
        })}
        <Particles />
      </group>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={80}
      />
    </>
  );
}

// 컨트롤 패널 컴포넌트
function ControlPanel({
  elementOrder,

  elementSizes,
  onElementSizeChange,
  elementColors,
  onElementColorChange,
  speedMultiplier,
  onSpeedChange,
  sunColor,
  onSunColorChange,
  sunSize,
  onSunSizeChange,
  beltDensity,
  onBeltDensityChange,
  beltOpacity,
  onBeltOpacityChange,
  trailWidth,
  onTrailWidthChange,
  trailLength,
  onTrailLengthChange,

  onReset,
}: {
  elementOrder: ElementConfig[];

  elementSizes: ElementSizes;
  onElementSizeChange: (element: string, value: number) => void;
  elementColors: ElementColors;
  onElementColorChange: (element: string, color: string) => void;
  speedMultiplier: number;
  onSpeedChange: (value: number) => void;
  sunColor: string;
  onSunColorChange: (color: string) => void;
  sunSize: number;
  onSunSizeChange: (size: number) => void;
  beltDensity: number;
  onBeltDensityChange: (value: number) => void;
  beltOpacity: number;
  onBeltOpacityChange: (value: number) => void;
  trailWidth: number;
  onTrailWidthChange: (value: number) => void;
  trailLength: number;
  onTrailLengthChange: (value: number) => void;

  onReset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        color: "white",
        zIndex: 10,
        fontFamily: "sans-serif",
        background: "rgba(0,0,0,0.85)",
        padding: "20px",
        borderRadius: "15px",
        maxWidth: "380px",
        maxHeight: "90vh",
        overflowY: "auto",
        border: "2px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
          ⚙️ 궤도 제어 패널
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {isOpen ? "접기" : "펼치기"}
        </button>
      </div>

      {isOpen && (
        <>
          {/* 태양(일간) 설정 */}
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              background: "rgba(255,215,0,0.1)",
              borderRadius: "10px",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                fontSize: "16px",
                borderBottom: "1px solid rgba(255,215,0,0.5)",
                paddingBottom: "5px",
                color: "#ffd700",
              }}
            >
              ☀️ 태양 (일간) 설정
            </h3>

            {/* 태양 색깔 선택 */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontSize: "14px",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                태양 색깔 (일간 오행)
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {FIVE_ELEMENTS_BASE.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => onSunColorChange(element.color)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: element.color,
                      border:
                        sunColor === element.color
                          ? "3px solid white"
                          : "2px solid rgba(255,255,255,0.3)",
                      cursor: "pointer",
                      boxShadow:
                        sunColor === element.color
                          ? `0 0 15px ${element.color}`
                          : `0 0 8px ${element.color}`,
                      transition: "all 0.3s",
                    }}
                    title={element.name}
                  />
                ))}
              </div>
            </div>

            {/* 태양 크기 조절 */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "14px" }}>태양 크기</span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    minWidth: "30px",
                    textAlign: "right",
                  }}
                >
                  {sunSize.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={sunSize}
                onChange={(e) => onSunSizeChange(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  accentColor: sunColor,
                }}
              />
            </div>
          </div>

          {/* 행성 순서 조절 */}

          {/* 5행 크기 및 색깔 조절 */}
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "5px",
              }}
            >
              🌟 5행 크기 및 색깔
            </h3>
            {elementOrder.map((element) => {
              const currentColor = elementColors[element.name] || element.color;
              return (
                <div
                  key={element.id}
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "15px",
                          height: "15px",
                          borderRadius: "50%",
                          background: currentColor,
                          boxShadow: `0 0 8px ${currentColor}`,
                        }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {element.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        minWidth: "30px",
                        textAlign: "right",
                      }}
                    >
                      크기: {elementSizes[element.name] || 1}
                    </span>
                  </div>

                  {/* 크기 슬라이더 */}
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={elementSizes[element.name] || 1}
                    onChange={(e) =>
                      onElementSizeChange(
                        element.name,
                        parseFloat(e.target.value)
                      )
                    }
                    style={{
                      width: "100%",
                      cursor: "pointer",
                      accentColor: currentColor,
                      marginBottom: "8px",
                    }}
                  />

                  {/* 색깔 선택 */}
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.7,
                        marginBottom: "5px",
                      }}
                    >
                      색깔 선택:
                    </div>
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      {COLOR_PALETTE.map((colorItem) => (
                        <button
                          key={colorItem.color}
                          onClick={() =>
                            onElementColorChange(element.name, colorItem.color)
                          }
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: colorItem.color,
                            border:
                              currentColor === colorItem.color
                                ? "2px solid white"
                                : "1px solid rgba(255,255,255,0.3)",
                            cursor: "pointer",
                            boxShadow:
                              currentColor === colorItem.color
                                ? `0 0 10px ${colorItem.color}`
                                : `0 0 5px ${colorItem.color}`,
                            transition: "all 0.2s",
                          }}
                          title={colorItem.name}
                          onMouseEnter={(e) => {
                            if (currentColor !== colorItem.color) {
                              e.currentTarget.style.transform = "scale(1.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 설명 */}
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
              lineHeight: "1.5",
              opacity: 0.8,
            }}
          >
            💡 마우스 드래그로 회전, 스크롤로 확대/축소
          </div>

          {/* 초기화 버튼 */}
          <div style={{ marginTop: "15px" }}>
            <button
              onClick={onReset}
              style={{
                width: "100%",
                padding: "12px",
                background:
                  "linear-gradient(135deg, rgba(239,68,68,0.8), rgba(185,28,28,0.8))",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(239,68,68,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "16px" }}>🔄</span>
              <span>설정 초기화</span>
            </button>
            <div
              style={{
                marginTop: "8px",
                fontSize: "11px",
                opacity: 0.6,
                textAlign: "center",
              }}
            >
              설정값은 자동으로 저장됩니다
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// localStorage 키
const STORAGE_KEY = "fiveElementsOrbitSettings_v6";

// 기본 설정값
const DEFAULT_SETTINGS = {
  elementOrder: [...FIVE_ELEMENTS_BASE],
  elementSizes: {
    월주: 2.2,
    대운: 2.0,
    일주: 1.8,
    시간: 1.4,
    시지: 1.1,
  },
  elementColors: {
    월주: "#22c55e",
    대운: "#ef4444",
    일주: "#f59e0b",
    시간: "#60a5fa",
    시지: "#e5e7eb",
  },
  speedMultiplier: 0.5,
  galaxyOrbitSpeed: 0.0,
  sunColor: "#fbbf24",
  sunSize: 3,
  beltDensity: 0.5,
  beltOpacity: 1.0,
  trailWidth: 20,
  trailLength: 100,
};

// 현재 나이 계산 함수 (한국 나이 = 만 나이 + 1)
const getCurrentAge = (birthDate: {
  year: number;
  month: number;
  day: number;
}): number => {
  const today = new Date();
  const birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // 생일이 지나지 않았으면 나이에서 1을 뺌
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // 한국 나이로 변환 (만 나이 + 1)
  return age + 1;
};

// 현재 나이에 맞는 대운 인덱스 계산
const getCurrentDaewoonIndex = (
  currentAge: number,
  daewoonNumber: number
): number => {
  // daewoonNumber는 대운 시작 나이 (예: 3세)
  // 각 대운은 10년 단위
  // 예: 3세 시작이면 -> 0번: 3-12세, 1번: 13-22세, 2번: 23-32세...
  if (currentAge < daewoonNumber) {
    return 0; // 대운이 아직 시작 안됨
  }

  const index = Math.floor((currentAge - daewoonNumber) / 10);
  return Math.min(index, 9); // 최대 9번 인덱스 (10개까지만)
};

// 사주 정보에서 색깔 추출
const getColorsFromSaju = (sajuInfo: SajuInfo | null): ElementColors | null => {
  if (!sajuInfo) return null;

  try {
    const { pillars, daewoonPillars, daewoonNumber, birthDate } = sajuInfo;

    // 현재 나이 계산
    const currentAge = getCurrentAge(birthDate);

    // 현재 나이에 맞는 대운 인덱스 계산
    const daewoonIndex = getCurrentDaewoonIndex(currentAge, daewoonNumber);

    // 현재 대운 가져오기
    const currentDaewoon = daewoonPillars[daewoonIndex];

    console.log("=== 대운 디버깅 정보 ===");
    console.log("현재 나이:", currentAge);
    console.log("대운 시작 나이:", daewoonNumber);
    console.log("대운 인덱스:", daewoonIndex);
    console.log("전체 대운 목록:", daewoonPillars);
    console.log(
      "현재 대운:",
      currentDaewoon ? currentDaewoon.ganji : "없음",
      "(",
      currentDaewoon ? currentDaewoon.age : "-",
      "세)"
    );

    if (currentDaewoon) {
      console.log("대운 천간:", currentDaewoon.cheonGan.char, "오행:", currentDaewoon.cheonGan.ohaeng);
      console.log("대운 지지:", currentDaewoon.jiJi.char, "오행:", currentDaewoon.jiJi.ohaeng);
      console.log("대운 지지 색상:", OHAENG_COLOR_MAP[currentDaewoon.jiJi.ohaeng]);
    }

    return {
      월주: OHAENG_COLOR_MAP[pillars.month.jiJi.ohaeng], // 월지
      일주: OHAENG_COLOR_MAP[pillars.day.jiJi.ohaeng], // 일지
      시간: OHAENG_COLOR_MAP[pillars.hour.jiJi.ohaeng], // 4번째 궤도: 시주 지지
      시지: OHAENG_COLOR_MAP[pillars.hour.cheonGan.ohaeng], // 5번째 궤도: 시주 천간
      대운: currentDaewoon
        ? OHAENG_COLOR_MAP[currentDaewoon.jiJi.ohaeng]
        : "#ef4444", // 대운 지지
    };
  } catch (error) {
    console.error("사주 색깔 추출 실패:", error);
    return null;
  }
};

// 일간(태양) 색깔 추출
const getSunColorFromSaju = (sajuInfo: SajuInfo | null): string | null => {
  if (!sajuInfo) return null;

  try {
    return OHAENG_COLOR_MAP[sajuInfo.pillars.day.cheonGan.ohaeng]; // 일간
  } catch (error) {
    console.error("일간 색깔 추출 실패:", error);
    return null;
  }
};

// 메인 페이지 컴포넌트
export default function FiveElementsOrbit() {
  // localStorage에서 설정값 불러오기
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // elementOrder의 경우 id로 매칭해서 복원
        if (parsed.elementOrder) {
          parsed.elementOrder = parsed.elementOrder.map((savedElement: any) => {
            return (
              FIVE_ELEMENTS_BASE.find((e) => e.id === savedElement.id) ||
              savedElement
            );
          });
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error("설정 불러오기 실패:", error);
    }
    return DEFAULT_SETTINGS;
  };

  // 사주 데이터 불러오기
  const loadSajuData = (): SajuInfo | null => {
    try {
      const saved = localStorage.getItem("currentSajuData");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("사주 데이터 불러오기 실패:", error);
    }
    return null;
  };

  const sajuData = loadSajuData();
  const sajuColors = getColorsFromSaju(sajuData);
  const sajuSunColor = getSunColorFromSaju(sajuData);

  const initialSettings = loadSettings();

  // 사주 데이터가 있으면 색깔을 사주 기반으로 설정
  if (sajuColors) {
    initialSettings.elementColors = sajuColors;
  }
  if (sajuSunColor) {
    initialSettings.sunColor = sajuSunColor;
  }

  // 행성 순서 상태
  const [elementOrder, setElementOrder] = useState<ElementConfig[]>(
    initialSettings.elementOrder
  );

  // 5행 크기 상태
  const [elementSizes, setElementSizes] = useState<ElementSizes>(
    initialSettings.elementSizes
  );

  // 5행 색깔 상태
  const [elementColors, setElementColors] = useState<ElementColors>(
    initialSettings.elementColors
  );

  // 속도 배율 상태
  const [speedMultiplier, setSpeedMultiplier] = useState(
    initialSettings.speedMultiplier
  );

  // 태양 색깔 상태
  const [sunColor, setSunColor] = useState(initialSettings.sunColor);

  // 태양 크기 상태
  const [sunSize, setSunSize] = useState(initialSettings.sunSize);

  // 벨트 농도 상태
  const [beltDensity, setBeltDensity] = useState(initialSettings.beltDensity);

  // 벨트 투명도 상태
  const [beltOpacity, setBeltOpacity] = useState(initialSettings.beltOpacity);

  // 태양 은하 궤도 속도 상태
  const [galaxyOrbitSpeed, setGalaxyOrbitSpeed] = useState(
    initialSettings.galaxyOrbitSpeed ?? 0.0
  );

  // 행성 꼬리 두께 상태
  const [trailWidth, setTrailWidth] = useState(initialSettings.trailWidth);

  // 행성 꼬리 길이 상태
  const [trailLength, setTrailLength] = useState(initialSettings.trailLength);

  // 왼쪽 패널 접기/펼치기 상태
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // 설정값이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    const settings = {
      elementOrder: elementOrder.map((e) => ({ id: e.id, name: e.name })),
      elementSizes,
      elementColors,
      speedMultiplier,
      galaxyOrbitSpeed,
      sunColor,
      sunSize,
      beltDensity,
      beltOpacity,
      trailWidth,
      trailLength,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("설정 저장 실패:", error);
    }
  }, [
    elementOrder,
    elementSizes,
    elementColors,
    speedMultiplier,
    galaxyOrbitSpeed,
    sunColor,
    sunSize,
    beltDensity,
    beltOpacity,
    trailWidth,
    trailLength,
  ]);

  const handleElementSizeChange = (element: string, value: number) => {
    setElementSizes((prev) => ({
      ...prev,
      [element]: value,
    }));
  };

  const handleElementColorChange = (element: string, color: string) => {
    setElementColors((prev) => ({
      ...prev,
      [element]: color,
    }));
  };

  // 설정 초기화 함수
  const handleReset = () => {
    if (confirm("모든 설정을 초기화하시겠습니까?")) {
      setElementOrder([...DEFAULT_SETTINGS.elementOrder]);
      setElementSizes({ ...DEFAULT_SETTINGS.elementSizes });
      setElementColors({ ...DEFAULT_SETTINGS.elementColors });
      setSpeedMultiplier(DEFAULT_SETTINGS.speedMultiplier);
      setGalaxyOrbitSpeed(DEFAULT_SETTINGS.galaxyOrbitSpeed);
      setSunColor(DEFAULT_SETTINGS.sunColor);
      setSunSize(DEFAULT_SETTINGS.sunSize);
      setBeltDensity(DEFAULT_SETTINGS.beltDensity);
      setBeltOpacity(DEFAULT_SETTINGS.beltOpacity);
      setTrailWidth(DEFAULT_SETTINGS.trailWidth);
      setTrailLength(DEFAULT_SETTINGS.trailLength);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      {/* 제목 */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          zIndex: 10,
          fontFamily: "sans-serif",
          background: "rgba(0,0,0,0.9)",
          padding: "20px",
          borderRadius: "16px",
          maxWidth: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "2px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  background: "linear-gradient(135deg, #a855f7, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "bold",
                }}
              >
                아사주달
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  color: "#a855f7",
                  fontWeight: "600",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              >
                아! 사주(의) 달인!
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                background: "linear-gradient(135deg, #60a5fa, #fbbf24, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                letterSpacing: "-0.5px",
              }}
            >
               🌌 5행 에너지 궤도: 당신을 중심으로 움직이는 우주의 지도
            </h1>
          </div>
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              transition: "all 0.3s",
              marginLeft: "10px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            {isLeftPanelOpen ? "접기" : "펼치기"}
          </button>
        </div>

        {isLeftPanelOpen && (
        <>
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            marginBottom: "16px",
            padding: "12px",
            background: "rgba(96, 165, 250, 0.1)",
            borderLeft: "3px solid #60a5fa",
            borderRadius: "6px",
          }}
        >
          이 궤도는 단순한 그림이 아닙니다. 당신이 태어난 순간의 기운(원국)과
          지금 통과하고 있는 시간(대운)이 만나 형성된{" "}
          <strong style={{ color: "#60a5fa" }}>
            '실시간 에너지 자기장'
          </strong>
          입니다.
        </div>

        {/* 1. 궤도의 거리 */}
        <div
          style={{
            marginBottom: "18px",
            padding: "14px",
            background: "rgba(251, 191, 36, 0.08)",
            borderRadius: "10px",
            border: "1px solid rgba(251, 191, 36, 0.2)",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              color: "#fbbf24",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📍</span> 1. 궤도의 거리: 나에게 미치는 '영향력의 크기'
          </h3>
          <div style={{ fontSize: "12.5px", lineHeight: "1.8" }}>
            <p style={{ margin: "0 0 10px 0", opacity: 0.95 }}>
              중심에 있는 <strong style={{ color: "#fbbf24" }}>나(일간)</strong>
              와 거리가 가까울수록 나의 성격, 환경, 운명에 더 강력하고 직접적인
              결정을 내립니다.
            </p>

            <div style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#ef4444" }}>• 핵심 궤도 (1~2번):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                월지(월령)와 대운입니다. 내가 태어난 계절의 기운과 현재 내가
                처한 거대한 환경입니다. 내 삶의 온도와 습도를 결정하는 가장
                압도적인 에너지입니다.
              </span>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#f59e0b" }}>• 밀착 궤도 (3번):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                일지입니다. 내가 깔고 앉은 자리이자 배우자궁으로, 나의 내면
                심리와 가장 사적인 공간에 상시 영향을 미치는 기운입니다.
              </span>
            </div>

            <div>
              <strong style={{ color: "#60a5fa" }}>• 배경 궤도 (4~5번):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                시간과 시지입니다. 나의 미래 방향과 당신의 속마음, 당신의 노후와 자식을 상징합니다.
                <br />
              </span>
            </div>
          </div>
        </div>

        {/* 2. 크기와 색상 */}
        <div
          style={{
            marginBottom: "18px",
            padding: "14px",
            background: "rgba(236, 72, 153, 0.08)",
            borderRadius: "10px",
            border: "1px solid rgba(236, 72, 153, 0.2)",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              color: "#ec4899",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🎨</span> 2. 크기와 색상: '생극제화(生剋制化)'의 시각화 (색은 오행 무관)
          </h3>
          <div style={{ fontSize: "12.5px", lineHeight: "1.8" }}>
            <p style={{ margin: "0 0 10px 0", opacity: 0.95 }}>
              구슬의 <strong style={{ color: "#ec4899" }}>색상</strong>은 오행의
              종류를, <strong style={{ color: "#ec4899" }}>크기</strong>는 그
              기운의 세기를 나타냅니다. 이 둘의 조화를 통해 나의 신강·신약과
              에너지 흐름을 바로 알 수 있습니다.
            </p>

            <div style={{ marginBottom: "7px" }}>
              <strong style={{ color: "#22c55e" }}>• 나를 살리는 힘 (생, 生):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                인성(나를 돕는 색)의 구슬이 크고 가까운 궤도에 있다면, 당신은
                주변의 지원을 잘 받고 에너지가 쉽게 충전되는 사람입니다.
              </span>
            </div>

            <div style={{ marginBottom: "7px" }}>
              <strong style={{ color: "#ef4444" }}>• 나를 누르는 힘 (극, 剋):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                관성(나를 통제하는 색)의 구슬이 크고 위협적이라면, 당신은 강한
                책임감이나 조직의 압박 속에 자신을 단련하며 살아가고 있음을
                보여줍니다.
              </span>
            </div>

            <div style={{ marginBottom: "7px" }}>
              <strong style={{ color: "#f59e0b" }}>• 내가 뿜어내는 힘 (설, 泄):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                식상(내가 생하는 색)의 구슬이 발달했다면, 당신은 에너지를
                외부로 발산하고 표현하며 삶의 통로를 넓혀가는 흐름에 있습니다.
              </span>
            </div>

            <div>
              <strong style={{ color: "#60a5fa" }}>• 내가 취하는 힘 (재, 宰):</strong>{" "}
              <span style={{ opacity: 0.9 }}>
                재성(내가 극하는 색)의 구슬이 적절히 배치되었다면, 삶의 목표를
                쟁취하고 결과를 만들어내는 에너지가 활성화된 상태입니다.
              </span>
            </div>
          </div>
        </div>

        {/* 궤도 판독 가이드 */}
        <div
          style={{
            padding: "16px",
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))",
            borderRadius: "10px",
            border: "1px solid rgba(147, 197, 253, 0.3)",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              color: "#93c5fd",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>💡</span> 궤도 판독 가이드 (Quick Tip)
          </h3>
          <div
            style={{
              fontSize: "12px",
              lineHeight: "1.9",
              display: "grid",
              gap: "6px",
            }}
          >
            <div>
              <strong style={{ color: "#fbbf24" }}>• 비겁</strong>
              <span style={{ opacity: 0.85 }}> (나와 같은 색)</span>:{" "}
              <span style={{ opacity: 0.9 }}>나의 주체성과 고집의 크기</span>
            </div>
            <div>
              <strong style={{ color: "#22c55e" }}>• 인성</strong>
              <span style={{ opacity: 0.85 }}> (나를 생하는 색)</span>:{" "}
              <span style={{ opacity: 0.9 }}>
                내가 받는 사랑과 공부, 수용력
              </span>
            </div>
            <div>
              <strong style={{ color: "#f59e0b" }}>• 식상</strong>
              <span style={{ opacity: 0.85 }}> (내가 생하는 색)</span>:{" "}
              <span style={{ opacity: 0.9 }}>나의 재능 발현과 활동력</span>
            </div>
            <div>
              <strong style={{ color: "#60a5fa" }}>• 재성</strong>
              <span style={{ opacity: 0.85 }}> (내가 극하는 색)</span>:{" "}
              <span style={{ opacity: 0.9 }}>
                나의 결과물과 재물에 대한 통제력
              </span>
            </div>
            <div>
              <strong style={{ color: "#ef4444" }}>• 관성</strong>
              <span style={{ opacity: 0.85 }}> (나를 극하는 색)</span>:{" "}
              <span style={{ opacity: 0.9 }}>
                나의 명예와 조직생활, 인내심
              </span>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* 대시보드로 이동 버튼 */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            padding: "12px 20px",
            background: "rgba(59, 130, 246, 0.9)",
            border: "2px solid rgba(147, 197, 253, 0.5)",
            color: "white",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            fontFamily: "sans-serif",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(37, 99, 235, 1)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.9)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span style={{ fontSize: "16px" }}>🏠</span>
          <span>대시보드로 이동</span>
        </button>
      </div>

      {/* 컨트롤 패널 - 숨김 처리 */}
      {/* <ControlPanel
        elementOrder={elementOrder}
        elementSizes={elementSizes}
        onElementSizeChange={handleElementSizeChange}
        elementColors={elementColors}
        onElementColorChange={handleElementColorChange}
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
        sunColor={sunColor}
        onSunColorChange={setSunColor}
        sunSize={sunSize}
        onSunSizeChange={setSunSize}
        beltDensity={beltDensity}
        onBeltDensityChange={setBeltDensity}
        beltOpacity={beltOpacity}
        onBeltOpacityChange={setBeltOpacity}
        trailWidth={trailWidth}
        onTrailWidthChange={setTrailWidth}
        trailLength={trailLength}
        onTrailLengthChange={setTrailLength}
        onReset={handleReset}
      /> */}

      <Canvas
        camera={{ position: [0, 20, 35], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene
          elementOrder={elementOrder}
          elementSizes={elementSizes}
          elementColors={elementColors}
          speedMultiplier={speedMultiplier}
          sunColor={sunColor}
          sunSize={sunSize}
          beltDensity={beltDensity}
          beltOpacity={beltOpacity}
          galaxyOrbitSpeed={galaxyOrbitSpeed}
          trailWidth={trailWidth}
          trailLength={trailLength}
        />
      </Canvas>
    </div>
  );
}
