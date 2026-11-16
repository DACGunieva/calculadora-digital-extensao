import test from 'node:test';
import assert from 'node:assert/strict';
import { verificarPublicacao } from '../scripts/verificar-publicacao.mjs';

function mockPublico(codigoAtual = 'export const build = "novo";') {
  const seen = [];
  const payload = new Map([
    ['/', '<link href="./styles.css?v=2.8.14"><script src="./app.js?v=2.8.14"></script>'],
    ['/sw.js', "const CACHE_NAME='calculadora-extensao-static-v2.8.14';"],
    ['/app.js', codigoAtual],
  ]);
  const fetcher = async url => {
    seen.push(url.pathname);
    const txt = payload.get(url.pathname);
    return { ok: txt !== undefined, status: txt === undefined ? 404 : 200,
      text: async () => txt };
  };
  return { fetcher, seen };
}

test('integridade compara arquivo real mesmo que versão publicada seja igual', async () => {
  const atual = mockPublico();
  const r = await verificarPublicacao({
    origem: 'https://calculadora-digital-extensao.onrender.com',
    versao: '2.8.14', fetcher: atual.fetcher,
    arquivosEsperados: {'/app.js': 'export const build = "novo";'},
  });
  assert.equal(r.verificacoes.conteudo_publicado, true);
  assert.deepEqual(atual.seen.sort(), ['/', '/app.js', '/sw.js']);
});

test('integridade detecta Render desatualizado sem incremento de versão', async () => {
  const antiga = mockPublico('export const build = "antigo";');
  await assert.rejects(() => verificarPublicacao({
    origem: 'https://calculadora-digital-extensao.onrender.com',
    versao: '2.8.14', fetcher: antiga.fetcher,
    arquivosEsperados: {'/app.js': 'export const build = "novo";'},
  }), /Conteúdo público diverge do GitHub: \/app\.js/);
});

test('monitor não usa endpoints administrativos nem caminhos arbitrários', async () => {
  const publico = mockPublico();
  await assert.rejects(() => verificarPublicacao({
    origem: 'https://calculadora-digital-extensao.onrender.com',
    versao: '2.8.14', fetcher: publico.fetcher,
    arquivosEsperados: {'/api/certificados': 'não autorizado'},
  }), /Lista pública de arquivos/);
  assert.deepEqual(publico.seen.sort(), ['/', '/sw.js']);
});
