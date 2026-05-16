import React from "react";
import { useI18n } from "../i18n/useI18n";
import { translations } from "../i18n/translations";

function Header() {
  const { locale } = useI18n();
  const t = translations[locale] ?? translations.ar;

  return (
    <>
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 wrd-hero-bg" />
      <div className="absolute inset-0 -z-10 wrd-hero-noise opacity-[0.07]" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-wrd-brown/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-72 w-72 rounded-full bg-wrd-darkBrown/18 blur-3xl" />

      {/* ✅ Centered page container (fixes large screens) */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-6 sm:pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/assets/logo.webp"
                alt="wrd"
                className="h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-full border border-wrd-brown/40"
              />

              <div className="flex flex-col gap-2">
                <div className="text-xl md:text-3xl lg:text-4xl font-bold text-wrd-darkBrown">
                  {t.headerTitle}
                </div>
                <div className="font-sans text-sm md:text-lg lg:text-xl text-wrd-darkBrown/60">
                  {t.headerSubtitle}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </header>
      </div>
    </>
  );
}

export default Header;
