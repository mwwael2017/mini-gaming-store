'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Gamepad2,
  Gift,
  KeyRound,
  SearchX,
  ShieldCheck,
  ShoppingCart,
  Star,
  UserRound,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useStore } from '@/context/store-context';
import type { ProductCategory } from '@/types/store';

const categories: {
  label: string;
  value: ProductCategory;
  description: string;
  icon: typeof Gift;
  color: string;
}[] = [
  {
    label: 'Gift Cards',
    value: 'gift-cards',
    description: 'Steam, PlayStation, Xbox and more',
    icon: Gift,
    color: 'bg-pink-400/10 text-pink-400',
  },
  {
    label: 'Game Keys',
    value: 'game-keys',
    description: 'Popular PC and console titles',
    icon: KeyRound,
    color: 'bg-[#6366F1]/10 text-[#6366F1]',
  },
  {
    label: 'Gaming Accounts',
    value: 'accounts',
    description: 'Valorant and Rocket League accounts',
    icon: UserRound,
    color: 'bg-[#10B981]/10 text-[#10B981]',
  },
  {
    label: 'Game Top-Ups',
    value: 'top-ups',
    description: 'Valorant Points and Call of Duty CP',
    icon: CircleDollarSign,
    color: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  },
];

const reviews = [
  {
    name: 'Alex Morgan',
    product: 'Steam Gift Card',
    review:
      'The code arrived immediately after checkout and worked without any issues.',
  },
  {
    name: 'Jordan Lee',
    product: 'Valorant Account',
    review:
      'Account details were clear, secure, and available instantly in my vault.',
  },
  {
    name: 'Sam Wilson',
    product: 'Valorant Points',
    review:
      'The order tracking was easy to follow and my top-up was delivered quickly.',
  },
];

const faqs = [
  {
    question: 'How are digital products delivered?',
    answer:
      'Instant products are added to your Digital Vault after checkout. Manual top-ups remain in progress until the store team completes delivery.',
  },
  {
    question: 'Where can I find my codes and account credentials?',
    answer:
      'Open My Orders from the navigation bar. Delivered gift cards and game keys include a revealable code, while accounts include a secure credentials panel.',
  },
  {
    question: 'What information is required for game top-ups?',
    answer:
      'Valorant Points require your Riot ID, while Call of Duty CP requires your Activision ID. Always verify the ID before placing your order.',
  },
  {
    question: 'Can I track a manual top-up?',
    answer:
      'Yes. Manual orders appear as Processing in My Orders and change to Delivered when completed by the store team.',
  },
];

const categoryLabels: Record<ProductCategory, string> = {
  'gift-cards': 'Gift Card',
  'game-keys': 'Game Key',
  accounts: 'Account',
  'top-ups': 'Top-Up',
};

function HomeContent() {
  const { products } = useStore();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get('category');
  const validCategory = categories.some(
    (category) => category.value === categoryParam,
  )
    ? (categoryParam as ProductCategory)
    : 'all';

  const [activeCategory, setActiveCategory] = useState<
    ProductCategory | 'all'
  >(validCategory);
  const [sortBy, setSortBy] = useState('featured');

  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' ||
        product.category === activeCategory;

      const searchableText = [
        product.name,
        product.shortDescription,
        product.game,
        product.platform,
        product.publisher,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        matchesCategory &&
        (!query || searchableText.includes(query))
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }

      if (sortBy === 'price-high') {
        return b.price - a.price;
      }

      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }

      if (sortBy === 'newest') {
        return b.id.localeCompare(a.id);
      }

      return Number(b.featured) - Number(a.featured);
    });
  }, [activeCategory, products, query, sortBy]);

  const selectCategory = (category: ProductCategory) => {
    setActiveCategory(category);

    window.setTimeout(() => {
      document
        .getElementById('products')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <>
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-[#1F2937]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(99,102,241,0.22),transparent_35%)]" />

          <div className="relative mx-auto grid min-h-145 max-w-360 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 px-3 py-1.5 text-sm font-semibold text-[#A5B4FC]">
                <Zap className="size-4" aria-hidden="true" />
                Instant access to your next adventure
              </span>

              <h1
                style={{
                  fontFamily: 'var(--font-plus-jakarta)',
                }}
                className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
              >
                Your ultimate destination for{' '}
                <span className="text-[#818CF8]">
                  digital gaming
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                Shop trusted gift cards, game keys, gaming accounts,
                and convenient top-ups from one secure marketplace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-6 font-semibold text-white shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-colors hover:bg-[#4F46E5]"
                >
                  <ShoppingCart
                    className="size-5"
                    aria-hidden="true"
                  />
                  Shop Now
                </a>

                <Link
                  href="/orders"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] px-6 font-semibold text-white transition-colors hover:border-[#6366F1]"
                >
                  View My Orders
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <ShieldCheck
                    className="size-4 text-[#10B981]"
                    aria-hidden="true"
                  />
                  Secure checkout
                </span>

                <span className="flex items-center gap-2">
                  <Zap
                    className="size-4 text-[#10B981]"
                    aria-hidden="true"
                  />
                  Instant delivery
                </span>

                <span className="flex items-center gap-2">
                  <Clock3
                    className="size-4 text-[#10B981]"
                    aria-hidden="true"
                  />
                  Order tracking
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-10 rounded-full bg-[#6366F1]/20 blur-3xl" />

              <div className="relative rounded-3xl border border-[#1F2937] bg-[#111827]/80 p-8 shadow-2xl backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;

                    return (
                      <div
                        key={category.value}
                        className="rounded-2xl border border-[#1F2937] bg-[#090D16] p-5"
                      >
                        <span
                          className={`flex size-12 items-center justify-center rounded-xl ${category.color}`}
                        >
                          <Icon
                            className="size-6"
                            aria-hidden="true"
                          />
                        </span>

                        <p className="mt-4 font-bold text-white">
                          {category.label}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Secure digital delivery
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-360 px-4 py-14 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => selectCategory(category.value)}
                  className="group rounded-2xl border border-[#1F2937] bg-[#111827] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-[#6366F1]"
                >
                  <span
                    className={`flex size-11 items-center justify-center rounded-xl ${category.color}`}
                  >
                    <Icon
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <h2 className="mt-4 font-bold text-white">
                    {category.label}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-360 scroll-mt-28 px-4 py-10 sm:px-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
                Digital catalog
              </p>

              <h2
                style={{
                  fontFamily: 'var(--font-plus-jakarta)',
                }}
                className="mt-2 text-3xl font-bold text-white"
              >
                Explore our products
              </h2>

              <p className="mt-2 text-slate-400">
                {filteredProducts.length} products available
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-[#6366F1] text-white'
                      : 'border border-[#1F2937] bg-[#111827] text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      setActiveCategory(category.value)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      activeCategory === category.value
                        ? 'bg-[#6366F1] text-white'
                        : 'border border-[#1F2937] bg-[#111827] text-slate-400 hover:text-white'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-2 text-sm text-white outline-none focus:border-[#6366F1]"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {query && (
            <div className="mt-6 rounded-xl border border-[#6366F1]/30 bg-[#6366F1]/10 px-4 py-3 text-sm text-[#C7D2FE]">
              Search results for <strong>“{query}”</strong>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] transition duration-200 hover:-translate-y-1 hover:border-[#6366F1] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative block aspect-4/3 overflow-hidden bg-[#0D1320]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-[#090D16]/80 via-transparent to-transparent" />

                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.deliveryType === 'instant'
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#F59E0B] text-[#090D16]'
                      }`}
                    >
                      {product.deliveryType === 'instant'
                        ? 'Instant Delivery'
                        : 'Manual Top-Up'}
                    </span>

                    {!product.inStock && (
                      <span className="absolute inset-0 flex items-center justify-center bg-[#090D16]/75 font-bold text-white">
                        Out of Stock
                      </span>
                    )}
                  </Link>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#818CF8]">
                        {categoryLabels[product.category]}
                      </span>

                      <span className="flex items-center gap-1 text-sm text-slate-300">
                        <Star
                          className="size-4 fill-[#F59E0B] text-[#F59E0B]"
                          aria-hidden="true"
                        />
                        {product.rating}
                      </span>
                    </div>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mt-3 line-clamp-1 font-bold text-white transition-colors group-hover:text-[#A5B4FC]">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {product.shortDescription}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Starting at
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold tabular-nums text-white">
                            ${product.price.toFixed(2)}
                          </span>

                          {product.originalPrice && (
                            <span className="text-sm tabular-nums text-slate-600 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="flex size-10 items-center justify-center rounded-lg bg-[#6366F1] text-white transition-colors hover:bg-[#4F46E5]"
                        aria-label={`View ${product.name}`}
                      >
                        <ShoppingCart
                          className="size-4"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827] px-4 text-center">
              <SearchX
                className="size-10 text-slate-600"
                aria-hidden="true"
              />

              <h3 className="mt-4 text-lg font-bold text-white">
                No products found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term or product category.
              </p>

              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="mt-5 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5]"
              >
                Show all products
              </button>
            </div>
          )}
        </section>

        <section className="mt-16 border-y border-[#1F2937] bg-[#111827]/50">
          <div className="mx-auto max-w-360 px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
                Simple and secure
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                How it works
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Gamepad2,
                  step: '01',
                  title: 'Choose your product',
                  text: 'Browse gift cards, game keys, accounts, and top-up packages.',
                },
                {
                  icon: CreditCard,
                  step: '02',
                  title: 'Complete checkout',
                  text: 'Enter your email, select a payment method, and confirm your order.',
                },
                {
                  icon: Zap,
                  step: '03',
                  title: 'Receive your purchase',
                  text: 'Access instant products in your vault or track manual top-ups.',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.step}
                    className="relative rounded-2xl border border-[#1F2937] bg-[#111827] p-7"
                  >
                    <span className="absolute right-5 top-4 text-4xl font-black text-[#1F2937]">
                      {item.step}
                    </span>

                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#818CF8]">
                      <Icon
                        className="size-6"
                        aria-hidden="true"
                      />
                    </span>

                    <h3 className="mt-5 text-lg font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-360 px-4 py-20 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
              Gamer reviews
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              Trusted by players
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.name}
                className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6"
              >
                <div className="flex gap-1 text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="size-4 fill-current"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="mt-5 leading-7 text-slate-300">
                  “{review.review}”
                </p>

                <div className="mt-6 border-t border-[#1F2937] pt-4">
                  <p className="font-semibold text-white">
                    {review.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {review.product}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-4xl scroll-mt-28 px-4 py-20 sm:px-6"
        >
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
              Need help?
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-[#1F2937] bg-[#111827] open:border-[#6366F1]/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-white">
                  {faq.question}

                  <ChevronDown
                    className="size-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>

                <p className="border-t border-[#1F2937] px-5 py-4 text-sm leading-6 text-slate-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#090D16] text-white">
          Loading NEXUS STORE...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}