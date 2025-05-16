import { LayoutInputInterface } from '../src/interface/layout';
import { generateData } from './generator.test';

const header_arquivo = {
    cod_banco: 'N(3), "047"',
    lote_servico: 'N(4), "0000"',
    _id_line: 'N(1), "0"',
    febraban_01: 'A(9)',
    tipo_inscricao: 'N(1)',
    numero_inscricao: 'N(14)',
    // codigo_convenio: 'A(20)',
    codigo_convenio_banese: 'N(6)',
    codigo_convenio_banese_final: 'A(14)',
    agencia: 'N(5)',
    dv_agencia: 'A(1)',
    // numero_conta: 'N(12)',
    // dv_conta: 'A(1)',
    conta_unificada: 'N(13)',
    dv_agencia_conta: 'A(1)',
    nome_empresa: 'A(30)',
    nome_banco: 'A(30), "BANESE"',
    febraban_02: 'A(10)',
    indicador_remessa_retorno: 'N(1)',
    data_geracao: 'N(8)',
    hora_geracao: 'N(6)',
    sequencial_arquivo: 'N(6)',
    versao_layout: 'N(3), "087"',
    densidade_gravacao: 'N(5), "00000"',
    reservado_banese: 'A(20)',
    // para testes pois o doc esta errado
    // reservado_empresa: 'A(16)',
    reservado_empresa: 'A(20)',
    febraban_03: 'A(29)',
};

export const { json: banese_header_arquivo_json, line: banese_header_arquivo_line } = generateData(header_arquivo, {
    _id_line: '0',
    _id_segment: '1',
});

export const banese240: LayoutInputInterface = {
    size: 240,
    idLine: [7, 1],
    idSegment: [9, 1],
    autoIdentification: true,
    lines: {
        header_arquivo: {
            id: '0',
            layout: header_arquivo,
        },
    },
};
