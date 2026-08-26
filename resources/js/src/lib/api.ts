/**
 * Thin fetch wrapper for the Laravel API. Auth is cookie based (Sanctum
 * stateful), so every request sends credentials and mutating requests carry the
 * XSRF token Laravel set on the session.
 */

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        /** Laravel validation errors, keyed by field. */
        public readonly errors: Record<string, string[]> = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

function readCookie(name: string): string | undefined {
    return document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${name}=`))
        ?.split('=')[1];
}

let csrfReady = false;

/** Laravel issues the XSRF cookie from this endpoint; only needed once. */
async function ensureCsrfCookie(): Promise<void> {
    if (csrfReady || readCookie('XSRF-TOKEN')) {
        csrfReady = true;
        return;
    }
    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    csrfReady = true;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (method !== 'GET') {
        await ensureCsrfCookie();
    }

    const token = readCookie('XSRF-TOKEN');
    const response = await fetch(`/api${path}`, {
        method,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = response.status === 0 ? null : await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, payload?.message ?? response.statusText, payload?.errors ?? {});
    }

    return payload as T;
}

/** Unwraps the `data` envelope Laravel API Resources add. */
async function unwrap<T>(method: string, path: string, body?: unknown): Promise<T> {
    const payload = await request<{ data: T }>(method, path, body);
    return payload?.data as T;
}

export const api = {
    get: <T>(path: string) => unwrap<T>('GET', path),
    post: <T>(path: string, body?: unknown) => unwrap<T>('POST', path, body),
    put: <T>(path: string, body?: unknown) => unwrap<T>('PUT', path, body),
    patch: <T>(path: string, body?: unknown) => unwrap<T>('PATCH', path, body),
    delete: (path: string) => request<void>('DELETE', path),
};
