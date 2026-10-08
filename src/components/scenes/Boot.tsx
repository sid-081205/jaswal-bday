"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { sfx, unlock } from "@/lib/sfx";
import { useExperience } from "../context";

const LINES = [
  "> booting friendship.exe ...",
  "> scanning calendar ...",
  "> found: NAVYA JASWAL's BIRTHDAY",
  "> status: ███ MISSED ███",
  "> friend's current mood: [REDACTED] (probably furious)",
  "> best friend's reputation: 0%",
  "> initiating EMERGENCY DAMAGE CONTROL PROTOCOL ...",
];

export default function Boot() {
  const { next } = useExperience();
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (shown >= LINES.length) return;
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      if (LINES[shown].includes("MISSED")) sfx.buzzer();
      else sfx.click();
    }, shown === 0 ? 300 : 650);
    return () => clearTimeout(t);
  }, [shown, started]);

  const start = () => {
    unlock();
    sfx.boom();
    setStarted(true);
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black p-6">
      <div className="crt pointer-events-none absolute inset-0" />
      {!started ? (
        <div className="relative flex flex-col items-center gap-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="font-pixel text-sm text-red-500 md:text-base"
          >
            ⚠ INCOMING TRANSMISSION ⚠
          </motion.div>
          <div className="font-pixel text-xs leading-6 text-green-400 md:text-sm">
            for: NAVYA JASWAL
            <br />
            priority: EXTREMELY HIGH
            <br />
            sound: <span className="text-yellow">TURN IT UP 🔊</span>
          </div>
          <motion.button
            onClick={start}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            animate={{ boxShadow: ["0 0 0px #ff0044", "0 0 60px #ff0044", "0 0 0px #ff0044"] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="font-pixel cursor-pointer rounded-full border-4 border-white bg-red-600 px-8 py-8 text-sm text-white md:px-12 md:text-lg"
          >
            OPEN
            <br />
            TRANSMISSION
          </motion.button>
          <div className="font-pixel text-[10px] text-white/40">(best on a laptop. volume up. trust me.)</div>
        </div>
      ) : (
        <div className="relative w-full max-w-3xl">
          <div className="font-pixel space-y-4 text-[11px] leading-5 text-green-400 md:text-sm md:leading-7">
            {LINES.slice(0, shown).map((l) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={l.includes("MISSED") ? "text-2xl text-red-500 md:text-4xl" : ""}
                style={l.includes("MISSED") ? { animation: "glitch 0.4s infinite" } : undefined}
              >
                {l}
              </motion.div>
            ))}
          </div>
          {shown >= LINES.length && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              className="mt-10 flex justify-center"
            >
              <button
                onClick={() => {
                  sfx.whoosh();
                  next();
                }}
                className="font-pixel cursor-pointer border-4 border-green-400 bg-green-400/10 px-6 py-4 text-sm text-green-300 hover:bg-green-400 hover:text-black md:text-base"
              >
                [ PRESS TO BEG FOR FORGIVENESS ]
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
