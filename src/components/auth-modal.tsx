'use client';

import {
  useEffect,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Gamepad2,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

export function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMode(initialMode);
    setFullName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setSubmitting(false);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFullName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget && !submitting) {
      onClose();
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (mode === 'signup' && !normalizedName) {
      setError('Please enter your gamertag or full name.');
      return;
    }

    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: normalizedName,
              },
            },
          });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (!data.session) {
          setSuccess(
            'Account created. Check your email to confirm your account.',
          );

          window.setTimeout(() => {
            onClose();
          }, 1800);

          return;
        }

        onClose();
        return;
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      onClose();
    } catch {
      setError(
        'Unable to connect to the authentication service. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onMouseDown={handleBackdropClick}
    >
      <section className="relative w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1F2937] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close authentication modal"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <header className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#6366F1] shadow-[0_0_24px_rgba(99,102,241,0.4)]">
            <Gamepad2
              className="size-7 text-white"
              aria-hidden="true"
            />
          </span>

          <h2
            id="auth-modal-title"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
            className="mt-5 text-2xl font-extrabold tracking-tight text-white"
          >
            NEXUS STORE
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {mode === 'login'
              ? 'Welcome back to your gaming dashboard.'
              : 'Create your customer account and start gaming.'}
          </p>
        </header>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-[#1F2937] bg-[#090D16] p-1">
          <button
            type="button"
            onClick={() => changeMode('login')}
            disabled={submitting}
            className={`h-10 rounded-lg text-sm font-bold transition-colors ${
              mode === 'login'
                ? 'bg-[#6366F1] text-white'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => changeMode('signup')}
            disabled={submitting}
            className={`h-10 rounded-lg text-sm font-bold transition-colors ${
              mode === 'signup'
                ? 'bg-[#6366F1] text-white'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-[#10B981]/25 bg-[#10B981]/10 px-4 py-3 text-sm text-[#34D399]"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{success}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label
                htmlFor="customer-name"
                className="text-sm font-semibold text-white"
              >
                Gamertag / Full Name
              </label>

              <div className="mt-2 flex items-center rounded-lg border border-[#1F2937] bg-[#090D16] transition-colors focus-within:border-[#6366F1]">
                <User
                  className="ml-4 size-5 shrink-0 text-slate-500"
                  aria-hidden="true"
                />

                <input
                  id="customer-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setError('');
                  }}
                  autoComplete="name"
                  placeholder="Enter your gamertag or name"
                  disabled={submitting}
                  className="h-12 w-full bg-transparent px-3 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="customer-email"
              className="text-sm font-semibold text-white"
            >
              Email
            </label>

            <div className="mt-2 flex items-center rounded-lg border border-[#1F2937] bg-[#090D16] transition-colors focus-within:border-[#6366F1]">
              <Mail
                className="ml-4 size-5 shrink-0 text-slate-500"
                aria-hidden="true"
              />

              <input
                id="customer-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                autoComplete="email"
                placeholder="you@example.com"
                disabled={submitting}
                className="h-12 w-full bg-transparent px-3 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="customer-password"
              className="text-sm font-semibold text-white"
            >
              Password
            </label>

            <div className="mt-2 flex items-center rounded-lg border border-[#1F2937] bg-[#090D16] transition-colors focus-within:border-[#6366F1]">
              <Lock
                className="ml-4 size-5 shrink-0 text-slate-500"
                aria-hidden="true"
              />

              <input
                id="customer-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                placeholder="Minimum 6 characters"
                minLength={6}
                disabled={submitting}
                className="h-12 w-full bg-transparent px-3 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || Boolean(success)}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 font-bold text-white shadow-[0_0_22px_rgba(99,102,241,0.3)] transition-colors hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {mode === 'login'
                  ? 'Logging in...'
                  : 'Creating account...'}
              </>
            ) : mode === 'login' ? (
              'Login to NEXUS'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AuthModal;