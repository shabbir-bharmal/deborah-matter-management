import { create } from 'zustand';

import { saveFinding } from '~/data/selectors';
import type { Allegation, FindingOutcome } from '~/types';

interface InvestigationFindings {
    findings: Record<string, FindingOutcome | undefined>;
    notes: Record<string, string>;
}

interface FindingsStore {
    byInvestigation: Record<string, InvestigationFindings>;
    /** Seeds the store from the allegations the API returned. */
    hydrate: (investigationId: string, allegations: Allegation[]) => void;
    setFinding: (investigationId: string, allegationId: string, finding: FindingOutcome | undefined) => Promise<void>;
    setNotes: (investigationId: string, allegationId: string, notes: string) => void;
    saveNotes: (investigationId: string, allegationId: string) => Promise<void>;
}

const EMPTY: InvestigationFindings = { findings: {}, notes: {} };

function entryFor(state: FindingsStore, investigationId: string): InvestigationFindings {
    return state.byInvestigation[investigationId] ?? EMPTY;
}

export const useFindingsStore = create<FindingsStore>()((set, get) => ({
    byInvestigation: {},
    hydrate: (investigationId, allegations) =>
        set((state) => ({
            byInvestigation: {
                ...state.byInvestigation,
                [investigationId]: {
                    findings: Object.fromEntries(allegations.map((item) => [item.id, item.finding ?? undefined])),
                    notes: Object.fromEntries(allegations.map((item) => [item.id, item.findingNotes ?? ''])),
                },
            },
        })),
    setFinding: async (investigationId, allegationId, finding) => {
        const previous = entryFor(get(), investigationId);
        set((state) => {
            const entry = entryFor(state, investigationId);
            return {
                byInvestigation: {
                    ...state.byInvestigation,
                    [investigationId]: { ...entry, findings: { ...entry.findings, [allegationId]: finding } },
                },
            };
        });

        try {
            await saveFinding(allegationId, finding ?? null);
        } catch (error) {
            // Roll back so the UI never shows a finding the server rejected.
            set((state) => ({ byInvestigation: { ...state.byInvestigation, [investigationId]: previous } }));
            throw error;
        }
    },
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
    saveNotes: async (investigationId, allegationId) => {
        const entry = entryFor(get(), investigationId);
        await saveFinding(allegationId, entry.findings[allegationId] ?? null, entry.notes[allegationId] ?? '');
    },
}));

export function useInvestigationFindings(investigationId: string): InvestigationFindings {
    return useFindingsStore((state) => state.byInvestigation[investigationId]) ?? EMPTY;
}
