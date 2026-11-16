# Homologação documental PFE — CFF 2020 e Medicate ATS

## Fontes oficiais conferidas em 16/11/2026

1. **Conselho Federal de Farmácia (2020)**, *Pico de fluxo expiratório*, p. 8, Técnica 1, itens 10 e 11: repetir até obter **três leituras com variação menor que 20 L/min** entre si e considerar o maior valor. No mesmo tópico: evitar tosse, garantir vedação adequada e interromper avaliação se houver risco. https://www.cff.org.br/userfiles/pico_de_fluxo.pdf
2. **Manual Medicate Peak Flow Meter** (Rev. 12/18), importador Dorja: realizar três tentativas de sopro forte e rápido, anotar o maior valor; não tossir nem colocar língua no bocal. O manual descreve repetitividade instrumental ±2%, que **não deve ser confundida** com o critério de repetibilidade das manobras do CFF. https://dorja.com.br/wp-content/uploads/2023/10/manual-final-peak-flow-medicate.pdf
3. O modelo físico usado pela aplicação é apresentado como **ATS 60–900 L/min**. Nenhuma conclusão de equivalência de equações de previsão CFF e calibração ATS pode ser inferida apenas do manual; o aplicativo mantém sua cautela didática.

## Comportamento preservado

- O `bestPef` mantém **o maior das três leituras**, não uma média.
- O aviso é não bloqueante: diferença até 19 L/min não ativa alerta de discrepância; a diferença exata de 20 L/min e qualquer superior aciona mensagem para repetir o procedimento.
- A técnica não pode ser validada remotamente; o maior valor registrado não implica diagnóstico.
- Faixas percentuais baseadas em valor previsto CFF não são zonas clínicas de asma do melhor pessoal.
- Nenhum cálculo, dado clínico, PWA ou serviço de produção foi alterado.

## Aceite pendente — Issue #7

Revisão técnico-científica por profissional habilitado para o modelo físico concreto e confirmação na publicação pública após deploy autorizado. Este PR adiciona **cobertura de limite e prova de fonte**, não introduz nova regra de validade clínica.
