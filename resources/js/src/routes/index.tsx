import { createBrowserRouter, createMemoryRouter, Navigate } from 'react-router-dom';

import AppLayout from '~/layouts/app-layout';
import Calendar from '~/pages/calendar';
import ClientPortal from '~/pages/client-portal';
import Clients from '~/pages/clients';
import Dashboard from '~/pages/dashboard';
import InvestigationWorkspace from '~/pages/investigation-workspace';
import Allegations from '~/pages/investigation/allegations';
import Documents from '~/pages/investigation/documents';
import Evidence from '~/pages/investigation/evidence';
import Findings from '~/pages/investigation/findings';
import Interviews from '~/pages/investigation/interviews';
import Overview from '~/pages/investigation/overview';
import Reports from '~/pages/investigation/reports';
import Timeline from '~/pages/investigation/timeline';
import Witnesses from '~/pages/investigation/witnesses';
import Investigations from '~/pages/investigations';
import NotFound from '~/pages/not-found';
import Settings from '~/pages/settings';

export const routes = [
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
                    { path: 'allegations', element: <Allegations /> },
                    { path: 'witnesses', element: <Witnesses /> },
                    { path: 'interviews', element: <Interviews /> },
                    { path: 'evidence', element: <Evidence /> },
                    { path: 'findings', element: <Findings /> },
                    { path: 'documents', element: <Documents /> },
                    { path: 'reports', element: <Reports /> },
                ],
            },
            { path: 'clients', element: <Clients /> },
            { path: 'clients/:clientId', element: <ClientPortal /> },
            { path: 'calendar', element: <Calendar /> },
            { path: 'settings', element: <Settings /> },
            { path: '*', element: <NotFound /> },
        ],
    },
];

export const router = createBrowserRouter(routes);

export function createTestRouter(initialUrl: string) {
    return createMemoryRouter(routes, { initialEntries: [initialUrl] });
}
