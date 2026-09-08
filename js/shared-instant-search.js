/**
 * shared-instant-search.js
 * Motor de Búsqueda Instantánea Search-First en Memoria (<15ms)
 * Tolerante a Errores Fonéticos, Acentos, Erratas de Hardware y Regla Zero-Dead-End.
 * Marca Oficial: VECTEC / Ecosistema Comercial
 * Contacto WhatsApp: +52 33 3727 1440
 * Origen: Pedro Moreno 501 A, Guadalajara Centro
 */

(function () {
    let searchCatalog = [];
    let outletCatalog = [];
    let preindexedCatalog = [];
    let isCatalogLoaded = false;
    let basePath = "";

    // Diccionario de equivalencias y corrección de erratas frecuentes en hardware y tecnología
    const TYPO_MAP = {
        "cavle": "cable", "cables": "cable",
        "monotor": "monitor", "monotores": "monitor", "pantaya": "pantalla", "pamtalla": "pantalla",
        "targeta": "tarjeta", "targetas": "tarjeta",
        "procesasor": "procesador", "procesasores": "procesador", "proce": "procesador",
        "disiplador": "disipador", "disipladores": "disipador", "disipador": "disipador",
        "ramm": "ram", "memori": "memoria", "memorias": "memoria",
        "vedio": "video", "bideo": "video",
        "inpresora": "impresora", "inpresor": "impresora", "inpresoras": "impresora",
        "raisen": "ryzen", "raizen": "ryzen",
        "radion": "radeon",
        "fuente": "fuente", "fuentes": "fuente",
        "teclao": "teclado", "mause": "mouse", "maus": "mouse",
        "audifono": "audifonos", "auricular": "audifonos", "auriculares": "audifonos",
        "diadema": "diadema", "diademas": "diadema",
        "bluethoot": "bluetooth", "blutut": "bluetooth",
        "guifi": "wifi", "waifai": "wifi",
        "gabinete": "gabinete", "chasis": "gabinete",
        "tinta": "tinta", "cartucho": "cartucho", "toner": "toner",
        "portatil": "laptop", "lap": "laptop", "notebuk": "laptop",
        "almacenamiento": "disco", "solido": "ssd"
    };

    // Determinar ruta base a data/ según la ubicación de la página
    function detectBasePath() {
        const path = window.location.pathname;
        if (path.includes("/VECTEC/") || path.includes("/ofertas-y-liquidaciones/") || 
            path.includes("/bazar-viamx-nfl.gdl/") || path.includes("/mi-puesto-bazar/")) {
            return "data/";
        }
        return "data/";
    }

    basePath = detectBasePath();

    function normalizeText(str) {
        if (!str) return "";
        return str.toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9\s\-_]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function phoneticKey(str) {
        if (!str) return "";
        return str
            .replace(/v/g, "b")
            .replace(/z/g, "s")
            .replace(/c([ei])/g, "s$1")
            .replace(/k/g, "c")
            .replace(/qu([ei])/g, "c$1")
            .replace(/ll/g, "y")
            .replace(/(.)\1+/g, "$1"); // colapsar letras repetidas
    }

    function levenshtein(a, b) {
        if (a === b) return 0;
        const al = a.length, bl = b.length;
        if (al === 0) return bl;
        if (bl === 0) return al;
        const v0 = new Array(bl + 1);
        const v1 = new Array(bl + 1);
        for (let i = 0; i <= bl; i++) v0[i] = i;
        for (let i = 0; i < al; i++) {
            v1[0] = i + 1;
            for (let j = 0; j < bl; j++) {
                const cost = a[i] === b[j] ? 0 : 1;
                v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
            }
            for (let j = 0; j <= bl; j++) v0[j] = v1[j];
        }
        return v1[bl];
    }

    // Preindexar el catálogo en memoria para búsquedas en <15ms
    function buildPreindex(catalog) {
        return catalog.map(item => {
            const rawSku = item.sku || item.id || "";
            const cleanSku = rawSku.replace(/^[AB]-/, "");
            const name = item.n || item.nombre || item.title || "";
            const brand = item.m || item.marca || item.brand || "";
            const cat = item.c || item.categoria || item.cat || "";
            const desc = item.d_desc || item.desc || item.descripcion || "";

            const normSku = normalizeText(rawSku + " " + cleanSku);
            const normName = normalizeText(name);
            const normBrand = normalizeText(brand);
            const normCat = normalizeText(cat);
            const normCombined = `${normSku} ${normName} ${normBrand} ${normCat} ${normalizeText(desc)}`;
            const phonCombined = phoneticKey(normCombined);

            return {
                item: item,
                sku: rawSku,
                cleanSku: cleanSku,
                normSku: normSku,
                normName: normName,
                normBrand: normBrand,
                normCat: normCat,
                normCombined: normCombined,
                phonCombined: phonCombined,
                stk: parseInt(item.stk !== undefined ? item.stk : (item.stock !== undefined ? item.stock : 1)),
                disp: item.d !== 0 && item.disponible !== false && item.est_com !== "bajo_pedido" && item.estado_comercial !== "bajo_pedido"
            };
        });
    }

    // Carga asíncrona no bloqueante del índice ligero
    async function loadSearchIndexes() {
        if (isCatalogLoaded) return;
        try {
            const [searchRes, outletRes] = await Promise.all([
                fetch(basePath + "inventario_maestro_buscador.json").catch(() => null),
                fetch(basePath + "liquidaciones_outlet.json").catch(() => null)
            ]);

            if (searchRes && searchRes.ok) {
                searchCatalog = await searchRes.json();
            } else if (window.CT_CATALOG_SUMMARY) {
                searchCatalog = window.CT_CATALOG_SUMMARY.map(p => ({
                    id: p.sku,
                    sku: p.sku,
                    n: p.nombre,
                    p: p.precio_mxn || p.p,
                    o: p.precio_original || p.o,
                    c: p.categoria || p.c,
                    m: p.marca || p.m || "VECTEC",
                    img: p.img || p.imagen,
                    d: 1,
                    stk: 5,
                    out: 0
                }));
            }

            if (outletRes && outletRes.ok) {
                outletCatalog = await outletRes.json();
            }

            preindexedCatalog = buildPreindex(searchCatalog);
            isCatalogLoaded = true;
        } catch (e) {
            console.warn("[VECTEC Buscador] Carga diferida local:", e);
        }
    }

    // Inicializar carga tras idle del navegador
    if ("requestIdleCallback" in window) {
        requestIdleCallback(() => loadSearchIndexes());
    } else {
        setTimeout(loadSearchIndexes, 200);
    }

    // Búsqueda tolerante en memoria con aproximación léxica (<15ms)
    // Dispara desde la 1ª pulsación (query.length >= 1)
    function searchProducts(query, limit = 8) {
        if (!query) return [];
        const qNorm = normalizeText(query);
        if (!qNorm) return [];

        const rawTokens = qNorm.split(" ").filter(t => t.length > 0);
        if (rawTokens.length === 0) return [];

        const tokenDescriptors = rawTokens.map(tok => {
            const typoResolved = TYPO_MAP[tok] || tok;
            const phon = phoneticKey(typoResolved);
            return {
                raw: tok,
                corrected: typoResolved,
                phon: phon,
                len: tok.length
            };
        });

        const matches = [];

        // Pase 1: Búsqueda rápida por tokens normalizados, SKU, nombre y fonética
        for (let i = 0; i < preindexedCatalog.length; i++) {
            const entry = preindexedCatalog[i];
            let matched = true;
            let score = 0;

            for (let t = 0; t < tokenDescriptors.length; t++) {
                const desc = tokenDescriptors[t];
                let tokMatch = false;

                if (entry.normSku.includes(desc.raw) || entry.normSku.includes(desc.corrected)) {
                    tokMatch = true;
                    score += 130;
                } else if (entry.normName.includes(desc.corrected) || entry.normName.includes(desc.raw)) {
                    tokMatch = true;
                    score += 100;
                } else if (entry.normBrand.includes(desc.corrected) || entry.normBrand.includes(desc.raw)) {
                    tokMatch = true;
                    score += 80;
                } else if (entry.normCat.includes(desc.corrected) || entry.normCat.includes(desc.raw)) {
                    tokMatch = true;
                    score += 75;
                } else if (entry.normCombined.includes(desc.corrected) || entry.normCombined.includes(desc.raw)) {
                    tokMatch = true;
                    score += 50;
                } else if (desc.len >= 3 && entry.phonCombined.includes(desc.phon)) {
                    tokMatch = true;
                    score += 45;
                }

                if (!tokMatch) {
                    matched = false;
                    break;
                }
            }

            if (matched) {
                if (entry.stk > 0 && entry.disp) score += 20;
                matches.push({ item: entry.item, score: score });
                if (matches.length >= limit * 4) break;
            }
        }

        // Pase 2: Levenshtein acotado si no hubo suficientes resultados y hay palabras de >= 4 letras
        if (matches.length < limit && rawTokens.some(t => t.length >= 4)) {
            const maxScan = Math.min(preindexedCatalog.length, 2500);
            for (let i = 0; i < maxScan; i++) {
                const entry = preindexedCatalog[i];
                if (matches.some(m => m.item === entry.item)) continue;

                let fuzzyAll = true;
                for (let t = 0; t < tokenDescriptors.length; t++) {
                    const desc = tokenDescriptors[t];
                    if (desc.len < 4) {
                        if (!entry.normCombined.includes(desc.raw)) {
                            fuzzyAll = false;
                            break;
                        }
                        continue;
                    }

                    const words = entry.normCombined.split(" ");
                    let wordFuzzy = false;
                    const maxDist = desc.len >= 6 ? 2 : 1;

                    for (let w = 0; w < words.length; w++) {
                        const word = words[w];
                        if (Math.abs(word.length - desc.len) <= maxDist) {
                            if (levenshtein(desc.corrected, word) <= maxDist) {
                                wordFuzzy = true;
                                break;
                            }
                        }
                    }
                    if (!wordFuzzy) {
                        fuzzyAll = false;
                        break;
                    }
                }

                if (fuzzyAll) {
                    matches.push({ item: entry.item, score: 35 });
                    if (matches.length >= limit) break;
                }
            }
        }

        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, limit).map(m => m.item);
    }

    // Renderizar resultados en el contenedor flyout de búsqueda
    function renderSearchResults(query, containerEl) {
        if (!containerEl) return;

        const results = searchProducts(query);
        containerEl.classList.remove("hidden");

        if (results.length > 0) {
            // Despliegue de coincidencias directas y tolerantes
            containerEl.innerHTML = `
                <div class="p-2.5 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950/70">
                    <span>${results.length} resultado${results.length === 1 ? '' : 's'} para "<strong class="text-cyan-400">${escapeHtml(query)}</strong>"</span>
                    <span class="text-emerald-400 font-bold flex items-center gap-1"><i class="fa-solid fa-bolt text-[10px]"></i> VECTEC Live Stock</span>
                </div>
                <div class="max-h-[70vh] overflow-y-auto divide-y divide-slate-800/80">
                    ${results.map(item => {
                        const rawSku = item.sku || item.id || "";
                        const isClaveB = rawSku.startsWith("B-") || item.prov === "B" || item.clave_proveedor === "B";
                        const cleanSku = rawSku.startsWith("A-") || rawSku.startsWith("B-") ? rawSku : (isClaveB ? "B-" + rawSku : "A-" + rawSku);
                        const isAgotado = item.d === 0 || item.stk === 0 || item.disponible === false || item.est_com === "bajo_pedido" || item.estado_comercial === "bajo_pedido";
                        const img = item.img || item.imagen || (isClaveB ? `assets/img/B-${cleanSku.replace(/^B-/, '')}.webp` : `assets/img/${cleanSku.replace(/^A-/, '')}.webp`);
                        const price = parseFloat(item.p || item.precio || item.price || 0);
                        const origPrice = parseFloat(item.o || item.precio_original || (price * 1.25));

                        return `
                            <div class="p-3 hover:bg-slate-800/90 transition flex items-center gap-3 group cursor-pointer" onclick="handleSearchResultClick('${cleanSku}')">
                                <img src="${img}" alt="${escapeHtml(item.n || item.nombre)}" class="w-12 h-12 object-contain bg-slate-950 rounded-lg p-1 shrink-0 border border-slate-700/50" onerror="this.onerror=null; this.src='assets/img/placeholders/acc_placeholder.jpg';" />
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                        <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${isClaveB ? 'bg-amber-950 text-amber-400 border border-amber-700/50' : 'bg-cyan-950 text-cyan-400 border border-cyan-700/50'}">${cleanSku}</span>
                                        <span class="text-[10px] font-mono text-slate-400 truncate">${escapeHtml(item.m || item.marca || 'VECTEC')}</span>
                                        <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${isAgotado ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
                                            ${isAgotado ? '⏳ BAJO PEDIDO' : '✓ EN STOCK'}
                                        </span>
                                        ${item.out ? '<span class="text-[9px] font-bold px-1 rounded bg-red-500/20 text-red-300 border border-red-500/40">OUTLET</span>' : ''}
                                    </div>
                                    <h4 class="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition">${escapeHtml(item.n || item.nombre)}</h4>
                                    <div class="flex items-center gap-2 mt-1 text-xs">
                                        <span class="font-mono font-black text-emerald-400">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                                        ${origPrice > price ? `<span class="font-mono text-[10px] text-slate-400 line-through">$${origPrice.toLocaleString('es-MX')}</span>` : ''}
                                    </div>
                                </div>
                                <button type="button" onclick="event.stopPropagation(); quickAddFromSearch('${cleanSku}', '${escapeJs(item.n || item.nombre)}', ${price}, '${img}')" class="shrink-0 px-3 py-1.5 ${isAgotado ? 'bg-amber-600/40 hover:bg-amber-600 text-amber-200 border border-amber-500/40' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'} rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5" title="${isAgotado ? 'Consultar Pedido Especial' : 'Agregar a Canasta'}">
                                    <i class="fa-solid ${isAgotado ? 'fa-clock' : 'fa-cart-plus'}"></i> <span class="hidden sm:inline">${isAgotado ? 'Apartar' : 'Agregar'}</span>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="p-2.5 bg-slate-950/90 border-t border-slate-800 text-center text-xs">
                    <a href="https://wa.me/523337271440?text=Hola%20VECTEC,%20busco%20la%20pieza:%20${encodeURIComponent(query)}" target="_blank" rel="noopener" class="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1.5">
                        <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i> ¿No encuentras tu modelo exacto? Cotízalo por WhatsApp
                    </a>
                </div>
            `;
        } else {
            // REGLA ZERO-DEAD-END: La pantalla JAMÁS queda vacía.
            // Se ofrecen sugerencias de liquidaciones/outlet y cotización directa por WhatsApp.
            const sampleOutlet = (outletCatalog && outletCatalog.length > 0) 
                ? outletCatalog.slice(0, 4) 
                : searchCatalog.filter(p => p.stk > 0).slice(0, 4);

            containerEl.innerHTML = `
                <div class="p-4 bg-slate-900 border-b border-amber-500/40 text-center space-y-1.5">
                    <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 mb-1">
                        <i class="fa-solid fa-magnifying-glass text-lg"></i>
                    </div>
                    <p class="text-xs sm:text-sm text-slate-200 font-semibold">
                        No encontramos resultados exactos para "<strong class="text-amber-300">${escapeHtml(query)}</strong>"
                    </p>
                    <p class="text-[11px] text-slate-400 leading-relaxed">
                        Te sugerimos estas piezas recomendadas con entrega inmediata en Guadalajara o consultar con un especialista en mostrador:
                    </p>
                </div>
                
                ${sampleOutlet.length > 0 ? `
                    <div class="p-2 text-[10.5px] font-mono text-cyan-400 bg-slate-950/80 px-3 uppercase tracking-wider font-bold flex items-center justify-between">
                        <span>🔥 Oportunidades VECTEC en Inventario:</span>
                        <span class="text-emerald-400 text-[9.5px]">Entrega 24-48 hrs</span>
                    </div>
                    <div class="max-h-[50vh] overflow-y-auto divide-y divide-slate-800/80">
                        ${sampleOutlet.map(item => {
                            const rawSku = item.sku || item.id || "";
                            const cleanSku = rawSku.startsWith("A-") || rawSku.startsWith("B-") ? rawSku : "A-" + rawSku;
                            const name = item.nombre || item.n || "Artículo VECTEC";
                            const price = parseFloat(item.precio || item.p || 0);
                            const img = item.imagen || item.img || "assets/img/placeholders/acc_placeholder.jpg";
                            const discount = item.descuento_pct || 15;

                            return `
                                <div class="p-3 hover:bg-slate-800/80 transition flex items-center gap-3 group cursor-pointer" onclick="handleSearchResultClick('${cleanSku}')">
                                    <img src="${img}" alt="${escapeHtml(name)}" class="w-11 h-11 object-contain bg-slate-950 rounded-lg p-1 shrink-0 border border-amber-500/30" onerror="this.onerror=null; this.src='assets/img/placeholders/acc_placeholder.jpg';" />
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2 mb-0.5">
                                            <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">${discount}% OFF</span>
                                            <span class="text-[10px] font-mono text-slate-400">${cleanSku}</span>
                                        </div>
                                        <h4 class="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition">${escapeHtml(name)}</h4>
                                        <div class="text-xs font-mono font-black text-emerald-400 mt-0.5">
                                            $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                        </div>
                                    </div>
                                    <button type="button" onclick="event.stopPropagation(); handleSearchResultClick('${cleanSku}')" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition">
                                        Ver
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                <div class="p-3 bg-slate-950 text-center space-y-2 border-t border-slate-800">
                    <a href="https://wa.me/523337271440?text=Hola%20VECTEC,%20estoy%20buscando:%20${encodeURIComponent(query)}%20%C2%BFMe%20pueden%20cotizar%20disponibilidad?" target="_blank" rel="noopener" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition">
                        <i class="fa-brands fa-whatsapp text-sm"></i> Cotizar "${escapeHtml(query)}" vía WhatsApp (+52 33 3727 1440)
                    </a>
                </div>
            `;
        }
    }

    // Interacción al agregar desde el buscador
    window.quickAddFromSearch = function (sku, title, price, img) {
        const item = searchCatalog.find(p => p.sku === sku || p.id === sku);
        const isBajoPedido = item && (item.stk === 0 || item.d === 0 || item.est_com === 'bajo_pedido' || item.disponible === false);

        if (isBajoPedido) {
            // Si el artículo no tiene stock inmediato, canalizar a modal de asistencia / pedido especial
            if (typeof window.openProductDetailModal === 'function') {
                window.openProductDetailModal(sku);
            } else {
                window.handleSearchResultClick(sku);
            }
            showToastNotification(`ℹ️ [${sku}] está bajo pedido. Abriendo opciones de pedido especial...`);
            return;
        }

        let cart = JSON.parse(localStorage.getItem('ecosystem_global_cart') || '[]');
        const existing = cart.find(i => i.sku === sku);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
            existing.qty = existing.quantity;
        } else {
            cart.push({
                sku: sku,
                id: sku,
                nombre: title,
                title: title,
                name: title,
                precio: price,
                price: price,
                quantity: 1,
                qty: 1,
                imagen: img,
                img: img,
                image: img,
                stock: (item && item.stk !== undefined) ? item.stk : 1,
                stk: (item && item.stk !== undefined) ? item.stk : 1,
                disponible: true,
                estado_comercial: "disponible"
            });
        }
        localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
        localStorage.setItem('cart_items', JSON.stringify(cart));
        if (typeof window.syncBoutiqueCart === 'function') window.syncBoutiqueCart();
        if (typeof window.renderCheckoutProducts === 'function') window.renderCheckoutProducts();
        if (window.SharedCart && typeof window.SharedCart.updateBadges === 'function') window.SharedCart.updateBadges();
        
        showToastNotification(`🛒 ${title} agregado a tu canasta VECTEC`);
    };

    // Apertura del modal interactivo (PDP) en lugar de redirigir a un HTML estático inexistente
    window.handleSearchResultClick = function (sku) {
        if (typeof window.openProductDetailModal === "function") {
            window.openProductDetailModal(sku);
        } else if (typeof window.openQuickView === "function") {
            window.openQuickView(sku);
        } else {
            const text = `Hola VECTEC, deseo consultar sobre el producto [${sku}] en Pedro Moreno 501 A.`;
            window.open(`https://wa.me/523337271440?text=${encodeURIComponent(text)}`, "_blank");
        }
    };

    function showToastNotification(msg) {
        let toast = document.getElementById("search-toast-notification");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "search-toast-notification";
            toast.className = "fixed bottom-5 right-5 z-50 bg-slate-900/95 border border-cyan-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2 transform translate-y-20 transition-all duration-300";
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i> <span>${msg}</span>`;
        toast.classList.remove("translate-y-20");
        toast.classList.add("translate-y-0");
        setTimeout(() => {
            toast.classList.remove("translate-y-0");
            toast.classList.add("translate-y-20");
        }, 2800);
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function escapeJs(str) {
        if (!str) return "";
        return str.toString().replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // Inicializador universal de buscador incremental tolerante
    window.initSharedInstantSearch = function (config) {
        const inputId = config.inputId || "boutiqueSearchInput";
        const resultsId = config.resultsId || "boutique-autocomplete-box";
        const inputEl = document.getElementById(inputId);
        const resultsEl = document.getElementById(resultsId);

        if (!inputEl || !resultsEl) return;

        let debounceTimer = null;
        inputEl.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            const val = e.target.value;
            // Búsqueda incremental reactiva desde 1 carácter
            if (val.trim().length < 1) {
                resultsEl.classList.add("hidden");
                resultsEl.innerHTML = "";
                return;
            }
            debounceTimer = setTimeout(() => {
                renderSearchResults(val, resultsEl);
            }, 25); // Debounce de 25ms para respuesta <15ms
        });

        // Ocultar resultados al hacer clic fuera
        document.addEventListener("click", (e) => {
            if (!resultsEl.contains(e.target) && !inputEl.contains(e.target)) {
                resultsEl.classList.add("hidden");
            }
        });

        // Mostrar de nuevo al re-enfocar si hay texto
        inputEl.addEventListener("focus", () => {
            if (inputEl.value.trim().length >= 1) {
                renderSearchResults(inputEl.value, resultsEl);
            }
        });
    };

    // Auto-inicialización en carga si existen los elementos estándar del DOM
    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("boutiqueSearchInput") && document.getElementById("boutique-autocomplete-box")) {
            window.initSharedInstantSearch({
                inputId: "boutiqueSearchInput",
                resultsId: "boutique-autocomplete-box"
            });
        }
        if (document.getElementById("main-search-input") && document.getElementById("search-results-dropdown")) {
            window.initSharedInstantSearch({
                inputId: "main-search-input",
                resultsId: "search-results-dropdown"
            });
        }
        if (document.getElementById("boutiqueSearchInput") && document.getElementById("master-autocomplete-box")) {
            window.initSharedInstantSearch({
                inputId: "boutiqueSearchInput",
                resultsId: "master-autocomplete-box"
            });
        }
    });

    // Exposición para auditoría y testing
    window.VectecSearchEngine = {
        search: searchProducts,
        getCatalogSize: () => searchCatalog.length,
        isLoaded: () => isCatalogLoaded
    };
})();
