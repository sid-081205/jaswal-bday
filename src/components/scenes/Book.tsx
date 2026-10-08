"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { FACES } from "../ui";

export default function Book() {
  const { next } = useExperience();
  const [open, setOpen] = useState(false);

  const openBook = () => {
    if (open) return;
    setOpen(true);
    sfx.whoosh();
    sfx.sparkle();
    setTimeout(next, 1700);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#1d0b2e]">
      <div className="absolute inset-[-60%] sunburst opacity-20" />
      <div className="absolute inset-0 halftone opacity-40" />
      <motion.div
        initial={{ scale: 0.2, rotate: -40, y: 400 }}
        animate={open ? { scale: 2.6, rotate: 0, y: 0, x: "30%" } : { scale: 1, rotate: -4, y: 0 }}
        transition={open ? { duration: 1.6, ease: "easeIn" } : { type: "spring", stiffness: 120, damping: 12 }}
        className="relative h-[70vh] max-h-[620px] w-[min(82vw,460px)] cursor-pointer"
        style={{ perspective: 1800 }}
        onClick={openBook}
      >
        <div className="paper sticker absolute inset-0 rounded-r-2xl p-8">
          <div className="font-hand text-4xl leading-tight md:text-5xl">Once upon a time...</div>
        </div>
        <motion.div
          className="sticker absolute inset-0 flex flex-col items-center justify-between rounded-r-2xl p-6 text-center"
          style={{
            transformOrigin: "left center",
            backfaceVisibility: "hidden",
            background: "linear-gradient(160deg,#ff2e88,#7b2ff7 60%,#2de2e6)",
          }}
          animate={open ? { rotateY: -170 } : { rotateY: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <div className="absolute inset-y-0 left-0 w-5 bg-black/25" />
          <div className="font-comic text-xl text-yellow">A MOSTLY TRUE STORY</div>
          <div>
            <div className="font-comic outline-text text-5xl leading-none text-white md:text-6xl">
              THE LEGEND OF
            </div>
            <div className="font-comic outline-text extrude rainbow-text mt-2 text-7xl leading-none md:text-8xl">
              NAVYA
            </div>
            <div className="font-comic outline-text text-6xl leading-none text-yellow md:text-7xl">JASWAL</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACES.palm} alt="" className="wobble h-28 w-28 rounded-full border-4 border-ink" />
          <div className="font-body text-sm text-white/90">
            a birthday storybook
            <br />
            <span className="italic">(delivered slightly late)</span>
          </div>
        </motion.div>
      </motion.div>
      {!open && (
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="font-comic absolute bottom-10 text-3xl text-yellow"
        >
          👆 tap the book to open it
        </motion.div>
      )}
    </div>
  );
}
