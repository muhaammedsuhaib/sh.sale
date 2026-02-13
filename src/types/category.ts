export interface Category {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  parent?: string | null;
  shop?: string;
  branch?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
}

export type CategoryLabel = {
  _id: string;
  name: string;
  parent?: string | null;
  is_active: boolean;
};

export interface CategoriesParams {
  search?: string;
  status?: string;
  parent?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CategoryStats {
  total_categories_count: number;
  active_categories_count: number;
  parent_categories_count: number;
  subcategories_count: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  images: string[];
  urlInput?: string;
  parent: string | null;
  is_active: boolean;
}
