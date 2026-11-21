'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { useStore } from '@/context/store-context';
import type { PaymentMethod } from '@/types/store';

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, and supported cards',
    icon: CreditCard,
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Pay securely using your PayPal account',
    icon: WalletCards,
  },
  {
    id: 'crypto',
    label: 'Cryptocurrency',
    description: 'Pay using supported digital currencies',
    icon: LockKeyhole,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartTotal,
    hydrated,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
  } = useStore();

  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card');
  const [emailError, setEmailError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError('');
    setCheckoutError('');

    const normalizedEmail = customerEmail.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Your cart is currently empty.');
      return;
    }

    setIsSubmitting(true);

    const order = placeOrder(normalizedEmail, paymentMethod);

    if (!order) {
      setCheckoutError(
        'We could not create your order. Please review your cart and try again.',
      );
      setIsSubmitting(false);
      return;
    }

    router.push(`/orders?order=${encodeURIComponent(order.id)}`);
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

  if (cart.length === 0) {
    return (
      <>
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-360 flex-col items-center justify-center px-4 text-center sm:px-6">
          <span className="flex size-20 items-center justify-center rounded-full bg-[#6366F1]/10 text-[#818CF8]">
            <ShoppingBag className="size-9" aria-hidden="true" />
          </span>

          <h1
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
            className="mt-6 text-3xl font-bold text-white"
          >
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md leading-7 text-slate-400">
            Explore our digital catalog and add gift cards, game keys,
            accounts, or top-ups to your cart.
          </p>

          <Link
            href="/#products"
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-[#6366F1] px-6 font-semibold text-white transition-colors hover:bg-[#4F46E5]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Continue Shopping
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-360 px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Continue Shopping
          </Link>

          <h1
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
            className="mt-5 text-3xl font-bold text-white sm:text-4xl"
          >
            Cart & Checkout
          </h1>

          <p className="mt-2 text-slate-400">
            Review your items and complete your secure digital order.
          </p>
        </div>

        <form
          onSubmit={handleCheckout}
          className="grid items-start gap-8 lg:grid-cols-[1fr_420px]"
        >
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]">
              <div className="flex items-center justify-between border-b border-[#1F2937] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Cart Items
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {cart.length} unique{' '}
                    {cart.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-[#1F2937]">
                {cart.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 p-5 sm:grid-cols-[112px_1fr_auto] sm:p-6"
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
                        className="line-clamp-2 font-bold text-white transition-colors hover:text-[#A5B4FC]"
                      >
                        {item.productName}
                      </Link>

                      {item.packageName && (
                        <p className="mt-2 text-sm text-slate-400">
                          Package:{' '}
                          <span className="font-semibold text-slate-300">
                            {item.packageName}
                          </span>
                        </p>
                      )}

                      {item.playerId && (
                        <div className="mt-3 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#F59E0B]">
                            Player ID / Riot ID
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold text-white">
                            {item.playerId}
                          </p>
                        </div>
                      )}

                      <span
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.deliveryType === 'instant'
                            ? 'bg-[#10B981]/10 text-[#34D399]'
                            : 'bg-[#F59E0B]/10 text-[#FBBF24]'
                        }`}
                      >
                        {item.deliveryType === 'instant'
                          ? 'Instant Delivery'
                          : 'Manual Delivery'}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="flex size-9 items-center justify-center rounded-lg border border-[#1F2937] text-slate-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.productName}`}
                        title="Remove item"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>

                      <div className="text-right">
                        <p className="font-bold tabular-nums text-white">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs tabular-nums text-slate-500">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex h-10 items-center rounded-lg border border-[#1F2937] bg-[#090D16]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          className="flex h-full w-9 items-center justify-center text-slate-400 transition-colors hover:text-white"
                          aria-label={`Decrease ${item.productName} quantity`}
                        >
                          <Minus
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </button>

                        <span className="w-9 text-center text-sm font-semibold tabular-nums text-white">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                          className="flex h-full w-9 items-center justify-center text-slate-400 transition-colors hover:text-white"
                          aria-label={`Increase ${item.productName} quantity`}
                        >
                          <Plus
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#818CF8]">
                  <CreditCard className="size-5" aria-hidden="true" />
                </span>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    Checkout Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enter your delivery email and payment method.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="customer-email"
                  className="text-sm font-semibold text-white"
                >
                  Customer Email
                  <span className="ml-1 text-red-400">*</span>
                </label>

                <input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(event) => {
                    setCustomerEmail(event.target.value);
                    setEmailError('');
                    setCheckoutError('');
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`mt-3 h-12 w-full rounded-lg border bg-[#090D16] px-4 text-white outline-none transition-colors placeholder:text-slate-600 ${
                    emailError
                      ? 'border-red-500'
                      : 'border-[#1F2937] focus:border-[#6366F1]'
                  }`}
                />

                {emailError ? (
                  <p className="mt-2 text-sm text-red-400">
                    {emailError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Your receipt and order information will be connected
                    to this email address.
                  </p>
                )}
              </div>

              <fieldset className="mt-7">
                <legend className="text-sm font-semibold text-white">
                  Payment Method
                </legend>

                <div className="mt-3 grid gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const selected = paymentMethod === method.id;

                    return (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                          selected
                            ? 'border-[#6366F1] bg-[#6366F1]/10'
                            : 'border-[#1F2937] bg-[#090D16] hover:border-[#374151]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.id}
                          checked={selected}
                          onChange={() =>
                            setPaymentMethod(method.id)
                          }
                          className="sr-only"
                        />

                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? 'bg-[#6366F1] text-white'
                              : 'bg-[#111827] text-slate-400'
                          }`}
                        >
                          <Icon
                            className="size-5"
                            aria-hidden="true"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-white">
                            {method.label}
                          </span>
                          <span className="mt-1 block text-sm text-slate-500">
                            {method.description}
                          </span>
                        </span>

                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? 'border-[#6366F1] bg-[#6366F1]'
                              : 'border-slate-600'
                          }`}
                        >
                          {selected && (
                            <CheckCircle2
                              className="size-3.5 text-white"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          </div>

          <aside className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-white">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 border-b border-[#1F2937] pb-6">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold tabular-nums text-white">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Delivery</span>
                <span className="font-semibold text-[#10B981]">
                  Free
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Service Fee</span>
                <span className="font-semibold tabular-nums text-white">
                  $0.00
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <div>
                <p className="font-semibold text-white">Total</p>
                <p className="mt-1 text-xs text-slate-500">
                  All prices are in USD
                </p>
              </div>

              <p className="text-3xl font-bold tabular-nums text-white">
                ${cartTotal.toFixed(2)}
              </p>
            </div>

            {checkoutError && (
              <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
                {checkoutError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-6 font-bold text-white shadow-[0_0_24px_rgba(99,102,241,0.3)] transition-colors hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing Order...
                </>
              ) : (
                <>
                  <LockKeyhole
                    className="size-5"
                    aria-hidden="true"
                  />
                  Complete Order
                </>
              )}
            </button>

            <div className="mt-5 space-y-3 rounded-xl border border-[#1F2937] bg-[#090D16] p-4">
              <p className="flex items-start gap-3 text-xs leading-5 text-slate-400">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                Your checkout information is protected and stored
                locally for this MVP.
              </p>

              <p className="flex items-start gap-3 text-xs leading-5 text-slate-400">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#818CF8]" />
                Instant products appear in your Digital Vault after
                checkout.
              </p>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </>
  );
}