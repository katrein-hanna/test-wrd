import { useNavigate } from "react-router-dom";
import CategoryCrad from "../components/CategoryCrad";
import Header from "../components/Header";
import FloatingActions from "../components/FloatingActions";
import { useI18n } from "../i18n/useI18n";
import { useMenuData } from "../hooks/useMenuData";

export default function HomePage() {
  const navigate = useNavigate();
  const { locale, setLocale, dir, lang } = useI18n();
  const { menuData, loading, error } = useMenuData();

  const CATEGORIES = menuData.map((sec) => ({
    id: sec.id,
    title:
      typeof sec.title === "string"
        ? sec.title
        : (sec.title?.[locale] ?? sec.title?.ar ?? ""),
    count: sec.items?.length ?? 0,
  }));

  const toggleLang = () => setLocale(locale === "ar" ? "en" : "ar");

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#F6F1E8] text-wrd-brown"
      dir={dir}
      lang={lang}
    >
      <Header />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end pt-4">
          <button
            type="button"
            onClick={toggleLang}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-wrd-darkBrown/40 bg-wrd-cream px-3 py-2 text-sm text-wrd-darkBrown shadow-[0_12px_30px_rgba(0,0,0,.06)] backdrop-blur"
            aria-label="Toggle language"
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>

        <div className="px-2 pt-2 sm:pt-2 flex flex-col gap-1 items-start justify-between">
          <h1 className="font-bold text-xl md:text-3xl lg:text-4xl text-wrd-darkBrown">
            {locale === "ar" ? "الفئات:" : "Categories:"}
          </h1>
          <p className="mt-1 text-sm text-wrd-brown">
            {locale === "ar"
              ? "اختر قسمًا لعرض الأصناف"
              : "Pick a category to view items"}
          </p>
        </div>
      </div>

      <main className="px-4 pb-28 pt-6 sm:pt-8">
        {loading ? (
          <div className="mx-auto max-w-5xl text-center text-wrd-brown">
            {locale === "ar" ? "جارٍ تحميل المنيو..." : "Loading menu..."}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-5xl text-center text-red-700">
            {locale === "ar"
              ? "حدث خطأ أثناء تحميل المنيو"
              : "Failed to load menu"}
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className="w-full max-w-[420px] justify-self-center"
              >
                <CategoryCrad
                  title={c.title}
                  count={c.count}
                  bgSrc="/assets/bg-card.webp"
                  onClick={() => navigate(`/menu/${c.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <FloatingActions
        restaurantPhone="+963984000113"
        cottagesPhone="+963984000151"
        instagramUrl="https://www.instagram.com/wrd_resort?igsh=bGlkdzRoNmJleGx3"
      />
    </div>
  );
}
