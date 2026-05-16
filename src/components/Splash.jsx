import { useEffect, useMemo, useState } from "react";

function readCssTimeToMs(value, fallbackMs) {
  if (!value) return fallbackMs;
  const v = value.trim();
  if (v.endsWith("ms")) return parseFloat(v);
  if (v.endsWith("s")) return parseFloat(v) * 1000;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallbackMs;
}

export default function Splash({ onFinish, logoSrc = "/assets/logo.webp" }) {
  const [isHiding, setIsHiding] = useState(false);
  const [done, setDone] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  // lock scroll while mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  // auto hide based on CSS vars (same as your HTML)
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);

    const popDurMs = prefersReducedMotion
      ? 0
      : readCssTimeToMs(css.getPropertyValue("--wrd-popDur"), 1150);

    const holdMs = readCssTimeToMs(css.getPropertyValue("--wrd-hold"), 900);
    const fadeMs = readCssTimeToMs(css.getPropertyValue("--wrd-fade"), 550);

    const total = popDurMs + holdMs;

    const t1 = setTimeout(() => setIsHiding(true), total);
    const t2 = setTimeout(() => {
      setDone(true);
      onFinish?.();
    }, total + fadeMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish, prefersReducedMotion]);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      className={[
        "fixed inset-0 z-9999 grid place-items-center",

        "bg-[#F6F1E8]",
        "transition-opacity duration-550ms ease-out",
        isHiding ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {imgOk ? (
        <img
          src={logoSrc}
          alt="WRD"
          draggable={false}
          onError={() => setImgOk(false)}
          className={[
            "w-[min(70vmin,360px)] h-auto object-contain select-none",
            prefersReducedMotion
              ? "opacity-100 scale-100"
              : "animate-wrd-splashPop",
            "drop-shadow-[0_20px_50px_rgba(0,0,0,0.22)]",
          ].join(" ")}
        />
      ) : (
        // fallback لو مسار الصورة غلط
        <div className="text-[42px] font-bold text-(--wrd-brown)">WRD</div>
      )}
    </div>
  );
}
