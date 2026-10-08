"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { burst } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, Page } from "../ui";

type Q = { q: string; a: string[]; verdict: (i: number) => { ok: boolean; text: string } };

const QUESTIONS: Q[] = [
  {
    q: "Who forgot Navya's birthday?",
    a: ["me", "also me", "the guy who made this website", "all of the above (same guy)"],
    verdict: () => ({ ok: true, text: "CORRECT ✅ it was me. every single time." }),
  },
  {
    q: "From 1 to 10, how much does he regret it?",
    a: ["7", "9", "10", "yes"],
    verdict: (i) =>
      i === 3
        ? { ok: true, text: "CORRECT ✅ regret levels: yes." }
        : { ok: false, text: "WRONG ❌ the answer was 11. it's ALWAYS 11." },
  },
  {
    q: "What's the best birthday gift?",
    a: ["a heartfelt letter 💌", "a whole website 💻", "a coconut 🥥", "a shot in Singapore 🥃"],
    verdict: () => ({ ok: true, text: "ALL CORRECT. and you're getting all four... kind of 👀" }),
  },
];

export default function Quiz() {
  const { next } = useExperience();
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [stars, setStars] = useState(0);
  const done = qi >= QUESTIONS.length;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const v = QUESTIONS[qi].verdict(i);
    if (v.ok) {
      sfx.win();
      burst(0.5, 0.7, 80);
    } else sfx.buzzer();
    setTimeout(() => {
      setPicked(null);
      setQi((q) => q + 1);
    }, 2200);
  };

  const rate = () => {
    sfx.sparkle();
    setStars(5);
    burst(0.5, 0.5, 150);
  };

  return (
    <Page chapter="CHAPTER 6" title="THE SQUAD HAS QUESTIONS" bg="bg-[#2a0b4d]">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-4 w-4 rounded-full bg-yellow"
            style={{
              left: i < 14 ? `${(i / 13) * 100}%` : i % 2 ? "1%" : "98%",
              top: i < 14 ? (i % 2 ? "1%" : "98%") : `${((i - 14) / 13) * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: (i % 4) * 0.15 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 pt-28 lg:flex-row lg:gap-12">
        <motion.div
          initial={{ y: -300, rotate: 20 }}
          animate={{ y: 0, rotate: 4 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="sticker relative shrink-0 bg-white p-2 pb-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/squad.webp" alt="Navya with friends" className="h-[20vh] w-auto md:h-[34vh]" />
          <div className="font-hand absolute bottom-0 left-0 right-0 text-center text-2xl">
            the panel of experts 🧑‍⚖️
          </div>
        </motion.div>

        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={qi}
                initial={{ x: 400, opacity: 0, rotate: 8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: -400, opacity: 0, rotate: -8 }}
                className="paper sticker rounded-3xl p-5 md:p-7"
              >
                <div className="font-pixel text-[10px] text-pink">
                  QUESTION {qi + 1}/{QUESTIONS.length}
                </div>
                <div className="font-comic mt-2 text-3xl md:text-4xl">{QUESTIONS[qi].q}</div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {QUESTIONS[qi].a.map((a, i) => (
                    <motion.button
                      key={a}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => pick(i)}
                      className={`font-body sticker-sm cursor-pointer rounded-xl px-4 py-3 text-left text-lg font-semibold ${
                        picked === i ? "bg-pink text-white" : "bg-white"
                      }`}
                    >
                      <span className="font-pixel mr-2 text-xs">{"ABCD"[i]})</span>
                      {a}
                    </motion.button>
                  ))}
                </div>
                {picked !== null && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: -3 }}
                    className={`font-comic mt-4 text-center text-2xl md:text-3xl ${
                      QUESTIONS[qi].verdict(picked).ok ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {QUESTIONS[qi].verdict(picked).text}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="rate"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="paper sticker rounded-3xl p-6 text-center"
              >
                <div className="font-comic text-4xl">BONUS: rate this apology so far</div>
                <div className="mt-4 flex justify-center gap-2 text-5xl md:text-6xl">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.3, rotate: 20 }}
                      onMouseEnter={() => stars < 5 && sfx.blip()}
                      onClick={rate}
                      className="cursor-pointer"
                    >
                      {stars >= s ? "⭐" : "☆"}
                    </motion.button>
                  ))}
                </div>
                {stars === 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                    <div className="font-hand text-3xl">5 stars! wow thank you!! (the stars were rigged)</div>
                    <Btn className="mt-4" onClick={next}>
                      next page →
                    </Btn>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Page>
  );
}
