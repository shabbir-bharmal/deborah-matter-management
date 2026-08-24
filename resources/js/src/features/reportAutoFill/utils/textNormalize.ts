export function normalizeWhitespace(text: string): string {
    return text
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/ ?\n ?/g, '\n')
        .trim();
}

export function collapseBlankLines(text: string): string {
    return text.replace(/\n{3,}/g, '\n\n');
}

export function normalizeText(text: string): string {
    return collapseBlankLines(normalizeWhitespace(text));
}
