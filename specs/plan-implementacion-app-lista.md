# Plan de implementación — App de lista de compras (swipe + audio + offline)

Este documento es el brief técnico para pasarle a **Claude Code**. Pegalo como
`PLAN.md` en la raíz del repo y pedile que lo siga fase por fase (al final
hay un prompt de arranque sugerido).

---

## 0. Decisiones clave (y por qué)

| Decisión | Elección | Por qué |
|---|---|---|
| Plataforma | **React Native con Expo** (dev client, no Expo Go puro) | Una sola base de código para iOS/Android, se instala directo en tu teléfono, y podés acceder a módulos nativos (voz) que Expo Go no permite. |
| Storage | **AsyncStorage** con dos claves JSON (`catalog`, `trip`) | Mismo modelo que ya probamos en el prototipo web. Simple, 100% local, sin servidor. Si más adelante el catálogo crece mucho, se migra a SQLite sin tocar la UI. |
| Núcleo de la app (categorías, swipe, lista, alta manual) | **100% offline siempre** | No depende de red en ningún punto. |
| Audio → items | **Híbrido**: si hay internet, usa la API de Claude para interpretar mejor; si no hay internet, cae a un parser local + reconocimiento de voz nativo | Ver sección 4 — la voz 100% offline en todos los dispositivos es técnicamente compleja; este enfoque da buena experiencia la mayoría de las veces y no rompe la app cuando no hay señal. |
| Navegación | **Sin librería de navegación** (estado local, como el prototipo) | Solo hay 2 pantallas + 2 modales. Menos dependencias, port más directo del prototipo React que ya funciona. |
| Gestos | `react-native-gesture-handler` + `react-native-reanimated` | Estándar de la industria para swipe estilo Tinder, 60fps nativos (no CSS). |
| Catálogo inicial | **100 productos precargados**, agrupados en 10 categorías | Ver sección 7, con el array listo para pegar en el código. |

---

## 1. Stack técnico

- **Expo SDK (managed + dev client)** — `npx create-expo-app`
- **TypeScript** desde el día 1
- `@react-native-async-storage/async-storage` — persistencia
- `react-native-gesture-handler`, `react-native-reanimated` — swipe
- `@react-native-community/netinfo` — detectar online/offline
- `fuse.js` — matching difuso de texto contra el catálogo (para el parser offline de audio)
- Voz: `expo-speech-recognition` (community) o `@react-native-voice/voice` — dictado nativo
- `lucide-react-native` — mismos íconos que el prototipo web

No usamos Expo Go para el desarrollo final porque los módulos de voz nativos
requieren un **development build** (`npx expo prebuild` + `npx expo run:android`
o EAS Build). Expo Go sirve solo para probar UI/lógica sin voz al principio.

---

## 2. Modelo de datos

```ts
type Product = { id: string; name: string; freq: number };

type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: Product[];
};

type ListItem = {
  id: string;          // product id
  categoryId: string;
  name: string;
  bought: boolean;
};

type Catalog = { categories: Category[] };
type Trip = {
  list: ListItem[];
  indices: Record<string, number>; // progreso de swipe por categoría
  currentCategoryId: string;
};
```

Storage: `AsyncStorage.setItem('catalog', JSON.stringify(catalog))` y lo mismo
para `trip`. Es exactamente la misma forma que ya usamos en el prototipo web,
así que la lógica de negocio (upsert de producto, ordenar por frecuencia,
avanzar índice, etc.) se puede portar casi literal.

---

## 3. Qué funciona offline y qué no

| Función | Offline |
|---|---|
| Ver categorías, swipe, avanzar/retroceder | ✅ Siempre |
| Alta manual de producto | ✅ Siempre |
| Ver / marcar comprado / borrar de la lista | ✅ Siempre |
| Frecuencia de productos (orden "más usados primero") | ✅ Siempre (todo es local) |
| Dictado de audio → texto | ⚠️ Depende del dispositivo (ver sección 4) |
| Interpretar el texto y asignar categorías con Claude | ❌ Requiere internet — con fallback local |

La app debe mostrar un pequeño indicador (ej. un puntito gris/verde en el
header) de estado de conexión, y el botón de micrófono debe seguir
funcionando offline aunque con resultados más simples (ver abajo).

---

## 4. Estrategia de audio (con y sin internet)

**Paso 1 — Voz a texto (STT):**
- Usar el reconocimiento de voz nativo del sistema operativo
  (`expo-speech-recognition`), en español (`es-AR` / `es-ES`).
- En iOS, pedir `requiresOnDeviceRecognition: true` cuando esté disponible:
  esto hace que el STT corra 100% en el dispositivo.
- En Android, el STT nativo por defecto usa internet salvo que el usuario
  haya descargado el paquete de reconocimiento offline en Ajustes del
  sistema. La app puede detectar esto y avisar la primera vez
  ("Para dictar sin internet, activá el reconocimiento de voz offline en
  Ajustes > Idiomas").

**Paso 2 — Texto a items:**
- **Con internet:** igual que el prototipo web — llamar a la API de Claude
  con la transcripción y devolver `{items:[{name, category}]}`.
- **Sin internet:** parser local, sin IA:
  1. Separar la transcripción por conectores (`,`, ` y `, `también`, `además`).
  2. Limpiar cantidades/unidades con regex (`\d+\s*(kilos?|kg|litros?|gramos?|unidades?|paquetes?)`).
  3. Buscar cada frase resultante contra los nombres del catálogo con
     `fuse.js` (matching difuso, tolera errores de dictado).
  4. Si hay match → usar esa categoría. Si no → categoría "Otros" con el
     texto tal cual, capitalizado.

**Paso 3 — Revisión por swipe (igual en ambos casos):**
- Se muestra la pantalla de swipe de revisión que ya diseñamos (deslizar
  para aceptar/rechazar cada producto detectado), sin importar si vino del
  parser local o de Claude. Esto es clave: **la calidad de detección puede
  variar, pero la UX de corrección es siempre la misma**, así el usuario
  siempre tiene la última palabra.

> Nota de alcance: si en el futuro querés audio 100% offline garantizado en
> todos los dispositivos (sin depender de si el usuario activó el paquete
> offline de Android), la alternativa es embeber un modelo Whisper
> on-device con `whisper.rn` (whisper.cpp compilado para React Native).
> Es más pesado (modelo de ~75MB+, build nativo más complejo) — lo dejo
> como mejora de fase 2, no para el MVP.

---

## 5. Estructura de carpetas

```
lista-app/
  App.tsx
  src/
    theme/
      colors.ts        // AWNING, MUSTARD, SAGE, BRICK, PAPER, etc.
      typography.ts
    data/
      types.ts
      seed.ts           // los 100 productos iniciales (sección 7)
      storage.ts         // get/set catalog + trip en AsyncStorage
      catalogLogic.ts     // upsertItem, sortedItems, bumpFreq (portado del prototipo)
    hooks/
      useCatalog.ts
      useTrip.ts
      useSwipeGesture.ts   // pan gesture reanimado, reusado por swipe normal y revisión de audio
      useNetworkStatus.ts
    services/
      audioService.ts       // STT + parseTranscript (online/offline)
      claudeApi.ts           // fetch a la API de Claude
      localParser.ts          // fuse.js + regex fallback
    components/
      SwipeCard.tsx
      CategoryStrip.tsx
      BottomBar.tsx
      AddModal.tsx
      AudioSwipeReview.tsx
    screens/
      SwipeScreen.tsx
      ListScreen.tsx
```

---

## 6. Fases de implementación (para ir pidiéndole a Claude Code)

Cada fase es un pedido independiente. Recomiendo hacer commits chicos por
fase y probar en el teléfono antes de seguir.

- [ ] **Fase 0 — Setup del proyecto**
  - `npx create-expo-app lista-app -t expo-template-blank-typescript`
  - Instalar dependencias de la sección 1
  - Configurar `expo-dev-client` y confirmar que corre en el teléfono vía
    `npx expo run:android` (o `run:ios`)

- [ ] **Fase 1 — Capa de datos**
  - Tipos (`types.ts`), `seed.ts` con los 100 productos
  - `storage.ts` (AsyncStorage get/set)
  - `catalogLogic.ts` portado del prototipo web (`upsertItem`, `sortedItems`, etc.)
  - Tests manuales: guardar y recargar la app, confirmar que persiste

- [ ] **Fase 2 — Pantalla de swipe**
  - `CategoryStrip` (chips horizontales, salto rápido entre categorías)
  - `SwipeCard` con gesto pan (reanimated) — aceptar (derecha) / rechazar (izquierda)
  - Botones grandes ✕ / ✓ como alternativa al gesto
  - Estado "categoría completa" con reintentar / siguiente categoría

- [ ] **Fase 3 — Lista y alta manual**
  - `ListScreen` agrupada por categoría, checkbox comprado, borrar
  - `AddModal` (producto + categoría, opción de categoría nueva)
  - Botón flotante con contador de items

- [ ] **Fase 4 — Frecuencia**
  - Confirmar que swipe derecha / alta manual suman `freq`
  - Confirmar orden por frecuencia dentro de cada categoría
  - Mostrar "comprado N veces antes" en la tarjeta

- [ ] **Fase 5 — Audio (versión online)**
  - Integrar STT nativo (`expo-speech-recognition`)
  - `claudeApi.ts` — llamada a la API con la transcripción
  - `AudioSwipeReview` — misma mecánica de swipe que la fase 2, para
    aceptar/rechazar lo detectado

- [ ] **Fase 6 — Audio (fallback offline)**
  - `useNetworkStatus` con NetInfo
  - `localParser.ts` con fuse.js + limpieza de cantidades
  - Enrutar: si hay red → Claude; si no → parser local
  - Mensaje claro cuando el STT no está disponible offline en ese dispositivo

- [ ] **Fase 7 — Pulido**
  - Ícono y splash screen
  - Haptics al swipear (`expo-haptics`)
  - Indicador de conexión en el header
  - Accesibilidad: labels en botones, contraste

- [ ] **Fase 8 — Build e instalación en tu teléfono**
  - Ver sección 8

---

## 7. Catálogo inicial — 100 productos

Pegar tal cual en `src/data/seed.ts` (o adaptar el generador `mk`).

```ts
export const CATEGORIES_SEED = [
  { id: "frutas", name: "Frutas y Verduras", emoji: "🥬", color: "#4C7A3F", items: [
    "Tomate","Lechuga","Papa","Cebolla","Manzana","Banana","Limón","Zanahoria",
    "Palta","Naranja","Zapallito","Ajo","Pimiento","Choclo","Batata","Frutilla",
  ]},
  { id: "carnes", name: "Carnes y Pescados", emoji: "🥩", color: "#A6402F", items: [
    "Carne picada","Pollo","Milanesas","Pechuga de pollo","Chorizo","Asado",
    "Merluza","Jamón cocido","Fiambre","Salchichas","Bife de chorizo","Salmón",
  ]},
  { id: "lacteos", name: "Lácteos y Huevos", emoji: "🥛", color: "#3B6E8F", items: [
    "Leche","Yogur","Queso rallado","Queso cremoso","Manteca","Huevos",
    "Crema de leche","Queso en fetas","Dulce de leche",
  ]},
  { id: "panificados", name: "Panificados", emoji: "🥐", color: "#C08A2E", items: [
    "Pan","Facturas","Pan lactal","Galletitas","Medialunas","Pan rallado","Tostadas",
  ]},
  { id: "almacen", name: "Almacén", emoji: "🥫", color: "#8A6A2F", items: [
    "Arroz","Fideos","Aceite","Azúcar","Sal","Harina","Yerba mate","Café","Té",
    "Atún en lata","Puré de tomate","Lentejas","Papas fritas (snack)","Mayonesa",
    "Mostaza","Ketchup","Vinagre","Caldo en cubitos","Polenta","Miel",
  ]},
  { id: "bebidas", name: "Bebidas", emoji: "🥤", color: "#2F7A6E", items: [
    "Agua mineral","Gaseosa","Cerveza","Vino","Jugo","Soda","Agua saborizada","Energizante",
  ]},
  { id: "limpieza", name: "Limpieza", emoji: "🧽", color: "#4F5D75", items: [
    "Detergente","Lavandina","Papel higiénico","Servilletas","Esponja",
    "Trapo de piso","Bolsas de residuo","Suavizante","Limpiador multiuso","Papel de cocina",
  ]},
  { id: "higiene", name: "Higiene y Cuidado Personal", emoji: "🧴", color: "#7A4F6D", items: [
    "Shampoo","Jabón","Pasta dental","Desodorante","Toallitas húmedas",
    "Acondicionador","Cepillo de dientes","Rasuradora","Protector solar","Algodón",
  ]},
  { id: "congelados", name: "Congelados", emoji: "🧊", color: "#2E6F8E", items: [
    "Papas fritas congeladas","Verduras congeladas","Hamburguesas","Helado",
    "Empanadas congeladas","Pizza congelada",
  ]},
  { id: "mascotas", name: "Mascotas", emoji: "🐾", color: "#6B6558", items: [
    "Alimento para perro","Alimento para gato",
  ]},
  { id: "otros", name: "Otros", emoji: "🛒", color: "#6B6558", items: [] },
];

// Convierte el array de strings de arriba al formato Product[] con freq:0 e ids estables
export function buildInitialCatalog() {
  return CATEGORIES_SEED.map((c) => ({
    ...c,
    items: c.items.map((name, i) => ({
      id: `${c.id}-${i}`,
      name,
      freq: 0,
    })),
  }));
}
```

Total: 100 productos en 10 categorías + "Otros" vacía para lo que no encaje.

---

## 8. Cómo correrla en tu teléfono

Opción recomendada para uso personal (sin pasar por las tiendas de apps):

1. `npx expo prebuild` genera los proyectos nativos `ios/` y `android/`.
2. **Android:** `npx expo run:android` con el teléfono conectado por USB
   (modo desarrollador + depuración USB activada) instala la app directo.
   Para tener un `.apk` instalable sin cable: `eas build -p android --profile preview`
   (perfil de distribución interna) y lo descargás desde el link que te da EAS.
3. **iOS:** requiere una cuenta de Apple Developer (gratuita alcanza para
   instalar en tu propio dispositivo por 7 días, pagada para que no expire)
   y `npx expo run:ios` con el iPhone conectado, o `eas build -p ios --profile development`.

No hace falta publicar en las stores para uso personal.

---

## 9. Prompt de arranque sugerido para Claude Code

```
Leé PLAN.md completo. Vamos a implementarlo fase por fase.
Empezá SOLO por la Fase 0 y la Fase 1. Al terminar cada fase, mostrame
qué archivos creaste y cómo probarlo en el teléfono antes de seguir con
la siguiente fase. No instales dependencias fuera de las mencionadas en
la sección 1 sin preguntarme primero.
```

---

## 10. Ideas para más adelante (no MVP)

- Migrar storage a SQLite si el catálogo crece mucho
- Widget offline de "estado de sync" más detallado
- Exportar/importar la lista como JSON o compartir por WhatsApp
- Modo Whisper on-device (`whisper.rn`) para audio 100% offline garantizado
- Compartir la lista con otra persona (requeriría backend, hoy fuera de alcance)
