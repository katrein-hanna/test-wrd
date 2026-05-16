import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useI18n } from "../i18n/useI18n";
import { useMenuData } from "../hooks/useMenuData";

export default function MenuSectionPage() {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { locale } = useI18n();
  const { menuData, loading, error } = useMenuData();

  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const lang = isAr ? "ar" : "en";

  const section = useMemo(
    () => menuData.find((s) => s.id === sectionId),
    [menuData, sectionId],
  );

  const pick = useCallback(
    (v) => {
      if (v == null) return "";
      if (typeof v === "number") return String(v);
      if (typeof v === "string") return v;
      return v[locale] ?? v.ar ?? v.en ?? "";
    },
    [locale],
  );

  if (loading) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-[#F6F1E8] text-wrd-brown"
        dir={dir}
        lang={lang}
      >
        <Header />
        <div className="min-h-screen bg-[#F6F1E8] p-6">
          <div className="mt-6 text-black/70">
            {isAr ? "جارٍ تحميل القسم..." : "Loading section..."}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-[#F6F1E8] text-wrd-brown"
        dir={dir}
        lang={lang}
      >
        <Header />
        <div className="min-h-screen bg-[#F6F1E8] p-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border-2 border-wrd-darkBrown bg-wrd-cream px-4 py-2 text-sm"
          >
            {isAr ? "← رجوع" : "← Back"}
          </button>

          <div className="mt-6 text-red-700">
            {isAr ? "حدث خطأ أثناء تحميل المنيو." : "Failed to load menu."}
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-[#F6F1E8] text-wrd-brown"
        dir={dir}
        lang={lang}
      >
        <Header />
        <div className="min-h-screen bg-[#F6F1E8] p-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border-2 border-wrd-darkBrown bg-wrd-cream px-4 py-2 text-sm"
          >
            {isAr ? "← رجوع" : "← Back"}
          </button>

          <div className="mt-6 text-black/70">
            {isAr ? "القسم غير موجود." : "Section not found."}
          </div>
        </div>
      </div>
    );
  }

  const sectionTitle = pick(section.title);
  const sectionNote =
    pick(section.note) ||
    (isAr ? "اختر من الأصناف المتاحة" : "Choose from available items");

  const items = (section.items ?? []).filter((item) => item.available);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#F6F1E8] text-wrd-brown"
      dir={dir}
      lang={lang}
    >
      <Header />

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 pb-14 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className={dir === "rtl" ? "text-right" : "text-left"}>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-wrd-darkBrown">
              {sectionTitle}
            </h1>
            <p className="mt-1 text-sm text-wrd-brown">{sectionNote}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-wrd-darkBrown/40 bg-wrd-cream px-3 py-2 text-sm text-wrd-darkBrown shadow-[0_12px_30px_rgba(0,0,0,.06)] backdrop-blur"
          >
            {isAr ? (
              <>
                رجوع <span aria-hidden>←</span>
              </>
            ) : (
              <>
                <span aria-hidden>→</span> Back
              </>
            )}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((it, idx) => {
            const itemName = pick(it.name);
            const itemDesc = pick(it.desc);
            const priceLabel = it.price;

            return (
              <div
                key={it.item_id || `${sectionId}-${idx}`}
                className="rounded-[22px] border border-wrd-darkBrown/10 bg-wrd-cream px-5 py-5 shadow-[0_18px_55px_rgba(0,0,0,.08)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <div className="text-lg md:text-xl font-normal text-wrd-darkBrown">
                      {itemName}
                    </div>

                    {itemDesc ? (
                      <div className="mt-1 text-sm leading-relaxed text-wrd-brown">
                        {itemDesc}
                      </div>
                    ) : null}
                  </div>

                  {it.price != null ? (
                    <span
                      dir="ltr"
                      lang="en"
                      className="shrink-0 rounded-full border border-wrd-darkBrown/15 bg-white/40 px-3 py-1 text-sm text-wrd-darkBrown "
                    >
                      {priceLabel} SYP
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="rounded-2xl border border-black/10 bg-white/70 p-5 text-center text-black/55">
              {isAr
                ? "لا توجد عناصر في هذا القسم."
                : "No items in this section."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
