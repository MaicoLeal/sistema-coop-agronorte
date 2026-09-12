import { useEffect, useRef, useState } from 'react';

interface LandingSceneProps {
  active: boolean;
  className?: string;
}

const SCENE_IMAGE = '/assets/agronorte-reference-hero.jpg';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const SHADER_AMPLITUDE = {
  flagPrimaryY: 0.0034,
  flagDetailY: 0.0008,
  flagX: 0.00062,
  cropX: 0.00235,
  cropY: 0.00075,
  flagRippleLight: 0.032,
} as const;

const DESKTOP_SCENE_FOCUS = [0.5, 0.5] as const;
const MOBILE_SCENE_FOCUS = [0.68, 0.5] as const;
const COMPACT_SCENE_FOCUS = [0.64, 0.5] as const;

function getSceneFocus(viewportWidth: number): readonly [number, number] {
  if (viewportWidth <= 420) return COMPACT_SCENE_FOCUS;
  if (viewportWidth <= 700) return MOBILE_SCENE_FOCUS;
  return DESKTOP_SCENE_FOCUS;
}

// All masks use coordinates in the original photograph, not the viewport. This
// keeps the flag, leaves and sunlight attached to the scene at every aspect ratio.
const FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_imageSize;
  uniform vec2 u_focus;
  uniform float u_time;
  uniform float u_motion;
  varying vec2 v_uv;

  float region(vec2 uv, vec2 lower, vec2 upper, float feather) {
    vec2 leading = smoothstep(lower, lower + feather, uv);
    vec2 trailing = 1.0 - smoothstep(upper - feather, upper, uv);
    return leading.x * leading.y * trailing.x * trailing.y;
  }

  void main() {
    float aspect = u_imageSize.x / u_imageSize.y;
    float viewportAspect = u_resolution.x / u_resolution.y;
    vec2 visible = vec2(min(1.0, viewportAspect / aspect), min(1.0, aspect / viewportAspect));
    vec2 sourceUv = vec2(v_uv.x, 1.0 - v_uv.y);
    vec2 cropOrigin = (1.0 - visible) * u_focus;
    vec2 uv = sourceUv * visible + cropOrigin;
    vec3 original = texture2D(u_image, uv).rgb;
    vec2 displacement = vec2(0.0);

    // The pole stays fixed; the cloth breathes gradually toward its free edge.
    float flag = region(uv, vec2(0.454, 0.078), vec2(0.535, 0.224), 0.004);
    float flagSpan = smoothstep(0.462, 0.530, uv.x);
    float flagBody = smoothstep(0.084, 0.096, uv.y) * (1.0 - smoothstep(0.202, 0.220, uv.y));
    float flagMotion = flag * flagSpan * flagBody;
    float ripple = sin((uv.x - 0.488) * 320.0 - u_time * 2.6 + uv.y * 7.0);
    float smallRipple = sin((uv.x - 0.488) * 570.0 - u_time * 3.1 + uv.y * 12.0);
    displacement.y += (ripple * ${SHADER_AMPLITUDE.flagPrimaryY} + smallRipple * ${SHADER_AMPLITUDE.flagDetailY}) * flagMotion;
    displacement.x += cos((uv.x - 0.497) * 260.0 - u_time * 2.6) * ${SHADER_AMPLITUDE.flagX} * flagMotion;

    // Color and position masks leave the greenhouse framing, trays and sensors
    // still. Motion is strongest in the foreground foliage and soft at its edges.
    float vegetation = smoothstep(0.012, 0.075, original.g - original.b)
      * smoothstep(-0.015, 0.055, original.g - original.r * 0.85);
    float fruit = smoothstep(0.08, 0.22, original.r - original.g)
      * smoothstep(0.06, 0.20, original.r - original.b);
    float rightPlants = region(uv, vec2(0.635, 0.235), vec2(1.04, 0.895), 0.09);
    float leftPlants = (1.0 - smoothstep(0.075, 0.255, uv.x)) * smoothstep(0.56, 0.80, uv.y);
    float bottomPlants = region(uv, vec2(0.485, 0.855), vec2(0.80, 1.04), 0.06);
    float plants = max(max(rightPlants, leftPlants), bottomPlants) * max(vegetation, fruit * 0.6);
    // Layered, low-amplitude wind: nearby leaves move more, with independent
    // phase and a slow gust so the crop never sways as one rigid surface.
    float depth = smoothstep(0.48, 0.96, uv.y);
    float height = smoothstep(0.36, 0.82, uv.y);
    float phase = uv.x * 31.0 + uv.y * 17.0;
    float gust = 0.76 + 0.24 * sin(u_time * 0.28 + uv.x * 4.0);
    float broadWind = sin(u_time * 0.78 + phase) * 0.62;
    float fineWind = sin(u_time * 1.7 - uv.x * 42.0 + uv.y * 25.0) * 0.16;
    float leafFlutter = cos(u_time * 2.55 + uv.x * 71.0 - uv.y * 37.0) * 0.06;
    float breeze = (broadWind + fineWind + leafFlutter) * gust;
    float plantMotion = plants * (0.30 + depth * 0.70) * (0.42 + height * 0.58);
    displacement.x += breeze * ${SHADER_AMPLITUDE.cropX} * plantMotion;
    displacement.y += sin(u_time * 1.05 + uv.x * 20.0 + uv.y * 13.0) * ${SHADER_AMPLITUDE.cropY} * plantMotion;

    vec3 color = texture2D(u_image, clamp(uv + displacement * u_motion, 0.001, 0.999)).rgb;
    color *= 1.0 + ripple * ${SHADER_AMPLITUDE.flagRippleLight} * flagMotion * u_motion;

    // The reference artwork already contains its finished dawn lighting.
    // Keep every pixel stable except for the localized flag and crop motion.
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
export default function LandingScene({ active, className = '' }: LandingSceneProps) {
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
    const focusUniform = context.getUniformLocation(program, 'u_focus');
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
      const motionEnabled = canAnimate();
      context.uniform1f(timeUniform, elapsed);
      context.uniform1f(motionUniform, motionEnabled ? 1 : 0);
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
      const [focusX, focusY] = getSceneFocus(window.innerWidth);
      context.uniform2f(focusUniform, focusX, focusY);
      draw();
    };

    source.onload = () => {
      if (disposed || contextLost) return;
      try {
        context.bindTexture(context.TEXTURE_2D, texture);
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 0);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, source);
        context.uniform2f(sizeUniform, source.naturalWidth, source.naturalHeight);
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
    source.src = SCENE_IMAGE;

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
  }, []);

  return (
    <div className={`landing-scene ${className}`.trim()} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img
        className="landing-scene__image"
        src={SCENE_IMAGE}
        alt=""
        fetchPriority="high"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
      />
      <canvas
        ref={canvasRef}
        className="landing-scene__canvas"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
