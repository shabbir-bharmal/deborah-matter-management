import { createBrowserRouter, createMemoryRouter, Navigate } from 'react-router-dom';

import RequireAuth from '~/components/require-auth';
import AppLayout from '~/layouts/app-layout';
import Admin from '~/pages/admin';
import AdminRoles from '~/pages/admin/roles';
import AdminUsers from '~/pages/admin/users';
import Calendar from '~/pages/calendar';
import ClientPortal from '~/pages/client-portal';
import Clients from '~/pages/clients';
import Dashboard from '~/pages/dashboard';
import DisplayCalendar from '~/pages/display-calendar';
import MatterWorkspace from '~/pages/matter-workspace';
import Documents from '~/pages/matter/documents';
import Evidence from '~/pages/matter/evidence';
import Findings from '~/pages/matter/findings';
import Interviews from '~/pages/matter/interviews';
import Notes from '~/pages/matter/notes';
import Overview from '~/pages/matter/overview';
import Reports from '~/pages/matter/reports';
import Timeline from '~/pages/matter/timeline';
import Matters from '~/pages/matters';
import Login from '~/pages/login';
import NotFound from '~/pages/not-found';
import Profile from '~/pages/profile';
import Settings from '~/pages/settings';

export const routes = [
    { path: '/login', element: <Login /> },
    {
        element: <RequireAuth />,
        children: [
            {
                path: '/',
                element: <AppLayout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'matters', element: <Matters /> },
                    {
                        path: 'matters/:id',
                        element: <MatterWorkspace />,
                        children: [
                            { index: true, element: <Navigate to="overview" replace /> },
                            { path: 'overview', element: <Overview /> },
                            { path: 'timeline', element: <Timeline /> },
                            { path: 'interviews', element: <Interviews /> },
                            { path: 'evidence', element: <Evidence /> },
                            { path: 'findings', element: <Findings /> },
                            { path: 'documents', element: <Documents /> },
                            { path: 'reports', element: <Reports /> },
                            { path: 'notes', element: <Notes /> },
                        ],
                    },
                    { path: 'clients', element: <Clients /> },
                    { path: 'clients/:clientId', element: <ClientPortal /> },
                    { path: 'calendar', element: <Calendar /> },
                    { path: 'display-calendar', element: <DisplayCalendar /> },
                    {
                        path: 'admin',
                        element: <Admin />,
                        children: [
                            { index: true, element: <Navigate to="users" replace /> },
                            { path: 'users', element: <AdminUsers /> },
                            { path: 'roles', element: <AdminRoles /> },
                        ],
                    },
                    { path: 'profile', element: <Profile /> },
                    { path: 'settings', element: <Settings /> },
                    { path: '*', element: <NotFound /> },
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);

export function createTestRouter(initialUrl: string) {
    return createMemoryRouter(routes, { initialEntries: [initialUrl] });
}
