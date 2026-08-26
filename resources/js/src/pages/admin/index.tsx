import { NavLink, Outlet } from 'react-router-dom';

import { ADMIN_TEXT } from '~/constants/menuData';
import { useCan } from '~/hooks/use-auth';
import { cn } from '~/lib/utils';

const tabs = [
    { to: 'users', label: ADMIN_TEXT.tabs.users, permission: 'users.view' },
    { to: 'roles', label: ADMIN_TEXT.tabs.roles, permission: 'roles.view' },
];

export default function Admin() {
    const canUsers = useCan('users.view');
    const canRoles = useCan('roles.view');
    const allowed = tabs.filter((tab) => (tab.permission === 'users.view' ? canUsers : canRoles));

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{ADMIN_TEXT.title}</h1>
                <p className="text-muted-foreground text-sm">{ADMIN_TEXT.subtitle}</p>
            </div>

            <nav className="-mx-1 flex gap-1 overflow-x-auto border-b pb-px">
                {allowed.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            cn(
                                'rounded-t-md px-3 py-2 text-sm font-medium whitespace-nowrap',
                                isActive
                                    ? 'bg-card border border-b-transparent shadow-xs'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>

            <Outlet />
        </div>
    );
}
