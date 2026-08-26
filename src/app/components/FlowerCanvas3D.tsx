import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, RotateCw, Palette, Eye } from "lucide-react";

export type FlowerPreset = "rose" | "sunflower" | "tulip" | "lily";

interface PresetConfig {
  name: string;
  petalColor: number;
  innerColor: number;
  centerColor: number;
  petalCount: number;
  layers: number;
  petalScale: [number, number, number];
  description: string;
}

const PRESETS: Record<FlowerPreset, PresetConfig> = {
  rose: {
    name: "Pastel Rose",
    petalColor: 0xd1748c,
    innerColor: 0xe8a0b4,
    centerColor: 0xffd166,
    petalCount: 8,
    layers: 4,
    petalScale: [0.8, 1.2, 0.4],
    description: "Soft velvet fuzzy wire petals with golden center core.",
  },
  sunflower: {
    name: "Soleil Sunflower",
    petalColor: 0xf4a261,
    innerColor: 0xe76f51,
    centerColor: 0x4a2810,
    petalCount: 16,
    layers: 2,
    petalScale: [0.4, 1.4, 0.2],
    description: "Vibrant yellow-orange petals with textured fuzzy core.",
  },
  tulip: {
    name: "Pink Tulip",
    petalColor: 0xe29578,
    innerColor: 0xf5cac3,
    centerColor: 0x84a59d,
    petalCount: 6,
    layers: 2,
    petalScale: [1.1, 1.6, 0.6],
    description: "Graceful cup-shaped tulip petals with silky sheen.",
  },
  lily: {
    name: "Blue Lily",
    petalColor: 0x48cae4,
    innerColor: 0x90e0ef,
    centerColor: 0xfefae0,
    petalCount: 6,
    layers: 2,
    petalScale: [0.6, 1.8, 0.3],
    description: "Sky-blue flare lily with stamen crystal accents.",
  },
};

export default function FlowerCanvas3D({
  initialPreset = "rose",
  className = "",
  compact = false,
}: {
  initialPreset?: FlowerPreset;
  className?: string;
  compact?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentPreset, setCurrentPreset] = useState<FlowerPreset>(initialPreset);
  const [autoRotate, setAutoRotate] = useState(true);
  const flowerGroupRef = useRef<THREE.Group | null>(null);
  const petalsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // Renderer with antialias and alpha
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 2.0);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd1748c, 1.5);
    dirLight2.position.set(-4, -2, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    flowerGroupRef.current = rootGroup;

    // Floating background particles (sparkles/pollen)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 45;
    const posArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArr[i] = (Math.random() - 0.5) * 8;
      posArr[i + 1] = (Math.random() - 0.5) * 8;
      posArr[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8a0b4,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particleMesh);

    // Build Flower Mesh
    const buildFlower = (presetKey: FlowerPreset) => {
      // Clear existing children
      while (rootGroup.children.length > 0) {
        rootGroup.remove(rootGroup.children[0]);
      }
      petalsRef.current = [];

      const cfg = PRESETS[presetKey];

      // Stem (fuzzy green wire)
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -2.4, -0.2),
        new THREE.Vector3(0.08, -1.2, 0.1),
        new THREE.Vector3(-0.04, -0.4, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.07, 12, false);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x4f6f52,
        roughness: 0.85,
        metalness: 0.1,
      });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      rootGroup.add(stemMesh);

      // Leaves
      const leafGeo = new THREE.SphereGeometry(0.35, 16, 16);
      leafGeo.scale(0.4, 1.4, 0.08);
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x5a7d5e,
        roughness: 0.7,
      });
      const leaf1 = new THREE.Mesh(leafGeo, leafMat);
      leaf1.position.set(0.3, -1.1, 0);
      leaf1.rotation.set(0.3, 0.4, 0.8);
      rootGroup.add(leaf1);

      const leaf2 = new THREE.Mesh(leafGeo, leafMat);
      leaf2.position.set(-0.28, -1.6, 0.05);
      leaf2.rotation.set(-0.2, -0.4, -0.8);
      rootGroup.add(leaf2);

      // Flower Center (Stamen core)
      const centerGeo = new THREE.SphereGeometry(0.42, 32, 32);
      centerGeo.scale(1, 0.7, 1);
      const centerMat = new THREE.MeshStandardMaterial({
        color: cfg.centerColor,
        roughness: 0.9,
        metalness: 0.15,
      });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      centerMesh.position.set(0, 0, 0.1);
      rootGroup.add(centerMesh);

      // Petal Geometry (Curved teardrop)
      const petalShape = new THREE.Shape();
      petalShape.moveTo(0, 0);
      petalShape.quadraticCurveTo(0.45, 0.6, 0.35, 1.3);
      petalShape.quadraticCurveTo(0, 1.6, -0.35, 1.3);
      petalShape.quadraticCurveTo(-0.45, 0.6, 0, 0);

      const extrudeSettings = {
        depth: 0.06,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 2,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      };
      const rawPetalGeo = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
      rawPetalGeo.scale(cfg.petalScale[0], cfg.petalScale[1], cfg.petalScale[2]);

      // Create Petals in Layers
      for (let layer = 0; layer < cfg.layers; layer++) {
        const layerPetalCount = cfg.petalCount + layer * 2;
        const layerScale = 1 - layer * 0.18;
        const layerTilt = 0.25 + layer * 0.22;
        const layerColor = layer === 0 ? cfg.petalColor : cfg.innerColor;

        const petalMat = new THREE.MeshPhysicalMaterial({
          color: layerColor,
          roughness: 0.65,
          metalness: 0.1,
          clearcoat: 0.2,
          clearcoatRoughness: 0.4,
          sheen: 0.8,
          sheenColor: new THREE.Color(0xffffff),
          side: THREE.DoubleSide,
        });

        for (let i = 0; i < layerPetalCount; i++) {
          const angle = (i / layerPetalCount) * Math.PI * 2 + (layer * Math.PI) / layerPetalCount;
          const petalMesh = new THREE.Mesh(rawPetalGeo, petalMat);

          petalMesh.scale.set(layerScale, layerScale, layerScale);
          petalMesh.position.set(
            Math.cos(angle) * (0.15 + layer * 0.05),
            Math.sin(angle) * (0.15 + layer * 0.05),
            -layer * 0.08
          );
          petalMesh.rotation.z = angle - Math.PI / 2;
          petalMesh.rotation.x = Math.sin(angle) * layerTilt;
          petalMesh.rotation.y = -Math.cos(angle) * layerTilt;

          rootGroup.add(petalMesh);
          petalsRef.current.push(petalMesh);
        }
      }
    };

    buildFlower(currentPreset);

    // Mouse Interaction (Drag to rotate & Parallax)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotation = { x: 0.3, y: 0 };
    let mouseParallax = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMousePos = { x: clientX, y: clientY };
    };

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - prevMousePos.x;
        const deltaY = clientY - prevMousePos.y;
        targetRotation.y += deltaX * 0.01;
        targetRotation.x += deltaY * 0.01;
        prevMousePos = { x: clientX, y: clientY };
      } else {
        const rect = container.getBoundingClientRect();
        mouseParallax.x = ((clientX - rect.left) / rect.width - 0.5) * 0.4;
        mouseParallax.y = ((clientY - rect.top) / rect.height - 0.5) * 0.4;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onMouseDown, { passive: true });
    container.addEventListener("touchmove", onMouseMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle breathing/floating motion
      rootGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      if (autoRotate && !isDragging) {
        targetRotation.y += 0.006;
      }

      // Smooth interpolation for rotation
      rootGroup.rotation.x += (targetRotation.x + mouseParallax.y - rootGroup.rotation.x) * 0.06;
      rootGroup.rotation.y += (targetRotation.y + mouseParallax.x - rootGroup.rotation.y) * 0.06;

      // Rotate sparkles
      particleMesh.rotation.y = elapsedTime * 0.04;
      particleMesh.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onMouseDown);
      container.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [currentPreset, autoRotate]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden touch-none"
        title="Click and drag to rotate the 3D flower"
      />

      {/* Floating 3D Interaction Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(216,170,185,0.3)] shadow-sm pointer-events-none">
        <Sparkles size={13} className="text-[#D1748C] animate-pulse" />
        <span className="text-[11px] font-semibold text-[#2B2B2B] tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Interactive 3D Preview
        </span>
      </div>

      {/* Controls Bar */}
      {!compact && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-[rgba(216,170,185,0.35)] shadow-lg">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {(Object.keys(PRESETS) as FlowerPreset[]).map((key) => {
              const p = PRESETS[key];
              const isSelected = currentPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentPreset(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#D1748C] text-white shadow-sm scale-105"
                      : "bg-[#FFF8F3] text-[#8A7A72] hover:text-[#D1748C] hover:bg-[#F5E8EE]"
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate((r) => !r)}
            className={`p-2 rounded-xl border transition-all ${
              autoRotate
                ? "bg-[#EDF4EE] border-[#4F6F52]/30 text-[#4F6F52]"
                : "bg-[#FFF8F3] border-[rgba(216,170,185,0.3)] text-[#8A7A72]"
            }`}
            title={autoRotate ? "Pause rotation" : "Auto-rotate"}
          >
            <RotateCw size={14} className={autoRotate ? "animate-spin" : ""} style={{ animationDuration: "6s" }} />
          </button>
        </div>
      )}
    </div>
  );
}
