# Como montar os Layouts

## Objetivo

O objetivo deste documento é fornecer uma visão geral de como montar os layouts de arquivos posicionais ou CNAB utilizando a biblioteca CNAB.
Serão exemplificadas as formas mais comuns de definição de layouts, bem como as regras, boas práticas e sugestões para a criação de layouts eficientes e funcionais.

## Especificando um layout


> O detalhamento de como especificar um layout será adicionado ao longo dos exemplos abaixo a fim de facilitar o entendimento dos detalhes de forma prática.


```javascript
/*
Aqui temos um layout posicional de 500 posições, que é um caso muito comum de layout utilizado em arquivos de transmissão de dados.
*/
const posisional500Sample: LayoutInputInterface = {
    // Tamanho total das linhas. Esse dado é validado sempre que uma linha é escrita ou lida, pois a regra n.1 de um arquivo posicional é que o tamanho de cada linha deve ser fixo.
    size: 500,
    // Auto identificação do layout é utilizada quando um arquivo vai ser lido. Para que através de um JSON a biblioteca possa detectar o tipo da linha e aplicar o layout correspondente, seja ele um header, detalhe ou trailler.
    // Esse dado é opcional se você estiver escrevendo um arquivo e quiser informar manualmente o tipo das linhas.
    autoIdentification: 1,
    // A primeira dúvida que pode surgir sobre a autoidentificação é: "E se a minha coluna de identificação não for a primeira?"
    // Você pode especificar a coluna de identificação de linha e segmento, de acordo com a sua necessidade, pois ambas são opcionais.
    // O mais comum é que a coluna de identificação seja a primeira, e dos segmentos a segunda, mas existem casos em que elas podem estar em outras posições.
    idLine: [0, 1], // Posição 1 e tamanho 1
    idSegment: [1, 1], // Posição 2 e tamanho 1
    // Definição das linhas do layout
    // As linhas são definidas como um objeto onde cada chave é o nome da linha e o valor é um objeto ou array que define o layout da linha.
    // Existem duas formas de definir o layout das linhas: como um objeto ou como um array.
    // A forma mais *legível*, claramente, é como um objeto, pois o nome da coluna é explicitamente definido a esquerda.
    // Porém, se você for armazenar esse JSON em um banco de dados, muito provavelmente o objeto será reorganizado de acordo com o nome das chaves, e a ordem das colunas será perdida.
    // Por isso, a forma mais *precisa* de definir o layout das linhas é como um array
    lines: {
        header: {
            id: "0",
            // Aqui definimos o layout da linha de header aonde foi aplicada a forma de array.
            layout: [
                // Neste exemplo de coluna temos a utilização do valor padrão, muitas vezes citado como "valor fixo" no documento, para a coluna.
                // Ele é chamado de valor fixo, pois sempre que uma linha de header for escrita, o valor dessa coluna não será informado e assumirá o valor padrão.
                // O nome da coluna de identificação da linha deverá ser `_id_line`, e o nome da coluna de identificação do segmento deverá ser `_id_segment`. Essa é uma proposta de padronização para evitar customizações desnecessárias e evitar confusões na interpretação.
                '_id_line, 9(1), 0',
                'id_remessa, 9(1), 1',
                // Os valores padrão são utilizados quando o dado não é fornecido, ou seja, quando a coluna é opcional.
                // Eles podem estar entre aspas ou não. O que muda é apenas a legibilidade do código pra quem esta lendo.
                'arquivo_remessa, X(7), REM.TST',
                // Brancos são colunas popularmente utilizadas em layouts CNAB para garantir o tamanho fixo da linha.
                // Elas são preenchidas com espaços em branco ou zeros, dependendo to tipo especificado, e não possuem valor padrão.
                'brancos_01, X(485)',
                'seq_registro, 9(6)'
            ],
        },
        detail: {
            id: "1",
            // Aqui definimos o layout da linha de detail aonde são exemplificados os segmentos
            // os segmentos sao diferentes tipos de detalhes no CNAB, podendo cada um ter um layout diferente, identificado a partir do codigo do segmento.
            segments: {
                segmento_a: {
                    // esse é o codigo que irá automatizar a identificação do tipo de linha a ser lida ou escrita
                    id: "A",
                    // o layout funciona da mesma forma que os demais, como header ou trailer.
                    layout: [
                        '_id_line, 9(1), 0',
                        '_id_segment, X(1), A',
                        'arquivo_remessa, X(7), REM.TST',
                        'brancos_01, X(485)',
                        'seq_registro, 9(6)'
                    ],
                },
                segmento_b: {
                    id: "B",
                    // o layout de um segmento pode ser diferente do outro
                    layout: [
                        '_id_line, 9(1), 0',
                        '_id_segment, X(1), B',
                        'arquivo_remessa, X(7), REM.TST',
                        'brancos_01, X(485)',
                        'seq_registro, 9(6)'
                    ],
                },
            }
        },
        trailler: {
            // Aqui aplicamos o objeto como forma de definir o layout da linha, para deixar exemplificado, caso você queira utilizar essa forma de definição.
            layout: {
                _id_line: '9(1), 9',
                brancos_01: 'X(493)',
                seq_registro: '9(6)'
            },
        }
    }
};
```

## Validação de dados

A validação de dados é opcional e deve ser definida no layout da coluna. 
A validação é aplicada somente quando uma linha é escrita, pois ao ler uma linha que contém a quantidade esperada de caracteres, a biblioteca não valida os dados, apenas os converte para o formato JSON.

Os tipos de obrigatoriedade são encontrados no enumerador `COLUMN_REQUIREMENT`, são eles:
- `IGNORED`: O dado é preenchido como vazio na sua ausência.
- `OPTIONAL`: O dado é opcional, mas o campo deve estar presente no json.
- `REQUIRED`: O dado é obrigatório e deve conter algum valor no json.
- `STRICT`: O dado é obrigatório e seu valor não deve ultrapassar o tamanho da coluna.

> O tipo de obrigatoriedade padrão é `IGNORED`. Para especificar a obrigatoriedade de uma coluna, você deverá especificar no layout o caractere correspondente a obrigatoriedade desejada, conforme a tabela abaixo:

| Obrigatoriedade   | Caractere |
| ---------------   | --------- |
| IGNORED (padrão)  | ` `       |
| OPTIONAL          | `?`       |
| REQUIRED          | `*`       |
| STRICT            | `!`       |

