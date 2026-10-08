"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst, cannons } from "@/lib/fx";
import { say, sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn } from "../ui";

const CALLS = [
  "AND JASWAL STEPS UP TO THE GLASS...",
  "LOOK AT THAT FORM 😤",
  "NOT. A. SINGLE. FLINCH.",
  "THE HEAD TILT!! TEXTBOOK!!",
  "SHE'S DONE IT. THE CROWD GOES WILD 🥃",
];
const SCORES = ["10", "10", "10", "11"];

export default function Singapore() {
  const { next, setShotDvd } = useExperience();
  const [phase, setPhase] = useState<"intro" | "tape" | "replay" | "shrine">("intro");
  const [call, setCall] = useState(-1);
  const [scores, setScores] = useState(0);
  const tape = useRef<HTMLVideoElement>(null);
  const replay = useRef<HTMLVideoElement>(null);

  const playTape = () => {
    setPhase("tape");
    sfx.click();
    const v = tape.current;
    if (v) {
      v.currentTime = 0;
      v.muted = false;
      v.volume = 1;
      void v.play().catch(() => {
        v.muted = true;
        void v.play();
      });
    }
  };

  const toReplay = () => {
    tape.current?.pause();
    setPhase("replay");
    sfx.whoosh();
  };

  useEffect(() => {
    if (phase !== "replay") return;
    const v = replay.current;
    if (v) v.playbackRate = 0.45;
    const timers: ReturnType<typeof setTimeout>[] = [];
    CALLS.forEach((c, i) => {
      timers.push(
        setTimeout(() => {
          setCall(i);
          sfx.slam();
          say(c.replace(/[^\w\s.!']/g, ""), { pitch: 0.9, rate: 1.15 });
          if (v) v.playbackRate = i === CALLS.length - 1 ? 1.6 : 0.45 + i * 0.15;
        }, 600 + i * 2200),
      );
    });
    SCORES.forEach((_, i) =>
      timers.push(
        setTimeout(() => {
          setScores(i + 1);
          sfx.pop();
          if (i === SCORES.length - 1) {
            sfx.airhorn();
            cannons();
          }
        }, 600 + CALLS.length * 2200 + i * 450),
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const toShrine = () => {
    setPhase("shrine");
    sfx.boom();
    sfx.airhorn(0.3);
    burst(0.5, 0.5, 250);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0016]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, #ff2e8866, transparent 40%), radial-gradient(circle at 80% 70%, #2de2e666, transparent 40%), radial-gradient(circle at 60% 20%, #7b2ff766, transparent 40%)",
        }}
      />
      <motion.div
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className="absolute left-1/2 top-3 z-20 -translate-x-1/2 text-center"
      >
        <div className="font-comic sticker-sm inline-block rounded-lg bg-cyan px-4 py-1 text-lg md:text-xl">CHAPTER 7</div>
        <div className="font-comic neon mt-1 text-4xl text-white md:text-6xl">SINGAPORE 🇸🇬</div>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4 text-center"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1, 1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-comic neon text-4xl text-white md:text-6xl"
            >
              And then, under the neon lights...
            </motion.div>
            <div className="font-hand text-3xl text-pink md:text-4xl">she did something LEGENDARY.</div>
            <div className="font-pixel text-[10px] text-white/60">⚠ the following footage is real ⚠</div>
            <Btn big color="var(--pink)" onClick={playTape}>
              ▶ PLAY THE TAPE 📼
            </Btn>
          </motion.div>
        )}
        {phase === "replay" && (
          <motion.div
            key="replay"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 14 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 pt-28"
          >
            <motion.div
              animate={{ x: ["-2%", "2%", "-2%"] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="font-comic rounded-lg bg-red-600 px-6 py-1 text-3xl text-white md:text-5xl"
            >
              🔴 INSTANT REPLAY
            </motion.div>
            <div className="relative">
              <video
                ref={replay}
                src="/media/shot-loop.mp4"
                poster="/media/shot-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                className="sticker h-[42vh] w-[42vh] rounded-2xl object-cover md:h-[50vh] md:w-[50vh]"
              />
              <div className="font-pixel absolute left-3 top-3 text-[10px] text-white">SLOW-MO CAM 🎥</div>
              <AnimatePresence mode="wait">
                {call >= 0 && (
                  <motion.div
                    key={call}
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: -4 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="font-comic outline-text absolute -bottom-6 left-1/2 w-[120%] -translate-x-1/2 text-center text-3xl text-yellow md:text-5xl"
                  >
                    {CALLS[call]}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute -right-4 top-0 flex flex-col gap-2 md:-right-28">
                {SCORES.slice(0, scores).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateX: 90, scale: 0.4 }}
                    animate={{ rotateX: 0, scale: 1 }}
                    className={`font-comic sticker-sm rounded-lg px-3 py-1 text-center text-3xl ${
                      i === 3 ? "bg-pink text-white" : "bg-white"
                    }`}
                  >
                    {s}
                    <div className="font-body text-[10px]">judge {i + 1}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            {scores >= SCORES.length && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-8">
                <Btn big color="var(--lime)" onClick={toShrine}>
                  THIS DESERVES A SHRINE 🛐
                </Btn>
              </motion.div>
            )}
          </motion.div>
        )}
        {phase === "shrine" && (
          <motion.div key="shrine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
            <div className="grid h-full w-full grid-cols-4 grid-rows-3 md:grid-cols-6">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.video
                  key={i}
                  src="/media/shot-loop.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.06, type: "spring" }}
                  onLoadedMetadata={(e) => {
                    e.currentTarget.playbackRate = 0.6 + (i % 5) * 0.35;
                  }}
                  className="h-full w-full object-cover"
                  style={{ filter: `hue-rotate(${i * 40}deg) saturate(1.6)` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/30 px-4 text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="font-comic outline-text extrude text-6xl text-yellow md:text-9xl"
              >
                THE SHOT HEARD ROUND THE WORLD
              </motion.div>
              <div className="font-hand rounded-xl bg-white/90 px-4 py-2 text-3xl">
                fun fact: this shot will now follow you for the rest of the website.
              </div>
              <Btn
                big
                onClick={() => {
                  setShotDvd(true);
                  next();
                }}
              >
                ok 😭 next →
              </Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`absolute inset-0 flex items-center justify-center px-4 pt-24 ${
          phase === "tape" ? "" : "pointer-events-none invisible"
        }`}
      >
        <div className="relative w-full max-w-4xl">
          <div className="crt relative overflow-hidden rounded-[2rem] border-[14px] border-[#222] shadow-[0_0_80px_#ff2e88]">
            <video
              ref={tape}
              src="/media/shot-full.mp4"
              poster="/media/shot-full-poster.jpg"
              playsInline
              preload="auto"
              onEnded={toReplay}
              className="block aspect-video w-full bg-black object-cover"
            />
            <div className="font-pixel absolute left-4 top-4 text-xs text-red-500">
              <span className="blink">●</span> REC
            </div>
            <div className="font-pixel absolute bottom-4 right-4 text-[10px] text-white/80">SINGAPORE • NIGHT • LEGEND</div>
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={toReplay} className="font-body cursor-pointer text-sm text-white/70 underline">
              skip to the replay →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
