import { create } from 'zustand';

import { getReport, saveReport } from '~/data/selectors';
import type { InvestigationReport, ReportStatus } from '~/types';

export type { ReportStatus } from '~/types';

export interface ReportConfig {
    includedSections: Record<string, boolean>;
    title: string;
    executiveSummary: string;
}

/** Accepted auto-fill content keyed by existing report section id. */
export type ReportAutoFillValues = Record<string, string[]>;

/** Accepted auto-fill content for file-created sections. */
export interface CustomAutoFillSection {
    id: string;
    heading: string;
    bullets: string[];
}

export const defaultReportConfig: ReportConfig = {
    includedSections: {},
    title: '',
    executiveSummary: '',
};

interface ReportStore {
    statusByInvestigation: Record<string, ReportStatus>;
    configByInvestigation: Record<string, ReportConfig>;
    autoFillByInvestigation: Record<string, ReportAutoFillValues>;
    customAutoFillByInvestigation: Record<string, CustomAutoFillSection[]>;
    load: (investigationId: string) => Promise<void>;
    markFinal: (investigationId: string) => void;
    updateConfig: (investigationId: string, patch: Partial<ReportConfig>) => void;
    toggleSection: (investigationId: string, sectionId: string) => void;
    setAutoFill: (investigationId: string, values: ReportAutoFillValues) => void;
    setCustomAutoFill: (investigationId: string, sections: CustomAutoFillSection[]) => void;
}

/**
 * Free-text edits fire on every keystroke, so writes are coalesced per matter
 * before they reach the API.
 * ponytail: fixed 600ms debounce, no retry queue — add one if offline editing matters.
 */
const queued = new Map<string, Partial<InvestigationReport>>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function persist(investigationId: string, patch: Partial<InvestigationReport>, debounceMs = 0): void {
    // Merge rather than replace, so a queued title edit survives a section toggle.
    queued.set(investigationId, { ...(queued.get(investigationId) ?? {}), ...patch });

    const timer = timers.get(investigationId);
    if (timer) {
        clearTimeout(timer);
    }

    const flush = () => {
        timers.delete(investigationId);
        const body = queued.get(investigationId);
        queued.delete(investigationId);
        if (body) {
            void saveReport(investigationId, body).catch(() => undefined);
        }
    };

    if (debounceMs === 0) {
        flush();
        return;
    }

    timers.set(investigationId, setTimeout(flush, debounceMs));
}

export const useReportStore = create<ReportStore>()((set, get) => ({
    statusByInvestigation: {},
    configByInvestigation: {},
    autoFillByInvestigation: {},
    customAutoFillByInvestigation: {},
    load: async (investigationId) => {
        const report = await getReport(investigationId);
        set((state) => ({
            statusByInvestigation: { ...state.statusByInvestigation, [investigationId]: report.status },
            configByInvestigation: {
                ...state.configByInvestigation,
                [investigationId]: {
                    includedSections: report.includedSections ?? {},
                    title: report.title ?? '',
                    executiveSummary: report.executiveSummary ?? '',
                },
            },
            autoFillByInvestigation: { ...state.autoFillByInvestigation, [investigationId]: report.autoFill ?? {} },
            customAutoFillByInvestigation: { ...state.customAutoFillByInvestigation, [investigationId]: report.customSections ?? [] },
        }));
    },
    markFinal: (investigationId) => {
        set((state) => ({ statusByInvestigation: { ...state.statusByInvestigation, [investigationId]: 'final' } }));
        persist(investigationId, { status: 'final' });
    },
    updateConfig: (investigationId, patch) => {
        const current = get().configByInvestigation[investigationId] ?? defaultReportConfig;
        const next = { ...current, ...patch };
        set((state) => ({ configByInvestigation: { ...state.configByInvestigation, [investigationId]: next } }));
        persist(investigationId, { title: next.title, executiveSummary: next.executiveSummary, includedSections: next.includedSections }, 600);
    },
    toggleSection: (investigationId, sectionId) => {
        const current = get().configByInvestigation[investigationId] ?? defaultReportConfig;
        const includedSections = { ...current.includedSections, [sectionId]: !(current.includedSections[sectionId] ?? true) };
        set((state) => ({
            configByInvestigation: { ...state.configByInvestigation, [investigationId]: { ...current, includedSections } },
        }));
        persist(investigationId, { includedSections });
    },
    setAutoFill: (investigationId, values) => {
        set((state) => ({ autoFillByInvestigation: { ...state.autoFillByInvestigation, [investigationId]: values } }));
        persist(investigationId, { autoFill: values });
    },
    setCustomAutoFill: (investigationId, sections) => {
        set((state) => ({ customAutoFillByInvestigation: { ...state.customAutoFillByInvestigation, [investigationId]: sections } }));
        persist(investigationId, { customSections: sections });
    },
}));

export function useReportStatus(investigationId: string): ReportStatus {
    return useReportStore((state) => state.statusByInvestigation[investigationId]) ?? 'draft';
}

export function useReportConfig(investigationId: string): ReportConfig {
    return useReportStore((state) => state.configByInvestigation[investigationId]) ?? defaultReportConfig;
}

export function useCustomAutoFill(investigationId: string): CustomAutoFillSection[] {
    return useReportStore((state) => state.customAutoFillByInvestigation[investigationId]) ?? [];
}
