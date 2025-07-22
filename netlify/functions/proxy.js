export default async (req, context) => {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  if (!target) return new Response("Missing URL", { status: 400 });

  // Copia cabeçalhos do cliente (incluindo Range)
  const forwardedHeaders = {};
  req.headers.forEach((v, k) => (forwardedHeaders[k] = v));

  const upstream = await fetch(target, { headers: forwardedHeaders });
  
  // Clona todos os headers de resposta
  const resHdr = new Headers(upstream.headers);
  
  // Força CORS
  resHdr.set("Access-Control-Allow-Origin", "*");
  resHdr.set("Access-Control-Allow-Headers", "*");
  resHdr.set("Access-Control-Expose-Headers", "*");

  // Trata playlist M3U8
  const isPlaylist =
    (resHdr.get("content-type") || "").includes("application/vnd.apple.mpegurl") ||
    target.toLowerCase().endsWith(".m3u8");

  if (isPlaylist) {
    const text = await upstream.text();
    const base = target.substring(0, target.lastIndexOf("/") + 1);

    const rewritten = text
      .split("\n")
      .map((line) => {
        line = line.trim();
        if (line === "" || line.startsWith("#")) return line;
        const abs = new URL(line, base).toString();
        return "/.netlify/functions/proxy?url=" + encodeURIComponent(abs);
      })
      .join("\n");

    resHdr.set("content-type", "application/vnd.apple.mpegurl");
    return new Response(rewritten, { status: 200, headers: resHdr });
  }

  // Caso não seja playlist, retorna o corpo direto (ex: .ts, .mp4)
  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHdr,
  });
};
