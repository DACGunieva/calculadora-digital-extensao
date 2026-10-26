import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const path of ['pages.yml', 'verificar-publicacao.yml']) {
  test('GitHub Actions protegido por SHA e permissões mínimas: ' + path, () => {
    const content = readFileSync(new URL('../.github/workflows/' + path, import.meta.url), 'utf8');
    assert.match(content, /uses: actions\/checkout@[0-9a-f]{40}/);
    assert.match(content, /uses: actions\/setup-node@[0-9a-f]{40}/);
    assert.match(content, /permissions:\s*\n\s+contents: read/);
    assert.match(content, /persist-credentials: false/);
    assert.match(content, /timeout-minutes: [345]/);
    assert.doesNotMatch(content, /permissions:\s*write|secrets\.|npm publish|curl.*token/i);
  });
}
