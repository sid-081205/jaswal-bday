"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { burst, cannons, emojiBurst, fireworks } from "@/lib/fx";
import { rand } from "@/lib/rand";
import { say, sfx, stopMusic } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, FACE_LIST, FACES, Typewriter } from "../ui";

const UK = { x: 18, y: 26 };
const GGN = { x: 62, y: 46 };
const SG = { x: 80, y: 74 };

function Stamp({ text, x, y, color = "#e11d48" }: { text: string; x: number; y: number; color?: string }) {
  return (
    <motion.div
      initial={{ scale: 4, opacity: 0, rotate: -30 }}
      animate={{ scale: 1, opacity: 1, rotate: -12 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="font-comic absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-4 px-2 py-1 text-xl whitespace-nowrap md:text-3xl"
      style={{ left: `${x}%`, top: `${y}%`, color, borderColor: color, background: "#fff6e0cc" }}
    >
      {text}
    </motion.div>
  );
}

function Journey({ onDone }: { onDone: () => void }) {
  const [leg, setLeg] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);
  useEffect(() => {
    const steps = [
      () => sfx.whoosh(),
      () => {
        sfx.slam();
        say("return to sender", { pitch: 0.7 });
      },
      () => sfx.whoosh(),
      () => {
        sfx.slam();
        say("address unknown", { pitch: 0.7 });
      },
      () => {
        sfx.boom();
        sfx.sad();
      },
    ];
    const timers = steps.map((fn, i) =>
      setTimeout(() => {
        setLeg(i + 1);
        fn();
      }, 600 + i * 1700),
    );
    timers.push(setTimeout(() => done.current(), 600 + steps.length * 1700 + 1500));
    return () => timers.forEach(clearTimeout);
  }, []);

  const plane = leg <= 1 ? (leg === 0 ? UK : SG) : leg <= 3 ? GGN : { x: 50, y: 110 };

  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-3xl overflow-hidden rounded-3xl border-4 border-ink bg-[#7fd6ff]">
      <svg viewBox="0 0 100 62.5" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path d="M5,8 Q20,2 32,10 T40,30 Q30,40 18,36 T5,8Z" fill="#b6ff3b" stroke="#14001f" strokeWidth="0.6" />
        <path d="M48,18 Q65,10 78,22 T74,42 Q64,52 54,40 T48,18Z" fill="#ffe14d" stroke="#14001f" strokeWidth="0.6" />
        <path d="M74,44 Q84,42 88,50 T80,60 Q72,58 74,44Z" fill="#ff8fc4" stroke="#14001f" strokeWidth="0.6" />
        <path
          d={`M${UK.x},${UK.y * 0.625} Q50,0 ${SG.x},${SG.y * 0.625} M${SG.x},${SG.y * 0.625} Q75,30 ${GGN.x},${GGN.y * 0.625}`}
          fill="none"
          stroke="#14001f"
          strokeWidth="0.5"
          strokeDasharray="1.5 1.5"
        />
      </svg>
      {[
        { p: UK, label: "🇬🇧 me (sending it)" },
        { p: GGN, label: "🇮🇳 Gurgaon" },
        { p: SG, label: "🇸🇬 Singapore" },
      ].map(({ p, label }) => (
        <div key={label} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="mx-auto h-4 w-4 rounded-full border-2 border-ink bg-pink" />
          <div className="font-comic whitespace-nowrap text-lg md:text-xl">{label}</div>
        </div>
      ))}
      <motion.div
        className="absolute text-5xl"
        animate={{
          left: `${plane.x}%`,
          top: `${plane.y}%`,
          rotate: leg >= 5 ? 720 : leg <= 1 ? 30 : -40,
        }}
        transition={{ duration: leg >= 5 ? 1.4 : 1.5, ease: "easeInOut" }}
        style={{ x: "-50%", y: "-50%", left: `${UK.x}%`, top: `${UK.y}%` }}
      >
        ✈️💌
      </motion.div>
      {leg >= 2 && <Stamp text="RETURN TO SENDER" x={SG.x - 8} y={SG.y - 14} />}
      {leg >= 4 && <Stamp text="ADDRESS: ???" x={GGN.x} y={GGN.y - 16} color="#7b2ff7" />}
      {leg >= 5 && <Stamp text="LOST IN TRANSIT 💀" x={50} y={50} color="#14001f" />}
    </div>
  );
}

function Psych({ onRestart }: { onRestart: () => void }) {
  const [calm, setCalm] = useState(false);
  const shards = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        src: i % 3 === 0 ? FACES.shock : FACE_LIST[i % FACE_LIST.length],
        a: (i / 36) * Math.PI * 2 + rand(i) * 0.3,
        d: 40 + rand(i + 50) * 60,
        s: 60 + rand(i + 90) * 110,
        r: (rand(i + 130) - 0.5) * 1440,
      })),
    [],
  );

  useEffect(() => {
    stopMusic();
    sfx.boom();
    sfx.airhorn();
    sfx.airhorn(1.2);
    sfx.siren(4.5);
    sfx.airhorn(2.6);
    burst(0.5, 0.5, 400);
    emojiBurst("🤣", 0.5, 0.5, 50);
    navigator.vibrate?.([200, 100, 200, 100, 600]);
    say("HA HA HA HA HA HA. PSYCH! You really thought I was going to give you the letter digitally? L.", {
      pitch: 1.6,
      rate: 1.05,
    });
    const original = document.title;
    let flip = false;
    const titleTimer = setInterval(() => {
      document.title = (flip = !flip) ? "HAHAHA PSYCH 🫵" : "L L L L L L L";
    }, 500);
    const laugh = setInterval(() => sfx.boing(), 300);
    const calmT = setTimeout(() => {
      clearInterval(laugh);
      setCalm(true);
      cannons();
    }, 7500);
    return () => {
      clearInterval(titleTimer);
      clearInterval(laugh);
      clearTimeout(calmT);
      document.title = original;
    };
  }, []);

  useEffect(() => {
    if (!calm) return;
    return fireworks(4000);
  }, [calm]);

  return (
    <div className={`fixed inset-0 z-[60] overflow-hidden ${calm ? "" : "shake-forever"}`}>
      <motion.div
        className="absolute inset-[-20%]"
        style={{
          background: "conic-gradient(from 0deg,#ff2e88,#ffe14d,#b6ff3b,#2de2e6,#7b2ff7,#ff2e88)",
        }}
        animate={{ rotate: 360, filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 overflow-hidden opacity-70">
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="font-comic flex whitespace-nowrap text-6xl text-white outline-text md:text-8xl"
            style={{ animation: `marquee ${2 + (row % 3)}s linear infinite ${row % 2 ? "reverse" : ""}` }}
          >
            {"HAHAHAHA PSYCH 🤣 L 🫵 ".repeat(12)}
          </div>
        ))}
      </div>
      {shards.map((s) => (
        <motion.img
          key={s.id}
          src={s.src}
          alt=""
          className="absolute left-1/2 top-1/2 rounded-full border-4 border-ink"
          style={{ width: s.s, height: s.s, marginLeft: -s.s / 2, marginTop: -s.s / 2 }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: `${Math.cos(s.a) * s.d}vw`,
            y: `${Math.sin(s.a) * s.d}vh`,
            scale: [0, 1.6, 1],
            rotate: s.r,
          }}
          transition={{ duration: 1.2, ease: "easeOut", delay: s.id * 0.02 }}
        />
      ))}

      <AnimatePresence mode="wait">
        {!calm ? (
          <motion.div key="loud" exit={{ scale: 0, rotate: 90 }} className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -720 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="font-comic outline-text extrude text-[26vw] leading-none text-yellow md:text-[20vw]"
            >
              PSYCH!
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="font-comic sticker rounded-2xl bg-white px-6 py-3 text-center text-3xl md:text-5xl"
            >
              HAHAHAHA 🤣🤣🤣
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="font-comic outline-text absolute bottom-6 right-6 text-[22vh] leading-none text-pink"
            >
              L
            </motion.div>
            <div className="absolute bottom-8 left-6 text-[14vh]">🫵</div>
          </motion.div>
        ) : (
          <motion.div
            key="calm"
            initial={{ y: "120%", rotate: 10 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4"
          >
            <div className="paper sticker w-full max-w-2xl rounded-3xl p-6 text-center md:p-10">
              <div className="font-comic text-3xl leading-tight md:text-5xl">
                you really thought I was gonna give you the letter{" "}
                <span className="text-pink">digitally??</span>
              </div>
              <div className="font-comic outline-text extrude my-3 text-8xl text-yellow">L 🫵</div>
              <div className="flex flex-col items-center gap-5 md:flex-row">
                <div className="relative shrink-0 rotate-[-4deg]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/media/envelope.webp" alt="The real letter to Navya Jaswal" className="sticker-sm h-52 w-auto rounded" />
                  <div className="font-comic absolute -right-4 top-6 rotate-12 rounded border-4 border-red-600 bg-white/80 px-2 text-lg text-red-600">
                    STILL OUT THERE
                  </div>
                </div>
                <div className="font-hand text-left text-2xl leading-snug md:text-3xl">
                  The real letter is somewhere between the UK, Singapore and Gurgaon, having the adventure of its life.
                  It <b>will</b> reach you. By hand. Paper and all. Eventually. 💌
                </div>
              </div>
              <div className="font-hand mt-6 text-3xl md:text-4xl">
                Happy birthday, Navya Jaswal. 🎂
                <br />
                Sorry I missed it. Never again. (probably.) ❤️
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Btn onClick={onRestart} color="var(--cyan)">
                  ↺ do it all again
                </Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Letter() {
  const { restart } = useExperience();
  const [phase, setPhase] = useState<"intro" | "journey" | "digital" | "opening" | "psych">("intro");
  const [typed, setTyped] = useState(false);

  const open = () => {
    if (phase !== "digital") return;
    setPhase("opening");
    sfx.sparkle();
    emojiBurst("💖", 0.5, 0.5, 20);
  };

  return (
    <div className="paper absolute inset-0 overflow-hidden">
      <motion.div initial={{ y: -120 }} animate={{ y: 0 }} className="absolute left-1/2 top-3 z-20 -translate-x-1/2 text-center">
        <div className="font-comic sticker-sm inline-block rounded-lg bg-pink px-4 py-1 text-lg text-white md:text-xl">
          THE FINAL CHAPTER
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            exit={{ x: "-100%", rotate: -10 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 pt-16 md:flex-row md:gap-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: 30 }}
              animate={{ scale: 1, rotate: -6 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="sticker bg-white p-3 pb-12"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/envelope.webp" alt="An envelope addressed to Navya Jaswal" className="h-[34vh] w-auto md:h-[52vh]" />
              <div className="font-hand absolute bottom-1 left-0 right-0 text-center text-2xl">£3.70 of stamps btw</div>
            </motion.div>
            <div className="max-w-md text-center">
              <div className="font-hand min-h-[10rem] text-4xl leading-snug">
                <Typewriter
                  text="I wrote you a letter... that never got delivered to Singapore or Gurgaon."
                  onDone={() => setTyped(true)}
                />
              </div>
              {typed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Btn onClick={() => setPhase("journey")}>what happened to it?? ✈️</Btn>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {phase === "journey" && (
          <motion.div
            key="journey"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ y: "100%", opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 pt-16"
          >
            <div className="font-comic text-3xl md:text-5xl">THE LETTER&apos;S JOURNEY 🗺️</div>
            <Journey onDone={() => setPhase("digital")} />
          </motion.div>
        )}

        {(phase === "digital" || phase === "opening") && (
          <motion.div
            key="digital"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 pt-16"
          >
            <div className="font-hand text-center text-4xl md:text-5xl">
              ...so here&apos;s the letter, <b>digitally</b> 💌
            </div>
            <motion.div
              animate={phase === "digital" ? { rotate: [-3, 3, -3], y: [0, -8, 0] } : { scale: 1.15 }}
              transition={{ repeat: phase === "digital" ? Infinity : 0, duration: 1.6 }}
              onClick={open}
              className="relative h-56 w-80 cursor-pointer md:h-64 md:w-[26rem]"
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="paper sticker-sm absolute inset-x-5 bottom-3 top-3 rounded-lg p-4 text-left"
                animate={phase === "opening" ? { y: -170 } : { y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {phase === "opening" && (
                  <div className="font-hand text-2xl leading-tight">
                    <Typewriter
                      text="Dear Navya, there's something I've wanted to tell you for a really long time..."
                      speed={45}
                      onDone={() => setTimeout(() => setPhase("psych"), 700)}
                    />
                  </div>
                )}
              </motion.div>
              <div
                className="sticker-sm absolute inset-0 rounded-lg"
                style={{
                  background:
                    "linear-gradient(to top right, #f6e6c4 49.5%, transparent 50%) left / 50% 100% no-repeat, linear-gradient(to top left, #f6e6c4 49.5%, transparent 50%) right / 50% 100% no-repeat, #efd9ab",
                }}
              />
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 origin-top"
                style={{
                  background: "linear-gradient(to bottom right, #e8cf9a 49.5%, transparent 50%) left / 50% 100% no-repeat, linear-gradient(to bottom left, #e8cf9a 49.5%, transparent 50%) right / 50% 100% no-repeat",
                  transformStyle: "preserve-3d",
                }}
                animate={phase === "opening" ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.div
                className="font-hand absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#7a0d2e] bg-[#c2185b] text-2xl text-white shadow-lg"
                animate={phase === "opening" ? { scale: 0, rotate: 180 } : { scale: [1, 1.1, 1] }}
                transition={{ repeat: phase === "digital" ? Infinity : 0, duration: 1 }}
              >
                NJ
              </motion.div>
            </motion.div>
            {phase === "digital" && <div className="font-comic text-2xl">👆 tap to open</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "psych" && <Psych onRestart={restart} />}
    </div>
  );
}
