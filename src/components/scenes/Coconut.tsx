"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { burst, emojiBurst } from "@/lib/fx";
import { say, sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, FACES, Page, SkipLink } from "../ui";

const TIME = 12;

export default function Coconut() {
  const { next, shake } = useExperience();
  const [state, setState] = useState<"ready" | "playing" | "won" | "lost">("ready");
  const [height, setHeight] = useState(0);
  const [time, setTime] = useState(TIME);
  const [fails, setFails] = useState(0);
  const [pulse, setPulse] = useState(0);
  const h = useRef(0);
  const assist = fails > 0;

  const tap = useCallback(() => {
    if (state !== "playing") return;
    h.current = Math.min(100, h.current + (assist ? 7.5 : 4.5));
    setHeight(h.current);
    setPulse((p) => p + 1);
    sfx.blip();
    if (h.current >= 100) {
      setState("won");
      setTimeout(() => {
        sfx.bonk();
        shake("lg");
        emojiBurst("🥥", 0.65, 0.3, 30);
        burst(0.65, 0.3, 120);
        sfx.win();
        say("coconut acquired");
      }, 700);
    }
  }, [state, assist, shake]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap]);

  useEffect(() => {
    if (state !== "playing") return;
    let last = performance.now();
    let raf = 0;
    const start = last;
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      h.current = Math.max(0, h.current - dt * (assist ? 6 : 11));
      setHeight(h.current);
      const left = TIME - (now - start) / 1000;
      setTime(Math.max(0, left));
      if (left <= 0) {
        setState("lost");
        setFails((f) => f + 1);
        sfx.sad();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, assist]);

  const start = () => {
    h.current = 0;
    setHeight(0);
    setTime(TIME);
    setState("playing");
  };

  return (
    <Page chapter="CHAPTER 2" title="SHE WANTED THE COCONUT">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 pt-28 md:flex-row md:gap-12 md:pt-20">
        <motion.div
          initial={{ x: -400, rotate: -30 }}
          animate={{ x: 0, rotate: -6 }}
          transition={{ type: "spring", stiffness: 80, damping: 12 }}
          className="sticker relative hidden bg-white p-3 pb-12 md:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/climb.webp" alt="Navya on shoulders reaching for a coconut" className="h-[55vh] w-auto" />
          <div className="font-hand absolute bottom-1 left-0 right-0 text-center text-2xl">
            actual footage of the attempt 📸
          </div>
          {assist && (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 12 }}
              className="font-comic sticker-sm absolute -right-10 top-8 rounded-lg bg-lime px-3 py-1 text-2xl"
            >
              SQUAD ASSIST ON 💪
            </motion.div>
          )}
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="font-hand mb-2 max-w-xs text-center text-2xl leading-tight md:text-3xl">
            Leaning wasn&apos;t enough. She needed the coconut. Help her climb!
          </div>
          <div className="relative h-[46vh] w-56 md:h-[56vh]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 text-6xl md:text-7xl">🌴</div>
            <AnimatePresence>
              {state !== "won" ? (
                <motion.div
                  key="nut"
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 top-10 -translate-x-1/2 text-4xl"
                >
                  🥥🥥
                </motion.div>
              ) : (
                <motion.div
                  key="fall"
                  initial={{ y: 40 }}
                  animate={{ y: [40, 0, 260], rotate: [0, 0, 720] }}
                  transition={{ duration: 0.8 }}
                  className="absolute left-1/2 top-10 -translate-x-1/2 text-5xl"
                >
                  🥥
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className="absolute bottom-0 left-1/2 top-20 w-10 -translate-x-1/2 rounded-full border-4 border-ink"
              style={{
                background:
                  "repeating-linear-gradient(170deg,#8a5a2b 0 14px,#6e4520 14px 18px)",
              }}
            />
            <motion.div
              className="absolute left-1/2"
              style={{ bottom: `calc(${height * 0.78}% )`, x: "-50%" }}
              animate={{ rotate: pulse % 2 ? 8 : -8 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FACES.climb} alt="" className="h-20 w-20 rounded-full border-4 border-ink md:h-24 md:w-24" />
            </motion.div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="font-pixel text-xs">⏱ {time.toFixed(1)}s</div>
            <div className="h-4 w-40 overflow-hidden rounded-full border-2 border-ink bg-white">
              <div className="h-full bg-lime" style={{ width: `${height}%` }} />
            </div>
          </div>

          <div className="mt-4 min-h-[5rem]">
            {state === "ready" && (
              <Btn big onClick={start}>
                START 🌴
              </Btn>
            )}
            {state === "playing" && (
              <motion.button
                key={pulse}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                onPointerDown={tap}
                className="font-comic sticker cursor-pointer rounded-2xl bg-pink px-10 py-5 text-4xl text-white"
              >
                MASH ME!!! (or spacebar)
              </motion.button>
            )}
            {state === "lost" && (
              <div className="flex flex-col items-center gap-2">
                <div className="font-comic text-3xl text-pink">PATHETIC. 🥥 remains unclaimed.</div>
                <Btn onClick={start}>again (with squad assist 💪)</Btn>
              </div>
            )}
            {state === "won" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="font-comic text-center text-3xl md:text-4xl">
                  +1 COCONUT 🥥 <span className="text-pink">(not a birthday gift tho)</span>
                </div>
                <Btn onClick={next}>next page →</Btn>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {state !== "won" && <SkipLink onSkip={next} after={25000} />}
    </Page>
  );
}
