import { createDecipheriv, createHmac } from "node:crypto";
import { join } from "node:path";
import { FuelPrices } from "@/lib/types";

const PETROLIMEX_LOGIN_URL = "https://www.petrolimex.com.vn/_login";
const PETROLIMEX_API_URL =
  "https://portals.petrolimex.com.vn/~apis/portals/cms.item/search";
const PETROLIMEX_HOME_URL = "https://www.petrolimex.com.vn/";
const PETROLIMEX_PRESS_URL =
  "https://www.petrolimex.com.vn/ndi/thong-cao-bao-chi.html";
const REQUEST_TIMEOUT_MS = 6000;

const PETROLIMEX_SYSTEM_ID = "6783dc1271ff449e95b74a9520964169";
const PETROLIMEX_REPOSITORY_ID = "a95451e23b474fe5886bfb7cf843f53c";
const PETROLIMEX_REPOSITORY_ENTITY_ID = "3801378fe1e045b1afa10de7c5776124";

const FALLBACK_FUEL_PRICES: FuelPrices = {
  "E5 RON92": 19470,
  "RON95-III": 20680,
  "RON95-IV": 21100,
  last_updated: "2026-03-24T23:00:00+07:00",
  next_update_note: "Tạm dùng giá dự phòng khi Petrolimex chưa phản hồi",
  source: "fallback",
  source_url: PETROLIMEX_PRESS_URL
};

type PetrolimexSession = {
  ID: string;
  DeviceID: string;
  Token: string;
  Keys: {
    AES: {
      Key: string;
      IV: string;
    };
    JWT: string;
  };
};

type PetrolimexProduct = {
  Title: string;
  Zone1Price: number;
  LastModified: string;
};

type AnnouncementInfo = {
  sourceUrl: string;
  lastUpdated?: string;
};

type PetrolimexSearchResponse = {
  Objects?: Array<{
    Title?: string;
    Zone1Price?: number;
    LastModified?: string;
  }>;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
    string,
    string | number
  >;
}

function decryptJwtSecret(encryptedJwt: string, aesKeyHex: string, aesIvHex: string) {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(aesKeyHex, "hex"),
    Buffer.from(aesIvHex, "hex")
  );

  return (
    decipher.update(encryptedJwt, "base64", "utf8") + decipher.final("utf8")
  );
}

function signJwt(payload: Record<string, string | number>, secret: string) {
  const header = { typ: "JWT", alg: "HS256" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DoXangBaoNhieu/1.0)"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: {
      revalidate: 1800
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DoXangBaoNhieu/1.0)"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: {
      revalidate: 1800
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function createPetrolimexApiUrl() {
  const session = await fetchJson<PetrolimexSession>(PETROLIMEX_LOGIN_URL);
  const jwtSecret = decryptJwtSecret(
    session.Keys.JWT,
    session.Keys.AES.Key,
    session.Keys.AES.IV
  );
  const tokenPayload = decodeJwtPayload(session.Token);

  tokenPayload.iat = Math.round(Date.now() / 1000);

  const request = {
    FilterBy: {
      And: [
        { SystemID: { Equals: PETROLIMEX_SYSTEM_ID } },
        { RepositoryID: { Equals: PETROLIMEX_REPOSITORY_ID } },
        { RepositoryEntityID: { Equals: PETROLIMEX_REPOSITORY_ENTITY_ID } },
        { Status: { Equals: "Published" } }
      ]
    },
    SortBy: {
      LastModified: "Descending"
    },
    Pagination: {
      TotalRecords: -1,
      TotalPages: 0,
      PageSize: 20,
      PageNumber: 1
    }
  };

  const params = new URLSearchParams({
    "x-request": Buffer.from(JSON.stringify(request)).toString("base64url"),
    "x-app-token": signJwt(tokenPayload, jwtSecret),
    "x-session-id": encodeBase64Url(session.ID),
    "x-device-id": encodeBase64Url(session.DeviceID),
    "x-app-name": encodeBase64Url("NGX Websites"),
    "x-app-platform": encodeBase64Url("Desktop PWA"),
    language: "vi-VN"
  });

  return `${PETROLIMEX_API_URL}?${params.toString()}`;
}

function normalizeProducts(data: PetrolimexSearchResponse) {
  return (data.Objects ?? [])
    .filter(
      (item): item is Required<Pick<PetrolimexProduct, "Title" | "Zone1Price" | "LastModified">> =>
        typeof item.Title === "string" &&
        typeof item.Zone1Price === "number" &&
        typeof item.LastModified === "string"
    )
    .map((item) => ({
      Title: item.Title,
      Zone1Price: item.Zone1Price,
      LastModified: item.LastModified
    }));
}

function pickPrice(
  products: PetrolimexProduct[],
  matcher: (title: string) => boolean
) {
  return products.find((product) => matcher(product.Title))?.Zone1Price;
}

function normalizeProductTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

async function fetchOfficialFuelPrices() {
  const apiUrl = await createPetrolimexApiUrl();
  const data = await fetchJson<PetrolimexSearchResponse>(apiUrl);
  const products = normalizeProducts(data);

  if (products.length === 0) {
    throw new Error("Petrolimex price list is empty");
  }

  const e5Price = pickPrice(products, (title) => {
    const normalized = normalizeProductTitle(title);
    return (
      normalized.startsWith("XANG SINH HOC E5 RON 92") ||
      normalized.startsWith("XANG E5 RON 92")
    );
  });
  const ron95IIIPrice = pickPrice(products, (title) => {
    const normalized = normalizeProductTitle(title);
    return normalized.startsWith("XANG KHONG CHI RON 95-III");
  });
  const ron95IVPrice =
    pickPrice(products, (title) => {
      const normalized = normalizeProductTitle(title);
      return (
        normalized.startsWith("XANG KHONG CHI RON 95-IV") ||
        normalized.startsWith("XANG KHONG CHI RON 95-V")
      );
    }) ??
    ron95IIIPrice;

  if (!e5Price || !ron95IIIPrice || !ron95IVPrice) {
    throw new Error("Petrolimex products did not include enough fuel grades");
  }

  const latestTimestamp = products
    .map((product) => new Date(product.LastModified).getTime())
    .sort((left, right) => right - left)[0];

  return {
    "E5 RON92": e5Price,
    "RON95-III": ron95IIIPrice,
    "RON95-IV": ron95IVPrice,
    last_updated: new Date(latestTimestamp).toISOString(),
    next_update_note: "Tự động đồng bộ theo công bố mới nhất của Petrolimex",
    source: "official" as const,
    source_url: PETROLIMEX_PRESS_URL
  } satisfies FuelPrices;
}

function findLatestAnnouncementPath(pressPage: string) {
  const listedArticleMatches = [
    ...pressPage.matchAll(
      /<h3[^>]*class="post-default__title"[^>]*>\s*<a href="([^"]+)"/gi
    )
  ]
    .map((match) => match[1])
    .filter((href) =>
      /\/ndi\/thong-cao-bao-chi\/petrolimex-dieu-chinh-gia-xang-dau-tu-[^"]+\.html$/i.test(
        href
      )
    );

  if (listedArticleMatches.length > 0) {
    return listedArticleMatches[0];
  }

  return pressPage.match(
    /href="([^"]*\/ndi\/thong-cao-bao-chi\/petrolimex-dieu-chinh-gia-xang-dau-tu-[^"]+\.html)"/i
  )?.[1];
}

async function fetchLatestAnnouncement() {
  const pressPage = await fetchText(PETROLIMEX_PRESS_URL);
  const latestPath = findLatestAnnouncementPath(pressPage);

  if (!latestPath) {
    return undefined;
  }

  const sourceUrl = new URL(latestPath, PETROLIMEX_PRESS_URL).toString();
  const slugMatch = latestPath.match(/ngay-(\d{1,2})-(\d{1,2})-(\d{4})\.html$/i);

  if (!slugMatch) {
    return {
      sourceUrl
    };
  }

  const [, day, month, year] = slugMatch;

  return {
    sourceUrl,
    lastUpdated: new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T23:00:00+07:00`
    ).toISOString()
  };
}

function normalizeOcrText(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[|]/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function parsePriceToken(token: string) {
  const digits = token.replace(/\D/g, "");

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
    const lines = text.split("\n");

    for (const rawLine of lines) {
      const line = normalizeOcrText(rawLine);

      if (!matcher(line)) {
        continue;
      }

      const prices = line.match(/\d{2}[.,]\d{3}|\d{5}/g) ?? [];
      const parsed = prices.map(parsePriceToken).filter(
        (value): value is number => typeof value === "number"
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
      .split("\n")
      .map((line) => normalizeOcrText(line))
      .filter(matcher);

    const targetLine = matchedLines[lineIndex];

    if (!targetLine) {
      continue;
    }

    const prices = targetLine.match(/\d{2}[.,]\d{3}|\d{5}/g) ?? [];
    const parsed = prices.map(parsePriceToken).filter(
      (value): value is number => typeof value === "number"
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
  sharpModule: typeof import("sharp"),
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
    tessedit_char_whitelist: "0123456789.,"
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

    if (typeof value !== "number") {
      return undefined;
    }

    zone1Rows.push(value);
  }

  return {
    "E5 RON92": zone1Rows[3],
    "RON95-III": zone1Rows[1],
    "RON95-IV": zone1Rows[0]
  };
}

async function fetchAnnouncementImageUrl(sourceUrl: string) {
  const html = await fetchText(sourceUrl);
  const matchedImage = html.match(
    /<img[^>]+src="([^"]*gi%C3%A1%20b%C3%A1n%20l%E1%BA%BB[^"]+)"/i
  );

  if (!matchedImage) {
    return undefined;
  }

  return matchedImage[1].startsWith("http")
    ? matchedImage[1]
    : new URL(matchedImage[1], sourceUrl).toString();
}

async function performFuelPriceOcr(imageUrl: string) {
  const [{ default: sharp }, { createWorker, PSM }] = await Promise.all([
    import("sharp"),
    import("tesseract.js")
  ]);

  const imageResponse = await fetch(imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DoXangBaoNhieu/1.0)",
      Referer: PETROLIMEX_HOME_URL
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS * 3)
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

  const worker = await createWorker("eng", 1, {
    workerPath: join(
      process.cwd(),
      "node_modules",
      "tesseract.js",
      "src",
      "worker-script",
      "node",
      "index.js"
    )
  });
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
      preserve_interword_spaces: "1"
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

  const premiumPrice =
    extractZone1PriceByLineIndex(ocrTexts, nonBioGasolineMatcher, 0) ??
    extractZone1Price(
      ocrTexts,
      (line) =>
        /RON\s*95[-\s]?(IV|V)\b/.test(line) ||
        (line.includes("KHONG CHI") && /RON\s*95/.test(line) && !/E10|E5/.test(line))
    );
  const ron95IIIPrice =
    extractZone1PriceByLineIndex(ocrTexts, nonBioGasolineMatcher, 1) ??
    extractZone1Price(
      ocrTexts,
      (line) =>
        line.includes("KHONG CHI") &&
        /RON/.test(line) &&
        !/RON\s*95[-\s]?(IV|V)\b/.test(line) &&
        !/E10|E5/.test(line)
    );
  const e5Price = extractZone1Price(
    ocrTexts,
    (line) => /E[5S]\s*RON\s*9[2Z]/.test(line)
  );

  if (!premiumPrice || !ron95IIIPrice || !e5Price) {
    throw new Error("OCR could not extract enough Petrolimex fuel prices");
  }

  return {
    "E5 RON92": e5Price,
    "RON95-III": ron95IIIPrice,
    "RON95-IV": premiumPrice,
    ocrTexts
  };
}

async function fetchOcrFuelPrices(announcement: AnnouncementInfo) {
  const imageUrl = await fetchAnnouncementImageUrl(announcement.sourceUrl);

  if (!imageUrl) {
    throw new Error("Petrolimex announcement did not expose a price image");
  }

  const ocrPrices = await performFuelPriceOcr(imageUrl);

  return {
    "E5 RON92": ocrPrices["E5 RON92"],
    "RON95-III": ocrPrices["RON95-III"],
    "RON95-IV": ocrPrices["RON95-IV"],
    last_updated: announcement.lastUpdated ?? FALLBACK_FUEL_PRICES.last_updated,
    next_update_note: "OCR từ thông cáo Petrolimex mới nhất",
    source: "ocr" as const,
    source_url: announcement.sourceUrl
  } satisfies FuelPrices;
}

export async function getFuelPrices() {
  const latestAnnouncement = await fetchLatestAnnouncement().catch(() => undefined);

  try {
    const officialPrices = await fetchOfficialFuelPrices();

    return latestAnnouncement
      ? {
          ...officialPrices,
          last_updated: latestAnnouncement.lastUpdated ?? officialPrices.last_updated,
          source_url: latestAnnouncement.sourceUrl
        }
      : officialPrices;
  } catch {
    if (latestAnnouncement) {
      try {
        return await fetchOcrFuelPrices(latestAnnouncement);
      } catch {
        return {
          ...FALLBACK_FUEL_PRICES,
          last_updated:
            latestAnnouncement.lastUpdated ?? FALLBACK_FUEL_PRICES.last_updated,
          source_url: latestAnnouncement.sourceUrl
        };
      }
    }

    return FALLBACK_FUEL_PRICES;
  }
}
