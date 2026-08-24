export function containsAny(text: string, keywords: string[]): boolean {
    const lower = text.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export function countKeywordHits(text: string, keywords: string[]): number {
    const lower = text.toLowerCase();
    return keywords.reduce((total, keyword) => (lower.includes(keyword.toLowerCase()) ? total + 1 : total), 0);
}

/**
 * Score a line against strong and weak keyword lists.
 * - both a strong hit and a weak hit → 2
 * - exactly one list hit → 1
 * - no hits → 0
 */
export function scoreLine(line: string, strongKeywords: string[], weakKeywords: string[]): number {
    const hasStrong = containsAny(line, strongKeywords);
    const hasWeak = containsAny(line, weakKeywords);
    if (hasStrong && hasWeak) {
        return 2;
    }
    if (hasStrong || hasWeak) {
        return 1;
    }
    return 0;
}
