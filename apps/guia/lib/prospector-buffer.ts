// Mock de memória do servidor para o buffer de resultados
// Em um ambiente de container persistente, isso funciona entre requisições
let resultBuffer: any[] = [];

export function getResultBuffer() {
  const current = [...resultBuffer];
  return current;
}

export function clearResultBuffer() {
  resultBuffer = [];
}

export function setResultBuffer(data: any[]) {
  resultBuffer = data;
}
