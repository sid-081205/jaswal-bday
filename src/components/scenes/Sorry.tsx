"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst, emojiBurst } from "@/lib/fx";
import { say, sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, EmojiField } from "../ui";

const SORRYS = [
  "sorry", "lo siento", "désolé", "maaf karo", "gomen", "entschuldigung", "mian", "scusa",
  "kshama karo", "desculpa", "prosti", "sorry sorry sorry", "SORRY", "pls", "maafi", "my bad",
];

const METER = [
  [0, "a lil sorry 😐"],
  [20, "kinda sorry 😕"],
  [40, "very sorry 😢"],
  [60, "EXTREMELY sorry 😭"],
  [80, "on-my-knees sorry 🧎"],
  [95, "WILL-CLIMB-A-COCONUT-TREE sorry 🌴"],
] as const;

const NO_TEXTS = ["NO", "no?", "are u sure", "pls", "think again", "🥺", "ok that's rude", "YES"];

export default function Sorry() {
  const { next, shake } = useExperience();
  const [stage, setStage] = useState<"letters" | "meter" | "ask">("letters");
  const [lettersIn, setLettersIn] = useState(0);
  const [meter, setMeter] = useState(0);
  const [broken, setBroken] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noTries, setNoTries] = useState(0);
  const askRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== "letters") return;
    if (lettersIn >= 5) {
      const t = setTimeout(() => setStage("meter"), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLettersIn((n) => n + 1);
      sfx.slam();
      shake(lettersIn === 4 ? "lg" : "sm");
      if (lettersIn === 4) {
        emojiBurst("😭", 0.5, 0.45, 40);
        say("I am so sorry", { pitch: 0.6, rate: 0.8 });
      }
    }, lettersIn === 0 ? 400 : 380);
    return () => clearTimeout(t);
  }, [lettersIn, stage, shake]);

  const label = [...METER].reverse().find(([v]) => meter >= v)?.[1] ?? "";

  const onMeter = (v: number) => {
    if (broken) return;
    setMeter(v);
    if (v % 7 === 0) sfx.blip();
    if (v >= 100) {
      setBroken(true);
      sfx.boom();
      shake("lg");
      emojiBurst("💥", 0.5, 0.6, 25);
      setTimeout(() => setStage("ask"), 2600);
    }
  };

  const dodge = () => {
    if (noTries >= NO_TEXTS.length - 1) return;
    const box = askRef.current?.getBoundingClientRect();
    const w = (box?.width ?? 600) / 2 - 80;
    const h = (box?.height ?? 400) / 2 - 40;
    setNoPos({ x: (Math.random() * 2 - 1) * w, y: (Math.random() * 2 - 1) * h });
    setNoTries((n) => n + 1);
    sfx.boing();
  };

  const forgive = () => {
    sfx.win();
    burst(0.5, 0.6, 200);
    say("yay!", { pitch: 1.8 });
    setTimeout(next, 1300);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#2b0a3d]">
      <div className="absolute inset-[-50%] opacity-40 sunburst" style={{ filter: "hue-rotate(260deg)" }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {SORRYS.map((s, i) => (
          <motion.div
            key={s + i}
            className="font-comic absolute whitespace-nowrap text-white/25"
            style={{ top: `${(i * 6.3) % 100}%`, fontSize: `${1 + (i % 4) * 0.7}rem` }}
            initial={{ x: i % 2 ? "-30vw" : "110vw" }}
            animate={{ x: i % 2 ? "110vw" : "-30vw" }}
            transition={{ duration: 8 + (i % 5) * 2, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
          >
            {s}
          </motion.div>
        ))}
      </div>
      <EmojiField emojis={["😭", "🥺", "💔", "🙏", "😿"]} count={14} />

      <AnimatePresence mode="wait">
        {stage === "letters" && (
          <motion.div
            key="letters"
            exit={{ scale: 3, opacity: 0, rotate: 15 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="flex">
              {"SORRY".split("").map((c, i) =>
                i < lettersIn ? (
                  <motion.span
                    key={i}
                    initial={{ y: -600, scale: 3, rotate: (i - 2) * 25 }}
                    animate={{ y: 0, scale: 1, rotate: (i - 2) * 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14 }}
                    className="font-comic outline-text extrude text-[22vw] leading-none md:text-[17vw]"
                    style={{ color: ["#ff2e88", "#ffe14d", "#2de2e6", "#b6ff3b", "#ff7a2e"][i] }}
                  >
                    {c}
                  </motion.span>
                ) : null,
              )}
            </div>
            {lettersIn >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-comic mt-4 text-center text-3xl text-white md:text-5xl"
              >
                for missing your birthday, Navya 😭
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === "meter" && (
          <motion.div
            key="meter"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <div className="paper sticker w-full max-w-xl rounded-3xl p-6 text-center md:p-10">
              <div className="font-comic text-4xl md:text-6xl">THE SORRY-O-METER™</div>
              <div className="font-body mt-2 text-lg">drag it to see how sorry I am →</div>
              <div className="relative mt-8">
                <motion.div
                  animate={broken ? { rotate: [0, -8, 12, -4, 0], y: [0, 10, 40] } : {}}
                  className="h-10 overflow-hidden rounded-full border-4 border-ink bg-white"
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${meter}%`,
                      background: "linear-gradient(90deg,#b6ff3b,#ffe14d,#ff2e88,#7b2ff7)",
                    }}
                  />
                </motion.div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={meter}
                  onChange={(e) => onMeter(Number(e.target.value))}
                  className="absolute inset-0 h-10 w-full cursor-grab opacity-0"
                  aria-label="sorry level"
                />
              </div>
              <div className="font-comic mt-6 min-h-[3.5rem] text-3xl md:text-4xl">
                {broken ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1.4, 1] }}
                    className="text-pink"
                    style={{ animation: "glitch 0.3s infinite" }}
                  >
                    ERROR: SORRY LEVELS EXCEED THE UNIVERSE 💥
                  </motion.span>
                ) : (
                  label
                )}
              </div>
              <div className="font-pixel mt-2 text-xs opacity-60">{broken ? "999999%" : `${meter}%`}</div>
            </div>
          </motion.div>
        )}

        {stage === "ask" && (
          <motion.div
            key="ask"
            ref={askRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10 p-4"
          >
            <div className="font-comic outline-text text-center text-5xl text-yellow md:text-8xl">
              DO YOU FORGIVE ME??
            </div>
            <div className="relative flex items-center gap-8">
              <motion.div
                animate={{ scale: 1 + noTries * 0.18 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Btn big color="var(--lime)" onClick={forgive}>
                  YES 💖
                </Btn>
              </motion.div>
              <motion.div
                onMouseEnter={dodge}
                animate={{ x: noPos.x, y: noPos.y, scale: Math.max(0.5, 1 - noTries * 0.07) }}
              >
                <Btn
                  color={noTries >= NO_TEXTS.length - 1 ? "var(--lime)" : "#ff6b6b"}
                  onClick={noTries >= NO_TEXTS.length - 1 ? forgive : dodge}
                  className="whitespace-nowrap"
                >
                  {NO_TEXTS[noTries]}
                </Btn>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
