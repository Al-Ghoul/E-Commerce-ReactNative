export {};

declare global {
  type JWT = {
    access_token: string;
    refresh_token: string;
    userId: number;
  };

  interface Category {
    created_at: Date;
    description: string;
    icon: string;
    id: number;
    name: string;
    updated_at: Date;
  }

  interface Product {
    created_at: Date;
    description: string;
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    subcategory_id: number;
    updated_at: Date;
    subcategory_name: string;
  }

  type CartStatus = "active" | "archived" | "checked_out";

  interface Cart {
    archived_at: Date;
    checked_out_at: Date;
    created_at: Date;
    id: number;
    status: CartStatus;
    updated_at: Date;
    user_id: number;
  }

  interface CartItemWithPrice {
    id: number;
    price: number;
    quantity: number;
    name: string;
    description: string;
  }

  interface OrderItem {
    created_at: Date;
    id: number;
    order_id: number;
    price_at_purchase: number;
    product_id: number;
    quantity: number;
    updated_at: Date;
  }
}
