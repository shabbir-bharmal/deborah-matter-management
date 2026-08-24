export { default as AutoFillPanel } from './components/AutoFillPanel';
export { default as ConfidenceBadge } from './components/ConfidenceBadge';
export { default as FieldMappingPreview, SECTION_TITLES } from './components/FieldMappingPreview';
export { default as FileUploadZone } from './components/FileUploadZone';
export { default as MappedFieldRow } from './components/MappedFieldRow';
export { default as ReportSectionCard } from './components/ReportSectionCard';
export { default as UploadedFileList } from './components/UploadedFileList';
export { useFileUpload } from './hooks/useFileUpload';
export { useReportAutoFill } from './hooks/useReportAutoFill';
export { buildReportDraft } from './mapping/mappingEngine';
export { SECTION_KEY_TO_REPORT_SECTION, draftToReportSections } from './mapping/reportHandoff';
export { detectFileType, parseUploadedFile } from './parsers/parserRouter';
export { emptyReportDraft } from './types/reportAutoFill';
export type {
    ExtractionResult,
    FieldConfidence,
    MappedField,
    ReportDraft,
    ReportSectionKey,
    SupportedFileType,
    UploadedFile,
} from './types/reportAutoFill';
