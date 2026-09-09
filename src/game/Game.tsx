import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsDown, Play } from "lucide-react";
import { createEngine, type Engine } from "./engine";
import { drawWorld, emptyAssets, loadAssets } from "./render";
import { DIFFICULTY_LABEL, LEVELS } from "./levels";
import { HudBar } from "./HudBar";
import * as audio from "./audio";
import type { Hud } from "./types";

type Menu = "title" | "howto" | "levels" | "hidden";

function gestureUnlock() {
  audio.unlockAudio();
}

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const keysRef = useRef(new Set<string>());
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const hudKey = useRef("");
  const [hud, setHud] = useState<Hud | null>(null);
  const [menu, setMenu] = useState<Menu>("title");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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

    void loadAssets()
      .then((a) => {
        assets = a;
        if (alive) setLoaded(true);
      })
      .catch(() => {
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

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      engine.tick(dt, keysRef.current, cssW, cssH);
      drawWorld(ctx, engine.snapshot(), assets);
      const next = engine.hud();
      const key = `${next.phase}|${next.score}|${next.overtakes}|${next.level}|${next.banner}|${next.muted}|${next.speedKmh}|${next.goal}|${next.wrongWay}|${next.fines}|${next.ticket}|${next.difficulty}|${Math.round(next.throttle * 24)}`;
      if (key !== hudKey.current) {
        hudKey.current = key;
        setHud(next);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (down && (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "ArrowUp" || e.code === "Space")) {
        e.preventDefault();
      }
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
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    const blur = () => keysRef.current.clear();
    const vis = () => {
      if (document.visibilityState === "visible") audio.resumeAudio();
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

  const play = (levelId: number) => {
    gestureUnlock();
    engineRef.current?.startRun(levelId);
    setMenu("hidden");
  };

  useEffect(() => {
    const onEnter = (e: KeyboardEvent) => {
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

  const onPointerDown = (e: React.PointerEvent) => {
    swipeRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
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

  return (
    <div className="game-root">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeRef.current = null;
        }}
      />

      {playing && hud && (
        <>
          <HudBar hud={hud} engine={engineRef.current} onUnlockAudio={gestureUnlock} />
          {hud.ticket ? <div className="ticket-chip">Multa</div> : null}
          {hud.wrongWay ? <div className="wrong-chip">Sentido contrario</div> : null}
          {hud.banner ? (
            <div className="banner text-3xl md:text-4xl whitespace-nowrap">{hud.banner}</div>
          ) : null}
          <div className="touch-bar">
            <button className="touch-btn" aria-label="Carril izquierdo" onPointerDown={() => engineRef.current?.nudge(-1)}>
              <ChevronLeft size={28} />
            </button>
            <div className="speed-stack pointer-events-auto">
              <div className="speed-read">
                <span className="speed-num tabular-nums">{hud.speedKmh}</span>
                <span className="speed-unit">km/h</span>
              </div>
              <div
                className="throt"
                style={{ ["--t" as string]: `${((hud.throttle + 1) / 2) * 100}%` }}
                data-mode={hud.throttle > 0.2 ? "gas" : hud.throttle < -0.2 ? "brake" : "coast"}
                aria-label="Aceleración"
              >
                <div className="throt-track">
                  <span className="throt-zero" />
                  <span className="throt-needle" />
                </div>
                <div className="throt-labels">
                  <span>Freno</span>
                  <span>Gas</span>
                </div>
              </div>
              {hud.fines > 0 ? (
                <div className="fines-note">
                  {hud.fines} {hud.fines === 1 ? "multa" : "multas"}
                </div>
              ) : null}
              <button
                className="touch-btn"
                aria-label="Frenar"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  keysRef.current.add("ArrowDown");
                }}
                onPointerUp={() => keysRef.current.delete("ArrowDown")}
                onPointerCancel={() => keysRef.current.delete("ArrowDown")}
                onPointerLeave={() => keysRef.current.delete("ArrowDown")}
              >
                <ChevronsDown size={28} />
              </button>
            </div>
            <button className="touch-btn" aria-label="Carril derecho" onPointerDown={() => engineRef.current?.nudge(1)}>
              <ChevronRight size={28} />
            </button>
          </div>
        </>
      )}

      {showTitle && (
        <div className="overlay-scrim">
          <div className="panel">
            <p className="font-display text-[11px] tracking-[0.28em] text-muted uppercase">Autopista</p>
            <h1 className="font-display text-6xl font-extrabold tracking-[0.12em] leading-none mt-1">REBASE</h1>
            <div className="mt-2 h-[2px] w-16 bg-danger" />
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Adelanta por los carriles, el acotamiento o el sentido contrario. Completa cada tramo.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button className="btn btn-primary" onClick={() => play(1)}>
                Jugar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  gestureUnlock();
                  engineRef.current?.cycleDifficulty();
                }}
              >
                Dificultad: {hud ? DIFFICULTY_LABEL[hud.difficulty] : "Medio"}
              </button>
              <button className="btn btn-secondary" onClick={() => setMenu("levels")}>
                Niveles
              </button>
              <button className="btn btn-ghost" onClick={() => setMenu("howto")}>
                Cómo se juega
              </button>
            </div>
            <p className="mt-3 text-center text-xs tracking-[0.16em] uppercase text-faint">Enter para jugar</p>
            {hud && hud.highScore > 0 && (
              <p className="mt-4 text-center text-xs tracking-[0.16em] uppercase text-faint tabular-nums">
                Mejor {hud.highScore} · {hud.unlocked}/8 abiertos
              </p>
            )}
          </div>
        </div>
      )}

      {showHow && (
        <div className="overlay-scrim">
          <div className="panel">
            <h2 className="font-display text-3xl tracking-[0.08em] uppercase">Cómo se juega</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
              <li>El auto avanza solo. Tú eliges el carril y el ritmo.</li>
              <li>
                <span className="text-fg">A / ←</span> izquierda · <span className="text-fg">D / →</span> derecha.
              </li>
              <li>
                <span className="text-fg">S / ↓</span> frena. Puedes ir detrás de un auto y esperar un hueco.
              </li>
              <li>
                <span className="text-fg">Enter</span> arranca o pasa al siguiente tramo.
              </li>
              <li>A la derecha hay acotamiento para rebasar. A la izquierda, sentido contrario.</li>
              <li>Si rebasas mucho por ahí, la patrulla te multa. La multa es breve: sigues en la carrera.</li>
              <li>
                <span className="text-fg">↑</span> acelera · <span className="text-fg">↓</span> frena. La barra bajo la velocidad lo muestra.
              </li>
              <li>Desde el segundo tramo la pista curva y vienen autos de frente.</li>
              <li>Arriba: Tramo salta de circuito. El botón del centro cambia Básico, Medio, Avanzado o Pro.</li>
              <li>En el teléfono: desliza, botones de carril y el botón de freno.</li>
            </ul>
            <button className="btn btn-primary mt-6" onClick={() => setMenu("title")}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {showLevels && hud && (
        <div className="overlay-scrim">
          <div className="panel">
            <h2 className="font-display text-3xl tracking-[0.08em] uppercase">Tramos</h2>
            <div className="level-grid mt-4">
              {LEVELS.map((lv) => {
                const locked = lv.id > hud.unlocked;
                return (
                  <button
                    key={lv.id}
                    className="level-cell"
                    data-locked={locked}
                    disabled={locked}
                    onClick={() => play(lv.id)}
                  >
                    <div className="font-display text-[11px] tracking-[0.16em] text-muted uppercase">
                      {locked ? "Cerrado" : `Nivel ${lv.id}`}
                    </div>
                    <div className="font-display text-lg leading-tight mt-1">{lv.name}</div>
                    <div className="text-xs text-faint mt-0.5">{lv.route}</div>
                  </button>
                );
              })}
            </div>
            <button className="btn btn-ghost mt-3" onClick={() => setMenu("title")}>
              Volver
            </button>
          </div>
        </div>
      )}

      {paused && hud && (
        <div className="overlay-scrim">
          <div className="panel">
            <h2 className="font-display text-3xl tracking-[0.08em] uppercase">Pausa</h2>
            <p className="mt-2 text-sm text-muted">
              {hud.levelName} · {hud.route}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button className="btn btn-primary" onClick={() => engineRef.current?.resume()}>
                <Play size={16} /> Seguir
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  gestureUnlock();
                  engineRef.current?.setMuted(!hud.muted);
                }}
              >
                {hud.muted ? "Sonido: no" : "Sonido: sí"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  engineRef.current?.quitToTitle();
                  setMenu("title");
                }}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {cleared && hud && (
        <div className="overlay-scrim">
          <div className="panel">
            <p className="font-display text-[11px] tracking-[0.24em] text-muted uppercase">Tramo listo</p>
            <h2 className="font-display text-4xl tracking-[0.08em] uppercase mt-1">{hud.levelName}</h2>
            <p className="mt-2 text-sm text-muted">{hud.overtakes} rebasadas · {hud.score} puntos</p>
            <div className="mt-6 flex flex-col gap-2">
              <button className="btn btn-primary" onClick={() => engineRef.current?.continueLevel()}>
                {hud.level >= 8 ? "Seguir en infinito" : "Siguiente tramo"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  engineRef.current?.quitToTitle();
                  setMenu("title");
                }}
              >
                Menú
              </button>
            </div>
            <p className="mt-3 text-center text-xs tracking-[0.16em] uppercase text-faint">Enter para seguir</p>
          </div>
        </div>
      )}

      {over && hud && (
        <div className="overlay-scrim">
          <div className="panel">
            <p className="font-display text-[11px] tracking-[0.24em] text-danger uppercase">Choque</p>
            <h2 className="font-display text-4xl tracking-[0.08em] uppercase mt-1">Se acabó</h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {hud.totalOvertakes} rebasadas · {hud.score} puntos
              {hud.score >= hud.highScore && hud.score > 0 ? " · récord" : ""}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button className="btn btn-primary" onClick={() => engineRef.current?.retry()}>
                Reintentar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  engineRef.current?.quitToTitle();
                  setMenu("title");
                }}
              >
                Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {!loaded && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-10">
          <p className="font-display tracking-[0.22em] text-xs uppercase text-muted">Cargando pista</p>
        </div>
      )}
    </div>
  );
}
