// Gate de proveniência de commits main: só publica merges rastreáveis em PRs.
// Não é proteção nativa de branch. Direct push aparece como CI vermelho.
const repo=process.env.GITHUB_REPOSITORY;
const sha=process.env.GITHUB_SHA;
const token=process.env.GITHUB_TOKEN;
if(!repo||!sha||!token||!/^[0-9a-f]{40}$/.test(sha)){
  throw Error("Contexto Actions obrigatório ausente.");
}
const url="https://api.github.com/repos/"+repo+"/commits/"+sha+"/pulls";
const r=await fetch(url,{headers:{
  Authorization:"Bearer "+token,
  Accept:"application/vnd.github+json",
  "X-GitHub-Api-Version":"2022-11-28"
}});
if(!r.ok)throw Error("Falha de acesso à proveniência GitHub: HTTP "+r.status);
const pulls=await r.json();
if(!Array.isArray(pulls)||!pulls.some(p=>
  p.merged_at && p.base?.ref==="main" && p.merge_commit_sha===sha
)){
  throw Error("BLOQUEADO: commit main sem PR aprovado/mesclado associado. Use pull request e CI.");
}
console.log("Proveniência PR do commit main confirmada.");
