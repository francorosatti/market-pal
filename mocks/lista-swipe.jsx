import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Check,
  Plus,
  Mic,
  ShoppingCart,
  Trash2,
  RotateCcw,
  ArrowLeft,
  Loader2,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Paleta y tokens                                                     */
/* ------------------------------------------------------------------ */
const INK = "#20261F";
const PAPER = "#F1EEE2";
const PAPER_DARK = "#E7E2D0";
const AWNING = "#17352A";
const AWNING_DARK = "#0F241C";
const MUSTARD = "#E3A73E";
const SAGE = "#4C7A3F";
const BRICK = "#A6402F";
const MUTED = "#6B6558";

/* ------------------------------------------------------------------ */
/* Catálogo por defecto                                                */
/* ------------------------------------------------------------------ */
const mk = (catId, names) =>
  names.map((n, i) => ({ id: `${catId}-${i}`, name: n, freq: 0 }));

const CATEGORIES_DEFAULT = [
  {
    id: "frutas",
    name: "Frutas y Verduras",
    emoji: "🥬",
    color: "#4C7A3F",
    items: mk("frutas", [
      "Tomate",
      "Lechuga",
      "Papa",
      "Cebolla",
      "Manzana",
      "Banana",
      "Limón",
      "Zanahoria",
      "Palta",
      "Naranja",
      "Zapallito",
      "Ajo",
    ]),
  },
  {
    id: "carnes",
    name: "Carnes y Pescados",
    emoji: "🥩",
    color: "#A6402F",
    items: mk("carnes", [
      "Carne picada",
      "Pollo",
      "Milanesas",
      "Pechuga de pollo",
      "Chorizo",
      "Asado",
      "Merluza",
      "Jamón cocido",
      "Fiambre",
    ]),
  },
  {
    id: "lacteos",
    name: "Lácteos y Huevos",
    emoji: "🥛",
    color: "#3B6E8F",
    items: mk("lacteos", [
      "Leche",
      "Yogur",
      "Queso rallado",
      "Queso cremoso",
      "Manteca",
      "Huevos",
      "Crema de leche",
    ]),
  },
  {
    id: "panificados",
    name: "Panificados",
    emoji: "🥐",
    color: "#C08A2E",
    items: mk("panificados", [
      "Pan",
      "Facturas",
      "Pan lactal",
      "Galletitas",
      "Medialunas",
    ]),
  },
  {
    id: "almacen",
    name: "Almacén",
    emoji: "🥫",
    color: "#8A6A2F",
    items: mk("almacen", [
      "Arroz",
      "Fideos",
      "Aceite",
      "Azúcar",
      "Sal",
      "Harina",
      "Yerba mate",
      "Café",
      "Té",
      "Atún en lata",
      "Puré de tomate",
      "Lentejas",
      "Papas fritas (snack)",
    ]),
  },
  {
    id: "bebidas",
    name: "Bebidas",
    emoji: "🥤",
    color: "#2F7A6E",
    items: mk("bebidas", [
      "Agua mineral",
      "Gaseosa",
      "Cerveza",
      "Vino",
      "Jugo",
    ]),
  },
  {
    id: "limpieza",
    name: "Limpieza",
    emoji: "🧽",
    color: "#4F5D75",
    items: mk("limpieza", [
      "Detergente",
      "Lavandina",
      "Papel higiénico",
      "Servilletas",
      "Esponja",
      "Trapo de piso",
      "Bolsas de residuo",
    ]),
  },
  {
    id: "higiene",
    name: "Higiene",
    emoji: "🧴",
    color: "#7A4F6D",
    items: mk("higiene", [
      "Shampoo",
      "Jabón",
      "Pasta dental",
      "Desodorante",
      "Toallitas húmedas",
    ]),
  },
  {
    id: "congelados",
    name: "Congelados",
    emoji: "🧊",
    color: "#2E6F8E",
    items: mk("congelados", [
      "Papas fritas congeladas",
      "Verduras congeladas",
      "Hamburguesas",
      "Helado",
    ]),
  },
  { id: "otros", name: "Otros", emoji: "🛒", color: MUTED, items: [] },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const norm = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const uid = () => `c-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const sortedItems = (category) =>
  [...category.items].sort(
    (a, b) => b.freq - a.freq || a.name.localeCompare(b.name, "es")
  );

/** Busca un producto por nombre dentro de una categoría, o lo crea.
 * Devuelve { categories, item, isNew } de forma inmutable. */
function upsertItem(categories, categoryId, rawName) {
  const name = cap(rawName.trim());
  const catIndex = categories.findIndex((c) => c.id === categoryId);
  if (catIndex === -1) return { categories, item: null, isNew: false };
  const cat = categories[catIndex];
  const existingIdx = cat.items.findIndex((it) => norm(it.name) === norm(name));
  let newItems;
  let item;
  let isNew = false;
  if (existingIdx >= 0) {
    newItems = cat.items.map((it, i) =>
      i === existingIdx ? { ...it, freq: it.freq + 1 } : it
    );
    item = newItems[existingIdx];
  } else {
    item = { id: uid(), name, freq: 1 };
    newItems = [...cat.items, item];
    isNew = true;
  }
  const newCategories = categories.map((c, i) =>
    i === catIndex ? { ...c, items: newItems } : c
  );
  return { categories: newCategories, item, isNew };
}

async function parseTranscriptToItems(transcript, categories) {
  const categoryNames = categories.map((c) => c.name).join(", ");
  const system = `Sos un asistente que convierte lo que alguien dice en voz alta pidiendo hacer compras, en una lista estructurada de productos. Devolvé ÚNICAMENTE un JSON válido, sin texto adicional, sin markdown y sin explicaciones, con este formato exacto: {"items":[{"name":"Tomate","category":"Frutas y Verduras"}]}. Las categorías disponibles son: ${categoryNames}. Si un producto no encaja en ninguna, usá "Otros". Cada nombre debe quedar en singular, con la primera letra en mayúscula, y sin cantidades ni unidades (por ejemplo "dos kilos de papa" se convierte en "Papa"). Ignorá muletillas o palabras que no sean productos.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: transcript }],
    }),
  });
  if (!response.ok) throw new Error("API error");
  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) throw new Error("Sin respuesta de texto");
  let raw = textBlock.text.trim();
  raw = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.items) ? parsed.items : [];
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [categories, setCategories] = useState(CATEGORIES_DEFAULT);
  const [list, setList] = useState([]); // {id,name,categoryId,bought}
  const [indices, setIndices] = useState({}); // {categoryId: number}
  const [currentCategoryId, setCurrentCategoryId] = useState(
    CATEGORIES_DEFAULT[0].id
  );
  const [view, setView] = useState("swipe"); // swipe | list
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  const [recording, setRecording] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [audioQueue, setAudioQueue] = useState(null); // items sugeridos, para revisar con swipe
  const recognitionRef = useRef(null);

  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState(null); // 'left' | 'right' | null
  const dragStart = useRef(null);
  const stageRef = useRef(null);

  /* ---------- fuentes ---------- */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  /* ---------- carga inicial ---------- */
  useEffect(() => {
    (async () => {
      try {
        const c = await window.storage.get("catalog");
        if (c && c.value) {
          const parsed = JSON.parse(c.value);
          if (parsed.categories) setCategories(parsed.categories);
        }
      } catch (e) {
        /* no hay catálogo guardado todavía */
      }
      try {
        const t = await window.storage.get("trip");
        if (t && t.value) {
          const parsed = JSON.parse(t.value);
          if (parsed.list) setList(parsed.list);
          if (parsed.indices) setIndices(parsed.indices);
          if (parsed.currentCategoryId)
            setCurrentCategoryId(parsed.currentCategoryId);
        }
      } catch (e) {
        /* no hay viaje guardado todavía */
      }
      setLoaded(true);
    })();
  }, []);

  /* ---------- guardado ---------- */
  useEffect(() => {
    if (!loaded) return;
    window.storage
      .set("catalog", JSON.stringify({ categories }))
      .catch(() => {});
  }, [categories, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage
      .set("trip", JSON.stringify({ list, indices, currentCategoryId }))
      .catch(() => {});
  }, [list, indices, currentCategoryId, loaded]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast((m) => (m === msg ? null : m)), 2200);
  }, []);

  const currentCategory =
    categories.find((c) => c.id === currentCategoryId) || categories[0];
  const items = sortedItems(currentCategory);
  const currentIndex = indices[currentCategoryId] || 0;
  const currentItem = items[currentIndex];
  const remaining = Math.max(items.length - currentIndex, 0);
  const nextItem = items[currentIndex + 1];

  const listCount = list.length;

  /* ---------- acciones de swipe ---------- */
  const advance = () =>
    setIndices((prev) => ({ ...prev, [currentCategoryId]: currentIndex + 1 }));

  const addToList = (item) => {
    setList((prev) => {
      if (prev.some((p) => p.id === item.id && p.categoryId === currentCategoryId))
        return prev;
      return [
        ...prev,
        { id: item.id, name: item.name, categoryId: currentCategoryId, bought: false },
      ];
    });
  };

  const bumpFreq = (item) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== currentCategoryId
          ? c
          : {
              ...c,
              items: c.items.map((it) =>
                it.id === item.id ? { ...it, freq: it.freq + 1 } : it
              ),
            }
      )
    );
  };

  const commitSwipe = (direction) => {
    if (!currentItem) return;
    if (direction === "right") {
      bumpFreq(currentItem);
      addToList(currentItem);
    }
    advance();
    setDrag({ x: 0, y: 0 });
    setExiting(null);
  };

  const triggerSwipe = (direction) => {
    if (exiting || !currentItem) return;
    setExiting(direction);
    setTimeout(() => commitSwipe(direction), 220);
  };

  /* ---------- gestos táctiles ---------- */
  const onPointerDown = (e) => {
    if (exiting) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragStart.current || exiting) return;
    setDrag({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const onPointerUp = () => {
    if (!dragStart.current) return;
    dragStart.current = null;
    if (drag.x > 110) triggerSwipe("right");
    else if (drag.x < -110) triggerSwipe("left");
    else setDrag({ x: 0, y: 0 });
  };

  const jumpToNextCategory = () => {
    const idx = categories.findIndex((c) => c.id === currentCategoryId);
    const nextIdx = (idx + 1) % categories.length;
    setCurrentCategoryId(categories[nextIdx].id);
  };

  const resetCategory = () => {
    setIndices((prev) => ({ ...prev, [currentCategoryId]: 0 }));
  };

  /* ---------- agregado manual ---------- */
  const handleManualAdd = ({ name, categoryId, newCategoryName }) => {
    let cats = categories;
    let targetId = categoryId;
    if (categoryId === "__new__" && newCategoryName && newCategoryName.trim()) {
      const id = uid();
      cats = [
        ...cats,
        { id, name: cap(newCategoryName.trim()), emoji: "🛒", color: MUTED, items: [] },
      ];
      targetId = id;
    }
    if (!name.trim()) return;
    const { categories: updated, item } = upsertItem(cats, targetId, name);
    setCategories(updated);
    if (item) {
      setList((prev) => {
        if (prev.some((p) => p.id === item.id && p.categoryId === targetId))
          return prev;
        return [...prev, { id: item.id, name: item.name, categoryId: targetId, bought: false }];
      });
    }
    setCurrentCategoryId(targetId);
    setShowAdd(false);
    showToast(`Agregado: ${cap(name.trim())}`);
  };

  /* ---------- audio ---------- */
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("Tu navegador no soporta dictado por voz. Probá con Chrome.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "es-AR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setRecording(true);
    recognition.onerror = () => {
      setRecording(false);
      showToast("No se pudo escuchar el audio. Intentá de nuevo.");
    };
    recognition.onend = () => setRecording(false);
    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setRecording(false);
      setParsing(true);
      try {
        const parsed = await parseTranscriptToItems(transcript, categories);
        const withCats = parsed
          .filter((p) => p && p.name)
          .map((p) => {
            const match = categories.find(
              (c) => norm(c.name) === norm(p.category || "")
            );
            return {
              tempId: uid(),
              name: cap(p.name.trim()),
              categoryId: match ? match.id : "otros",
              categoryName: match ? match.name : "Otros",
            };
          });
        if (withCats.length === 0) {
          showToast("No reconocimos productos en el audio.");
        } else {
          setAudioQueue(withCats);
        }
      } catch (err) {
        showToast("No pudimos procesar el audio. Intentá de nuevo.");
      } finally {
        setParsing(false);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  // Se llama cuando termina (o se cierra) la revisión por swipe del audio,
  // con los items que el usuario aceptó deslizando a la derecha.
  const acceptAudioBatch = (acceptedItems) => {
    if (!acceptedItems || acceptedItems.length === 0) return;
    let cats = categories;
    const newlyListed = [];
    acceptedItems.forEach((i) => {
      const { categories: updated, item } = upsertItem(cats, i.categoryId, i.name);
      cats = updated;
      if (item) newlyListed.push({ id: item.id, name: item.name, categoryId: i.categoryId, bought: false });
    });
    setCategories(cats);
    setList((prev) => {
      const merged = [...prev];
      newlyListed.forEach((ni) => {
        if (!merged.some((p) => p.id === ni.id && p.categoryId === ni.categoryId))
          merged.push(ni);
      });
      return merged;
    });
    showToast(`Se agregaron ${newlyListed.length} producto(s)`);
  };

  /* ---------- lista ---------- */
  const toggleBought = (id, categoryId) => {
    setList((prev) =>
      prev.map((it) =>
        it.id === id && it.categoryId === categoryId ? { ...it, bought: !it.bought } : it
      )
    );
  };

  const removeFromList = (id, categoryId) => {
    setList((prev) => prev.filter((it) => !(it.id === id && it.categoryId === categoryId)));
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : {
              ...c,
              items: c.items.map((it) =>
                it.id === id ? { ...it, freq: Math.max(0, it.freq - 1) } : it
              ),
            }
      )
    );
  };

  const clearTrip = () => {
    if (list.length > 0 && !window.confirm("¿Vaciar la lista actual?")) return;
    setList([]);
    setIndices({});
  };

  if (!loaded) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 className="spin" size={28} color={PAPER} />
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <GlobalStyle />
      {view === "swipe" ? (
        <SwipeScreen
          categories={categories}
          currentCategoryId={currentCategoryId}
          setCurrentCategoryId={setCurrentCategoryId}
          currentCategory={currentCategory}
          currentItem={currentItem}
          nextItem={nextItem}
          remaining={remaining}
          items={items}
          drag={drag}
          exiting={exiting}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          triggerSwipe={triggerSwipe}
          jumpToNextCategory={jumpToNextCategory}
          resetCategory={resetCategory}
          listCount={listCount}
          openList={() => setView("list")}
          openAdd={() => setShowAdd(true)}
          recording={recording}
          parsing={parsing}
          onMicDown={startRecording}
          onMicUp={stopRecording}
          indices={indices}
        />
      ) : (
        <ListScreen
          list={list}
          categories={categories}
          onBack={() => setView("swipe")}
          toggleBought={toggleBought}
          removeFromList={removeFromList}
          clearTrip={clearTrip}
        />
      )}

      {showAdd && (
        <AddModal
          categories={categories}
          defaultCategoryId={currentCategoryId}
          onClose={() => setShowAdd(false)}
          onSubmit={handleManualAdd}
        />
      )}

      {audioQueue && (
        <AudioSwipeReview
          items={audioQueue}
          onDone={(accepted) => {
            acceptAudioBatch(accepted);
            setAudioQueue(null);
          }}
        />
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pantalla de swipe                                                   */
/* ------------------------------------------------------------------ */
function SwipeScreen({
  categories,
  currentCategoryId,
  setCurrentCategoryId,
  currentCategory,
  currentItem,
  nextItem,
  remaining,
  drag,
  exiting,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  triggerSwipe,
  jumpToNextCategory,
  resetCategory,
  listCount,
  openList,
  openAdd,
  recording,
  parsing,
  onMicDown,
  onMicUp,
  indices,
}) {
  const rotate = drag.x / 18;
  const exitTransform =
    exiting === "right"
      ? "translate(140%, -10%) rotate(24deg)"
      : exiting === "left"
      ? "translate(-140%, -10%) rotate(-24deg)"
      : `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`;

  const showRight = drag.x > 40;
  const showLeft = drag.x < -40;

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>LA LISTA</div>
          <div style={styles.tagline}>deslizá para armar tu compra</div>
        </div>
        <button style={styles.cartBtn} onClick={openList} aria-label="Ver lista">
          <ShoppingCart size={20} color={PAPER} />
          {listCount > 0 && <span style={styles.cartBadge}>{listCount}</span>}
        </button>
      </header>

      <CategoryStrip
        categories={categories}
        currentCategoryId={currentCategoryId}
        setCurrentCategoryId={setCurrentCategoryId}
        indices={indices}
      />

      <div style={styles.stage}>
        {currentItem ? (
          <>
            {nextItem && (
              <div style={{ ...styles.card, ...styles.cardBack, borderColor: currentCategory.color }}>
                <div style={{ ...styles.cardEmoji }}>{currentCategory.emoji}</div>
              </div>
            )}
            <div
              style={{
                ...styles.card,
                borderColor: currentCategory.color,
                transform: exitTransform,
                transition: exiting || (!drag.x && !drag.y) ? "transform 220ms ease" : "none",
                touchAction: "none",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div style={styles.cardEmojiWatermark}>{currentCategory.emoji}</div>
              <div style={styles.cardCategoryLabel}>{currentCategory.name}</div>
              <div style={styles.cardName}>{currentItem.name}</div>
              {currentItem.freq > 0 && (
                <div style={styles.cardFreq}>
                  Comprado {currentItem.freq} {currentItem.freq === 1 ? "vez" : "veces"} antes
                </div>
              )}
              <div style={{ ...styles.stamp, ...styles.stampYes, opacity: showRight ? 1 : 0 }}>
                LO LLEVO
              </div>
              <div style={{ ...styles.stamp, ...styles.stampNo, opacity: showLeft ? 1 : 0 }}>
                PASO
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...styles.card, borderColor: currentCategory.color, borderStyle: "dashed" }}>
            <div style={styles.cardEmojiWatermark}>{currentCategory.emoji}</div>
            <div style={styles.doneTitle}>¡Terminaste {currentCategory.name}!</div>
            <div style={styles.doneSub}>Repasá de nuevo o pasá a la próxima categoría.</div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button style={styles.ghostBtn} onClick={resetCategory}>
                <RotateCcw size={16} /> Repasar
              </button>
              <button style={styles.primaryBtn} onClick={jumpToNextCategory}>
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.counter}>
        {currentItem ? `${remaining} producto${remaining === 1 ? "" : "s"} en esta categoría` : ""}
      </div>

      <div style={styles.bottomBar}>
        <button
          style={{ ...styles.circleBtn, ...styles.circleBtnBig, background: BRICK }}
          onClick={() => triggerSwipe("left")}
          disabled={!currentItem}
          aria-label="Paso"
        >
          <X size={26} color={PAPER} />
        </button>
        <button style={styles.circleBtn} onClick={openAdd} aria-label="Agregar manualmente">
          <Plus size={20} color={INK} />
        </button>
        <button
          style={{
            ...styles.circleBtn,
            background: recording ? BRICK : parsing ? MUTED : PAPER_DARK,
          }}
          onMouseDown={onMicDown}
          onMouseUp={onMicUp}
          onTouchStart={onMicDown}
          onTouchEnd={onMicUp}
          aria-label="Agregar por audio"
        >
          {parsing ? (
            <Loader2 className="spin" size={20} color={INK} />
          ) : (
            <Mic size={20} color={recording ? PAPER : INK} className={recording ? "pulse" : ""} />
          )}
        </button>
        <button
          style={{ ...styles.circleBtn, ...styles.circleBtnBig, background: SAGE }}
          onClick={() => triggerSwipe("right")}
          disabled={!currentItem}
          aria-label="Lo llevo"
        >
          <Check size={26} color={PAPER} />
        </button>
      </div>
      {recording && <div style={styles.recordingHint}>Escuchando… soltá cuando termines</div>}
    </div>
  );
}

function CategoryStrip({ categories, currentCategoryId, setCurrentCategoryId, indices }) {
  return (
    <div style={styles.chipStrip}>
      {categories.map((c) => {
        const left = Math.max(c.items.length - (indices[c.id] || 0), 0);
        const active = c.id === currentCategoryId;
        return (
          <button
            key={c.id}
            onClick={() => setCurrentCategoryId(c.id)}
            style={{
              ...styles.chip,
              background: active ? c.color : PAPER_DARK,
              color: active ? PAPER : INK,
            }}
          >
            <span style={{ marginRight: 6 }}>{c.emoji}</span>
            {c.name}
            {left > 0 && (
              <span style={{ ...styles.chipBadge, opacity: active ? 0.9 : 0.55 }}>{left}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pantalla de lista                                                   */
/* ------------------------------------------------------------------ */
function ListScreen({ list, categories, onBack, toggleBought, removeFromList, clearTrip }) {
  const byCategory = categories
    .map((c) => ({ cat: c, items: list.filter((i) => i.categoryId === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <button style={styles.iconGhost} onClick={onBack} aria-label="Volver">
          <ArrowLeft size={20} color={PAPER} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={styles.logo}>TU LISTA</div>
          <div style={styles.tagline}>{list.length} producto{list.length === 1 ? "" : "s"}</div>
        </div>
        <div style={{ width: 40 }} />
      </header>

      <div style={styles.listBody}>
        {byCategory.length === 0 && (
          <div style={styles.emptyState}>
            Todavía no agregaste nada. Volvé y deslizá a la derecha lo que necesites.
          </div>
        )}
        {byCategory.map(({ cat, items }) => (
          <div key={cat.id} style={{ marginBottom: 18 }}>
            <div style={styles.groupHeader}>
              <span style={{ ...styles.dot, background: cat.color }} />
              {cat.name}
            </div>
            {items.map((it) => (
              <div key={it.id} style={styles.listRow}>
                <button
                  style={{
                    ...styles.checkbox,
                    background: it.bought ? SAGE : "transparent",
                    borderColor: it.bought ? SAGE : MUTED,
                  }}
                  onClick={() => toggleBought(it.id, it.categoryId)}
                >
                  {it.bought && <Check size={14} color={PAPER} />}
                </button>
                <span
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    textDecoration: it.bought ? "line-through" : "none",
                    color: it.bought ? MUTED : INK,
                  }}
                >
                  {it.name}
                </span>
                <button style={styles.trashBtn} onClick={() => removeFromList(it.id, it.categoryId)}>
                  <Trash2 size={16} color={MUTED} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {list.length > 0 && (
        <div style={{ padding: "0 20px 20px" }}>
          <button style={styles.dangerBtn} onClick={clearTrip}>
            Vaciar lista
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal: agregar manualmente                                          */
/* ------------------------------------------------------------------ */
function AddModal({ categories, defaultCategoryId, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [newCategoryName, setNewCategoryName] = useState("");

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalTitle}>Agregar producto</div>
        <input
          autoFocus
          style={styles.input}
          placeholder="¿Qué necesitás?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          style={styles.input}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
          <option value="__new__">+ Nueva categoría…</option>
        </select>
        {categoryId === "__new__" && (
          <input
            style={styles.input}
            placeholder="Nombre de la categoría"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button style={styles.ghostBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            style={styles.primaryBtn}
            onClick={() => onSubmit({ name, categoryId, newCategoryName })}
            disabled={!name.trim()}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pantalla: revisar con swipe lo que entendió del audio                */
/* ------------------------------------------------------------------ */
function AudioSwipeReview({ items, onDone }) {
  const [index, setIndex] = useState(0);
  const [accepted, setAccepted] = useState([]);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState(null);
  const dragStart = useRef(null);
  const acceptedRef = useRef([]);

  const current = items[index];
  const finished = index >= items.length;
  const rotate = drag.x / 18;
  const exitTransform =
    exiting === "right"
      ? "translate(140%, -10%) rotate(24deg)"
      : exiting === "left"
      ? "translate(-140%, -10%) rotate(-24deg)"
      : `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`;
  const showRight = drag.x > 40;
  const showLeft = drag.x < -40;

  const commit = (direction) => {
    if (direction === "right") {
      acceptedRef.current = [...acceptedRef.current, current];
      setAccepted(acceptedRef.current);
    }
    setIndex((i) => i + 1);
    setDrag({ x: 0, y: 0 });
    setExiting(null);
  };

  const trigger = (direction) => {
    if (exiting || !current) return;
    setExiting(direction);
    setTimeout(() => commit(direction), 220);
  };

  const onPointerDown = (e) => {
    if (exiting) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragStart.current || exiting) return;
    setDrag({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onPointerUp = () => {
    if (!dragStart.current) return;
    dragStart.current = null;
    if (drag.x > 110) trigger("right");
    else if (drag.x < -110) trigger("left");
    else setDrag({ x: 0, y: 0 });
  };

  return (
    <div style={styles.audioOverlay}>
      <div style={styles.screen}>
        <header style={styles.header}>
          <div>
            <div style={styles.logo}>REVISÁ EL AUDIO</div>
            <div style={styles.tagline}>
              {finished ? "Listo" : `${index + 1} de ${items.length}`}
            </div>
          </div>
          <button
            style={styles.iconGhost}
            onClick={() => onDone(acceptedRef.current)}
            aria-label="Cerrar"
          >
            <X size={20} color={PAPER} />
          </button>
        </header>

        <div style={styles.stage}>
          {!finished ? (
            <div
              style={{
                ...styles.card,
                borderColor: MUSTARD,
                transform: exitTransform,
                transition: exiting || (!drag.x && !drag.y) ? "transform 220ms ease" : "none",
                touchAction: "none",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div style={styles.cardCategoryLabel}>{current.categoryName}</div>
              <div style={styles.cardName}>{current.name}</div>
              <div style={{ ...styles.stamp, ...styles.stampYes, opacity: showRight ? 1 : 0 }}>
                LO LLEVO
              </div>
              <div style={{ ...styles.stamp, ...styles.stampNo, opacity: showLeft ? 1 : 0 }}>
                NO ERA
              </div>
            </div>
          ) : (
            <div style={{ ...styles.card, borderColor: MUSTARD, borderStyle: "dashed" }}>
              <div style={styles.doneTitle}>
                Agregaste {accepted.length} de {items.length}
              </div>
              <div style={styles.doneSub}>
                Revisamos todo lo que se entendió del audio.
              </div>
              <button
                style={{ ...styles.primaryBtn, marginTop: 18 }}
                onClick={() => onDone(acceptedRef.current)}
              >
                Listo
              </button>
            </div>
          )}
        </div>

        {!finished && (
          <div style={styles.bottomBar}>
            <button
              style={{ ...styles.circleBtn, ...styles.circleBtnBig, background: BRICK }}
              onClick={() => trigger("left")}
              aria-label="No era esto"
            >
              <X size={26} color={PAPER} />
            </button>
            <button
              style={{ ...styles.circleBtn, ...styles.circleBtnBig, background: SAGE }}
              onClick={() => trigger("right")}
              aria-label="Lo llevo"
            >
              <Check size={26} color={PAPER} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos globales (keyframes)                                        */
/* ------------------------------------------------------------------ */
function GlobalStyle() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      .spin { animation: spin 1s linear infinite; }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      .pulse { animation: pulse 1s ease-in-out infinite; }
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { display: none; }
    `}</style>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                              */
/* ------------------------------------------------------------------ */
const styles = {
  appShell: {
    minHeight: "100vh",
    background: AWNING_DARK,
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Work Sans', sans-serif",
    color: INK,
  },
  loadingScreen: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: AWNING_DARK,
  },
  screen: {
    width: "100%",
    maxWidth: 430,
    minHeight: "100vh",
    background: PAPER,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    background: AWNING,
    padding: "18px 20px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26,
    letterSpacing: 1.5,
    color: PAPER,
    lineHeight: 1,
  },
  tagline: { fontSize: 12, color: "#C9CDBE", marginTop: 2 },
  cartBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: 12,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: MUSTARD,
    color: AWNING_DARK,
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  iconGhost: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: 12,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  chipStrip: {
    display: "flex",
    gap: 8,
    padding: "14px 16px",
    overflowX: "auto",
    background: PAPER,
    borderBottom: `1px solid ${PAPER_DARK}`,
  },
  chip: {
    flexShrink: 0,
    border: "none",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  chipBadge: { marginLeft: 6, fontSize: 11 },
  stage: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px 24px 0",
  },
  card: {
    position: "absolute",
    width: "100%",
    maxWidth: 320,
    height: 380,
    background: "#FAF8F0",
    border: "3px solid",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(15,36,28,0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    textAlign: "center",
    userSelect: "none",
    cursor: "grab",
  },
  cardBack: {
    transform: "scale(0.94) translateY(10px)",
    opacity: 0.6,
    boxShadow: "none",
  },
  cardEmoji: { fontSize: 60, opacity: 0.5 },
  cardEmojiWatermark: {
    position: "absolute",
    top: 18,
    fontSize: 34,
    opacity: 0.35,
  },
  cardCategoryLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    color: MUTED,
    marginTop: 46,
  },
  cardName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 42,
    lineHeight: 1.05,
    marginTop: 10,
    color: INK,
  },
  cardFreq: { fontSize: 13, color: MUTED, marginTop: 14 },
  stamp: {
    position: "absolute",
    top: 30,
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26,
    letterSpacing: 2,
    padding: "4px 14px",
    border: "3px solid",
    borderRadius: 8,
    transform: "rotate(-8deg)",
    transition: "opacity 120ms ease",
  },
  stampYes: { left: 22, color: SAGE, borderColor: SAGE },
  stampNo: { right: 22, color: BRICK, borderColor: BRICK, transform: "rotate(8deg)" },
  doneTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, marginTop: 46 },
  doneSub: { fontSize: 13, color: MUTED, marginTop: 8, maxWidth: 220 },
  counter: {
    textAlign: "center",
    fontSize: 12,
    color: MUTED,
    padding: "10px 0 4px",
  },
  bottomBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: "16px 20px 28px",
  },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    border: "none",
    background: PAPER_DARK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  circleBtnBig: { width: 58, height: 58 },
  recordingHint: {
    textAlign: "center",
    fontSize: 12,
    color: BRICK,
    paddingBottom: 14,
    marginTop: -14,
  },
  primaryBtn: {
    background: AWNING,
    color: PAPER,
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    flex: 1,
  },
  ghostBtn: {
    background: "transparent",
    color: INK,
    border: `1.5px solid ${PAPER_DARK}`,
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    flex: 1,
  },
  dangerBtn: {
    width: "100%",
    background: "transparent",
    color: BRICK,
    border: `1.5px solid ${BRICK}`,
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  listBody: { flex: 1, overflowY: "auto", padding: "16px 20px" },
  emptyState: { color: MUTED, fontSize: 14, textAlign: "center", marginTop: 40 },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 700,
    color: MUTED,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dot: { width: 8, height: 8, borderRadius: "50%", marginRight: 8 },
  listRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: `1px solid ${PAPER_DARK}`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "transparent",
    flexShrink: 0,
  },
  trashBtn: { background: "none", border: "none", cursor: "pointer", padding: 6 },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,36,28,0.55)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 50,
  },
  audioOverlay: {
    position: "fixed",
    inset: 0,
    background: AWNING_DARK,
    display: "flex",
    justifyContent: "center",
    zIndex: 55,
  },
  modalCard: {
    background: PAPER,
    width: "100%",
    maxWidth: 430,
    borderRadius: "20px 20px 0 0",
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  modalTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${PAPER_DARK}`,
    fontSize: 14,
    fontFamily: "'Work Sans', sans-serif",
    background: "#fff",
  },
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: AWNING,
    color: PAPER,
    padding: "10px 18px",
    borderRadius: 999,
    fontSize: 13,
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    zIndex: 60,
  },
};
