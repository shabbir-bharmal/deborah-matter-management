import { CalendarClock, CalendarDays, ClipboardList, LayoutDashboard, Menu, Scale, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import AppFooter from '~/components/layout/app-footer';
import Breadcrumbs from '~/components/layout/breadcrumbs';
import NotificationBell from '~/components/layout/notification-bell';
import ProfileMenu from '~/components/layout/profile-menu';
import ThemeToggle from '~/components/layout/theme-toggle';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { ARIA_LABELS, BRAND, NAV_ITEMS } from '~/constants/menuData';
import { cn } from '~/lib/utils';

const navIcons = {
    Dashboard: LayoutDashboard,
    Investigations: ClipboardList,
    Clients: Users,
    Calendar: CalendarDays,
    'Display Calendar': CalendarClock,
    Settings: Settings,
} as const;

function NavItems({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
    return (
        <>
            {NAV_ITEMS.map((item) => {
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
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                className,
                            )
                        }
                    >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                    </NavLink>
                );
            })}
        </>
    );
}

function Brand({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-2.5 border-b px-4 py-4', className)}>
            <Scale className="text-sidebar-primary size-6 shrink-0" />
            <span className="text-base font-semibold tracking-tight">{BRAND.name}</span>
        </div>
    );
}

export default function AppLayout() {
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <div className="flex flex-1">
                {/* Persistent sidebar — desktop */}
                <aside className="bg-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r lg:flex print:hidden">
                    <Brand />
                    <nav aria-label={ARIA_LABELS.mainNav} className="flex flex-1 flex-col gap-1 p-3">
                        <NavItems />
                    </nav>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Top bar — all breakpoints */}
                    <header className="bg-background sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-3 md:px-6 print:hidden">
                        {/* Hamburger + drawer — mobile and tablet (< lg) */}
                        <Sheet open={navOpen} onOpenChange={setNavOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden" aria-label={ARIA_LABELS.openMenu}>
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0">
                                <SheetHeader className="border-b px-4 py-4 text-left">
                                    <SheetTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
                                        <Scale className="text-sidebar-primary size-6 shrink-0" />
                                        {BRAND.name}
                                    </SheetTitle>
                                </SheetHeader>
                                <nav aria-label={ARIA_LABELS.mobileNav} className="flex flex-col gap-1 p-3">
                                    <NavItems onNavigate={() => setNavOpen(false)} />
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label={ARIA_LABELS.goToDashboard}>
                            <Scale className="text-sidebar-primary size-5" />
                            <span className="hidden text-sm font-semibold sm:inline">{BRAND.name}</span>
                        </Link>

                        <div className="ml-auto flex shrink-0 items-center gap-1.5">
                            <ThemeToggle />
                            <NotificationBell />
                            <ProfileMenu />
                        </div>
                    </header>

                    <main className="example-class-added flex-1 p-4 md:p-6">
                        <Breadcrumbs />
                        <Outlet />
                    </main>
                </div>
            </div>

            <AppFooter />
        </div>
    );
}
