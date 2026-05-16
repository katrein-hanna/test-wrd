import React from "react";
import { useI18n } from "../i18n/useI18n";
import { translations } from "../i18n/translations";

export default function FloatingActions({
  instagramUrl = "https://www.instagram.com/wrd_resort?igsh=bGlkdzRoNmJleGx3",
  restaurantPhone = "+963984000113",
  cottagesPhone = "+963984000151",
}) {
  const { locale } = useI18n();
  const t = translations[locale] ?? translations.ar;

  return (
    <div className="fixed inset-x-0 bottom-3 z-50 md:hidden">
      {/* ✅ safe horizontal padding so it never touches/cuts on edges */}
      <div className="mx-auto w-full max-w-[560px] px-3">
        <div
          className="
            flex flex-wrap items-center justify-between gap-2
            rounded-2xl border border-black/10 bg-white/65 p-2
            shadow-lg backdrop-blur
          "
        >
          <ActionBtn
            href={instagramUrl}
            targetBlank
            label={t.instagram}
            className="bg-[#7e5e45] text-wrd-gold"
            icon={<InstagramIcon />}
          />

          <ActionBtn
            href={`tel:${restaurantPhone}`}
            label={t.restaurant}
            className="bg-[#4c3122] text-wrd-gold"
            icon={<ForkKnifeIcon />}
          />

          <ActionBtn
            href={`tel:${cottagesPhone}`}
            label={t.cottages}
            className="bg-[#2f1f16] text-wrd-gold"
            icon={<CottageIcon />}
          />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ href, label, icon, className, targetBlank = false }) {
  return (
    <a
      href={href}
      target={targetBlank ? "_blank" : undefined}
      rel={targetBlank ? "noreferrer" : undefined}
      className={[
        // ✅ important: allow shrinking so 3 fit, and wrap if needed
        "min-w-0 flex-1 basis-0",
        "flex items-center justify-center gap-2",
        "rounded-xl px-3 py-3",
        "text-[12px] font-semibold",
        "shadow-sm active:scale-[0.99] transition",
        className,
      ].join(" ")}
      aria-label={label}
    >
      <span className="grid place-items-center shrink-0">{icon}</span>

      {/* ✅ prevent label from forcing width */}
      <span className="leading-none truncate">{label}</span>
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17.5 6.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ForkKnifeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2v9M8 2v9M10 2v9M8 11v11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 2v9c0 2-1 3-3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 14v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CottageIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11.5 12 4l9 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5V20h12v-9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 20v-6h4v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
