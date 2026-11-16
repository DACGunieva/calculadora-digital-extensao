# Diagnóstico do auto-deploy Render — Calculadora (16/11/2026)

## Evidência de produção

A configuração de leitura do serviço Render mostra `autoDeploy=yes`, `autoDeployTrigger=commit`, branch `main`, mas o último deploy live conhecido (`ef7151986bdac61bc20dba3510a2ca7ecf65ac22`) possui trigger `api`, e não `new_commit`. Não se pode concluir funcionamento do webhook GitHub↔Render.

## Correção implementada neste PR

O monitor existente antes verificava apenas os identificadores de versão contidos em `index.html` e `sw.js`. Um commit de `app.js` sem incremento de versão passaria silenciosamente.

Agora o monitor da workflow também confronta o **SHA-256 do conteúdo HTTP público** de sete arquivos estáticos (`/`, `sw.js`, `app.js`, `calculations.js`, `bmi-who-data.js`, `styles.css`, `manifest.webmanifest`) com o conteúdo da `main` no checkout do GitHub. Sem tokens, sem dados de pacientes, sem chamadas a APIs privadas. As consultas são exclusivamente leitura e HTTPS.

## Limitação explícita

Isto detecta deploy desatualizado quando arquivos publicados mudaram, mas **não restabelece automaticamente o webhook Render** e tampouco comprova o evento `trigger=new_commit`; um deploy manual do SHA correto continuaria passando. Para encerrar Issue #5 é necessário inspecionar em Render/GitHub App a autorização e observar, após commit intencional autorizado na `main`, o deploy **automático** do mesmo SHA com smoke público e CI aprovado. Não alterar serviço ou webhook sem autorização de implantação.
