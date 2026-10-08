"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { emojiBurst } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, EmojiField, Page, Typewriter } from "../ui";

export default function Palm() {
  const { next } = useExperience();
  const [step, setStep] = useState(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [18, -18]), { stiffness: 150, damping: 12 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-22, 22]), { stiffness: 150, damping: 12 });

  return (
    <Page chapter="CHAPTER 1" title="THE GIRL & THE TREE">
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 pt-28 md:flex-row md:gap-14 md:pt-16"
        onPointerMove={(e) => {
          mx.set(e.clientX / window.innerWidth - 0.5);
          my.set(e.clientY / window.innerHeight - 0.5);
        }}
      >
        <EmojiField emojis={["🌴", "🥥", "☀️", "🌺"]} count={12} />
        <motion.div
          initial={{ scale: 0, rotate: 200 }}
          animate={{ scale: 1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 90, damping: 10, delay: 0.4 }}
          style={{ perspective: 900 }}
          className="relative z-10"
          onClick={(e) => {
            sfx.sparkle();
            emojiBurst("🌴", e.clientX / window.innerWidth, e.clientY / window.innerHeight, 15);
          }}
        >
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            className="sticker cursor-pointer bg-white p-3 pb-14"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/palm.webp" alt="Navya leaning on a palm tree" className="h-[38vh] w-auto md:h-[58vh]" />
            <div className="font-hand absolute bottom-2 left-0 right-0 text-center text-3xl">
              exhibit A: tree leaning 🌴
            </div>
          </motion.div>
        </motion.div>
        <div className="relative z-10 max-w-md text-center md:text-left">
          <div className="font-hand min-h-[9rem] text-3xl leading-snug md:text-4xl">
            {step >= 0 && (
              <Typewriter
                text="Once upon a time, among the coconut trees, there lived a girl named Navya Jaswal. She leaned on palm trees like she paid rent there."
                onDone={() => setStep(1)}
              />
            )}
          </div>
          {step >= 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6">
              <Btn onClick={next}>turn the page →</Btn>
            </motion.div>
          )}
        </div>
      </div>
    </Page>
  );
}
