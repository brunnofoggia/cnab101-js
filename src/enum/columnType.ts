export enum COLUMN_TYPE {
    X = 'X',
    N = '9',
}

export const COLUMN_TYPE_KEY = {
    X: 'X',
    N: 'N',
    // alias used to replicate layout documented as is
    '9': 'N',
};

export enum COLUMN_FILL {
    SPACE = ' ',
    ZERO = '0',
}

export enum COLUMN_TYPE_DIRECTION {
    X = 'LEFT',
    N = 'RIGHT',
}

// key => ignored. can be present or not. whatever
// key? => optional, presence required
// key* => presence required and must be filled
// key! => required and size must be less than or equal to the specified size
export const COLUMN_REQUIREMENT = {
    IGNORED: '.',
    OPTIONAL: '?',
    REQUIRED: '*',
    STRICT: '!',
};

export type COLUMN_REQUIREMENT_TYPE = (typeof COLUMN_REQUIREMENT)[keyof typeof COLUMN_REQUIREMENT];
