import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Trail, Stars } from "@react-three/drei";
import * as THREE from "three";

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
  { name: "수 (흑색)", color: "#0a0a0a" },
];

// 5행 에너지 기본 정의
const FIVE_ELEMENTS_BASE: ElementConfig[] = [
  { id: "wood", name: "목", color: "#22c55e", baseRadius: 1, baseSpeed: 0.5 },
  { id: "fire", name: "화", color: "#ef4444", baseRadius: 1, baseSpeed: 0.7 },
  { id: "earth", name: "토", color: "#f59e0b", baseRadius: 1, baseSpeed: 0.4 },
  { id: "metal", name: "금", color: "#e5e7eb", baseRadius: 1, baseSpeed: 0.6 },
  { id: "water", name: "수", color: "#0a0a0a", baseRadius: 1, baseSpeed: 0.8 },
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
}: {
  element: ElementConfig;
  index: number;
  totalCount: number;
  sizeMultiplier: number;
  speedMultiplier: number;
  sunPosition: THREE.Vector3;
  planetColor: string;
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

  // 어두운 색상인지 확인 (검은색 계열)
  const isDarkColor =
    planetColor === "#0a0a0a" ||
    planetColor.toLowerCase().startsWith("#0") ||
    planetColor.toLowerCase().startsWith("#1");

  return (
    <Trail
      width={hovered ? 5 : 2}
      length={10}
      color={planetColor}
      attenuation={(t) => t * t}
    >
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        {/* 어두운 색상일 경우 밝은 테두리 추가 */}
        {isDarkColor && (
          <mesh>
            <sphereGeometry args={[actualRadius * 1.05, 32, 32]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.6}
              side={THREE.BackSide}
            />
          </mesh>
        )}

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
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;

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
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
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
}: {
  elementOrder: ElementConfig[];
  elementSizes: ElementSizes;
  elementColors: ElementColors;
  speedMultiplier: number;
  sunColor: string;
  sunSize: number;
  beltDensity: number;
  beltOpacity: number;
}) {
  const sunPosition = new THREE.Vector3(0, 0, 0); // 고정 위치

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <CentralSun sunColor={sunColor} sunSize={sunSize} />

      {elementOrder.map((element, index) => {
        const orbitRadius = 4 + index * 3;
        const sizeMultiplier = elementSizes[element.name] || 1;
        const planetColor = elementColors[element.name] || element.color;

        return (
          <React.Fragment key={element.id}>
            <OrbitRing radius={orbitRadius} sunPosition={sunPosition} />
            <OrbitBelt
              radius={orbitRadius}
              color={planetColor}
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
            />
          </React.Fragment>
        );
      })}

      <Particles />

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
  onElementOrderChange,
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
  onReset,
}: {
  elementOrder: ElementConfig[];
  onElementOrderChange: (newOrder: ElementConfig[]) => void;
  elementSizes: ElementSizes;
  onElementSizeChange: (element: string, value: number) => void;
  elementColors: ElementColors;
  onElementColorChange: (
    element: string,
    color: string,
    position: "top" | "bottom"
  ) => void;
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
  onReset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const moveElement = (index: number, direction: "up" | "down") => {
    const newOrder = [...elementOrder];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newOrder.length) return;

    [newOrder[index], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[index],
    ];
    onElementOrderChange(newOrder);
  };

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
                min="2"
                max="8"
                step="0.5"
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
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "5px",
              }}
            >
              🔄 행성 궤도 순서
            </h3>
            <div
              style={{ fontSize: "12px", opacity: 0.7, marginBottom: "10px" }}
            >
              안쪽 궤도부터 바깥쪽 궤도 순서
            </div>
            {elementOrder.map((element, index) => (
              <div
                key={element.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  padding: "8px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    width: "15px",
                    height: "15px",
                    borderRadius: "50%",
                    background: element.color,
                    boxShadow: `0 0 8px ${element.color}`,
                  }}
                />
                <span style={{ fontSize: "14px", flex: 1 }}>
                  {index + 1}. {element.name}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => moveElement(index, "up")}
                    disabled={index === 0}
                    style={{
                      background:
                        index === 0
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      opacity: index === 0 ? 0.3 : 1,
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveElement(index, "down")}
                    disabled={index === elementOrder.length - 1}
                    style={{
                      background:
                        index === elementOrder.length - 1
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor:
                        index === elementOrder.length - 1
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "12px",
                      opacity: index === elementOrder.length - 1 ? 0.3 : 1,
                    }}
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

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
                    step="0.5"
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

          {/* 궤도 속도 조절 */}
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "5px",
              }}
            >
              🚀 행성 궤도 속도
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontSize: "14px" }}>속도 배율</span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  minWidth: "30px",
                  textAlign: "right",
                }}
              >
                {speedMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              style={{
                width: "100%",
                cursor: "pointer",
                accentColor: "#60a5fa",
              }}
            />
          </div>

          {/* 태양 은하 궤도 속도 */}
          <div style={{ marginBottom: "10px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "5px",
              }}
            >
              🌌 태양 은하 궤도 속도
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontSize: "14px" }}>은하 공전 속도</span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  minWidth: "30px",
                  textAlign: "right",
                }}
              >
                {galaxyOrbitSpeed.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={galaxyOrbitSpeed}
              onChange={(e) => onGalaxySpeedChange(parseFloat(e.target.value))}
              style={{
                width: "100%",
                cursor: "pointer",
                accentColor: "#fbbf24",
              }}
            />
          </div>

          {/* 궤도 벨트 설정 */}
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "5px",
              }}
            >
              💫 궤도 벨트 설정
            </h3>

            {/* 벨트 농도 */}
            <div style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "14px" }}>벨트 농도 (파티클 수)</span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    minWidth: "30px",
                    textAlign: "right",
                  }}
                >
                  {beltDensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={beltDensity}
                onChange={(e) =>
                  onBeltDensityChange(parseFloat(e.target.value))
                }
                style={{
                  width: "100%",
                  cursor: "pointer",
                  accentColor: "#8b5cf6",
                }}
              />
              <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "3px" }}>
                {beltDensity === 0
                  ? "벨트 숨김"
                  : beltDensity < 0.3
                  ? "흐리게"
                  : beltDensity < 0.7
                  ? "보통"
                  : "엄청 짙게"}
              </div>
            </div>

            {/* 벨트 투명도 */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "14px" }}>벨트 투명도 (밝기)</span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    minWidth: "30px",
                    textAlign: "right",
                  }}
                >
                  {beltOpacity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={beltOpacity}
                onChange={(e) =>
                  onBeltOpacityChange(parseFloat(e.target.value))
                }
                style={{
                  width: "100%",
                  cursor: "pointer",
                  accentColor: "#8b5cf6",
                }}
              />
              <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "3px" }}>
                {beltOpacity === 0
                  ? "투명"
                  : beltOpacity < 0.3
                  ? "희미함"
                  : beltOpacity < 0.7
                  ? "보통"
                  : "선명함"}
              </div>
            </div>
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
const STORAGE_KEY = "fiveElementsOrbitSettings";

// 기본 설정값
const DEFAULT_SETTINGS = {
  elementOrder: [...FIVE_ELEMENTS_BASE],
  elementSizes: {
    목: 3,
    화: 2,
    토: 1,
    금: 2,
    수: 1,
  },
  elementColors: {
    목: { top: "#22c55e", bottom: "#22c55e" },
    화: { top: "#ef4444", bottom: "#ef4444" },
    토: { top: "#f59e0b", bottom: "#f59e0b" },
    금: { top: "#e5e7eb", bottom: "#e5e7eb" },
    수: { top: "#3b82f6", bottom: "#3b82f6" },
  },
  speedMultiplier: 1.0,
  sunColor: "#fbbf24",
  sunSize: 4,
  beltDensity: 0.5,
  beltOpacity: 0.6,
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

  const initialSettings = loadSettings();

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

  // 설정값이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    const settings = {
      elementOrder: elementOrder.map((e) => ({ id: e.id, name: e.name })),
      elementSizes,
      elementColors,
      speedMultiplier,
      sunColor,
      sunSize,
      beltDensity,
      beltOpacity,
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
    sunColor,
    sunSize,
    beltDensity,
    beltOpacity,
  ]);

  const handleElementSizeChange = (element: string, value: number) => {
    setElementSizes((prev) => ({
      ...prev,
      [element]: value,
    }));
  };

  const handleElementColorChange = (
    element: string,
    color: string,
    position: "top" | "bottom"
  ) => {
    setElementColors((prev) => ({
      ...prev,
      [element]: {
        ...prev[element],
        [position]: color,
      },
    }));
  };

  // 설정 초기화 함수
  const handleReset = () => {
    if (confirm("모든 설정을 초기화하시겠습니까?")) {
      setElementOrder([...DEFAULT_SETTINGS.elementOrder]);
      setElementSizes({ ...DEFAULT_SETTINGS.elementSizes });
      setElementColors({ ...DEFAULT_SETTINGS.elementColors });
      setSpeedMultiplier(DEFAULT_SETTINGS.speedMultiplier);
      setSunColor(DEFAULT_SETTINGS.sunColor);
      setSunSize(DEFAULT_SETTINGS.sunSize);
      setBeltDensity(DEFAULT_SETTINGS.beltDensity);
      setBeltOpacity(DEFAULT_SETTINGS.beltOpacity);
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
          background: "rgba(0,0,0,0.85)",
          padding: "20px",
          borderRadius: "15px",
          maxWidth: "300px",
          border: "2px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            margin: "0 0 10px 0",
            fontSize: "24px",
            background: "linear-gradient(45deg, #60a5fa, #fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          🌟 5행 에너지 궤도
        </h1>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            opacity: 0.9,
            lineHeight: "1.6",
          }}
        >
          당신을 중심으로 우주가 돌아갑니다.
          <br />
          5행의 에너지를 시각화하여 체험하세요.
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <ControlPanel
        elementOrder={elementOrder}
        onElementOrderChange={setElementOrder}
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
        onReset={handleReset}
      />

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
        />
      </Canvas>
    </div>
  );
}
