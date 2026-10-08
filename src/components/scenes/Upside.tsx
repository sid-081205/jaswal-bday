"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { emojiBurst } from "@/lib/fx";
import { say, sfx } from "@/lib/sfx";
import { useExperience } from "../context";
import { Btn, Page } from "../ui";

export default function Upside() {
  const { next, shake } = useExperience();
  const [phase, setPhase] = useState<"calm" | "flipped" | "fixed">("calm");

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("flipped");
      sfx.boom();
      sfx.whoosh();
      shake("lg");
      say("uh oh", { pitch: 0.5, rate: 0.7 });
    }, 3200);
    return () => clearTimeout(t);
  }, [shake]);

  const fix = () => {
    setPhase("fixed");
    sfx.boing();
    sfx.whoosh();
    emojiBurst("🙃", 0.5, 0.5, 30);
  };

  const flipped = phase === "flipped";

  return (
    <Page chapter="CHAPTER 3" title="THE INCIDENT" bg={flipped ? "bg-[#ffe14d]" : "paper"}>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 pt-24 md:flex-row md:gap-14"
        animate={{ rotate: flipped ? 180 : 0, scale: flipped ? [1, 0.6, 1] : 1 }}
        transition={{ duration: 1.3, type: flipped ? "tween" : "spring", ease: "easeInOut" }}
      >
        <motion.div
          className="sticker relative bg-white p-3 pb-12"
          animate={{ rotate: flipped ? [0, 3, -3, 0] : -3 }}
          transition={{ repeat: flipped ? Infinity : 0, duration: 2 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/upside.webp" alt="Navya hanging upside down" className="h-[36vh] w-auto md:h-[55vh]" />
          <div className="font-hand absolute bottom-1 left-0 right-0 text-center text-2xl">
            {phase === "fixed" ? "...she was upside down ALL ALONG" : "normal photo of a normal girl"}
          </div>
        </motion.div>
        <div className="max-w-md text-center">
          {phase === "calm" && (
            <div className="font-hand text-4xl leading-snug">
              And then, one fateful day...
              <br />
              her best friend <b className="text-pink">FORGOT HER BIRTHDAY.</b>
            </div>
          )}
          {flipped && (
            <div className="flex flex-col items-center gap-6">
              <div className="font-comic outline-text text-5xl text-pink md:text-7xl">
                THE WORLD TURNED UPSIDE DOWN 🙃
              </div>
              <div className="font-hand text-3xl">
                (she&apos;s the only one who looks normal now. coincidence? no.)
              </div>
              <Btn onClick={fix} color="var(--cyan)">
                FIX GRAVITY 🔧
              </Btn>
            </div>
          )}
          {phase === "fixed" && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-6">
              <div className="font-comic text-5xl md:text-6xl">
                gravity: <span className="text-lime outline-text">FIXED</span> ✅
              </div>
              <div className="font-hand text-3xl">
                Navya: <span className="text-pink">still upside down</span> 🦇
              </div>
              <Btn onClick={next}>next page →</Btn>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Page>
  );
}
