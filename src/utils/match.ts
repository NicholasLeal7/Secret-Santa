export const encryptMatch = (id: number): string => {
    return `${process.env.DEFAULT_TOKEN}${id}${process.env.DEFAULT_TOKEN}   `;
};

export const decryptMatch = (match: string): number => {
    let idString: string = match
        .replace(process.env.DEFAULT_TOKEN as string, '')
        .replace(process.env.DEFAULT_TOKEN as string, '');
    return parseInt(idString);
};