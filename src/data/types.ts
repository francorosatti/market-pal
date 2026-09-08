export type Product = { id: string; name: string; freq: number };

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: Product[];
};

export type ListItem = {
  id: string; // product id
  categoryId: string;
  name: string;
  bought: boolean;
};

export type Catalog = { categories: Category[] };

export type TripStatus = "active" | "done";

export type Trip = {
  id: string;
  status: TripStatus;
  createdAt: number;
  completedAt: number | null;
  list: ListItem[];
  indices: Record<string, number>; // progreso de swipe por categoría
  currentCategoryId: string;
};
