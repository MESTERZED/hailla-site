// Procedural point clouds of Algerian landmarks (y up, ground at y = 0, ~6 units tall).
// Each sampler fills a Float32Array of n × xyz. Shapes are simplified but keep their silhouette.

const TAU = Math.PI * 2;

// Weighted surface sampling: parts = [[weight, fn(out, i)], …]
function sample(n, parts) {
  const arr = new Float32Array(n * 3);
  const total = parts.reduce((a, [w]) => a + w, 0);
  const v = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    let r = Math.random() * total, k = 0;
    while (r > parts[k][0]) { r -= parts[k][0]; k++; }
    parts[k][1](v);
    arr[i * 3] = v[0]; arr[i * 3 + 1] = v[1]; arr[i * 3 + 2] = v[2];
  }
  return arr;
}

const rand = (a, b) => a + Math.random() * (b - a);

// Rotate a sampled cloud around Y so the camera sees it in three-quarter view.
function yaw(arr, a) {
  const c = Math.cos(a), s = Math.sin(a);
  for (let i = 0; i < arr.length; i += 3) {
    const x = arr[i], z = arr[i + 2];
    arr[i] = x * c - z * s;
    arr[i + 2] = x * s + z * c;
  }
  return arr;
}

// ── Mer (Méditerranée) — flat field, waves are added in the shader ──
export function sea(n) {
  return sample(n, [[1, (v) => { v[0] = rand(-17, 17); v[1] = -0.2; v[2] = rand(-14, 6); }]]);
}

// ── Maqam Echahid, Alger — three slender palm leaves rising from a round esplanade, bound near the top
// by the "turban" ring, their pointed tips continuing above it; a soldier statue stands before each leaf.
export function maqam(n) {
  const H = 6.8, RING = 0.66, TIP = 0.8;
  // Leaf axis flares outward at the foot (concave profile) and meets the others at the ring.
  const leafAxis = (t) => (t < RING ? 0.44 + 0.78 * Math.pow(1 - t / RING, 1.8) : 0.44 + 0.12 * ((t - RING) / (1 - RING)));
  const leafWidth = (t) => (t < RING ? 1.05 - 0.5 * (t / RING) : t < TIP ? 0.55 - 0.1 * ((t - RING) / (TIP - RING)) : 0.45 * Math.pow(1 - (t - TIP) / (1 - TIP), 0.9) + 0.01);
  const D = 0.22; // leaf thickness
  const leaf = (k, part) => (v) => {
    const phi = Math.PI / 2 + (k * TAU) / 3;
    const R = [Math.cos(phi), Math.sin(phi)], T = [-Math.sin(phi), Math.cos(phi)];
    const t = Math.pow(Math.random(), 0.9), w = leafWidth(t), r = leafAxis(t);
    let u, d;
    if (part === 'face') { u = rand(-0.5, 0.5) * w; d = (Math.random() < 0.6 ? 0.5 : -0.5) * D - (Math.random() < 0.6 ? 0.07 * (1 - (2 * u / w) ** 2) : 0); }
    else if (part === 'edge') { u = (Math.random() < 0.5 ? -0.5 : 0.5) * w; d = rand(-0.5, 0.5) * D; }
    else { u = rand(-0.02, 0.02); d = 0.5 * D + 0.03; } // central rib on the outer face
    // Leaves are cupped around the axis: width is laid along the arc, not a straight chord.
    const th = phi + u / r;
    v[0] = Math.cos(th) * (r + d);
    v[2] = Math.sin(th) * (r + d);
    v[1] = 0.35 + t * (H - 0.35);
  };
  const ring = (v) => { // banded drum binding the three leaves
    const a = Math.random() * TAU, y0 = 0.35 + RING * (H - 0.35);
    const band = Math.random() < 0.55;
    const y = band ? y0 + [-0.28, -0.1, 0.08, 0.26][Math.floor(Math.random() * 4)] : y0 + rand(-0.3, 0.3);
    const rr = band ? 0.84 : 0.78;
    v[0] = rr * Math.cos(a); v[2] = rr * Math.sin(a); v[1] = y;
  };
  const esplanade = (v) => {
    const a = Math.random() * TAU, p = Math.random();
    if (p < 0.4) { const r = 2.4 * Math.sqrt(Math.random()); v[0] = r * Math.cos(a); v[2] = r * Math.sin(a); v[1] = 0.35; }
    else if (p < 0.75) { v[0] = 2.4 * Math.cos(a); v[2] = 2.4 * Math.sin(a); v[1] = rand(0.18, 0.35); }
    else { v[0] = 2.75 * Math.cos(a); v[2] = 2.75 * Math.sin(a); v[1] = rand(0, 0.18); } // lower step
  };
  const statues = (v) => {
    const k = Math.floor(Math.random() * 3), phi = Math.PI / 2 + (k * TAU) / 3;
    const cx = Math.cos(phi) * 1.75, cz = Math.sin(phi) * 1.75;
    const a = Math.random() * TAU;
    if (Math.random() < 0.82) { const y = rand(0, 1); const rr = 0.13 * (1 - 0.35 * y); v[0] = cx + rr * Math.cos(a); v[2] = cz + rr * Math.sin(a); v[1] = 0.35 + y * 0.7; }
    else { const b = Math.acos(rand(-1, 1)); v[0] = cx + 0.1 * Math.sin(b) * Math.cos(a); v[2] = cz + 0.1 * Math.sin(b) * Math.sin(a); v[1] = 1.13 + 0.1 * Math.cos(b); }
  };
  const flame = (v) => { const a = Math.random() * TAU, r = 0.12 * Math.random(); v[0] = r * Math.cos(a); v[2] = r * Math.sin(a); v[1] = 0.35 + Math.random() * 0.45 * (1 - r * 6); };
  return yaw(sample(n, [
    [0.15, leaf(0, 'face')], [0.15, leaf(1, 'face')], [0.15, leaf(2, 'face')],
    [0.09, leaf(0, 'edge')], [0.09, leaf(1, 'edge')], [0.09, leaf(2, 'edge')],
    [0.015, leaf(0, 'rib')], [0.015, leaf(1, 'rib')], [0.015, leaf(2, 'rib')],
    [0.08, ring], [0.1, esplanade], [0.05, statues], [0.015, flame],
  ]), 0.22);
}

// ── Mausolée royal de Maurétanie (« Tombeau de la Chrétienne »), Tipaza — colonnade + stepped cone ──
export function tombeau(n) {
  const R = 3.1, CYL = 1.35, TOP = 3.9, STEPS = 22, TOPR = 0.75;
  const drum = (v) => {
    const a = Math.random() * TAU;
    const col = Math.abs(Math.sin(a * 30)) > 0.82 ? 0.1 : 0; // 60 engaged columns
    v[0] = (R + col) * Math.cos(a); v[2] = (R + col) * Math.sin(a); v[1] = rand(0, CYL);
  };
  const steps = (v) => {
    const s = Math.floor(Math.random() * STEPS);
    const r0 = R - (s / STEPS) * (R - TOPR), r1 = R - ((s + 1) / STEPS) * (R - TOPR);
    const y0 = CYL + (s / STEPS) * (TOP - CYL), y1 = CYL + ((s + 1) / STEPS) * (TOP - CYL);
    const a = Math.random() * TAU;
    if (Math.random() < 0.5) { v[0] = r0 * Math.cos(a); v[2] = r0 * Math.sin(a); v[1] = rand(y0, y1); } // riser
    else { const r = rand(r1, r0); v[0] = r * Math.cos(a); v[2] = r * Math.sin(a); v[1] = y1; } // tread
  };
  const cap = (v) => { const a = Math.random() * TAU, r = TOPR * Math.sqrt(Math.random()); v[0] = r * Math.cos(a); v[2] = r * Math.sin(a); v[1] = TOP; };
  const ground = (v) => { const a = Math.random() * TAU, r = rand(R, R + 1.4); v[0] = r * Math.cos(a); v[2] = r * Math.sin(a); v[1] = 0; };
  return sample(n, [[0.36, drum], [0.48, steps], [0.03, cap], [0.13, ground]]);
}

// ── Pont de Sidi M'Cid, Constantine — suspension bridge over the Rhumel gorge ──
export function pont(n) {
  const S = 3.8, DECK = 2.1, TOW = 4.5;
  const cableY = (x) => TOW - (TOW - DECK - 0.25) * (1 - (x / S) ** 2);
  const deck = (v) => { v[0] = rand(-S - 1.2, S + 1.2); v[1] = DECK + rand(-0.06, 0.06); v[2] = rand(-0.4, 0.4); };
  const towers = (v) => { v[0] = (Math.random() < 0.5 ? -S : S) + rand(-0.09, 0.09); v[1] = rand(DECK - 0.6, TOW); v[2] = (Math.random() < 0.5 ? -0.42 : 0.42) + rand(-0.06, 0.06); };
  const cables = (v) => {
    const z = Math.random() < 0.5 ? -0.42 : 0.42;
    if (Math.random() < 0.75) { const x = rand(-S, S); v[0] = x; v[1] = cableY(x); }
    else { const side = Math.random() < 0.5 ? -1 : 1, t = Math.random(); v[0] = side * (S + t * 2.3); v[1] = TOW - t * (TOW - DECK - 0.1); }
    v[2] = z;
  };
  const hangers = (v) => {
    const i = Math.floor(rand(-9, 10)), x = (i / 10) * S;
    v[0] = x; v[1] = rand(DECK, cableY(x)); v[2] = Math.random() < 0.5 ? -0.42 : 0.42;
  };
  const cliff = (v) => {
    const side = Math.random() < 0.5 ? -1 : 1, y = rand(-2.6, DECK - 0.1);
    if (Math.random() < 0.7) { // rock face
      const x = S - 0.2 + 0.35 * Math.sin(y * 2.3 + side) + 0.25 * Math.sin(y * 5.1);
      v[0] = side * (x + rand(0, 0.25)); v[1] = y; v[2] = rand(-2.5, 1.6);
    } else { v[0] = side * rand(S, S + 3.2); v[1] = DECK - 0.15 + rand(-0.05, 0.05); v[2] = rand(-2.5, 1.6); } // plateau
  };
  return yaw(sample(n, [[0.12, deck], [0.12, towers], [0.2, cables], [0.08, hangers], [0.48, cliff]]), -0.35);
}

// ── Arc de Trajan, Timgad — three arches, columns and attic ──
export function arc(n) {
  const W = 3, H = 4.4, D = 0.6, ATTIC = 3.55;
  const openings = [[0, 0.95, 3.05], [-2.0, 0.45, 1.95], [2.0, 0.45, 1.95]]; // [cx, half-width, height incl. semicircle]
  const inOpening = (x, y) => openings.some(([cx, hw, h]) => {
    const dx = x - cx; const spring = h - hw;
    return Math.abs(dx) < hw && (y < spring || dx * dx + (y - spring) ** 2 < hw * hw);
  });
  const faces = (v) => {
    let x, y;
    do { x = rand(-W, W); y = rand(0, ATTIC); } while (inOpening(x, y));
    v[0] = x; v[1] = y; v[2] = Math.random() < 0.5 ? D : -D;
  };
  const intrados = (v) => {
    const [cx, hw, h] = openings[Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? 1 : 2];
    const spring = h - hw, z = rand(-D, D);
    if (Math.random() < 0.5) { v[0] = cx + (Math.random() < 0.5 ? -hw : hw); v[1] = rand(0, spring); }
    else { const a = Math.random() * Math.PI; v[0] = cx + hw * Math.cos(a); v[1] = spring + hw * Math.sin(a); }
    v[2] = z;
  };
  const attic = (v) => { v[0] = rand(-W - 0.15, W + 0.15); v[1] = rand(ATTIC, H); v[2] = (Math.random() < 0.5 ? 1 : -1) * (D + 0.12); };
  const columns = (v) => {
    const xs = [-2.75, -1.25, 1.25, 2.75], cx = xs[Math.floor(Math.random() * 4)], a = Math.random() * TAU;
    v[0] = cx + 0.17 * Math.cos(a); v[2] = D + 0.25 + 0.17 * Math.sin(a); v[1] = rand(0, ATTIC - 0.1);
  };
  const ground = (v) => { v[0] = rand(-W - 2, W + 2); v[1] = 0; v[2] = rand(-2.2, 2.6); };
  return yaw(sample(n, [[0.46, faces], [0.12, intrados], [0.12, attic], [0.18, columns], [0.12, ground]]), 0.42);
}

// ── Grand Erg, Taghit — barchan dunes ──
export const duneHeight = (x, z) => {
  const ridge = (cx, cz, a, s) => a * Math.exp(-(((x - cx) / s) ** 2) - (((z - cz) / (s * 1.6)) ** 2)) * (1 + 0.35 * Math.tanh((x - cx) * 1.2));
  return ridge(2.5, -2, 2.6, 2.6) + ridge(-4, -5, 2.1, 2.3) + ridge(7.5, -6, 1.8, 2.2) + ridge(-9, -1, 1.3, 1.8) + 0.18 * Math.sin(x * 1.7 + z * 0.9);
};
export function dunes(n) {
  return sample(n, [[1, (v) => { v[0] = rand(-16, 16); v[2] = rand(-12, 5); v[1] = duneHeight(v[0], v[2]) - 0.2; }]]);
}
