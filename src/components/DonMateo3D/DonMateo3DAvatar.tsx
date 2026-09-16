import React, { useState, useEffect, useRef } from 'react';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface DonMateo3DAvatarProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_CONFIGS = {
  sm: {
    container: 'w-10 h-10',
    imgSize: 'scale-110',
    badgeText: 'text-[9px] px-1.5 py-0.2',
    ring: 'ring-2',
    glow: 'shadow-md',
  },
  md: {
    container: 'w-18 h-18 sm:w-20 sm:h-20',
    imgSize: 'scale-115',
    badgeText: 'text-[10px] px-2 py-0.5',
    ring: 'ring-3',
    glow: 'shadow-xl',
  },
  lg: {
    container: 'w-32 h-32 sm:w-36 sm:h-36',
    imgSize: 'scale-110',
    badgeText: 'text-xs px-2.5 py-1',
    ring: 'ring-4',
    glow: 'shadow-2xl',
  },
  xl: {
    container: 'w-48 h-48 sm:w-56 sm:h-56',
    imgSize: 'scale-110',
    badgeText: 'text-sm px-3 py-1',
    ring: 'ring-4',
    glow: 'shadow-2xl',
  },
};

export const DonMateo3DAvatar: React.FC<DonMateo3DAvatarProps> = ({
  state = 'idle',
  size = 'md',
  interactive = true,
  showBadge = true,
  className = '',
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [speechMouthOpen, setSpeechMouthOpen] = useState(false);

  // 3D Parallax Tilt calculation on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      x: x * 18, // max 18 deg tilt
      y: -y * 18,
    });

    setLightPos({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
    });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setTilt({ x: 0, y: 0 });
    setLightPos({ x: 50, y: 35 });
  };

  // Natural Blinking rhythm
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkTimer);
  }, []);

  // Speech lip-sync mouth articulation
  useEffect(() => {
    if (state === 'speaking') {
      const speechInterval = setInterval(() => {
        setSpeechMouthOpen((prev) => !prev);
      }, 160);
      return () => clearInterval(speechInterval);
    } else {
      setSpeechMouthOpen(false);
    }
  }, [state]);

  const config = SIZE_CONFIGS[size];

  // Determine active visual texture
  let activeImage = '/assets/don-mateo/don-mateo-idle.jpg';
  if (state === 'speaking' && speechMouthOpen) {
    activeImage = '/assets/don-mateo/don-mateo-speaking.jpg';
  } else if (state === 'listening') {
    activeImage = '/assets/don-mateo/don-mateo-listening.jpg';
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative select-none group ${config.container} ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* 3D Audio Frequency / Listening Wave Rings */}
      {state === 'speaking' && (
        <>
          <div className="absolute -inset-2 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" />
          <div className="absolute -inset-3.5 rounded-full bg-linear-to-r from-emerald-500/20 via-teal-400/30 to-lime-500/20 animate-pulse pointer-events-none blur-xs" />
        </>
      )}

      {state === 'listening' && (
        <>
          <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-400/80 animate-pulse pointer-events-none" />
          <div className="absolute -inset-4 rounded-full border border-teal-300/40 animate-ping pointer-events-none" />
        </>
      )}

      {state === 'thinking' && (
        <div className="absolute -inset-2 rounded-full border-2 border-amber-400/70 border-t-transparent animate-spin pointer-events-none" />
      )}

      {/* 3D Card Shell with Parallax Tilt */}
      <div
        className={`w-full h-full rounded-full overflow-hidden relative cursor-pointer transition-transform duration-200 ease-out ${config.ring} ${
          state === 'speaking'
            ? 'ring-emerald-400 shadow-emerald-600/40'
            : state === 'listening'
            ? 'ring-amber-400 shadow-amber-500/40'
            : state === 'thinking'
            ? 'ring-cyan-400 shadow-cyan-500/40'
            : 'ring-emerald-700/60 hover:ring-emerald-500 shadow-black/40'
        } ${config.glow}`}
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale3d(1, 1, 1)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background Depth Base */}
        <div className="absolute inset-0 bg-linear-to-b from-stone-900 via-emerald-950 to-stone-950" />

        {/* Hyper-realistic 3D Character Layer */}
        <img
          src={activeImage}
          alt="Don Mateo - Engenheiro Agrônomo IA 3D"
          className={`w-full h-full object-cover object-center transition-all duration-150 ${config.imgSize} ${
            state === 'speaking' ? 'scale-118' : 'scale-112'
          }`}
          style={{
            transform: `translate(${tilt.x * 0.4}px, ${-tilt.y * 0.4}px)`,
          }}
          loading="eager"
        />

        {/* Natural Eyelid Blink Simulation Overlay */}
        {isBlinking && (
          <div className="absolute inset-0 bg-stone-900/40 pointer-events-none transition-opacity duration-100" />
        )}

        {/* Dynamic 3D Specular Light Glare (Follows Mouse Position) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-300 mix-blend-soft-light opacity-60 group-hover:opacity-90"
          style={{
            background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 35%, transparent 65%)`,
          }}
        />

        {/* Emerald Coop Agronorte Rim Light Vignette */}
        <div className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/20 shadow-inner" />

        {/* Audio Equalizer bars when Speaking */}
        {state === 'speaking' && (
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-0.5 pointer-events-none z-10">
            <span className="w-1 h-2.5 bg-emerald-300 rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-lime-300 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]" />
            <span className="w-1 h-4.5 bg-teal-300 rounded-full animate-pulse [animation-delay:75ms]" />
            <span className="w-1 h-2 bg-emerald-300 rounded-full animate-pulse [animation-delay:225ms]" />
          </div>
        )}
      </div>

      {/* Floating Status Ring Indicator */}
      {state === 'speaking' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-xs" />
        </span>
      )}
      {state === 'listening' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white shadow-xs" />
        </span>
      )}

      {/* 3D Realistic Badge */}
      {showBadge && (
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-emerald-100 font-bold rounded-full uppercase tracking-wider shadow-lg border border-emerald-500/50 whitespace-nowrap flex items-center gap-1 backdrop-blur-md">
          <span className={`flex items-center gap-1 ${config.badgeText}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Don Mateo
          </span>
        </div>
      )}
    </div>
  );
};
