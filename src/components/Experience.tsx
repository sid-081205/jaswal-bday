"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emojiBurst } from "@/lib/fx";
import { isMuted, setMuted, sfx } from "@/lib/sfx";
import { ExperienceContext, type ShakeLevel } from "./context";
import Arcade from "./scenes/Arcade";
import Birthday from "./scenes/Birthday";
import Book from "./scenes/Book";
import Boot from "./scenes/Boot";
import Coconut from "./scenes/Coconut";
import Letter from "./scenes/Letter";
import Palm from "./scenes/Palm";
import Quiz from "./scenes/Quiz";
import Singapore from "./scenes/Singapore";
import Sorry from "./scenes/Sorry";
import Upside from "./scenes/Upside";
import Whack from "./scenes/Whack";
import { FACES } from "./ui";

const SCENES = [Boot, Sorry, Book, Palm, Coconut, Upside, Arcade, Whack, Quiz, Singapore, Birthday, Letter];
const SINGAPORE = SCENES.indexOf(Singapore);

function ShotDvd() {
  const ref = useRef<HTMLDivElement>(null);
  const [hue, setHue] = useState(0);
  const [corner, setCorner] = useState(0);

  useEffect(() => {
    const size = window.innerWidth < 640 ? 90 : 130;
    let x = Math.random() * (window.innerWidth - size);
    let y = Math.random() * (window.innerHeight - size);
    let vx = 150;
    let vy = 120;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      x += vx * dt;
      y += vy * dt;
      const W = window.innerWidth - size;
      const H = window.innerHeight - size;
      let hitX = false;
      let hitY = false;
      if (x <= 0 || x >= W) {
        vx = -vx;
        x = Math.max(0, Math.min(W, x));
        hitX = true;
      }
      if (y <= 0 || y >= H) {
        vy = -vy;
        y = Math.max(0, Math.min(H, y));
        hitY = true;
      }
      if (hitX || hitY) setHue((h) => (h + 70) % 360);
      if (hitX && hitY) {
        setCorner((c) => c + 1);
        emojiBurst("🥃", x / window.innerWidth, y / window.innerHeight, 25);
        sfx.coin();
      }
      if (ref.current) {
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
        ref.current.style.width = `${size}px`;
        ref.current.style.height = `${size}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-50" style={{ willChange: "transform" }}>
      <video
        src="/media/shot-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full rounded-2xl border-4 border-ink object-cover shadow-[6px_6px_0_#14001f]"
        style={{ filter: `hue-rotate(${hue}deg) saturate(1.4)` }}
      />
      {corner > 0 && (
        <div className="font-comic absolute -bottom-6 left-0 right-0 text-center text-lg text-yellow outline-text">
          CORNER x{corner}!!
        </div>
      )}
    </div>
  );
}

function Trail() {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; e: string }[]>([]);
  const id = useRef(0);
  const lastT = useRef(0);
  useEffect(() => {
    const EMO = ["✨", "🎉", "💖", "⭐", "🎂", "🥳"];
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastT.current < 45) return;
      lastT.current = now;
      const d = { id: ++id.current, x: e.clientX, y: e.clientY, e: EMO[id.current % EMO.length] };
      setDots((ds) => [...ds.slice(-14), d]);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute text-xl"
          style={{ left: d.x, top: d.y }}
          initial={{ scale: 1, opacity: 1, y: 0 }}
          animate={{ scale: 0, opacity: 0, y: 30, rotate: 180 }}
          transition={{ duration: 0.8 }}
        >
          {d.e}
        </motion.div>
      ))}
    </div>
  );
}

function sceneFromUrl() {
  const m = new URLSearchParams(window.location.search).get("scene");
  return Math.max(0, Math.min(SCENES.length - 1, Number(m) || 0));
}

export default function Experience() {
  const [scene, setScene] = useState(sceneFromUrl);
  const [run, setRun] = useState(0);
  const [shakeClass, setShakeClass] = useState("");
  const [dvd, setDvd] = useState(() => sceneFromUrl() > SINGAPORE);
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    const original = document.title;
    const onVis = () => {
      document.title = document.hidden ? "COME BACK JASWAL 😭" : original;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const next = useCallback(() => {
    sfx.whoosh();
    setScene((s) => Math.min(SCENES.length - 1, s + 1));
  }, []);

  const restart = useCallback(() => {
    setDvd(false);
    setRun((r) => r + 1);
    setScene(1);
  }, []);

  const shake = useCallback((level: ShakeLevel = "sm") => {
    setShakeClass("");
    requestAnimationFrame(() => setShakeClass(level === "lg" ? "shake-lg" : "shake-sm"));
  }, []);

  const api = useMemo(() => ({ next, restart, shake, setShotDvd: setDvd }), [next, restart, shake]);
  const Current = SCENES[scene];

  return (
    <ExperienceContext.Provider value={api}>
      <div className="fixed inset-0 overflow-hidden bg-ink" style={{ perspective: 2000 }}>
        <div className={`absolute inset-0 ${shakeClass}`} onAnimationEnd={() => setShakeClass("")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${run}-${scene}`}
              className="absolute inset-0"
              style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
              initial={scene === 0 ? { opacity: 0 } : { rotateY: 75, x: "15%", opacity: 0 }}
              animate={{ rotateY: 0, x: 0, opacity: 1 }}
              exit={{ rotateY: -95, x: "-10%", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.6, 0, 0.3, 1] }}
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </div>

        {dvd && <ShotDvd />}
        <Trail />

        {scene > 0 && (
          <>
            <button
              onClick={() => {
                const m = !isMuted();
                setMuted(m);
                setMutedState(m);
              }}
              className="sticker-sm fixed right-3 top-3 z-[80] h-12 w-12 cursor-pointer rounded-full bg-white text-2xl"
              aria-label={muted ? "unmute" : "mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <div className="pointer-events-none fixed inset-x-6 bottom-4 z-[55] hidden items-center gap-3 sm:flex">
              <div className="font-pixel rounded bg-white/90 px-2 py-1 text-[9px] text-ink">
                📖 {scene}/{SCENES.length - 1}
              </div>
              <div className="relative h-2 flex-1 rounded-full bg-white/40">
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  animate={{ left: `${((scene - 1) / (SCENES.length - 2)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 80 }}
                  style={{ marginLeft: -16 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FACES.smile} alt="" className="h-8 w-8 rounded-full border-2 border-ink" />
                </motion.div>
              </div>
              <div className="text-xl">🎂</div>
            </div>
          </>
        )}
      </div>
    </ExperienceContext.Provider>
  );
}
