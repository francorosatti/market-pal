import { Catalog, Category } from "./types";

export const CATEGORIES_SEED = [
  {
    id: "frutas",
    name: "Frutas y Verduras",
    emoji: "🥬",
    color: "#4C7A3F",
    items: [
      "Tomate", "Lechuga", "Papa", "Cebolla", "Manzana", "Banana", "Limón", "Zanahoria",
      "Palta", "Naranja", "Zapallito", "Ajo", "Pimiento", "Choclo", "Batata", "Frutilla",
    ],
  },
  {
    id: "carnes",
    name: "Carnes y Pescados",
    emoji: "🥩",
    color: "#A6402F",
    items: [
      "Carne picada", "Pollo", "Milanesas", "Pechuga de pollo", "Chorizo", "Asado",
      "Merluza", "Jamón cocido", "Fiambre", "Salchichas", "Bife de chorizo", "Salmón",
    ],
  },
  {
    id: "lacteos",
    name: "Lácteos y Huevos",
    emoji: "🥛",
    color: "#3B6E8F",
    items: [
      "Leche", "Yogur", "Queso rallado", "Queso cremoso", "Manteca", "Huevos",
      "Crema de leche", "Queso en fetas", "Dulce de leche",
    ],
  },
  {
    id: "panificados",
    name: "Panificados",
    emoji: "🥐",
    color: "#C08A2E",
    items: ["Pan", "Facturas", "Pan lactal", "Galletitas", "Medialunas", "Pan rallado", "Tostadas"],
  },
  {
    id: "almacen",
    name: "Almacén",
    emoji: "🥫",
    color: "#8A6A2F",
    items: [
      "Arroz", "Fideos", "Aceite", "Azúcar", "Sal", "Harina", "Yerba mate", "Café", "Té",
      "Atún en lata", "Puré de tomate", "Lentejas", "Papas fritas (snack)", "Mayonesa",
      "Mostaza", "Ketchup", "Vinagre", "Caldo en cubitos", "Polenta", "Miel",
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    emoji: "🥤",
    color: "#2F7A6E",
    items: ["Agua mineral", "Gaseosa", "Cerveza", "Vino", "Jugo", "Soda", "Agua saborizada", "Energizante"],
  },
  {
    id: "limpieza",
    name: "Limpieza",
    emoji: "🧽",
    color: "#4F5D75",
    items: [
      "Detergente", "Lavandina", "Papel higiénico", "Servilletas", "Esponja",
      "Trapo de piso", "Bolsas de residuo", "Suavizante", "Limpiador multiuso", "Papel de cocina",
    ],
  },
  {
    id: "higiene",
    name: "Higiene y Cuidado Personal",
    emoji: "🧴",
    color: "#7A4F6D",
    items: [
      "Shampoo", "Jabón", "Pasta dental", "Desodorante", "Toallitas húmedas",
      "Acondicionador", "Cepillo de dientes", "Rasuradora", "Protector solar", "Algodón",
    ],
  },
  {
    id: "congelados",
    name: "Congelados",
    emoji: "🧊",
    color: "#2E6F8E",
    items: [
      "Papas fritas congeladas", "Verduras congeladas", "Hamburguesas", "Helado",
      "Empanadas congeladas", "Pizza congelada",
    ],
  },
  {
    id: "mascotas",
    name: "Mascotas",
    emoji: "🐾",
    color: "#6B6558",
    items: ["Alimento para perro", "Alimento para gato"],
  },
  { id: "otros", name: "Otros", emoji: "🛒", color: "#6B6558", items: [] as string[] },
];

export function buildInitialCatalog(): Catalog {
  const categories: Category[] = CATEGORIES_SEED.map((c) => ({
    ...c,
    items: c.items.map((name, i) => ({
      id: `${c.id}-${i}`,
      name,
      freq: 0,
    })),
  }));
  return { categories };
}
