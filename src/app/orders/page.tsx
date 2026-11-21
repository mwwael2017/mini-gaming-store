'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  Gamepad2,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  ShoppingBag,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { useStore } from '@/context/store-context';
import type { AccountCredentials } from '@/types/store';

type OrderFilter = 'all' | 'delivered' | 'processing';

interface CredentialsModalData {
  productName: string;
  credentials: AccountCredentials;
}

interface CredentialsModalProps {
  data: CredentialsModalData;
  copiedValue: string;
  onClose: () => void;
  onCopy: (value: string, key: string) => Promise<void>;
}

const filters: { label: string; value: OrderFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'delivered' },
  { label: 'In Progress', value: 'processing' },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function CredentialsModal({
  data,
  copiedValue,
  onClose,
  onCopy,
}: CredentialsModalProps) {
  const [showPasswords, setShowPasswords] = useState(false);
  const { credentials } = data;

  const fields = [
    {
      label: 'Username',
      value: credentials.username,
      secret: false,
    },
    {
      label: 'Password',
      value: credentials.password,
      secret: true,
    },
    {
      label: 'Email',
      value: credentials.email,
      secret: false,
    },
    {
      label: 'Email Password',
      value: credentials.emailPassword,
      secret: true,
    },
    {
      label: 'Recovery Code',
      value: credentials.recoveryCode,
      secret: true,
    },
  ].filter(
    (
      field,
    ): field is {
      label: string;
      value: string;
      secret: boolean;
    } => Boolean(field.value),
  );

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#05070D]/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credentials-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#1F2937] p-5 sm:p-6">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#818CF8]">
              <UserRound className="size-5" aria-hidden="true" />
            </span>

            <div>
              <h2
                id="credentials-title"
                className="font-bold text-white"
              >
                Account Credentials
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {data.productName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1F2937] hover:text-white"
            aria-label="Close credentials"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          {fields.map((field) => {
            const copyKey = `credential-${field.label}`;

            return (
              <div key={field.label}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {field.label}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded-lg border border-[#1F2937] bg-[#090D16] px-3 py-2.5 font-mono text-sm text-white">
                    {field.secret && !showPasswords
                      ? '••••••••••••'
                      : field.value}
                  </code>

                  <button
                    type="button"
                    onClick={() => onCopy(field.value, copyKey)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#1F2937] text-slate-400 transition-colors hover:border-[#6366F1] hover:text-white"
                    aria-label={`Copy ${field.label}`}
                  >
                    {copiedValue === copyKey ? (
                      <Check
                        className="size-4 text-[#10B981]"
                        aria-hidden="true"
                      />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setShowPasswords((current) => !current)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A5B4FC] transition-colors hover:text-white"
          >
            {showPasswords ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}

            {showPasswords
              ? 'Hide sensitive details'
              : 'Reveal sensitive details'}
          </button>

          {credentials.additionalNotes && (
            <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FBBF24]">
                Security Note
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {credentials.additionalNotes}
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-[#1F2937] px-5 py-4 text-xs text-slate-500 sm:px-6">
          <Zap
            className="size-4 text-[#10B981]"
            aria-hidden="true"
          />
          Store these credentials securely and update them after your
          first login.
        </footer>
      </div>
    </div>
  );
}

function OrdersContent() {
  const { orders, hydrated } = useStore();
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('order');

  const [activeFilter, setActiveFilter] =
    useState<OrderFilter>('all');
  const [revealedCodes, setRevealedCodes] = useState<
    Record<string, boolean>
  >({});
  const [copiedValue, setCopiedValue] = useState('');
  const [credentialsModal, setCredentialsModal] =
    useState<CredentialsModalData | null>(null);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders;
    }

    return orders.filter(
      (order) => order.status === activeFilter,
    );
  }, [activeFilter, orders]);

  const copyValue = async (
    value: string,
    key: string,
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(key);

      window.setTimeout(() => {
        setCopiedValue('');
      }, 1600);
    } catch {
      setCopiedValue('');
    }
  };

  if (!hydrated) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#6366F1]" />
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-[70vh] max-w-360 px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
              Digital Vault
            </p>

            <h1
              style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              className="mt-2 text-3xl font-bold text-white sm:text-4xl"
            >
              My Orders
            </h1>

            <p className="mt-2 max-w-xl text-slate-400">
              Track top-ups and securely access your delivered codes
              and account credentials.
            </p>
          </div>

          <Link
            href="/#products"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 font-semibold text-white transition-colors hover:bg-[#4F46E5]"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-[#1F2937]">
          {filters.map((filter) => {
            const count =
              filter.value === 'all'
                ? orders.length
                : orders.filter(
                    (order) => order.status === filter.value,
                  ).length;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  activeFilter === filter.value
                    ? 'text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#6366F1]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {filter.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                    activeFilter === filter.value
                      ? 'bg-[#6366F1]/20 text-[#A5B4FC]'
                      : 'bg-[#111827] text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="mt-8 flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827] px-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#6366F1]/10 text-[#818CF8]">
              <Gamepad2 className="size-8" aria-hidden="true" />
            </span>

            <h2 className="mt-5 text-xl font-bold text-white">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are no orders matching this filter yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {filteredOrders.map((order) => {
              const isDelivered = order.status === 'delivered';
              const isHighlighted =
                highlightedOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className={`overflow-hidden rounded-2xl border bg-[#111827] ${
                    isHighlighted
                      ? 'border-[#6366F1] shadow-[0_0_28px_rgba(99,102,241,0.16)]'
                      : 'border-[#1F2937]'
                  }`}
                >
                  <header className="flex flex-col gap-4 border-b border-[#1F2937] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Order ID
                        </p>
                        <p className="mt-1 font-bold tabular-nums text-white">
                          {order.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Order Date
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Total
                        </p>
                        <p className="mt-1 font-bold tabular-nums text-white">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isDelivered
                          ? 'bg-[#10B981]/10 text-[#34D399]'
                          : 'bg-[#F59E0B]/10 text-[#FBBF24]'
                      }`}
                    >
                      {isDelivered ? (
                        <PackageCheck
                          className="size-4"
                          aria-hidden="true"
                        />
                      ) : (
                        <Clock3
                          className="size-4 animate-pulse"
                          aria-hidden="true"
                        />
                      )}

                      {isDelivered ? 'Delivered' : 'Processing'}
                    </span>
                  </header>

                  <div className="divide-y divide-[#1F2937]">
                    {order.items.map((item) => {
                      const itemDelivered =
                        item.status === 'delivered';
                      const codeVisible =
                        revealedCodes[item.id] ?? false;

                      return (
                        <div
                          key={item.id}
                          className="grid gap-5 p-5 sm:grid-cols-[96px_1fr] sm:p-6 lg:grid-cols-[96px_1fr_auto]"
                        >
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="aspect-square overflow-hidden rounded-xl border border-[#1F2937] bg-[#090D16]"
                          >
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="size-full object-cover"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="font-bold text-white transition-colors hover:text-[#A5B4FC]"
                            >
                              {item.productName}
                            </Link>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                              <span>
                                Quantity:{' '}
                                <strong className="text-slate-300">
                                  {item.quantity}
                                </strong>
                              </span>

                              {item.packageName && (
                                <span>
                                  Package:{' '}
                                  <strong className="text-slate-300">
                                    {item.packageName}
                                  </strong>
                                </span>
                              )}

                              <span className="tabular-nums">
                                ${item.totalPrice.toFixed(2)}
                              </span>
                            </div>

                            {item.playerId && (
                              <div className="mt-4 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#FBBF24]">
                                  Player ID / Riot ID
                                </p>

                                <p className="mt-1 break-all text-sm font-semibold text-white">
                                  {item.playerId}
                                </p>
                              </div>
                            )}

                            {!itemDelivered &&
                              item.deliveryType === 'manual' && (
                                <div className="mt-4 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
                                  <div className="flex items-start gap-3">
                                    <Clock3
                                      className="mt-0.5 size-5 shrink-0 animate-pulse text-[#F59E0B]"
                                      aria-hidden="true"
                                    />

                                    <div>
                                      <p className="font-semibold text-white">
                                        Top-Up Processing
                                      </p>

                                      <p className="mt-1 text-sm leading-6 text-slate-400">
                                        Your player information has
                                        been received. The store team
                                        is processing your top-up.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
                                    <div className="h-full w-2/3 animate-pulse rounded-full bg-[#F59E0B]" />
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex items-end lg:min-w-72 lg:justify-end">
                            {item.digitalCode && itemDelivered && (
                              <div className="w-full rounded-xl border border-[#1F2937] bg-[#090D16] p-4 lg:w-72">
                                <div className="flex items-center justify-between">
                                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <KeyRound
                                      className="size-4 text-[#10B981]"
                                      aria-hidden="true"
                                    />
                                    Digital Code
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedCodes((current) => ({
                                        ...current,
                                        [item.id]: !codeVisible,
                                      }))
                                    }
                                    className="text-slate-500 transition-colors hover:text-white"
                                    aria-label={
                                      codeVisible
                                        ? 'Hide digital code'
                                        : 'Reveal digital code'
                                    }
                                  >
                                    {codeVisible ? (
                                      <EyeOff className="size-4" />
                                    ) : (
                                      <Eye className="size-4" />
                                    )}
                                  </button>
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                  <code className="min-w-0 flex-1 truncate rounded-lg bg-[#111827] px-3 py-2 font-mono text-sm text-white">
                                    {codeVisible
                                      ? item.digitalCode
                                      : '•••••-•••••-•••••'}
                                  </code>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyValue(
                                        item.digitalCode!,
                                        item.id,
                                      )
                                    }
                                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#6366F1] text-white transition-colors hover:bg-[#4F46E5]"
                                    aria-label="Copy digital code"
                                  >
                                    {copiedValue === item.id ? (
                                      <Check className="size-4" />
                                    ) : (
                                      <Copy className="size-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {item.accountCredentials &&
                              itemDelivered && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCredentialsModal({
                                      productName:
                                        item.productName,
                                      credentials:
                                        item.accountCredentials!,
                                    })
                                  }
                                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 font-semibold text-white transition-colors hover:bg-[#4F46E5] lg:w-auto"
                                >
                                  <LockKeyhole
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                  View Credentials
                                </button>
                              )}

                            {itemDelivered &&
                              !item.digitalCode &&
                              !item.accountCredentials && (
                                <span className="inline-flex items-center gap-2 rounded-lg bg-[#10B981]/10 px-4 py-2 text-sm font-semibold text-[#34D399]">
                                  <PackageCheck
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                  Delivered
                                </span>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <footer className="flex flex-col gap-2 border-t border-[#1F2937] bg-[#090D16]/40 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <span>{order.customerEmail}</span>

                    <span className="capitalize">
                      Paid with {order.paymentMethod}
                    </span>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {credentialsModal !== null && (
        <CredentialsModal
          data={credentialsModal}
          copiedValue={copiedValue}
          onClose={() => setCredentialsModal(null)}
          onCopy={copyValue}
        />
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#090D16]">
          <div className="size-10 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#6366F1]" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}