import { ERROR_CODE, errorPrefix } from '../enum/error';

export type ERROR_CODE_TYPE = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export const buildErrorCode = (code: number) => {
    return [errorPrefix, code].join('-');
};

export class Err extends Error {
    code: string;
    constructor(message: string, code: ERROR_CODE_TYPE = ERROR_CODE.UNKNOWN) {
        super(message);
        this.code = buildErrorCode(code);
    }
}
