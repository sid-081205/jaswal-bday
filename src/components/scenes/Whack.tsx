"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { burst, emojiBurst } from "@/lib/fx";
import { say, sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, FACES, Page, SkipLink } from "../ui";

const GOAL = 10;
type Mole = { id: number; kind: "face" | "upside" | "letter" } | null;

export default function Whack() {
  const { next, shake } = useExperience();
  const [state, setState] = useState<"intro" | "playing" | "won">("intro");
  const [holes, setHoles] = useState<Mole[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [bonked, setBonked] = useState<number | null>(null);
  const [hammer, setHammer] = useState({ x: -100, y: -100, down: false });
  const idRef = useRef(0);

  useEffect(() => {
    if (state !== "playing") return;
    let alive = true;
    const pop = () => {
      if (!alive) return;
      const i = Math.floor(Math.random() * 9);
      const r = Math.random();
      const kind = r < 0.15 ? "letter" : r < 0.3 ? "upside" : "face";
      const id = ++idRef.current;
      setHoles((h) => {
        if (h[i]) return h;
        const n = [...h];
        n[i] = { id, kind };
        return n;
      });
      setTimeout(() => {
        setHoles((h) => (h[i]?.id === id ? h.map((m, j) => (j === i ? null : m)) : h));
      }, 750 + Math.random() * 500);
      setTimeout(pop, 350 + Math.random() * 450);
    };
    pop();
    return () => {
      alive = false;
    };
  }, [state]);

  const whack = (i: number) => {
    const m = holes[i];
    setHammer((h) => ({ ...h, down: true }));
    setTimeout(() => setHammer((h) => ({ ...h, down: false })), 120);
    if (!m) return;
    setHoles((h) => h.map((x, j) => (j === i ? null : x)));
    setBonked(i);
    setTimeout(() => setBonked(null), 300);
    if (m.kind === "letter") {
      sfx.buzzer();
      shake("sm");
      setScore((s) => Math.max(0, s - 2));
      return;
    }
    sfx.bonk();
    const s = score + 1;
    setScore(s);
    if (s >= GOAL) {
      setState("won");
      sfx.win();
      burst(0.5, 0.5, 180);
      emojiBurst("😱", 0.5, 0.5, 30);
      say("bonk bonk bonk");
    }
  };

  return (
    <Page chapter="CHAPTER 5" title="WHACK-A-JASWAL" bg="bg-[#ff7a2e]">
      <div className="absolute inset-0 halftone opacity-50" />
      <AnimatePresence mode="wait">
        {state === "intro" ? (
          <motion.div
            key="intro"
            exit={{ scale: 0, rotate: 30 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 pt-24 md:flex-row md:gap-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 4, -4, 0] }}
              transition={{ rotate: { repeat: Infinity, duration: 3 } }}
              className="relative overflow-hidden rounded-full border-[10px] border-[#ff9a3c] shadow-[0_0_0_6px_#14001f,14px_14px_0_6px_#14001f]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/mirror.webp" alt="Navya making a shocked face in a mirror" className="h-[40vh] w-[40vh] object-cover md:h-[55vh] md:w-[55vh]" />
            </motion.div>
            <div className="max-w-md text-center">
              <div className="font-hand text-4xl leading-snug">
                One day she looked in a mirror and made <b>THIS</b> face.
              </div>
              <div className="font-hand mt-3 text-3xl">
                The face escaped. Now it&apos;s popping up <i>everywhere</i>.
              </div>
              <div className="font-comic mt-4 text-2xl">
                BONK {GOAL} faces 🔨 — DON&apos;T bonk the 💌 (-2)
              </div>
              <Btn big className="mt-6" color="var(--yellow)" onClick={() => setState("playing")}>
                LET&apos;S BONK
              </Btn>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center pt-24"
            style={{ cursor: "none" }}
            onPointerMove={(e) => setHammer((h) => ({ ...h, x: e.clientX, y: e.clientY }))}
          >
            <div className="font-comic outline-text mb-4 text-5xl text-white">
              {score}/{GOAL} BONKED
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-5">
              {holes.map((m, i) => (
                <div
                  key={i}
                  onPointerDown={(e) => {
                    setHammer({ x: e.clientX, y: e.clientY, down: true });
                    whack(i);
                  }}
                  className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-ink bg-[#3a1405] shadow-[inset_0_12px_0_rgba(0,0,0,0.5)] md:h-32 md:w-32"
                >
                  <AnimatePresence>
                    {m && (
                      <motion.div
                        key={m.id}
                        initial={{ y: "100%" }}
                        animate={{ y: "8%" }}
                        exit={{ y: "100%", scaleY: 0.4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="absolute inset-1 flex items-center justify-center"
                      >
                        {m.kind === "letter" ? (
                          <span className="text-6xl">💌</span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.kind === "face" ? FACES.shock : FACES.upside}
                            alt=""
                            className="h-full w-full rounded-full border-4 border-yellow"
                            draggable={false}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {bonked === i && (
                    <motion.div
                      initial={{ scale: 0.3, opacity: 1 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      className="font-comic pointer-events-none absolute inset-0 flex items-center justify-center text-3xl text-yellow"
                    >
                      💫BONK
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            {state === "won" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/60"
                style={{ cursor: "auto" }}
              >
                <div className="font-comic outline-text extrude text-center text-6xl text-yellow md:text-8xl">
                  FACE CONTAINED 😱
                </div>
                <Btn onClick={next}>next page →</Btn>
              </motion.div>
            )}
            <div
              className="pointer-events-none fixed z-50 text-6xl"
              style={{
                left: hammer.x - 20,
                top: hammer.y - 50,
                transform: `rotate(${hammer.down ? -70 : 10}deg)`,
                transformOrigin: "20% 90%",
                transition: "transform 0.08s",
              }}
            >
              🔨
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {state !== "won" && <SkipLink onSkip={next} after={30000} />}
    </Page>
  );
}
