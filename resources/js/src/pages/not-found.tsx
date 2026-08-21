import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '~/components/ui/button';
import { PAGE_TEXT } from '~/constants/menuData';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="bg-muted flex size-14 items-center justify-center rounded-full">
                <Compass className="text-muted-foreground size-7" />
            </span>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.notFound.title}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{PAGE_TEXT.notFound.subtitle}</p>
            </div>
            <Button asChild variant="outline">
                <Link to="/">{PAGE_TEXT.notFound.backToDashboard}</Link>
            </Button>
        </div>
    );
}
