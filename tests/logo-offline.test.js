import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Hashes Git dos PNGs originais do portal de certificados DACG.
// Mantemos os próprios bytes originais das três marcas sem transformação visual.
const SOURCE_BLOBS = {
  'Diretório Acadêmico Claudius Galenus': '7288b4e5591f1e4ae659eb60aa7e8a234a597ecd',
  'UniEVANGÉLICA': '7e57e93d97d8c3cb61bbd6a6cdb1902f9706ff6a',
  'Farmácia UniEVANGÉLICA': '3edcd71ce590724fedc4806afa289689afa564c7',
};
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const tags=[...html.matchAll(/<img src="data:image\/png;base64,([A-Za-z0-9+/=]+)" alt="([^"]+)"[^>]*>/g)];

test('três marcas mantêm os PNGs originais byte a byte',()=>{
  assert.equal(tags.length,3);
  for(const match of tags){
    const png=Buffer.from(match[1],'base64');
    assert.ok(png.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')));
    const blobSha=createHash('sha1').update(Buffer.from('blob '+png.length+'\0')).update(png).digest('hex');
    assert.equal(blobSha,SOURCE_BLOBS[match[2]],'PNG institucional divergente: '+match[2]);
  }
});

test('logotipos ficam offline sem links remotos nem coleta de dados',()=>{
  assert.doesNotMatch(html,/src="https:\/\/certificados-dacg\.onrender\.com\/assets\//);
  assert.match(html,/footer-section-partners/);
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  assert.match(sw,/'\.\/index\.html'/);
});
