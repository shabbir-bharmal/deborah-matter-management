import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '~/hooks/use-auth';

/**
 * Restores the session before rendering the workspace and bounces guests to the
 * sign-in page, remembering where they were headed.
 */
export default function RequireAuth() {
    const status = useAuthStore((state) => state.status);
    const bootstrap = useAuthStore((state) => state.bootstrap);
    const location = useLocation();

    useEffect(() => {
        if (status === 'idle') {
            void bootstrap();
        }
    }, [status, bootstrap]);

    if (status === 'idle' || status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center" aria-busy="true">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
        );
    }

    if (status === 'guest') {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }

    return <Outlet />;
}
