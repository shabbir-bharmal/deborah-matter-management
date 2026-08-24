import { create } from 'zustand';

export type ReportStatus = 'draft' | 'final';

export interface ReportConfig {
    includedSections: Record<string, boolean>;
    title: string;
    executiveSummary: string;
}

/** Accepted auto-fill content keyed by existing report section id. */
export type ReportAutoFillValues = Record<string, string[]>;

export const defaultReportConfig: ReportConfig = {
    includedSections: {},
    title: '',
    executiveSummary: '',
};

interface ReportStore {
    statusByInvestigation: Record<string, ReportStatus>;
    configByInvestigation: Record<string, ReportConfig>;
    autoFillByInvestigation: Record<string, ReportAutoFillValues>;
    markFinal: (investigationId: string) => void;
    updateConfig: (investigationId: string, patch: Partial<ReportConfig>) => void;
    toggleSection: (investigationId: string, sectionId: string) => void;
    setAutoFill: (investigationId: string, values: ReportAutoFillValues) => void;
}

export const useReportStore = create<ReportStore>()((set) => ({
    statusByInvestigation: {},
    configByInvestigation: {},
    autoFillByInvestigation: {},
    markFinal: (investigationId) => set((state) => ({ statusByInvestigation: { ...state.statusByInvestigation, [investigationId]: 'final' } })),
    updateConfig: (investigationId, patch) =>
        set((state) => {
            const current = state.configByInvestigation[investigationId] ?? defaultReportConfig;
            return {
                configByInvestigation: { ...state.configByInvestigation, [investigationId]: { ...current, ...patch } },
            };
        }),
    toggleSection: (investigationId, sectionId) =>
        set((state) => {
            const current = state.configByInvestigation[investigationId] ?? defaultReportConfig;
            const includedSections = { ...current.includedSections, [sectionId]: !(current.includedSections[sectionId] ?? true) };
            return {
                configByInvestigation: { ...state.configByInvestigation, [investigationId]: { ...current, includedSections } },
            };
        }),
    setAutoFill: (investigationId, values) =>
        set((state) => ({ autoFillByInvestigation: { ...state.autoFillByInvestigation, [investigationId]: values } })),
}));

export function useReportStatus(investigationId: string): ReportStatus {
    return useReportStore((state) => state.statusByInvestigation[investigationId]) ?? 'draft';
}

export function useReportConfig(investigationId: string): ReportConfig {
    return useReportStore((state) => state.configByInvestigation[investigationId]) ?? defaultReportConfig;
}
