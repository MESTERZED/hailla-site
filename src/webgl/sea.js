// Hero — the Mediterranean as a field of light that rises into Algerian landmarks:
// mer → Maqam Echahid → Tombeau de la Chrétienne → pont Sidi M'Cid → arc de Trajan → dunes de Taghit → mer…
// Loaded on demand from the home view; paused offscreen; never mounted with reduced motion.
import * as THREE from 'three';
import { sea, maqam, tombeau, pont, arc, dunes } from './landmarks.js';

const L = (fr, en, ar) => ({ fr, en, ar });
export const SHAPES = [
  { id: 'sea', fn: sea, wave: 1, place: 0, colA: '#3b7bff', colB: '#86f0e6', hold: 3.6,
    name: L('Méditerranée', 'Mediterranean', 'البحر المتوسط'), where: L('Baie d’Alger', 'Bay of Algiers', 'خليج الجزائر'), lat: 36.7538, lng: 3.0588 },
  { id: 'maqam', fn: maqam, wave: 0, place: 1, colA: '#4ab8d6', colB: '#ffffff', hold: 6,
    name: L('Maqam Echahid', 'Martyrs’ Memorial', 'مقام الشهيد'), where: L('Alger', 'Algiers', 'الجزائر العاصمة'), lat: 36.7458, lng: 3.07 },
  { id: 'tombeau', fn: tombeau, wave: 0, place: 1, colA: '#3aa8c9', colB: '#f3fbff', hold: 4.6,
    name: L('Mausolée royal de Maurétanie', 'Royal Mausoleum of Mauretania', 'الضريح الملكي الموريتاني'), where: L('Tipaza', 'Tipaza', 'تيبازة'), lat: 36.5781, lng: 2.6944 },
  { id: 'pont', fn: pont, wave: 0, place: 1, colA: '#2f7fd8', colB: '#ffffff', hold: 4.6,
    name: L('Pont de Sidi M’Cid', 'Sidi M’Cid Bridge', 'جسر سيدي مسيد'), where: L('Constantine', 'Constantine', 'قسنطينة'), lat: 36.3722, lng: 6.6125 },
  { id: 'arc', fn: arc, wave: 0, place: 1, colA: '#3aa8c9', colB: '#fff4dc', hold: 4.6,
    name: L('Arc de Trajan', 'Arch of Trajan', 'قوس تراجان'), where: L('Timgad', 'Timgad', 'تيمقاد'), lat: 35.4847, lng: 6.4683 },
  { id: 'dunes', fn: dunes, wave: 0, place: 0, colA: '#d99a4e', colB: '#ffe27a', hold: 4.2,
    name: L('Grand Erg occidental', 'Great Western Erg', 'العرق الغربي الكبير'), where: L('Taghit', 'Taghit', 'تاغيت'), lat: 30.9167, lng: -2.0333 },
];
const MORPH = 2.6;

const WAVES = /* glsl */ `
  float waves(vec2 p, float t) {
    float h = sin(dot(p, normalize(vec2(1.0, 0.35))) * 0.55 + t * 0.55) * 0.42;
    h += sin(dot(p, normalize(vec2(-0.6, 1.0))) * 0.9 + t * 0.8) * 0.22;
    h += sin(dot(p, normalize(vec2(0.2, -1.0))) * 1.7 + t * 1.25) * 0.09;
    h += sin(dot(p, normalize(vec2(1.0, 1.0))) * 3.1 + t * 1.9) * 0.035;
    return h;
  }
`;

const morphVertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRand;
  uniform float uTime, uMorph, uSize, uPixelRatio, uSpin, uScale, uAlpha;
  uniform float uWaveFrom, uWaveTo, uPlaceFrom, uPlaceTo;
  uniform vec3 uOffset, uColA0, uColB0, uColA1, uColB1;
  varying vec3 vCol;
  varying float vAlpha;
  ${WAVES}

  vec3 placeIt(vec3 p, float place, float wave) {
    float c = cos(uSpin), s = sin(uSpin);
    vec3 q = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c) * uScale + uOffset;
    p = mix(p, q, place);
    p.y += waves(p.xz, uTime) * wave;
    return p;
  }

  void main() {
    // Each point leaves on its own schedule → the shape dissolves/assembles like spray.
    float d = clamp(uMorph * 1.45 - aRand * 0.45, 0.0, 1.0);
    d = d * d * (3.0 - 2.0 * d);
    vec3 a = placeIt(aFrom, uPlaceFrom, uWaveFrom);
    vec3 b = placeIt(aTo, uPlaceTo, uWaveTo);
    vec3 p = mix(a, b, d);
    p.y += sin(d * 3.14159) * (0.4 + aRand * 1.6);
    p += 0.035 * vec3(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 31.0), sin(uTime * 0.9 + aRand * 23.0));

    float wave = mix(uWaveFrom, uWaveTo, d);
    float tone = mix(clamp((p.y + 0.4) / 6.2, 0.0, 1.0), clamp((p.y + 0.5) / 1.1, 0.0, 1.0), wave);
    vCol = mix(mix(uColA0, uColB0, tone), mix(uColA1, uColB1, tone), d);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.65 + aRand * 0.7) / -mv.z;
    vAlpha = smoothstep(34.0, 9.0, -mv.z) * mix(1.0, uAlpha, 1.0 - wave);
  }
`;

const baseVertex = /* glsl */ `
  attribute float aRand;
  uniform float uTime, uSize, uPixelRatio, uFlat;
  varying vec3 vCol;
  varying float vAlpha;
  uniform vec3 uColA, uColB;
  ${WAVES}
  void main() {
    vec3 p = position;
    float h = waves(p.xz, uTime) * (1.0 - uFlat * 0.75);
    p.y += h;
    vCol = mix(uColA, uColB, clamp((h + 0.5) / 1.1, 0.0, 1.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.7 + aRand * 0.5) / -mv.z;
    vAlpha = smoothstep(36.0, 8.0, -mv.z) * 0.85;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vCol;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vCol, (1.0 - smoothstep(0.15, 0.5, r)) * vAlpha);
  }
`;

const col = (hex) => new THREE.Color(hex);

export function mountSea(host, { onShape } = {}) {
  const small = window.matchMedia('(max-width: 899px)').matches;
  const N = small ? 8000 : 15000;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const pr = renderer.getPixelRatio();

  // Persistent sea surface (the ground every landmark rises from)
  const gx = small ? 90 : 150, gz = small ? 46 : 70;
  const basePos = new Float32Array(gx * gz * 3), baseRand = new Float32Array(gx * gz);
  for (let i = 0; i < gx; i++) for (let j = 0; j < gz; j++) {
    const k = i * gz + j;
    basePos[k * 3] = -18 + (36 * i) / (gx - 1);
    basePos[k * 3 + 1] = -0.25;
    basePos[k * 3 + 2] = -16 + (22 * j) / (gz - 1);
    baseRand[k] = Math.random();
  }
  const baseGeo = new THREE.BufferGeometry();
  baseGeo.setAttribute('position', new THREE.BufferAttribute(basePos, 3));
  baseGeo.setAttribute('aRand', new THREE.BufferAttribute(baseRand, 1));
  const baseUniforms = {
    uTime: { value: 0 }, uSize: { value: 44 }, uPixelRatio: { value: pr }, uFlat: { value: 0 },
    uColA: { value: col('#1f4fc4') }, uColB: { value: col('#4ecdc4') },
  };
  const base = new THREE.Points(baseGeo, new THREE.ShaderMaterial({
    vertexShader: baseVertex, fragmentShader: fragment, uniforms: baseUniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(base);

  // Morphing cloud
  let index = 0;
  const geo = new THREE.BufferGeometry();
  const from = SHAPES[0].fn(N), to = SHAPES[1].fn(N), rnd = new Float32Array(N);
  for (let i = 0; i < N; i++) rnd[i] = Math.random();
  geo.setAttribute('position', new THREE.BufferAttribute(from.slice(), 3)); // bounds only
  geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
  geo.setAttribute('aTo', new THREE.BufferAttribute(to, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  const u = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: small ? 40 : 46 }, uPixelRatio: { value: pr },
    uSpin: { value: 0 }, uScale: { value: small ? 0.82 : 1 }, uAlpha: { value: 1 }, uOffset: { value: new THREE.Vector3() },
    uWaveFrom: { value: 1 }, uWaveTo: { value: 0 }, uPlaceFrom: { value: 0 }, uPlaceTo: { value: 1 },
    uColA0: { value: col(SHAPES[0].colA) }, uColB0: { value: col(SHAPES[0].colB) },
    uColA1: { value: col(SHAPES[1].colA) }, uColB1: { value: col(SHAPES[1].colB) },
  };
  const cloud = new THREE.Points(geo, new THREE.ShaderMaterial({
    vertexShader: morphVertex, fragmentShader: fragment, uniforms: u,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  cloud.frustumCulled = false;
  scene.add(cloud);

  const setTarget = (i) => {
    const s = SHAPES[i];
    geo.attributes.aTo.array.set(s.fn(N));
    geo.attributes.aTo.needsUpdate = true;
    u.uWaveTo.value = s.wave; u.uPlaceTo.value = s.place;
    u.uColA1.value.set(s.colA); u.uColB1.value.set(s.colB);
  };
  const commit = () => {
    geo.attributes.aFrom.array.set(geo.attributes.aTo.array);
    geo.attributes.aFrom.needsUpdate = true;
    u.uWaveFrom.value = u.uWaveTo.value; u.uPlaceFrom.value = u.uPlaceTo.value;
    u.uColA0.value.copy(u.uColA1.value); u.uColB0.value.copy(u.uColB1.value);
    u.uMorph.value = 0;
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const narrow = w < 900;
    camera.fov = narrow ? 52 : 40;
    camera.updateProjectionMatrix();
    // Landmarks sit to the right of the headline on wide screens, centred behind it on phones.
    u.uOffset.value.set(narrow ? 0 : Math.min(5.2, 2.1 * camera.aspect), narrow ? 0.6 : 0, narrow ? -3 : 0);
    u.uScale.value = narrow ? 0.75 : 0.88;
    u.uAlpha.value = narrow ? 0.5 : 1; // behind the copy on phones: keep it in the background
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const target = new THREE.Vector2(), pointer = new THREE.Vector2();
  const onPointer = (e) => {
    const r = host.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let visible = true, raf = 0, last = performance.now(), phase = 'hold', clock = 0, time = 0;
  onShape?.(SHAPES[0]);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) { last = performance.now(); loop(); } }, { threshold: 0 });
  io.observe(host);

  const loop = () => {
    if (!visible || document.hidden) { raf = 0; return; }
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.5); // real time, so the sequence keeps pace even on slow frames
    last = now; time += dt; clock += dt;

    // hold → morph → hold …
    if (phase === 'hold' && clock > SHAPES[index].hold) { phase = 'morph'; clock = 0; onShape?.(SHAPES[(index + 1) % SHAPES.length]); }
    if (phase === 'morph') {
      u.uMorph.value = Math.min(clock / MORPH, 1);
      if (clock >= MORPH) {
        index = (index + 1) % SHAPES.length;
        commit();
        setTarget((index + 1) % SHAPES.length);
        phase = 'hold'; clock = 0;
      }
    }
    const isDunes = SHAPES[index].id === 'dunes' || (phase === 'morph' && SHAPES[(index + 1) % SHAPES.length].id === 'dunes');
    baseUniforms.uFlat.value += ((isDunes ? 1 : 0) - baseUniforms.uFlat.value) * 0.02;

    u.uTime.value = baseUniforms.uTime.value = time;
    u.uSpin.value = Math.sin(time * 0.18) * 0.45;
    pointer.lerp(target, 0.04);
    camera.position.set(pointer.x * 0.9 + Math.sin(time * 0.1) * 0.8, 5.6 + pointer.y * 0.35, 15);
    camera.lookAt(0, 2.3, -1);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  const onVis = () => { if (!document.hidden && visible && !raf) { last = performance.now(); loop(); } };
  document.addEventListener('visibilitychange', onVis);
  loop();
  requestAnimationFrame(() => host.classList.add('is-ready'));

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVis);
    geo.dispose(); cloud.material.dispose(); baseGeo.dispose(); base.material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
