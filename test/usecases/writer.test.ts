import { CnabWriter } from '../../src';

const cnabWriter = new CnabWriter();

const layout = {
    size: 500,
    // se a auto identificação estiver ligada, somente o json é necessário para escrever a linha utilizando o método writeLine
    autoIdentification: 1,
    // Definição das linhas do layout
    lines: {
        header: {
            id: '0',
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

cnabWriter.initialize(layout);

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

const lineData = cnab500HeaderJsonSample;
const lineText = cnabWriter.writeLine(lineData);

console.log('Line Text:', lineText);
