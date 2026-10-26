# Diagnóstico de publicação automática GitHub → Render (26/10/2026)

Objetivo: gerar um commit seguro na `main` para comprovar o gatilho automático de deploy do Render. Esta alteração só acrescenta documentação e **não** modifica interface, fórmulas, PWA ou dados clínicos.

Critério de aceite: depois de mesclar a PR com CI verde, localizar no Render um novo deploy para o SHA de merge, com evento de origem `newCommit` (não `api` ou acionamento manual), `status=live`. Se ele não aparecer, a integração de eventos de push/github app permanece pendente, ainda que uma publicação manual funcione.

Configuração lida antes do ensaio: `autoDeploy=yes`, `autoDeployTrigger=commit`, `branch=main`; projeto público de calculadora estática. O histórico documentado registra diversos deploys manuais apesar dessas configurações.

Não forçar deploy manual antes da inspeção dos eventos deste commit. Se o evento automático falhar, registrar e verificar instalação do Render GitHub App, escopo da conta `DACGunieva`, acesso ao repositório e filtros de build sem compartilhar tokens.

Procedimento não cria serviço pago nem acessa pacientes.
