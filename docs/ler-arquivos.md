# Como escrever arquivos CNAB

A classe CnabReader é uma extensão da classe Cnab e é usada para ler arquivos CNAB. Ela fornece uma interface para definir o layout do arquivo CNAB e métodos para ler os dados do arquivo.

## Como usar

1. Primeiro, você precisa importar a classe CnabReader:

```javascript
import { CnabReader } from 'cnab101';
```

2. Criar uma nova instância da classe CnabReader:

```javascript
const cnabReader = new CnabReader();
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
            id: '0'
            layout: [
                '_id_line, 9(1), 0',
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
    },
};
```

4. Inicializar o CnabReader com o layout definido:

```javascript
cnabReader.initialize(layout);
```

Para interpretar uma linha posicional você precisa informar a linha e, caso esteja trabalhando sem a autoidentificação, informar também a chave de identificação da linha e do segmento, se houver, para o método readLine:

Linha de texto exemplo:
```
"01REMXX.T02COBRANCA       00000000000000000003GOOGLE                        444PAULISTA S.A.  290924        XY0000005                                                                                                                                                                                                                                                                                                                                                                                         000006"
```

Codigo exemplo para ler a linha:

```javascript
const lineText = '...';
const lineKey = 'header';
const lineSegment = ''; // Se necessário, você pode especificar o segmento da linha, caso contrário, deixe vazio.

// como deixamos a auto identificação ligada, o método ignorará os campos de identificação da linha e segmento, e escreverá a linha utilizando apenas o json.
const result = cnabWriter.readLine(lineText);

// Se a auto identificação estiver desligada, você deve passar os campos de identificação da linha e segmento.
const result = cnabWriter.readLine(lineData, lineKey, lineSegment);

// o resultado contem dados de configuração da linha identificada e o json resultante da leitura.
const json = result.json;
```

Resultado json esperado:

```json
{
    "id_registro": "0",
    "id_remessa": "1",
    "literal_remessa": "REMXX.TST",
    "cod_servico": "2",
    "literal_servico": "COBRANCA",
    "cod_empresa": "3",
    "nome_empresa": "GOOGLE",
    "cod_banco": "444",
    "nome_banco": "PAULISTA S.A.",
    "data_gravacao": "290924",
    "id_sistema": "XY",
    "seq_arquivo": "5",
    "seq_registro": "6"
};
```