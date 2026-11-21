'use client';

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Gamepad2,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface AuthenticationResponse {
  authenticated?: boolean;
  error?: string;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locking, setLocking] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function checkAuthentication(): Promise<void> {
      try {
        const response = await fetch('/api/admin-login', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        const data =
          (await response.json()) as AuthenticationResponse;

        if (active) {
          setAuthenticated(
            response.ok && data.authenticated === true,
          );
        }
      } catch {
        if (active) {
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError('Enter your admin username and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password,
        }),
      });

      const data =
        (await response.json()) as AuthenticationResponse;

      if (!response.ok || data.authenticated !== true) {
        setError(
          data.error ??
            'Invalid admin username or password.',
        );
        return;
      }

      setAuthenticated(true);
      setUsername('');
      setPassword('');
      setError('');
    } catch {
      setError(
        'Unable to contact the admin authentication service.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLockAdmin(): Promise<void> {
    setLocking(true);

    try {
      await fetch('/api/admin-login', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } finally {
      setAuthenticated(false);
      setUsername('');
      setPassword('');
      setError('');
      setLocking(false);
    }
  }

  return (
    <>
      <div
        className={
          authenticated
            ? 'contents'
            : 'pointer-events-none invisible fixed inset-0 overflow-hidden'
        }
        aria-hidden={!authenticated}
      >
        {children}
      </div>

      {checkingAuth && (
        <main className="fixed inset-0 z-100 flex min-h-screen items-center justify-center bg-[#090D16] px-4">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#6366F1] shadow-[0_0_28px_rgba(99,102,241,0.35)]">
              <Gamepad2
                className="size-7 text-white"
                aria-hidden="true"
              />
            </span>

            <div className="mt-6 size-9 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#6366F1]" />

            <p className="mt-4 text-sm font-medium text-slate-400">
              Verifying admin access...
            </p>
          </div>
        </main>
      )}

      {!checkingAuth && !authenticated && (
        <main className="fixed inset-0 z-100 flex min-h-screen items-center justify-center overflow-y-auto bg-[#090D16] px-4 py-10">
          <div className="pointer-events-none absolute left-1/2 top-1/3 size-96 -translate-x-1/2 rounded-full bg-[#6366F1]/10 blur-3xl" />

          <section className="relative w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl sm:p-8">
            <header className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#6366F1] shadow-[0_0_24px_rgba(99,102,241,0.4)]">
                <Gamepad2
                  className="size-7 text-white"
                  aria-hidden="true"
                />
              </span>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <h1
                  style={{
                    fontFamily:
                      'var(--font-plus-jakarta)',
                  }}
                  className="text-2xl font-extrabold tracking-tight text-white"
                >
                  NEXUS ADMIN
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                  <ShieldAlert
                    className="size-3"
                    aria-hidden="true"
                  />
                  Restricted Control Center
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter the dedicated administrator credentials
                to access store management.
              </p>
            </header>

            <form
              onSubmit={handleLogin}
              className="mt-7 space-y-5"
            >
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="admin-username"
                  className="text-sm font-semibold text-white"
                >
                  Admin Username
                </label>

                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError('');
                  }}
                  autoComplete="username"
                  placeholder="Enter admin username"
                  disabled={submitting}
                  required
                  className="mt-2 h-12 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#6366F1] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="text-sm font-semibold text-white"
                >
                  Admin Password
                </label>

                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  disabled={submitting}
                  required
                  className="mt-2 h-12 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#6366F1] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 font-bold text-white shadow-[0_0_22px_rgba(99,102,241,0.3)] transition-colors hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock
                      className="size-5"
                      aria-hidden="true"
                    />
                    Unlock Admin Panel
                  </>
                )}
              </button>
            </form>

            <footer className="mt-7 border-t border-[#1F2937] pt-5 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeft
                  className="size-4"
                  aria-hidden="true"
                />
                Return to Storefront
              </Link>
            </footer>
          </section>
        </main>
      )}

      {!checkingAuth && authenticated && (
        <button
          type="button"
          onClick={handleLockAdmin}
          disabled={locking}
          className="fixed bottom-5 right-5 z-100 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#1F2937] bg-[#111827]/95 px-4 text-sm font-bold text-white shadow-2xl backdrop-blur-md transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          title="Lock Admin"
          aria-label="Lock Admin"
        >
          {locking ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <LogOut
              className="size-4"
              aria-hidden="true"
            />
          )}

          Lock Admin
        </button>
      )}
    </>
  );
}