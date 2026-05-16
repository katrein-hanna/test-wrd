/* eslint-disable no-undef */

let cachedMenu = null;
let cachedAt = 0;

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 min

function csvParse(text) {
  // Simple CSV parser (handles quotes)
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur);
      cur = "";
      // ignore empty last line
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

function rowsToObjects(rows) {
  if (!rows?.length) return [];
  const header = rows[0].map((h) => (h || "").trim());
  const out = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = (r?.[idx] ?? "").toString().trim();
    });
    // skip empty lines
    if (Object.values(obj).every((v) => v === "")) continue;
    out.push(obj);
  }
  return out;
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
  if (!s) return fallback;
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return fallback;
}

async function fetchSheetCsv(sheetId, sheetName) {
  const url =
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq` +
    `?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sheets fetch failed ${res.status}: ${t}`);
  }
  return await res.text();
}

export const handler = async () => {
  const SHEETS_ID = process.env.SHEETS_ID;
  const TTL_MS = Number(process.env.MENU_CACHE_TTL_MS || DEFAULT_TTL_MS);

  if (!SHEETS_ID) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing env var: SHEETS_ID" }),
    };
  }

  const now = Date.now();
  const cacheValid = cachedMenu && now - cachedAt < TTL_MS;

  if (cacheValid) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, s-maxage=${Math.floor(
          TTL_MS / 1000
        )}, stale-while-revalidate=60`,
        "X-Menu-Cache": "HIT",
      },
      body: JSON.stringify(cachedMenu),
    };
  }

  try {
    const [catsCsv, itemsCsv] = await Promise.all([
      fetchSheetCsv(SHEETS_ID, "Categories"),
      fetchSheetCsv(SHEETS_ID, "Menu Items"),
    ]);

    const catsRows = csvParse(catsCsv);
    const itemsRows = csvParse(itemsCsv);

    const cats = rowsToObjects(catsRows);
    const items = rowsToObjects(itemsRows);

    // Build categories map
    const byId = new Map();

    const categories = cats.map((c) => {
      const id = c.category_id;
      const cat = {
        id,
        group: c.group || "",
        title: { ar: c.title_ar || "", en: c.title_en || "" },
        note: { ar: c.note_ar || "", en: c.note_en || "" },
        sort_order: toNum(c.sort_order, 9999),
        items: [],
      };
      byId.set(id, cat);
      return cat;
    });

    // Attach items (✅ بدون sort_order للعناصر)
    for (const it of items) {
      const catId = it.category_id;
      const target = byId.get(catId);
      if (!target) continue;

      target.items.push({
        item_id: it.item_id || null,
        name: { ar: it.name_ar || "", en: it.name_en || "" },
        desc: { ar: it.desc_ar || "", en: it.desc_en || "" },
        price: toNum(it.price, null),
        available: toBool(it.available, true),
      });
    }

    // sort categories only
    categories.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    const result = categories.map((c) => ({
      id: c.id,
      group: c.group,
      title: c.title,
      note: c.note,
      items: c.items,
    }));

    cachedMenu = result;
    cachedAt = now;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, s-maxage=${Math.floor(
          TTL_MS / 1000
        )}, stale-while-revalidate=60`,
        "X-Menu-Cache": "MISS",
      },
      body: JSON.stringify(result),
    };
  } catch (e) {
    // إذا في كاش قديم رجّعه حتى ما تتعطل المنيو
    if (cachedMenu) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Menu-Cache": "STALE",
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