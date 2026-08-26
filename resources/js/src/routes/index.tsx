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
import InvestigationWorkspace from '~/pages/investigation-workspace';
import Documents from '~/pages/investigation/documents';
import Evidence from '~/pages/investigation/evidence';
import Findings from '~/pages/investigation/findings';
import Interviews from '~/pages/investigation/interviews';
import Notes from '~/pages/investigation/notes';
import Overview from '~/pages/investigation/overview';
import Reports from '~/pages/investigation/reports';
import Timeline from '~/pages/investigation/timeline';
import Investigations from '~/pages/investigations';
import Login from '~/pages/login';
import NotFound from '~/pages/not-found';
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
                    { path: 'investigations', element: <Investigations /> },
                    {
                        path: 'investigations/:id',
                        element: <InvestigationWorkspace />,
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
