# Introdução à biblioteca CNAB

A biblioteca CNAB é uma ferramenta poderosa para lidar com arquivos posicionais. Esses arquivos podem ser remessas simples sem um padrão de mercado ou pertencer aos padrões da FEBRABAN de arquivos de remessa e retorno CNAB (Centro Nacional de Automação Bancária). Com ela, você pode facilmente gerar, ler e manipular arquivos CNAB de diferentes bancos e layouts.

> Apesar de eu escrever "arquivo" ao longo de toda documentação, essa biblioteca destina-se a ler e escrever linhas de texto. O manuseio de arquivos, sejam eles locais, remotos, streams, ou buffers, é responsabilidade do usuário. A biblioteca CNAB não lida diretamente com arquivos, mas sim com as linhas de texto que compõem esses arquivos.

# Objetivo

O objetivo desta biblioteca é criar uma forma de comunicação simplificada e padronizada de leitura e escrita de arquivos posicionais.
Isso é possível através da criação dos layouts de especificação do formato das linhas que serão lidas e escritas, permitindo que uma linha de texto seja convertida em JSON e vice-versa. Assim, você pode trabalhar com os dados de forma mais eficiente e intuitiva, sem se preocupar com a complexidade dos arquivos posicionais.

## Recursos da biblioteca CNAB

- Geração de arquivos posicionais: A biblioteca CNAB permite que você crie arquivos CNAB posicionais, independente das padronizações comuns da FEBRABAN.
- Geração de arquivos CNAB: A biblioteca CNAB permite que você crie arquivos CNAB de forma simples e intuitiva, seguindo as especificações de cada banco e layout.
- Leitura de arquivos CNAB: A biblioteca CNAB também oferece funcionalidades para ler e interpretar arquivos posicionais ou CNAB, facilitando a comunicação entre sistemas.

## Como usar a biblioteca CNAB

1. Instalação

Para começar a usar a biblioteca CNAB, você precisa instalá-la em seu projeto. Você pode fazer isso usando o gerenciador de pacotes de sua preferência, como npm.

```
npm install brunnofoggia/cnab101-js
```

2. [Introdução aos layouts](docs/layouts/introducao.md)

3. [Como montar um layout](docs/layouts/como-usar.md)

4. [Como gerar arquivos Posicionais / CNAB](docs/gerar-arquivos.md)

4. [Como ler arquivos Posicionais / CNAB](docs/ler-arquivos.md)

### Outros tópicos

- [Detalhamento sobre layouts (Avançado)](docs/layouts/avancado.md)