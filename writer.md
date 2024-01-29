# Como escrever arquivos CNAB

A classe CnabWriter é uma extensão da classe Cnab e é usada para escrever arquivos CNAB (Controle Nacional de Arrecadação Bancária). Ela fornece uma interface para definir o layout do arquivo CNAB e métodos para escrever os dados do arquivo.

## Como usar

Primeiro, você precisa importar a classe CnabWriter:

```javascript
import { CnabWriter } from './cnabWriter';
```

Em seguida, você pode criar uma nova instância da classe CnabWriter:

```javascript
const cnabWriter = new CnabWriter();
```

### Inicialização

Para inicializar a classe CnabWriter, você precisa passar um objeto de configuração para o método initialize da classe Cnab:

```javascript
const config = {
    size: 500,
    lines: {
        header: {
            layout: {
                id_registro: '9(1), 0',
                id_remessa: '9(1), 1',
                literal_remessa: 'X(7), REM.TST',
                cod_servico: '9(2), 1',
                literal_servico: 'X(15), COBRANCA',
                cod_empresa: '9(20), 1',
                nome_empresa: 'X(30), EMPRESA TESTE',
                cod_banco: '9(3), 341',
                nome_banco: 'X(15), PAULISTA S.A.',
                data_gravacao: '9(6), 0',
                brancos_01: 'X(8)',
                id_sistema: 'X(2)',
                seq_arquivo: '9(7), 1',
                brancos_02: 'X(377)',
                seq_registro: '9(6), 1',
            },
        },
    },
};

cnabWriter.initialize(config);
```

### Escrevendo linhas

Exemplo de dados em JSON para escrever uma linha:

```javascript
const cnab500HeaderJsonSample = {
    id_registro: '0',
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

const lineText = cnabWriter.writeLine(lineData, lineKey);
```

O método `writeLine` retorna uma string com o texto da linha formatado de acordo com o layout da linha. Conforme exemplo abaixo:

```
"01REMXX.T02COBRANCA       00000000000000000003GOOGLE                        444PAULISTA S.A.  290924        XY0000005                                                                                                                                                                                                                                                                                                                                                                                         000006"
```