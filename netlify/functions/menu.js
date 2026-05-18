/* eslint-disable no-undef */

let cachedMenu = null;      // نحتفظ بآخر نتيجة ناجحة فقط كـ fallback عند الخطأ
let inFlight = null;        // لمنع تكرار نفس الطلبات إذا صار burst

const EDGE_TTL_SEC = 300;   // 5 دقائق على Netlify Edge
const STALE_SEC = 60;

function csvParse(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map((h) => h.trim());

  const rows = [];
  for (const line of lines) {
    const cols = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);

    const obj = {};
    headers.forEach((h, idx) => (obj[h] = (cols[idx] ?? "").trim()));
    rows.push(obj);
  }
  return rows;
}

function toNum(v, fallback = null) {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(v, fallback = true) {
  if (v == null) return fallback;
  const s = String(v).trim().toLowerCase();
  if (s === "true") return true;
  if (s === "false") return false;
  return fallback;
}

// ✅ نضيف cache-bust صغير "يتغير كل 5 دقائق" حتى نتجنب أي كاش من Google نفسه
function sheetUrl(sheetId, sheetName) {
  const bucket = Math.floor(Date.now() / (EDGE_TTL_SEC * 1000));
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    sheetName
  )}&_=${bucket}`;
}

async function fetchSheetCsv(sheetId, sheetName) {
  const url = sheetUrl(sheetId, sheetName);
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Google Sheets ${sheetName} ${res.status}: ${txt}`);
  }
  return res.text();
}

function buildMenu(categoriesCsv, itemsCsv) {
  const categoriesRows = csvParse(categoriesCsv);
  const itemsRows = csvParse(itemsCsv);

  // categories: category_id, group, title_ar, title_en, note_ar, note_en, sort_order
  const categories = categoriesRows
    .filter((r) => r.category_id)
    .map((r) => ({
      id: String(r.category_id).trim(),
      group: r.group || "",
      title: { ar: r.title_ar || "", en: r.title_en || "" },
      note: { ar: r.note_ar || "", en: r.note_en || "" },
      sort_order: toNum(r.sort_order, 9999),
      items: [],
    }));

  const byId = new Map(categories.map((c) => [c.id, c]));

  // items: item_id, category_id, name_ar, name_en, desc_ar, desc_en, price, available
  for (const it of itemsRows) {
    const catId = String(it.category_id || "").trim();
    if (!catId) continue;

    const target = byId.get(catId);
    if (!target) continue;

    // تجاهل صفوف فاضية تماماً (ممكن تبقى آثار حذف)
    const nameAr = it.name_ar || "";
    const nameEn = it.name_en || "";
    if (!nameAr && !nameEn) continue;

    target.items.push({
      item_id: it.item_id ? toNum(it.item_id, null) : null,
      name: { ar: nameAr, en: nameEn },
      desc: { ar: it.desc_ar || "", en: it.desc_en || "" },
      price: toNum(it.price, null),
      available: toBool(it.available, true),
    });
  }

  categories.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

  return categories.map((c) => ({
    id: c.id,
    group: c.group,
    title: c.title,
    note: c.note,
    items: c.items,
  }));
}

export const handler = async () => {
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
  if (!GOOGLE_SHEET_ID) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing GOOGLE_SHEET_ID env var" }),
    };
  }

  const baseHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": `public, s-maxage=${EDGE_TTL_SEC}, stale-while-revalidate=${STALE_SEC}`,
  };

  try {
    // ✅ منع burst: إذا في طلب جاري، استنى نتيجته بدل ما تعمل طلبات جديدة على Google
    if (!inFlight) {
      inFlight = (async () => {
        const [catsCsv, itemsCsv] = await Promise.all([
          fetchSheetCsv(GOOGLE_SHEET_ID, "Categories"),
          fetchSheetCsv(GOOGLE_SHEET_ID, "Menu Items"),
        ]);
        const result = buildMenu(catsCsv, itemsCsv);
        cachedMenu = result; // ✅ آخر نتيجة ناجحة فقط
        return result;
      })().finally(() => {
        inFlight = null;
      });
    }

    const result = await inFlight;

    return {
      statusCode: 200,
      headers: { ...baseHeaders, "X-Menu-Cache": "ORIGIN" },
      body: JSON.stringify(result),
    };
  } catch (e) {
    // ✅ لو صار خطأ بجوجل، رجّع آخر نتيجة ناجحة حتى ما تتعطل المنيو
    if (cachedMenu) {
      return {
        statusCode: 200,
        headers: {
          ...baseHeaders,
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Menu-Cache": "STALE-FALLBACK",
        },
        body: JSON.stringify(cachedMenu),
      };
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Failed to load menu", error: e.message }),
    };
  }
};