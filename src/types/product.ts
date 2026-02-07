export interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  parent?: string | null;
  shop?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
}

export type ProductLabel = {
  _id: string;
  name: string;
  parent?: string | null;
  is_active: boolean;
};

export interface ProductsParams {
  search?: string;
  status?: string;
  parent?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface productStats {
  total_products_count: number;
  active_products_count: number;
  low_stock_count: number;
  inventory_amount: number;
}

export interface productFormData {
  name: string;
  description: string;
  images: string[];
  urlInput?: string;
  category: string | null;
  is_active: boolean;
  type: "simple" | "variant";
  stock_alert: boolean;
}
