# Calculadora Digital — Extensão em Saúde

Site público e independente para ações educativas de saúde. **Não é o sistema DACG de certificados.** Versão **2.3.0**, totalmente estática, sem cadastro, backend, cookies, analytics ou persistência dos dados digitados. Funciona após primeiro acesso sem conexão, usando cache apenas dos arquivos públicos da aplicação.

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

### PFE — Medicate (escala ATS, 60–900 L/min)
- **Somente as três leituras são obrigatórias**; retorna o maior valor válido, não a média.
- Os campos de valor previsto da tabela e melhor valor pessoal foram removidos.
- Idade, altura e sexo permanecem opcionais e não bloqueiam o cálculo. Ainda não são usados para comparação normativa porque falta a tabela específica validada do Medicate.
- Sem tabela ou melhor valor pessoal confirmado, não classifica o resultado como bom/ruim e não exibe zonas de asma.
- A tabela azul do manual é um diário de medições, não uma tabela populacional de normalidade.
- Arquivos JS/CSS usam URLs versionadas; o service worker busca primeiro na rede quando online para evitar versões conflitantes.
- Modelo: Medicate Peak Flow Meter, ATS 60–900 L/min.

## Tecnologias
HTML, CSS, JavaScript ES modules, Node.js para os testes. Sem dependências externas ou chamadas de API.

## Testes locais
`npm test` (Node ≥20). Para visualizar: `python3 -m http.server 8000`, depois abrir `http://localhost:8000`.

## Implantação
Site estático hospedado no Render e conectado à branch `main` deste repositório; cada novo commit dispara implantação automática. Endereço público: https://calculadora-digital-extensao.onrender.com/.

O workflow do GitHub Actions executa somente testes, sem solicitar ativação do GitHub Pages. O projeto permanece independente do sistema de certificados DACG.

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