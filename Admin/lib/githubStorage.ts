import { db } from "@/lib/prisma";

export async function processImageUpload(base64Data: string): Promise<string> {
  if (!base64Data || !base64Data.startsWith("data:image/")) {
    return base64Data; // Return as is if not a valid base64 image
  }

  try {
    // Pegar o token do db
    const apiKeyRecord = await db.apiKey.findUnique({
      where: { provider: "GITHUB_ACCESS_TOKEN2" },
    });

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      console.warn("GITHUB_ACCESS_TOKEN2 não configurado ou inativo. A imagem será salva no BD como texto Base64, o que não é ideal.");
      return base64Data;
    }

    const token = apiKeyRecord.key;

    // Extrair o conteúdo base64 da string "data:image/jpeg;base64,....."
    const match = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!match) return base64Data;

    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const imageContent = match[2];

    const filename = `images/${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    
    // GitHub API URL format
    const owner = "luiscastropess-del";
    const repo = "Holambra-Imagens";
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Aperture-Applet"
      },
      body: JSON.stringify({
        message: `Upload image ${filename}`,
        content: imageContent // The API requires exactly the base64 content
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Falha ao enviar imagem pro GitHub:", res.status, errorText);
      return base64Data;
    }

    // Retorna URL via jsDelivr CDN para melhor compatibilidade e cache
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${filename}`;
  } catch (error) {
    console.error("Erro na integração com GitHub para imagens:", error);
    return base64Data;
  }
}
