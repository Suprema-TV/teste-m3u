import fetch from "node-fetch";

export async function handler(event) {
  try {
    // 🔴 Use aqui seu username e password reais do provedor
    const urlOriginal = `http://fcbt627.cc/get.php?username=SEUUSER&password=SEUPASS&type=m3u_plus&output=ts`;

    const resp = await fetch(urlOriginal);

    if (![200, 206].includes(resp.status)) {
      return { statusCode: resp.status, body: "Erro no provedor" };
    }

    const texto = await resp.text();
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: texto
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Erro no proxy" };
  }
}
