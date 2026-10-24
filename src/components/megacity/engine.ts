/**
 * Megacity Awakening: a 15-second film drawn live with three.js.
 *
 * One unbroken drone shot down a rainy, aging South Asian street at night while a
 * seam of light sweeps it into an AI-connected city. Every frame is a pure function
 * of the timeline position `t` — nothing accumulates between frames except the
 * clock — which is what makes scrubbing, looping and frame-exact capture work.
 *
 * Only HeroFilm loads this module, through a dynamic import, so three.js never
 * lands in the landing page's first bundle.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FILM_DURATION } from "./timeline";

export interface FilmOptions {
    /** Fewer buildings, cars and particles, lower pixel ratio, no MSAA. */
    lite: boolean;
    /** Tone-mapping exposure; 1.2 is the film's own grade. */
    exposure?: number;
    /** Brightness left in the corners by the vignette, 0–1; 0.42 is the film's own grade. */
    vignette?: number;
    onFrame?: (t: number) => void;
    onPlayState?: (playing: boolean) => void;
}

export interface Film {
    play(): void;
    pause(): void;
    restart(): void;
    seek(t: number): void;
    isPlaying(): boolean;
    setScrubbing(on: boolean): void;
    setSound(on: boolean): Promise<boolean>;
    dispose(): void;
}

type Vec3 = [number, number, number];

interface LotSeed { x: number; z: number; w: number; d: number; street?: boolean; back?: boolean; big?: boolean; side?: number }
interface Lot extends LotSeed { oldH: number; newH: number; scale: number; style: number; fs: number; fd: number; gs: number; gd: number; seed: number; landmark?: boolean }
interface PropItem { p: number[]; s?: number[]; c: number[]; yaw?: number; born?: number; gone?: number; em?: number; sway?: number }
interface HoloItem { p: number[]; w: number; h: number; yaw?: number; appear: number; type: number; seed: number; c: THREE.Color }
interface LaneSpec { x: number; dir: number; slow?: boolean }
interface Vehicle {
    ln: LaneSpec; kind: number; w: number; h: number; l: number; x: number; z0: number; vOld: number; vNew: number;
    ph: number; wob: number; ca: number[]; cb: number[]; split: number; T: number; zT: number; lift: boolean; tl: number; ly: number;
}
interface SkyPod { z: number; y: number; x0: number; dir: number; v: number; appear: number }
interface Ped { sd: number; x: number; z0: number; dir: number; v: number; ph: number; h: number; c: number[]; ui: number; uiT: number }
type SkyLane =
    | { ring?: false; a: [number, number]; b: [number, number]; y: number; w: number; t0: number; color: THREE.Color; flip?: boolean }
    | { ring: true; a: [number, number]; r: number; y: number; t0: number; color: THREE.Color };

const HOLD = 1.8;
const LOOP_FADE = 0.45;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease3 = (x: number) => { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const fract = (x: number) => x - Math.floor(x);
const hash = (x: number) => fract(Math.sin(x * 127.1 + 311.7) * 43758.5453);

// The transformation wave races down the main street between 6 s and 10 s.
const WAVE_Z0 = -16;
const WAVE_LEN = 284;
const waveZ = (t: number) => (t <= 6 ? WAVE_Z0 : t >= 10 ? WAVE_Z0 - WAVE_LEN : WAVE_Z0 - (WAVE_LEN * (1 - Math.cos((Math.PI * (t - 6)) / 4))) / 2);
const waveTime = (z: number) => 6 + (4 * Math.acos(1 - 2 * clamp((WAVE_Z0 - z) / WAVE_LEN, 0, 1))) / Math.PI;
const lampSettle = (z: number) => 3.0 + clamp((20 - z) / 100, 0, 1) * 2.8;

const PITCH = 46, MAIN_EDGE = 10.2, AVE_EDGE = 7, CROSS_HALF = 7;
const TEMPLE_Z = -250, PLAZA_R = 42, MAIN_END = -210;
const LAMP_Z0 = 40, LAMP_DZ = 14, LAMP_N = 18, LAMP_X = 6.0, LAMP_Y = 8.3, POLE_X = 7.6;
const ZMIN = -206, ZMAX = 48, ZL = ZMAX - ZMIN;
const wrapZ = (z: number) => ZMIN + ((((z - ZMIN) % ZL) + ZL) % ZL);
const wrapX = (x: number) => -170 + ((((x + 170) % 340) + 340) % 340);

// One unbroken drone move: keys are [time, position, look-at].
const CAM: ReadonlyArray<readonly [number, Vec3, Vec3]> = [
    [0, [0.6, 8.6, 36], [0, 7.4, -60]],
    [3, [0.4, 9.0, 13], [0, 7.8, -84]],
    [6, [-0.2, 10.4, -12], [0, 8.8, -110]],
    [10, [0, 14.0, -54], [0, 13.5, -160]],
    [11.8, [0, 19.5, -76], [0, 24, -200]],
    [13.2, [0, 46, -84], [0, 32, -270]],
    [14.2, [0, 92, -74], [0, 12, -370]],
    [15, [0, 120, -64], [0, 0, -440]],
];

/** Cubic Hermite through the keys with Catmull-Rom tangents; eases to rest on the last key. */
function camTrack(idx: 1 | 2, t: number, out: THREE.Vector3): THREE.Vector3 {
    const n = CAM.length;
    if (t <= CAM[0][0]) return out.fromArray(CAM[0][idx]);
    if (t >= CAM[n - 1][0]) return out.fromArray(CAM[n - 1][idx]);
    let i = 0;
    while (t > CAM[i + 1][0]) i++;
    const tangent = (k: number): number[] => {
        if (k === n - 1) return [0, 0, 0];
        const a = CAM[Math.max(k - 1, 0)], b = CAM[k + 1];
        return b[idx].map((v, j) => (v - a[idx][j]) / (b[0] - a[0]));
    };
    const t0 = CAM[i][0], h = CAM[i + 1][0] - t0, s = (t - t0) / h, s2 = s * s, s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
    const p0 = CAM[i][idx], p1 = CAM[i + 1][idx], m0 = tangent(i), m1 = tangent(i + 1);
    const r = [0, 1, 2].map((j) => h00 * p0[j] + h10 * h * m0[j] + h01 * p1[j] + h11 * h * m1[j]);
    return out.set(r[0], r[1], r[2]);
}

function fovFor(aspect: number): number {
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(48) / 2) * (16 / 9));
    return clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / aspect)), 48, 70);
}

// ------------------------------------------------------------------ shared GLSL
const GL = /* glsl */ `
uniform float uTime;
uniform float uGrade;
uniform float uPx;
uniform vec3 uFogOld;
uniform vec3 uFogNew;
uniform vec3 uSodium;
uniform vec3 uLampNew;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform vec3 uAmber;
uniform vec3 uGold;
uniform vec3 uSkyLow;
uniform vec3 uSkyHigh;
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i); float b = hash12(i + vec2(1.0, 0.0)); float c = hash12(i + vec2(0.0, 1.0)); float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fogFactor(vec3 wp) {
  float d = length(wp - cameraPosition);
  float dens = mix(0.0072, 0.0023, uGrade);
  float f = 1.0 - exp(-pow(d * dens, 1.5));
  float hf = exp(-max(wp.y, 0.0) * mix(0.010, 0.005, uGrade));
  return clamp(f * mix(0.6, 1.0, hf), 0.0, 1.0);
}
vec3 fogApply(vec3 c, vec3 wp) { return mix(c, mix(uFogOld, uFogNew, uGrade), fogFactor(wp)); }
vec3 lampAt(float z) {
  float s = 3.0 + clamp((20.0 - z) / 100.0, 0.0, 1.0) * 2.8;
  return mix(uSodium, uLampNew, smoothstep(s - 0.8, s, uTime));
}
`;
const GLF = /* glsl */ `
float lineAA(float d, float hw) { float fw = max(fwidth(d), 1e-4); return clamp((hw - d) / fw + 0.5, 0.0, 1.0) * min(1.0, 2.0 * hw / fw); }
`;

const BUILDING_V = GL + /* glsl */ `
attribute vec2 aH; attribute vec4 aT; attribute vec4 aM;
varying vec3 vW; varying vec3 vN; varying vec2 vF; varying float vFW; varying vec2 vRD;
varying vec4 vT; varying vec4 vM; varying float vH; varying float vOldH; varying float vG; varying float vSF;
float e3(float x) { x = clamp(x, 0.0, 1.0); return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
void main() {
  float g = e3((uTime - aT.z) / aT.w);
  float h = mix(aH.x, aH.y, g);
  float sc = mix(1.0, aM.w, g);
  vec3 p = position; p.xz *= sc; p.y *= h;
  vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vW = wp.xyz; vN = normal;
  float w = length(instanceMatrix[0].xyz) * sc;
  float d = length(instanceMatrix[2].xyz) * sc;
  vRD = vec2(w, d);
  if (abs(normal.x) > 0.5) { vF = vec2((position.z + 0.5) * d, p.y); vFW = d; }
  else if (abs(normal.z) > 0.5) { vF = vec2((position.x + 0.5) * w, p.y); vFW = w; }
  else { vF = vec2((position.x + 0.5) * w, (position.z + 0.5) * d); vFW = w; }
  float cx = instanceMatrix[3].x;
  vSF = (aM.z > 0.5 && normal.x * sign(cx) < -0.5) ? 1.0 : 0.0;
  vT = aT; vM = aM; vH = h; vOldH = aH.x; vG = g;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const BUILDING_F = GL + GLF + /* glsl */ `
varying vec3 vW; varying vec3 vN; varying vec2 vF; varying float vFW; varying vec2 vRD;
varying vec4 vT; varying vec4 vM; varying float vH; varying float vOldH; varying float vG; varying float vSF;
vec3 shopOld(float u, float v, float seed) {
  float si = floor(u / 3.6); float su = fract(u / 3.6);
  float h = hash12(vec2(si + seed * 13.0, 7.7));
  vec3 inside = (hash12(vec2(si, seed * 3.0)) > 0.72 ? vec3(0.85, 0.92, 0.82) : vec3(1.0, 0.60, 0.28)) * (0.55 + 0.55 * h);
  float gh = hash12(vec2(floor(su * 7.0) + si * 7.0, floor(v * 2.2) + seed * 5.0));
  vec3 goods = mix(vec3(0.9, 0.35, 0.18), vec3(0.25, 0.55, 0.50), gh) * 0.55;
  vec3 c = mix(inside, goods * inside * 1.6, 0.5 * step(0.35, v) * step(v, 2.3));
  float shutterTop = 2.95 - 0.85 * h;
  if (v > shutterTop) c = vec3(0.045, 0.04, 0.035) * (0.6 + 0.4 * step(0.5, fract(v * 6.0)));
  if (h < 0.22) c = vec3(0.035, 0.032, 0.03) * (0.65 + 0.35 * step(0.5, fract(v * 7.0)));
  float dv = step(su, 0.035) + step(0.965, su);
  return mix(c, vec3(0.015), clamp(dv, 0.0, 1.0));
}
vec3 signOld(float u, float v, float seed) {
  float si = floor(u / 3.6);
  float h = hash12(vec2(si * 1.7 + seed * 3.0, 1.3));
  vec3 pal = h < 0.25 ? vec3(0.78, 0.22, 0.14) : h < 0.5 ? vec3(0.95, 0.74, 0.22) : h < 0.75 ? vec3(0.16, 0.52, 0.52) : vec3(0.86, 0.84, 0.78);
  vec3 c = pal * 0.16;
  float s = step(0.5, hash12(vec2(floor(u * 2.6), floor((v - 3.25) * 3.0)) + h * 10.0));
  c *= (0.75 + 0.25 * s) * (0.7 + 0.3 * vnoise(vec2(u * 3.0, v * 9.0)));
  return c;
}
void main() {
  vec3 n = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float seed = vM.x; float style = vM.y;
  float facadeP = clamp((uTime - vT.x) / vT.y, 0.0, 1.0);
  vec3 accent = style > 2.5 ? uViolet : ((style > 0.5 && style < 1.5) ? uAmber : uCyan);
  vec3 colr;
  if (n.y > 0.5) {
    vec2 ru = vF;
    float de = min(min(ru.x, vRD.x - ru.x), min(ru.y, vRD.y - ru.y));
    vec3 oldR = vec3(0.022, 0.019, 0.017) * (0.6 + 0.6 * vnoise(ru * 0.6 + seed * 20.0));
    vec3 newR = vec3(0.004, 0.006, 0.011) + accent * lineAA(de, 0.22) * 1.1;
    if (style > 1.5 && style < 2.5) newR += vec3(0.01, 0.05, 0.02) * step(1.5, de) * vnoise(ru * 1.5);
    if (vH > 110.0) { float rr = length(ru - vRD * 0.5); newR += uAmber * lineAA(abs(rr - min(vRD.x, vRD.y) * 0.3), 0.25) * 0.9; }
    float rc = max(step(0.999, facadeP), step(0.002, vG));
    colr = mix(oldR, newR, rc);
  } else {
    float u = vF.x; float v = vF.y;
    float row = floor(v / 3.2);
    float ci = floor(u / 2.4);
    vec2 cell = vec2(fract(u / 2.4), fract(v / 3.2));
    float rowsOld = max(1.0, floor(vOldH / 3.2));
    float r = hash12(vec2(ci + seed * 31.7, row + seed * 17.3));
    float cellT = (row / rowsOld) * 0.82 + r * 0.18;
    float conv = row >= rowsOld ? 1.0 : step(cellT, facadeP);
    // aging concrete, warm windows, shops and faded painted signs
    float hb = hash12(vec2(seed * 7.1, 3.3));
    vec3 pastel = hb < 0.2 ? vec3(0.50, 0.60, 0.46) : hb < 0.4 ? vec3(0.66, 0.46, 0.42) : hb < 0.6 ? vec3(0.46, 0.56, 0.64) : hb < 0.8 ? vec3(0.68, 0.60, 0.44) : vec3(0.60, 0.57, 0.52);
    vec3 L = lampAt(vW.z);
    float lampLit = exp(-pow((v - 7.0) / 6.5, 2.0)) * (vSF > 0.5 ? 0.6 : 0.12);
    float stain = 0.55 + 0.45 * smoothstep(0.25, 0.75, vnoise(vec2(u * 1.6 + seed * 10.0, v * 0.13)));
    vec3 wall = pastel * (0.05 + L * lampLit * 0.22) * stain;
    wall *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.05, cell.y));
    vec3 oldC = wall;
    bool win = cell.x > 0.22 && cell.x < 0.78 && cell.y > 0.30 && cell.y < 0.84 && row >= 1.0;
    if (win) {
      float lit = hash12(vec2(ci * 1.37 + seed * 5.1, row * 2.9 + seed));
      float k = hash12(vec2(ci + 4.0, row * 3.1 + seed * 9.0));
      oldC = vec3(0.010, 0.009, 0.010) + wall * 0.25;
      if (lit > 0.68) {
        oldC = k > 0.8 ? vec3(0.62, 0.82, 0.74) * 0.38 : vec3(1.0, 0.55, 0.22) * (0.35 + 0.55 * k);
        oldC *= 0.72 + 0.28 * step(0.5, fract(cell.x * 7.0));
      }
    }
    if (vSF > 0.5 && v < 3.2) oldC = shopOld(u, v, seed);
    if (vSF > 0.5 && v > 3.25 && v < 4.35) oldC = signOld(u, v, seed);
    // smart glass
    vec3 Rf = reflect(-V, n);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    vec3 skyR = mix(uSkyLow, uSkyHigh, clamp(Rf.y * 1.6, 0.0, 1.0));
    vec3 newC = vec3(0.002, 0.003, 0.007) + skyR * (0.06 + fres * 0.5);
    float dFl = abs(fract(v / 3.2 + 0.5) - 0.5) * 3.2;
    float dMu = abs(fract(u / 1.2 + 0.5) - 0.5) * 1.2;
    newC += accent * lineAA(dFl, 0.04) * 0.16;
    newC += vec3(0.02, 0.03, 0.04) * lineAA(dMu, 0.025);
    // lit floors read as horizontal bands, the way real towers glow at night
    float glaze = step(0.12, cell.y) * step(cell.y, 0.86);
    float fr = hash12(vec2(row * 1.7 + seed * 11.0, seed * 3.0));
    float pool = 0.55 + 0.45 * vnoise(vec2(u * 0.35 + seed * 7.0, row * 3.1));
    vec3 inner = mix(vec3(0.42, 0.55, 0.72), vec3(1.0, 0.72, 0.42), step(0.92, fr)) * 0.11 * pool;
    newC += inner * step(0.62, fr) * glaze;
    float ri = hash12(vec2(ci * 2.3 + seed * 9.0, row * 1.7 + seed * 4.0));
    if (ri > 0.985) newC += uAmber * 0.3 * glaze;
    else if (ri > 0.975) newC += uViolet * 0.28 * glaze;
    vec2 jq = vec2(u, v) * 0.9;
    float lat = max(lineAA(abs(fract(jq.x + jq.y) - 0.5), 0.035), lineAA(abs(fract(jq.x - jq.y) - 0.5), 0.035));
    float de = min(u, vFW - u);
    float edgeL = lineAA(de, 0.08);
    float floorStrip = lineAA(abs(v - 3.1), 0.05);
    if (style > 0.5 && style < 1.5) {
      newC = mix(newC, uAmber * 0.3, lat * 0.35);
    } else if (style > 1.5 && style < 2.5) {
      float gcol = step(0.62, hash12(vec2(floor(u / 3.6) + seed * 3.0, 2.0)));
      float leaf = hash12(floor(vec2(u, v) * 2.5) + seed * 9.0);
      vec3 green = vec3(0.006, 0.022, 0.012) * (0.6 + 0.8 * leaf) + vec3(0.05, 0.3, 0.14) * 0.12 * step(0.93, leaf);
      newC = mix(newC, green, gcol * glaze * 0.9);
    }
    newC += accent * edgeL * 1.3;
    newC += accent * (1.0 - smoothstep(0.0, 1.3, vH - v)) * 0.8 * step(24.0, vH);
    if (vSF > 0.5 && v < 3.2) {
      newC = vec3(0.30, 0.42, 0.50) * 0.5 + vec3(0.6, 0.75, 0.85) * 0.12 * step(0.5, fract(u / 0.9));
      newC += uCyan * floorStrip * 0.9;
    }
    if (vSF > 0.5 && v > 3.25 && v < 4.35) {
      float fl = 0.5 + 0.5 * sin(u * 0.7 - uTime * 1.4 + seed * 6.0);
      newC = mix(uCyan, uViolet, fl) * 0.75 + uAmber * 0.25 * step(0.85, fl);
    }
    colr = mix(oldC, newC, conv);
    // the panel being converted right now draws a bright outline
    float ed = min(min(cell.x, 1.0 - cell.x) * 2.4, min(cell.y, 1.0 - cell.y) * 3.2);
    float outline = 1.0 - smoothstep(0.0, 0.12, ed);
    float turning = (1.0 - smoothstep(0.0, 0.07, abs(facadeP - cellT))) * step(row, rowsOld - 1.0) * step(0.0001, facadeP) * step(facadeP, 0.9999);
    colr += uCyan * turning * (outline * 2.8 + 0.18);
  }
  gl_FragColor = vec4(fogApply(colr, vW), 1.0);
}`;

const GROUND_F = GL + GLF + /* glsl */ `
uniform float uWaveZ;
varying vec3 vW;
float waveTime(float z) { float x = clamp((-16.0 - z) / 284.0, 0.0, 1.0); return 6.0 + 4.0 * acos(1.0 - 2.0 * x) / 3.14159265; }
vec3 lampRefl(vec2 p) {
  vec3 acc = vec3(0.0);
  vec3 cam = cameraPosition;
  float hc = max(cam.y, 0.5);
  float kf = (hc + 8.3) / hc;
  for (int s = 0; s < 2; s++) {
    float lx = s == 0 ? -6.0 : 6.0;
    float xr = cam.x + (lx - cam.x) / kf;
    float zl = cam.z + (p.y - cam.z) * kf;
    float k0 = floor((40.0 - zl) / 14.0);
    for (int j = 0; j < 2; j++) {
      float k = k0 + float(j);
      if (k < 0.0 || k > 17.0) continue;
      float zk = 40.0 - k * 14.0;
      float zr = cam.z + (zk - cam.z) / kf;
      float dist = abs(zk - cam.z) + 2.0;
      float dz = (p.y - zr) / (0.5 + dist * 0.05);
      float dx = (p.x - xr) / (0.22 + dist * 0.004);
      acc += lampAt(zk) * exp(-dx * dx - dz * dz);
    }
  }
  return acc;
}
vec3 lampPools(vec2 p) {
  vec3 acc = vec3(0.0);
  float kk = floor((40.0 - p.y) / 14.0);
  for (int j = 0; j < 2; j++) {
    float k = kk + float(j);
    if (k < 0.0 || k > 17.0) continue;
    float zk = 40.0 - k * 14.0;
    vec2 d1 = p - vec2(-6.0, zk);
    vec2 d2 = p - vec2(6.0, zk);
    acc += lampAt(zk) * (exp(-dot(d1, d1) / 22.0) + exp(-dot(d2, d2) / 22.0));
  }
  return acc;
}
void main() {
  vec2 p = vW.xz; float x = p.x; float z = p.y; float ax = abs(x);
  float mainZ = step(-210.0, z) * step(z, 90.0);
  float onMain = mainZ * step(ax, 10.2);
  float mainRoad = mainZ * step(ax, 7.0);
  float dAv = abs(fract(x / 46.0 + 0.5) - 0.5) * 46.0;
  float dCr = abs(fract((z + 23.0) / 46.0 + 0.5) - 0.5) * 46.0;
  float dT = length(p - vec2(0.0, -250.0));
  float plaza = step(dT, 42.0);
  float road = max(step(dAv, 5.0), step(dCr, 5.0));
  float walk = max(step(dAv, 7.0), step(dCr, 7.0)) * (1.0 - road);
  float tc;
  if (onMain > 0.5) tc = waveTime(z);
  else if (plaza > 0.5) tc = 10.0 + dT / 42.0 * 0.9;
  else tc = 8.3 + clamp(ax / 380.0, 0.0, 1.0) * 2.3 + clamp((-210.0 - z) / 500.0, 0.0, 1.0) * 0.7 + clamp((z - 60.0) / 200.0, 0.0, 1.0) * 0.6;
  float conv = smoothstep(tc, tc + 0.35, uTime);
  float grit = 0.7 + 0.6 * vnoise(p * 1.4);
  float wet = smoothstep(0.42, 0.72, vnoise(p * 0.16 + 3.0));
  float dash = step(0.55, fract(z / 7.0)) * lineAA(ax, 0.07);
  float edgeL = lineAA(abs(ax - 6.85), 0.06);
  float laneL = lineAA(abs(ax - 3.5), 0.05);
  float centL = lineAA(abs(ax - 0.2), 0.04);
  float curbL = lineAA(abs(ax - 10.0), 0.05);
  float alongAv = step(dAv, 5.0);
  float dC = alongAv > 0.5 ? dAv : dCr;
  float traceL = lineAA(dC, 0.11);
  float kerbL = lineAA(abs(dC - 4.8), 0.07);
  float padL = lineAA(abs(max(dAv, dCr) - 3.6), 0.07);
  float ringL = lineAA(abs(fract(dT / 7.0 + 0.5) - 0.5) * 7.0, 0.06);
  float pulseR = lineAA(abs(fract((dT - uTime * 7.0) / 28.0 + 0.5) - 0.5) * 28.0, 0.35);
  vec3 refl = lampRefl(p);
  vec3 pools = lampPools(p);
  vec3 oldC = vec3(0.012, 0.011, 0.010) * grit;
  if (mainRoad > 0.5) {
    oldC = vec3(0.014, 0.012, 0.011) * grit + vec3(dash * 0.05);
    oldC += refl * (0.22 + 0.78 * wet) * (0.75 + 0.5 * vnoise(vec2(x * 6.0, z * 0.9)));
    oldC += pools * 0.16;
  } else if (onMain > 0.5) {
    oldC = vec3(0.026, 0.023, 0.020) * grit + vec3(1.0, 0.58, 0.26) * 0.10 * exp(-(10.2 - ax) * 0.9) + pools * 0.2;
  } else if (road > 0.5) {
    float pz = abs(fract(x / 14.0) - 0.5) * 14.0;
    oldC = vec3(0.010, 0.009, 0.008) * grit + uSodium * 0.05 * exp(-pz * pz / 14.0) * step(dCr, 5.0) * step(ax, 60.0);
  }
  if (plaza > 0.5) oldC = vec3(0.02, 0.018, 0.016) * grit;
  vec3 newC = vec3(0.004, 0.005, 0.010);
  if (mainRoad > 0.5) {
    float dir = x < 0.0 ? 1.0 : -1.0;
    float flow = fract((z + dir * uTime * 16.0) / 9.0);
    float dashes = smoothstep(0.0, 0.12, flow) * (1.0 - smoothstep(0.3, 0.42, flow));
    float lc = min(abs(ax - 1.9), abs(ax - 5.1));
    newC = vec3(0.004, 0.006, 0.013) + refl * 0.28 + pools * 0.08 + uCyan * (edgeL + laneL * dashes * 1.5 + 0.04 * exp(-lc * lc * 1.4)) + uViolet * centL * 0.9;
  } else if (onMain > 0.5) {
    newC = vec3(0.012, 0.014, 0.022) + pools * 0.1 + uCyan * curbL * 0.7;
  } else if (road > 0.5) {
    float idx = alongAv > 0.5 ? floor(x / 46.0 + 0.5) : floor((z + 23.0) / 46.0 + 0.5);
    float coord = alongAv > 0.5 ? z : x;
    float sgn = hash11(idx * 7.3 + 1.0) > 0.5 ? 1.0 : -1.0;
    float pf = fract((coord + sgn * uTime * 22.0) / 70.0 + hash11(idx * 3.1 + 2.0));
    float pulse = smoothstep(0.0, 0.03, pf) * (1.0 - smoothstep(0.03, 0.22, pf));
    float inter = step(dAv, 5.0) * step(dCr, 5.0);
    newC += uCyan * traceL * (0.22 + 1.6 * pulse) + uViolet * kerbL * 0.3 + uAmber * padL * 0.5 * inter;
  } else if (walk > 0.5) {
    newC = vec3(0.008, 0.009, 0.015);
  }
  if (plaza > 0.5) newC = vec3(0.010, 0.008, 0.006) + uGold * (ringL * 0.18 + pulseR * 0.6 * (1.0 - smoothstep(10.0, 42.0, dT)));
  vec3 c = mix(oldC, newC, conv);
  float live = step(6.0, uTime) * step(uTime, 10.3) * onMain;
  c += uCyan * exp(-pow(z - uWaveZ, 2.0)) * 2.6 * live;
  c += uCyan * exp(-max(z - uWaveZ, 0.0) * 0.08) * step(uWaveZ, z) * 0.10 * live;
  gl_FragColor = vec4(fogApply(c, vW), 1.0);
}`;

const SKY_F = GL + /* glsl */ `
uniform vec3 uOldH; uniform vec3 uOldZ; uniform vec3 uNewH; uniform vec3 uNewZ;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float e = d.y;
  vec3 oldS = mix(uOldH, uOldZ, smoothstep(-0.03, 0.42, e));
  float cl = vnoise(d.xz / max(e + 0.25, 0.08) * 2.2 + vec2(uTime * 0.01, 0.0));
  oldS += vec3(0.10, 0.045, 0.015) * smoothstep(0.35, 0.8, cl) * smoothstep(0.0, 0.25, e) * (1.0 - smoothstep(0.25, 0.7, e));
  vec3 newS = mix(uNewH, uNewZ, smoothstep(-0.03, 0.5, e));
  float band = exp(-abs(e - 0.005) * 26.0);
  newS += (uCyan * 0.10 + uViolet * 0.09) * band;
  oldS += vec3(0.16, 0.07, 0.02) * band * 0.6;
  vec3 c = mix(oldS, newS, uGrade);
  if (e > 0.03) {
    vec3 sp = d * 260.0;
    float h = hash13(floor(sp));
    if (h > 0.9975) { vec3 f = fract(sp) - 0.5; c += vec3(0.75, 0.85, 1.0) * exp(-dot(f, f) * 60.0) * 0.55 * uGrade * smoothstep(0.03, 0.25, e); }
  }
  gl_FragColor = vec4(c, 1.0);
}`;

const PROP_V = GL + /* glsl */ `
attribute vec3 aC; attribute vec4 aX;
varying vec3 vC; varying vec3 vW; varying vec3 vN; varying float vEm;
void main() {
  float s = smoothstep(aX.x, aX.x + 0.3, uTime) * (1.0 - smoothstep(aX.y, aX.y + 0.25, uTime));
  vec4 wp = modelMatrix * instanceMatrix * vec4(position * s, 1.0);
  wp.x += aX.w * sin(uTime * 1.6 + wp.z * 0.8) * 0.07 * (0.5 - position.y) * s;
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  vC = aC; vEm = aX.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const PROP_F = GL + /* glsl */ `
varying vec3 vC; varying vec3 vW; varying vec3 vN; varying float vEm;
void main() {
  vec3 n = normalize(vN);
  vec3 L = lampAt(vW.z);
  float nearSt = exp(-pow(max(abs(vW.x) - 6.0, 0.0) / 7.0, 2.0));
  float hl = exp(-pow((vW.y - 6.0) / 7.5, 2.0));
  float lit = 0.05 + 0.24 * hl * nearSt * (0.65 + 0.35 * max(n.y, 0.0));
  vec3 c = vC * lit * (0.35 + L * 0.65) + vC * vEm;
  gl_FragColor = vec4(fogApply(c, vW), 1.0);
}`;

const HOLO_V = GL + /* glsl */ `
attribute vec4 aHolo; attribute vec3 aCol;
varying vec2 vUv; varying vec4 vH; varying vec3 vC; varying float vFog;
void main() {
  vUv = uv; vH = aHolo; vC = aCol;
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vFog = fogFactor(wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const HOLO_F = GL + /* glsl */ `
varying vec2 vUv; varying vec4 vH; varying vec3 vC; varying float vFog;
float ring(float r, float rad, float w) { return 1.0 - smoothstep(0.0, w, abs(r - rad)); }
void main() {
  float app = smoothstep(vH.x, vH.x + 0.8, uTime);
  if (app <= 0.0) discard;
  vec2 uv = vUv;
  float hh = app * 0.5;
  float dy = abs(uv.y - 0.5);
  if (dy > hh + 0.003) discard;
  float wipe = exp(-pow((dy - hh) * 70.0, 2.0)) * (1.0 - app) * 3.0;
  float tt = uTime + vH.z * 10.0;
  float asp = vH.w;
  vec2 q = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
  float border = 1.0 - smoothstep(0.0, 0.022, min(min(uv.x, 1.0 - uv.x) * asp, min(uv.y, 1.0 - uv.y)));
  float content = 0.0;
  float ty = vH.y;
  vec3 tint = vC;
  if (ty < 0.5) {
    vec2 c = q - vec2(0.0, 0.1);
    float r = length(c);
    float ang = atan(c.y, c.x);
    content += ring(r, 0.20, 0.012) + ring(r, 0.12, 0.01) * 0.7;
    content += ring(r, 0.28, 0.01) * step(0.0, sin(ang * 3.0 + tt * 0.8)) * 0.8;
    for (int i = 0; i < 3; i++) { float yy = -0.30 + float(i) * 0.065; float len = 0.18 + 0.16 * hash11(float(i) + vH.z * 7.0); content += step(abs(q.y - yy), 0.013) * step(abs(q.x), len) * 0.55; }
  } else if (ty < 1.5) {
    float bi = floor(uv.x * 7.0); float bf = fract(uv.x * 7.0);
    float hgt = 0.22 + 0.55 * (0.5 + 0.5 * sin(tt * 1.1 + bi * 1.3));
    float bar = step(0.2, bf) * step(bf, 0.8);
    content += bar * step(0.1, uv.y) * step(uv.y, hgt) * 0.6;
    content += bar * (1.0 - smoothstep(0.0, 0.012, abs(uv.y - hgt)));
  } else if (ty < 2.5) {
    vec2 g = vec2(uv.x * 5.0, uv.y * 9.0);
    vec2 gi = floor(g); vec2 gf = fract(g);
    float on = step(0.42, hash12(gi + floor(tt * 0.7) * 0.37 + vH.z * 13.0));
    vec2 sb = floor(gf * 3.0);
    float stroke = step(0.5, hash12(gi * 3.1 + sb + vH.z)) * step(0.15, gf.x) * step(gf.x, 0.85) * step(0.2, gf.y) * step(gf.y, 0.8);
    content += on * stroke * 0.8;
  } else if (ty < 3.5) {
    vec2 c = q - vec2(0.0, 0.08);
    float r = length(c);
    content += (1.0 - smoothstep(0.0, 0.24, r)) * 0.9;
    content += ring(r, 0.27, 0.012) * 0.8;
    content += step(abs(q.y + 0.33), 0.016) * step(abs(q.x), 0.26) * 0.7;
    tint = mix(vC, uAmber, 0.25);
  } else {
    content += step(0.74, uv.y) * step(uv.y, 0.86) * 0.55;
    for (int i = 0; i < 3; i++) { float yy = 0.54 - float(i) * 0.17; content += step(abs(uv.y - yy), 0.045) * step(0.12, uv.x) * step(uv.x, 0.15 + 0.6 * hash11(float(i) + vH.z * 3.0)) * 0.55; }
  }
  float scan = 0.82 + 0.18 * sin(uv.y * 150.0 - uTime * 4.0);
  float sweep = exp(-pow((fract(uv.y - uTime * 0.18 + vH.z) - 0.5) * 8.0, 2.0)) * 0.25;
  float a = (0.06 + content * 0.85 + border * 0.95 + sweep) * scan;
  a = a * smoothstep(0.0, 0.35, app) + wipe;
  gl_FragColor = vec4(tint * a * 1.5 * (1.0 - vFog), 1.0);
}`;

const TEMPLE_F = GL + /* glsl */ `
varying vec3 vW; varying vec3 vN;
void main() {
  vec3 n = normalize(vN);
  vec2 rel = vW.xz - vec2(0.0, -250.0);
  float ang = atan(rel.y, rel.x);
  float ribs = 0.35 + 0.65 * pow(abs(cos(ang * 12.0)), 0.7);
  float tiers = 0.7 + 0.3 * step(0.35, fract(vW.y / 1.75));
  vec3 stone = vec3(0.32, 0.25, 0.18);
  vec3 oldC = stone * (0.03 + 0.06 * exp(-vW.y / 5.0)) * ribs * tiers;
  float litH = mix(-2.0, 50.0, smoothstep(10.2, 12.3, uTime));
  float lit = 1.0 - smoothstep(litH - 5.0, litH + 0.5, vW.y);
  vec3 radial = normalize(vec3(rel.x, 0.0, rel.y) + 1e-4);
  float wrapL = 0.55 + 0.45 * max(dot(n, radial), 0.0);
  vec3 goldC = uGold * (0.16 + 0.5 * clamp(1.1 - vW.y / 55.0, 0.0, 1.0)) * ribs * tiers * wrapL;
  float rim = pow(1.0 - abs(dot(n, normalize(cameraPosition - vW))), 2.5);
  goldC += uGold * rim * 0.35;
  vec3 c = mix(oldC, goldC, lit);
  c += uGold * exp(-pow((vW.y - litH) / 0.7, 2.0)) * 2.2 * step(10.2, uTime) * step(uTime, 12.5);
  gl_FragColor = vec4(fogApply(c, vW), 1.0);
}`;

const VEHICLE_V = /* glsl */ `
attribute vec3 aCA; attribute vec3 aCB; attribute vec4 aV;
varying vec3 vCA; varying vec3 vCB; varying vec4 vV; varying vec3 vL; varying vec3 vN; varying vec3 vW;
void main() { vCA = aCA; vCB = aCB; vV = aV; vL = position; vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`;
const VEHICLE_F = GL + /* glsl */ `
varying vec3 vCA; varying vec3 vCB; varying vec4 vV; varying vec3 vL; varying vec3 vN; varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  float y = vL.y; float kind = vV.y;
  vec3 base = y < vV.x ? vCA : vCB;
  vec3 em = vec3(0.0);
  float sideF = step(abs(n.y), 0.5);
  if (kind > 1.5 && kind < 2.5) {
    float wb = step(0.52, y) * step(y, 0.82) * sideF;
    em += vec3(1.0, 0.70, 0.40) * 0.42 * wb * step(0.12, fract(vL.z * 7.0 + 0.5));
    base = mix(base, vec3(0.03), wb);
  } else if (kind > 0.5 && kind < 1.5) {
    base = mix(base, vec3(0.015, 0.02, 0.025), step(0.58, y) * step(y, 0.93) * sideF);
  } else if (kind < 0.5) {
    base = mix(base, vec3(0.012), step(0.42, y) * step(y, 0.88) * step(0.5, abs(n.x)) * 0.85);
  }
  vec3 L = lampAt(vW.z);
  vec3 c = base * (0.05 + L * (0.12 + 0.3 * max(n.y, 0.0))) + em;
  gl_FragColor = vec4(fogApply(c, vW), 1.0);
}`;
const POD_V = /* glsl */ `
varying vec3 vW; varying vec3 vN; varying vec3 vL;
void main() { vL = position; vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`;
const POD_F = GL + GLF + /* glsl */ `
varying vec3 vW; varying vec3 vN; varying vec3 vL;
void main() {
  vec3 n = normalize(vN); vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  float belt = lineAA(abs(vL.y - 1.1), 0.06);
  vec3 body = vec3(0.10, 0.11, 0.13) * (0.5 + 0.5 * max(n.y, 0.0)) + uSkyLow * 0.5 * fres + vec3(0.05) * fres;
  body = mix(body, vec3(0.01, 0.015, 0.03) + uCyan * 0.1 * fres, step(1.45, vL.y) * 0.8);
  body += uCyan * belt * 1.6;
  gl_FragColor = vec4(fogApply(body, vW), 1.0);
}`;

const GLOW_V = GL + /* glsl */ `
attribute vec3 aCol; attribute float aSize; attribute float aStreak; varying vec3 vCol; varying float vStreak;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float px = aSize * uPx / max(-mv.z, 0.1);
  gl_PointSize = clamp(px, 1.5, 320.0);
  vCol = aCol * (1.0 - fogFactor(position)) * clamp(px / 1.5, 0.0, 1.0);
  vStreak = aStreak;
}`;
const GLOW_F = /* glsl */ `
varying vec3 vCol; varying float vStreak;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  float a = exp(-r2 * 22.0) + exp(-r2 * 4.5) * 0.18 + exp(-p.y * p.y * 600.0) * pow(max(1.0 - abs(p.x), 0.0), 1.5) * vStreak * 0.35;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vCol * a, 1.0);
}`;

const FINISH_SHADER = {
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime; uniform float uGrain; uniform float uFade; uniform float uGrade;
    uniform vec3 uFlare; uniform vec3 uFlareCol; uniform float uVig;
    varying vec2 vUv;
    float h2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 dc = vUv - 0.5;
      vec2 off = dc * dot(dc, dc) * 0.012;
      vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      c = mix(c * vec3(1.05, 0.98, 0.88) + vec3(0.010, 0.004, 0.0), c * vec3(0.95, 1.0, 1.06) + vec3(0.0, 0.002, 0.008), uGrade);
      float vig = 1.0 - smoothstep(0.2, 1.0, length(dc * vec2(1.0, 0.9)) * 1.25);
      c *= mix(uVig, 1.0, vig);
      float asp = uRes.x / uRes.y;
      float dy = vUv.y - uFlare.y; float dx = (vUv.x - uFlare.x) * asp;
      c += uFlareCol * (exp(-dy * dy * 14000.0) * exp(-abs(dx) * 1.6) * 0.55 + exp(-(dx * dx + dy * dy) * 90.0) * 0.4) * uFlare.z;
      c += (h2(vUv * uRes + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain;
      gl_FragColor = vec4(c * uFade, 1.0);
    }`,
};

/** Additive sprites for lamps, head and tail lights, beacons and diyas, refilled every frame. */
class Glow {
    private i = 0;
    private readonly pos: Float32Array;
    private readonly col: Float32Array;
    private readonly sz: Float32Array;
    private readonly st: Float32Array;
    private readonly geo = new THREE.BufferGeometry();
    private readonly attrs: THREE.BufferAttribute[];

    constructor(scene: THREE.Scene, material: THREE.ShaderMaterial, private readonly n: number) {
        this.pos = new Float32Array(n * 3);
        this.col = new Float32Array(n * 3);
        this.sz = new Float32Array(n);
        this.st = new Float32Array(n);
        const named: [string, THREE.BufferAttribute][] = [
            ["position", new THREE.BufferAttribute(this.pos, 3)],
            ["aCol", new THREE.BufferAttribute(this.col, 3)],
            ["aSize", new THREE.BufferAttribute(this.sz, 1)],
            ["aStreak", new THREE.BufferAttribute(this.st, 1)],
        ];
        for (const [name, a] of named) {
            a.setUsage(THREE.DynamicDrawUsage);
            this.geo.setAttribute(name, a);
        }
        this.attrs = named.map(([, a]) => a);
        const points = new THREE.Points(this.geo, material);
        points.frustumCulled = false;
        points.renderOrder = 6;
        scene.add(points);
    }

    begin() {
        this.i = 0;
    }

    add(x: number, y: number, z: number, r: number, g: number, b: number, size: number, streak: number) {
        if (this.i >= this.n || r + g + b < 0.004) return;
        const i = this.i++, j = i * 3;
        this.pos[j] = x; this.pos[j + 1] = y; this.pos[j + 2] = z;
        this.col[j] = r; this.col[j + 1] = g; this.col[j + 2] = b;
        this.sz[i] = size;
        this.st[i] = streak;
    }

    end() {
        this.geo.setDrawRange(0, this.i);
        for (const a of this.attrs) a.needsUpdate = true;
    }
}

/** A small Web Audio score, rescheduled from the playhead whenever playback starts or jumps. */
function createScore() {
    let ctx: AudioContext | null = null;
    let out: GainNode | null = null;
    let wet: GainNode | null = null;
    let live: AudioScheduledSourceNode[] = [];
    let on = false;

    function setup(c: AudioContext) {
        const comp = c.createDynamicsCompressor();
        out = c.createGain();
        out.gain.value = 0.85;
        out.connect(comp);
        comp.connect(c.destination);
        const conv = c.createConvolver();
        const len = Math.floor(c.sampleRate * 3.2);
        const ir = c.createBuffer(2, len, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = ir.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
        }
        conv.buffer = ir;
        wet = c.createGain();
        wet.gain.value = 0.5;
        wet.connect(conv);
        conv.connect(out);
    }

    function stop() {
        for (const n of live) {
            try { n.stop(); } catch { /* never started */ }
        }
        live = [];
    }

    function play(t0: number) {
        if (!on || !ctx || !out || !wet) return;
        stop();
        const c = ctx, master = out, verb = wet;
        const now = c.currentTime;
        const at = (tt: number) => now + Math.max(0, tt - t0);
        const keep = <T extends AudioScheduledSourceNode>(n: T) => { live.push(n); return n; };
        const noise = (sec: number, brown: boolean) => {
            const len = Math.floor(c.sampleRate * sec), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
            let last = 0;
            for (let i = 0; i < len; i++) {
                const w = Math.random() * 2 - 1;
                if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
            }
            const s = c.createBufferSource();
            s.buffer = b;
            s.loop = true;
            return keep(s);
        };
        const osc = (type: OscillatorType, f: number, detune = 0) => {
            const o = c.createOscillator();
            o.type = type; o.frequency.value = f; o.detune.value = detune;
            return keep(o);
        };
        const filter = (type: BiquadFilterType, f: number, q = 1) => {
            const b = c.createBiquadFilter();
            b.type = type; b.frequency.value = f; b.Q.value = q;
            return b;
        };
        const gain = (v = 0) => { const g = c.createGain(); g.gain.value = v; return g; };
        const auto = (param: AudioParam, keys: [number, number][]) => {
            const val = (tt: number) => {
                if (tt <= keys[0][0]) return keys[0][1];
                for (let i = 0; i < keys.length - 1; i++) {
                    const [a, va] = keys[i], [b, vb] = keys[i + 1];
                    if (tt <= b) return va + ((vb - va) * (tt - a)) / (b - a);
                }
                return keys[keys.length - 1][1];
            };
            param.cancelScheduledValues(now);
            param.setValueAtTime(val(t0), now);
            for (const [kt, kv] of keys) if (kt > t0) param.linearRampToValueAtTime(kv, now + (kt - t0));
        };

        // street: rumble, chatter and horns that fade as the city changes
        const rumble = noise(4, true), lp = filter("lowpass", 170), rg = gain();
        auto(rg.gain, [[0, 0], [0.5, 0.55], [6, 0.5], [9, 0.18], [12, 0.04], [13, 0]]);
        rumble.connect(lp); lp.connect(rg); rg.connect(master); rumble.start();
        const chatter = noise(3, false), bp = filter("bandpass", 1300, 0.9), cg = gain();
        auto(cg.gain, [[0, 0], [0.5, 0.06], [5, 0.05], [8, 0]]);
        chatter.connect(bp); bp.connect(cg); cg.connect(master); cg.connect(verb); chatter.start();
        ([[0.7, 470], [1.5, 410], [2.3, 520], [3.2, 445], [4.4, 495], [5.6, 430], [7.0, 480]] as const).forEach(([ht, f], i) => {
            if (ht < t0) return;
            const g = gain(), bf = filter("bandpass", 1500, 1.1), amp = 0.05 * (1 - ht / 9), s = at(ht);
            const o1 = osc("square", f), o2 = osc("square", f * 1.19);
            o1.connect(bf); o2.connect(bf); bf.connect(g);
            const pan = c.createStereoPanner();
            pan.pan.value = (i % 2 ? 1 : -1) * (0.25 + 0.4 * Math.random());
            g.connect(pan); pan.connect(master); pan.connect(verb);
            for (const [o, d] of [[0, 0.13], [0.2, 0.11]]) {
                g.gain.setValueAtTime(0, s + o);
                g.gain.linearRampToValueAtTime(amp, s + o + 0.01);
                g.gain.setValueAtTime(amp, s + o + d);
                g.gain.linearRampToValueAtTime(0, s + o + d + 0.02);
            }
            o1.start(s); o2.start(s); o1.stop(s + 0.5); o2.stop(s + 0.5);
        });
        // a low hum rises under the transformation
        const hf = filter("lowpass", 140), hg = gain();
        auto(hf.frequency, [[3, 140], [10, 900], [13, 600]]);
        auto(hg.gain, [[3, 0], [6, 0.05], [10, 0.09], [12.5, 0.07], [14.2, 0]]);
        for (const f of [55, 82.41, 110.3]) { const o = osc("sawtooth", f); o.connect(hf); o.start(); }
        hf.connect(hg); hg.connect(master);
        // a chord swells for the reveal
        const pf = filter("lowpass", 500), pg = gain();
        auto(pf.frequency, [[9.5, 500], [13, 1700], [14.3, 2600], [16.8, 1500]]);
        auto(pg.gain, [[9.5, 0], [12, 0.025], [13.2, 0.05], [14.4, 0.085], [16.2, 0.07], [16.8, 0]]);
        for (const f of [146.83, 220.0, 329.63, 369.99, 440.0, 554.37]) for (const cents of [-7, 7]) { const o = osc("sawtooth", f, cents); o.connect(pf); o.start(); }
        pf.connect(pg); pg.connect(master); pg.connect(verb);
        // a filtered whoosh as the camera cranes up
        const whoosh = noise(3, false), wf = filter("bandpass", 300, 1.4), wg = gain();
        auto(wf.frequency, [[11.6, 300], [13.4, 4200], [14.4, 1100]]);
        auto(wg.gain, [[11.6, 0], [12.9, 0.1], [13.7, 0.06], [14.6, 0]]);
        whoosh.connect(wf); wf.connect(wg); wg.connect(master); whoosh.start();
        if (t0 < 13.8) {
            [1318.5, 1760, 1975.5].forEach((f, i) => {
                const o = osc("sine", f), g = gain(), s = at(13.8 + i * 0.12);
                g.gain.setValueAtTime(0, s);
                g.gain.linearRampToValueAtTime(0.02, s + 0.04);
                g.gain.exponentialRampToValueAtTime(0.0001, s + 3.2);
                o.connect(g); g.connect(verb); g.connect(master);
                o.start(s); o.stop(s + 3.4);
            });
        }
    }

    return {
        get on() { return on; },
        async set(next: boolean, t0: number, playing: boolean) {
            if (next && !ctx) {
                const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (!AC) return false;
                ctx = new AC();
                setup(ctx);
            }
            on = next;
            if (on && ctx) {
                try { await ctx.resume(); } catch { /* stays silent */ }
                if (playing) play(t0);
            } else stop();
            return on;
        },
        play,
        stop,
        dispose() {
            stop();
            on = false;
            void ctx?.close();
            ctx = null;
        },
    };
}

export async function createFilm(canvas: HTMLCanvasElement, opts: FilmOptions): Promise<Film> {
    const LITE = opts.lite;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    if (!renderer.capabilities.isWebGL2) {
        renderer.dispose();
        throw new Error("WebGL 2 is required");
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = opts.exposure ?? 1.2;
    renderer.setClearColor(0x03050b, 1);

    function mulberry32(a: number) {
        return () => {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const rand = mulberry32(20261024);
    const R = (a: number, b: number) => a + (b - a) * rand();
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

    const col = (hex: string) => new THREE.Color(hex);
    const lin = (hex: string) => new THREE.Color(hex).toArray();
    const C = {
        sodium: col("#ff8b2c"), lampNew: col("#d2f7ff"),
        cyan: col("#5ee7ff"), violet: col("#9b7bff"), amber: col("#ffb547"), gold: col("#ffc35c"),
        fogOld: col("#2e1a0e"), fogNew: col("#0d1230"),
        skyLow: col("#1b2350"), skyHigh: col("#05070f"),
        oldH: col("#3b2312"), oldZ: col("#0b0806"), newH: col("#141a40"), newZ: col("#03040b"),
    };
    const U: Record<string, THREE.IUniform> = {
        uTime: { value: 0 }, uGrade: { value: 0 }, uWaveZ: { value: WAVE_Z0 }, uPx: { value: 800 },
        uFogOld: { value: C.fogOld }, uFogNew: { value: C.fogNew },
        uSodium: { value: C.sodium }, uLampNew: { value: C.lampNew },
        uCyan: { value: C.cyan }, uViolet: { value: C.violet }, uAmber: { value: C.amber }, uGold: { value: C.gold },
        uSkyLow: { value: C.skyLow }, uSkyHigh: { value: C.skyHigh },
    };
    const ADD: THREE.ShaderMaterialParameters = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    const mat = (vs: string, fs: string, params: THREE.ShaderMaterialParameters = {}, extra: Record<string, THREE.IUniform> = {}) =>
        new THREE.ShaderMaterial({ uniforms: { ...U, ...extra }, vertexShader: vs, fragmentShader: fs, ...params });
    const WORLD_V = `varying vec3 vW; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.3, 4200);
    const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), eu = new THREE.Euler();
    const setInst = (mesh: THREE.InstancedMesh, i: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, yaw = 0) => {
        eu.set(0, yaw, 0);
        q0.setFromEuler(eu);
        m4.compose(v3.set(x, y, z), q0, s3.set(sx, sy, sz));
        mesh.setMatrixAt(i, m4);
    };
    const add = <T extends THREE.Object3D>(o: T, order = 0): T => {
        o.frustumCulled = false;
        o.renderOrder = order;
        scene.add(o);
        return o;
    };

    // ---------------------------------------------------------------- sky
    const sky = add(new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), mat(
        `varying vec3 vDir; void main() { vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
        SKY_F,
        { side: THREE.BackSide, depthWrite: false, depthTest: false },
        { uOldH: { value: C.oldH }, uOldZ: { value: C.oldZ }, uNewH: { value: C.newH }, uNewZ: { value: C.newZ } },
    )), -100);

    // ---------------------------------------------------------------- city layout
    const lots: Lot[] = [];
    function addLot(o: LotSeed) {
        const dT = Math.hypot(o.x, o.z - TEMPLE_Z);
        if (dT < PLAZA_R + Math.max(o.w, o.d) * 0.5 + 2) return;
        if (o.w < 3 || o.d < 3) return;
        const ax = Math.abs(o.x);
        let oldH: number, newH: number, scale = 1;
        if (o.street) {
            oldH = (2 + Math.floor(R(0, 5.99))) * 3.2 + R(0.4, 1.4);
            if (rand() < 0.36) { newH = R(55, 135); scale = R(0.72, 0.86); } else newH = R(15, 32);
        } else if (o.back) {
            oldH = (3 + Math.floor(R(0, 5.99))) * 3.2 + R(0.2, 1.2);
            newH = R(40, 150);
            scale = R(0.78, 0.9);
        } else {
            oldH = (2 + Math.floor(R(0, 7.99))) * 3.2 + R(0, 1.2);
            newH = rand() < 0.14 ? R(120, 200) : R(26, 105);
            if (o.big) newH = R(110, 230);
            scale = R(0.8, 0.95);
        }
        if (dT < 90) { newH = Math.min(newH, R(18, 36)); scale = 1; }
        newH = Math.max(newH, oldH + 4);
        const sr = rand();
        const style = sr < 0.5 ? 0 : sr < 0.65 ? 1 : sr < 0.8 ? 2 : 3;
        let fs: number, fd: number;
        if (ax < 42 && o.z > MAIN_END) {
            if (o.z < -14 && o.z > -96 && rand() < 0.42) { fs = R(3.3, 5.2); fd = R(2.2, 3.0); }
            else { fs = waveTime(o.z) + R(-0.05, 0.3) + (o.back ? 0.25 : 0); fd = R(1.2, 1.8); }
        } else {
            fs = 8.3 + clamp(ax / 380, 0, 1) * 2.2 + clamp((MAIN_END - o.z) / 500, 0, 1) * 0.7 + clamp((o.z - 60) / 200, 0, 1) * 0.6 + R(0, 0.5);
            fs = Math.min(fs, 11.3);
            fd = R(1.0, 1.35);
        }
        const gs = Math.min(10 + R(0, 0.85) + clamp(Math.hypot(o.x, o.z + 130) / 700, 0, 1) * 0.3, 11);
        lots.push({ ...o, oldH, newH, scale, style, fs, fd, gs, gd: R(1.8, 2.2), seed: rand() });
    }
    function fillMain(x0: number, x1: number, z0: number, z1: number, side: number) {
        const streetX = side > 0 ? x0 : x1;
        let z = z1;
        while (z - z0 > 3) {
            const w = Math.min(R(5.5, 10.5), z - z0);
            const depth = R(10, 15), jit = R(0, 0.5);
            addLot({ x: streetX + side * (jit + depth / 2), z: z - w / 2, w: depth, d: w - 0.05, street: true, side });
            z -= w;
        }
        const bx0 = side > 0 ? x0 + 16 : x0, bx1 = side > 0 ? x1 : x1 - 16;
        let zz = z1;
        while (zz - z0 > 4) {
            const d = Math.min(R(9, 16), zz - z0);
            addLot({ x: (bx0 + bx1) / 2, z: zz - d / 2, w: bx1 - bx0 - R(0, 2), d: d - R(0.6, 1.6), back: true, side });
            zz -= d;
        }
    }
    function fillCity(x0: number, x1: number, z0: number, z1: number) {
        const W = x1 - x0, D = z1 - z0;
        if (W < 6 || D < 6) return;
        if (rand() < 0.12) { addLot({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: W - R(2, 5), d: D - R(2, 5), big: true }); return; }
        const nx = W > 24 ? 2 : 1, nz = D > 24 ? (rand() < 0.5 ? 2 : 3) : 1;
        const cw = W / nx, cd = D / nz;
        for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
            addLot({ x: x0 + cw * (a + 0.5) + R(-0.6, 0.6), z: z0 + cd * (b + 0.5) + R(-0.6, 0.6), w: cw - R(1, 3.5), d: cd - R(1, 3.5) });
        }
    }
    const GRID_K = LITE ? 6 : 8, J_MIN = LITE ? -11 : -15, J_MAX = 1;
    for (let k = -GRID_K; k < GRID_K; k++) {
        for (let j = J_MIN; j <= J_MAX; j++) {
            const za = -23 + j * PITCH, zb = za + PITCH;
            const z0 = za + CROSS_HALF, z1 = zb - CROSS_HALF;
            const mainBlock = (k === 0 || k === -1) && z0 > MAIN_END - 30;
            const x0 = k * PITCH + (k === 0 && mainBlock ? MAIN_EDGE : AVE_EDGE);
            const x1 = (k + 1) * PITCH - (k + 1 === 0 && mainBlock ? MAIN_EDGE : AVE_EDGE);
            if (mainBlock) fillMain(x0, x1, z0, z1, k === 0 ? 1 : -1);
            else fillCity(x0, x1, z0, z1);
        }
    }
    const landmarks: Lot[] = [];
    {
        const cand = lots.filter((l) => !l.street && !l.back && Math.min(l.w, l.d) > 14 && l.z < -150 && Math.abs(l.x) < 300 && Math.hypot(l.x, l.z - TEMPLE_Z) > 120);
        for (let i = 0; i < 9 && cand.length; i++) {
            const l = cand.splice(Math.floor(rand() * cand.length), 1)[0];
            l.newH = R(210, 320);
            l.scale = 0.78;
            l.landmark = true;
            landmarks.push(l);
        }
    }
    const towerH = (l: Lot, t: number) => l.oldH + (l.newH - l.oldH) * ease3((t - l.gs) / l.gd);

    // ---------------------------------------------------------------- buildings
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0);
    {
        const n = lots.length;
        const mesh = add(new THREE.InstancedMesh(boxGeo, mat(BUILDING_V, BUILDING_F), n));
        const aH = new Float32Array(n * 2), aT = new Float32Array(n * 4), aM = new Float32Array(n * 4);
        lots.forEach((l, i) => {
            m4.compose(v3.set(l.x, 0, l.z), q0.identity(), s3.set(l.w, 1, l.d));
            mesh.setMatrixAt(i, m4);
            aH.set([l.oldH, l.newH], i * 2);
            aT.set([l.fs, l.fd, l.gs, l.gd], i * 4);
            aM.set([l.seed, l.style, l.street ? 1 : 0, l.scale], i * 4);
        });
        boxGeo.setAttribute("aH", new THREE.InstancedBufferAttribute(aH, 2));
        boxGeo.setAttribute("aT", new THREE.InstancedBufferAttribute(aT, 4));
        boxGeo.setAttribute("aM", new THREE.InstancedBufferAttribute(aM, 4));
    }

    // ---------------------------------------------------------------- ground: wet asphalt to guided lanes and circuit streets
    add(new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000).rotateX(-Math.PI / 2).translate(0, 0, -300), mat(WORLD_V, GROUND_F)));

    // ---------------------------------------------------------------- props: poles, balconies, laundry, tanks, signs, people
    const propMat = mat(PROP_V, PROP_F);
    const propMatDS = mat(PROP_V, PROP_F, { side: THREE.DoubleSide });
    function propMesh(geo: THREE.BufferGeometry, items: PropItem[], material = propMat) {
        const n = Math.max(items.length, 1);
        const g = geo.clone();
        const mesh = add(new THREE.InstancedMesh(g, material, n));
        const aC = new Float32Array(n * 3), aX = new Float32Array(n * 4);
        items.forEach((it, i) => {
            eu.set(0, it.yaw ?? 0, 0);
            q0.setFromEuler(eu);
            m4.compose(v3.fromArray(it.p), q0, s3.fromArray(it.s ?? [1, 1, 1]));
            mesh.setMatrixAt(i, m4);
            aC.set(it.c, i * 3);
            aX.set([it.born ?? -1, it.gone ?? 99, it.em ?? 0, it.sway ?? 0], i * 4);
        });
        if (!items.length) mesh.count = 0;
        g.setAttribute("aC", new THREE.InstancedBufferAttribute(aC, 3));
        g.setAttribute("aX", new THREE.InstancedBufferAttribute(aX, 4));
        return mesh;
    }
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const lamps: { x: number; z: number; i: number }[] = [];
    {
        const poles: PropItem[] = [], strips: PropItem[] = [];
        const dark = lin("#2a2723");
        for (let k = 0; k < LAMP_N; k++) {
            const z = LAMP_Z0 - k * LAMP_DZ;
            for (const sd of [-1, 1]) {
                lamps.push({ x: sd * LAMP_X, z, i: lamps.length });
                poles.push({ p: [sd * POLE_X, 4.2, z], s: [0.2, 8.4, 0.2], c: dark });
                poles.push({ p: [sd * (POLE_X - 0.85), 8.35, z], s: [1.7, 0.12, 0.12], c: dark });
                poles.push({ p: [sd * LAMP_X, 8.32, z], s: [0.62, 0.18, 0.36], c: dark });
                strips.push({ p: [sd * (POLE_X - 0.12), 4.0, z], s: [0.05, 6.4, 0.05], c: C.cyan.toArray(), em: 1.6, born: lampSettle(z) + 0.1 });
            }
        }
        propMesh(unitBox, poles);
        propMesh(unitBox, strips);
    }
    const holoSpots: { side: number; z: number; y: number; appear: number }[] = [];
    {
        const slabs: PropItem[] = [], rails: PropItem[] = [], acs: PropItem[] = [], cloth: PropItem[] = [], tanks: PropItem[] = [], signs: PropItem[] = [];
        const CLOTH = ["#c8742a", "#7a2632", "#2e6f6a", "#b8932f", "#b0567a", "#d8d6cc", "#3b3f7a"].map(lin);
        const RAILC = ["#2a2622", "#2f4a3c", "#2d3a55", "#4a2a22"].map(lin);
        const SIGNC = ["#8a2a20", "#b39022", "#2c6464", "#c9c6bb", "#7a3b6a"].map(lin);
        for (const l of lots) {
            const near = Math.abs(l.x) < 42 && l.z > MAIN_END - 40;
            if (near && (l.street || l.back)) {
                for (let k = 0, nT = 1 + Math.floor(R(0, 1.99)); k < nT; k++) {
                    tanks.push({ p: [l.x + R(-l.w / 4, l.w / 4), l.oldH + 0.75, l.z + R(-l.d / 4, l.d / 4)], c: lin("#141414"), gone: Math.min(l.gs - 0.15, l.fs + l.fd) });
                }
            }
            if (!l.street || l.d < 3.2 || l.side === undefined) continue;
            const side = l.side, faceX = l.x - (side * l.w) / 2;
            const floors = Math.floor(l.oldH / 3.2), rowsOld = Math.max(1, floors);
            for (let r = 1; r < floors; r++) {
                const gone = l.fs + l.fd * ((r / rowsOld) * 0.82 + 0.09);
                if (rand() < 0.38) {
                    const z = l.z + R(-(l.d / 2 - 1.4), l.d / 2 - 1.4);
                    slabs.push({ p: [faceX - side * 0.55, r * 3.2 + 0.09, z], s: [1.1, 0.18, 2.6], c: lin("#3a3633"), gone });
                    rails.push({ p: [faceX - side * 1.08, r * 3.2 + 0.63, z], s: [0.06, 0.9, 2.6], c: pick(RAILC), gone });
                    if (rand() < 0.45) {
                        const nC = 2 + Math.floor(R(0, 2.99));
                        for (let ci = 0; ci < nC; ci++) {
                            cloth.push({ p: [faceX - side * 1.13, r * 3.2 + 0.66, z - 0.9 + ci * (1.8 / Math.max(1, nC - 1))], s: [0.55, 0.85, 1], yaw: (-side * Math.PI) / 2, c: pick(CLOTH), sway: 1, gone });
                        }
                    }
                }
                if (rand() < 0.3) acs.push({ p: [faceX - side * 0.3, r * 3.2 + 1.95, l.z + R(-(l.d / 2 - 0.8), l.d / 2 - 0.8)], s: [0.55, 0.55, 0.85], c: lin("#8f8f88"), gone });
            }
            if (rand() < 0.75) {
                const z = l.z + R(-l.d / 3, l.d / 3), y = R(4.7, 6.8);
                const holo = l.z < -20 && rand() < 0.62;
                let appear = waveTime(z) + R(0.15, 0.6);
                if (holo && z > -95 && rand() < 0.3) appear = R(3.6, 5.6);
                signs.push({ p: [faceX - side * 0.62, y, z], s: [1.1, 1.5, 0.12], c: pick(SIGNC), em: 0.12, gone: holo ? appear : waveTime(z) + R(0, 0.4) });
                if (holo) holoSpots.push({ side, z, y: y + R(0.2, 1.4), appear });
            }
        }
        propMesh(unitBox, slabs);
        propMesh(unitBox, rails);
        propMesh(unitBox, acs);
        propMesh(new THREE.PlaneGeometry(1, 1), cloth, propMatDS);
        propMesh(new THREE.CylinderGeometry(0.8, 0.8, 1.5, 10), tanks);
        propMesh(unitBox, signs);
    }
    const stalls: { x: number; z: number; chai?: boolean }[] = [{ x: -8.9, z: 3.5, chai: true }];
    for (let i = 0; i < 8; i++) stalls.push({ x: (rand() < 0.5 ? -1 : 1) * 8.7, z: R(-190, 30) });
    propMesh(unitBox, stalls.flatMap((s): PropItem[] => [
        { p: [s.x, s.chai ? 1.0 : 0.5, s.z], s: s.chai ? [2.2, 2.0, 1.6] : [1.5, 1.0, 0.9], c: lin("#5a3218"), em: 0.06 },
        { p: [s.x, s.chai ? 2.05 : 1.05, s.z], s: s.chai ? [2.25, 0.1, 1.7] : [1.55, 0.08, 0.95], c: lin("#ffb36b"), em: 1.1 },
    ]));

    // ---------------------------------------------------------------- holograms
    const holoMat = mat(HOLO_V, HOLO_F, { ...ADD, side: THREE.DoubleSide });
    const planeGeo = new THREE.PlaneGeometry(1, 1);
    function holoMesh(items: HoloItem[], dynamic = false) {
        const n = Math.max(items.length, 1);
        const g = planeGeo.clone();
        const mesh = add(new THREE.InstancedMesh(g, holoMat, n), 4);
        const aHolo = new Float32Array(n * 4), aCol = new Float32Array(n * 3);
        items.forEach((h, i) => {
            setInst(mesh, i, h.p[0], h.p[1], h.p[2], dynamic ? 0 : h.w, dynamic ? 0 : h.h, 1, h.yaw ?? 0);
            aHolo.set([h.appear, h.type, h.seed, h.w / h.h], i * 4);
            aCol.set(h.c.toArray(), i * 3);
        });
        if (!items.length) mesh.count = 0;
        g.setAttribute("aHolo", new THREE.InstancedBufferAttribute(aHolo, 4));
        g.setAttribute("aCol", new THREE.InstancedBufferAttribute(aCol, 3));
        if (dynamic) mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        return mesh;
    }
    {
        const H: HoloItem[] = [];
        const tone = () => pick([C.cyan, C.cyan, C.violet, C.amber]);
        for (const s of holoSpots) {
            const tall = rand() < 0.7;
            H.push({ p: [s.side * (MAIN_EDGE - 1.25), s.y, s.z], w: tall ? R(1.5, 2.0) : R(2.2, 2.6), h: tall ? R(2.4, 3.4) : R(1.4, 1.8), appear: s.appear, type: Math.floor(R(0, 3.99)), seed: rand(), c: tone() });
        }
        for (let i = 0; i < 16; i++) {
            const side = rand() < 0.5 ? -1 : 1, z = R(-200, -24);
            H.push({ p: [side * (MAIN_EDGE - 0.15), R(7, 13), z], yaw: (-side * Math.PI) / 2, w: R(3.5, 6), h: R(2, 3.2), appear: waveTime(z) + R(0.15, 0.6), type: Math.floor(R(0, 3.99)), seed: rand(), c: tone() });
        }
        for (let i = 0; i < 10; i++) {
            const zc = pick([-69, -115, -161]), side = rand() < 0.5 ? -1 : 1, tall = rand() < 0.5;
            H.push({ p: [side * R(15, 27), R(20, 46), zc + R(-1.5, 1.5)], w: tall ? 7 : 13, h: tall ? 11 : 7, appear: R(10.2, 12.2), type: Math.floor(R(0, 3.99)), seed: rand(), c: tone() });
        }
        for (let i = 0; i < (LITE ? 14 : 26); i++) {
            const zc = -23 + PITCH * Math.floor(R(-12, -3));
            const w = R(10, 22);
            H.push({ p: [R(-GRID_K * 40, GRID_K * 40), R(40, 120), zc], w, h: w * R(0.55, 0.9), appear: R(10.6, 12.8), type: Math.floor(R(0, 3.99)), seed: rand(), c: tone() });
        }
        holoMesh(H);
    }

    // ---------------------------------------------------------------- temple
    {
        const templeMat = mat(
            `varying vec3 vW; varying vec3 vN; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`,
            TEMPLE_F,
        );
        const prof: THREE.Vector2[] = [];
        for (let i = 0; i <= 44; i++) {
            const s = i / 44;
            const r = 7.8 * Math.pow(1 - Math.pow(s, 2.2), 0.62) + 0.55 + 0.28 * Math.max(0, Math.sin(s * Math.PI * 11));
            prof.push(new THREE.Vector2(r, 3.4 + s * 38));
        }
        const shikhara = new THREE.LatheGeometry(prof, 48);
        const place = (geo: THREE.BufferGeometry, x: number, y: number, z: number, s = 1, ry = 0) => {
            const m = add(new THREE.Mesh(geo, templeMat));
            m.position.set(x, y, z);
            m.scale.setScalar(s);
            m.rotation.y = ry;
        };
        const lathe = (pts: number[][], seg: number) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
        place(shikhara, 0, 0, TEMPLE_Z);
        for (const [dx, dz] of [[-7, -6], [7, -6], [-7, 5], [7, 5]]) place(shikhara, dx, 1.4, TEMPLE_Z + dz, 0.38);
        place(lathe([[0.2, 0], [2.2, 0.15], [2.9, 0.75], [2.2, 1.35], [0.2, 1.5]], 32), 0, 41.4, TEMPLE_Z);
        place(new THREE.SphereGeometry(0.75, 16, 12), 0, 43.7, TEMPLE_Z);
        place(new THREE.ConeGeometry(0.3, 1.8, 12), 0, 45.3, TEMPLE_Z);
        place(new THREE.BoxGeometry(13, 6, 12), 0, 6.4, TEMPLE_Z + 15);
        place(lathe([[9, 0], [7.5, 1.2], [7.5, 1.6], [5.5, 2.8], [5.5, 3.2], [3.5, 4.4], [0.4, 5.8]], 4), 0, 9.4, TEMPLE_Z + 15, 1, Math.PI / 4);
        place(new THREE.BoxGeometry(30, 3.4, 46), 0, 1.7, TEMPLE_Z + 4);
    }

    // ---------------------------------------------------------------- additive volumes: lamp cones, wires, sky lanes, beams
    {
        const cone = new THREE.ConeGeometry(2.7, 8.2, 24, 1, true);
        cone.translate(0, -4.1, 0);
        const cones = add(new THREE.InstancedMesh(cone, mat(
            `varying vec3 vW; varying vec3 vNw; varying float vY; varying float vLZ;
             void main() { vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = wp.xyz; vNw = normalize(mat3(modelMatrix * instanceMatrix) * normal); vY = position.y; vLZ = instanceMatrix[3].z; gl_Position = projectionMatrix * viewMatrix * wp; }`,
            GL + `
             varying vec3 vW; varying vec3 vNw; varying float vY; varying float vLZ;
             void main() {
               float h = clamp(-vY / 8.2, 0.0, 1.0);
               float a = mix(1.0, 0.25, h) * (1.0 - smoothstep(0.85, 1.0, h));
               float facing = abs(dot(normalize(vNw), normalize(cameraPosition - vW)));
               a *= pow(facing, 1.6) * 0.075 * mix(1.0, 0.55, uGrade);
               gl_FragColor = vec4(lampAt(vLZ) * a * (1.0 - fogFactor(vW)), 1.0);
             }`,
            { ...ADD, side: THREE.DoubleSide },
        ), lamps.length));
        lamps.forEach((L, i) => setInst(cones, i, L.x, LAMP_Y, L.z, 1, 1, 1));
    }
    {
        const verts: number[] = [], us: number[] = [], gones: number[] = [];
        const addWire = (a: Vec3, b: Vec3, sag: number, gone: number) => {
            const N = 20;
            let prev: { p: Vec3; s: number } | null = null;
            for (let i = 0; i <= N; i++) {
                const s = i / N;
                const p: Vec3 = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s - sag * 4 * s * (1 - s), a[2] + (b[2] - a[2]) * s];
                if (prev) { verts.push(...prev.p, ...p); us.push(prev.s, s); gones.push(gone, gone); }
                prev = { p, s };
            }
        };
        for (const sd of [-1, 1]) for (let k = 0; k < LAMP_N - 1; k++) {
            const z0 = LAMP_Z0 - k * LAMP_DZ, z1 = z0 - LAMP_DZ;
            const g = waveTime((z0 + z1) / 2) + R(0, 0.35);
            for (let w = 0, n = 2 + Math.floor(R(0, 2.99)); w < n; w++) {
                const y = R(6.3, 7.6);
                addWire([sd * POLE_X, y, z0], [sd * POLE_X, y + R(-0.3, 0.3), z1], R(0.25, 0.9), g);
            }
        }
        for (let i = 0; i < 26; i++) { const z = R(-200, 44); addWire([-MAIN_EDGE, R(5.8, 7.8), z], [MAIN_EDGE, R(5.8, 7.8), z + R(-6, 6)], R(0.6, 1.5), waveTime(z) + R(0, 0.35)); }
        for (let i = 0; i < 30; i++) {
            const sd = rand() < 0.5 ? -1 : 1, z = LAMP_Z0 - Math.floor(R(0, LAMP_N - 0.01)) * LAMP_DZ;
            addWire([sd * POLE_X, R(6, 7.5), z], [sd * MAIN_EDGE, R(4.5, 8.5), z + R(-7, 7)], R(0.2, 0.7), waveTime(z) + R(0, 0.35));
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
        g.setAttribute("aU", new THREE.Float32BufferAttribute(us, 1));
        g.setAttribute("aGone", new THREE.Float32BufferAttribute(gones, 1));
        // Wires zip back into the buildings from the middle out as the wave passes.
        add(new THREE.LineSegments(g, mat(
            `attribute float aU; attribute float aGone; varying float vU; varying float vGone; varying vec3 vW;
             void main() { vU = aU; vGone = aGone; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
            GL + `
             varying float vU; varying float vGone; varying vec3 vW;
             void main() {
               float r = smoothstep(vGone, vGone + 0.9, uTime);
               float m = abs(vU - 0.5) * 2.0;
               if (m < r) discard;
               vec3 c = vec3(0.006, 0.0055, 0.005) + lampAt(vW.z) * 0.035;
               c += uCyan * 2.2 * (1.0 - smoothstep(0.0, 0.04, m - r)) * step(0.001, r) * step(r, 0.999);
               gl_FragColor = vec4(fogApply(c, vW), 1.0);
             }`,
        )));
    }
    {
        const laneDefs: SkyLane[] = [];
        laneDefs.push({ a: [0, 46], b: [0, -206], y: 30, w: 4, t0: 6.9, color: C.cyan, flip: true });
        const XL = GRID_K * PITCH;
        [-69, -161, -299, -437, -575].forEach((z, i) => laneDefs.push({ a: [-XL, z], b: [XL, z], y: 48, w: 1.4, t0: 8.8 + i * 0.35, color: C.cyan }));
        [-115, -345, -483].forEach((z, i) => laneDefs.push({ a: [-XL, z], b: [XL, z], y: 60, w: 1.4, t0: 9.6 + i * 0.4, color: i % 2 ? C.cyan : C.violet }));
        [-92, 92, -184, 184, -276, 276].filter((x) => Math.abs(x) < XL).forEach((x, i) => laneDefs.push({ a: [x, 60], b: [x, -720], y: 76, w: 1.4, t0: 10.0 + i * 0.22, color: C.cyan }));
        [-253, -391, -529].forEach((z, i) => laneDefs.push({ a: [-XL, z], b: [XL, z], y: 108, w: 1.4, t0: 10.8 + i * 0.3, color: C.violet }));
        laneDefs.push({ ring: true, a: [0, TEMPLE_Z], r: 58, y: 64, t0: 11.2, color: C.amber });
        landmarks.slice(0, 5).forEach((s, i) => laneDefs.push({ ring: true, a: [s.x, s.z], r: Math.max(s.w, s.d) * 0.39 + 9, y: s.newH * 0.55, t0: 11.5 + i * 0.2, color: i % 2 ? C.violet : C.cyan }));

        const rp: number[] = [], ru: number[] = [], rt: number[] = [], rc: number[] = [];
        const sA: number[] = [], sB: number[] = [], sP: number[] = [], sC: number[] = [];
        const spacing = LITE ? 13 : 7;
        const seg = (x0: number, z0: number, x1: number, z1: number, L: SkyLane, u0: number, u1: number) => {
            rp.push(x0, L.y, z0, x1, L.y, z1);
            ru.push(u0, u1);
            rt.push(L.t0, L.t0);
            rc.push(L.color.r, L.color.g, L.color.b, L.color.r, L.color.g, L.color.b);
        };
        for (const L of laneDefs) {
            for (const sd of [-1, 1]) {
                if (L.ring) {
                    const [cx, cz] = L.a, r = L.r + sd * 1.2, N = 96;
                    for (let i = 0; i < N; i++) {
                        const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
                        seg(cx + Math.cos(a0) * r, cz + Math.sin(a0) * r, cx + Math.cos(a1) * r, cz + Math.sin(a1) * r, L, i / N, (i + 1) / N);
                    }
                    const n = Math.max(6, Math.floor((2 * Math.PI * r) / 5));
                    for (let k = 0; k < n; k++) {
                        sA.push(cx, L.y, cz); sB.push(r, 0, 0);
                        sP.push(rand(), (R(14, 20) / (2 * Math.PI * r)) * sd, L.t0, 1);
                        sC.push(L.color.r * 1.6, L.color.g * 1.6, L.color.b * 1.6);
                    }
                } else {
                    const [ax, az] = L.a, [bx, bz] = L.b;
                    const len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len;
                    const px = -dz * L.w * sd, pz = dx * L.w * sd;
                    const A = [ax + px, az + pz], B = [bx + px, bz + pz], N = 48;
                    for (let i = 0; i < N; i++) {
                        const s0 = i / N, s1 = (i + 1) / N;
                        seg(A[0] + (B[0] - A[0]) * s0, A[1] + (B[1] - A[1]) * s0, A[0] + (B[0] - A[0]) * s1, A[1] + (B[1] - A[1]) * s1, L, s0, s1);
                    }
                    const n = Math.max(2, Math.floor(len / spacing));
                    const flow = sd * (L.flip ? -1 : 1);
                    for (let k = 0; k < n; k++) {
                        sA.push(A[0], L.y, A[1]); sB.push(B[0], L.y, B[1]);
                        sP.push(rand(), (R(16, 24) / len) * flow, L.t0, 0);
                        const ci = rand() < 0.18 ? C.amber : L.color;
                        sC.push(ci.r * 1.6, ci.g * 1.6, ci.b * 1.6);
                    }
                }
            }
        }
        const rg = new THREE.BufferGeometry();
        rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3));
        rg.setAttribute("aU", new THREE.Float32BufferAttribute(ru, 1));
        rg.setAttribute("aT0", new THREE.Float32BufferAttribute(rt, 1));
        rg.setAttribute("aCol", new THREE.Float32BufferAttribute(rc, 3));
        add(new THREE.LineSegments(rg, mat(
            GL + `attribute float aU; attribute float aT0; attribute vec3 aCol; varying float vU; varying float vT0; varying vec3 vCol; varying float vFog;
             void main() { vU = aU; vT0 = aT0; vCol = aCol; vec4 wp = modelMatrix * vec4(position, 1.0); vFog = fogFactor(wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
            GL + `varying float vU; varying float vT0; varying vec3 vCol; varying float vFog;
             void main() {
               float prog = clamp((uTime - vT0) / 1.6, 0.0, 1.0);
               if (prog <= 0.0 || vU > prog) discard;
               float head = exp(-pow((vU - prog) * 45.0, 2.0)) * (1.0 - step(0.999, prog));
               gl_FragColor = vec4(vCol * (0.16 + head * 2.4) * (1.0 - vFog), 1.0);
             }`,
            ADD,
        )));
        const n = sP.length / 4;
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
        sg.setAttribute("aA", new THREE.Float32BufferAttribute(sA, 3));
        sg.setAttribute("aB", new THREE.Float32BufferAttribute(sB, 3));
        sg.setAttribute("aP", new THREE.Float32BufferAttribute(sP, 4));
        sg.setAttribute("aCol", new THREE.Float32BufferAttribute(sC, 3));
        add(new THREE.Points(sg, mat(
            GL + `attribute vec3 aA; attribute vec3 aB; attribute vec4 aP; attribute vec3 aCol; varying vec3 vCol;
             void main() {
               float prog = clamp((uTime - aP.z) / 1.6, 0.0, 1.0);
               float u = fract(aP.x + aP.y * uTime);
               vec3 pos;
               if (aP.w < 0.5) pos = mix(aA, aB, u);
               else { float th = u * 6.2831853; pos = aA + vec3(cos(th), 0.0, sin(th)) * aB.x; }
               float vis = step(u, prog) * smoothstep(aP.z + 0.8, aP.z + 1.8, uTime);
               vec4 mv = modelViewMatrix * vec4(pos, 1.0);
               gl_Position = projectionMatrix * mv;
               gl_PointSize = clamp(1.3 * uPx / max(-mv.z, 0.1), 0.0, 40.0) * vis;
               vCol = aCol * (1.0 - fogFactor(pos)) * vis;
             }`,
            `varying vec3 vCol;
             void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 7.0); if (a < 0.02) discard; gl_FragColor = vec4(vCol * a, 1.0); }`,
            ADD,
        )));
    }
    {
        const beamGeo = new THREE.CylinderGeometry(9, 1.6, 380, 20, 1, true);
        beamGeo.translate(0, 190, 0);
        const n = Math.max(landmarks.length, 1);
        const beams = add(new THREE.InstancedMesh(beamGeo, mat(
            GL + `attribute vec3 aCol; attribute float aT0; varying vec3 vCol; varying float vT0; varying float vY; varying vec3 vW; varying vec3 vNw;
             void main() { vCol = aCol; vT0 = aT0; vY = position.y / 380.0; vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = wp.xyz; vNw = normalize(mat3(modelMatrix * instanceMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`,
            GL + `varying vec3 vCol; varying float vT0; varying float vY; varying vec3 vW; varying vec3 vNw;
             void main() {
               float h = clamp(vY, 0.0, 1.0);
               float facing = abs(dot(normalize(vNw), normalize(cameraPosition - vW)));
               float a = pow(1.0 - h, 1.6) * 0.05 * pow(facing, 2.0) * smoothstep(vT0, vT0 + 1.2, uTime);
               gl_FragColor = vec4(vCol * a * (1.0 - fogFactor(vW)), 1.0);
             }`,
            { ...ADD, side: THREE.DoubleSide },
        ), n));
        const aCol = new Float32Array(n * 3), aT0 = new Float32Array(n);
        landmarks.forEach((s, i) => {
            setInst(beams, i, s.x, s.newH, s.z, 1, 1, 1);
            aCol.set((i % 3 === 2 ? C.violet : C.cyan).toArray(), i * 3);
            aT0[i] = s.gs + s.gd + 0.1;
        });
        if (!landmarks.length) beams.count = 0;
        beamGeo.setAttribute("aCol", new THREE.InstancedBufferAttribute(aCol, 3));
        beamGeo.setAttribute("aT0", new THREE.InstancedBufferAttribute(aT0, 1));
    }

    // ---------------------------------------------------------------- air: dust, chai steam and rain
    {
        const n = LITE ? 300 : 600;
        const ap = new Float32Array(n * 3);
        for (let i = 0; i < n * 3; i++) ap[i] = rand();
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
        g.setAttribute("aP", new THREE.Float32BufferAttribute(ap, 3));
        add(new THREE.Points(g, mat(
            GL + `attribute vec3 aP; varying float vA;
             void main() {
               vec3 box = vec3(70.0, 36.0, 90.0);
               vec3 wpos = aP * box + vec3(sin(uTime * 0.2 + aP.x * 20.0) * 0.6, -uTime * 0.15, cos(uTime * 0.17 + aP.z * 20.0) * 0.6);
               vec3 rel = mod(wpos - cameraPosition + box * 0.5, box) - box * 0.5;
               vec4 mv = modelViewMatrix * vec4(cameraPosition + rel, 1.0);
               gl_Position = projectionMatrix * mv;
               float d = -mv.z;
               gl_PointSize = clamp(0.09 * uPx / max(d, 0.1), 0.0, 6.0);
               vA = smoothstep(0.5, 4.0, d) * (1.0 - smoothstep(25.0, 45.0, d)) * 0.5;
             }`,
            GL + `varying float vA;
             void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 4.0) * vA; vec3 c = mix(vec3(1.0, 0.62, 0.32), vec3(0.6, 0.85, 1.0), uGrade); gl_FragColor = vec4(c * a, 1.0); }`,
            ADD,
        )));
    }
    {
        const n = 60;
        const seeds = new Float32Array(n);
        for (let i = 0; i < n; i++) seeds[i] = rand();
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
        g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
        add(new THREE.Points(g, mat(
            GL + `attribute float aSeed; varying float vA;
             void main() {
               float life = fract(aSeed * 7.13 + uTime * 0.28);
               vec3 p = vec3(-8.6, 2.2, 3.5) + vec3(sin(life * 5.0 + aSeed * 30.0) * 0.35 * life, life * 3.2, cos(life * 4.0 + aSeed * 17.0) * 0.25 * life);
               vec4 mv = modelViewMatrix * vec4(p, 1.0);
               gl_Position = projectionMatrix * mv;
               gl_PointSize = clamp((0.5 + life * 1.4) * uPx / max(-mv.z, 0.1), 0.0, 220.0);
               vA = (1.0 - life) * smoothstep(0.0, 0.15, life) * 0.08;
             }`,
            `varying float vA; void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a = exp(-dot(p, p) * 3.0) * vA; gl_FragColor = vec4(vec3(1.0, 0.86, 0.7) * a, 1.0); }`,
            ADD,
        )));
    }
    {
        const n = LITE ? 600 : 1400;
        const ap = new Float32Array(n * 6), ends = new Float32Array(n * 2);
        for (let i = 0; i < n; i++) {
            const p = [rand(), rand(), rand()];
            ap.set(p, i * 6);
            ap.set(p, i * 6 + 3);
            ends[i * 2 + 1] = 1;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 6), 3));
        g.setAttribute("aP", new THREE.Float32BufferAttribute(ap, 3));
        g.setAttribute("aEnd", new THREE.Float32BufferAttribute(ends, 1));
        // Rain belongs to the old street; it thins out as the wave clears the air.
        add(new THREE.LineSegments(g, mat(
            GL + `attribute vec3 aP; attribute float aEnd; varying float vA; varying vec3 vW;
             void main() {
               vec3 box = vec3(44.0, 26.0, 64.0);
               vec3 wpos = aP * box + vec3(uTime * 1.2, -uTime * 22.0, 0.0);
               vec3 rel = mod(wpos - cameraPosition + box * 0.5, box) - box * 0.5;
               vec3 p = cameraPosition + rel + vec3(0.05, 0.9, 0.0) * aEnd;
               vec4 mv = modelViewMatrix * vec4(p, 1.0);
               gl_Position = projectionMatrix * mv;
               float d = -mv.z;
               vA = smoothstep(1.0, 4.0, d) * (1.0 - smoothstep(18.0, 32.0, d)) * (1.0 - smoothstep(5.5, 8.5, uTime)) * (1.0 - aEnd * 0.7);
               vW = p;
             }`,
            GL + `varying float vA; varying vec3 vW;
             void main() { vec3 c = (vec3(0.5, 0.48, 0.45) * 0.06 + lampAt(vW.z) * 0.10) * vA; gl_FragColor = vec4(c, 1.0); }`,
            ADD,
        )));
    }

    // ---------------------------------------------------------------- the seam: light that splits old from new as the wave runs
    const seam = add(new THREE.Mesh(new THREE.PlaneGeometry(MAIN_EDGE * 2, 34).translate(0, 17, 0), mat(
        `varying vec2 vP; varying vec3 vW; void main() { vP = position.xy; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
        GL + `
        varying vec2 vP; varying vec3 vW;
        float bolt(float x, float y, float edge, float s) {
          float off = (vnoise(vec2(y * 0.9, uTime * 2.2 + s)) - 0.5) * 1.1 + (vnoise(vec2(y * 3.1, uTime * 3.0 + s * 3.0)) - 0.5) * 0.35;
          float d = x - edge - off;
          return exp(-d * d / 0.004) * 1.6 + exp(-d * d / 0.25) * 0.25;
        }
        void main() {
          float on = smoothstep(6.0, 6.35, uTime) * (1.0 - smoothstep(8.6, 9.2, uTime));
          if (on <= 0.0) discard;
          float x = vP.x; float y = vP.y;
          float hf = pow(1.0 - clamp(y / 34.0, 0.0, 1.0), 1.4);
          float veil = 0.05 * hf;
          float scan = smoothstep(0.97, 1.0, sin(y * 2.8 - uTime * 9.0) * 0.5 + 0.5) * 0.05 * hf;
          float base = exp(-y * 1.2) * 0.6;
          float bolts = (bolt(x, y, -9.8, 1.0) + bolt(x, y, 9.8, 7.0)) * sqrt(hf);
          vec3 c = mix(uCyan, vec3(0.85, 0.95, 1.0), 0.35) * (veil + scan + base) + vec3(0.8, 0.95, 1.0) * bolts;
          gl_FragColor = vec4(c * on * (1.0 - fogFactor(vW)), 1.0);
        }`,
        { ...ADD, side: THREE.DoubleSide },
    )), 7);

    // ---------------------------------------------------------------- traffic: rickshaws, cars, buses, bikes become pods; some lift off
    const SIZE: Vec3[] = [[1.45, 1.75, 2.7], [1.8, 1.45, 4.2], [2.55, 3.2, 11.0], [0.75, 1.3, 1.9]];
    const LANES: LaneSpec[] = [{ x: -5.1, dir: -1, slow: true }, { x: -1.9, dir: -1 }, { x: 1.9, dir: 1 }, { x: 5.1, dir: 1, slow: true }];
    const perLane = LITE ? 10 : 16;
    const vehicles: Vehicle[] = [];
    const oldZ = (v: Vehicle, t: number) => wrapZ(v.z0 + v.ln.dir * v.vOld * t);
    for (const ln of LANES) {
        const vOld = ln.slow ? R(1.6, 2.6) : R(3.2, 4.6), vNew = ln.slow ? R(8, 9.5) : R(11, 13);
        for (let j = 0; j < perLane; j++) {
            const r = rand();
            const kind = ln.slow ? (r < 0.55 ? 0 : r < 0.82 ? 3 : 1) : r < 0.3 ? 0 : r < 0.75 ? 1 : 2;
            const [w, h, l] = SIZE[kind];
            let ca: number[], cb: number[], split = 1;
            if (kind === 0) { ca = lin(rand() < 0.5 ? "#161616" : "#2f6b3a"); cb = lin("#d6a21e"); split = 0.5; }
            else if (kind === 1) { ca = cb = lin(pick(["#d8d8d4", "#8e939a", "#7d1e1e", "#2a3f6e", "#161616", "#5b5b55"])); }
            else if (kind === 2) { ca = cb = lin(rand() < 0.6 ? "#8e1c17" : "#24427e"); }
            else { ca = lin("#1e1e1e"); cb = lin(pick(["#d9d4c5", "#2a3555", "#6e1f2b"])); split = 0.55; }
            const v: Vehicle = {
                ln, kind, w, h, l, x: ln.x + R(-0.3, 0.3), z0: ZMIN + ((j + R(0.25, 0.45)) * ZL) / perLane, vOld, vNew,
                ph: R(0, 6.28), wob: kind === 0 || kind === 3 ? R(0.12, 0.35) : 0.04, ca, cb, split, T: 10.4, zT: 0, lift: false, tl: 0, ly: 0,
            };
            if (oldZ(v, 6) > WAVE_Z0) v.T = 6;
            else for (let t = 6; t <= 10.4; t += 0.01) { if (waveZ(t) < oldZ(v, t) - 1) { v.T = t; break; } }
            v.zT = oldZ(v, v.T);
            v.lift = !ln.slow && kind !== 2 && rand() < 0.4;
            v.tl = v.T + R(0.7, 2.0);
            v.ly = R(28.5, 31.5);
            vehicles.push(v);
        }
    }
    const skyPods: SkyPod[] = [];
    {
        const lanesZ = [[-69, 48], [-161, 48], [-115, 60]];
        for (let i = 0, n = LITE ? 16 : 30; i < n; i++) {
            const [lz, ly] = lanesZ[i % 3], dir = (i >> 1) % 2 ? 1 : -1;
            skyPods.push({ z: lz + dir * 1.4, y: ly, x0: R(-170, 170), dir, v: R(18, 26), appear: R(8.8, 10.8) });
        }
    }
    const vehGeo = unitBox.clone();
    vehGeo.translate(0, 0.5, 0);
    {
        const aCA = new Float32Array(vehicles.length * 3), aCB = new Float32Array(vehicles.length * 3), aV = new Float32Array(vehicles.length * 4);
        vehicles.forEach((v, i) => { aCA.set(v.ca, i * 3); aCB.set(v.cb, i * 3); aV.set([v.split, v.kind, rand(), 0], i * 4); });
        vehGeo.setAttribute("aCA", new THREE.InstancedBufferAttribute(aCA, 3));
        vehGeo.setAttribute("aCB", new THREE.InstancedBufferAttribute(aCB, 3));
        vehGeo.setAttribute("aV", new THREE.InstancedBufferAttribute(aV, 4));
    }
    const oldMesh = add(new THREE.InstancedMesh(vehGeo, mat(VEHICLE_V, VEHICLE_F), vehicles.length));
    oldMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const podGeo = new THREE.CapsuleGeometry(0.75, 2.2, 4, 12);
    podGeo.rotateX(Math.PI / 2);
    podGeo.translate(0, 1.1, 0);
    const podMesh = add(new THREE.InstancedMesh(podGeo, mat(POD_V, POD_F), vehicles.length + skyPods.length));
    podMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // ---------------------------------------------------------------- people on the pavements, some with floating interfaces
    const peds: Ped[] = [];
    {
        const PED = ["#d9d4c5", "#b35a1f", "#6e1f2b", "#2a3555", "#4a5a2a", "#1c1c1c", "#a83a6a"].map(lin);
        for (let i = 0, n = LITE ? 80 : 140; i < n; i++) {
            const sd = rand() < 0.5 ? -1 : 1, still = rand() < 0.25;
            const p: Ped = { sd, x: sd * R(7.9, 9.9), z0: R(ZMIN, ZMAX), dir: rand() < 0.5 ? -1 : 1, v: still ? 0 : R(0.6, 1.3), ph: R(0, 6.28), h: R(0.9, 1.08), c: pick(PED), ui: -1, uiT: 0 };
            p.uiT = waveTime(wrapZ(p.z0 + p.dir * p.v * 7.5)) + R(0.2, 0.9);
            peds.push(p);
        }
    }
    const pedGeo = new THREE.CapsuleGeometry(0.21, 1.0, 3, 8);
    pedGeo.translate(0, 0.71, 0);
    const pedMesh = propMesh(pedGeo, peds.map((p) => ({ p: [p.x, 0, p.z0], c: p.c })));
    pedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const uiItems: HoloItem[] = [];
    for (const p of peds) {
        if (rand() < 0.45) {
            p.ui = uiItems.length;
            uiItems.push({ p: [p.x, 1.3, p.z0], w: 0.5, h: 0.34, appear: p.uiT, type: 4, seed: rand(), c: rand() < 0.75 ? C.cyan : C.violet });
        }
    }
    const uiMesh = holoMesh(uiItems, true);

    // ---------------------------------------------------------------- glow sprites
    const G = new Glow(scene, mat(GLOW_V, GLOW_F, ADD), 1600);
    const beacons = lots.filter((l) => l.newH >= 80);
    const diyas: Vec3[] = [];
    for (let i = 0; i < 44; i++) {
        const u = (i / 44) * 152;
        let x: number, z: number;
        if (u < 30) { x = -15 + u; z = TEMPLE_Z + 27; }
        else if (u < 76) { x = 15; z = TEMPLE_Z + 27 - (u - 30); }
        else if (u < 106) { x = 15 - (u - 76); z = TEMPLE_Z - 19; }
        else { x = -15; z = TEMPLE_Z - 19 + (u - 106); }
        diyas.push([x, 3.55, z]);
    }
    const tmpC = new THREE.Color();
    const lampColor = (z: number, i: number, t: number, out: THREE.Color) => {
        const s = lampSettle(z);
        if (t < s - 0.8) return out.copy(C.sodium).multiplyScalar(2.0);
        if (t >= s) return out.copy(C.lampNew).multiplyScalar(2.4);
        const k = Math.floor(t * 9);
        const lit = hash(k * 0.37 + i * 1.91) > 0.28 ? 1 : 0.55;
        const fresh = hash(k * 0.71 + i * 3.7 + 5.1) > 0.5;
        return out.copy(fresh ? C.lampNew : C.sodium).multiplyScalar((fresh ? 2.4 : 2.0) * lit);
    };

    function updateTraffic(t: number) {
        vehicles.forEach((v, i) => {
            const d = v.ln.dir;
            const zo = oldZ(v, t);
            const so = (1 - smooth(v.T, v.T + 0.35, t)) * clamp(Math.min(zo - ZMIN, ZMAX - zo) / 10, 0, 1);
            const xo = v.x + v.wob * Math.sin(t * 1.3 + v.ph);
            if (so > 0.001) {
                setInst(oldMesh, i, xo, 0, zo, v.w * so, v.h * so, v.l * so, v.wob * 0.15 * Math.cos(t * 1.3 + v.ph));
                const fz = zo + (d * v.l) / 2, rz = zo - (d * v.l) / 2, hx = v.kind === 3 ? 0 : v.w * 0.33;
                G.add(xo - hx, v.h * 0.42, fz, 2.0 * so, 1.7 * so, 1.2 * so, 1.0, 0.8);
                G.add(xo - hx * 1.1, v.h * 0.5, rz, 1.5 * so, 0.1 * so, 0.05 * so, 0.7, 0.35);
                if (hx) {
                    G.add(xo + hx, v.h * 0.42, fz, 2.0 * so, 1.7 * so, 1.2 * so, 1.0, 0.8);
                    G.add(xo + hx * 1.1, v.h * 0.5, rz, 1.5 * so, 0.1 * so, 0.05 * so, 0.7, 0.35);
                }
            } else setInst(oldMesh, i, 0, -50, 0, 0, 0, 0);
            if (t >= v.T) {
                const tau = t - v.T, x = Math.min(tau / 1.2, 1);
                let dist = v.vOld * tau + (v.vNew - v.vOld) * (tau < 1.2 ? 1.2 * (x * x * x - (x * x * x * x) / 2) : 0.6 + (tau - 1.2));
                let px = v.x, py = 0;
                if (v.lift && t > v.tl) {
                    const lp = ease3((t - v.tl) / 2.4);
                    py = v.ly * lp;
                    px = v.x + (Math.sign(v.x) * 4 - v.x) * lp;
                    dist += 6 * (t - v.tl);
                }
                const zp = wrapZ(v.zT + d * dist);
                const sp = smooth(v.T + 0.15, v.T + 0.6, t) * clamp(Math.min(zp - ZMIN, ZMAX - zp) / 10, 0, 1) * (v.kind === 3 ? 0.62 : v.kind === 2 ? 1.25 : 1);
                setInst(podMesh, i, px, py, zp, sp, sp, sp * (v.kind === 2 ? 1.6 : 1));
                if (sp > 0.01) {
                    G.add(px, py + 0.22, zp, 0.35 * sp, 1.1 * sp, 1.35 * sp, py > 1 ? 2.6 : 3.4, 0);
                    G.add(px, py + 1.1, zp + d * 1.9 * sp, 1.5 * sp, 1.8 * sp, 2.0 * sp, 0.8, 0.6);
                }
                if (tau < 0.7) {
                    const k = tau / 0.7, a = (1 - k) * (1 - k) * 3;
                    G.add(px, 1.0, zp, 0.3 * a, 1.6 * a, 2.0 * a, 1.5 + 7 * k, 0.3);
                }
            } else setInst(podMesh, i, 0, -50, 0, 0, 0, 0);
        });
        skyPods.forEach((s, j) => {
            const x = wrapX(s.x0 + s.dir * s.v * t);
            const sc = smooth(s.appear, s.appear + 0.8, t) * clamp(Math.min(x + 170, 170 - x) / 15, 0, 1) * 0.9;
            setInst(podMesh, vehicles.length + j, x, s.y - 1.1 * sc, s.z, sc, sc, sc, Math.PI / 2);
            if (sc > 0.01) {
                G.add(x, s.y - 0.6, s.z, 0.35 * sc, 1.2 * sc, 1.5 * sc, 2.4, 0);
                G.add(x - s.dir * 2.1, s.y, s.z, 0.9 * sc, 0.6 * sc, 1.8 * sc, 0.9, 0.4);
            }
        });
        oldMesh.instanceMatrix.needsUpdate = true;
        podMesh.instanceMatrix.needsUpdate = true;
    }
    function updatePeople(t: number) {
        peds.forEach((p, i) => {
            const z = wrapZ(p.z0 + p.dir * p.v * t);
            const f = clamp(Math.min(z - ZMIN, ZMAX - z) / 6, 0, 1);
            const bob = p.v > 0 ? Math.abs(Math.sin(t * 5.2 * p.v + p.ph)) * 0.05 : 0;
            setInst(pedMesh, i, p.x, bob, z, f, p.h * f, f);
            if (p.ui >= 0) {
                const show = t > p.uiT ? f : 0;
                setInst(uiMesh, p.ui, p.x - p.sd * 0.2, 1.32 * p.h + 0.04 * Math.sin(t * 1.5 + p.ph), z + p.dir * 0.5, 0.5 * show, 0.34 * show, 1);
            }
        });
        pedMesh.instanceMatrix.needsUpdate = true;
        uiMesh.instanceMatrix.needsUpdate = true;
    }
    function updateLights(t: number) {
        for (const L of lamps) {
            lampColor(L.z, L.i, t, tmpC);
            G.add(L.x, LAMP_Y - 0.15, L.z, tmpC.r, tmpC.g, tmpC.b, 2.2, 1.0);
        }
        for (const zc of [-23, -69, -115, -161]) for (const xs of [-31, -17, 17, 31]) {
            lampColor(zc, zc + xs, t, tmpC);
            G.add(xs, 6.2, zc + 4.5, tmpC.r * 0.7, tmpC.g * 0.7, tmpC.b * 0.7, 1.6, 0.6);
        }
        for (const l of beacons) {
            const k = smooth(l.gs, l.gs + 0.6, t);
            if (k <= 0) continue;
            const ac = l.style === 3 ? C.violet : l.style === 1 ? C.amber : C.cyan;
            const s = l.landmark ? 2.8 : 2.0;
            G.add(l.x, towerH(l, t) + 0.8, l.z, ac.r * s * k, ac.g * s * k, ac.b * s * k, l.landmark ? 5 : 2.6, 0.5);
        }
        diyas.forEach(([x, y, z], i) => {
            const f = 0.85 + 0.15 * Math.sin(t * 7 + i * 1.7);
            G.add(x, y, z, 2.0 * f, 1.1 * f, 0.4 * f, 0.7, 0.2);
        });
        const tl = smooth(11.0, 12.6, t);
        G.add(0, 46.8, TEMPLE_Z, C.gold.r * 3 * tl, C.gold.g * 3 * tl, C.gold.b * 3 * tl, 5, 1.0);
        G.add(0, 24, TEMPLE_Z, C.gold.r * 0.22 * tl, C.gold.g * 0.22 * tl, C.gold.b * 0.22 * tl, 60, 0);
        for (const s of stalls) G.add(s.x, s.chai ? 2.5 : 1.9, s.z, 2.2, 1.4, 0.7, s.chai ? 1.2 : 0.9, 0.5);
    }

    // ---------------------------------------------------------------- post: bloom, tone map, grade, anamorphic flare, grain
    const baseDpr = Math.min(window.devicePixelRatio || 1, LITE ? 1.35 : 1.75);
    let dpr = baseDpr;
    const size = () => ({ w: Math.max(1, canvas.clientWidth), h: Math.max(1, canvas.clientHeight) });
    const s0 = size();
    renderer.setPixelRatio(dpr);
    renderer.setSize(s0.w, s0.h, false);
    const rt = new THREE.WebGLRenderTarget(s0.w * dpr, s0.h * dpr, { type: THREE.HalfFloatType, samples: LITE ? 0 : 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(s0.w, s0.h), 0.95, 0.6, 0.82));
    composer.addPass(new OutputPass());
    const finish = new ShaderPass({
        uniforms: {
            tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uGrain: { value: 0.03 },
            uFade: { value: 1 }, uGrade: { value: 0 }, uFlare: { value: new THREE.Vector3(0.5, 0.5, 0) }, uFlareCol: { value: new THREE.Vector3(1.0, 0.78, 0.45) },
            uVig: { value: opts.vignette ?? 0.42 },
        },
        ...FINISH_SHADER,
    });
    composer.addPass(finish);
    let baseFov = 48;
    function resize() {
        const { w, h } = size();
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        composer.setPixelRatio(dpr);
        composer.setSize(w, h);
        camera.aspect = w / h;
        baseFov = fovFor(camera.aspect);
        (finish.uniforms.uRes.value as THREE.Vector2).set(w * dpr, h * dpr);
        dirty = true;
        kick();
    }
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // ---------------------------------------------------------------- render loop
    const score = createScore();
    const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), bufSize = new THREE.Vector2(), flareP = new THREE.Vector3();
    const looping = true;
    let t = 0, playing = false, loops = 0, dirty = true, scrubbing = false;
    let raf = 0, last = performance.now(), sampled = 0, slow = 0, compiled = false;

    function renderFrame() {
        U.uTime.value = t;
        U.uGrade.value = smooth(3.0, 12.5, t);
        U.uWaveZ.value = waveZ(t);
        const tc = Math.min(t, FILM_DURATION);
        camTrack(1, tc, camPos);
        camTrack(2, tc, camTgt);
        if (t > FILM_DURATION) { const h = t - FILM_DURATION; camPos.z -= 0.7 * h; camPos.y += 0.5 * h; }
        camera.position.copy(camPos);
        camera.lookAt(camTgt);
        camera.rotateZ(0.0045 * Math.sin(t * 0.55) + 0.002 * Math.sin(t * 1.3));
        camera.fov = baseFov + 4 * smooth(12.8, 15, t);
        camera.updateProjectionMatrix();
        U.uPx.value = renderer.getDrawingBufferSize(bufSize).y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
        sky.position.copy(camera.position);
        seam.position.z = waveZ(t);
        seam.visible = t > 6 && t < 9.2;
        G.begin();
        updateTraffic(t);
        updatePeople(t);
        updateLights(t);
        G.end();
        flareP.set(0, 46.8, TEMPLE_Z).project(camera);
        const onScreen = flareP.z < 1 && Math.abs(flareP.x) < 1.1 && Math.abs(flareP.y) < 1.1 ? 1 : 0;
        const fu = finish.uniforms;
        (fu.uFlare.value as THREE.Vector3).set(flareP.x * 0.5 + 0.5, flareP.y * 0.5 + 0.5, 0.6 * smooth(11.2, 12.6, t) * onScreen);
        fu.uTime.value = t;
        fu.uGrade.value = U.uGrade.value;
        fu.uGrain.value = 0.045 - 0.027 * smooth(4, 12, t);
        fu.uFade.value = (loops > 0 ? smooth(0, LOOP_FADE, t) : 1) * (looping ? 1 - smooth(FILM_DURATION + HOLD - LOOP_FADE, FILM_DURATION + HOLD, t) : 1);
        composer.render();
        opts.onFrame?.(Math.min(t, FILM_DURATION));
    }

    function frame(now: number) {
        raf = 0;
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        if (playing && !scrubbing) {
            t += dt;
            if (t >= FILM_DURATION + HOLD) {
                if (looping) { t = 0; loops++; score.play(0); }
                else { t = FILM_DURATION + HOLD - 0.001; setPlaying(false); }
            }
            dirty = true;
            // Drop the pixel ratio once if the first seconds run well under 30 fps.
            if (t > 1.5 && sampled < 90) {
                sampled++;
                if (dt > 0.03) slow++;
                if (sampled === 90 && slow > 45 && dpr > 1) { dpr = Math.max(1, dpr - 0.4); resize(); }
            }
        }
        if (dirty) { renderFrame(); dirty = false; }
        if (playing) kick();
    }
    function kick() {
        if (compiled && !raf) raf = requestAnimationFrame(frame);
    }
    function setPlaying(p: boolean) {
        if (playing === p) return;
        playing = p;
        if (p) {
            if (t >= FILM_DURATION + HOLD - 0.01) { t = 0; loops = 0; }
            last = performance.now();
            score.play(t);
            kick();
        } else score.stop();
        opts.onPlayState?.(p);
    }
    function seek(next: number) {
        t = clamp(next, 0, FILM_DURATION + HOLD - 0.01);
        loops = 0;
        dirty = true;
        if (scrubbing || !playing) score.stop();
        else score.play(t);
        kick();
    }
    const onVisibility = () => {
        last = performance.now();
        if (document.hidden) score.stop();
        else if (playing) score.play(t);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Compile every program up front (in parallel where KHR_parallel_shader_compile
    // exists) so the first frame — and the seam at 6 s — never stall the main thread.
    seam.visible = true;
    try {
        await renderer.compileAsync(scene, camera);
    } catch {
        // Older drivers: programs compile on first use instead.
    }
    compiled = true;
    resize();
    renderFrame();
    dirty = false;

    return {
        play: () => setPlaying(true),
        pause: () => setPlaying(false),
        restart() { seek(0); setPlaying(true); },
        seek,
        isPlaying: () => playing,
        setScrubbing(on: boolean) {
            scrubbing = on;
            if (on) score.stop();
            else if (playing) score.play(t);
            last = performance.now();
        },
        setSound: (on: boolean) => score.set(on, t, playing),
        dispose() {
            playing = false;
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
            ro.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            score.dispose();
            scene.traverse((o) => {
                const m = o as THREE.Mesh;
                m.geometry?.dispose();
                const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
                for (const x of mats) x.dispose();
            });
            composer.dispose();
            rt.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
        },
    };
}
