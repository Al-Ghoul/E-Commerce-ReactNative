export { };

declare global {
  export interface Category {
    created_at: Date;
    description: string;
    icon: string;
    id: number;
    name: string;
    updated_at: Date;
  }

  export interface Product {
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
}
