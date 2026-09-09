import { Pause, Volume2, VolumeX } from "lucide-react";
import { DIFFICULTY_LABEL } from "./levels";
import type { Engine } from "./engine";
import type { Hud } from "./types";

export function HudBar({
  hud,
  engine,
  onUnlockAudio,
}: {
  hud: Hud;
  engine: Engine | null;
  onUnlockAudio: () => void;
}) {
  return (
    <>
      <div className="hud">
        <div className="hud-chip hud-chip-level">
          <div className="font-display text-[11px] tracking-[0.18em] text-muted uppercase">
            Nivel {hud.level} · {hud.levelName}
          </div>
          <div className="hud-route">{hud.route}</div>
        </div>
        <div className="hud-stats">
          <div className="hud-chip text-center">
            <div className="font-display text-[11px] tracking-[0.18em] text-muted uppercase">Rebases</div>
            <div className="font-display text-lg leading-tight tabular-nums">
              {hud.goal > 0 ? `${hud.overtakes}/${hud.goal}` : hud.overtakes}
            </div>
          </div>
          <div className="hud-chip text-right">
            <div className="font-display text-[11px] tracking-[0.18em] text-muted uppercase">Puntos</div>
            <div className="font-display text-lg leading-tight tabular-nums">{hud.score}</div>
          </div>
        </div>
      </div>
      <div className="hud-rail hud-rail-left">
        <button
          className="hud-tool"
          aria-label="Tramo anterior"
          disabled={hud.level <= 1}
          onClick={() => engine?.skipLevel(-1)}
        >
          ← Tramo
        </button>
        <button className="icon-btn" aria-label="Pausa" onClick={() => engine?.pause()}>
          <Pause size={18} />
        </button>
      </div>
      <div className="hud-rail hud-rail-right">
        <button className="hud-tool hud-tool-accent" aria-label="Cambiar dificultad" onClick={() => engine?.cycleDifficulty()}>
          {DIFFICULTY_LABEL[hud.difficulty]}
        </button>
        <button
          className="hud-tool"
          aria-label="Tramo siguiente"
          disabled={hud.level >= 8}
          onClick={() => engine?.skipLevel(1)}
        >
          Tramo →
        </button>
        <button
          className="icon-btn"
          aria-label={hud.muted ? "Activar sonido" : "Silenciar"}
          onClick={() => {
            onUnlockAudio();
            engine?.setMuted(!hud.muted);
          }}
        >
          {hud.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </>
  );
}
