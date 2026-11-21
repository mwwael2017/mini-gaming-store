'use client';

import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
  Wallet,
} from 'lucide-react';
import AuthModal from '@/components/auth-modal';
import { useStore } from '@/context/store-context';
import { supabase } from '@/lib/supabase';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function CustomerDashboardPage() {
  const { orders, hydrated } = useStore();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [revealedItems, setRevealedItems] = useState<
    Record<string, boolean>
  >({});
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    let active = true;

    async function loadUser(): Promise<void> {
      const { data } = await supabase.auth.getUser();

      if (active) {
        setUser(data.user);
        setCheckingAuth(false);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setCheckingAuth(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const customerOrders = useMemo(() => {
    const customerEmail = user?.email?.toLowerCase();

    if (!customerEmail) {
      return [];
    }

    return orders.filter(
      (order) =>
        order.customerEmail.toLowerCase() === customerEmail,
    );
  }, [orders, user]);

  const totalSpent = useMemo(
    () =>
      customerOrders.reduce(
        (total, order) => total + order.total,
        0,
      ),
    [customerOrders],
  );

  const completedDeliveries = useMemo(
    () =>
      customerOrders.filter(
        (order) => order.status === 'delivered',
      ).length,
    [customerOrders],
  );

  const activeTopUps = useMemo(
    () =>
      customerOrders.filter(
        (order) => order.status === 'processing',
      ).length,
    [customerOrders],
  );

  async function copyValue(
    value: string,
    key: string,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);

      window.setTimeout(() => {
        setCopiedKey('');
      }, 1600);
    } catch {
      setCopiedKey('');
    }
  }

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);

    try {
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setSigningOut(false);
    }
  }

  if (checkingAuth || !hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090D16]">
        <div className="flex flex-col items-center gap-4">
          <span className="size-10 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#6366F1]" />
          <p className="text-sm font-medium text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <>
        <main className="flex min-h-[80vh] items-center justify-center bg-[#090D16] px-4 py-12">
          <section className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-7 text-center shadow-2xl sm:p-9">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#6366F1]/10 text-[#818CF8]">
              <KeyRound className="size-8" aria-hidden="true" />
            </span>

            <h1
              style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              className="mt-6 text-2xl font-bold text-white"
            >
              Unlock Your Digital Vault
            </h1>

            <p className="mt-3 leading-7 text-slate-400">
              Sign in to access your delivered game keys, account
              credentials, purchase history, and active top-ups.
            </p>

            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 font-bold text-white shadow-[0_0_22px_rgba(99,102,241,0.3)] transition-colors hover:bg-[#4F46E5]"
            >
              <Sparkles className="size-5" aria-hidden="true" />
              Login / Sign Up
            </button>

            <Link
              href="/"
              className="mt-5 inline-flex text-sm font-semibold text-slate-500 transition-colors hover:text-white"
            >
              Return to Store
            </Link>
          </section>
        </main>

        <AuthModal
          isOpen={authOpen}
          initialMode="login"
          onClose={() => setAuthOpen(false)}
        />
      </>
    );
  }

  const gamertag =
    typeof user.user_metadata?.full_name === 'string' &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user.email?.split('@')[0] ?? 'NEXUS Gamer';

  return (
    <main className="min-h-screen bg-[#090D16] px-4 py-10 text-white sm:px-6 lg:py-14">
      <div className="mx-auto max-w-360">
        <section className="relative overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] p-6 sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 size-72 rounded-full bg-[#6366F1]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#6366F1] text-2xl font-extrabold uppercase shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                {gamertag.charAt(0)}
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    style={{
                      fontFamily: 'var(--font-plus-jakarta)',
                    }}
                    className="text-2xl font-bold sm:text-3xl"
                  >
                    {gamertag}
                  </h1>

                  <span className="rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-bold text-[#34D399]">
                    Verified Member
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 text-sm font-bold text-white transition-colors hover:bg-[#4F46E5]"
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                Browse Store
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#1F2937] bg-[#090D16] px-5 text-sm font-semibold text-slate-300 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOut ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
                ) : (
                  <LogOut className="size-4" aria-hidden="true" />
                )}
                Sign Out
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#818CF8]">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-5 text-sm text-slate-500">
              Total Spent
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              ${totalSpent.toFixed(2)}
            </p>
          </article>

          <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#34D399]">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-5 text-sm text-slate-500">
              Completed Deliveries
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {completedDeliveries}
            </p>
          </article>

          <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#FBBF24]">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-5 text-sm text-slate-500">
              Active Top-Ups
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {activeTopUps}
            </p>
          </article>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
              Digital Vault
            </p>
            <h2
              style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              className="mt-2 text-2xl font-bold sm:text-3xl"
            >
              Order History
            </h2>
          </div>

          {customerOrders.length === 0 ? (
            <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827] px-5 text-center">
              <ShoppingBag
                className="size-10 text-slate-600"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-lg font-bold">
                No matching orders yet
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Orders placed using {user.email} will appear in this
                Digital Vault.
              </p>
              <Link
                href="/"
                className="mt-6 rounded-lg bg-[#6366F1] px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#4F46E5]"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {customerOrders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]"
                >
                  <header className="flex flex-col gap-4 border-b border-[#1F2937] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Order
                        </p>
                        <p className="mt-1 font-bold tabular-nums">
                          {order.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Date
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Total
                        </p>
                        <p className="mt-1 font-bold tabular-nums">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                        order.status === 'delivered'
                          ? 'bg-[#10B981]/10 text-[#34D399]'
                          : 'bg-[#F59E0B]/10 text-[#FBBF24]'
                      }`}
                    >
                      {order.status === 'delivered' ? (
                        <Package className="size-3.5" />
                      ) : (
                        <Clock className="size-3.5 animate-pulse" />
                      )}
                      {order.status === 'delivered'
                        ? 'Delivered'
                        : 'Processing'}
                    </span>
                  </header>

                  <div className="divide-y divide-[#1F2937]">
                    {order.items.map((item) => {
                      const revealed =
                        revealedItems[item.id] ?? false;
                      const credentials =
                        item.accountCredentials;

                      const credentialFields = credentials
                        ? [
                            {
                              label: 'Username',
                              value: credentials.username,
                            },
                            {
                              label: 'Password',
                              value: credentials.password,
                            },
                            {
                              label: 'Email',
                              value: credentials.email,
                            },
                            {
                              label: 'Email Password',
                              value: credentials.emailPassword,
                            },
                            {
                              label: 'Recovery Code',
                              value: credentials.recoveryCode,
                            },
                          ].filter(
                            (
                              field,
                            ): field is {
                              label: string;
                              value: string;
                            } => Boolean(field.value),
                          )
                        : [];

                      return (
                        <div key={item.id} className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-bold">
                                {item.productName}
                              </h3>

                              <p className="mt-2 text-sm text-slate-500">
                                Quantity:{' '}
                                <span className="font-semibold text-slate-300">
                                  {item.quantity}
                                </span>
                              </p>

                              {item.playerId && (
                                <div className="mt-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-2">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-[#FBBF24]">
                                    Player ID
                                  </p>
                                  <p className="mt-1 break-all text-sm font-semibold">
                                    {item.playerId}
                                  </p>
                                </div>
                              )}
                            </div>

                            {(item.digitalCode || credentials) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedItems((current) => ({
                                    ...current,
                                    [item.id]: !revealed,
                                  }))
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#1F2937] bg-[#090D16] px-4 text-sm font-semibold text-slate-300 transition-colors hover:border-[#6366F1] hover:text-white"
                              >
                                {revealed ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                                {revealed ? 'Hide' : 'Reveal'}
                              </button>
                            )}
                          </div>

                          {item.digitalCode && (
                            <div className="mt-5 rounded-xl border border-[#1F2937] bg-[#090D16] p-4">
                              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <KeyRound className="size-4 text-[#10B981]" />
                                Digital Code
                              </p>

                              <div className="mt-3 flex items-center gap-2">
                                <code className="min-w-0 flex-1 break-all rounded-lg bg-[#111827] px-3 py-2.5 font-mono text-sm">
                                  {revealed
                                    ? item.digitalCode
                                    : '•••••-•••••-•••••'}
                                </code>

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyValue(
                                      item.digitalCode!,
                                      `code-${item.id}`,
                                    )
                                  }
                                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6366F1] transition-colors hover:bg-[#4F46E5]"
                                  aria-label="Copy digital code"
                                >
                                  {copiedKey ===
                                  `code-${item.id}` ? (
                                    <Check className="size-4" />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {credentials && (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              {credentialFields.map((field) => {
                                const fieldKey = `${item.id}-${field.label}`;

                                return (
                                  <div
                                    key={field.label}
                                    className="rounded-xl border border-[#1F2937] bg-[#090D16] p-4"
                                  >
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                      {field.label}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                      <code className="min-w-0 flex-1 break-all font-mono text-sm">
                                        {revealed
                                          ? field.value
                                          : '••••••••••••'}
                                      </code>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          copyValue(
                                            field.value,
                                            fieldKey,
                                          )
                                        }
                                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#1F2937] hover:text-white"
                                        aria-label={`Copy ${field.label}`}
                                      >
                                        {copiedKey === fieldKey ? (
                                          <Check className="size-4 text-[#10B981]" />
                                        ) : (
                                          <Copy className="size-4" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {order.status === 'processing' &&
                            !item.digitalCode &&
                            !credentials && (
                              <div className="mt-5 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
                                <p className="flex items-center gap-2 font-semibold text-[#FBBF24]">
                                  <Clock className="size-4 animate-pulse" />
                                  Top-Up Processing
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                  Your player information has been
                                  received. The order will update when
                                  delivery is complete.
                                </p>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}