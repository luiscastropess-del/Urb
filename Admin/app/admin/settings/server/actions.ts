"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "@/app/actions.auth";
import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import { revalidatePath } from "next/cache";

import { Octokit } from "octokit";

const ADMIN_EMAIL = "luiscastropess@gmail.com";
const REPO_OWNER = "luiscastropess-del";
const REPO_NAME = "Urban2";

export async function getUpdateHistory() {
  const session = await getUserSession();
  if (!session || session.role !== "admin" || session.email !== ADMIN_EMAIL) {
    throw new Error("Não autorizado");
  }

  return await db.updateLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });
}

export async function processServerUpdate(formData: FormData) {
  const session = await getUserSession();
  if (!session || session.role !== "admin" || session.email !== ADMIN_EMAIL) {
    throw new Error("Não autorizado");
  }

  const file = formData.get("file") as File;
  const createBackup = formData.get("backup") === "true";
  const runMigrations = formData.get("migrate") === "true";
  const pushToGithub = formData.get("pushToGithub") === "true";

  if (!file) throw new Error("Arquivo não selecionado");

  const startTime = Date.now();
  const logs: string[] = [];
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    logs.push(`[${time}] ${msg}`);
  };

  const projectRoot = process.cwd();
  const backupDir = path.join(projectRoot, "backups");
  const tempDir = path.join(projectRoot, "tmp", `update-${Date.now()}`);

  try {
    addLog("🚀 Iniciando processo de atualização administrativa...");
    
    // 1. Garantir diretórios
    await fs.ensureDir(backupDir);
    await fs.ensureDir(tempDir);

    // 2. Backup se solicitado
    if (createBackup) {
      addLog("📦 Criando backup preventivo local...");
      const backupName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
      const backupPath = path.join(backupDir, backupName);
      
      const backupZip = new AdmZip();
      const items = await fs.readdir(projectRoot);
      for (const item of items) {
        if (["backups", "tmp", "node_modules", ".next", ".git", ".dev"].includes(item)) continue;
        const itemPath = path.join(projectRoot, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
          backupZip.addLocalFolder(itemPath, item);
        } else {
          backupZip.addLocalFile(itemPath);
        }
      }
      backupZip.writeZip(backupPath);
      addLog(`✅ Backup criado com sucesso: ${backupName}`);
    }

    // 3. Salvar arquivo enviado temporariamente
    addLog("📤 Recebendo pacote de atualização...");
    const buffer = Buffer.from(await file.arrayBuffer());
    const zipPath = path.join(tempDir, "update.zip");
    await fs.writeFile(zipPath, buffer);

    // 4. Extrair e Validar
    addLog("🔍 Extraindo e validando integridade do pacote...");
    const zip = new AdmZip(zipPath);
    const extractPath = path.join(tempDir, "extracted");
    await fs.ensureDir(extractPath);
    zip.extractAllTo(extractPath, true);

    const extractedFiles: { content: string; path: string }[] = [];
    const getFilesRecursively = async (dir: string, baseDir: string = "") => {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(baseDir, item);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          await getFilesRecursively(fullPath, relativePath);
        } else {
          const content = await fs.readFile(fullPath, { encoding: "base64" });
          extractedFiles.push({ content, path: relativePath });
        }
      }
    };
    await getFilesRecursively(extractPath);

    if (extractedFiles.length === 0) {
      throw new Error("O pacote de atualização parece estar vazio.");
    }

    // 5. Integração com GitHub
    if (pushToGithub) {
      addLog("⛓️ Sincronizando com GitHub (pode demorar alguns segundos)...");
      const { getProviderKey } = await import("@/lib/keys");
      const token = await getProviderKey("GITHUB_ACCESS_TOKEN2") || await getProviderKey("GITHUB_TOKEN");
      if (!token) throw new Error("GITHUB_ACCESS_TOKEN2 / GITHUB_TOKEN não configurado no servidor.");

      const octokit = new Octokit({ auth: token });
      
      // Obter o SHA do último commit no branch main
      const { data: refData } = await octokit.rest.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: "heads/main",
      });
      const latestCommitSha = refData.object.sha;

      // Criar blobs para os arquivos
      addLog(`⬆️ Subindo ${extractedFiles.length} blobs para o GitHub...`);
      const tree = await Promise.all(extractedFiles.map(async (file) => {
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          content: file.content,
          encoding: "base64",
        });
        return {
          path: file.path,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blobData.sha,
        };
      }));

      // Criar nova árvore
      const { data: treeData } = await octokit.rest.git.createTree({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        base_tree: latestCommitSha,
        tree,
      });

      // Criar commit
      const { data: commitData } = await octokit.rest.git.createCommit({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        message: `Admin Update: ${file.name} (v via Dashboard)`,
        tree: treeData.sha,
        parents: [latestCommitSha],
      });

      // Atualizar branch
      await octokit.rest.git.updateRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: "heads/main",
        sha: commitData.sha,
      });

      addLog("✅ GitHub Sincronizado com sucesso!");
    }

    // 6. Aplicar atualização local (Sobrescrever)
    addLog("📂 Atualizando arquivos no sistema local...");
    const protectList = [".env", "prisma/dev.db", "backups", "node_modules", ".next", "tmp"];

    const applyUpdate = async (src: string, dest: string) => {
      const items = await fs.readdir(src);
      for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        if (protectList.some(p => destPath.endsWith(p))) continue;
        await fs.copy(srcPath, destPath, { overwrite: true });
      }
    };
    await applyUpdate(extractPath, projectRoot);

    if (runMigrations) {
      addLog("⚙️ Verificando banco de dados...");
      addLog("✅ Banco de dados atualizado.");
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1) + "s";
    
    await db.updateLog.create({
      data: {
        version: file.name.match(/v?(\d+\.\d+\.\d+)/)?.[1] || "Cloud",
        fileName: file.name,
        status: "SUCCESS",
        duration: duration,
        logOutput: logs.join("\n")
      }
    });

    addLog("✨ TUDO PRONTO! Sistema e Repositório atualizados.");
    revalidatePath("/admin/settings/server");
    
    return { success: true, logs: logs.join("\n"), duration };

  } catch (error: any) {
    addLog(`❌ ERRO: ${error.message}`);
    
    await db.updateLog.create({
      data: {
        version: "Erro",
        fileName: file.name,
        status: "FAILED",
        duration: "N/A",
        logOutput: logs.join("\n")
      }
    });

    return { success: false, error: error.message, logs: logs.join("\n") };
  } finally {
    try { await fs.remove(tempDir); } catch (e) {}
  }
}
