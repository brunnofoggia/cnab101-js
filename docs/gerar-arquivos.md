# Como escrever arquivos CNAB

A classe CnabWriter é uma extensão da classe Cnab e é usada para escrever arquivos CNAB. Ela fornece uma interface para definir o layout do arquivo CNAB e métodos para escrever os dados do arquivo.

## Como usar

1. Primeiro, você precisa importar a classe CnabWriter:

```javascript
import { CnabWriter } from 'cnab101';
```

2. Criar uma nova instância da classe CnabWriter:

```javascript
const cnabWriter = new CnabWriter();
```

3. Definir o layout do arquivo CNAB:

```javascript
const layout = {
    size: 500,
    // se a auto identificação estiver ligada, somente o json é necessário para escrever a linha utilizando o método writeLine
    autoIdentification: 1,
    // Definição das linhas do layout
    lines: {
        header: {
            id: '0',
            layout: [
                // o nome fixo para o campo de identificacao da linha é _id_line
                '_id_line, 9(1), 0',
                // os campos abaixo sao somente exemplos
                'id_remessa, 9(1), 1',
                'literal_remessa, X(7), REM.TST',
                'cod_servico, 9(2), 1',
                'literal_servico, X(15), COBRANCA',
                'cod_empresa, 9(20), 1',
                'nome_empresa, X(30), EMPRESA TESTE',
                'cod_banco, 9(3), 341',
                'nome_banco, X(15), PAULISTA S.A.',
                'data_gravacao, 9(6), 0',
                'brancos_01, X(8)',
                'id_sistema, X(2)',
                'seq_arquivo, 9(7), 1',
                'brancos_02, X(377)',
                'seq_registro, 9(6), 1',
            ],
        },
        detail: {
            id: '3',
            segments: {
                segment_a: {
                    layout: [
                        '_id_line, 9(1), 0',
                        // o nome fixo para o campo de identificacao do segmento é _id_segment
                        '_id_segment, 9(1), 1',
                        // os campos abaixo sao somente exemplos
                        'id_remessa, 9(1), 1',
                        'literal_remessa, X(7), REM.TST',
                        'cod_servico, 9(2), 1',
                        'literal_servico, X(15), COBRANCA',
                        'cod_empresa, 9(20), 1',
                        'nome_empresa, X(30), EMPRESA TESTE',
                        'cod_banco, 9(3), 341',
                        'nome_banco, X(15), PAULISTA S.A.',
                        'data_gravacao, 9(6), 0',
                        'brancos_01, X(8)',
                        'id_sistema, X(2)',
                        'seq_arquivo, 9(7), 1',
                        'brancos_02, X(377)',
                        'seq_registro, 9(6), 1',
                    ],
                }
            }
        },
    },
};
```

4. Inicializar o CnabWriter com o layout definido:

```javascript
cnabWriter.initialize(layout);
```

### Escrevendo linhas

Exemplo de dados em JSON para escrever uma linha:

> um arquivo posicional se trata de TEXTO. se atende a compor um JSON com dados em formato texto. nada de objetos, booleanos, arrays ou pontos flutuantes.

```javascript
const cnab500HeaderJsonSample = {
    _id_line: '0',
    id_remessa: '1',
    literal_remessa: 'REMXX.TST',
    cod_servico: '2',
    literal_servico: 'COBRANCA',
    cod_empresa: '3',
    nome_empresa: 'GOOGLE',
    cod_banco: '444',
    nome_banco: 'PAULISTA S.A.',
    data_gravacao: '290924',
    id_sistema: 'XY',
    seq_arquivo: '5',
    seq_registro: '6',
};
```

Para escrever uma linha, você precisa passar um objeto JSON com os dados da linha e a chave da linha para o método writeLine:

```javascript
const lineData = cnab500HeaderJsonSample;
const lineKey = 'header';
const lineSegment = ''; // Se necessário, você pode especificar o segmento da linha, caso contrário, deixe vazio.

// como deixamos a auto identificação ligada, o método ignorará os campos de identificação da linha e segmento, e escreverá a linha utilizando apenas o json.
const lineText = cnabWriter.writeLine(lineData);

// Se a auto identificação estiver desligada, você deve passar os campos de identificação da linha e segmento.
const lineTextWithIds = cnabWriter.writeLine(lineData, lineKey, lineSegment);
```

O método `writeLine` retorna uma string com o texto da linha formatado de acordo com o layout da linha. Conforme exemplo abaixo:

```
"01REMXX.T02COBRANCA       00000000000000000003GOOGLE                        444PAULISTA S.A.  290924        XY0000005                                                                                                                                                                                                                                                                                                                                                                                         000006"
```

