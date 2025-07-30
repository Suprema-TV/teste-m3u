import fetch from "node-fetch";
import admin from "firebase-admin";

// Conectar ao Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://login-581de-default-rtdb.firebaseio.com"
  });
}

export async function handler(event, context) {
  try {
    const token = event.queryStringParameters.t;
    if (!token) return { statusCode: 403, body: "Token ausente" };

    // Valida token no Firebase
    const snap = await admin.database().ref(`tokens/${token}`).get();
    if (!snap.exists()) return { statusCode: 403, body: "Token inválido" };

    const dados = snap.val();
    if (new Date() > new Date(dados.expira))
      return { statusCode: 403, body: "Token expirado" };

    // URL original do provedor
    const urlOriginal = `http://fcbt627.cc/get.php?username=SEUUSER&password=SEUPASS&type=m3u_plus&output=ts`;

    // Proxy transparente
    const resp = await fetch(urlOriginal, {
      headers: {
        "User-Agent": event.headers["user-agent"] || "",
        "Range": event.headers["range"] || ""
      }
    });

    const buffer = await resp.arrayBuffer();
    return {
      statusCode: resp.status,
      headers: {
        "Content-Type": resp.headers.get("content-type") || "application/octet-stream",
        "Content-Length": resp.headers.get("content-length") || buffer.byteLength,
        "Accept-Ranges": resp.headers.get("accept-ranges") || "bytes"
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Erro no proxy" };
  }
}
