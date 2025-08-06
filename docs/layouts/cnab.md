# Documentação da Classe CNAB

A classe CNAB é usada para manipular e gerenciar arquivos CNAB (Controle Nacional de Arrecadação Bancária). Ela fornece uma interface para definir o layout do arquivo CNAB e métodos para manipular os dados do arquivo.

## Como usar
Primeiro, você precisa importar a classe CNAB:

```javascript
import { Cnab } from './cnab';
```

Em seguida, você pode criar uma nova instância da classe CNAB:

```javascript
const cnab = new Cnab();
```

Foram formulados os exemplos abaixo tendo como referência as documentações de CNAB de mercado, que sugerem que essa é a forma mais prática e ágil de utilização dos layouts:

- Exemplo de documentação

```
Coluna             | Tipo(Tamanho) | Valor padrão
Código de registro | 9(1)          | 0
Código da remessa  | 9(1)          | 1
Nome do arquivo    | X(7)          | Conforme nome do arquivo
```

- layout

```javascript
const cnab500Sample: LayoutInputInterface = {
    size: 500,
    lines: {
        header: {
            layout: [
                id_registro: '9(1), 0',
                id_remessa: '9(1), 1',
                arquivo_remessa: 'X(7), REM.TST',
            ],
        }
        trailler: {
            layout: {
                id_registro: '9(1), 9',
                brancos_01: 'X(493)',
                seq_registro: '9(6)'
            },
        },
    }
};
```

### Inicialização

Para inicializar a classe CNAB, você precisa passar um objeto de configuração para o método `initialize`:

```javascript
const config = {
    size: 240,
    lines: {
        // Definição do layout das linhas
    }
};

cnab.initialize(config);
```

O objeto de configuração deve conter o tamanho total de cada linha (em caracteres) e a definição do layout das linhas.

### Definição do layout das linhas

A definição do layout das linhas é um objeto onde cada chave é o nome de uma linha e o valor é um objeto ou array que define o layout da linha.

Existem duas regras importantes sobre o layout das linhas
    1. A soma dos tamanhos das colunas deve totalize o size da configuração do cnab ("240", no exemplo acima).
    1. Não deve haver buracos entre o início de uma coluna e o final de sua coluna anterior

A configuração final das colunas do layout de linha deve conter as seguintes propriedades:

- `key`: O nome da coluna.
- `direction`: A direção do preenchimento da coluna. Pode ser 'LEFT' ou 'RIGHT'.
- `position`: A posição inicial da coluna na linha.
- `size`: O tamanho da coluna.
- `fill`: O caractere usado para preencher a coluna.
- `defaultValue`: O valor padrão da coluna.

As propriedades `fill` e `defaultValue` são **opcionais**.

Por exemplo:

```javascript
const config = {
    size: 240,
    lines: {
        header: [
            { key: 'bankCode', direction: 'LEFT', size: 3, position?: 1, fill?: '0', defaultValue?: '' },
            { key: 'batchCode', direction: 'LEFT', size: 4, position?: 4, fill?: '0', defaultValue?: '' },
            // Outras definições de colunas
        ],
        // Outras definições de linhas
    }
};
```

Existem diferentes formas de fornecer os dados iniciais de cada coluna, e essas diferentes formas irão resultar em diferentes opcionalidade de dados. Veja o tópico **Layouts de linhas e de coluna**

### Métodos

A classe CNAB possui vários métodos, sendo a maioria utilizados internamente para manipular o layout e os dados do arquivo CNAB. Os métodos importantes para utilização da classe são :

- `initialize(config)`: Inicializa a classe CNAB com o objeto de configuração fornecido.

### Exemplo de funcionamento

```javascript
const config = {
    size: 240,
    lines: {
        header: [
            { key: 'bankCode', direction: 'LEFT', size: 3, position?: 1, fill?: ' ', defaultValue?: '' },
        ],
    }
};

cnab.initialize(config);

const lineLayout = cnab.getLineLayout('header');
console.log(lineLayout);
```

### Layouts de linhas e de coluna

No exemplo abaixo é possível visualizar 2 diferentes formas de especificar uma linha
    1. array
    1. json

```javascript
const config = {
    size: 240,
    lines: {
        // formas de descrever as linhas:
        // linha, forma 1
        header: [
            ...
        ],
        // linha, forma 2
        trailler: {
            key_nome_coluna: ...,
        },
    }
};
```

As obrigatoriedades de informações variam de acordo com o formato de linhas da seguinte forma:
- No formato json a chave de cada item é utilizada para alimentar o campo `key` de cada respectiva configuração.
- No formato array o campo `key` deve ser informado na configuração da coluna

É possível visualizar ambos formatos de linhas e também os formatos de **layout das colunas** no exemplo abaixo

```javascript
const config = {
    size: 240,
    lines: {
        header: [
            // formas de descrever as colunas:
            // 1
            { key: 'bankCode', direction: 'LEFT', size: 3, position?: 1, fill?: ' ', defaultValue?: '' },
        ],
        detalhes: {
            // 2
            id_sequencia: 'L, 4, 1, "9", "0"',
        },
        trailler_detalhes: {
            // 3
            brancos_01: 'X(15)',
        },
        trailler: [
            // 4
            'brancos_01, X(15)',
        ]
    }
};

cnab.initialize(config);

const lineLayout = cnab.getLineLayout('header');
console.log(lineLayout);
```

Após o processo de construção do layout as configurações das colunas se tornam equivalentes seguindo o contrato base ilustrado no tópico **Definição do layout das linhas**.

#### Layout de colunas - Formato 1

```javascript
[
    { key: 'bankCode', direction: 'LEFT', size: 3, position?: 1, fill?: ' ', defaultValue?: '' },
]
```

Esse formato é o mais próximo do layout da configuração da coluna após o processo de construção do layout. Este layout permite total flexibilidade na definição da coluna, para cenários extremos que exijam tal necessidade, pois existem formatos mais intuitivos disponíveis.

Neste layout são obrigatórios os campos
- key: leve em consideração o formato da linha, pois se for json, o campo key estará informado na chave e não será necessário dentro do objeto.
- direction
- size

#### Layout de colunas - Formato 2

```javascript
{
    // direction, size, defaultValue?, fill?, position?
    sampleA: 'L, 1',
    sampleB: 'L, 1, "9", "0"',
    sampleC: 'L, 1, "9", "0", 3',
}
```

Esse formato é equivalente ao primeiro, porém descrito no formato string seguindo o ordenamento mencionado no comentario acima do código. O propósito desse formato é diminuir o JSON final do seu layout.

O campo position é calculado automaticamente se não for informado.

#### Layout de colunas - Formatos 3 e 4

```javascript
{
    // type(size), defaultValue?, fill?
    sampleA: 'X(1)',
    sampleB: '9(1), "9"',
    sampleC: 'X(2), "9", "0"',
}
```

```javascript
[
    // key, type(size), defaultValue?, fill?
    'sample_a, X(1)',
    'sample_b, 9(1), "9"',
    'sample_c, X(2), "9", "0"',
]
```

O propósito desse formato é implementar os formatos CNAB documentados. Ele segue a padronização estipulada nos CNABs de mercado, onde:
- `X`: Texto, alinhado a esquerda, preenchido com espaços a direita
- `N` ou `9`: Numérico, alinhado a direita, preenchido com zeros a esquerda

#### Dados obrigatórios

Os dados obrigatórios são definidos no layout da coluna, e são usados para validar se os dados fornecidos são suficientes para gerar uma linha.

Os tipos de obrigatoriedade são encontrados no enumerador `COLUMN_REQUIREMENT`, eles são:
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

Para adicionar um caractere de obrigatoriedade ao layout, você deve adicionar o caractere, conforme o exemplo abaixo:

```javascript
{
    // type(size), defaultValue?, fill?
    sampleA: 'X(1)?',
    sampleB: 'X(1)*',
    sampleC: 'X(1)!',
    // ou
    // direction, size, defaultValue?, fill?, position?
    sampleA: 'L?, 1, "?", " "',
    sampleA: 'L*, 1, "?", " "',
    sampleA: 'R!, 1, "?", " "',
}
```

> Não importa se foi utilizado o formato que usa o tipo do dado ou a direção do alinhamento. Também não importa se foi usada uma sigla (L) ou o nome completo (LEFT). O importante é que o caractere de obrigatoriedade esteja posicionado no local designado.