import { useEffect, useRef, useState } from 'react';

interface LandingSceneProps {
  active: boolean;
  className?: string;
}

const SCENE_IMAGE = '/assets/agronorte-scenic-daylight.jpg';
const SUNRISE_SECONDS = 8.5;

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// All masks use coordinates in the original photograph, not the viewport. This
// keeps the flag, leaves and sunlight attached to the scene at every aspect ratio.
const FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_imageSize;
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
    vec2 uv = (vec2(v_uv.x, 1.0 - v_uv.y) - 0.5) * visible + 0.5;
    vec3 original = texture2D(u_image, uv).rgb;
    vec2 displacement = vec2(0.0);

    // The pole stays fixed; the ripple grows towards the flag's free edge.
    float flag = region(uv, vec2(0.496, 0.361), vec2(0.522, 0.420), 0.003);
    float freeEdge = smoothstep(0.497, 0.519, uv.x);
    float ripple = sin((uv.x - 0.497) * 365.0 - u_time * 3.5);
    float secondRipple = sin((uv.x - 0.497) * 625.0 - u_time * 4.2 + uv.y * 12.0);
    displacement.y += (ripple * 0.0032 + secondRipple * 0.0008) * freeEdge * flag;
    displacement.x += cos((uv.x - 0.497) * 290.0 - u_time * 3.5) * 0.0007 * freeEdge * flag;

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
    float gust = 0.72 + 0.28 * sin(u_time * 0.38 + uv.x * 5.0);
    float broadWind = sin(u_time * 1.12 + phase) * 0.72;
    float fineWind = sin(u_time * 2.35 - uv.x * 47.0 + uv.y * 29.0) * 0.2;
    float leafFlutter = cos(u_time * 3.15 + uv.x * 83.0 - uv.y * 41.0) * 0.08;
    float breeze = (broadWind + fineWind + leafFlutter) * gust;
    float plantMotion = plants * (0.35 + depth * 0.65) * (0.35 + height * 0.65);
    displacement.x += breeze * 0.00125 * plantMotion;
    displacement.y += sin(u_time * 1.48 + uv.x * 22.0 + uv.y * 13.0) * 0.00042 * plantMotion;

    vec3 color = texture2D(u_image, clamp(uv + displacement * u_motion, 0.001, 0.999)).rgb;
    color *= 1.0 + ripple * 0.035 * flag * freeEdge * u_motion;

    // A single, gradual sunrise, followed by a steady warm morning light.
    float progress = clamp(u_time / 8.5, 0.0, 1.0);
    float dawn = 1.0 - pow(1.0 - progress, 3.0);
    vec2 sun = vec2(0.452, mix(0.454, 0.375, dawn));
    vec2 fromSun = (uv - sun) * vec2(aspect, 1.0);
    float distanceToSun = length(fromSun);
    float sky = 1.0 - smoothstep(0.436, 0.455, uv.y);
    color *= mix(vec3(0.72, 0.77, 0.85), vec3(1.045, 1.01, 0.94), dawn);

    // Warm the blue atmospheric pixels near the horizon, while retaining cloud
    // detail and the neutral greenhouse frames. The upper sky stays softly blue.
    float blueSky = smoothstep(0.025, 0.18, original.b - original.r)
      * smoothstep(0.22, 0.55, original.b) * sky * (1.0 - flag);
    vec2 atmosphereOffset = (uv - vec2(sun.x, 0.422)) / vec2(0.36, 0.21);
    float atmosphere = exp(-dot(atmosphereOffset, atmosphereOffset));
    float luminance = dot(original, vec3(0.2126, 0.7152, 0.0722));
    vec3 morningSky = vec3(1.0, 0.79, 0.56) * mix(0.78, 1.0, luminance);
    color = mix(color, morningSky, blueSky * atmosphere * (0.08 + dawn * 0.65));

    // Broad atmospheric light and soft lens bloom avoid a drawn disc or radial
    // spokes. Nested Gaussian falloffs make a luminous, naturally blurred core.
    float halo = exp(-pow(distanceToSun / 0.145, 2.0)) * sky;
    float bloom = exp(-pow(distanceToSun / 0.036, 2.0)) * sky;
    float sunCore = exp(-pow(distanceToSun / 0.009, 2.0)) * sky;
    float sunlight = 0.28 + dawn * 0.72;
    color = 1.0 - (1.0 - color) * (1.0 - vec3(1.0, 0.71, 0.39) * halo * 0.24 * sunlight);
    color = mix(color, vec3(1.0, 0.97, 0.86), bloom * 0.66 * sunlight);
    color = mix(color, vec3(1.0, 0.995, 0.955), sunCore * 0.98);
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
      context.uniform1f(timeUniform, reducedMotion.matches ? SUNRISE_SECONDS : elapsed);
      context.uniform1f(motionUniform, reducedMotion.matches ? 0 : 1);
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
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', position: 'absolute', inset: 0 }}
      />
      <canvas
        ref={canvasRef}
        className="landing-scene__canvas"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
