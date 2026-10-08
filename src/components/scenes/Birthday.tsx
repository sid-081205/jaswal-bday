"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst, cannons, emojiBurst, fireworks } from "@/lib/fx";
import { say, sfx, startMusic } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, FaceRain } from "../ui";

const COLORS = ["#ff2e88", "#ffe14d", "#2de2e6", "#b6ff3b", "#ff7a2e", "#c17bff"];
const CANDLES = 5;

function BouncyWord({ word, offset = 0, className = "" }: { word: string; offset?: number; className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      {word.split("").map((c, i) => (
        <motion.span
          key={i}
          initial={{ y: -500, rotate: 180, scale: 0 }}
          animate={{ y: [0, -28, 0], rotate: [-6, 6, -6], scale: 1 }}
          transition={{
            y: { repeat: Infinity, duration: 0.9, delay: (i + offset) * 0.07 },
            rotate: { repeat: Infinity, duration: 1.2, delay: (i + offset) * 0.07 },
            scale: { type: "spring", stiffness: 300, damping: 10, delay: (i + offset) * 0.05 },
          }}
          className="font-comic outline-text extrude inline-block leading-none"
          style={{ color: COLORS[(i + offset) % COLORS.length] }}
        >
          {c === " " ? "\u00a0" : c}
        </motion.span>
      ))}
    </div>
  );
}

export default function Birthday() {
  const { next, shake } = useExperience();
  const [phase, setPhase] = useState<"roll" | "party" | "wish">("roll");
  const [lit, setLit] = useState(CANDLES);
  const [mic, setMic] = useState<"off" | "on" | "denied">("off");
  const litRef = useRef(CANDLES);
  const stopMic = useRef<() => void>(() => {});

  useEffect(() => {
    sfx.drumroll(2.6);
    const t = setTimeout(() => {
      setPhase("party");
      sfx.boom();
      sfx.airhorn(0.1);
      shake("lg");
      cannons();
      startMusic();
      say("Happy birthday Jaswal!", { pitch: 1.4, rate: 1 });
    }, 2800);
    return () => clearTimeout(t);
  }, [shake]);

  useEffect(() => {
    if (phase !== "party") return;
    return fireworks(60000);
  }, [phase]);

  useEffect(() => () => stopMic.current(), []);

  const blowOne = () => {
    if (litRef.current <= 0) return;
    litRef.current -= 1;
    setLit(litRef.current);
    sfx.whoosh();
    if (litRef.current === 0) {
      stopMic.current();
      setTimeout(() => {
        setPhase("wish");
        sfx.win();
        emojiBurst("🌠", 0.5, 0.4, 40);
        burst(0.5, 0.5, 300);
      }, 600);
    }
  };

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Float32Array(an.fftSize);
      let loud = 0;
      let cool = 0;
      let raf = 0;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        an.getFloatTimeDomainData(buf);
        let s = 0;
        for (const v of buf) s += v * v;
        const rms = Math.sqrt(s / buf.length);
        cool = Math.max(0, cool - dt);
        loud = rms > 0.12 ? loud + dt : Math.max(0, loud - dt);
        if (loud > 0.12 && cool <= 0) {
          blowOne();
          cool = 0.35;
          loud = 0;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      stopMic.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      };
      setMic("on");
    } catch {
      setMic("denied");
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <AnimatePresence>
        {phase === "roll" && (
          <motion.div
            key="roll"
            exit={{ scale: 6, opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.25 }}
              className="font-comic text-4xl text-white md:text-6xl"
            >
              so... with all that being said...
            </motion.div>
            <div className="mt-6 text-6xl">🥁🥁🥁</div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== "roll" && (
        <>
          <div className="absolute inset-[-60%] sunburst opacity-90" />
          <div className="absolute inset-0 halftone opacity-50" />
          <FaceRain count={22} />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-2">
            <BouncyWord word="HAPPY" className="text-[17vw] md:text-[10vw]" />
            <BouncyWord word="BIRTHDAY" offset={5} className="text-[15vw] md:text-[10vw]" />
            <BouncyWord word="JASWAL!!!" offset={13} className="text-[15vw] md:text-[11vw]" />

            <AnimatePresence mode="wait">
              {phase === "party" ? (
                <motion.div
                  key="cake"
                  initial={{ y: 300 }}
                  animate={{ y: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ delay: 1.5, type: "spring" }}
                  className="mt-4 flex flex-col items-center"
                >
                  <div className="flex gap-3">
                    {Array.from({ length: CANDLES }).map((_, i) => (
                      <button key={i} onClick={() => i < lit && blowOne()} className="relative flex cursor-pointer flex-col items-center">
                        <AnimatePresence>
                          {i < lit && (
                            <motion.div
                              exit={{ scale: 0, y: -20, opacity: 0 }}
                              animate={{ scaleY: [1, 1.25, 0.9, 1], rotate: [-4, 4, -4] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                              className="h-6 w-4 rounded-full"
                              style={{ background: "radial-gradient(circle at 50% 70%,#fff 10%,#ffe14d 40%,#ff7a2e 80%)", boxShadow: "0 0 20px #ffb02e" }}
                            />
                          )}
                        </AnimatePresence>
                        {i >= lit && <div className="h-6 w-4 text-xs">💨</div>}
                        <div className="h-12 w-3 rounded-sm border-2 border-ink" style={{ background: `repeating-linear-gradient(45deg,${COLORS[i]} 0 6px,#fff 6px 12px)` }} />
                      </button>
                    ))}
                  </div>
                  <div className="sticker -mt-1 h-16 w-72 rounded-t-3xl bg-pink md:w-80" style={{ background: "linear-gradient(#ff8fc4 0 30%,#ff2e88 30%)" }} />
                  <div className="mt-3 flex flex-col items-center gap-2">
                    {mic === "off" && (
                      <Btn onClick={enableMic} color="var(--cyan)">
                        🎤 blow out the candles (into your mic!)
                      </Btn>
                    )}
                    {mic === "on" && (
                      <div className="font-comic sticker-sm rounded-xl bg-white px-4 py-2 text-2xl">
                        BLOW!!! 🌬️ ({lit} left)
                      </div>
                    )}
                    <div className="font-body rounded-full bg-white/80 px-3 text-sm">
                      {mic === "denied" ? "no mic? no problem — tap the candles 👆" : "or just tap the candles 👆"}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="wish"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="mt-6 flex flex-col items-center gap-4"
                >
                  <div className="font-comic sticker rounded-2xl bg-white px-6 py-3 text-center text-3xl md:text-5xl">
                    make a wish 🌠 (it&apos;s legally binding)
                  </div>
                  <Btn big color="var(--pink)" onClick={next}>
                    wait... one more thing 👀
                  </Btn>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
