import { buildErrorCode } from '../../src/common/error';

declare global {
    namespace jest {
        interface Matchers<R> {
            toThrowCode(expectedCode: number): R;
        }
    }
}

const matchers = {
    toThrowCode: function (received: () => void, expectedCode_: number) {
        try {
            received();
            return {
                pass: false,
                message: () => 'The function did not throw an error',
            };
        } catch (error) {
            const expectedCode = buildErrorCode(expectedCode_);
            if (error.code === expectedCode) {
                return {
                    pass: true,
                    message: () => `The function threw the error with the expected code (${expectedCode})`,
                };
            } else {
                return {
                    pass: false,
                    message: () =>
                        `The function threw an error, but the error code (${error.code}) does not match the expected code (${expectedCode})`,
                };
            }
        }
    },
};

export default matchers;

expect?.extend(matchers);
