import { CalendarClock, CalendarDays, ClipboardList, LayoutDashboard, Menu, Scale, Settings, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import AppFooter from '~/components/layout/app-footer';
import Breadcrumbs from '~/components/layout/breadcrumbs';
import NotificationBell from '~/components/layout/notification-bell';
import ProfileMenu from '~/components/layout/profile-menu';
import ThemeToggle from '~/components/layout/theme-toggle';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { ARIA_LABELS, BRAND, NAV_ITEMS, type NavItemData } from '~/constants/menuData';
import { useAuthStore } from '~/hooks/use-auth';
import { cn } from '~/lib/utils';

const navIcons = {
    Dashboard: LayoutDashboard,
    Investigations: ClipboardList,
    Clients: Users,
    Calendar: CalendarDays,
    'Display Calendar': CalendarClock,
    Administration: ShieldCheck,
    Settings: Settings,
} as const;

/**
 * Header tab strip — icon over label, active tab underlined. Mirrors the
 * top-tab information architecture used across the admin suite.
 */
function HeaderTabs({ items }: { items: NavItemData[] }) {
    return (
        <nav aria-label={ARIA_LABELS.mainNav} className="-mb-px flex gap-1 overflow-x-auto">
            {items.map((item) => {
                const Icon = navIcons[item.label as keyof typeof navIcons];
                return (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.end}
                        className={({ isActive }) =>
                            cn(
                                'flex min-w-24 shrink-0 flex-col items-center gap-1.5 rounded-t-md border-b-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                                isActive
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 border-transparent',
                            )
                        }
                    >
                        <Icon className="size-5" />
                        {item.label}
                    </NavLink>
                );
            })}
        </nav>
    );
}

function DrawerNav({ items, onNavigate }: { items: NavItemData[]; onNavigate: () => void }) {
    return (
        <nav aria-label={ARIA_LABELS.mobileNav} className="flex flex-col gap-1 p-3">
            {items.map((item) => {
                const Icon = navIcons[item.label as keyof typeof navIcons];
                return (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent',
                            )
                        }
                    >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                    </NavLink>
                );
            })}
        </nav>
    );
}

export default function AppLayout() {
    const [navOpen, setNavOpen] = useState(false);
    const permissions = useAuthStore((state) => state.user?.permissions ?? []);
    const items = NAV_ITEMS.filter((item) => !item.permission || permissions.includes(item.permission));

    return (
        <div className="bg-muted/40 flex min-h-screen flex-col">
            <header className="bg-background sticky top-0 z-20 border-b print:hidden">
                {/* Row 1 — brand and account actions */}
                <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-4 md:px-6">
                    <Sheet open={navOpen} onOpenChange={setNavOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={ARIA_LABELS.openMenu}>
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 p-0">
                            <SheetHeader className="border-b px-4 py-4 text-left">
                                <SheetTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
                                    <Scale className="text-primary size-6 shrink-0" />
                                    {BRAND.name}
                                </SheetTitle>
                            </SheetHeader>
                            <DrawerNav items={items} onNavigate={() => setNavOpen(false)} />
                        </SheetContent>
                    </Sheet>

                    <Link to="/" className="flex items-center gap-2.5" aria-label={ARIA_LABELS.goToDashboard}>
                        <Scale className="text-primary size-6 shrink-0" />
                        <span className="hidden text-base font-semibold tracking-tight sm:inline">{BRAND.name}</span>
                    </Link>

                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        <ThemeToggle />
                        <NotificationBell />
                        <ProfileMenu />
                    </div>
                </div>

                {/* Row 2 — module tabs (desktop only; mobile uses the drawer) */}
                <div className="hidden border-t lg:block">
                    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6">
                        <HeaderTabs items={items} />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6">
                <Breadcrumbs />
                <Outlet />
            </main>

            <AppFooter />
        </div>
    );
}
