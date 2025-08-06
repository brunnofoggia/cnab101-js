# Layouts

## Introdução

Os layouts são uma parte fundamental da biblioteca, pois definem a estrutura dos arquivos posicionais / CNAB que serão lidos ou escritos. Um layout é composto por um conjunto de uma ou mais linhas, e cada linha é composta por um conjunto de colunas. Cada coluna tem um tipo, um tamanho e outras propriedades que determinam como os dados devem ser interpretados / formatados.

### Exemplo hipotético de layout


- Linha de texto posicional com 500 posições

```
Coluna             | Tipo(Tamanho) | Valor padrão
Código de registro | 9(1)          | 0
Código da remessa  | 9(1)          | 1
Nome do arquivo    | X(7)          | ""
Brancos            | X(493)        | " "
```

No exemplo acima, temos uma linha de texto posicional com 500 posições. Cada coluna é definida por seu tipo e tamanho, e o valor padrão é usado quando o dado não é fornecido.

### Definição básica de coluna

Cada coluna contém as seguintes propriedades:
- **Tipo**: O tipo de dado da coluna, que pode ser numérico (9 ou N) ou alfanumérico (X ou A).
- **Tamanho**: O tamanho da coluna, que é um número inteiro que representa a quantidade de caracteres que a coluna pode conter.
- **Valor padrão**: O valor que deve ser usado quando o dado não é fornecido.

Além destas propriedades, as colunas também podem ter outras propriedades opcionais, que serão detalhadas nos próximos documentos, como:
- **Obrigatoriedade**: Indica se a coluna é opcional, requerida ou obrigatória quando é solicitada a escrita de uma linha. Se ela for opcional, a coluna pode ser omitida se não houver dado para ela. Se for requerida, a coluna deve ser informada mesmo que com um valor vazio. Se for obrigatória, a coluna deve ser informada e preenchida com um valor válido.

- **Alinhamento**: Também é possível, em casos muito específicos, mudar o posicionamento padrão de um tipo de coluna, porém isso é tratado no documento que fala de [layouts avançados](avancado.md).

#### Tipos de coluna

- **Numérico**: Representado por `9` ou `N`, é usado para colunas que contêm apenas números. O tamanho é definido entre parênteses, como `9(5)` para uma coluna numérica de 5 dígitos. Neste tipo de coluna, o preenchimento é feito com zeros à esquerda por padrão.
- **Alfanumérico**: Representado por `X` ou `A`, é usado para colunas que podem conter letras e números. O tamanho é definido entre parênteses, como `X(10)` para uma coluna alfanumérica de 10 caracteres. Neste tipo de coluna, o preenchimento é feito com espaços em branco à direita por padrão.

- **Decimal**: A representação decimal é feita de forma simplificada utilizando-se do tipo `9` segmentado em 2 colunas, uma para a parte inteira e outra para a parte decimal. Por exemplo:

```
Coluna             | Tipo(Tamanho) | Valor padrão
Valor              | 9(5)          | 0
Decimais           | 9(2)          | 0
```