import { Moon, Sun } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { PAGE_TEXT } from '~/constants/menuData';
import { useTheme } from '~/hooks/use-theme';
import { cn } from '~/lib/utils';

export default function Settings() {
    const [theme, setTheme] = useTheme();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.settings.title}</h1>
                <p className="text-muted-foreground text-sm">{PAGE_TEXT.settings.subtitle}</p>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle className="text-base">{PAGE_TEXT.settings.appearance.title}</CardTitle>
                    <CardDescription>{PAGE_TEXT.settings.appearance.description}</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {(
                            [
                                { value: 'light', label: PAGE_TEXT.settings.appearance.light, icon: Sun },
                                { value: 'dark', label: PAGE_TEXT.settings.appearance.dark, icon: Moon },
                            ] as const
                        ).map((option) => (
                            <label key={option.value} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={option.value}
                                    checked={theme === option.value}
                                    onChange={() => setTheme(option.value)}
                                    className="peer sr-only"
                                />
                                <span
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors',
                                        'peer-focus-visible:ring-ring peer-focus-visible:ring-2',
                                        theme === option.value ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                                    )}
                                >
                                    <option.icon className="size-5" />
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                    <p className="text-muted-foreground mt-3 text-xs">{PAGE_TEXT.settings.appearance.note}</p>
                </CardContent>
            </Card>
        </div>
    );
}
