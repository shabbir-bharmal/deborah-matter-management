import { Moon, Sun } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ARIA_LABELS } from '~/constants/menuData';
import { useTheme } from '~/hooks/use-theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useTheme();
    const isDark = theme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? ARIA_LABELS.themeToLight : ARIA_LABELS.themeToDark}
            title={isDark ? ARIA_LABELS.themeToLight : ARIA_LABELS.themeToDark}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
    );
}
