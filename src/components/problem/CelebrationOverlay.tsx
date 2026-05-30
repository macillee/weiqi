"use client";

import { useEffect, useState } from "react";

type CelebrationOverlayProps = {
  triggered: boolean;
  onComplete?: () => void;
};

type StarParticle = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  delay: number;
  size: number;
  rotation: number;
};

const STAR_EMOJIS = ["⭐", "✨", "💫", "🌟"];

function generateParticles(): StarParticle[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: STAR_EMOJIS[i % STAR_EMOJIS.length],
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 70,
    delay: Math.random() * 0.3,
    size: 16 + Math.random() * 20,
    rotation: (Math.random() - 0.5) * 60,
  }));
}

export default function CelebrationOverlay({
  triggered,
  onComplete,
}: CelebrationOverlayProps) {
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!triggered) return;
    setParticles(generateParticles());
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [triggered]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute inline-block animate-celebrate-star"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
          aria-hidden
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
