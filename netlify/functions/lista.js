import fetch from "node-fetch";

export async function handler() {
  try {
    const urlOriginal = `http://fcbt627.cc/get.php?username=SEUUSER&password=SEUPASS&type=m3u_plus&output=ts`;

    const resp = await fetch(urlOriginal);
    if (![200, 206].includes(resp.status)) {
      return {
        statusCode: resp.status,
        body: `Erro do provedor: ${resp.status}`
      };
    }

    const texto = await resp.text();
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: texto.slice(0, 500) // só os primeiros 500 caracteres para teste
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Erro interno: ${err.message}`
    };
  }
}
