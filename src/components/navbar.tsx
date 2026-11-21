'use client';

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gamepad2,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  ShoppingCart,
} from 'lucide-react';
import AuthModal from '@/components/auth-modal';
import { useStore } from '@/context/store-context';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'signup';

export function Navbar() {
  const { cartCount } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] =
    useState<AuthMode>('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser(): Promise<void> {
      const { data } = await supabase.auth.getUser();

      if (active) {
        setUser(data.user);
        setAuthLoading(false);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const query = new URLSearchParams(
      window.location.search,
    ).get('q');

    setSearchQuery(query ?? '');
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  function openAuthModal(mode: AuthMode): void {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const query = searchQuery.trim();

    router.push(
      query ? `/?q=${encodeURIComponent(query)}` : '/',
    );
  }

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);

    try {
      await supabase.auth.signOut();
      setUser(null);

      if (pathname?.startsWith('/dashboard')) {
        router.push('/');
        router.refresh();
      }
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#1F2937] bg-[#090D16]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-360 items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="NEXUS STORE home"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.35)]">
              <Gamepad2
                className="size-6 text-white"
                aria-hidden="true"
              />
            </span>

            <span className="hidden whitespace-nowrap font-bold tracking-tight text-white sm:block">
              NEXUS STORE
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden w-full max-w-2xl items-center rounded-lg border border-[#1F2937] bg-[#111827] transition-colors focus-within:border-[#6366F1] md:flex"
            role="search"
          >
            <Search
              className="ml-4 size-5 shrink-0 text-slate-500"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search gift cards, game keys, accounts, top-ups..."
              className="h-11 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500"
              aria-label="Search products"
            />
          </form>

          <nav
            className="flex shrink-0 items-center gap-1 sm:gap-2"
            aria-label="Customer navigation"
          >
            <Link
              href="/orders"
              className={`relative hidden h-10 items-center rounded-lg px-3 text-sm font-semibold transition-colors sm:flex ${
                pathname === '/orders'
                  ? 'bg-[#6366F1]/10 text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#6366F1]'
                  : 'text-slate-400 hover:bg-[#111827] hover:text-white'
              }`}
            >
              My Orders
            </Link>

            <Link
              href="/checkout"
              className={`relative flex size-10 items-center justify-center rounded-lg transition-colors ${
                pathname === '/checkout'
                  ? 'bg-[#6366F1]/15 text-white'
                  : 'text-slate-400 hover:bg-[#111827] hover:text-white'
              }`}
              aria-label={`Shopping cart with ${cartCount} items`}
              title="Shopping Cart"
            >
              <ShoppingCart
                className="size-5"
                aria-hidden="true"
              />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366F1] px-1 text-[10px] font-bold tabular-nums text-white shadow-[0_0_12px_rgba(99,102,241,0.65)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {!authLoading && !user && (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="hidden h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#111827] hover:text-white sm:inline-flex"
                >
                  <LogIn
                    className="size-4"
                    aria-hidden="true"
                  />
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#6366F1] px-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(99,102,241,0.25)] transition-colors hover:bg-[#4F46E5] sm:px-4"
                >
                  Sign Up
                </button>
              </>
            )}

            {!authLoading && user && (
              <>
                <Link
                  href="/dashboard"
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                    pathname?.startsWith('/dashboard')
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-[#6366F1]/10 text-[#C7D2FE] hover:bg-[#6366F1]/20'
                  }`}
                >
                  <LayoutDashboard
                    className="size-4"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">
                    Dashboard
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex size-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  {signingOut ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
                  ) : (
                    <LogOut
                      className="size-5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </>
            )}

            {authLoading && (
              <span className="size-7 animate-spin rounded-full border-2 border-[#1F2937] border-t-[#6366F1]" />
            )}
          </nav>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-4 mb-3 flex items-center rounded-lg border border-[#1F2937] bg-[#111827] transition-colors focus-within:border-[#6366F1] sm:mx-6 md:hidden"
          role="search"
        >
          <Search
            className="ml-3 size-4 shrink-0 text-slate-500"
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search products..."
            className="h-10 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500"
            aria-label="Search products"
          />
        </form>
      </header>

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}

export default Navbar;