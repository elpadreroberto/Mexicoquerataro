import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Pause, c as ChevronLeft, i as Play, n as Volume2, o as ChevronsDown, s as ChevronRight, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DQY5L1rg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LEVELS = [
	{
		id: 1,
		name: "Circuito",
		place: "Interior, CDMX",
		blurb: "Tres carriles y acotamiento. Aprende a cambiarte.",
		goal: 8,
		speed: 260,
		traffic: 90,
		spawnDistance: 240,
		doubleChance: .18,
		truckChance: 0,
		theme: "day"
	},
	{
		id: 2,
		name: "Periférico",
		place: "Naucalpan",
		blurb: "Curvas y sentido contrario. El acotamiento salva.",
		goal: 12,
		speed: 300,
		traffic: 100,
		spawnDistance: 220,
		doubleChance: .28,
		truckChance: .08,
		theme: "day"
	},
	{
		id: 3,
		name: "México–Qro",
		place: "Autopista 57",
		blurb: "Curvas más cerradas. Cuidado de frente.",
		goal: 16,
		speed: 340,
		traffic: 110,
		spawnDistance: 200,
		doubleChance: .38,
		truckChance: .18,
		theme: "dusk"
	},
	{
		id: 4,
		name: "Palmillas",
		place: "Caseta y recta",
		blurb: "Velocidad de crucero. Rebasa con decisión.",
		goal: 20,
		speed: 380,
		traffic: 125,
		spawnDistance: 190,
		doubleChance: .46,
		truckChance: .24,
		theme: "dusk"
	},
	{
		id: 5,
		name: "Del Sol",
		place: "Cuernavaca",
		blurb: "Noche en la montaña. Mira las luces traseras.",
		goal: 24,
		speed: 410,
		traffic: 135,
		spawnDistance: 180,
		doubleChance: .54,
		truckChance: .3,
		theme: "night"
	},
	{
		id: 6,
		name: "La 57",
		place: "Nocturna",
		blurb: "Tráfico denso. Un carril siempre queda libre.",
		goal: 28,
		speed: 440,
		traffic: 145,
		spawnDistance: 170,
		doubleChance: .6,
		truckChance: .34,
		theme: "night"
	},
	{
		id: 7,
		name: "Aguacero",
		place: "Lluvia en la 57",
		blurb: "Pista mojada. El auto resbala un poco al cambiar.",
		goal: 32,
		speed: 420,
		traffic: 130,
		spawnDistance: 175,
		doubleChance: .64,
		truckChance: .38,
		theme: "rain"
	},
	{
		id: 8,
		name: "Infinito",
		place: "Carrera abierta",
		blurb: "Sin meta. Sobrevive y suma rebasadas.",
		goal: 0,
		speed: 470,
		traffic: 150,
		spawnDistance: 165,
		doubleChance: .7,
		truckChance: .42,
		theme: "night"
	}
];
var KEY = "rebase-save-v1";
var SAVE_VERSION = 1;
var defaults = {
	version: SAVE_VERSION,
	highScore: 0,
	bestOvertakes: 0,
	unlocked: 1,
	muted: false
};
function migrate(raw) {
	const s = {
		...defaults,
		...raw,
		version: SAVE_VERSION
	};
	s.unlocked = Math.min(8, Math.max(1, s.unlocked | 0));
	s.highScore = Math.max(0, s.highScore | 0);
	s.bestOvertakes = Math.max(0, s.bestOvertakes | 0);
	s.muted = Boolean(s.muted);
	return s;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...defaults };
		return migrate(JSON.parse(raw));
	} catch {
		return { ...defaults };
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...data,
			version: SAVE_VERSION
		}));
	} catch {}
}
var bus = null;
var muted = false;
function unlockAudio() {
	const Ctx = window.AudioContext || window.webkitAudioContext;
	if (!bus) {
		const ctx = new Ctx({ latencyHint: "interactive" });
		const master = ctx.createGain();
		const sfx = ctx.createGain();
		const music = ctx.createGain();
		sfx.gain.value = .7;
		music.gain.value = .35;
		master.gain.value = muted ? 0 : .85;
		sfx.connect(master);
		music.connect(master);
		master.connect(ctx.destination);
		bus = {
			ctx,
			master,
			sfx,
			music,
			engine: null,
			engineGain: null,
			engineFilter: null
		};
	}
	if (bus.ctx.state === "suspended") bus.ctx.resume();
}
function setMuted(next) {
	muted = next;
	if (!bus) return;
	bus.master.gain.setTargetAtTime(next ? 0 : .85, bus.ctx.currentTime, .03);
}
function envGain(duration, peak = .2) {
	if (!bus) return null;
	const g = bus.ctx.createGain();
	g.gain.setValueAtTime(1e-4, bus.ctx.currentTime);
	g.gain.exponentialRampToValueAtTime(peak, bus.ctx.currentTime + .012);
	g.gain.exponentialRampToValueAtTime(1e-4, bus.ctx.currentTime + duration);
	g.connect(bus.sfx);
	return g;
}
function sfxWhoosh() {
	if (!bus || muted) return;
	const ctx = bus.ctx;
	const o = ctx.createOscillator();
	const f = ctx.createBiquadFilter();
	f.type = "bandpass";
	f.frequency.setValueAtTime(900, ctx.currentTime);
	f.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + .16);
	o.type = "sawtooth";
	o.frequency.setValueAtTime(180, ctx.currentTime);
	o.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + .16);
	const g = envGain(.18, .08);
	if (!g) return;
	o.connect(f);
	f.connect(g);
	o.start();
	o.stop(ctx.currentTime + .2);
}
function sfxOvertake() {
	if (!bus || muted) return;
	const ctx = bus.ctx;
	const o = ctx.createOscillator();
	o.type = "triangle";
	o.frequency.setValueAtTime(520 * (.96 + Math.random() * .08), ctx.currentTime);
	o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + .12);
	const g = envGain(.16, .12);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(ctx.currentTime + .18);
}
function sfxTicket() {
	if (!bus || muted) return;
	const ctx = bus.ctx;
	[
		880,
		620,
		880
	].forEach((n, i) => {
		const o = ctx.createOscillator();
		o.type = "square";
		o.frequency.value = n;
		const g = ctx.createGain();
		const t = ctx.currentTime + i * .09;
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.07, t + .02);
		g.gain.exponentialRampToValueAtTime(1e-4, t + .1);
		o.connect(g);
		g.connect(bus.sfx);
		o.start(t);
		o.stop(t + .12);
	});
}
function sfxCrash() {
	if (!bus || muted) return;
	const ctx = bus.ctx;
	const buffer = ctx.createBuffer(1, ctx.sampleRate * .4, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	const f = ctx.createBiquadFilter();
	f.type = "lowpass";
	f.frequency.value = 900;
	const g = envGain(.45, .4);
	if (!g) return;
	src.connect(f);
	f.connect(g);
	src.start();
}
function sfxClear() {
	if (!bus || muted) return;
	const ctx = bus.ctx;
	[
		392,
		523,
		659
	].forEach((n, i) => {
		const o = ctx.createOscillator();
		o.type = "sine";
		o.frequency.value = n;
		const g = ctx.createGain();
		const t = ctx.currentTime + i * .09;
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.12, t + .03);
		g.gain.exponentialRampToValueAtTime(1e-4, t + .28);
		o.connect(g);
		g.connect(bus.sfx);
		o.start(t);
		o.stop(t + .3);
	});
}
function startEngine() {
	if (!bus) return;
	stopEngine();
	const ctx = bus.ctx;
	const o = ctx.createOscillator();
	o.type = "sawtooth";
	o.frequency.value = 70;
	const f = ctx.createBiquadFilter();
	f.type = "lowpass";
	f.frequency.value = 420;
	const g = ctx.createGain();
	g.gain.value = muted ? 0 : .045;
	o.connect(f);
	f.connect(g);
	g.connect(bus.music);
	o.start();
	bus.engine = o;
	bus.engineGain = g;
	bus.engineFilter = f;
}
function updateEngine(speed, playing) {
	if (!bus?.engine || !bus.engineFilter || !bus.engineGain) return;
	const t = bus.ctx.currentTime;
	const freq = 55 + speed * .22;
	bus.engine.frequency.setTargetAtTime(freq, t, .05);
	bus.engineFilter.frequency.setTargetAtTime(280 + speed * .5, t, .08);
	bus.engineGain.gain.setTargetAtTime(playing && !muted ? .045 : 0, t, .08);
}
function stopEngine() {
	if (!bus?.engine) return;
	try {
		bus.engine.stop();
	} catch {}
	bus.engine.disconnect();
	bus.engineGain?.disconnect();
	bus.engineFilter?.disconnect();
	bus.engine = null;
	bus.engineGain = null;
	bus.engineFilter = null;
}
function resumeAudio() {
	if (bus && bus.ctx.state === "suspended") bus.ctx.resume();
}
var HORIZON_T = .16;
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function playWidth(w, _h) {
	return Math.max(360, w * .99);
}
function hash01(n) {
	let x = Math.imul((n | 0) ^ 2654435769, 374761393);
	x = Math.imul(x ^ x >>> 13, 1274126177);
	return ((x ^ x >>> 16) >>> 0) / 4294967296;
}
var SUPER = 5600;
function curveBend(worldY, levelId) {
	if (levelId < 2) return 0;
	const y = Math.max(0, worldY);
	const i = Math.floor(y / SUPER);
	const t = (y - i * SUPER) / SUPER;
	const seed = 23 + levelId * 17;
	const straightFrac = clamp((i === 0 ? .3 : .56) + hash01(i + seed) * .18 - (levelId - 2) * .012, .28, .8);
	if (t < straightFrac) return 0;
	const packT = (t - straightFrac) / Math.max(.12, 1 - straightFrac);
	const env = Math.sin(clamp(packT, 0, 1) * Math.PI);
	if (env <= .002) return 0;
	const dir = hash01(i * 7 + seed) > .5 ? 1 : -1;
	const freq = 1.05 + hash01(i * 11 + seed) * 2.35;
	const wobble = .18 + hash01(i * 13 + seed) * .28;
	const amp = (.54 + (levelId - 2) * .09) * (.78 + hash01(i * 19 + seed) * .5);
	return dir * env * (Math.sin(packT * Math.PI * freq) + Math.sin(packT * Math.PI * freq * .45 + .8) * wobble) * amp;
}
var LANE_KEYS = [
	-2,
	-1,
	0,
	1,
	2,
	3
];
var LANE_FRACS = [
	.09,
	.23,
	.445,
	.605,
	.76,
	.925
];
function laneFrac(lane) {
	if (lane <= LANE_KEYS[0]) return LANE_FRACS[0];
	if (lane >= LANE_KEYS[5]) return LANE_FRACS[5];
	for (let i = 0; i < 5; i++) {
		const a = LANE_KEYS[i];
		const b = LANE_KEYS[i + 1];
		if (lane <= b) {
			const u = (lane - a) / (b - a);
			return LANE_FRACS[i] + (LANE_FRACS[i + 1] - LANE_FRACS[i]) * u;
		}
	}
	return .605;
}
function roadAt(sy, w, h, cameraY = 0, playerY = h * .78, levelId = 1) {
	const horizon = h * HORIZON_T;
	const t = clamp((sy - horizon) / (h - horizon), 0, 1);
	const pw = playWidth(w, h);
	const roadHalf = Math.min((.36 + .66 * t) * pw * .5, w * .48 - 8);
	const worldY = cameraY + (playerY - sy);
	const bend = (curveBend(worldY, levelId) - curveBend(cameraY, levelId)) * pw * .36 * (.5 + .5 * t);
	return {
		t,
		horizon,
		cx: clamp(w / 2 + bend, roadHalf + 8, w - roadHalf - 8),
		roadHalf,
		scale: .34 + .66 * t,
		worldY
	};
}
function laneX(lane, sy, w, h, cameraY = 0, playerY = h * .78, levelId = 1) {
	const r = roadAt(sy, w, h, cameraY, playerY, levelId);
	return r.cx - r.roadHalf + laneFrac(lane) * r.roadHalf * 2;
}
var STEP = 1 / 60;
var MAX_ACC = .1;
var POOL = 72;
var PARTS = 96;
var FLOATS = 12;
var CAR_LEN = 72;
var TRUCK_LEN = 118;
var PLAYER_LEN = 70;
var SWITCH_T = .16;
var FOLLOW_DIST = 140;
var RAM_SPEED = 70;
function rand(a, b) {
	return a + Math.random() * (b - a);
}
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function createEngine() {
	const save = loadSave();
	const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let phase = "attract";
	let levelIndex = 0;
	let score = 0;
	let overtakes = 0;
	let totalOvertakes = 0;
	let combo = 0;
	let comboT = 0;
	let distance = 0;
	let banner = "";
	let bannerT = 0;
	let startLevelId = 1;
	let fromLane = 1;
	let toLane = 1;
	let switchT = 1;
	let playerWorldY = 0;
	let speed = LEVELS[0].speed;
	let invuln = 0;
	let dieT = 0;
	let trauma = 0;
	let flash = 0;
	let playerFlash = 0;
	let explodeT = -1;
	let explodeX = 0;
	let explodeY = 0;
	let w = 390;
	let h = 844;
	let nextSpawnY = 400;
	let nextOppY = 500;
	let idSeq = 1;
	let attractSteerT = 0;
	let injected = /* @__PURE__ */ new Set();
	let injectedSteer = 0;
	let noiseT = 0;
	let passLane = 1;
	let passStreak = 0;
	let heat = 0;
	let fines = 0;
	let ticketT = 0;
	let ticketCd = 0;
	let throttle = 0;
	const traffic = Array.from({ length: POOL }, () => ({
		id: 0,
		active: false,
		lane: 1,
		worldY: 0,
		kind: "sedan",
		length: CAR_LEN,
		speed: 100,
		passed: false,
		nearMissed: false,
		oncoming: false
	}));
	const particles = Array.from({ length: PARTS }, () => ({
		active: false,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		life: 0,
		max: 1,
		size: 2,
		kind: "dust"
	}));
	const floaters = Array.from({ length: FLOATS }, () => ({
		active: false,
		text: "",
		x: 0,
		y: 0,
		life: 0,
		color: "#e8eaef"
	}));
	function visualLane() {
		const t = clamp(switchT, 0, 1);
		const e = 1 - Math.pow(1 - t, 3);
		return fromLane + (toLane - fromLane) * e;
	}
	function playerScreenY() {
		return h * .78;
	}
	function screenY(worldY) {
		return playerScreenY() - (worldY - playerWorldY);
	}
	function persist() {
		save.highScore = Math.max(save.highScore, score);
		save.bestOvertakes = Math.max(save.bestOvertakes, totalOvertakes);
		writeSave(save);
	}
	function emitFloater(text, color) {
		const f = floaters.find((p) => !p.active);
		if (!f) return;
		f.active = true;
		f.text = text;
		f.x = w / 2;
		f.y = playerScreenY() - 90;
		f.life = .85;
		f.color = color;
	}
	function burst(x, y, n, kind) {
		let left = n;
		for (const p of particles) {
			if (left <= 0) break;
			if (p.active) continue;
			p.active = true;
			p.kind = kind;
			p.x = x;
			p.y = y;
			p.vx = rand(-90, 90);
			p.vy = rand(-140, 40);
			p.life = rand(.25, .7);
			p.max = p.life;
			p.size = kind === "smoke" ? rand(8, 18) : rand(2, 5);
			left--;
		}
	}
	function allocCar() {
		return traffic.find((c) => !c.active) ?? null;
	}
	function spawnCar(lane, atY, oncoming, lv) {
		const car = allocCar();
		if (!car) return;
		const police = !oncoming && Math.random() < .13;
		const truck = !oncoming && !police && Math.random() < lv.truckChance;
		const kinds = police ? ["police"] : truck ? ["truck"] : [
			"hatch",
			"sedan",
			"taxi",
			"suv"
		];
		car.active = true;
		car.id = idSeq++;
		car.lane = lane;
		car.worldY = atY + rand(-8, 8);
		car.kind = pick(kinds);
		car.length = car.kind === "truck" ? TRUCK_LEN : CAR_LEN;
		car.speed = oncoming ? -(lv.traffic * 1.55 + 90) * rand(.9, 1.12) : police ? lv.traffic * rand(1.02, 1.14) : lv.traffic * rand(.88, 1.08);
		car.passed = false;
		car.nearMissed = false;
		car.oncoming = oncoming;
	}
	function spawnRow(atY, forceLane) {
		const lv = LEVELS[levelIndex];
		const blocked = (lane) => traffic.some((c) => c.active && c.lane === lane && Math.abs(c.worldY - atY) < Math.max(c.length, CAR_LEN) * 1.8);
		if (passStreak <= 0) {
			passLane = pick([
				0,
				1,
				2
			].filter((l) => l !== passLane));
			passStreak = 3 + Math.floor(Math.random() * 4);
		}
		passStreak -= 1;
		const free = [
			0,
			1,
			2
		].filter((l) => !blocked(l) && l !== passLane);
		if (free.length === 0) return;
		const occupied = /* @__PURE__ */ new Set();
		if (forceLane !== void 0 && free.includes(forceLane)) occupied.add(forceLane);
		else {
			occupied.add(pick(free));
			if (Math.random() < lv.doubleChance && free.length >= 2) {
				const rest = free.filter((l) => !occupied.has(l));
				if (rest.length) occupied.add(pick(rest));
			}
		}
		occupied.delete(passLane);
		for (const lane of occupied) spawnCar(lane, atY, false, lv);
	}
	function spawnOncoming(atY) {
		const lv = LEVELS[levelIndex];
		if (lv.id < 2) return;
		const blocked = (lane) => traffic.some((c) => c.active && c.lane === lane && Math.abs(c.worldY - atY) < Math.max(c.length, CAR_LEN) * 1.6);
		const free = [-2, -1].filter((l) => !blocked(l));
		if (free.length === 0) return;
		const first = pick(free);
		spawnCar(first, atY, true, lv);
		if (free.length > 1 && Math.random() < .28) {
			const rest = free.filter((l) => l !== first);
			if (rest[0] !== void 0) spawnCar(rest[0], atY + rand(-40, 40), true, lv);
		}
	}
	function clearPool() {
		for (const c of traffic) c.active = false;
		for (const p of particles) p.active = false;
		for (const f of floaters) f.active = false;
	}
	function configureLevel(idx, keepScore) {
		levelIndex = clamp(idx, 0, LEVELS.length - 1);
		const lv = LEVELS[levelIndex];
		speed = lv.speed;
		if (!keepScore) {
			score = 0;
			totalOvertakes = 0;
			distance = 0;
		}
		overtakes = 0;
		combo = 0;
		comboT = 0;
		fromLane = 1;
		toLane = 1;
		switchT = 1;
		invuln = 1.4;
		dieT = 0;
		explodeT = -1;
		flash = 0;
		playerFlash = 0;
		trauma = 0;
		passLane = 1;
		passStreak = 5;
		heat = 0;
		ticketT = 0;
		ticketCd = 0;
		throttle = 0;
		banner = lv.id === 8 ? "INFINITO" : `NIVEL ${lv.id}`;
		bannerT = 1.6;
		clearPool();
		spawnRow(playerWorldY + 380, 0);
		spawnRow(playerWorldY + 620, 2);
		spawnRow(playerWorldY + 900, 0);
		nextSpawnY = playerWorldY + 1100;
		nextOppY = playerWorldY + 700;
		if (lv.id >= 2) spawnOncoming(playerWorldY + 820);
	}
	function startSwitch(next) {
		if (next === toLane) return;
		if (switchT < 1 && Math.abs(toLane - fromLane) >= 1 && next === fromLane) {
			fromLane = visualLane();
			toLane = next;
			switchT = 0;
			sfxWhoosh();
			return;
		}
		if (switchT < .55) return;
		fromLane = visualLane();
		toLane = next;
		switchT = 0;
		sfxWhoosh();
	}
	function beginAttract() {
		phase = "attract";
		playerWorldY = 0;
		configureLevel(1, false);
		invuln = 999;
		banner = "";
		updateEngine(speed, false);
	}
	function startRun(levelId) {
		startLevelId = clamp(levelId, 1, save.unlocked);
		playerWorldY = 0;
		distance = 0;
		score = 0;
		totalOvertakes = 0;
		fines = 0;
		configureLevel(startLevelId - 1, false);
		phase = "playing";
		startEngine();
		updateEngine(speed, true);
	}
	function kill() {
		if (phase !== "playing" || invuln > 0) return;
		phase = "dying";
		dieT = 0;
		explodeT = 0;
		explodeX = w / 2;
		explodeY = playerScreenY();
		trauma = reduced ? .25 : .9;
		flash = .7;
		sfxCrash();
		updateEngine(speed, false);
		burst(explodeX, explodeY, 28, "spark");
		burst(explodeX, explodeY, 10, "smoke");
		persist();
	}
	function issueFine() {
		if (phase !== "playing" || ticketCd > 0 || invuln > .25) return;
		fines += 1;
		score = Math.max(0, score - 150);
		heat = .1;
		ticketT = 1.35;
		ticketCd = 3.6;
		flash = Math.max(flash, .28);
		emitFloater("MULTA", "#c4453c");
		sfxTicket();
	}
	function step(dt, keys) {
		noiseT += dt;
		const lv = LEVELS[levelIndex];
		const left = keys.has("KeyA") || keys.has("ArrowLeft") || injected.has("KeyA") || injected.has("ArrowLeft") || injectedSteer > .4;
		const right = keys.has("KeyD") || keys.has("ArrowRight") || injected.has("KeyD") || injected.has("ArrowRight") || injectedSteer < -.4;
		const holdBoost = keys.has("KeyW") || keys.has("ArrowUp") || injected.has("KeyW") || injected.has("ArrowUp");
		const holdBrake = keys.has("KeyS") || keys.has("ArrowDown") || injected.has("KeyS") || injected.has("ArrowDown");
		if (phase === "attract") {
			attractSteerT -= dt;
			if (attractSteerT <= 0) {
				attractSteerT = rand(.8, 1.6);
				startSwitch(pick([
					0,
					1,
					2
				]));
			}
		} else if (phase === "playing") {
			if (left && !right) startSwitch(clamp(Math.round(toLane) - 1, -2, 3));
			else if (right && !left) startSwitch(clamp(Math.round(toLane) + 1, -2, 3));
		}
		if (switchT < 1) {
			const rainSlow = lv.theme === "rain" ? .78 : 1;
			const dur = SWITCH_T * (fromLane >= 0 !== toLane >= 0 ? 1.28 : 1) / rainSlow;
			switchT = clamp(switchT + dt / dur, 0, 1);
			if (switchT >= 1) fromLane = toLane;
		}
		const target = phase === "dying" ? speed * .2 : lv.speed;
		let desired = target;
		const laneNow = Math.round(visualLane());
		let leader = null;
		let leaderGap = Infinity;
		if (phase === "playing" || phase === "attract") for (const car of traffic) {
			if (!car.active || car.oncoming || car.lane !== laneNow) continue;
			const gap = car.worldY - playerWorldY;
			if (gap > 8 && gap < leaderGap) {
				leaderGap = gap;
				leader = car;
			}
		}
		if (phase === "playing") {
			if (holdBoost) desired = Math.min(560, target * 1.22);
			if (holdBrake) desired = Math.min(desired, Math.max(55, lv.traffic * .5));
			if (leader && leaderGap < FOLLOW_DIST && !holdBoost) {
				const tightness = 1 - leaderGap / FOLLOW_DIST;
				const followSpeed = leader.speed * .96;
				desired = desired * (1 - tightness * tightness) + followSpeed * tightness * tightness;
			}
		}
		const rate = holdBrake ? 7.2 : leader && leaderGap < FOLLOW_DIST ? 5.4 : 3.2;
		speed += (desired - speed) * (1 - Math.exp(-rate * dt));
		if (leader && leaderGap < (PLAYER_LEN + leader.length) * .45 && !holdBoost) speed = Math.min(speed, leader.speed);
		throttle += ((holdBrake ? -1 : holdBoost ? 1 : 0) - throttle) * (1 - Math.exp(-11 * dt));
		if (phase === "playing" || phase === "attract" || phase === "dying") {
			playerWorldY += speed * dt;
			if (phase === "playing") distance += speed * dt;
		}
		if (phase === "playing") {
			const rel = Math.max(40, speed - lv.traffic);
			const gap = Math.max(lv.spawnDistance, rel * .85, 220);
			const lookAhead = Math.max(h * .9, rel * 1.35);
			while (playerWorldY + lookAhead > nextSpawnY) {
				spawnRow(nextSpawnY);
				nextSpawnY += gap + rand(0, 36);
			}
			if (lv.id >= 2) while (playerWorldY + lookAhead > nextOppY) {
				spawnOncoming(nextOppY);
				nextOppY += 320 + rand(0, 160);
			}
		} else if (phase === "attract") {
			while (playerWorldY + h * .95 > nextSpawnY) {
				spawnRow(nextSpawnY);
				nextSpawnY += 260;
			}
			if (lv.id >= 2) while (playerWorldY + h * .95 > nextOppY) {
				spawnOncoming(nextOppY);
				nextOppY += 380;
			}
		}
		const vLane = visualLane();
		const collideLane = Math.round(vLane);
		for (const car of traffic) {
			if (!car.active) continue;
			car.worldY += car.speed * dt;
			const sy = screenY(car.worldY);
			if (sy > h + 160 || sy < -80 || car.worldY < playerWorldY - 240) {
				car.active = false;
				continue;
			}
			const overlapY = Math.abs(car.worldY - playerWorldY) < (PLAYER_LEN + car.length) * .28;
			if (phase === "playing" && overlapY) {
				if (car.lane === collideLane) {
					const ahead = car.worldY >= playerWorldY - 6;
					const closing = speed - car.speed;
					if (!car.oncoming && ahead && closing < RAM_SPEED) {
						speed = Math.min(speed, car.speed);
						const minGap = (PLAYER_LEN + car.length) * .42;
						if (car.worldY - playerWorldY < minGap) playerWorldY = car.worldY - minGap;
					} else {
						explodeX = w / 2;
						explodeY = playerScreenY() - 10;
						kill();
					}
				} else if (!car.nearMissed && Math.abs(car.lane - collideLane) === 1) {
					car.nearMissed = true;
					combo += 1;
					comboT = 1.4;
					const bonus = (car.oncoming ? 40 : 20) + combo * 5;
					score += bonus;
					flash = Math.max(flash, .12);
					emitFloater(car.oncoming ? "CONTRA" : combo > 2 ? `CERCA x${combo}` : "CERCA", "#d7dbe3");
					burst(w / 2, playerScreenY() - 40, 6, "dust");
				}
			}
			if (!car.oncoming && !car.passed && car.worldY + car.length * .2 < playerWorldY - PLAYER_LEN * .2) {
				car.passed = true;
				if (phase === "playing") {
					overtakes += 1;
					totalOvertakes += 1;
					const gained = 100 + combo * 10;
					score += gained;
					sfxOvertake();
					emitFloater("+REBASE", "#e8eaef");
					if (laneNow >= 3 || laneNow < 0) heat = Math.min(1.4, heat + .36);
					if (lv.goal > 0 && overtakes >= lv.goal) {
						phase = "clear";
						sfxClear();
						banner = "NIVEL LISTO";
						bannerT = 2;
						if (levelIndex + 2 > save.unlocked) save.unlocked = Math.min(8, levelIndex + 2);
						persist();
					}
				}
			}
		}
		if (phase === "playing") {
			score += dt * speed * .08;
			if (laneNow >= 3 || laneNow < 0) heat = Math.min(1.4, heat + dt * (laneNow < 0 ? .55 : .42));
			else heat = Math.max(0, heat - dt * .5);
			let copNear = false;
			for (const c of traffic) {
				if (!c.active || c.kind !== "police") continue;
				if (Math.abs(c.worldY - playerWorldY) < 580) {
					copNear = true;
					break;
				}
			}
			ticketCd = Math.max(0, ticketCd - dt);
			ticketT = Math.max(0, ticketT - dt);
			if (heat >= 1 && copNear) issueFine();
		}
		comboT -= dt;
		if (comboT <= 0) combo = 0;
		invuln = Math.max(0, invuln - dt);
		bannerT = Math.max(0, bannerT - dt);
		if (bannerT <= 0) banner = "";
		flash = Math.max(0, flash - dt * 2.4);
		playerFlash = Math.max(0, playerFlash - dt * 3);
		trauma = Math.max(0, trauma - dt * 1.6);
		if (explodeT >= 0) explodeT += dt;
		if (phase === "dying") {
			dieT += dt;
			if (dieT > 1.15) phase = "over";
		}
		for (const p of particles) {
			if (!p.active) continue;
			p.life -= dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vy += 80 * dt;
			if (p.life <= 0) p.active = false;
		}
		for (const f of floaters) {
			if (!f.active) continue;
			f.life -= dt;
			f.y -= 46 * dt;
			if (f.life <= 0) f.active = false;
		}
		if (phase === "playing" && Math.round(visualLane()) >= 3 && !reduced) {
			const p = particles.find((x) => !x.active);
			if (p) {
				p.active = true;
				p.kind = "dust";
				p.x = w / 2 + rand(-18, 18);
				p.y = playerScreenY() + rand(8, 22);
				p.vx = rand(-20, 20);
				p.vy = rand(30, 80);
				p.life = .35;
				p.max = .35;
				p.size = rand(2, 5);
			}
		}
		if (lv.theme === "rain" && (phase === "playing" || phase === "attract")) for (let i = 0; i < 3; i++) {
			const p = particles.find((x) => !x.active);
			if (!p) break;
			p.active = true;
			p.kind = "rain";
			p.x = rand(0, w);
			p.y = rand(-40, 0);
			p.vx = -40;
			p.vy = 780;
			p.life = .9;
			p.max = .9;
			p.size = rand(8, 16);
		}
		updateEngine(speed, phase === "playing" || phase === "attract");
	}
	let acc = 0;
	const api = {
		tick(dt, keys, canvasW, canvasH) {
			w = canvasW;
			h = canvasH;
			const d = Math.min(dt, MAX_ACC);
			if (phase === "paused" || phase === "clear" || phase === "over") {
				updateEngine(speed, false);
				return;
			}
			acc += d;
			let guard = 0;
			while (acc >= STEP && guard++ < 8) {
				step(STEP, keys);
				acc -= STEP;
			}
		},
		startRun,
		pause() {
			if (phase === "playing") phase = "paused";
		},
		resume() {
			if (phase === "paused") phase = "playing";
		},
		retry() {
			startRun(LEVELS[levelIndex].id);
		},
		nudge(dir) {
			if (phase !== "playing") return;
			startSwitch(clamp(Math.round(toLane) + (dir < 0 ? -1 : 1), -2, 3));
		},
		continueLevel() {
			if (phase !== "clear") return;
			if (levelIndex >= LEVELS.length - 1) {
				configureLevel(LEVELS.length - 1, true);
				phase = "playing";
				return;
			}
			configureLevel(levelIndex + 1, true);
			phase = "playing";
		},
		quitToTitle() {
			persist();
			beginAttract();
		},
		hud() {
			const lv = LEVELS[levelIndex];
			return {
				phase,
				score: Math.floor(score),
				highScore: Math.max(save.highScore, Math.floor(score)),
				overtakes,
				totalOvertakes,
				goal: lv.goal,
				level: lv.id,
				levelName: lv.name,
				place: lv.place,
				blurb: lv.blurb,
				speedKmh: Math.round(78 + speed * .18),
				distanceM: Math.floor(distance),
				combo,
				unlocked: save.unlocked,
				muted: save.muted,
				reducedMotion: reduced,
				banner,
				wrongWay: Math.round(visualLane()) < 0,
				throttle,
				fines,
				ticket: ticketT > 0
			};
		},
		setMuted(v) {
			save.muted = v;
			setMuted(v);
			writeSave(save);
		},
		snapshot() {
			const lv = LEVELS[levelIndex];
			const shake = reduced ? trauma * 2 : trauma * trauma * 14;
			const nx = Math.sin(noiseT * 37.1);
			const ny = Math.cos(noiseT * 29.4);
			const vl = visualLane();
			const pY = playerScreenY();
			const pX = laneX(vl, pY, w, h, playerWorldY, pY, lv.id);
			return {
				w,
				h,
				phase,
				theme: lv.theme,
				levelId: lv.id,
				cameraY: playerWorldY,
				playerX: pX,
				playerY: pY,
				playerLane: vl,
				playerRoll: 0,
				playerFlash,
				speed,
				shakeX: nx * shake,
				shakeY: ny * shake,
				flash,
				rain: lv.theme === "rain",
				traffic,
				particles,
				floaters,
				explodeT,
				explodeX,
				explodeY,
				reduced
			};
		},
		destroy() {
			stopEngine();
			if (typeof window !== "undefined" && window.__controlsTest) delete window.__controlsTest;
		}
	};
	beginAttract();
	setMuted(save.muted);
	if (typeof window !== "undefined") window.__controlsTest = {
		getYaw: () => {
			const snap = api.snapshot();
			return -(snap.playerX - snap.w / 2) / 80;
		},
		getSpeed: () => speed / 80,
		setSteer(v) {
			injectedSteer = v;
		},
		setKeys(codes) {
			injected = new Set(codes);
			injectedSteer = 0;
			if (phase === "playing") {
				if (codes.includes("KeyA") || codes.includes("ArrowLeft")) startSwitch(clamp(Math.round(toLane) - 1, -2, 3));
				else if (codes.includes("KeyD") || codes.includes("ArrowRight")) startSwitch(clamp(Math.round(toLane) + 1, -2, 3));
			}
		}
	};
	return api;
}
var KIND_SRC = {
	hatch: "hatch",
	sedan: "sedan",
	taxi: "taxi",
	suv: "suv",
	truck: "truck",
	police: "police"
};
var FRONT_SRC = {
	hatch: "hatchFront",
	sedan: "sedanFront",
	taxi: "taxiFront",
	suv: "suvFront",
	truck: "suvFront",
	police: "sedanFront"
};
function rAt(s, sy) {
	return roadAt(sy, s.w, s.h, s.cameraY, s.playerY, s.levelId);
}
function lX(s, lane, sy) {
	return laneX(lane, sy, s.w, s.h, s.cameraY, s.playerY, s.levelId);
}
function themeSky(theme) {
	switch (theme) {
		case "day": return [
			"#7ea7c4",
			"#c5d6e2",
			"#dfe7dc"
		];
		case "dusk": return [
			"#2a3344",
			"#c2784a",
			"#e8c39a"
		];
		case "night": return [
			"#07080c",
			"#12151d",
			"#1a2030"
		];
		case "rain": return [
			"#141820",
			"#1c222c",
			"#2a3038"
		];
		default: return [
			"#07080c",
			"#12151d",
			"#1a2030"
		];
	}
}
function fillSky(ctx, s) {
	const [a, b, c] = themeSky(s.theme);
	const g = ctx.createLinearGradient(0, 0, 0, s.h);
	g.addColorStop(0, a);
	g.addColorStop(.42, b);
	g.addColorStop(1, c);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, s.w, s.h);
}
function drawSunMoon(ctx, s) {
	if (s.theme === "rain") return;
	ctx.save();
	if (s.theme === "day") {
		ctx.fillStyle = "#f3f1e4";
		ctx.beginPath();
		ctx.arc(s.w * .78, s.h * .12, 22, 0, Math.PI * 2);
		ctx.fill();
	} else if (s.theme === "dusk") {
		ctx.fillStyle = "#f0c27a";
		ctx.beginPath();
		ctx.arc(s.w * .82, s.h * .18, 26, 0, Math.PI * 2);
		ctx.fill();
	} else {
		ctx.fillStyle = "#d7dbe3";
		ctx.beginPath();
		ctx.arc(s.w * .76, s.h * .1, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(215,219,227,0.18)";
		ctx.beginPath();
		ctx.arc(s.w * .76, s.h * .1, 28, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function drawHills(ctx, s) {
	const horizon = s.h * HORIZON_T;
	const shift = curveBend(s.cameraY + 700, s.levelId) * 120;
	ctx.fillStyle = s.theme === "day" ? "#4d5c4a" : s.theme === "dusk" ? "#2b2a28" : "#0c0e12";
	ctx.beginPath();
	ctx.moveTo(0, horizon + 18);
	ctx.quadraticCurveTo(s.w * .25 + shift, horizon - 36, s.w * .5 + shift * .5, horizon + 8);
	ctx.quadraticCurveTo(s.w * .75 + shift, horizon - 22, s.w, horizon + 14);
	ctx.lineTo(s.w, s.h);
	ctx.lineTo(0, s.h);
	ctx.fill();
}
function drawGround(ctx, s) {
	const horizon = s.h * HORIZON_T;
	const g = ctx.createLinearGradient(0, horizon, 0, s.h);
	if (s.theme === "day") {
		g.addColorStop(0, "#5a6848");
		g.addColorStop(1, "#3e4a32");
	} else if (s.theme === "dusk") {
		g.addColorStop(0, "#3a332c");
		g.addColorStop(1, "#2a241f");
	} else {
		g.addColorStop(0, "#16181d");
		g.addColorStop(1, "#101216");
	}
	ctx.fillStyle = g;
	ctx.fillRect(0, horizon, s.w, s.h - horizon);
}
function drawRoad(ctx, s) {
	const horizon = s.h * HORIZON_T;
	const rumble = s.theme === "day" ? ["#c4453c", "#e8eaef"] : ["#a83b34", "#cfd3da"];
	const asphalt = s.theme === "rain" ? "#22262c" : s.theme === "day" ? "#3a3e46" : "#2c3036";
	const asphaltFar = s.theme === "rain" ? "#2a2e34" : "#3f434b";
	const shoulder = s.theme === "day" ? "#4a463c" : "#323028";
	const contra = s.theme === "day" ? "#34383f" : "#262a30";
	const mark = s.theme === "night" || s.theme === "rain" ? "#d7dbe3" : "#ececec";
	const yellow = "#e2c15a";
	for (let y = Math.floor(horizon); y < s.h; y += 2) {
		const r = rAt(s, y);
		const left = r.cx - r.roadHalf;
		const width = r.roadHalf * 2;
		ctx.fillStyle = rumble[Math.floor(r.worldY / 18) % 2 === 0 ? 0 : 1];
		ctx.fillRect(left - 7, y, 7, 2);
		ctx.fillRect(left + width, y, 7, 2);
		ctx.fillStyle = r.t < .35 ? asphaltFar : asphalt;
		ctx.fillRect(left, y, width, 2);
		ctx.fillStyle = contra;
		ctx.fillRect(left, y, width * .32, 2);
		ctx.fillStyle = shoulder;
		ctx.fillRect(left + width * .84, y, width * .16, 2);
	}
	for (let y = Math.floor(horizon); y < s.h; y += 3) {
		const r = rAt(s, y);
		const left = r.cx - r.roadHalf;
		const width = Math.max(8, r.roadHalf * 2);
		const tw = Math.max(1.5, 3.4 * r.t);
		ctx.fillStyle = yellow;
		ctx.fillRect(left + width * .318 - tw / 2, y, tw, 3);
		ctx.fillRect(left + width * .348 - tw / 2, y, tw, 3);
		ctx.fillStyle = mark;
		ctx.fillRect(left + width * .84 - tw / 2, y, tw, 3);
		const world = r.worldY;
		const ownOn = (world % 56 + 56) % 56 < 28;
		const oppOn = (-world % 56 + 56) % 56 < 28;
		if (ownOn) {
			ctx.fillRect(left + width * .525 - tw / 2, y, tw, 3);
			ctx.fillRect(left + width * .685 - tw / 2, y, tw, 3);
		}
		if (oppOn) ctx.fillRect(left + width * .16 - tw / 2, y, tw, 3);
	}
}
function drawLamps(ctx, s) {
	if (s.theme === "day") return;
	const horizon = s.h * HORIZON_T;
	for (let i = 0; i < 8; i++) {
		const world = Math.floor(s.cameraY / 220) * 220 + i * 220;
		const y = s.playerY - (world - s.cameraY);
		if (y < horizon || y > s.h) continue;
		const r = rAt(s, y);
		const glow = s.theme === "night" || s.theme === "rain";
		for (const side of [-1, 1]) {
			const x = r.cx + side * (r.roadHalf + 16 * r.scale);
			ctx.fillStyle = "#1a1c20";
			ctx.fillRect(x - 1.5 * r.scale, y - 70 * r.scale, 3 * r.scale, 70 * r.scale);
			if (glow) {
				const grd = ctx.createRadialGradient(x, y - 70 * r.scale, 2, x, y - 40 * r.scale, 50 * r.scale);
				grd.addColorStop(0, "rgba(232, 210, 150, 0.45)");
				grd.addColorStop(1, "rgba(232, 210, 150, 0)");
				ctx.fillStyle = grd;
				ctx.beginPath();
				ctx.arc(x, y - 48 * r.scale, 50 * r.scale, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
}
function carImg(assets, kind, oncoming) {
	if (kind === "player") return assets.player;
	if (oncoming) return assets[FRONT_SRC[kind]];
	return assets[KIND_SRC[kind]];
}
function drawVehicle(ctx, s, assets, kind, lane, worldY, roll = 0, flash = 0, oncoming = false) {
	const sy = s.playerY - (worldY - s.cameraY);
	if (sy < s.h * .1 || sy > s.h + 40) return;
	const r = rAt(s, sy);
	const x = lX(s, lane, sy);
	const img = carImg(assets, kind, oncoming);
	const isTruck = kind === "truck";
	const baseW = clamp(r.roadHalf * 2 * .155 * (isTruck ? .94 : .84), 64 * r.scale, 176 * r.scale);
	const baseH = baseW * (img.naturalHeight && img.naturalWidth ? img.naturalHeight / img.naturalWidth : .72) * (isTruck ? 1.15 : 1);
	ctx.save();
	ctx.translate(x, sy);
	ctx.rotate(roll);
	ctx.fillStyle = "rgba(0,0,0,0.35)";
	ctx.beginPath();
	ctx.ellipse(0, baseH * .42, baseW * .38, baseH * .12, 0, 0, Math.PI * 2);
	ctx.fill();
	if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, -baseW / 2, -baseH * .72, baseW, baseH);
	else {
		ctx.fillStyle = kind === "player" ? "#e8eaef" : "#8b93a1";
		ctx.fillRect(-baseW / 2, -baseH * .7, baseW, baseH);
	}
	if (flash > 0) {
		ctx.globalAlpha = flash;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(-baseW / 2, -baseH * .72, baseW, baseH);
	}
	if (oncoming) {
		ctx.globalAlpha = s.theme === "day" ? .35 : .7;
		const glow = ctx.createRadialGradient(0, -baseH * .15, 2, 0, -baseH * .15, 28 * r.scale);
		glow.addColorStop(0, "rgba(255,236,180,0.85)");
		glow.addColorStop(1, "rgba(255,236,180,0)");
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(-baseW * .22, -baseH * .12, 16 * r.scale, 0, Math.PI * 2);
		ctx.arc(baseW * .22, -baseH * .12, 16 * r.scale, 0, Math.PI * 2);
		ctx.fill();
	} else if (kind === "police") {
		const blink = Math.floor(s.cameraY / 14) % 2 === 0;
		ctx.globalAlpha = .55;
		ctx.fillStyle = blink ? "#3d6adf" : "#c4453c";
		ctx.beginPath();
		ctx.arc(-baseW * .1, -baseH * .58, 5 * r.scale, 0, Math.PI * 2);
		ctx.arc(baseW * .1, -baseH * .58, 5 * r.scale, 0, Math.PI * 2);
		ctx.fill();
	} else if ((s.theme === "night" || s.theme === "rain") && kind !== "player") {
		ctx.globalAlpha = .35;
		ctx.fillStyle = "#c4453c";
		ctx.fillRect(-baseW * .28, -baseH * .08, 8 * r.scale, 4 * r.scale);
		ctx.fillRect(baseW * .18, -baseH * .08, 8 * r.scale, 4 * r.scale);
	}
	ctx.restore();
}
function drawTraffic(ctx, s, assets) {
	const cars = s.traffic.filter((c) => c.active).sort((a, b) => b.worldY - a.worldY);
	for (const c of cars) drawVehicle(ctx, s, assets, c.kind, c.lane, c.worldY, 0, 0, c.oncoming);
}
function drawPlayer(ctx, s, assets) {
	if (s.phase === "dying" || s.phase === "over") return;
	drawVehicle(ctx, s, assets, "player", s.playerLane, s.cameraY, s.playerRoll, s.playerFlash);
}
function drawExplode(ctx, s, assets) {
	if (s.explodeT < 0 || s.explodeT > .55) return;
	const frame = Math.min(3, Math.floor(s.explodeT / .12));
	const img = assets.explode[frame];
	if (!img?.complete) return;
	const size = 180 + s.explodeT * 80;
	ctx.drawImage(img, s.explodeX - size / 2, s.explodeY - size / 2, size, size);
}
function drawParticles(ctx, s) {
	for (const p of s.particles) {
		if (!p.active) continue;
		const a = clamp(p.life / p.max, 0, 1);
		ctx.globalAlpha = a;
		if (p.kind === "rain") {
			ctx.strokeStyle = "rgba(210,220,230,0.55)";
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.x + p.vx * .03, p.y + p.size);
			ctx.stroke();
		} else if (p.kind === "smoke") {
			ctx.fillStyle = "rgba(40,42,48,0.7)";
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size * (1.2 - a), 0, Math.PI * 2);
			ctx.fill();
		} else {
			ctx.fillStyle = p.kind === "spark" ? "#f0d0a0" : "#9aa3b0";
			ctx.fillRect(p.x, p.y, p.size, p.size);
		}
		ctx.globalAlpha = 1;
	}
}
function drawSpeedlines(ctx, s) {
	if (s.reduced || s.speed < 360) return;
	const n = Math.floor((s.speed - 340) / 30);
	ctx.strokeStyle = "rgba(232,234,239,0.18)";
	ctx.lineWidth = 1;
	for (let i = 0; i < n; i++) {
		const x = s.w * (i + 1) / (n + 1);
		const len = 18 + (s.speed - 340) * .08;
		ctx.beginPath();
		ctx.moveTo(x, s.h * .3);
		ctx.lineTo(x, s.h * .3 + len);
		ctx.stroke();
	}
}
function drawFloaters(ctx, s) {
	ctx.save();
	ctx.font = "700 22px 'Barlow Condensed', sans-serif";
	ctx.textAlign = "center";
	ctx.letterSpacing = "0.12em";
	for (const f of s.floaters) {
		if (!f.active) continue;
		ctx.globalAlpha = clamp(f.life * 1.4, 0, 1);
		ctx.fillStyle = f.color;
		ctx.fillText(f.text, f.x, f.y);
	}
	ctx.restore();
}
function drawVignette(ctx, s) {
	const g = ctx.createRadialGradient(s.w / 2, s.h * .55, s.h * .2, s.w / 2, s.h * .5, s.h * .78);
	g.addColorStop(0, "rgba(0,0,0,0)");
	g.addColorStop(1, "rgba(0,0,0,0.42)");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, s.w, s.h);
	if (s.flash > 0) {
		ctx.fillStyle = `rgba(255,255,255,${s.flash * .35})`;
		ctx.fillRect(0, 0, s.w, s.h);
	}
}
function drawWorld(ctx, s, assets) {
	ctx.save();
	ctx.translate(s.shakeX, s.shakeY);
	fillSky(ctx, s);
	drawSunMoon(ctx, s);
	drawHills(ctx, s);
	drawGround(ctx, s);
	drawRoad(ctx, s);
	drawLamps(ctx, s);
	drawTraffic(ctx, s, assets);
	drawPlayer(ctx, s, assets);
	drawExplode(ctx, s, assets);
	drawParticles(ctx, s);
	drawSpeedlines(ctx, s);
	drawFloaters(ctx, s);
	drawVignette(ctx, s);
	ctx.restore();
}
function loadAssets() {
	const names = [
		"player",
		"hatch",
		"sedan",
		"taxi",
		"suv",
		"truck",
		"police"
	];
	const load = (src) => new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`sprite ${src}`));
		img.src = src;
	});
	return Promise.all([
		...names.map((n) => load(`/sprites/${n}.png?v=2`)),
		load("/sprites/hatch-front.png?v=1"),
		load("/sprites/sedan-front.png?v=1"),
		load("/sprites/taxi-front.png?v=1"),
		load("/sprites/suv-front.png?v=1"),
		load("/sprites/explode-1.png"),
		load("/sprites/explode-2.png"),
		load("/sprites/explode-3.png"),
		load("/sprites/explode-4.png")
	]).then((imgs) => ({
		player: imgs[0],
		hatch: imgs[1],
		sedan: imgs[2],
		taxi: imgs[3],
		suv: imgs[4],
		truck: imgs[5],
		police: imgs[6],
		hatchFront: imgs[7],
		sedanFront: imgs[8],
		taxiFront: imgs[9],
		suvFront: imgs[10],
		explode: [
			imgs[11],
			imgs[12],
			imgs[13],
			imgs[14]
		]
	}));
}
function emptyAssets() {
	const blank = new Image();
	return {
		player: blank,
		hatch: blank,
		sedan: blank,
		taxi: blank,
		suv: blank,
		truck: blank,
		police: blank,
		hatchFront: blank,
		sedanFront: blank,
		taxiFront: blank,
		suvFront: blank,
		explode: [
			blank,
			blank,
			blank,
			blank
		]
	};
}
function gestureUnlock() {
	unlockAudio();
}
function Game() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const keysRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const swipeRef = (0, import_react.useRef)(null);
	const hudKey = (0, import_react.useRef)("");
	const [hud, setHud] = (0, import_react.useState)(null);
	const [menu, setMenu] = (0, import_react.useState)("title");
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const engine = createEngine();
		engineRef.current = engine;
		let assets = emptyAssets();
		let raf = 0;
		let last = performance.now();
		let cssW = 390;
		let cssH = 844;
		let alive = true;
		loadAssets().then((a) => {
			assets = a;
			if (alive) setLoaded(true);
		}).catch(() => {
			if (alive) setLoaded(true);
		});
		const resize = () => {
			const parent = canvas.parentElement ?? document.body;
			cssW = parent.clientWidth || window.innerWidth;
			cssH = parent.clientHeight || window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.floor(cssW * dpr);
			canvas.height = Math.floor(cssH * dpr);
			canvas.style.width = `${cssW}px`;
			canvas.style.height = `${cssH}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		const loop = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			engine.tick(dt, keysRef.current, cssW, cssH);
			drawWorld(ctx, engine.snapshot(), assets);
			const next = engine.hud();
			const key = `${next.phase}|${next.score}|${next.overtakes}|${next.level}|${next.banner}|${next.muted}|${next.speedKmh}|${next.goal}|${next.wrongWay}|${next.fines}|${next.ticket}|${Math.round(next.throttle * 24)}`;
			if (key !== hudKey.current) {
				hudKey.current = key;
				setHud(next);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		const onKey = (e, down) => {
			if (down && (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "ArrowUp" || e.code === "Space")) e.preventDefault();
			if (down) keysRef.current.add(e.code);
			else keysRef.current.delete(e.code);
			if (down && e.code === "Escape") {
				const h = engine.hud();
				if (h.phase === "playing") engine.pause();
				else if (h.phase === "paused") engine.resume();
			}
			if (down && e.code === "KeyP") {
				const h = engine.hud();
				if (h.phase === "playing") engine.pause();
				else if (h.phase === "paused") engine.resume();
			}
		};
		const down = (e) => onKey(e, true);
		const up = (e) => onKey(e, false);
		const blur = () => keysRef.current.clear();
		const vis = () => {
			if (document.visibilityState === "visible") resumeAudio();
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		window.addEventListener("blur", blur);
		window.addEventListener("resize", resize);
		document.addEventListener("visibilitychange", vis);
		return () => {
			alive = false;
			cancelAnimationFrame(raf);
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
			window.removeEventListener("blur", blur);
			window.removeEventListener("resize", resize);
			document.removeEventListener("visibilitychange", vis);
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	const play = (levelId) => {
		gestureUnlock();
		engineRef.current?.startRun(levelId);
		setMenu("hidden");
	};
	(0, import_react.useEffect)(() => {
		const onEnter = (e) => {
			if (e.code !== "Enter" && e.code !== "NumpadEnter") return;
			if (e.repeat) return;
			e.preventDefault();
			gestureUnlock();
			const phase = hud?.phase ?? "attract";
			if (menu === "title" && (phase === "attract" || phase === "over")) {
				play(1);
				return;
			}
			if (menu === "howto") {
				setMenu("title");
				return;
			}
			if (phase === "clear") {
				engineRef.current?.continueLevel();
				return;
			}
			if (phase === "over" && menu === "hidden") {
				engineRef.current?.retry();
				return;
			}
			if (phase === "paused") engineRef.current?.resume();
		};
		window.addEventListener("keydown", onEnter);
		return () => window.removeEventListener("keydown", onEnter);
	}, [menu, hud]);
	const onPointerDown = (e) => {
		swipeRef.current = {
			x: e.clientX,
			y: e.clientY
		};
	};
	const onPointerUp = (e) => {
		const start = swipeRef.current;
		swipeRef.current = null;
		if (!start || menu !== "hidden") return;
		const dx = e.clientX - start.x;
		const dy = e.clientY - start.y;
		if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return;
		engineRef.current?.nudge(dx < 0 ? -1 : 1);
	};
	const phase = hud?.phase ?? "attract";
	const showTitle = menu === "title" && (phase === "attract" || phase === "over");
	const showHow = menu === "howto";
	const showLevels = menu === "levels";
	const playing = phase === "playing" && menu === "hidden";
	const paused = phase === "paused";
	const cleared = phase === "clear";
	const over = phase === "over" && menu === "hidden";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "game-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "game-canvas",
				onPointerDown,
				onPointerUp,
				onPointerCancel: () => {
					swipeRef.current = null;
				}
			}),
			playing && hud && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hud-chip",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-display text-[11px] tracking-[0.18em] text-muted uppercase",
								children: ["Nivel ", hud.level]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-lg leading-tight tracking-wide",
								children: hud.levelName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hud-chip text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-[11px] tracking-[0.18em] text-muted uppercase",
								children: "Rebases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-lg leading-tight tabular-nums",
								children: hud.goal > 0 ? `${hud.overtakes}/${hud.goal}` : hud.overtakes
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hud-chip text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-[11px] tracking-[0.18em] text-muted uppercase",
								children: "Puntos"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-lg leading-tight tabular-nums",
								children: hud.score
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-3 top-[92px] hud-actions",
					style: { top: "max(92px, calc(env(safe-area-inset-top) + 76px))" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-btn",
						"aria-label": "Pausa",
						onClick: () => engineRef.current?.pause(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 18 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-btn",
						"aria-label": hud.muted ? "Activar sonido" : "Silenciar",
						onClick: () => {
							gestureUnlock();
							engineRef.current?.setMuted(!hud.muted);
						},
						children: hud.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 18 })
					})]
				}),
				hud.ticket ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ticket-chip",
					children: "Multa"
				}) : null,
				hud.wrongWay ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "wrong-chip",
					children: "Sentido contrario"
				}) : null,
				hud.banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "banner text-3xl md:text-4xl whitespace-nowrap",
					children: hud.banner
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "touch-bar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "touch-btn",
							"aria-label": "Carril izquierdo",
							onPointerDown: () => engineRef.current?.nudge(-1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 28 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "speed-stack pointer-events-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "speed-read",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "speed-num tabular-nums",
										children: hud.speedKmh
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "speed-unit",
										children: "km/h"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "throt",
									style: { ["--t"]: `${(hud.throttle + 1) / 2 * 100}%` },
									"data-mode": hud.throttle > .2 ? "gas" : hud.throttle < -.2 ? "brake" : "coast",
									"aria-label": "Aceleración",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "throt-track",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "throt-zero" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "throt-needle" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "throt-labels",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Freno" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gas" })]
									})]
								}),
								hud.fines > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "fines-note",
									children: [
										hud.fines,
										" ",
										hud.fines === 1 ? "multa" : "multas"
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "touch-btn",
									"aria-label": "Frenar",
									onPointerDown: (e) => {
										e.stopPropagation();
										keysRef.current.add("ArrowDown");
									},
									onPointerUp: () => keysRef.current.delete("ArrowDown"),
									onPointerCancel: () => keysRef.current.delete("ArrowDown"),
									onPointerLeave: () => keysRef.current.delete("ArrowDown"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsDown, { size: 28 })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "touch-btn",
							"aria-label": "Carril derecho",
							onPointerDown: () => engineRef.current?.nudge(1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 28 })
						})
					]
				})
			] }),
			showTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overlay-scrim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[11px] tracking-[0.28em] text-muted uppercase",
							children: "Autopista"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-6xl font-extrabold tracking-[0.12em] leading-none mt-1",
							children: "REBASE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-[2px] w-16 bg-danger" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted leading-relaxed",
							children: "Adelanta por los carriles, el acotamiento o el sentido contrario. Completa cada tramo."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary",
									onClick: () => play(1),
									children: "Jugar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-secondary",
									onClick: () => setMenu("levels"),
									children: "Niveles"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => setMenu("howto"),
									children: "Cómo se juega"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-xs tracking-[0.16em] uppercase text-faint",
							children: "Enter para jugar"
						}),
						hud && hud.highScore > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-center text-xs tracking-[0.16em] uppercase text-faint tabular-nums",
							children: [
								"Mejor ",
								hud.highScore,
								" · ",
								hud.unlocked,
								"/8 abiertos"
							]
						})
					]
				})
			}),
			showHow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overlay-scrim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl tracking-[0.08em] uppercase",
							children: "Cómo se juega"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-3 text-sm text-muted leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "El auto avanza solo. Tú eliges el carril y el ritmo." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: "A / ←"
									}),
									" izquierda · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: "D / →"
									}),
									" derecha."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: "S / ↓"
								}), " frena. Puedes ir detrás de un auto y esperar un hueco."] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: "Enter"
								}), " arranca o pasa al siguiente tramo."] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A la derecha hay acotamiento para rebasar. A la izquierda, sentido contrario." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Si rebasas mucho por ahí, la patrulla te multa. La multa es breve: sigues en la carrera." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: "↑"
									}),
									" acelera · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: "↓"
									}),
									" frena. La barra bajo la velocidad lo muestra."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Desde el segundo tramo la pista curva y vienen autos de frente." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "En el teléfono: desliza, botones de carril y el botón de freno." })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary mt-6",
							onClick: () => setMenu("title"),
							children: "Entendido"
						})
					]
				})
			}),
			showLevels && hud && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overlay-scrim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl tracking-[0.08em] uppercase",
							children: "Tramos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "level-grid mt-4",
							children: LEVELS.map((lv) => {
								const locked = lv.id > hud.unlocked;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "level-cell",
									"data-locked": locked,
									disabled: locked,
									onClick: () => play(lv.id),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-display text-[11px] tracking-[0.16em] text-muted uppercase",
											children: locked ? "Cerrado" : `Nivel ${lv.id}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-display text-lg leading-tight mt-1",
											children: lv.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-faint mt-0.5",
											children: lv.place
										})
									]
								}, lv.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost mt-3",
							onClick: () => setMenu("title"),
							children: "Volver"
						})
					]
				})
			}),
			paused && hud && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overlay-scrim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl tracking-[0.08em] uppercase",
							children: "Pausa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								hud.levelName,
								" · ",
								hud.place
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "btn btn-primary",
									onClick: () => engineRef.current?.resume(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 }), " Seguir"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-secondary",
									onClick: () => {
										gestureUnlock();
										engineRef.current?.setMuted(!hud.muted);
									},
									children: hud.muted ? "Sonido: no" : "Sonido: sí"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => {
										engineRef.current?.quitToTitle();
										setMenu("title");
									},
									children: "Salir"
								})
							]
						})
					]
				})
			}),
			cleared && hud && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overlay-scrim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[11px] tracking-[0.24em] text-muted uppercase",
							children: "Tramo listo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl tracking-[0.08em] uppercase mt-1",
							children: hud.levelName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								hud.overtakes,
								" rebasadas · ",
								hud.score,
								" puntos"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								onClick: () => engineRef.current?.continueLevel(),
								children: hud.level >= 8 ? "Seguir en infinito" : "Siguiente tramo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => {
									engineRef.current?.quitToTitle();
									setMenu("title");
								},
								children: "Menú"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-xs tracking-[0.16em] uppercase text-faint",
							children: "Enter para seguir"
						})
					]
				})
			}),
			over && hud && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overlay-scrim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[11px] tracking-[0.24em] text-danger uppercase",
							children: "Choque"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl tracking-[0.08em] uppercase mt-1",
							children: "Se acabó"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted leading-relaxed",
							children: [
								hud.totalOvertakes,
								" rebasadas · ",
								hud.score,
								" puntos",
								hud.score >= hud.highScore && hud.score > 0 ? " · récord" : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								onClick: () => engineRef.current?.retry(),
								children: "Reintentar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-secondary",
								onClick: () => {
									engineRef.current?.quitToTitle();
									setMenu("title");
								},
								children: "Menú"
							})]
						})
					]
				})
			}),
			!loaded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 pointer-events-none flex items-end justify-center pb-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display tracking-[0.22em] text-xs uppercase text-muted",
					children: "Cargando pista"
				})
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Game, {});
}
//#endregion
export { Home as component };
