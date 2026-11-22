import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 6000;

function respond(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": status === 200 ? "public, max-age=900" : "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isPublicIpv4(address) {
  if (isIP(address) !== 4) return false;
  const [first, second, third] = address.split(".").map(Number);
  return !(
    first === 0
    || first === 10
    || first === 127
    || first >= 224
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 0)
    || (first === 192 && second === 168)
    || (first === 192 && second === 88 && third === 99)
    || (first === 198 && (second === 18 || second === 19))
    || (first === 198 && second === 51 && third === 100)
    || (first === 203 && second === 0 && third === 113)
  );
}

async function validateAndResolveUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid public web link.");
  }

  if (
    !["http:", "https:"].includes(url.protocol)
    || url.username
    || url.password
    || (url.port && url.port !== (url.protocol === "https:" ? "443" : "80"))
    || !url.hostname
    || isIP(url.hostname)
    || url.hostname.endsWith(".localhost")
    || url.hostname.endsWith(".local")
  ) {
    throw new Error("This link cannot be previewed.");
  }

  let records;
  try {
    records = await lookup(url.hostname, { all: true, family: 4, verbatim: true });
  } catch {
    throw new Error("The linked website could not be reached.");
  }

  if (!records.length || records.some(({ address }) => !isPublicIpv4(address))) {
    throw new Error("This link cannot be previewed.");
  }
  return { url, address: records[0].address };
}

function getResponse(url, address) {
  return new Promise((resolve, reject) => {
    const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      {
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9",
          "Accept-Encoding": "identity",
          "User-Agent": "FilmyBrothersLinkPreview/1.0",
        },
        lookup: (hostname, options, callback) => {
          if (options?.all) {
            callback(null, [{ address, family: 4 }]);
          } else {
            callback(null, address, 4);
          }
        },
        servername: url.hostname,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) => {
        const chunks = [];
        let totalBytes = 0;
        const declaredLength = Number(response.headers["content-length"] || 0);
        if (declaredLength > MAX_HTML_BYTES) {
          response.destroy();
          reject(new Error("The linked page is too large to preview."));
          return;
        }

        response.on("data", (chunk) => {
          totalBytes += chunk.length;
          if (totalBytes > MAX_HTML_BYTES) {
            response.destroy(new Error("The linked page is too large to preview."));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          resolve({
            body: Buffer.concat(chunks).toString("utf8"),
            headers: response.headers,
            statusCode: response.statusCode || 0,
          });
        });
        response.on("error", reject);
      },
    );

    request.on("timeout", () => request.destroy(new Error("The linked website took too long to respond.")));
    request.on("error", reject);
    request.end();
  });
}

async function getHtmlPage(initialUrl) {
  let target = initialUrl;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const { url, address } = await validateAndResolveUrl(target);
    const response = await getResponse(url, address);
    if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
      const location = response.headers.location;
      if (!location || redirects === MAX_REDIRECTS) {
        throw new Error("The linked website has too many redirects.");
      }
      target = new URL(location, url).toString();
      continue;
    }

    const contentType = response.headers["content-type"] || "";
    if (response.statusCode < 200 || response.statusCode >= 300 || !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error("The linked page does not provide a preview.");
    }
    return { html: response.body, url };
  }
  throw new Error("The linked website could not be previewed.");
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      try {
        return String.fromCodePoint(Number.parseInt(code, 16));
      } catch {
        return "";
      }
    })
    .replace(/&#([0-9]+);/g, (_, code) => {
      try {
        return String.fromCodePoint(Number.parseInt(code, 10));
      } catch {
        return "";
      }
    });
}

function getMetaAttributes(tag) {
  const attributes = {};
  const attributePattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(attributePattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

async function readMetadata(html, pageUrl) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] || html.slice(0, MAX_HTML_BYTES);
  const meta = {};
  for (const tag of head.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = getMetaAttributes(tag);
    const key = (attributes.property || attributes.name || "").toLowerCase();
    const content = decodeHtmlEntities(attributes.content || "").trim();
    if (key && content && !meta[key]) meta[key] = content;
  }

  const titleTag = head.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] || "";
  const title = meta["og:title"]
    || meta["twitter:title"]
    || decodeHtmlEntities(titleTag.replace(/<[^>]*>/g, "").trim())
    || pageUrl.hostname.replace(/^www\./, "");
  const description = meta["og:description"]
    || meta["twitter:description"]
    || meta.description
    || "";

  let image = meta["og:image"] || meta["og:image:url"] || meta["twitter:image"] || "";
  if (image) {
    try {
      const imageUrl = new URL(image, pageUrl);
      const validatedImage = await validateAndResolveUrl(imageUrl.toString());
      image = validatedImage.url.toString();
    } catch {
      image = "";
    }
  }

  return {
    title: title.slice(0, 300),
    description: description.slice(0, 500),
    image,
    siteName: (meta["og:site_name"] || pageUrl.hostname.replace(/^www\./, "")).slice(0, 120),
  };
}

async function isStoredNewsEvent(url) {
  const projectUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) {
    throw new Error("News and Events preview is not configured.");
  }

  const endpoint = new URL("/rest/v1/news_events", projectUrl);
  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("url", `eq.${url}`);
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("News and Events links could not be checked.");
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0;
}

export default async function linkPreview(request) {
  if (request.method !== "GET") return respond(405, { error: "Method not allowed." });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return respond(403, { error: "Invalid request origin." });
    } catch {
      return respond(403, { error: "Invalid request origin." });
    }
  }

  const value = new URL(request.url).searchParams.get("url");
  if (!value || value.length > 2048) return respond(400, { error: "A valid link is required." });

  try {
    const { url } = await validateAndResolveUrl(value);
    const canonicalUrl = url.toString();
    if (!await isStoredNewsEvent(canonicalUrl)) return respond(404, { error: "News and Events link not found." });

    const { html, url: pageUrl } = await getHtmlPage(canonicalUrl);
    return respond(200, await readMetadata(html, pageUrl));
  } catch (error) {
    console.error("A News and Events link preview could not be loaded.", error);
    return respond(502, { error: error.message || "The linked page could not be previewed." });
  }
}
