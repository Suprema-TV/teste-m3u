export default async (req, context) => {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl || !targetUrl.startsWith("http://")) {
    return new Response("URL inválida ou não permitida", { status: 400 });
  }

  try {
    const proxied = await fetch(targetUrl, {
      headers: {
        "User-Agent": req.headers.get("user-agent") || "",
      },
    });

    const contentType = proxied.headers.get("content-type") || "application/octet-stream";

    return new Response(proxied.body, {
      status: proxied.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
        "Access-Control-Allow-Origin": "*",    // CORS liberado
      },
    });
  } catch (err) {
    return new Response("Erro ao acessar o recurso", { status: 500 });
  }
};
