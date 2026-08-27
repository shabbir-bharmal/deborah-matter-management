import { create } from 'zustand';

import { createNote, deleteNote, getNotes } from '~/data/selectors';
import type { MatterNote } from '~/types';

interface NotesStore {
    byInvestigation: Record<string, MatterNote[]>;
    loading: Record<string, boolean>;
    load: (investigationId: string) => Promise<void>;
    addNote: (investigationId: string, body: string) => Promise<void>;
    removeNote: (investigationId: string, noteId: string) => Promise<void>;
}

export const useNotesStore = create<NotesStore>()((set) => ({
    byInvestigation: {},
    loading: {},
    load: async (investigationId) => {
        set((state) => ({ loading: { ...state.loading, [investigationId]: true } }));
        const notes = await getNotes(investigationId);
        set((state) => ({
            byInvestigation: { ...state.byInvestigation, [investigationId]: notes },
            loading: { ...state.loading, [investigationId]: false },
        }));
    },
    addNote: async (investigationId, body) => {
        const note = await createNote(investigationId, body);
        set((state) => ({
            byInvestigation: {
                ...state.byInvestigation,
                [investigationId]: [note, ...(state.byInvestigation[investigationId] ?? [])],
            },
        }));
    },
    removeNote: async (investigationId, noteId) => {
        await deleteNote(investigationId, noteId);
        set((state) => ({
            byInvestigation: {
                ...state.byInvestigation,
                [investigationId]: (state.byInvestigation[investigationId] ?? []).filter((note) => note.id !== noteId),
            },
        }));
    },
}));

export function useInvestigationNotes(investigationId: string): MatterNote[] {
    return useNotesStore((state) => state.byInvestigation[investigationId]) ?? [];
}
