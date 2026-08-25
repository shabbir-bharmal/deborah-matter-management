import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BRAND, FOOTER, NAV_ITEMS } from '~/constants/menuData';

export default function AppFooter() {
    return (
        <footer className="bg-sidebar border-t print:hidden">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                    <div className="max-w-sm space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Scale className="text-sidebar-primary size-6 shrink-0" />
                            <span className="text-base font-semibold tracking-tight">{BRAND.name}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{FOOTER.tagline}</p>
                    </div>

                    <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
                        <nav aria-label={FOOTER.navigateHeading}>
                            <h3 className="mb-3 text-xs font-medium tracking-wide uppercase">{FOOTER.navigateHeading}</h3>
                            <ul className="space-y-2">
                                {NAV_ITEMS.map((item) => (
                                    <li key={item.href}>
                                        <Link to={item.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div>
                            <h3 className="mb-3 text-xs font-medium tracking-wide uppercase">{FOOTER.contactHeading}</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href={`mailto:${FOOTER.contactEmail}`}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {FOOTER.contactEmail}
                                    </a>
                                </li>
                                <li className="text-muted-foreground">{BRAND.sidebarNote}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="text-muted-foreground mt-10 flex flex-col gap-2 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        &copy; {new Date().getFullYear()} {BRAND.name}. {FOOTER.rights}
                    </span>
                    <span>{FOOTER.confidentiality}</span>
                </div>
            </div>
        </footer>
    );
}
