import React, { useEffect, useMemo, useState } from "react";
import { translations } from "./translations";
import { I18nContext } from "./i18n-context";

export default function I18nProvider({ children }) {
  const [locale, setLocale] = useState(
    () => localStorage.getItem("locale") || "ar",
  );

  useEffect(() => {
    localStorage.setItem("locale", locale);
    const t = translations[locale];

    document.documentElement.lang = t.lang;
    document.documentElement.dir = t.dir;
  }, [locale]);

  const value = useMemo(() => {
    const t = translations[locale];
    return {
      locale,
      setLocale,
      t: (key) => t[key] ?? key,
      dir: t.dir,
      lang: t.lang,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
