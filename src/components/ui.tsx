"use client";

import { motion } from "motion/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { rand } from "@/lib/rand";
import { sfx } from "@/lib/sfx";

export const FACES = {
  shock: "/media/face-shock.webp",
  upside: "/media/face-upside.webp",
  smile: "/media/face-smile.webp",
  palm: "/media/face-palm.webp",
  climb: "/media/face-climb.webp",
};
export const FACE_LIST = Object.values(FACES);

export function Btn({
  children,
  onClick,
  color = "var(--yellow)",
  className = "",
  big = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  className?: string;
  big?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, rotate: -2 }}
      whileTap={{ scale: 0.9, rotate: 3 }}
      onClick={() => {
        sfx.pop();
        onClick?.();
      }}
      className={`font-comic sticker rounded-2xl text-ink cursor-pointer ${
        big ? "px-10 py-5 text-4xl md:text-5xl" : "px-6 py-3 text-2xl md:text-3xl"
      } ${className}`}
      style={{ background: color }}
    >
      {children}
    </motion.button>
  );
}

export function Typewriter({
  text,
  speed = 35,
  className = "",
  onDone,
  sound = true,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
  sound?: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      setN((v) => v + 1);
      if (sound && n % 2 === 0 && text[n] !== " ") sfx.blip();
    }, text[n] === "." || text[n] === "," ? speed * 6 : speed);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, text]);
  return (
    <span className={className}>
      {text.slice(0, n)}
      {n < text.length && <span className="blink">▌</span>}
    </span>
  );
}

export function Page({
  chapter,
  title,
  children,
  bg = "paper",
  className = "",
}: {
  chapter?: string;
  title?: string;
  children: ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${bg} ${className}`}>
      {chapter && (
        <motion.div
          initial={{ y: -120, rotate: -8 }}
          animate={{ y: 0, rotate: -3 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
          className="absolute left-1/2 top-3 z-20 -translate-x-1/2 text-center"
        >
          <div className="font-comic sticker-sm inline-block rounded-lg bg-pink px-4 py-1 text-lg text-white md:text-xl">
            {chapter}
          </div>
          {title && (
            <div className="font-comic outline-text mt-1 text-3xl text-yellow md:text-5xl">{title}</div>
          )}
        </motion.div>
      )}
      {children}
    </div>
  );
}

export function FaceRain({ count = 24, duration = 6 }: { count?: number; duration?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        src: FACE_LIST[i % FACE_LIST.length],
        x: rand(i) * 100,
        size: 50 + rand(i + 100) * 90,
        delay: rand(i + 200) * duration,
        dur: 2.5 + rand(i + 300) * 3,
        spin: (rand(i + 400) - 0.5) * 1080,
      })),
    [count, duration],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {items.map((f) => (
        <motion.img
          key={f.id}
          src={f.src}
          alt=""
          className="absolute rounded-full border-4 border-ink"
          style={{ left: `${f.x}%`, width: f.size, height: f.size, top: -160 }}
          animate={{ y: ["0vh", "130vh"], rotate: [0, f.spin] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export function EmojiField({ emojis, count = 20 }: { emojis: string[]; count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        e: emojis[i % emojis.length],
        x: rand(i + 500) * 100,
        y: rand(i + 600) * 100,
        s: 1.5 + rand(i + 700) * 2.5,
        d: rand(i + 800) * 3,
      })),
    [emojis, count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <motion.div
          key={it.id}
          className="absolute"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.s}rem` }}
          animate={{ y: [0, -25, 0], rotate: [-15, 15, -15] }}
          transition={{ duration: 3 + it.d, repeat: Infinity, ease: "easeInOut", delay: it.d }}
        >
          {it.e}
        </motion.div>
      ))}
    </div>
  );
}

export function SkipLink({ after = 15000, onSkip, label = "i'm bad at games, skip →" }: { after?: number; onSkip: () => void; label?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), after);
    return () => clearTimeout(t);
  }, [after]);
  if (!show) return null;
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSkip}
      className="font-body absolute bottom-16 right-4 z-40 cursor-pointer rounded-full bg-white/80 px-4 py-2 text-sm text-ink underline"
    >
      {label}
    </motion.button>
  );
}
