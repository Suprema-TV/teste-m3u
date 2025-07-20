export default async (req, context) => {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  if (!target) return new Response("Missing URL", { status: 400 });

  // Copia cabeçalhos do cliente (incluindo Range)
  const forwardedHeaders = {};
  req.headers.forEach((v, k) => (forwardedHeaders[k] = v));

  const upstream = await fetch(target, { headers: forwardedHeaders });
  const resHdr = {};
  upstream.headers.forEach((v, k) => (resHdr[k] = v));

  // Força CORS
  resHdr["Access-Control-Allow-Origin"] = "*";
  resHdr["Access-Control-Allow-Headers"] = "*";

  /* ------------ SE FOR PLAYLIST M3U8, REESCREVE ------------ */
  const isPlaylist =
    (resHdr["content-type"] || "").includes("application/vnd.apple.mpegurl") ||
    target.toLowerCase().endsWith(".m3u8");

  if (isPlaylist) {
    const text = await upstream.text();               // lê a playlist
    const base = target.substring(0, target.lastIndexOf("/") + 1);

    const rewritten = text
      .split("\n")
      .map((line) => {
        line = line.trim();
        if (line === "" || line.startsWith("#")) return line;

// trata também sub-playlists
const fullUrl = new URL(line, base).toString();
return "/.netlify/functions/proxy?url=" + encodeURIComponent(fullUrl);

        const abs = new URL(line, base).toString();          // URL absoluta
        return (
          "/.netlify/functions/proxy?url=" + encodeURIComponent(abs)
        );                                                   // passa no proxy
      })
      .join("\n");

    resHdr["content-type"] = "application/vnd.apple.mpegurl";
    return new Response(rewritten, { status: 200, headers: resHdr });
  }

  /* ------------ NÃO É PLAYLIST: SÓ REPASSA O STREAM ------------ */
  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHdr,
  });
};
