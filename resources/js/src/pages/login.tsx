import { Loader2, Scale, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { BRAND, LOGIN_TEXT } from '~/constants/menuData';
import { useAuthStore } from '~/hooks/use-auth';
import { ApiError } from '~/lib/api';

interface LoginValues {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login() {
    const status = useAuthStore((state) => state.status);
    const signIn = useAuthStore((state) => state.signIn);
    const navigate = useNavigate();
    const location = useLocation();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({ defaultValues: { email: '', password: '', remember: false } });

    if (status === 'authenticated') {
        return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/'} replace />;
    }

    const onSubmit = async (values: LoginValues) => {
        setFormError(null);
        try {
            await signIn(values.email, values.password, values.remember);
            navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true });
        } catch (error) {
            setFormError(error instanceof ApiError ? (error.errors.email?.[0] ?? error.message) : LOGIN_TEXT.errors.generic);
        }
    };

    return (
        <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
            {/* Brand panel — mirrors the split sign-in layout used across the admin suite. */}
            <aside className="from-primary hidden flex-col justify-between bg-gradient-to-br to-slate-900 p-10 text-white lg:flex">
                <div className="flex items-center gap-3">
                    <Scale className="size-8" />
                    <span className="text-lg font-semibold tracking-tight">{BRAND.name}</span>
                </div>

                <div className="space-y-4">
                    <h1 className="max-w-md text-3xl font-semibold tracking-tight">{LOGIN_TEXT.aside.headline}</h1>
                    <p className="max-w-md text-sm text-white/80">{LOGIN_TEXT.aside.body}</p>
                </div>

                <p className="flex items-center gap-2 text-xs text-white/70">
                    <ShieldCheck className="size-4" /> {LOGIN_TEXT.aside.confidentiality}
                </p>
            </aside>

            <main className="flex items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-semibold tracking-tight">{LOGIN_TEXT.title}</h2>
                        <p className="text-muted-foreground text-sm">{LOGIN_TEXT.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="email">{LOGIN_TEXT.emailLabel}</Label>
                            <Input id="email" type="email" autoComplete="username" autoFocus {...register('email', {
                                    required: LOGIN_TEXT.errors.emailRequired,
                                    pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: LOGIN_TEXT.errors.emailInvalid },
                                })} />
                            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{LOGIN_TEXT.passwordLabel}</Label>
                            <Input id="password" type="password" autoComplete="current-password" {...register('password', { required: LOGIN_TEXT.errors.passwordRequired })} />
                            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={watch('remember') ?? false}
                                onCheckedChange={(checked) => setValue('remember', checked === true)}
                            />
                            <Label htmlFor="remember" className="text-muted-foreground text-sm font-normal">
                                {LOGIN_TEXT.rememberLabel}
                            </Label>
                        </div>

                        {formError && (
                            <p role="alert" className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                                {formError}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                            {LOGIN_TEXT.submit}
                        </Button>
                    </form>

                    <div className="bg-muted/50 text-muted-foreground rounded-lg border p-3 text-xs">
                        <p className="text-foreground font-medium">{LOGIN_TEXT.demo.heading}</p>
                        <ul className="mt-1 space-y-0.5">
                            {LOGIN_TEXT.demo.accounts.map((account) => (
                                <li key={account.email}>
                                    <span className="font-mono">{account.email}</span> — {account.label}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-1">{LOGIN_TEXT.demo.password}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
