// lib/metaPixel.ts

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID!;

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

const fbq = (...args: any[]) => {
  if (typeof window === "undefined") return;

  if (!window.fbq) {
    console.warn("Meta Pixel no está inicializado.");
    return;
  }

  window.fbq(...args);
};

/**
 * Page View
 */
export const pageView = () => {
  fbq("track", "PageView");
};

/**
 * Usuario entra en un restaurante
 */
export const viewContent = ({
  restaurantId,
  restaurantName,
  category,
}: {
  restaurantId: string;
  restaurantName: string;
  category?: string;
}) => {
  fbq("track", "ViewContent", {
    content_ids: [restaurantId],
    content_name: restaurantName,
    content_category: category,
    content_type: "restaurant",
  });
};

/**
 * Añadir al carrito
 */
export const addToCart = ({
  items,
  value,
  currency = "EUR",
}: {
  items: CartItem[];
  value: number;
  currency?: string;
}) => {
  fbq("track", "AddToCart", {
    currency,
    value,
    contents: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    content_type: "product",
  });
};

/**
 * Comienza checkout
 */
export const initiateCheckout = ({
  items,
  value,
  currency = "EUR",
}: {
  items: CartItem[];
  value: number;
  currency?: string;
}) => {
  fbq("track", "InitiateCheckout", {
    currency,
    value,
    num_items: items.reduce((acc, item) => acc + item.quantity, 0),
    contents: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
  });
};

/**
 * Compra completada
 */
export const purchase = ({
  orderId,
  items,
  value,
  currency = "EUR",
}: {
  orderId: string;
  value: number;
  currency?: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}) => {
  fbq("track", "Purchase", {
    currency,
    value,
    contents: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    content_type: "product",
    order_id: orderId,
  });
};