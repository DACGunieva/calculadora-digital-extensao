import test from 'node:test';
import assert from 'node:assert/strict';
import { verificarPublicacao } from '../scripts/verificar-publicacao.mjs';

function mock({ version = '2.8.5', mismatch = false, responseCode = 200 } = {}) {
  const seen = [];
  const fetcher = async (url) => {
    seen.push(url.toString());
    const isSw = url.pathname === '/sw.js';
    const txt = isSw
      ? "const CACHE_NAME='calculadora-extensao-static-v" + version + "';"
      : '<link href="./styles.css?v=' + version + '"><script src="./app.js?v=' +
        (mismatch ? '2.8.3' : version) + '"></script>';
    return { ok: responseCode === 200, status: responseCode, text: async () => txt };
  };
  return { fetcher, seen };
}
test('verificador de deploy confere somente recursos públicos', async () => {
  const {fetcher, seen} = mock();
  const r = await verificarPublicacao({
    origem: 'https://calculadora-digital-extensao.onrender.com',
    versao: '2.8.5', fetcher,
  });
  assert.equal(r.versao, '2.8.5');
  assert.deepEqual(Object.values(r.verificacoes), [true, true, true]);
  assert.deepEqual(seen.map(v => new URL(v).pathname).sort(), ['/', '/sw.js']);
});
test('verificador alerta quando servidor ainda tem app.js antigo', async () => {
  await assert.rejects(() => verificarPublicacao({
    origem: 'https://calculadora-digital-extensao.onrender.com',
    versao: '2.8.5', fetcher: mock({mismatch:true}).fetcher,
  }), /javascript_publicado/);
});
test('verificador não aceita redirecionamento HTTP ou provedor inseguro', async () => {
  await assert.rejects(() => verificarPublicacao({
    origem: 'http://servidor.example', versao: '2.8.5', fetcher: mock().fetcher,
  }), /HTTPS/);
  await assert.rejects(() => verificarPublicacao({
    origem: 'https://servidor.example', versao: '2.8.5',
    fetcher: mock({responseCode:503}).fetcher,
  }), /HTTP 503/);
});
