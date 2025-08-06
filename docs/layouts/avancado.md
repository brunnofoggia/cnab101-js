# Layouts Avançados

Leia primeiro [Como montar os Layouts](docs/layouts/como-usar.md) para entender os conceitos básicos de como montar um layout.

## Objetivo

Detalhar como montar layouts que tem alguma necessidade específica.

## Outra forma de definição de layout de colunas

Inicialmente foram apresentados os padrões alfanumérico (X ou A) e numérico (9 ou N) para definir o tipo de dado de cada coluna. Porém, estes padrões são convertidos para o formato de coluna que a biblioteca utiliza, onde não existe tipo de dado, mas sim o tamanho e a direção do preenchimento da coluna. Onde:

- `L`: Alinhamento à esquerda (LEFT)
- `R`: Alinhamento à direita (RIGHT)

Assim, é possível definir o layout de colunas utilizando o formato de coluna que a biblioteca utiliza, ao invés do tipo de dado. Por exemplo:

```javascript
{
    // direction, size, valorPadrao?, preenchimento?, posicao?
    sampleA: 'L, 1',
    sampleB: 'L, 1, "9", "0"',
    sampleC: 'L, 1, "9", "0", 3',
}
```

Dessa forma é possível, por exemplo, alinhar um texto a direita e preencher com espaços, zeros, letras Z, à esquerda. Ou, ainda, alinhar um número a esquerda e preencher com espaços à direita.

Já o ultimo parâmetro `posicao` é opcional, e sugiro que não seja informado, pois a biblioteca irá calcular automaticamente a posição da coluna na linha.
Caso deseje informar a posição, por qualquer razão, tenha a certeza de que a biblioteca irá validar o layout e garantir que todas posições estejam corretas e preenchidas corretamente sem deixar um vão entre uma coluna e outra.

### Validação de dados

Neste formato a forma de especificar a obrigatoriedade dos dados é diferente do formato alfanumérico e numérico. A obrigatoriedade é definida através de um caractere especial logo após a definição da direção coluna, conforme os exemplos abaixo:

Formato array: 

```javascript
[
    'sampleA, L?, 1, "?", " "',
    'sampleB, L*, 1, "?", " "',
    'sampleC, R!, 1, "?", " "',
]
```

Formato objeto:

```javascript
{
    sampleA: 'L?, 1, "?", " "',
    sampleB: 'L*, 1, "?", " "',
    sampleC: 'R!, 1, "?", " "',
}
```
