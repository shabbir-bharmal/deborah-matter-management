import { create } from 'zustand';

import { getAuthUser, login as loginRequest, logout as logoutRequest } from '~/data/selectors';
import type { AuthUser } from '~/types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface AuthStore {
    user: AuthUser | null;
    status: AuthStatus;
    /** Restores the session from the auth cookie on first load. */
    bootstrap: () => Promise<void>;
    signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
    user: null,
    status: 'idle',
    bootstrap: async () => {
        set({ status: 'loading' });
        try {
            set({ user: await getAuthUser(), status: 'authenticated' });
        } catch {
            set({ user: null, status: 'guest' });
        }
    },
    signIn: async (email, password, remember = false) => {
        set({ user: await loginRequest(email, password, remember), status: 'authenticated' });
    },
    signOut: async () => {
        await logoutRequest().catch(() => undefined);
        set({ user: null, status: 'guest' });
    },
}));

export function useAuthUser(): AuthUser | null {
    return useAuthStore((state) => state.user);
}

/**
 * Permission check used to gate navigation, tabs and actions. Pass several
 * abilities to require any one of them.
 */
export function useCan(...abilities: string[]): boolean {
    const permissions = useAuthStore((state) => state.user?.permissions);
    return abilities.some((ability) => permissions?.includes(ability) ?? false);
}

export function can(user: AuthUser | null, ...abilities: string[]): boolean {
    return abilities.some((ability) => user?.permissions.includes(ability) ?? false);
}
