import { Octokit } from 'octokit';

// Configure para o seu repositório
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN2;
const REPO_OWNER = 'luiscastropess-del';
const REPO_NAME = 'Holambra-Imagens';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function uploadImageToGitHub(imageUrl: string, filename: string): Promise<string> {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_ACCESS_TOKEN2 not configured, returning original URL');
    return imageUrl;
  }

  try {
    // 1. Baixar a imagem (stream para memória, cuidando da memória)
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    // Converter para base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // 2. Upload para o GitHub via API
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `images/${filename}`,
      message: `upload image: ${filename}`,
      content: base64,
      branch: 'main',
    });

    return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/images/${filename}`;
  } catch (error) {
    console.error('Erro ao enviar imagem para o GitHub:', error);
    return imageUrl; // Fallback
  }
}
