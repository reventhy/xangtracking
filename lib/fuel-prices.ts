import { unstable_cache } from "next/cache";
import { FuelPrices, FuelPricesState } from "@/lib/types";

const PETROLIMEX_MOBILE_AUTH_URL =
  "https://mobile-cms.petrolimex.com.vn/cms-service/public/api/authenticate";
const PETROLIMEX_MOBILE_PRICES_URL =
  "https://mobile-cms.petrolimex.com.vn/cms-service/api/v1/product-retail-applies/app/list-product-retail";
const PETROLIMEX_PRESS_URL =
  "https://www.petrolimex.com.vn/ndi/thong-cao-bao-chi.html";
const VNEXPRESS_FUEL_PRICES_URL = "https://vnexpress.net/chu-de/gia-xang-dau-3026";
const REQUEST_TIMEOUT_MS = 3000;

type MobileProduct = {
  productName: string;
  productCode: string;
  priceAreaOne: number;
  priceAreaTwo: number;
  productTypeCode: string;
};

type MobileAuthResponse = {
  code: number;
  data: {
    access_token: string;
    expires_in: number;
  };
};

type MobilePricesResponse = {
  code: number;
  data: {
    timeEffective: string;
    lstProduct: MobileProduct[];
  };
};

type AnnouncementInfo = {
  sourceUrl: string;
  lastUpdated?: string;
};

type NewsFuelRow = {
  label: string;
  price: number;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
};

// Use unstable_cache to persist token across serverless invocations
const getCachedAccessToken = unstable_cache(
  async (): Promise<CachedToken> => {
    const response = await fetch(PETROLIMEX_MOBILE_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: "{}",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Petrolimex auth failed: ${response.status} ${response.statusText}`);
    }

    const auth = (await response.json()) as MobileAuthResponse;

    if (auth.code !== 200 || !auth.data?.access_token) {
      throw new Error(`Petrolimex auth returned unexpected response: code ${auth.code}`);
    }

    return {
      accessToken: auth.data.access_token,
      expiresAt: Date.now() + auth.data.expires_in * 1000
    };
  },
  ["petrolimex-token"],
  { revalidate: 300, tags: ["petrolimex-token"] } // Cache for 5 minutes
);

// In-memory cache for hot path (same request)
let memoryToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Check memory cache first (fastest - same request)
  if (memoryToken && memoryToken.expiresAt > now + 60_000) {
    return memoryToken.accessToken;
  }

  // Use unstable_cache (persists across serverless invocations)
  const token = await getCachedAccessToken();
  memoryToken = token; // Update memory cache
  return token.accessToken;
}


async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DoXangBaoNhieu/1.0)"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}


function normalizeProductTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseVietnamesePrice(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    return undefined;
  }

  return Number.parseInt(digits, 10);
}

function extractNewsTableRows(html: string) {
  const tableMatch = html.match(
    /Giá bán lẻ xăng dầu hôm nay<\/h2>\s*<table[\s\S]*?<\/table>/i
  );

  if (!tableMatch) {
    return [];
  }

  const rows = [...tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  return rows
    .map((rowMatch) => {
      const cells = [...rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
        (cellMatch) => stripHtml(cellMatch[1])
      );

      if (cells.length < 2) {
        return undefined;
      }

      const price = parseVietnamesePrice(cells[1]);

      if (typeof price !== "number") {
        return undefined;
      }

      return {
        label: cells[0],
        price
      } satisfies NewsFuelRow;
    })
    .filter((row): row is NewsFuelRow => Boolean(row));
}

function parseNewsTableTimestamp(html: string) {
  const hour = html.match(/Giá từ\s*(\d{1,2})h/i)?.[1];
  const minute = html.match(/Giá từ\s*\d{1,2}h\s*(\d{1,2})\s*phút/i)?.[1] ?? "00";
  const dateMatch = html.match(
    /Giá từ\s*\d{1,2}h(?:\s*\d{1,2}\s*phút)?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
  );

  if (!hour || !dateMatch) {
    return new Date().toISOString();
  }

  const [, day, month, year] = dateMatch;

  return new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(
      2,
      "0"
    )}:${minute.padStart(2, "0")}:00+07:00`
  ).toISOString();
}

function findLatestNewsArticleUrls(topicPage: string) {
  return [
    ...new Set(
      [...topicPage.matchAll(/https:\/\/vnexpress\.net\/gia-xang-dau-moi-nhat-hom-nay-[^"#?]+\.html/gi)]
        .map((match) => match[0])
        .map((url) => url.split("#")[0])
    )
  ].slice(0, 5);
}

function extractArticleTableRows(articleHtml: string) {
  const article = articleHtml.match(/<article[^>]*class="fck_detail[\s\S]*?<\/article>/i)?.[0];

  if (!article) {
    return [];
  }

  const tableMatch = article.match(/<table[\s\S]*?<\/table>/i);

  if (!tableMatch) {
    return [];
  }

  const rows = [...tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  return rows
    .map((rowMatch) => {
      const cells = [...rowMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
        (cellMatch) => stripHtml(cellMatch[1])
      );

      if (cells.length < 2) {
        return undefined;
      }

      const price = parseVietnamesePrice(cells[1]);

      if (typeof price !== "number") {
        return undefined;
      }

      return {
        label: cells[0],
        price
      } satisfies NewsFuelRow;
    })
    .filter((row): row is NewsFuelRow => Boolean(row));
}

function parseNewsArticleTimestamp(articleHtml: string) {
  const match = articleHtml.match(
    /<span[^>]*class="date"[^>]*>[^<]*?(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})/i
  );

  if (!match) {
    return new Date().toISOString();
  }

  const [, day, month, year, hour, minute] = match;

  return new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(
      2,
      "0"
    )}:${minute}:00+07:00`
  ).toISOString();
}

function buildNewsFuelPrices(
  e5Price: number,
  ron95IIIPrice: number,
  last_updated: string,
  next_update_note: string
): FuelPrices {
  // News source has no zone distinction and no RON95-V data;
  // use RON95-III as best approximation for RON95-V.
  const zone1 = { "E5 RON92": e5Price, "RON95-III": ron95IIIPrice, "RON95-V": ron95IIIPrice };
  return {
    zone1,
    zone2: zone1, // no zone distinction from news
    allProducts: [
      { name: "Xăng E5 RON 92", priceZone1: e5Price, priceZone2: e5Price },
      { name: "Xăng RON 95-III", priceZone1: ron95IIIPrice, priceZone2: ron95IIIPrice }
    ],
    last_updated,
    next_update_note,
    source: "news" as const,
    source_url: VNEXPRESS_FUEL_PRICES_URL
  };
}

async function fetchNewsFuelPrices(): Promise<FuelPrices> {
  const topicHtml = await fetchText(VNEXPRESS_FUEL_PRICES_URL);
  const articleUrls = findLatestNewsArticleUrls(topicHtml);

  // Fetch articles in parallel with timeout
  const articleHtmls = await Promise.all(
    articleUrls.map((url) =>
      fetchText(url)
        .catch(() => undefined)
    )
  );

  // Check articles for prices
  for (const articleHtml of articleHtmls) {
    if (!articleHtml) continue;

    const rows = extractArticleTableRows(articleHtml);
    const ron95IIIPrice = rows.find((row) =>
      /XANG\s*RON\s*95-III/i.test(normalizeProductTitle(row.label))
    )?.price;
    const e5Price = rows.find((row) =>
      /XANG\s*E5\s*RON\s*92/i.test(normalizeProductTitle(row.label))
    )?.price;

    if (e5Price && ron95IIIPrice) {
      return buildNewsFuelPrices(
        e5Price,
        ron95IIIPrice,
        parseNewsArticleTimestamp(articleHtml),
        "Tự động đồng bộ từ bài viết giá xăng dầu mới nhất của VnExpress"
      );
    }
  }

  // Fallback: try extracting from topic page table
  const rows = extractNewsTableRows(topicHtml);
  const ron95IIIPrice = rows.find((row) =>
    /XANG\s*RON\s*95-III/i.test(normalizeProductTitle(row.label))
  )?.price;
  const e5Price = rows.find((row) =>
    /XANG\s*E5\s*RON\s*92/i.test(normalizeProductTitle(row.label))
  )?.price;

  if (!e5Price || !ron95IIIPrice) {
    throw new Error("Public fuel price sources did not include enough fuel grades");
  }

  return buildNewsFuelPrices(
    e5Price,
    ron95IIIPrice,
    parseNewsTableTimestamp(topicHtml),
    "Tự động đồng bộ từ bảng giá xăng dầu công khai mới nhất"
  );
}

function parseTimeEffective(timeEffective: string) {
  // Format: "DD/MM/YYYY HH:mm"
  const match = timeEffective.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);

  if (!match) {
    return new Date().toISOString();
  }

  const [, day, month, year, hour, minute] = match;

  return new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00+07:00`
  ).toISOString();
}

async function fetchOfficialFuelPrices(): Promise<FuelPrices> {
  const token = await getAccessToken();

  const response = await fetch(PETROLIMEX_MOBILE_PRICES_URL, {
    headers: {
      "Accept-Language": "vi",
      Authorization: `Bearer ${token}`
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Petrolimex prices failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as MobilePricesResponse;
  const products = data.data?.lstProduct ?? [];

  if (products.length === 0) {
    throw new Error("Petrolimex price list is empty");
  }

  const find = (matcher: (n: string) => boolean) =>
    products.find((p) => matcher(normalizeProductTitle(p.productName)));

  const e5 = find((n) => n.startsWith("XANG SINH HOC E5 RON 92") || n.startsWith("XANG E5 RON 92"));
  const ron95III = find((n) => n.includes("RON 95-III") && !n.includes("RON 95-IV") && !n.includes("RON 95-V") && !n.includes("E10"));
  const ron95V = find((n) => n.includes("RON 95-V") && !n.includes("E10"));

  if (!e5 || !ron95III) {
    throw new Error("Petrolimex products did not include enough fuel grades");
  }

  return {
    zone1: {
      "E5 RON92": e5.priceAreaOne,
      "RON95-III": ron95III.priceAreaOne,
      "RON95-V": ron95V?.priceAreaOne ?? ron95III.priceAreaOne
    },
    zone2: {
      "E5 RON92": e5.priceAreaTwo,
      "RON95-III": ron95III.priceAreaTwo,
      "RON95-V": ron95V?.priceAreaTwo ?? ron95III.priceAreaTwo
    },
    allProducts: products.map((p) => ({
      name: p.productName,
      priceZone1: p.priceAreaOne,
      priceZone2: p.priceAreaTwo
    })),
    last_updated: parseTimeEffective(data.data?.timeEffective ?? ""),
    next_update_note: "Tự động đồng bộ theo công bố mới nhất của Petrolimex",
    source: "official" as const,
    source_url: PETROLIMEX_PRESS_URL
  };
}


/* OCR functions disabled - not compatible with Vercel serverless environment
function normalizeOcrText(text: string) {
  return text
    .normalize(“NFKD”)
    .replace(/[|]/g, “ “)
    .replace(/[“”]/g, ‘”’)
    .replace(/[‘]/g, “’”)
    .replace(/\s+/g, “ “)
    .trim()
    .toUpperCase();
}

function parsePriceToken(token: string) {
  const digits = token.replace(/\D/g, “”);

  if (digits.length < 4) {
    return undefined;
  }

  return Number.parseInt(digits, 10);
}

function extractZone1Price(
  texts: string[],
  matcher: (line: string) => boolean
) {
  for (const text of texts) {
    const lines = text.split(“\n”);

    for (const rawLine of lines) {
      const line = normalizeOcrText(rawLine);

      if (!matcher(line)) {
        continue;
      }

      const prices = line.match(/\d{2}[.,]\d{3}|\d{5}/g) ?? [];
      const parsed = prices.map(parsePriceToken).filter(
        (value): value is number => typeof value === “number”
      );

      if (parsed.length > 0) {
        return parsed[0];
      }
    }
  }

  return undefined;
}

function extractZone1PriceByLineIndex(
  texts: string[],
  matcher: (line: string) => boolean,
  lineIndex: number
) {
  for (const text of texts) {
    const matchedLines = text
      .split(“\n”)
      .map((line) => normalizeOcrText(line))
      .filter(matcher);

    const targetLine = matchedLines[lineIndex];

    if (!targetLine) {
      continue;
    }

    const prices = targetLine.match(/\d{2}[.,]\d{3}|\d{5}/g) ?? [];
    const parsed = prices.map(parsePriceToken).filter(
      (value): value is number => typeof value === “number”
    );

    if (parsed.length > 0) {
      return parsed[0];
    }
  }

  return undefined;
}

async function extractStructuredZone1Prices(
  worker: {
    setParameters: (parameters: Record<string, string | number>) => Promise<unknown>;
    recognize: (image: Buffer) => Promise<{ data: { text: string } }>;
  },
  sharpModule: typeof import(“sharp”),
  input: Buffer,
  width: number,
  height: number
) {
  const tableTop = Math.round(height * 0.25);
  const tableBottom = Math.round(height * 0.91);
  const rowCount = 9;
  const rowHeight = Math.max(Math.round((tableBottom - tableTop) / rowCount), 24);
  const zone1Left = Math.round(width * 0.66);
  const zone1Width = Math.max(Math.round(width * 0.16), 80);

  const zone1Rows: number[] = [];

  await worker.setParameters({
    tessedit_pageseg_mode: 7,
    tessedit_char_whitelist: “0123456789.,”
  });

  for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
    const top = tableTop + rowIndex * rowHeight;
    const crop = await sharpModule(input)
      .extract({
        left: zone1Left,
        top,
        width: Math.min(zone1Width, width - zone1Left),
        height: Math.min(rowHeight, height - top)
      })
      .resize({ width: 1000 })
      .grayscale()
      .normalize()
      .threshold(170)
      .png()
      .toBuffer();
    const text = (await worker.recognize(crop)).data.text.trim();
    const value = parsePriceToken(text);

    if (typeof value !== “number”) {
      return undefined;
    }

    zone1Rows.push(value);
  }

  return {
    “E5 RON92”: zone1Rows[3],
    “RON95-III”: zone1Rows[1]
  };
}

async function fetchAnnouncementImageUrl(sourceUrl: string) {
  const html = await fetchText(sourceUrl);
  const matchedImage = html.match(
    /<img[^>]+src=”([^”]*gi%C3%A1%20b%C3%A1n%20l%E1%BA%BB[^”]+)”/i
  );

  if (!matchedImage) {
    return undefined;
  }

  return matchedImage[1].startsWith(“http”)
    ? matchedImage[1]
    : new URL(matchedImage[1], sourceUrl).toString();
}

async function performFuelPriceOcr(imageUrl: string) {
  const [{ default: sharp }, { createWorker, PSM }] = await Promise.all([
    import(“sharp”),
    import(“tesseract.js”)
  ]);

  const imageResponse = await fetch(imageUrl, {
    headers: {
      “User-Agent”: “Mozilla/5.0 (compatible; DoXangBaoNhieu/1.0)”,
      Referer: PETROLIMEX_HOME_URL
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS * 3),
    cache: “no-store”
  });

  if (!imageResponse.ok) {
    throw new Error(`Unable to fetch Petrolimex price image: ${imageResponse.status}`);
  }

  const input = Buffer.from(await imageResponse.arrayBuffer());
  const metadata = await sharp(input).metadata();
  const width = metadata.width ?? 1023;
  const height = metadata.height ?? 450;

  const variants = [
    sharp(input),
    sharp(input).grayscale().normalize(),
    sharp(input)
      .extract({
        left: 20,
        top: 40,
        width: Math.max(width - 40, 100),
        height: Math.max(height - 80, 100)
      })
      .grayscale()
      .normalize(),
    sharp(input)
      .extract({
        left: 20,
        top: 40,
        width: Math.max(width - 40, 100),
        height: Math.max(height - 80, 100)
      })
      .grayscale()
      .normalize()
      .threshold(170)
  ];

  const worker = await createWorker(“eng”);
  const ocrTexts: string[] = [];

  try {
    const structuredPrices = await extractStructuredZone1Prices(
      worker,
      sharp,
      input,
      width,
      height
    );

    if (structuredPrices) {
      return {
        ...structuredPrices,
        ocrTexts
      };
    }

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: “1”
    });

    for (const variant of variants) {
      const buffer = await variant.resize({ width: 3200 }).sharpen().png().toBuffer();
      const result = await worker.recognize(buffer);
      ocrTexts.push(result.data.text);
    }
  } finally {
    await worker.terminate();
  }

  const nonBioGasolineMatcher = (line: string) =>
    /KHONG\s*CHI|KHONGCHI/.test(line) && !/E10|E5/.test(line);

  const ron95IIIPrice =
    extractZone1PriceByLineIndex(ocrTexts, nonBioGasolineMatcher, 1) ??
    extractZone1PriceByLineIndex(ocrTexts, nonBioGasolineMatcher, 0) ??
    extractZone1Price(
      ocrTexts,
      (line) =>
        line.includes(“KHONG CHI”) &&
        /RON/.test(line) &&
        !/RON\s*95[-\s]?(IV|V)\b/.test(line) &&
        !/E10|E5/.test(line)
    );
  const e5Price = extractZone1Price(
    ocrTexts,
    (line) => /E[5S]\s*RON\s*9[2Z]/.test(line)
  );

  if (!ron95IIIPrice || !e5Price) {
    throw new Error(“OCR could not extract enough Petrolimex fuel prices”);
  }

  return {
    “E5 RON92”: e5Price,
    “RON95-III”: ron95IIIPrice,
    ocrTexts
  };
}

async function fetchOcrFuelPrices(announcement: AnnouncementInfo) {
  const imageUrl = await fetchAnnouncementImageUrl(announcement.sourceUrl);

  if (!imageUrl) {
    throw new Error(“Petrolimex announcement did not expose a price image”);
  }

  const ocrPrices = await performFuelPriceOcr(imageUrl);

  return {
    “E5 RON92”: ocrPrices[“E5 RON92”],
    “RON95-III”: ocrPrices[“RON95-III”],
    last_updated: announcement.lastUpdated ?? new Date().toISOString(),
    next_update_note: “OCR từ thông cáo Petrolimex mới nhất”,
    source: “ocr” as const,
    source_url: announcement.sourceUrl
  } satisfies FuelPrices;
}
*/

// Cache fuel prices for 5 minutes to avoid repeated API calls
const getCachedFuelPrices = unstable_cache(
  async (): Promise<FuelPricesState> => {
    // Try official API first (single request, no announcement page needed)
    try {
      const prices = await fetchOfficialFuelPrices();
      return { status: "success", prices };
    } catch {
      // Fall back to news scraping
      try {
        const prices = await fetchNewsFuelPrices();
        return { status: "success", prices };
      } catch {
        return {
          status: "error",
          message:
            "Không tải được giá xăng từ nguồn công khai hoặc Petrolimex lúc này. Vui lòng thử lại sau.",
          last_checked: new Date().toISOString(),
          source_url: PETROLIMEX_PRESS_URL
        };
      }
    }
  },
  ["fuel-prices"],
  { revalidate: 300, tags: ["fuel-prices"] } // 5 minutes
);

export async function getFuelPrices(): Promise<FuelPricesState> {
  return getCachedFuelPrices();
}
