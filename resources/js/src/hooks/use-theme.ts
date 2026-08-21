import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'spa-theme';

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme(): [Theme, (theme: Theme) => void] {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') {
            return 'light';
        }
        return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light';
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = (next: Theme) => {
        localStorage.setItem(STORAGE_KEY, next);
        setThemeState(next);
        applyTheme(next);
    };

    return [theme, setTheme];
}
