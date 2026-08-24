export type SupportedFileType = 'docx' | 'pdf' | 'csv';

export interface UploadedFile {
    id: string;
    file: File;
    type: SupportedFileType;
    status: 'queued' | 'parsing' | 'parsed' | 'error';
    errorMessage?: string;
}

// Output of a parser — deliberately generic so all three formats converge here
export interface ExtractionResult {
    fileId: string;
    fileName: string;
    fileType: SupportedFileType;
    rawText?: string; // docx/pdf: full extracted text
    rows?: Record<string, string>[]; // csv: parsed rows with headers
    pages?: string[]; // pdf: text per page, useful for citing "page 3"
}

export type ReportSectionKey =
    'matterSummary' | 'allegationsAndFindings' | 'witnessInterviews' | 'evidenceReviewed' | 'keyTimelineEvents' | 'conclusion';

export type FieldConfidence = 'high' | 'medium' | 'low' | 'unmapped';

export interface MappedField {
    sectionKey: ReportSectionKey;
    fieldLabel: string; // e.g. "Interview date — Jane Doe"
    value: string;
    confidence: FieldConfidence;
    sourceFileId: string;
    sourceFileName: string;
    sourceExcerpt?: string; // short snippet the value was pulled from, for user trust
    edited: boolean; // true once the user manually changes it
}

export interface ReportDraft {
    matterId: string;
    sections: Record<ReportSectionKey, MappedField[]>;
    unmappedNotes: string[]; // extracted content that didn't confidently map anywhere
}

export const REPORT_SECTION_KEYS: ReportSectionKey[] = [
    'matterSummary',
    'allegationsAndFindings',
    'witnessInterviews',
    'evidenceReviewed',
    'keyTimelineEvents',
    'conclusion',
];

export function emptyReportDraft(matterId: string): ReportDraft {
    return {
        matterId,
        sections: {
            matterSummary: [],
            allegationsAndFindings: [],
            witnessInterviews: [],
            evidenceReviewed: [],
            keyTimelineEvents: [],
            conclusion: [],
        },
        unmappedNotes: [],
    };
}
