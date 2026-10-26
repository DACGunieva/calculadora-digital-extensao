// Checagem somente-leitura: compara o release GitHub ao que o Render entrega.
// Nenhum dado clínico, token ou credencial é consultado.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export async function verificarPublicacao({ origem, versao, fetcher = fetch }) {
  const base = new URL(origem);
  if (base.protocol !== 'https:') throw new Error('Apenas endpoint HTTPS.');
  const consultar = async (path) => {
    const response = await fetcher(new URL(path, base), {
      redirect: 'error',
      signal: AbortSignal.timeout(20000),
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) throw new Error('HTTP ' + response.status + ' em ' + path);
    return response.text();
  };
  // Duas URLs públicas já existentes; comparação textual evita ler dados pessoais.
  const [sw, html] = await Promise.all([consultar('/sw.js'), consultar('/')]);
  const cache = 'calculadora-extensao-static-v' + versao;
  const estilo = './styles.css?v=' + versao;
  const app = './app.js?v=' + versao;
  const verificacoes = {
    service_worker: sw.includes(cache),
    css_publicado: html.includes(estilo),
    javascript_publicado: html.includes(app),
  };
  if (!Object.values(verificacoes).every(Boolean)) {
    throw new Error('Deploy não corresponde à versão GitHub ' + versao + ': ' +
      Object.entries(verificacoes).filter(([,ok]) => !ok).map(([campo]) => campo).join(', '));
  }
  return { versao, verificacoes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const versao = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
  const origem = process.env.CALCULADORA_URL || 'https://calculadora-digital-extensao.onrender.com';
  verificarPublicacao({ origem, versao }).then(r => {
    console.log('Versão pública confirmada:', r.versao);
  }).catch(e => {
    console.error('DIVERGÊNCIA DE DEPLOY:', e.message);
    process.exitCode = 1;
  });
}
