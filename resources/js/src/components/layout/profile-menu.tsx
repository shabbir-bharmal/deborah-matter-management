import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { COMMON } from '~/constants/menuData';
import { useAuthStore } from '~/hooks/use-auth';

const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    investigator: 'Investigator',
    client: 'Client portal',
};

export default function ProfileMenu() {
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('');

    const roleLabel = user.roles.map((role) => roleLabels[role] ?? role).join(', ');

    const handleSignOut = async () => {
        await signOut();
        toast.success(COMMON.signedOutTitle, { description: COMMON.signedOutDescription });
        navigate('/login', { replace: true });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left leading-tight sm:block">
                        <span className="block text-sm font-medium">{user.name}</span>
                        <span className="text-muted-foreground block text-xs">{roleLabel}</span>
                    </span>
                    <ChevronDown className="text-muted-foreground size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-xs font-normal">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                        <UserRound className="size-4" /> {COMMON.profileAndPreferences}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                        <Settings className="size-4" /> {COMMON.settingsLabel}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => void handleSignOut()}>
                    <LogOut className="size-4" /> {COMMON.signOut}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
