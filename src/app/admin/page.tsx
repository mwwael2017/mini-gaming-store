'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  Menu,
  Package,
  PackagePlus,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  X,
} from 'lucide-react';
import { useStore } from '@/context/store-context';
import type {
  DeliveryType,
  Product,
  ProductCategory,
  ProductPlatform,
} from '@/types/store';

const categoryLabels: Record<ProductCategory, string> = {
  'gift-cards': 'Gift Cards',
  'game-keys': 'Game Keys',
  accounts: 'Accounts',
  'top-ups': 'Top-Ups',
};

const navigation = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    href: '#overview',
  },
  {
    label: 'Recent Orders',
    icon: ShoppingBag,
    href: '#orders',
  },
  {
    label: 'Catalog',
    icon: Package,
    href: '#catalog',
  },
];

function formatDate(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

function createProductSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminPage() {
  const {
    products,
    orders,
    hydrated,
    markOrderDelivered,
    toggleProductStock,
    addProduct,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productName, setProductName] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] =
    useState<ProductCategory>('gift-cards');
  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>('instant');
  const [formError, setFormError] = useState('');

  const totalRevenue = useMemo(
    () =>
      orders.reduce(
        (total, order) => total + order.total,
        0,
      ),
    [orders],
  );

  const processingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === 'processing',
      ),
    [orders],
  );

  const deliveredOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === 'delivered',
      ),
    [orders],
  );

  const inStockProducts = useMemo(
    () =>
      products.filter((product) => product.inStock).length,
    [products],
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (firstOrder, secondOrder) =>
            Date.parse(secondOrder.createdAt) -
            Date.parse(firstOrder.createdAt),
        )
        .slice(0, 8),
    [orders],
  );

  const filteredProducts = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.platform,
        product.game,
        product.publisher,
      ]
        .filter(
          (value): value is string =>
            typeof value === 'string',
        )
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [catalogSearch, products]);

  function resetProductForm(): void {
    setProductName('');
    setProductSlug('');
    setProductPrice('');
    setProductCategory('gift-cards');
    setDeliveryType('instant');
    setFormError('');
  }

  function openAddProductModal(): void {
    resetProductForm();
    setShowAddProduct(true);
  }

  function closeAddProductModal(): void {
    resetProductForm();
    setShowAddProduct(false);
  }

  function handleProductNameChange(value: string): void {
    setProductName(value);
    setFormError('');

    if (!productSlug.trim()) {
      setProductSlug(createProductSlug(value));
    }
  }

  function handleCategoryChange(
    category: ProductCategory,
  ): void {
    setProductCategory(category);
    setDeliveryType(
      category === 'top-ups' ? 'manual' : 'instant',
    );
    setFormError('');
  }

  function handleAddProduct(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    setFormError('');

    const name = productName.trim();
    const slug = createProductSlug(productSlug);
    const price = Number(productPrice);

    if (!name) {
      setFormError('Product name is required.');
      return;
    }

    if (!slug) {
      setFormError('A valid product slug is required.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError(
        'Product price must be greater than zero.',
      );
      return;
    }

    if (
      products.some(
        (product) =>
          product.slug.toLowerCase() === slug.toLowerCase(),
      )
    ) {
      setFormError(
        'This product slug is already being used.',
      );
      return;
    }

    const platform: ProductPlatform =
      productCategory === 'gift-cards' ||
      productCategory === 'top-ups'
        ? 'Multi-Platform'
        : 'PC';

    const newProduct: Product = {
      id: `product-${crypto.randomUUID()}`,
      slug,
      name,
      shortDescription: `${name} available from NEXUS STORE.`,
      description: `${name} is a secure digital gaming product available through NEXUS STORE.`,
      category: productCategory,
      deliveryType,
      platform,
      image: '/images/products/product-placeholder.jpg',
      price,
      currency: 'USD',
      rating: 5,
      reviewCount: 0,
      features: [
        'Secure digital purchase',
        deliveryType === 'instant'
          ? 'Instant digital delivery'
          : 'Manual order processing',
      ],
      requiresPlayerId: productCategory === 'top-ups',
      playerIdLabel:
        productCategory === 'top-ups'
          ? 'Player ID'
          : undefined,
      playerIdPlaceholder:
        productCategory === 'top-ups'
          ? 'Enter your Player ID'
          : undefined,
      inStock: true,
      featured: false,
    };

    addProduct(newProduct);
    closeAddProductModal();
  }

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090D16]">
        <div
          className="size-10 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#6366F1]"
          aria-label="Loading admin dashboard"
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#1F2937] bg-[#0C111D] transition-transform lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#1F2937] px-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.35)]">
              <Gamepad2
                className="size-6"
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-bold">NEXUS STORE</p>
              <p className="text-xs text-slate-500">
                Control Center
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#111827] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  index === 0
                    ? 'bg-[#6366F1]/15 text-white'
                    : 'text-slate-400 hover:bg-[#111827] hover:text-white'
                }`}
              >
                <Icon
                  className="size-5"
                  aria-hidden="true"
                />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="border-t border-[#1F2937] p-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-[#6366F1] hover:text-white"
          >
            <Store className="size-4" aria-hidden="true" />
            View Store
            <ExternalLink
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1F2937] bg-[#090D16]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-10 items-center justify-center rounded-lg border border-[#1F2937] text-slate-400 transition-colors hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <div>
              <h1 className="font-bold">
                Admin Control Center
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage orders, delivery, and catalog availability
              </p>
            </div>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-[#10B981]/10 px-3 py-1.5 text-xs font-semibold text-[#34D399]">
            <span className="size-2 rounded-full bg-[#10B981]" />
            Store Online
          </span>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <section
            id="overview"
            className="scroll-mt-24"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-[#818CF8]">
              Dashboard overview
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-plus-jakarta)',
              }}
              className="mt-2 text-3xl font-bold"
            >
              Store performance
            </h2>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#818CF8]">
                    <DollarSign
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <TrendingUp
                    className="size-4 text-[#10B981]"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Total Revenue
                </p>

                <p className="mt-1 text-2xl font-bold tabular-nums">
                  ${totalRevenue.toFixed(2)}
                </p>
              </article>

              <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#34D399]">
                  <CheckCircle2
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <p className="mt-5 text-sm text-slate-500">
                  Delivered Orders
                </p>

                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {deliveredOrders.length}
                </p>
              </article>

              <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#FBBF24]">
                  <Clock3
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <p className="mt-5 text-sm text-slate-500">
                  Processing Top-Ups
                </p>

                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {processingOrders.length}
                </p>
              </article>

              <article className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
                  <Package
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <p className="mt-5 text-sm text-slate-500">
                  Products In Stock
                </p>

                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {inStockProducts} / {products.length}
                </p>
              </article>
            </div>
          </section>

          <section
            id="orders"
            className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#1F2937] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review purchases and complete manual top-ups.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold text-[#A5B4FC]">
                {orders.length} Orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead className="bg-[#090D16]/60 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#1F2937]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        No orders are available yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const playerId = order.items.find(
                        (item) => item.playerId,
                      )?.playerId;

                      return (
                        <tr
                          key={order.id}
                          className="transition-colors hover:bg-[#090D16]/40"
                        >
                          <td className="px-6 py-4 font-semibold tabular-nums">
                            {order.id}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {order.customerEmail}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-400">
                            <p className="max-w-64 truncate">
                              {order.items
                                .map(
                                  (item) =>
                                    item.productName,
                                )
                                .join(', ')}
                            </p>

                            {playerId && (
                              <p className="mt-1 max-w-64 truncate text-xs text-[#FBBF24]">
                                Player ID: {playerId}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4 font-semibold tabular-nums">
                            ${order.total.toFixed(2)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                order.status === 'delivered'
                                  ? 'bg-[#10B981]/10 text-[#34D399]'
                                  : 'bg-[#F59E0B]/10 text-[#FBBF24]'
                              }`}
                            >
                              {order.status === 'delivered' ? (
                                <CheckCircle2
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Clock3
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              )}

                              {order.status === 'delivered'
                                ? 'Delivered'
                                : 'Processing'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {order.status === 'processing' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  markOrderDelivered(
                                    order.id,
                                  )
                                }
                                className="rounded-lg bg-[#10B981] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#059669]"
                              >
                                Mark Delivered
                              </button>
                            ) : (
                              <span className="text-xs text-slate-600">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="catalog"
            className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]"
          >
            <div className="flex flex-col gap-4 border-b border-[#1F2937] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-xl font-bold">
                  Catalog Quick Controls
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search products and update catalog availability.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddProductModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 text-sm font-bold transition-colors hover:bg-[#4F46E5]"
              >
                <PackagePlus
                  className="size-4"
                  aria-hidden="true"
                />
                Add Product
              </button>
            </div>

            <div className="border-b border-[#1F2937] p-5 sm:p-6">
              <label className="flex max-w-md items-center rounded-lg border border-[#1F2937] bg-[#090D16] transition-colors focus-within:border-[#6366F1]">
                <Search
                  className="ml-4 size-4 text-slate-500"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={catalogSearch}
                  onChange={(event) =>
                    setCatalogSearch(event.target.value)
                  }
                  placeholder="Search catalog..."
                  aria-label="Search catalog"
                  className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-600"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left">
                <thead className="bg-[#090D16]/60 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Delivery</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">In Stock</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#1F2937]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        No products match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-[#090D16]/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="size-11 rounded-lg border border-[#1F2937] object-cover"
                            />

                            <div className="min-w-0">
                              <p className="max-w-72 truncate text-sm font-semibold">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {product.platform}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-400">
                          {categoryLabels[product.category]}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold ${
                              product.deliveryType ===
                              'instant'
                                ? 'text-[#34D399]'
                                : 'text-[#FBBF24]'
                            }`}
                          >
                            {product.deliveryType ===
                            'instant'
                              ? 'Instant'
                              : 'Manual'}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-semibold tabular-nums">
                          ${product.price.toFixed(2)}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={product.inStock}
                            aria-label={`Toggle ${product.name} stock`}
                            onClick={() =>
                              toggleProductStock(
                                product.id,
                              )
                            }
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                              product.inStock
                                ? 'bg-[#10B981]'
                                : 'bg-[#374151]'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                                product.inStock
                                  ? 'translate-x-5'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {showAddProduct && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-product-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddProductModal();
            }
          }}
        >
          <form
            onSubmit={handleAddProduct}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#1F2937] p-5">
              <div>
                <h2
                  id="add-product-title"
                  className="text-lg font-bold"
                >
                  Add Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a basic catalog product.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddProductModal}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#1F2937] hover:text-white"
                aria-label="Close add product modal"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            <div className="grid max-h-[70vh] gap-5 overflow-y-auto p-5 sm:grid-cols-2">
              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:col-span-2"
                >
                  {formError}
                </p>
              )}

              <label className="sm:col-span-2">
                <span className="text-sm font-semibold">
                  Product Name
                </span>

                <input
                  required
                  type="text"
                  value={productName}
                  onChange={(event) =>
                    handleProductNameChange(
                      event.target.value,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-3 outline-none transition-colors placeholder:text-slate-600 focus:border-[#6366F1]"
                  placeholder="Product name"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-semibold">
                  Slug
                </span>

                <input
                  required
                  type="text"
                  value={productSlug}
                  onChange={(event) => {
                    setProductSlug(event.target.value);
                    setFormError('');
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-3 outline-none transition-colors placeholder:text-slate-600 focus:border-[#6366F1]"
                  placeholder="product-url-slug"
                />
              </label>

              <label>
                <span className="text-sm font-semibold">
                  Category
                </span>

                <select
                  value={productCategory}
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target.value as ProductCategory,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-3 outline-none transition-colors focus:border-[#6366F1]"
                >
                  {Object.entries(categoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span className="text-sm font-semibold">
                  Price
                </span>

                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productPrice}
                  onChange={(event) => {
                    setProductPrice(event.target.value);
                    setFormError('');
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-3 outline-none transition-colors placeholder:text-slate-600 focus:border-[#6366F1]"
                  placeholder="19.99"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-semibold">
                  Delivery Type
                </span>

                <select
                  value={deliveryType}
                  onChange={(event) => {
                    setDeliveryType(
                      event.target.value as DeliveryType,
                    );
                    setFormError('');
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-[#1F2937] bg-[#090D16] px-3 outline-none transition-colors focus:border-[#6366F1]"
                >
                  <option value="instant">
                    Instant Delivery
                  </option>

                  <option value="manual">
                    Manual Delivery
                  </option>
                </select>
              </label>
            </div>

            <footer className="flex justify-end gap-3 border-t border-[#1F2937] p-5">
              <button
                type="button"
                onClick={closeAddProductModal}
                className="h-11 rounded-lg border border-[#1F2937] px-5 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-11 rounded-lg bg-[#6366F1] px-5 text-sm font-bold transition-colors hover:bg-[#4F46E5]"
              >
                Add Product
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}