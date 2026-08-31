import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { PAGE_TEXT } from '~/constants/menuData';
import { updateProfile } from '~/data/selectors';
import { useAuthStore } from '~/hooks/use-auth';
import { ApiError } from '~/lib/api';

const TEXT = PAGE_TEXT.profile;

export default function Profile() {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; avatar?: string }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        if (!avatarFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(avatarFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    if (!user) {
        return <p className="text-muted-foreground text-sm">Loading profile…</p>;
    }

    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const displayAvatar = previewUrl ?? (removeAvatar ? null : (user.avatarUrl ?? null));

    const validate = () => {
        const next: typeof errors = {};
        if (!name.trim()) {
            next.name = TEXT.messages.nameRequired;
        }
        if (!email.trim()) {
            next.email = TEXT.messages.emailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            next.email = TEXT.messages.emailInvalid;
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors((prev) => ({ ...prev, avatar: 'Please select an image file.' }));
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, avatar: 'Image must be under 2MB.' }));
                return;
            }
            setAvatarFile(file);
            setRemoveAvatar(false);
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy.avatar;
                return copy;
            });
        }
    };

    const handleRemove = () => {
        setAvatarFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (user.avatarUrl || previewUrl) {
            setRemoveAvatar(true);
        }
        if (previewUrl) {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validate()) {
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('email', email.trim().toLowerCase());
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            if (removeAvatar && !avatarFile) {
                formData.append('remove_avatar', '1');
            }

            const updated = await updateProfile(formData);
            setUser(updated);
            setAvatarFile(null);
            setRemoveAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setErrors({});
            toast.success(TEXT.messages.updated);
        } catch (error) {
            if (error instanceof ApiError && error.errors) {
                const next: typeof errors = {};
                if (error.errors.name) {
                    next.name = error.errors.name[0];
                }
                if (error.errors.email) {
                    next.email = error.errors.email[0];
                }
                if (error.errors.avatar) {
                    next.avatar = error.errors.avatar[0];
                }
                if (Object.keys(next).length > 0) {
                    setErrors(next);
                } else {
                    toast.error(error.message || TEXT.messages.updateError);
                }
            } else {
                toast.error(TEXT.messages.updateError);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setName(user.name);
        setEmail(user.email);
        setAvatarFile(null);
        setRemoveAvatar(false);
        setErrors({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{TEXT.title}</h1>
                <p className="text-muted-foreground text-sm">{TEXT.subtitle}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{TEXT.avatar.label}</CardTitle>
                    <CardDescription>{TEXT.avatar.hint}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="size-24 border">
                        {displayAvatar ? <AvatarImage src={displayAvatar} alt={user.name} /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-wrap items-center gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="size-4" />
                            {TEXT.avatar.change}
                        </Button>

                        {(displayAvatar || avatarFile) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="size-4" />
                                {TEXT.avatar.remove}
                            </Button>
                        )}
                    </div>
                </CardContent>
                {errors.avatar && <p className="text-destructive px-6 pb-3 text-sm">{errors.avatar}</p>}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Personal details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="profile-name">{TEXT.form.name}</Label>
                            <Input
                                id="profile-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Your name"
                                autoComplete="name"
                            />
                            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="profile-email">{TEXT.form.email}</Label>
                            <Input
                                id="profile-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="size-4 animate-spin" />}
                                {saving ? TEXT.form.saving : TEXT.form.save}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
                                {TEXT.form.cancel}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
