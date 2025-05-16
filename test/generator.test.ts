const chars = ['1', '2'];
const getMockValue = (counter: number): string => {
    const position = counter % chars.length;
    const char = chars[position];
    return char;
};

const generateValue = (config, _defaultValue = null, counter) => {
    let [type, length, blank, defaultValue] = config
        .replace(/[!*?"]/g, '')
        // .split(',')[0]
        .split(/[\(\),]/)
        .map((v) => v.trim());

    if (!defaultValue) defaultValue = _defaultValue;
    const size = parseInt(length, 10);
    const padChar = type === '9' || type === 'N' ? '0' : ' ';
    const value = defaultValue ? defaultValue.replace(/"/g, '') : getMockValue(counter);
    const padMethod = type === '9' || type === 'N' ? 'padStart' : 'padEnd';
    const filledValue = value[padMethod](size, padChar);

    return filledValue;
};

export const generateData = (layout: Record<string, string>, defaults: any = {}): any => {
    let counter = 0;
    const json: any = {};
    const data: string[] = [];
    for (const key in layout) {
        const config = layout[key];
        const value = generateValue(config, defaults[key], counter);
        json[key] = value;
        data.push(value);
        counter++;
    }
    return { json, data, line: data.join('') };
};
