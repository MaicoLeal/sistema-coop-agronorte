import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarState } from './DonMateo3DAvatar';

interface DonMateoThreeSceneProps {
  state?: AvatarState;
  className?: string;
}

export const DonMateoThreeScene: React.FC<DonMateoThreeSceneProps> = ({
  state = 'idle',
  className = 'w-full h-64 sm:h-72',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AvatarState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06190e, 0.15);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1cf, 2.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x10b981, 4, 10);
    rimLight.position.set(-2, 1, -1);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x059669, 2.5, 8);
    fillLight.position.set(2, -1, 1);
    scene.add(fillLight);

    // Floating Holographic Screen / Portrait Plane
    const textureLoader = new THREE.TextureLoader();
    const idleTexture = textureLoader.load('/assets/don-mateo/don-mateo-idle.jpg');
    const speakingTexture = textureLoader.load('/assets/don-mateo/don-mateo-speaking.jpg');
    const listeningTexture = textureLoader.load('/assets/don-mateo/don-mateo-listening.jpg');

    [idleTexture, speakingTexture, listeningTexture].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
    });

    const planeGeo = new THREE.PlaneGeometry(1.9, 1.9, 32, 32);
    // Add subtle cylindrical curvature
    const pos = planeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.pow(x * 0.4, 2));
    }
    planeGeo.computeVertexNormals();

    const planeMat = new THREE.MeshStandardMaterial({
      map: idleTexture,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const avatarMesh = new THREE.Mesh(planeGeo, planeMat);
    avatarMesh.position.set(0, 0.15, 0);
    scene.add(avatarMesh);

    // Holographic Base Disc (Pedestal)
    const ringGeo = new THREE.TorusGeometry(1.2, 0.025, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.6,
    });
    const pedestalRing = new THREE.Mesh(ringGeo, ringMat);
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = -0.9;
    scene.add(pedestalRing);

    // Pulsing Voice Energy Wave Ring
    const waveRingGeo = new THREE.RingGeometry(1.18, 1.25, 64);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    waveRing.rotation.x = Math.PI / 2;
    waveRing.position.y = -0.9;
    scene.add(waveRing);

    // Greenhouse atmospheric particles (Floating Dust / Pollen)
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 3;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = mouseX * 0.45;
      targetRotationX = mouseY * 0.25;
    };

    container.addEventListener('mousemove', handlePointerMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let mouthToggleTime = 0;
    let isSpeakingAlt = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Smooth camera/avatar rotation towards mouse
      avatarMesh.rotation.y += (targetRotationY - avatarMesh.rotation.y) * 0.08;
      avatarMesh.rotation.x += (targetRotationX - avatarMesh.rotation.x) * 0.08;

      // Idle breathing float
      const breathing = Math.sin(elapsedTime * 2.2) * 0.025;
      avatarMesh.position.y = 0.15 + breathing;

      // Base ring rotation
      pedestalRing.rotation.z = elapsedTime * 0.25;

      // Particle floating drift
      const posAttr = particleGeo.attributes.position;
      for (let i = 1; i < particleCount * 3; i += 3) {
        let y = posAttr.getY(i / 3) + 0.002;
        if (y > 1.8) y = -1.5;
        posAttr.setY(i / 3, y);
      }
      posAttr.needsUpdate = true;

      // State reactive logic
      if (currentState === 'speaking') {
        // Voice waves expand
        const waveScale = 1 + (Math.sin(elapsedTime * 8) + 1) * 0.2;
        waveRing.scale.set(waveScale, waveScale, waveScale);
        waveRingMat.opacity = 0.6 - (waveScale - 1) * 1.2;
        rimLight.intensity = 5 + Math.sin(elapsedTime * 12) * 2;

        if (elapsedTime - mouthToggleTime > 0.18) {
          isSpeakingAlt = !isSpeakingAlt;
          mouthToggleTime = elapsedTime;
          planeMat.map = isSpeakingAlt ? speakingTexture : idleTexture;
          planeMat.needsUpdate = true;
        }
      } else if (currentState === 'listening') {
        waveRing.scale.set(1.15, 1.15, 1.15);
        waveRingMat.color.setHex(0xf59e0b);
        waveRingMat.opacity = 0.5 + Math.sin(elapsedTime * 5) * 0.2;
        rimLight.color.setHex(0xf59e0b);
        planeMat.map = listeningTexture;
        planeMat.needsUpdate = true;
      } else {
        waveRing.scale.set(1, 1, 1);
        waveRingMat.color.setHex(0x10b981);
        waveRingMat.opacity = 0.2;
        rimLight.color.setHex(0x10b981);
        rimLight.intensity = 3;
        planeMat.map = idleTexture;
        planeMat.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      waveRingGeo.dispose();
      waveRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      idleTexture.dispose();
      speakingTexture.dispose();
      listeningTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative rounded-2xl overflow-hidden bg-linear-to-b from-stone-950 via-emerald-950/80 to-stone-950 flex items-center justify-center border border-emerald-500/30 shadow-inner ${className}`}
    >
      <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>THREE.JS 3D WEBGL ENGINE</span>
      </div>
      <div className="absolute bottom-2 right-3 z-10 text-[9px] text-emerald-400/60 font-sans select-none pointer-events-none">
        Mova o cursor para interagir
      </div>
    </div>
  );
};
