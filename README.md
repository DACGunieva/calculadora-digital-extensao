# Calculadora Digital — Extensão em Saúde

## Operação e ciência — critérios de homologação (28/10/2026)

- **Deploy automático Render:** integração GitHub `main` → Render configurada `autoDeploy=yes, autoDeployTrigger=commit`, mas último deploy observado em 26/10 foi manual (`trigger=api`). Um novo commit documental de baixo risco é uma prova controlada: só encerrar o incidente #5 se Render mostrar o mesmo SHA e `trigger=new_commit`. O GitHub Actions verde ou a igualdade do SHA com deploy manual **não** provam automação.
- **Repetibilidade PFE:** a versão 2.8.7 já calcula a diferença entre maior/menor das três manobras e orienta revisão não bloqueante quando o delta é ≥20 L/min. A fórmula do maior PFE permanece inalterada. A compatibilidade clínica entre o CFF (2020), o manual Medicate ATS e os limites de validade da técnica precisa de revisão profissional independente (issue #7), incluindo leitores de tela. Não homologar E5 somente com teste automatizado.
- **Privacidade:** nenhum dado antropométrico ou PFE digitado pode ser transmitido, persistido ou usado como telemetria; o cache PWA guarda apenas assets estáticos previamente definidos.
- **Regra de custo:** não contratar plataforma, habilitar cobrança automática nem usar robô pago para consertar integrações. Se Render não publicar automaticamente, registrar o bloqueio de permissão GitHub App–Render para correção manual autorizada e manter o serviço já publicado.



## Monitoramento de deploy — sem credenciais

O fluxo `Verificar publicacao Render - calculadora` roda diariamente ou sob demanda no GitHub Actions. Lê apenas a homepage pública e `/sw.js` e compara três versões com `package.json`; divergência causa falha visível na execução. Não força deploy, não envia notificações externas nem acessa informações pessoais. O projeto usa minutos da franquia existente do GitHub Actions (tempo máximo de 3 minutos por execução); os limites e eventuais custos da conta devem continuar monitorados. A verificação por versão não garante que o commit exato foi publicado se alguém esquecer de atualizar o número da versão. Não substitui homologação manual em celular nem revisão clínica.

## Correção visual v2.8.7

No aviso **Seus dados ficam neste dispositivo**, o antigo caractere tipográfico era renderizado de maneira irregular e fora do eixo. Foi substituído por um raio SVG de geometria fixa, alinhado com CSS Grid e centrado no selo de 32 px. Mantém temas claro/escuro, proporções e texto; não modifica dados clínicos nem as fórmulas. A versão invalida o cache estático offline.


### Segurança do cache PWA — v2.8.3 (25/10/2026)

O Service Worker mantém o comportamento *network-first* e o fallback de navegação offline, mas grava no cache **exclusivamente** a lista exata de recursos públicos oficiais. Requisições com parâmetros de URL, rotas não previstas ou dados de formulários não são armazenadas. Os testes simulam interceptação e indisponibilidade da rede, sem enviar dados médicos para nenhum serviço. A conferência clínica E5 e a inspeção manual com leitor de tela permanecem pendentes.


Site público e independente para ações educativas de saúde. **Não é o sistema DACG de certificados.** Versão **2.8.7**, totalmente estática, sem cadastro, backend, cookies, analytics ou persistência dos dados digitados. Funciona após primeiro acesso sem conexão, usando cache apenas dos arquivos públicos da aplicação.

## Refinamento do crédito v2.8.2

- Crédito **Criador: Erick de Oliveira Martins · Coordenador de Extensões (DACG)** em linha única, sem reticências/corte; tamanho responsivo em telefones compactos, sem alterar o conteúdo ou o restante do cabeçalho.
- Invalidação do cache PWA e testes contra quebra do crédito. Sem modificação nas fórmulas, no armazenamento nem nos dados dos atendimentos.

## Ajustes de apresentação v2.8.1

- Retirada da frase introdutória redundante à direita de **Metodologia e limites**; mantém íntegra a seção, fontes e aviso clínico.
- Crédito de criação discreto no cabeçalho, com texto igual ao do portal DACG: **Criador: Erick de Oliveira Martins · Coordenador de Extensões (DACG)**, sem replicar o atalho administrativo oculto.
- Botão claro/escuro explicitamente rotulado como **Tema escuro** / **Tema claro**, com alvos de toque de no mínimo 44px e linha de ações que quebra no celular. Resolver possível dificuldade de encontrar controle icônico e contornar conteúdo em telas estreitas.
- Cache PWA invalidado em v2.8.1; preserva todas as fórmulas e a privacidade dos atendimentos.

## Tema claro/escuro v2.8.0

- Botão na área superior, com tema escuro verde/dourado inspirado no portal DACG; alterna o tema sem interferir em IMC, cintura ou PFE.
- Segue a preferência de cor do sistema até o usuário escolher claro ou escuro. Armazena **somente** a escolha visual `dacg-tema` no armazenamento do próprio navegador; **nunca** dados de atendimento.
- O endereço da Calculadora Digital é diferente do portal DACG: os navegadores isolam `localStorage` por origem, portanto a preferência **não é sincronizada automaticamente entre os sites**; o padrão de chave e aparência é igual.
- Inclui cores adaptadas para abas, resultados, cálculos, barras de PFE, alertas, formulários, instruções e rodapé; preserva os logotipos institucionais originais, acessibilidade, contraste e impressão em papel claro. A partir da versão 2.8.8 as três logos ficam com **fundo totalmente transparente também no modo noturno**, sem placas brancas, mantendo os mesmos bytes PNG e os mesmos tamanhos responsivos.
- Nenhum asset novo é exigido na lista fixa de publicação do Render: o tema é incorporado aos arquivos `styles.css` e `app.js`, que já são publicados e armazenados no PWA.

## Nova avaliação de cintura v2.7.0

- Terceira aba, autônoma em relação ao IMC, para adultos de 18 a 120 anos não gestantes: cintura em centímetros, estatura, idade e referência populacional feminina/masculina. Funciona localmente, sem backend nem armazenamento dos dados.
- Cortes da circunferência: feminino ≥80 cm (risco aumentado), ≥88 cm (substancialmente aumentado); masculino ≥94 e ≥102 cm. Fonte: Ministério da Saúde, *Boas práticas para atuação nos territórios*, quadro 12: https://bvsms.saude.gov.br/bvs/publicacoes/boas_praticas_atuacao_territorios.pdf . São pontos de corte para triagem com ressalvas clínicas/populacionais.
- Relação cintura/estatura: <0,40 é informada como fora da faixa inferior publicada pela NICE; 0,40 a <0,50 sem adiposidade central aumentada pelo índice; 0,50 a <0,60 aumentada; ≥0,60 elevada. NICE NG246: https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity (principalmente para IMC <35 kg/m²).
- Não classifica gestação nem menores de 18 anos com os cortes adultos; texto educativo ensina ponto médio entre última costela e crista ilíaca. Quando o usuário vem da aba IMC adulto/idoso, copia apenas em memória de sessão a estatura informada, se o campo da cintura estiver vazio.
- Testes automatizados de limites, RCE, validação, acessibilidade do painel e versão da PWA. Cálculos de IMC/PFE preservados.

## Correção visual v2.6.4

O indicador da aba IMC passa a anunciar corretamente **4 perfis** (adulto, idoso, criança/adolescente e gestante). Alteração somente de texto, sem modificar fórmulas, referências científicas, armazenamento ou compartilhamento de dados. Regression check em `tests/layout.test.js`.

## Contatos institucionais

O rodapé permanece aberto, com títulos laterais centralizados e na mesma hierarquia visual do título principal, e apresenta três colunas: contatos institucionais com Instagram e WhatsApp (Curso de Farmácia e UniEVANGÉLICA) à esquerda, identificação/versionamento e link para o Portal DACG ao centro e logotipos institucionais à direita. Em dispositivos pequenos, as áreas são empilhadas sem esconder informações. Os contatos permanecem clicáveis e com nomes acessíveis.

## Funcionalidades

### IMC de adultos
Cálculo `massa(kg)/(altura(m)^2)` com classificação por limiares usuais para adultos. Resultado educacional, não diagnóstico individual.

### IMC de idosos (60+)
- Seleção própria na interface; usa IMC SISVAN para idosos: <=22 kg/m² baixo peso; >22 e <27 eutrofia; >=27 sobrepeso. O IMC não avalia sarcopenia, funcionalidade ou composição corporal.
- Ministério da Saúde: https://bvsms.saude.gov.br/bvs/publicacoes/guia_organizacao_vigilancia_alimentar_1edrev.pdf

### IMC de crianças e adolescentes (0 a 19 anos completos)
- Usa sexo de referência da curva, anos completos, meses adicionais, peso e altura.
- Calcula índice e **escore-z OMS** com transformação LMS por mês: `Z = ((IMC/M)^L - 1)/(L*S)`; quando L≈0, `Z=ln(IMC/M)/S`.
- Série OMS 2006, 0–60 meses; OMS 2007, 61–228 meses, utilizadas pelo SUS/SISVAN. Os parâmetros locais constam em `bmi-who-data.js`; a fonte é transcrição pública do conjunto RCPCH `WHO2006.csv` e `WHO2007.csv`, derivada de curvas OMS.
- Classificação infantil: até 60 meses: z < -3 magreza acentuada; -3 a < -2 magreza; -2 a +1 eutrofia; acima de +1 até +2 risco de sobrepeso; acima de +2 até +3 sobrepeso; acima de +3 obesidade. Dos 61 aos 228 meses: categorias até +1 iguais; >+1 até +2 sobrepeso; >+2 até +3 obesidade; >+3 obesidade grave.
- **Atenção:** menores de 2 anos requerem comprimento deitado e avaliação por equipe de saúde. Interpretação por curvas não substitui avaliação de crescimento multidimensional.

### IMC de gestantes
- Classifica **IMC pré-gestacional** com peso anterior à gravidez, não pelo peso atual.
- Exibe ganho atual de peso e **intervalo de referência do ganho total** ao final de uma gestação única em adultas: baixo peso 9,7–12,2 kg; eutrofia 8,0–12,0; sobrepeso 7,0–9,0; obesidade 5,0–7,2 (Ministério da Saúde, material de 2024).
- A semana gestacional é exibida para registro e não participa do cálculo do intervalo TOTAL. Não compara ganho atual ao intervalo total nem atribui adequação em uma semana. Para isso, consultar a curva gestacional da Caderneta da Gestante. Gestação múltipla, adolescência e condições clínicas específicas precisam de avaliação própria.

- **Nova referência por semana:** acompanha o ganho cumulativo de peso da 10ª à 40ª semana, com 31 linhas completas do anexo do Ministério da Saúde (Guia de Vigilância Alimentar e Nutricional na APS), segundo IMC pré-gestacional; compara o ganho atual com faixa inferior/superior e descreve abaixo/dentro/acima.
- Para semanas 1–9 e 41–42, a avaliação semanal é declarada indisponível (sem extrapolação). A tabela se refere à gestação única em adultas. Não deve induzir perda de peso gestacional.
- Fonte: https://bfa.saude.gov.br/public/file/guia_organizacao_vigilancia_alimentar_nutricional.pdf (anexo p. 50).

### PFE — medidor Medicate ATS, tabela educativa CFF (versão 2.5)
- Três manobras válidas na escala Medicate 60–900 L/min; o maior resultado é exibido mesmo sem os dados de referência.
- Idade, estatura e sexo são opcionais para medir, porém necessários para classificação DIDÁTICA automática por tabela (crianças e adolescentes 5–19 anos: apenas estatura 110–170 cm; adultos 20–70 anos: masculino 155–180 cm, feminino 145–170 cm).
- Valores previstos das tabelas de PFE do Conselho Federal de Farmácia (2020), Tabelas 1 (Polgar e Promadhat 1971), 2 e 3 (Leiner et al. 1963), em `calculations.js`. Seleção do valor MAIS PRÓXIMO conforme instrução da publicação; sem extrapolação. Célula masculina 40 anos/180 cm omitida por anomalia numérica na fonte impressa.
- Apresenta **PFE medido / PFE previsto ×100**. Barra didática de 0–100%: vermelho <50%, amarelo 50% a <80%, verde ≥80%. Percentuais acima de 100% são exibidos literalmente, com marcador no limite 100%.
- **CRÍTICO:** as tabelas CFF NÃO têm equivalência/calibração confirmada com a escala ATS do Medicate. As cores são apenas comparativas, NÃO classificam risco de crise, normalidade clínica ou estado de saúde.
- O campo recolhido 'Comparar com meu melhor PFE pessoal' permite, separadamente, calcular zonas clássicas de plano de asma usando o melhor valor pessoal definido com profissional.
- A página não armazena dados de pacientes. A tabela azul do manual da Medicate é diário temporal, não tabela normativa.

## Atendimento em campo (v2.6)
- Resumo do resultado com IMC/PFE, detalhes e ressalvas, copiável apenas por ação explícita; nenhum campo de nome ou CPF e nenhuma persistência. A cópia vai para a área de transferência do dispositivo, sob responsabilidade de quem copiar.
- Botões “Novo atendimento” e “Copiar resumo” na área de resultados; reset limpa entradas e resultados, facilitando atendimentos consecutivos.
- Tecla Enter avança nos campos de texto visíveis, quando possível; foco e áreas de toque mais nítidos para dispositivos móveis.
- Instruções de aferição recolhíveis, rótulos textuais além das cores, aumento do contraste e redução de animações conforme preferência do sistema.
- O modo offline continua limitado ao cache de recursos públicos do aplicativo, sem guardar dados de pacientes.

## Tecnologias
HTML, CSS, JavaScript ES modules, Node.js para os testes. Sem dependências externas ou chamadas de API.

## Testes locais
`npm test` (Node ≥20). Para visualizar: `python3 -m http.server 8000`, depois abrir `http://localhost:8000`.

## Implantação
Site estático hospedado no Render e conectado à branch `main` deste repositório; cada novo commit dispara implantação automática. Endereço público: https://calculadora-digital-extensao.onrender.com/.

O workflow do GitHub Actions executa somente testes, sem solicitar ativação do GitHub Pages. O projeto permanece independente do sistema de certificados DACG.

## Fontes e notas
- Guia de Vigilância Alimentar e Nutricional na APS (referência semanal gestacional): https://bfa.saude.gov.br/public/file/guia_organizacao_vigilancia_alimentar_nutricional.pdf
- Ministério da Saúde, SISVAN: https://www.gov.br/saude/pt-br/composicao/saps/vigilancia-alimentar-e-nutricional/arquivos/orientacoes-para-a-coleta-e-analise-de-dados-antropometricos-em-servicos-de-saude
- Ministério da Saúde, Ganho de peso gestacional (2024): https://bvs.saude.gov.br/bvs/cartazes/acompanhar_ganho_peso_gestacional.pdf
- OMS, crescimento 0–5: https://www.who.int/toolkits/child-growth-standards/standards/body-mass-index-for-age-bmi-for-age
- OMS, 5–19 anos: https://www.who.int/tools/growth-reference-data-for-5to19-years
- Dados LMS: https://github.com/rcpch/growth-references/tree/main/who2006
- Boaventura et al., 2007: https://www.portalnepas.org.br/amabc/article/view/215
- Teymeny et al., 2008: https://avaliacao.area.scielo.br/scielo.php?pid=S1518-97402008000600005&script=sci_arttext
- Ike et al., 2017, divergências entre medidores: https://www.scielo.br/j/fm/a/kBhqhNYjJBVBGKRmx68wD9t/
- Conselho Federal de Farmácia, orientação PFE: https://www.cff.org.br/userfiles/pico_de_fluxo.pdf

**Uso exclusivo como material de apoio para triagem/educação em saúde. Não substituir diagnóstico, decisão terapêutica, atendimento profissional nem protocolos locais.**

### Logotipos sem conexão
Os três PNGs originais usados no rodapé estão incorporados como `data:image/png;base64` no HTML: são bytes preservados dos arquivos oficiais versionados no repositório de certificados. A identidade dos PNGs é conferida por Git blob SHA-1 em `tests/logo-offline.test.js`. O Service Worker inclui o HTML no cache estático; não solicita logos a outro domínio em modo offline.


### Repetibilidade do PFE (CFF 2020)
O PFE exibido é o maior valor **registrado**, não uma certificação automática da qualidade da manobra. O guia do Conselho Federal de Farmácia (2020, Técnica 1, p. 8) recomenda três leituras com variação menor que 20 L/min entre si. A interface adverte, sem bloqueio ou diagnóstico, quando as três leituras diferem 20 L/min ou mais; isso não comprova equivalência metrológica com o Medicate ATS.
Fonte: https://www.cff.org.br/userfiles/pico_de_fluxo.pdf
