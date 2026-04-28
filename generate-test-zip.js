const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');

async function createTestZip() {
  const zip = new AdmZip();
  const sourceDir = path.join(process.cwd(), 'test-update-source');
  
  // Criar pasta de teste
  await fs.ensureDir(path.join(sourceDir, 'app'));
  
  // Criar um arquivo de confirmação que será "instalado" pelo update
  await fs.writeFile(
    path.join(sourceDir, 'app', 'TEST_UPDATE_SUCCESS.txt'), 
    'ATUALIZAÇÃO DE TESTE REALIZADA COM SUCESSO!\nData: ' + new Date().toLocaleString('pt-BR')
  );

  // Adicionar ao zip
  zip.addLocalFolder(sourceDir);
  
  // Salvar na pasta pública para facilitar acesso
  const outputPath = path.join(process.cwd(), 'public', 'test-update-v2.5.0.zip');
  await fs.ensureDir(path.join(process.cwd(), 'public'));
  zip.writeZip(outputPath);
  
  console.log('Zip de teste criado em: ' + outputPath);
  
  // Limpar fonte
  await fs.remove(sourceDir);
}

createTestZip().catch(console.error);
