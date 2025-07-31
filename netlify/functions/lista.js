import fetch from "node-fetch";

export async function handler() {
  try {
    // Substitua username e password pelos corretos do provedor
    const urlOriginal = `http://fcbt627.cc/get.php?username=SEUUSER&password=SEUPASS&type=m3u_plus&output=ts`;

    const resp = await fetch(urlOriginal);

    // Se o provedor não respondeu OK
    if (![200, 206].includes(resp.status)) {
      return {
        statusCode: resp.status,
        body: `Erro do provedor: status ${resp.status}`
      };
    }

    // Pega a resposta como texto
    const texto = await resp.text();

    // Retorna só um pedaço para testar
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: texto.slice(0, 500) // primeiros 500 caracteres
    };
  } catch (err) {
    // Agora retorna o erro na tela
    return {
      statusCode: 500,
      body: `Erro interno na função: ${err.stack}`
    };
  }
}
