// Checagem somente-leitura: compara o release GitHub ao que o Render entrega.
// Nenhum dado clínico, token ou credencial é consultado.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export async function verificarPublicacao({ origem, versao, fetcher = fetch, arquivosEsperados = null }) {
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

  if (arquivosEsperados !== null) {
    // Publicação estática do Render faz cópia direta: o conteúdo servido deve
    // corresponder exatamente à versão do GitHub, mesmo sem alterar VERSION.
    const caminhosPublicos = new Set([
      '/', '/sw.js', '/app.js', '/calculations.js', '/bmi-who-data.js',
      '/styles.css', '/manifest.webmanifest',
    ]);
    const itens = Object.entries(arquivosEsperados);
    if (!itens.length || itens.some(([path, source]) =>
      !caminhosPublicos.has(path) || typeof source !== 'string')) {
      throw new Error('Lista pública de arquivos de monitoramento inválida.');
    }
    const publicacoes = await Promise.all(itens.map(async ([path, esperado]) => {
      const publicado = path === '/' ? html : path === '/sw.js' ? sw : await consultar(path);
      const resumo = texto => createHash('sha256').update(texto, 'utf8').digest('hex');
      return { path, confere: resumo(publicado) === resumo(esperado) };
    }));
    const divergentes = publicacoes.filter(item => !item.confere).map(item => item.path);
    if (divergentes.length) {
      throw new Error('Conteúdo público diverge do GitHub: ' + divergentes.join(', '));
    }
    verificacoes.conteudo_publicado = true;
  }
  return { versao, verificacoes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const versao = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
  const origem = process.env.CALCULADORA_URL || 'https://calculadora-digital-extensao.onrender.com';
  const caminhos = {
    '/': 'index.html', '/sw.js': 'sw.js', '/app.js': 'app.js',
    '/calculations.js': 'calculations.js',
    '/bmi-who-data.js': 'bmi-who-data.js',
    '/styles.css': 'styles.css',
    '/manifest.webmanifest': 'manifest.webmanifest',
  };
  const arquivosEsperados = Object.fromEntries(
    Object.entries(caminhos).map(([path, nome]) => [
      path, readFileSync(new URL('../' + nome, import.meta.url), 'utf8'),
    ]),
  );
  verificarPublicacao({ origem, versao, arquivosEsperados }).then(r => {
    console.log('Versão pública confirmada:', r.versao);
  }).catch(e => {
    console.error('DIVERGÊNCIA DE DEPLOY:', e.message);
    process.exitCode = 1;
  });
}
