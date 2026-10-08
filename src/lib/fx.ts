import confetti from "canvas-confetti";

const COLORS = ["#ff2e88", "#ffe14d", "#2de2e6", "#7b2ff7", "#b6ff3b", "#ffffff"];

export function burst(x = 0.5, y = 0.5, count = 120) {
  void confetti({
    particleCount: count,
    spread: 100,
    startVelocity: 45,
    origin: { x, y },
    colors: COLORS,
    zIndex: 9999,
  });
}

export function cannons() {
  void confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.9 }, colors: COLORS, zIndex: 9999 });
  void confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.9 }, colors: COLORS, zIndex: 9999 });
}

export function emojiBurst(emoji: string, x = 0.5, y = 0.5, count = 30) {
  const shape = confetti.shapeFromText({ text: emoji, scalar: 3 });
  void confetti({
    shapes: [shape],
    scalar: 3,
    particleCount: count,
    spread: 140,
    startVelocity: 40,
    origin: { x, y },
    zIndex: 9999,
  });
}

export function fireworks(ms = 4000) {
  const end = Date.now() + ms;
  const id = setInterval(() => {
    if (Date.now() > end) return clearInterval(id);
    void confetti({
      particleCount: 60,
      startVelocity: 30,
      spread: 360,
      ticks: 70,
      gravity: 0.8,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      colors: COLORS,
      zIndex: 9999,
    });
  }, 260);
  return () => clearInterval(id);
}
