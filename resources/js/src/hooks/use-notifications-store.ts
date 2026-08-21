import { create } from 'zustand';

interface NotificationsStore {
    readIds: Record<string, true>;
    markAllRead: (ids: string[]) => void;
    markRead: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsStore>()((set) => ({
    readIds: {},
    markAllRead: (ids) =>
        set((state) => {
            const readIds = { ...state.readIds };
            for (const id of ids) {
                readIds[id] = true;
            }
            return { readIds };
        }),
    markRead: (id) =>
        set((state) => ({
            readIds: { ...state.readIds, [id]: true },
        })),
}));

export function useUnreadCount(ids: string[]): number {
    const readIds = useNotificationsStore((state) => state.readIds);
    return ids.filter((id) => !readIds[id]).length;
}
