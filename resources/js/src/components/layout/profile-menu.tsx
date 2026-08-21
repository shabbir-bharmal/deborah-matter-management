import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { COMMON, PROFILE } from '~/constants/menuData';

export default function ProfileMenu() {
    const initials = PROFILE.name
        .split(' ')
        .map((part) => part[0])
        .join('');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left leading-tight sm:block">
                        <span className="block text-sm font-medium">{PROFILE.name}</span>
                        <span className="text-muted-foreground block text-xs">{PROFILE.role}</span>
                    </span>
                    <ChevronDown className="text-muted-foreground size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                    <p className="text-sm font-medium">{PROFILE.name}</p>
                    <p className="text-muted-foreground text-xs font-normal">{PROFILE.email}</p>
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
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => toast.info(COMMON.signOutDisabledTitle, { description: COMMON.signOutDisabledDescription })}
                >
                    <LogOut className="size-4" /> {COMMON.signOut}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
