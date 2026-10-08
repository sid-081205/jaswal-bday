"use client";

import { createContext, useContext } from "react";

export type ShakeLevel = "sm" | "lg";

export type ExperienceApi = {
  next: () => void;
  restart: () => void;
  shake: (level?: ShakeLevel) => void;
  setShotDvd: (on: boolean) => void;
};

export const ExperienceContext = createContext<ExperienceApi>({
  next: () => {},
  restart: () => {},
  shake: () => {},
  setShotDvd: () => {},
});

export const useExperience = () => useContext(ExperienceContext);
