import { useCallback, useEffect, useState } from 'react';

import { buildReportDraft } from '../mapping/mappingEngine';
import {
    emptyReportDraft,
    REPORT_SECTION_KEYS,
    type CustomReportSection,
    type MappedField,
    type ReportDraft,
    type ReportSectionKey,
} from '../types/reportAutoFill';
import { useFileUpload } from './useFileUpload';

export interface ReportAutoFillState {
    files: ReturnType<typeof useFileUpload>['files'];
    rejected: ReturnType<typeof useFileUpload>['rejected'];
    draft: ReportDraft | null;
    addFiles: (incoming: FileList | File[]) => void;
    removeFile: (fileId: string) => void;
    clearRejected: () => void;
    updateFieldValue: (sectionKey: string, index: number, value: string) => void;
    clearField: (sectionKey: string, index: number) => void;
}

/**
 * Owns the auto-fill pipeline state for one matter:
 * uploads → extractions → mapped draft → user edits.
 *
 * Mapping re-runs whenever the set of parsed extractions changes. User-edited
 * fields survive the merge as long as their source file is still present.
 */
export function useReportAutoFill(matterId: string): ReportAutoFillState {
    const { files, rejected, extractions, addFiles, removeFile, clearRejected } = useFileUpload();
    const [draft, setDraft] = useState<ReportDraft | null>(null);

    useEffect(() => {
        if (extractions.length === 0) {
            setDraft(null);
            return;
        }
        const fresh = buildReportDraft(matterId, extractions);
        setDraft((current) => mergeDraft(current, fresh, new Set(extractions.map((extraction) => extraction.fileId))));
    }, [extractions, matterId]);

    const updateFieldValue = useCallback((sectionKey: string, index: number, value: string) => {
        setDraft(
            (current) =>
                current &&
                withFields(current, sectionKey, (fields) =>
                    fields.map((field, fieldIndex) => (fieldIndex === index ? { ...field, value, edited: true } : field)),
                ),
        );
    }, []);

    const clearField = useCallback((sectionKey: string, index: number) => {
        setDraft((current) => current && withFields(current, sectionKey, (fields) => fields.filter((_, i) => i !== index)));
    }, []);

    return { files, rejected, draft, addFiles, removeFile, clearRejected, updateFieldValue, clearField };
}

function isCanonical(sectionKey: string): sectionKey is ReportSectionKey {
    return (REPORT_SECTION_KEYS as string[]).includes(sectionKey);
}

/** Routes the transform to the canonical section or the named custom section. */
function withFields(draft: ReportDraft, sectionKey: string, transform: (fields: MappedField[]) => MappedField[]): ReportDraft {
    if (isCanonical(sectionKey)) {
        return { ...draft, sections: { ...draft.sections, [sectionKey]: transform(draft.sections[sectionKey]) } };
    }
    return {
        ...draft,
        customSections: draft.customSections.map((section) =>
            section.name === sectionKey ? { ...section, fields: transform(section.fields) } : section,
        ),
    };
}

/**
 * Merge a freshly computed draft into the existing one:
 * - fresh auto-mapped fields replace old auto-mapped ones
 * - previously edited fields are preserved only while their source file remains
 */
function mergeDraft(previous: ReportDraft | null, fresh: ReportDraft, liveSourceIds: Set<string>): ReportDraft {
    if (!previous || previous.matterId !== fresh.matterId) {
        return fresh;
    }

    const merged = emptyReportDraft(fresh.matterId);
    for (const key of REPORT_SECTION_KEYS) {
        const keptEdits = previous.sections[key].filter((field) => field.edited && liveSourceIds.has(field.sourceFileId));
        const editLabels = new Set(keptEdits.map((field) => field.fieldLabel));
        // Freshly regenerated copies of a field the user already edited are
        // dropped in favour of their edited version.
        merged.sections[key] = [...fresh.sections[key].filter((field) => !editLabels.has(field.fieldLabel)), ...keptEdits];
    }

    merged.customSections = mergeCustomSections(previous.customSections, fresh.customSections, liveSourceIds);

    // Keep any manually reviewed unmapped notes that still have a live source.
    const freshNotes = new Set(fresh.unmappedNotes);
    merged.unmappedNotes = [...fresh.unmappedNotes, ...previous.unmappedNotes.filter((note) => !freshNotes.has(note))];
    return merged;
}

function mergeCustomSections(previous: CustomReportSection[], fresh: CustomReportSection[], liveSourceIds: Set<string>): CustomReportSection[] {
    const merged: CustomReportSection[] = [];
    const freshByName = new Map(fresh.map((section) => [section.name, section]));
    const handled = new Set<string>();

    for (const previousSection of previous) {
        const keptEdits = previousSection.fields.filter((field) => field.edited && liveSourceIds.has(field.sourceFileId));
        const editLabels = new Set(keptEdits.map((field) => field.fieldLabel));
        const freshFields = (freshByName.get(previousSection.name)?.fields ?? []).filter((field) => !editLabels.has(field.fieldLabel));
        const fields = [...freshFields, ...keptEdits];
        if (fields.length > 0) {
            merged.push({ name: previousSection.name, fields });
            handled.add(previousSection.name);
        }
    }

    for (const section of fresh) {
        if (!handled.has(section.name)) {
            merged.push(section);
        }
    }
    return merged;
}
