import { useEffect, useRef, useState } from 'react';

interface LandingSceneProps {
  active: boolean;
  className?: string;
  imageSrc?: string;
}

const SCENE_IMAGE = '/assets/agronorte-sunrise-hero.jpg';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_imageSize;
  uniform float u_time;
  uniform float u_motion;
  varying vec2 v_uv;

  float flagRegion(vec2 uv) {
    if (uv.x < 0.292 || uv.x > 0.380) return 0.0;
    float topY = 0.088 + (uv.x - 0.292) * 1.20;
    float bottomY = 0.210 + (uv.x - 0.292) * 0.50;
    float feather = 0.009;
    float topMask = smoothstep(topY, topY + feather, uv.y);
    float bottomMask = 1.0 - smoothstep(bottomY - feather, bottomY, uv.y);
    float leftMask = smoothstep(0.2925, 0.296, uv.x);
    float rightMask = 1.0 - smoothstep(0.372, 0.378, uv.x);
    return topMask * bottomMask * leftMask * rightMask;
  }

  void main() {
    float aspect = u_imageSize.x / u_imageSize.y;
    float viewportAspect = u_resolution.x / u_resolution.y;
    vec2 visible = vec2(min(1.0, viewportAspect / aspect), min(1.0, aspect / viewportAspect));

    // No mobile portrait (viewport vertical), ajusta o ponto focal horizontal para a bandeira do Paraguai (uv.x ~ 0.336)
    float mobileBlend = 1.0 - smoothstep(0.70, 1.15, viewportAspect);
    float minX = 0.5 * visible.x;
    float maxX = 1.0 - 0.5 * visible.x;
    float targetFocusX = clamp(0.336, minX, maxX);
    float focusX = mix(0.5, targetFocusX, mobileBlend);

    vec2 uv = (vec2(v_uv.x, 1.0 - v_uv.y) - 0.5) * visible + vec2(focusX, 0.5);
    vec2 displacement = vec2(0.0);

    // ─── PARAGUAYAN FLAG WAVING IN THE WIND ───
    // Fixed firmly at the flagpole (uv.x = 0.2925), billowing toward free edge
    float flag = flagRegion(uv);
    float freeEdge = smoothstep(0.293, 0.370, uv.x);

    // Multi-frequency ripples simulate wind traveling across fabric
    float ripple1 = sin((uv.x - 0.292) * 52.0 - u_time * 5.8 + uv.y * 9.0);
    float ripple2 = sin((uv.x - 0.292) * 98.0 - u_time * 8.0 - uv.y * 13.0) * 0.35;
    float flutter = cos(u_time * 4.0 + (uv.x - 0.292) * 40.0) * 0.2;
    float gust = 0.88 + 0.12 * sin(u_time * 1.4);
    float wave = (ripple1 + ripple2 + flutter) * gust;

    displacement.y += wave * 0.0065 * freeEdge * flag * u_motion;
    displacement.x += cos((uv.x - 0.292) * 48.0 - u_time * 5.5) * 0.0022 * freeEdge * flag * u_motion;

    // ─── FOLIAGE & TOMATO PLANTS — SOFT MICRO-BREEZE ───
    // Only the right-hand plant column (uv.x > 0.62) and foreground.
    // Each "leaf cluster" has its own phase so they sway independently,
    // not as a single surface. Amplitude is kept very small so it reads
    // as a gentle shimmer rather than a warp.
    float plantZone = smoothstep(0.62, 0.74, uv.x) * smoothstep(0.04, 0.22, uv.y)
                    * (1.0 - smoothstep(0.90, 1.00, uv.y));   // don't touch roof
    float clusterPhase = fract(uv.x * 9.3 + uv.y * 6.7) * 6.2832; // per-cluster offset
    float slowDrift = sin(u_time * 0.55 + clusterPhase) * 0.00025;  // very slow whole-stem sway
    float microShiver = sin(u_time * 2.1 + clusterPhase * 1.7) * 0.00012; // leaf edge shimmer
    displacement.x += (slowDrift + microShiver) * plantZone * u_motion;
    displacement.y += sin(u_time * 0.70 + clusterPhase * 2.3) * 0.00010 * plantZone * u_motion;

    // Sample textured hero image with displaced coordinates
    vec3 color = texture2D(u_image, clamp(uv + displacement, 0.001, 0.999)).rgb;

    // Crease highlights and shadow ripples on the flag cloth
    float highlight = cos((uv.x - 0.292) * 52.0 - u_time * 5.8 + uv.y * 9.0);
    color += vec3(0.08, 0.06, 0.03) * highlight * freeEdge * flag * u_motion;

    // Gentle sunrise warmth pulse
    vec2 sunPos = vec2(0.395, 0.365);
    float distToSun = length((uv - sunPos) * vec2(aspect, 1.0));
    float sunGlow = exp(-pow(distToSun / 0.28, 2.0));
    float morningPulse = 0.97 + 0.03 * sin(u_time * 0.9);
    color = mix(color, color * vec3(1.04, 1.02, 0.98) * morningPulse, sunGlow * 0.22);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

/** Photographic cinemagraph with a static image fallback and no video dependency. */
export default function LandingScene({ active, className = '', imageSrc = SCENE_IMAGE }: LandingSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const updatePlaybackRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = active;
    updatePlaybackRef.current?.();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    } catch {
      return;
    }
    if (!gl) return;
    const context = gl;
    const vertexShader = createShader(context, context.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) context.deleteShader(vertexShader);
      if (fragmentShader) context.deleteShader(fragmentShader);
      return;
    }

    const program = context.createProgram();
    if (!program) {
      context.deleteShader(vertexShader);
      context.deleteShader(fragmentShader);
      return;
    }
    context.attachShader(program, vertexShader);
    context.attachShader(program, fragmentShader);
    context.linkProgram(program);
    context.deleteShader(vertexShader);
    context.deleteShader(fragmentShader);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      context.deleteProgram(program);
      return;
    }

    const buffer = context.createBuffer();
    const texture = context.createTexture();
    if (!buffer || !texture) {
      if (buffer) context.deleteBuffer(buffer);
      if (texture) context.deleteTexture(texture);
      context.deleteProgram(program);
      return;
    }
    context.useProgram(program);
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), context.STATIC_DRAW);
    const position = context.getAttribLocation(program, 'a_position');
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
    context.activeTexture(context.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.uniform1i(context.getUniformLocation(program, 'u_image'), 0);

    const resolutionUniform = context.getUniformLocation(program, 'u_resolution');
    const sizeUniform = context.getUniformLocation(program, 'u_imageSize');
    const timeUniform = context.getUniformLocation(program, 'u_time');
    const motionUniform = context.getUniformLocation(program, 'u_motion');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const source = new Image();
    let disposed = false;
    let contextLost = false;
    let loaded = false;
    let frameId = 0;
    let previousTime = 0;
    let elapsed = 0;
    let inView = true;

    const canAnimate = () => loaded && !disposed && !contextLost && activeRef.current
      && !reducedMotion.matches && !document.hidden && inView;

    const draw = () => {
      if (!loaded || disposed || contextLost) return;
      context.uniform1f(timeUniform, reducedMotion.matches ? 0 : elapsed);
      context.uniform1f(motionUniform, (reducedMotion.matches || !activeRef.current) ? 0 : 1);
      context.drawArrays(context.TRIANGLES, 0, 6);
    };

    const tick = (now: number) => {
      frameId = 0;
      if (!canAnimate()) { previousTime = 0; return; }
      if (previousTime) elapsed += Math.min((now - previousTime) / 1000, 0.1);
      previousTime = now;
      draw();
      frameId = requestAnimationFrame(tick);
    };

    const updatePlayback = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      previousTime = 0;
      if (canAnimate()) frameId = requestAnimationFrame(tick);
      else if (loaded && !document.hidden && inView) draw();
    };
    updatePlaybackRef.current = updatePlayback;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.viewport(0, 0, width, height);
      context.uniform2f(resolutionUniform, width, height);
      draw();
    };

    source.onload = () => {
      if (disposed || contextLost) return;
      try {
        context.bindTexture(context.TEXTURE_2D, texture);
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 0);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, source);
        context.uniform2f(sizeUniform, source.naturalWidth || 1376, source.naturalHeight || 768);
        loaded = true;
        resize();
        setReady(true);
        updatePlayback();
      } catch {
        loaded = false;
        setReady(false);
      }
    };
    source.onerror = () => { if (!disposed) setReady(false); };
    source.src = imageSrc;

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      setReady(false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    });
    intersectionObserver.observe(canvas);
    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', updatePlayback);
    reducedMotion.addEventListener('change', updatePlayback);
    resize();

    return () => {
      disposed = true;
      updatePlaybackRef.current = null;
      if (frameId) cancelAnimationFrame(frameId);
      source.onload = null;
      source.onerror = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', updatePlayback);
      reducedMotion.removeEventListener('change', updatePlayback);
      context.deleteTexture(texture);
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
    };
  }, [imageSrc]);

  return (
    <div
      className={`landing-scene ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        className="landing-scene__canvas"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
