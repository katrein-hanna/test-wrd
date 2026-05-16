import React from "react";
import { useI18n } from "../i18n/useI18n";
import { translations } from "../i18n/translations";

function CategoryCrad({
  title,
  count,
  bgSrc = "/assets/bg-card.webp",
  onClick,
}) {
  const { locale } = useI18n();
  const t = translations[locale] ?? translations.ar;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="
        group relative w-full max-w-sm overflow-hidden rounded-3xl
        text-left shadow-lg border-2 border-wrd-brown
        aspect-16/11 md:aspect-auto "
      style={{
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "right",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* ✅ content area: leave bottom space so count never overlaps */}
      <div className="relative h-full px-6 md:px-12 pt-10 md:pt-12 pb-16 md:pb-16">
        <h1
          className={`font-display font-extrabold text-wrd-gold ${locale === "ar" ? "text-2xl" : "text-xl"}  md:text-3xl text-shadow text-shadow-lg text-shadow-black leading-[1.05`}
        >
          {title}
        </h1>
      </div>

      {/* count */}
      <div
        className={`absolute bottom-4 ${locale === "ar" ? "left-5" : "right-5"}  z-10 font-medium text-wrd-gold/75 wrd-outline-small`}
        style={{ fontSize: "clamp(10px, 1vw + 6px, 14px)" }}
      >
        {count} {t.items}
      </div>
    </button>
  );
}

export default CategoryCrad;
