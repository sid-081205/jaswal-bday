"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { burst, emojiBurst } from "@/lib/fx";
import { say, sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, FACES, Page, SkipLink } from "../ui";

const GOAL = 8;
const BAD = ["📅", "⏰", "🐌", "🚧", "📮"];
const BAD_LABEL: Record<string, string> = {
  "📅": "missed bday",
  "⏰": "late",
  "🐌": "royal mail",
  "🚧": "",
  "📮": "lost letter",
};

type Item = { lane: number; y: number; e: string; good: boolean; hit?: boolean };

export default function Arcade() {
  const { next, shake } = useExperience();
  const [state, setState] = useState<"ready" | "playing" | "won">("ready");
  const [cakes, setCakes] = useState(0);
  const [flash, setFlash] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lane = useRef(1);
  const face = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = FACES.smile;
    face.current = img;
  }, []);

  const move = useCallback((d: number) => {
    lane.current = Math.max(0, Math.min(2, lane.current + d));
    sfx.click();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "KeyA"].includes(e.code)) move(-1);
      if (["ArrowRight", "KeyD"].includes(e.code)) move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    if (state !== "playing") return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);

    let items: Item[] = [];
    let score = 0;
    let speed = 260;
    let spawn = 0;
    let scroll = 0;
    let inv = 0;
    let px = W / 2;
    let last = performance.now();
    let raf = 0;
    let engineT = 0;
    const laneX = (l: number) => (W / 3) * l + W / 6;
    const py = H - 90;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += dt * 9;
      scroll = (scroll + speed * dt) % 80;
      spawn -= dt;
      inv = Math.max(0, inv - dt);
      engineT -= dt;
      if (engineT <= 0) {
        sfx.engine();
        engineT = 0.12;
      }
      if (spawn <= 0) {
        const good = Math.random() < 0.42;
        items.push({
          lane: Math.floor(Math.random() * 3),
          y: -60,
          e: good ? "🎂" : BAD[Math.floor(Math.random() * BAD.length)],
          good,
        });
        spawn = Math.max(0.38, 0.95 - speed / 1400);
      }
      px += (laneX(lane.current) - px) * Math.min(1, dt * 14);

      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#14001f");
      g.addColorStop(1, "#3a0a5e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#ff2e88";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#ff2e88";
      ctx.shadowBlur = 14;
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -scroll;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo((W / 3) * i, 0);
        ctx.lineTo((W / 3) * i, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.strokeStyle = "#2de2e6";
      ctx.shadowColor = "#2de2e6";
      ctx.strokeRect(3, -10, W - 6, H + 20);
      ctx.shadowBlur = 0;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      items.forEach((it) => {
        it.y += speed * dt;
        ctx.font = "44px serif";
        ctx.fillText(it.e, laneX(it.lane), it.y);
        if (!it.good && BAD_LABEL[it.e]) {
          ctx.font = "10px monospace";
          ctx.fillStyle = "#ffe14d";
          ctx.fillText(BAD_LABEL[it.e], laneX(it.lane), it.y + 30);
          ctx.fillStyle = "#000";
        }
        if (!it.hit && it.lane === lane.current && Math.abs(it.y - py) < 42) {
          it.hit = true;
          if (it.good) {
            score++;
            sfx.coin();
            setFlash("+1 🎂");
          } else if (inv <= 0) {
            score = Math.max(0, score - 1);
            inv = 1.2;
            sfx.buzzer();
            shake("sm");
            setFlash(it.e === "🐌" ? "ROYAL MAIL GOT YOU 🐌" : "OUCH -1 🎂");
          }
          setCakes(score);
        }
      });
      items = items.filter((it) => it.y < H + 60 && !(it.hit && it.good));

      ctx.globalAlpha = inv > 0 && Math.floor(inv * 10) % 2 ? 0.3 : 1;
      ctx.font = "60px serif";
      ctx.save();
      ctx.translate(px, py + 18);
      ctx.scale(-1, 1);
      ctx.fillText("🏍️", 0, 0);
      ctx.restore();
      if (face.current?.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py - 26, 24, 0, Math.PI * 2);
        ctx.closePath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffe14d";
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(face.current, px - 24, py - 50, 48, 48);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (score >= GOAL) {
        setState("won");
        sfx.win();
        burst(0.5, 0.5, 200);
        emojiBurst("🎂", 0.5, 0.4, 30);
        say("new high score. birthday queen.");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, shake]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 700);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <Page chapter="CHAPTER 4" title="ARCADE RAMPAGE" bg="bg-[#14001f]">
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/arcade.webp" alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-md" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-10 px-3 pt-28 md:pt-24">
        <motion.div
          initial={{ x: -300, rotate: -20 }}
          animate={{ x: 0, rotate: -5 }}
          className="sticker relative hidden bg-white p-3 pb-12 lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/arcade.webp" alt="Navya racing at the arcade" className="h-[52vh] w-auto" />
          <div className="font-hand absolute bottom-1 left-0 right-0 text-center text-2xl">
            training montage 🏍️💨
          </div>
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="font-pixel mb-3 text-center text-[10px] leading-5 text-cyan md:text-xs">
            To cope with the betrayal she became
            <br />
            an ILLEGAL ARCADE STREET RACER.
          </div>
          <div className="relative h-[56vh] w-[min(88vw,380px)] overflow-hidden rounded-xl border-4 border-cyan shadow-[0_0_40px_#2de2e6]">
            <canvas
              ref={canvasRef}
              className="h-full w-full"
              onPointerDown={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                move(e.clientX - r.left < r.width / 2 ? -1 : 1);
              }}
            />
            <div className="font-pixel pointer-events-none absolute left-2 top-2 text-xs text-yellow">
              🎂 {cakes}/{GOAL}
            </div>
            {flash && (
              <motion.div
                key={flash + cakes}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                className="font-pixel pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-white"
              >
                {flash}
              </motion.div>
            )}
            {state === "ready" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-4 text-center">
                <div className="font-pixel text-sm leading-6 text-pink neon">BIRTHDAY RUSH</div>
                <div className="font-pixel text-[10px] leading-5 text-white">
                  collect {GOAL} 🎂
                  <br />
                  dodge 📅 ⏰ 🐌 📮
                  <br />
                  ← → / A D / tap sides
                </div>
                <Btn onClick={() => setState("playing")} color="var(--pink)">
                  INSERT COIN 🪙
                </Btn>
              </div>
            )}
            {state === "won" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-4 text-center">
                <div className="font-pixel rainbow-text text-lg leading-8">
                  NEW HIGH SCORE
                  <br />
                  BIRTHDAY QUEEN 👑
                </div>
                <Btn onClick={next}>next page →</Btn>
              </div>
            )}
          </div>
          {state === "playing" && (
            <div className="mt-3 flex gap-6 md:hidden">
              <button onPointerDown={() => move(-1)} className="font-comic sticker-sm rounded-xl bg-yellow px-8 py-3 text-3xl">
                ◀
              </button>
              <button onPointerDown={() => move(1)} className="font-comic sticker-sm rounded-xl bg-yellow px-8 py-3 text-3xl">
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
      {state !== "won" && <SkipLink onSkip={next} after={30000} />}
    </Page>
  );
}
