'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Zap,
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { useStore } from '@/context/store-context';
import type {
  CartItem,
  ProductPackage,
} from '@/types/store';

type InfoTab = 'description' | 'features' | 'delivery';

function ProductDetailsContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { products, addToCart, hydrated } = useStore();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const product = useMemo(
    () => products.find((item) => item.slug === slug),
    [products, slug],
  );

  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] =
    useState<InfoTab>('description');
  const [validationMessage, setValidationMessage] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    setSelectedPackageId(product?.packages?.[0]?.id ?? '');
    setPlayerId('');
    setQuantity(1);
    setValidationMessage('');
    setAddedToCart(false);
  }, [product]);

  const selectedPackage = useMemo<ProductPackage | undefined>(
    () =>
      product?.packages?.find(
        (item) => item.id === selectedPackageId,
      ),
    [product, selectedPackageId],
  );

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    const relatedIds = product.relatedProductIds ?? [];

    const explicitProducts = relatedIds
      .map((id) => products.find((item) => item.id === id))
      .filter(
        (item): item is NonNullable<typeof item> =>
          item !== undefined,
      );

    if (explicitProducts.length > 0) {
      return explicitProducts.slice(0, 4);
    }

    return products
      .filter(
        (item) =>
          item.id !== product.id &&
          item.category === product.category,
      )
      .slice(0, 4);
  }, [product, products]);

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

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-360 flex-col items-center justify-center px-4 text-center sm:px-6">
          <ShoppingCart
            className="size-14 text-[#6366F1]"
            aria-hidden="true"
          />

          <h1 className="mt-5 text-3xl font-bold text-white">
            Product not found
          </h1>

          <p className="mt-3 max-w-md text-slate-400">
            This product may have been removed or the product link may
            be incorrect.
          </p>

          <Link
            href="/#products"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#6366F1] px-5 font-semibold text-white transition-colors hover:bg-[#4F46E5]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Store
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  const unitPrice = selectedPackage?.price ?? product.price;
  const originalPrice =
    selectedPackage?.originalPrice ?? product.originalPrice;
  const totalPrice = unitPrice * quantity;

  const createCartItem = (): CartItem | null => {
    if (product.packages?.length && !selectedPackage) {
      setValidationMessage('Please select a package.');
      return null;
    }

    if (product.requiresPlayerId && !playerId.trim()) {
      setValidationMessage(
        `Please enter your ${product.playerIdLabel ?? 'Player ID'}.`,
      );
      return null;
    }

    if (!product.inStock || selectedPackage?.inStock === false) {
      setValidationMessage(
        'This product or package is currently out of stock.',
      );
      return null;
    }

    setValidationMessage('');

    return {
      id: crypto.randomUUID(),
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      deliveryType: product.deliveryType,
      quantity,
      unitPrice,
      currency: product.currency,
      packageId: selectedPackage?.id,
      packageName: selectedPackage?.name,
      playerId: playerId.trim() || undefined,
    };
  };

  const handleAddToCart = () => {
    const item = createCartItem();

    if (!item) {
      return;
    }

    addToCart(item);
    setAddedToCart(true);

    window.setTimeout(() => {
      setAddedToCart(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    const item = createCartItem();

    if (!item) {
      return;
    }

    addToCart(item);
    router.push('/checkout');
  };

  const tabs: { id: InfoTab; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'features', label: 'What You Get' },
    { id: 'delivery', label: 'Delivery' },
  ];

  return (
    <>
      <Navbar />

      <main>
        <section className="border-b border-[#1F2937]">
          <div className="mx-auto max-w-360 px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                href="/"
                className="transition-colors hover:text-white"
              >
                Store
              </Link>

              <span>/</span>

              <Link
                href={`/?category=${product.category}`}
                className="capitalize transition-colors hover:text-white"
              >
                {product.category.replaceAll('-', ' ')}
              </Link>

              <span>/</span>

              <span className="line-clamp-1 text-slate-300">
                {product.name}
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-360 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]">
              <img
                src={product.image}
                alt={product.name}
                className="size-full object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-[#090D16]/80 via-transparent to-transparent" />

              <span
                className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                  product.deliveryType === 'instant'
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#F59E0B] text-[#090D16]'
                }`}
              >
                {product.deliveryType === 'instant' ? (
                  <Zap className="size-3.5" aria-hidden="true" />
                ) : (
                  <Clock3 className="size-3.5" aria-hidden="true" />
                )}

                {product.deliveryType === 'instant'
                  ? 'Instant Delivery'
                  : 'Manual Delivery'}
              </span>

              {product.badge && (
                <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-[#090D16]/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  {product.badge}
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-[#1F2937] bg-[#111827] p-4">
                <ShieldCheck className="size-5 shrink-0 text-[#6366F1]" />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Secure Purchase
                  </p>
                  <p className="text-xs text-slate-500">
                    Protected checkout
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#1F2937] bg-[#111827] p-4">
                <Zap className="size-5 shrink-0 text-[#10B981]" />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Fast Delivery
                  </p>
                  <p className="text-xs text-slate-500">
                    Tracked in My Orders
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#1F2937] bg-[#111827] p-4">
                <CheckCircle2 className="size-5 shrink-0 text-[#F59E0B]" />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Quality Checked
                  </p>
                  <p className="text-xs text-slate-500">
                    Verified product
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-[#1F2937] bg-[#111827] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A5B4FC]">
                {product.category.replaceAll('-', ' ')}
              </span>

              <span className="flex items-center gap-1 text-sm text-slate-300">
                <Star
                  className="size-4 fill-[#F59E0B] text-[#F59E0B]"
                  aria-hidden="true"
                />
                <strong>{product.rating}</strong>
                <span className="text-slate-500">
                  ({product.reviewCount})
                </span>
              </span>
            </div>

            <h1
              style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              className="mt-5 text-3xl font-bold leading-tight text-white"
            >
              {product.name}
            </h1>

            <p className="mt-4 leading-7 text-slate-400">
              {product.shortDescription}
            </p>

            <div className="mt-6 flex items-end gap-3 border-b border-[#1F2937] pb-6">
              <div>
                <p className="text-xs text-slate-500">
                  {product.packages?.length
                    ? 'Selected package'
                    : 'Product price'}
                </p>

                <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>

              {originalPrice && (
                <p className="pb-1 tabular-nums text-slate-600 line-through">
                  ${(originalPrice * quantity).toFixed(2)}
                </p>
              )}
            </div>

            {product.packages && product.packages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-white">
                  Select Package
                </p>

                <div className="mt-3 grid gap-3">
                  {product.packages.map((item) => {
                    const selected =
                      selectedPackageId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!item.inStock}
                        onClick={() => {
                          setSelectedPackageId(item.id);
                          setValidationMessage('');
                        }}
                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? 'border-[#6366F1] bg-[#6366F1]/10'
                            : 'border-[#1F2937] bg-[#090D16] hover:border-[#374151]'
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-semibold text-white">
                            {item.name}
                          </span>

                          {!item.inStock && (
                            <span className="mt-1 block text-xs text-red-400">
                              Out of stock
                            </span>
                          )}
                        </span>

                        <span className="font-bold tabular-nums text-white">
                          ${item.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.requiresPlayerId && (
              <div className="mt-6">
                <label
                  htmlFor="player-id"
                  className="text-sm font-semibold text-white"
                >
                  {product.playerIdLabel ?? 'Player ID'}
                  <span className="ml-1 text-red-400">*</span>
                </label>

                <input
                  id="player-id"
                  type="text"
                  value={playerId}
                  onChange={(event) => {
                    setPlayerId(event.target.value);
                    setValidationMessage('');
                  }}
                  placeholder={
                    product.playerIdPlaceholder ??
                    'Enter your Player ID'
                  }
                  className="mt-3 h-12 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#6366F1]"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Check the ID carefully before completing your
                  purchase. The top-up will be sent to this account.
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold text-white">
                Quantity
              </p>

              <div className="mt-3 flex h-11 w-36 items-center rounded-lg border border-[#1F2937] bg-[#090D16]">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  className="flex h-full flex-1 items-center justify-center text-slate-400 transition-colors hover:text-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>

                <span className="w-10 text-center font-semibold tabular-nums text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                  className="flex h-full flex-1 items-center justify-center text-slate-400 transition-colors hover:text-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {validationMessage && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {validationMessage}
              </p>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#6366F1] bg-[#6366F1]/10 px-5 font-semibold text-[#C7D2FE] transition-colors hover:bg-[#6366F1]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addedToCart ? (
                  <>
                    <Check className="size-5" aria-hidden="true" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart
                      className="size-5"
                      aria-hidden="true"
                    />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="h-12 rounded-lg bg-[#6366F1] px-5 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-colors hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck
                className="size-4 text-[#10B981]"
                aria-hidden="true"
              />
              Secure checkout and protected order storage
            </p>
          </aside>
        </section>

        <section className="mx-auto max-w-360 px-4 pb-16 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]">
            <div className="flex overflow-x-auto border-b border-[#1F2937]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative min-w-max px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-white after:absolute after:inset-x-6 after:bottom-0 after:h-0.5 after:bg-[#6366F1]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'description' && (
                <div>
                  <h2 className="text-xl font-bold text-white">
                    About this product
                  </h2>

                  <p className="mt-4 max-w-4xl leading-7 text-slate-400">
                    {product.description}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#090D16] p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Platform
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {product.platform}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#090D16] p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Publisher
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {product.publisher ?? 'NEXUS STORE'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h2 className="text-xl font-bold text-white">
                    What you get
                  </h2>

                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 rounded-xl bg-[#090D16] p-4 text-sm text-slate-300"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-[#10B981]"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Delivery information
                  </h2>

                  <div className="mt-5 flex items-start gap-4 rounded-xl bg-[#090D16] p-5">
                    {product.deliveryType === 'instant' ? (
                      <Zap className="size-6 shrink-0 text-[#10B981]" />
                    ) : (
                      <Clock3 className="size-6 shrink-0 text-[#F59E0B]" />
                    )}

                    <div>
                      <p className="font-semibold text-white">
                        {product.deliveryType === 'instant'
                          ? 'Instant digital delivery'
                          : 'Manual top-up delivery'}
                      </p>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        {product.deliveryType === 'instant'
                          ? 'Your digital code or account credentials will appear in My Orders immediately after checkout.'
                          : 'Your order will appear as Processing after checkout and will change to Delivered after the administrator completes the top-up.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="border-t border-[#1F2937] bg-[#111827]/40">
            <div className="mx-auto max-w-360 px-4 py-16 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
                    You may also like
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Related products
                  </h2>
                </div>

                <Link
                  href="/#products"
                  className="text-sm font-semibold text-[#A5B4FC] transition-colors hover:text-white"
                >
                  View all
                </Link>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] transition duration-200 hover:-translate-y-1 hover:border-[#6366F1]"
                  >
                    <div className="aspect-4/3 overflow-hidden bg-[#090D16]">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-5">
                      <p className="line-clamp-1 font-semibold text-white transition-colors group-hover:text-[#A5B4FC]">
                        {relatedProduct.name}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold tabular-nums text-white">
                          ${relatedProduct.price.toFixed(2)}
                        </span>

                        <span className="flex items-center gap-1 text-sm text-slate-400">
                          <Star
                            className="size-3.5 fill-[#F59E0B] text-[#F59E0B]"
                            aria-hidden="true"
                          />
                          {relatedProduct.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

function ProductDetailsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090D16]">
      <div className="size-10 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#6366F1]" />
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<ProductDetailsFallback />}>
      <ProductDetailsContent />
    </Suspense>
  );
}