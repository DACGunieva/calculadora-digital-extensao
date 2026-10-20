# Calculadora Digital — Extensão em Saúde

Site público e independente para ações educativas de saúde. **Não é o sistema DACG de certificados.** Versão **2.6.1**, totalmente estática, sem cadastro, backend, cookies, analytics ou persistência dos dados digitados. Funciona após primeiro acesso sem conexão, usando cache apenas dos arquivos públicos da aplicação.

## Contatos institucionais

O rodapé exibe ícones acessíveis com links de Instagram para Curso de Farmácia, UniEVANGÉLICA e DACG. O número institucional (62) 3310-6684, oficialmente divulgado como WhatsApp pela UniEVANGÉLICA, dispõe de atalho direto ao WhatsApp e mantém a ligação telefônica. O número (62) 3310-6705 do Curso de Farmácia permanece como telefone, sem ser apresentado como WhatsApp não confirmado; o contato do DACG permanece como e-mail.

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