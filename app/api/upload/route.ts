import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString("base64");

    const ext = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const githubToken = process.env.GITHUB_ACCESS_TOKEN2;
    if (!githubToken) {
      return NextResponse.json({ error: "GITHUB_ACCESS_TOKEN2 not set" }, { status: 500 });
    }

    const response = await fetch(`https://api.github.com/repos/luiscastropess-del/Holambra-Imagens/contents/images/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload ${filename}`,
        content: content,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Github upload error:", err);
      return NextResponse.json({ error: "API de armazenamento não configurada." }, { status: 500 });
    }

    const resData = await response.json();
    const rawUrl = resData.content.download_url;

    return NextResponse.json({ url: rawUrl });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
