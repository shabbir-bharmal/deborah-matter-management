import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import './index.css';
import { router } from './routes';

createRoot(document.getElementById('root')!).render(
    <>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
    </>,
);
