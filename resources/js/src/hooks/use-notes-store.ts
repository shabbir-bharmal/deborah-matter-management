import { create } from 'zustand';

import { PROFILE } from '~/constants/menuData';
import type { MatterNote } from '~/types';

interface NotesStore {
    byInvestigation: Record<string, MatterNote[]>;
    addNote: (investigationId: string, body: string, author?: string) => void;
    removeNote: (investigationId: string, noteId: string) => void;
}

export const useNotesStore = create<NotesStore>()((set) => ({
    byInvestigation: {},
    addNote: (investigationId, body, author = PROFILE.name) =>
        set((state) => {
            const note: MatterNote = {
                id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                investigationId,
                author,
                body,
                createdAt: new Date().toISOString(),
            };
            return { byInvestigation: { ...state.byInvestigation, [investigationId]: [note, ...(state.byInvestigation[investigationId] ?? [])] } };
        }),
    removeNote: (investigationId, noteId) =>
        set((state) => ({
            byInvestigation: {
                ...state.byInvestigation,
                [investigationId]: (state.byInvestigation[investigationId] ?? []).filter((note) => note.id !== noteId),
            },
        })),
}));

export function useInvestigationNotes(investigationId: string): MatterNote[] {
    return useNotesStore((state) => state.byInvestigation[investigationId]) ?? [];
}
