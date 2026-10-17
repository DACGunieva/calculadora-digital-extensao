# Calculadora Digital — Extensão em Saúde

Site público e independente para ações educativas de saúde. **Não é o sistema DACG de certificados.** Versão **2.0**, totalmente estática, sem cadastro, backend, cookies, analytics ou persistência dos dados digitados. Funciona após primeiro acesso sem conexão, usando cache apenas dos arquivos públicos da aplicação.

## Funcionalidades

### IMC de adultos
Cálculo `massa(kg)/(altura(m)^2)` com classificação por limiares usuais para adultos. Resultado educacional, não diagnóstico individual.

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

### PFE — referências regionais brasileiras com restrições
- Registra três sopros válidos (L/min) e calcula o maior, nunca a média.
- **Escolares 12–18 anos com aparelho Wright/Healthscan:** pesquisa de Boaventura et al., MG, 2007, tabela por idade e altura (120–200 cm); interpolação linear apenas entre estaturas tabuladas. As tabelas foram usadas diretamente porque há pequenas inconsistências entre regressão publicada e tabela do artigo. A ferramenta deve ser aplicada com cautela e apenas com equipamento compatível.
- **Homens 50–80 anos com ASSESS Peak Flow Meter:** `PFE = -140.438 - 2.351 × idade + 409.689 × altura_m`, Teymeny et al., Fisioterapia Brasil, 2008. Estatura restrita por segurança a 150–190 cm, sem extrapolação. Este estudo contém um grupo local relativamente pequeno e não estabelece referência nacional.
- **Outras idades, sexos e aparelhos:** valor previsto propositalmente indisponível. Não é substituído por equações estrangeiras. É possível comparar ao **melhor valor pessoal** (opcional), que permite exibir zonas de acompanhamento apenas se existir orientação clínica individualizada.
- Razão observado/previsto não deve ser usada isoladamente para decisão clínica. Diferentes medidores podem não ser intercambiáveis.

## Tecnologias
HTML, CSS, JavaScript ES modules, Node.js para os testes. Sem dependências externas ou chamadas de API.

## Testes locais
`npm test` (Node ≥20). Para visualizar: `python3 -m http.server 8000`, depois abrir `http://localhost:8000`.

## Implantação
`.github/workflows/pages.yml` testa, compila um diretório `dist` estático e publica no GitHub Pages a cada commit na branch `main`. No repositório: Settings → Pages → Build and deployment → **GitHub Actions**. Endereço esperado: `https://dacgunieva.github.io/calculadora-digital-extensao/` (verificar quando implantado).

## Fontes e notas
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