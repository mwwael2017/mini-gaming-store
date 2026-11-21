'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { products as initialProducts } from '@/data/products';
import type {
  AccountCredentials,
  CartItem,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  ProductBadge,
} from '@/types/store';

type StoreStatus = 'delivered' | 'processing';

type StoreOrderItem = Omit<OrderItem, 'id'> & {
  id: string;
  status: StoreStatus;
};

type StoreOrder = Omit<Order, 'id' | 'status' | 'items'> & {
  id: string;
  dbId?: string;
  status: StoreStatus;
  items: StoreOrderItem[];
};

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: StoreOrder[];
  hydrated: boolean;
  cartTotal: number;
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (
    customerEmail: string,
    paymentMethod: PaymentMethod,
  ) => StoreOrder | null;
  markOrderDelivered: (orderId: string) => void;
  toggleProductStock: (productId: string) => void;
  addProduct: (newProduct: Product) => void;
}

type DatabaseRow = Record<string, unknown>;

const CART_STORAGE_KEY = 'nexus_store_cart';

const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function getBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === 'string',
  );
}

function logSupabaseError(
  action: string,
  error: {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  },
): void {
  console.error(
    action,
    JSON.stringify(
      {
        message: error.message ?? 'Unknown Supabase error',
        details: error.details ?? null,
        hint: error.hint ?? null,
        code: error.code ?? null,
      },
      null,
      2,
    ),
  );
}

function mapProduct(row: DatabaseRow): Product {
  return {
    id: getString(row.id),
    slug: getString(row.slug),
    name: getString(row.name),
    shortDescription: getString(row.short_description),
    description: getString(row.description),
    category: getString(row.category) as Product['category'],
    deliveryType: getString(
      row.delivery_type,
      'instant',
    ) as Product['deliveryType'],
    platform: getString(
      row.platform,
      'Multi-Platform',
    ) as Product['platform'],
    game: getString(row.game) || undefined,
    publisher: getString(row.publisher) || undefined,
    image:
      getString(row.image) ||
      getString(row.cover_gradient) ||
      '/images/products/product-placeholder.jpg',
    gallery: getStringArray(row.gallery),
    price: getNumber(row.price),
    originalPrice:
      row.original_price === null ||
      row.original_price === undefined
        ? undefined
        : getNumber(row.original_price),
    currency: 'USD',
    rating: getNumber(row.rating, 5),
    reviewCount: getNumber(row.review_count),
    badge:
      (getString(row.badge_text) as ProductBadge) || undefined,
    features: getStringArray(row.features),
    packages: Array.isArray(row.packages)
      ? (row.packages as Product['packages'])
      : undefined,
    requiresPlayerId: getBoolean(row.requires_player_id),
    playerIdLabel:
      getString(row.player_id_label) || undefined,
    playerIdPlaceholder:
      getString(row.player_id_placeholder) || undefined,
    inStock: getBoolean(row.in_stock, true),
    featured: getBoolean(row.featured),
    relatedProductIds: getStringArray(row.related_product_ids),
  };
}

function productToDatabaseRow(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_description: product.shortDescription,
    description: product.description,
    category: product.category,
    delivery_type: product.deliveryType,
    platform: product.platform,
    game: product.game ?? null,
    publisher: product.publisher ?? null,
    image: product.image,
    price: product.price,
    original_price: product.originalPrice ?? null,
    currency: product.currency,
    rating: product.rating,
    review_count: product.reviewCount,
    badge_text: product.badge ?? null,
    features: product.features,
    packages: product.packages ?? null,
    requires_player_id: product.requiresPlayerId,
    player_id_label: product.playerIdLabel ?? null,
    player_id_placeholder:
      product.playerIdPlaceholder ?? null,
    in_stock: product.inStock,
    stock_count: product.inStock ? 999 : 0,
    featured: product.featured,
    related_product_ids: product.relatedProductIds ?? [],
  };
}

function mapOrderItem(row: DatabaseRow): StoreOrderItem {
  return {
    id: getString(row.id),
    productId: getString(row.product_id),
    productSlug: getString(row.product_slug),
    productName: getString(row.product_name),
    productImage: getString(row.product_image),
    category: getString(row.category) as OrderItem['category'],
    deliveryType: getString(
      row.delivery_type,
      'instant',
    ) as OrderItem['deliveryType'],
    quantity: getNumber(row.quantity, 1),
    unitPrice: getNumber(row.unit_price),
    totalPrice: getNumber(row.total_price),
    currency: 'USD',
    packageId: getString(row.package_id) || undefined,
    packageName: getString(row.package_name) || undefined,
    playerId: getString(row.player_id) || undefined,
    digitalCode: getString(row.delivered_code) || undefined,
    accountCredentials:
      row.account_credentials &&
      typeof row.account_credentials === 'object'
        ? (row.account_credentials as AccountCredentials)
        : undefined,
    deliveredAt: getString(row.delivered_at) || undefined,
    status: getString(
      row.item_status,
      'processing',
    ) as StoreStatus,
  };
}

function mapOrder(row: DatabaseRow): StoreOrder {
  return {
    id: getString(row.order_number),
    dbId: getString(row.id) || undefined,
    customerEmail: getString(row.customer_email),
    paymentMethod: getString(
      row.payment_method,
      'card',
    ) as PaymentMethod,
    subtotal: getNumber(
      row.subtotal_amount ?? row.total_amount,
    ),
    total: getNumber(row.total_amount),
    currency: 'USD',
    createdAt: getString(row.created_at),
    completedAt: getString(row.completed_at) || undefined,
    status: getString(
      row.status,
      'processing',
    ) as StoreStatus,
    items: Array.isArray(row.order_items)
      ? row.order_items.map((item) =>
          mapOrderItem(item as DatabaseRow),
        )
      : [],
  };
}

function createDigitalCode(): string {
  return `NXS-${crypto.randomUUID().replaceAll('-', '').slice(0, 15).toUpperCase()}`;
}

function createAccountCredentials(
  productName: string,
): AccountCredentials {
  const accountId = crypto.randomUUID().slice(0, 8);
  const usernameBase =
    productName
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8)
      .toLowerCase() || 'nexus';

  return {
    username: `${usernameBase}_${accountId}`,
    password: `Nx!${crypto.randomUUID().slice(0, 12)}`,
    email: `${usernameBase}.${accountId}@vault.nexus.test`,
    emailPassword: `Mail!${crypto.randomUUID().slice(0, 10)}`,
    recoveryCode: crypto
      .randomUUID()
      .replaceAll('-', '')
      .slice(0, 12)
      .toUpperCase(),
    additionalNotes:
      'Change the account and email passwords after your first successful login.',
  };
}

function createOrderNumber(): string {
  return `#NX-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] =
    useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);

      setCart(
        storedCart
          ? (JSON.parse(storedCart) as CartItem[])
          : [],
      );
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart),
      );
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [cart, hydrated]);

  useEffect(() => {
    let active = true;

    async function loadStoreData(): Promise<void> {
      const productResult = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (productResult.error) {
        logSupabaseError(
          'Failed to fetch products:',
          productResult.error,
        );
      } else if (active) {
        const databaseProducts = productResult.data ?? [];

        if (databaseProducts.length === 0) {
          const seedResult = await supabase
            .from('products')
            .insert(initialProducts.map(productToDatabaseRow))
            .select('*');

          if (seedResult.error) {
            logSupabaseError(
              'Failed to seed products:',
              seedResult.error,
            );
          } else if (active && seedResult.data) {
            setProducts(
              seedResult.data.map((row) =>
                mapProduct(row as DatabaseRow),
              ),
            );
          }
        } else {
          setProducts(
            databaseProducts.map((row) =>
              mapProduct(row as DatabaseRow),
            ),
          );
        }
      }

      const orderResult = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (orderResult.error) {
        logSupabaseError(
          'Failed to fetch orders:',
          orderResult.error,
        );
      } else if (active && orderResult.data) {
        setOrders(
          orderResult.data.map((row) =>
            mapOrder(row as DatabaseRow),
          ),
        );
      }
    }

    void loadStoreData();

    return () => {
      active = false;
    };
  }, []);

  function addToCart(item: CartItem): void {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (currentItem) =>
          currentItem.productId === item.productId &&
          currentItem.packageId === item.packageId &&
          currentItem.playerId === item.playerId,
      );

      if (!existingItem) {
        return [...currentCart, item];
      }

      return currentCart.map((currentItem) =>
        currentItem.id === existingItem.id
          ? {
              ...currentItem,
              quantity:
                currentItem.quantity + item.quantity,
            }
          : currentItem,
      );
    });
  }

  function removeFromCart(itemId: string): void {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== itemId),
    );
  }

  function updateQuantity(
    itemId: string,
    quantity: number,
  ): void {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

  function clearCart(): void {
    setCart([]);
  }

  function placeOrder(
    customerEmail: string,
    paymentMethod: PaymentMethod,
  ): StoreOrder | null {
    const normalizedEmail = customerEmail.trim().toLowerCase();

    if (!normalizedEmail || cart.length === 0) {
      return null;
    }

    const databaseOrderId = crypto.randomUUID();
    const orderNumber = createOrderNumber();
    const createdAt = new Date().toISOString();

    const orderItems: StoreOrderItem[] = cart.map(
      (cartItem) => {
        const itemStatus: StoreStatus =
          cartItem.deliveryType === 'manual'
            ? 'processing'
            : 'delivered';

        return {
          ...cartItem,
          id: crypto.randomUUID(),
          totalPrice: Number(
            (
              cartItem.unitPrice * cartItem.quantity
            ).toFixed(2),
          ),
          status: itemStatus,
          digitalCode:
            cartItem.deliveryType === 'instant' &&
            cartItem.category !== 'accounts'
              ? createDigitalCode()
              : undefined,
          accountCredentials:
            cartItem.category === 'accounts'
              ? createAccountCredentials(
                  cartItem.productName,
                )
              : undefined,
          deliveredAt:
            itemStatus === 'delivered'
              ? createdAt
              : undefined,
        };
      },
    );

    const orderTotal = Number(
      orderItems
        .reduce(
          (total, item) => total + item.totalPrice,
          0,
        )
        .toFixed(2),
    );

    const orderStatus: StoreStatus = orderItems.some(
      (item) => item.status === 'processing',
    )
      ? 'processing'
      : 'delivered';

    const createdOrder: StoreOrder = {
      id: orderNumber,
      dbId: databaseOrderId,
      customerEmail: normalizedEmail,
      items: orderItems,
      status: orderStatus,
      paymentMethod,
      subtotal: orderTotal,
      total: orderTotal,
      currency: 'USD',
      createdAt,
      completedAt:
        orderStatus === 'delivered'
          ? createdAt
          : undefined,
    };

    void (async () => {
      const orderPayload = {
        id: databaseOrderId,
        order_number: orderNumber,
        customer_email: normalizedEmail,
        payment_method: paymentMethod,
        subtotal_amount: orderTotal,
        total_amount: orderTotal,
        currency: 'USD',
        status: orderStatus,
        created_at: createdAt,
        completed_at:
          orderStatus === 'delivered'
            ? createdAt
            : null,
      };

      const orderResult = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id, order_number')
        .single();

      if (orderResult.error) {
        logSupabaseError(
          'Failed to create order:',
          orderResult.error,
        );
        return;
      }

      const orderItemsPayload = orderItems.map((item) => ({
        id: item.id,
        order_id: databaseOrderId,
        product_id: item.productId,
        product_slug: item.productSlug,
        product_name: item.productName,
        product_image: item.productImage,
        category: item.category,
        delivery_type: item.deliveryType,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        currency: item.currency,
        package_id: item.packageId ?? null,
        package_name: item.packageName ?? null,
        player_id: item.playerId ?? null,
        delivered_code: item.digitalCode ?? null,
        account_credentials:
          item.accountCredentials ?? null,
        item_status: item.status,
        delivered_at: item.deliveredAt ?? null,
      }));

      const itemResult = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemResult.error) {
        logSupabaseError(
          'Failed to create order items:',
          itemResult.error,
        );

        await supabase
          .from('orders')
          .delete()
          .eq('id', databaseOrderId);

        return;
      }

      setOrders((currentOrders) => {
        const alreadyAdded = currentOrders.some(
          (order) => order.id === createdOrder.id,
        );

        return alreadyAdded
          ? currentOrders
          : [createdOrder, ...currentOrders];
      });

      clearCart();
    })();

    return createdOrder;
  }

  function markOrderDelivered(orderId: string): void {
    const currentOrder = orders.find(
      (order) => order.id === orderId,
    );

    if (!currentOrder) {
      return;
    }

    const deliveredAt = new Date().toISOString();

    void (async () => {
      const orderUpdate = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          completed_at: deliveredAt,
        })
        .eq('order_number', orderId);

      if (orderUpdate.error) {
        logSupabaseError(
          'Failed to mark order as delivered:',
          orderUpdate.error,
        );
        return;
      }

      const databaseOrderId = currentOrder.dbId;

      if (databaseOrderId) {
        const itemUpdate = await supabase
          .from('order_items')
          .update({
            item_status: 'delivered',
            delivered_at: deliveredAt,
          })
          .eq('order_id', databaseOrderId);

        if (itemUpdate.error) {
          logSupabaseError(
            'Failed to mark order items as delivered:',
            itemUpdate.error,
          );
          return;
        }
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'delivered',
                completedAt: deliveredAt,
                items: order.items.map((item) => ({
                  ...item,
                  status: 'delivered',
                  deliveredAt:
                    item.deliveredAt ?? deliveredAt,
                })),
              }
            : order,
        ),
      );
    })();
  }

  function toggleProductStock(productId: string): void {
    const currentProduct = products.find(
      (product) => product.id === productId,
    );

    if (!currentProduct) {
      return;
    }

    const nextStockValue = !currentProduct.inStock;

    void (async () => {
      const updateResult = await supabase
        .from('products')
        .update({
          in_stock: nextStockValue,
          stock_count: nextStockValue ? 999 : 0,
        })
        .eq('id', productId);

      if (updateResult.error) {
        logSupabaseError(
          'Failed to update product stock:',
          updateResult.error,
        );
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                inStock: nextStockValue,
              }
            : product,
        ),
      );
    })();
  }

  function addProduct(newProduct: Product): void {
    void (async () => {
      const insertResult = await supabase
        .from('products')
        .insert(productToDatabaseRow(newProduct))
        .select('*')
        .single();

      if (insertResult.error) {
        logSupabaseError(
          'Failed to add product:',
          insertResult.error,
        );
        return;
      }

      const insertedProduct = mapProduct(
        insertResult.data as DatabaseRow,
      );

      setProducts((currentProducts) => {
        const alreadyExists = currentProducts.some(
          (product) => product.id === insertedProduct.id,
        );

        return alreadyExists
          ? currentProducts
          : [...currentProducts, insertedProduct];
      });
    })();
  }

  const cartTotal = useMemo(
    () =>
      Number(
        cart
          .reduce(
            (total, item) =>
              total + item.unitPrice * item.quantity,
            0,
          )
          .toFixed(2),
      ),
    [cart],
  );

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [cart],
  );

  const contextValue = useMemo<StoreContextType>(
    () => ({
      products,
      cart,
      orders,
      hydrated,
      cartTotal,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      placeOrder,
      markOrderDelivered,
      toggleProductStock,
      addProduct,
    }),
    [
      products,
      cart,
      orders,
      hydrated,
      cartTotal,
      cartCount,
    ],
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      'useStore must be used inside StoreProvider.',
    );
  }

  return context;
}