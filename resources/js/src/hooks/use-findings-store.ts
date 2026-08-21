import { create } from 'zustand';

import type { FindingOutcome } from '~/types';

interface InvestigationFindings {
    findings: Record<string, FindingOutcome>;
    notes: Record<string, string>;
}

interface FindingsStore {
    byInvestigation: Record<string, InvestigationFindings>;
    setFinding: (investigationId: string, allegationId: string, finding: FindingOutcome | undefined) => void;
    setNotes: (investigationId: string, allegationId: string, notes: string) => void;
}

function entryFor(state: FindingsStore, investigationId: string): InvestigationFindings {
    return state.byInvestigation[investigationId] ?? { findings: {}, notes: {} };
}

export const useFindingsStore = create<FindingsStore>()((set) => ({
    byInvestigation: {},
    setFinding: (investigationId, allegationId, finding) =>
        set((state) => {
            const entry = entryFor(state, investigationId);
            const findings = { ...entry.findings };
            if (finding === undefined) {
                delete findings[allegationId];
            } else {
                findings[allegationId] = finding;
            }
            return { byInvestigation: { ...state.byInvestigation, [investigationId]: { ...entry, findings } } };
        }),
    setNotes: (investigationId, allegationId, notes) =>
        set((state) => {
            const entry = entryFor(state, investigationId);
            return {
                byInvestigation: {
                    ...state.byInvestigation,
                    [investigationId]: { ...entry, notes: { ...entry.notes, [allegationId]: notes } },
                },
            };
        }),
}));

export function useInvestigationFindings(investigationId: string): InvestigationFindings {
    return useFindingsStore((state) => state.byInvestigation[investigationId]) ?? { findings: {}, notes: {} };
}
