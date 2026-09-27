/**
 * shared-product-modal.js
 * Modal de Ficha Técnica Interactivo (PDP) - Estilo Amazon en 3 Columnas Estricto
 * Ecosistema Oficial VECTEC (Todas las 8 tiendas integradas)
 * Marca Oficial: VECTEC (sin H)
 * Matriz Mostrador: Pedro Moreno 501 A, Guadalajara Centro, Jalisco
 * WhatsApp Oficial: +52 33 3727 1440
 * 
 * ARQUITECTURA DE 3 COLUMNAS:
 * 1. Columna Izquierda: Galería fotográfica HD interactiva, tira de miniaturas, conmutador de vistas, sellos de confianza y nota comercial Clave B.
 * 2. Columna Central: Información del producto, marca, valoraciones, tabla estructurada "Detalles del producto", viñetas "Acerca de este artículo" y descripción técnica amplia de Columna G.
 * 3. Columna Derecha (Buy Box): Precios comerciales (Oferta bold, Lista -25% tachado, Mayoreo), stock en Guadalajara, selector de cantidad, botones de compra ("+ Agregar al carrito", "Comprar ahora") y Módulo de Suscripción VIP para capturar Nombre y WhatsApp/Email con cupón del 5% de descuento inmediato (VECTEC-VIP0928).
 */

(function () {
    const MODAL_ID = "vectecProductModal";
    const MODAL_CONTENT_ID = "vectecProductModalContent";

    function ensureModalDOM() {
        if (!document.getElementById("vectec-pdp-modal-styles")) {
            const style = document.createElement("style");
            style.id = "vectec-pdp-modal-styles";
            style.textContent = `
                #vectecProductModal {
                    position: fixed !important;
                    inset: 0 !important;
                    z-index: 999999 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 0.5rem !important;
                    background: rgba(2, 6, 23, 0.88) !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                    overflow-y: auto !important;
                }
                #vectecProductModal.hidden {
                    display: none !important;
                }
                #vectecProductModalContent {
                    position: relative !important;
                    width: 100% !important;
                    max-width: 1380px !important;
                    background-color: #0f172a !important;
                    border: 2px solid rgba(6, 182, 212, 0.55) !important;
                    border-radius: 1.5rem !important;
                    box-shadow: 0 0 60px rgba(6, 182, 212, 0.3) !important;
                    padding: 1.25rem !important;
                    color: #f1f5f9 !important;
                    max-height: 94vh !important;
                    overflow-y: auto !important;
                }
                .vectec-pdp-grid {
                    display: grid !important;
                    grid-template-columns: 1fr !important;
                    gap: 1.5rem !important;
                    align-items: start !important;
                }
                @media (min-width: 1024px) {
                    .vectec-pdp-grid {
                        grid-template-columns: 340px 1fr 340px !important;
                    }
                    .vectec-col-left {
                        width: 100% !important;
                        max-width: 340px !important;
                    }
                    .vectec-col-center {
                        width: 100% !important;
                        min-width: 0 !important;
                    }
                    .vectec-col-right {
                        width: 100% !important;
                        max-width: 340px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        let modal = document.getElementById(MODAL_ID);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = MODAL_ID;
            modal.className = "fixed inset-0 z-[300] hidden flex items-center justify-center p-2 sm:p-4 overflow-y-auto";
            modal.innerHTML = `
                <div class="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" onclick="window.closeProductDetailModal()"></div>
                <div id="${MODAL_CONTENT_ID}" class="relative w-full max-w-6xl xl:max-w-7xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] p-4 sm:p-6 z-10 max-h-[94vh] overflow-y-auto text-slate-100 space-y-4">
                </div>
            `;
            document.body.appendChild(modal);

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    window.closeProductDetailModal();
                }
            });
        }
        return modal;
    }

    function formatPrice(p) {
        const num = parseFloat(p) || 0;
        return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MXN";
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function escapeJs(str) {
        if (!str) return "";
        return str.toString().replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // Extractor semántico de especificaciones estructuradas desde texto libre de Columna G
    function extractStructuredSpecs(desc, name, brand, category, sku) {
        const text = (desc + " " + name).toUpperCase();
        const specs = [
            { label: "Marca", value: brand || "VECTEC" },
            { label: "Modelo / SKU", value: sku }
        ];

        // Categoría formateada
        let catNombre = category ? category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Componentes";
        specs.push({ label: "Categoría Técnica", value: catNombre });

        // Capacidad / Tamaño
        const capMatch = text.match(/\b(\d{1,4}\s*(?:GB|TB|MB|W|WATTS|PULGADAS|PULG|"|HZ))\b/);
        if (capMatch) {
            specs.push({ label: "Capacidad / Medida", value: capMatch[1] });
        }

        // Socket / Plataforma
        if (text.includes("AM5") || text.includes("AM4") || text.includes("LGA1700") || text.includes("LGA 1700") || text.includes("LGA1851") || text.includes("LGA1200") || text.includes("TR5")) {
            const sock = text.includes("AM5") ? "AMD AM5" : (text.includes("AM4") ? "AMD AM4" : (text.includes("LGA1851") ? "Intel LGA1851" : (text.includes("LGA1700") ? "Intel LGA1700" : "Universal")));
            specs.push({ label: "Socket / Compatibilidad", value: sock });
        }

        // Interfaz / Conectividad
        if (text.includes("PCIE 4.0") || text.includes("GEN 4") || text.includes("PCIE 5.0") || text.includes("NVME") || text.includes("SATA") || text.includes("USB-C") || text.includes("HDMI") || text.includes("DISPLAYPORT") || text.includes("WIFI 6") || text.includes("BLUETOOTH")) {
            const iface = text.includes("PCIE 5.0") ? "PCIe Gen 5.0" : (text.includes("PCIE 4.0") || text.includes("GEN 4") ? "PCIe Gen 4.0 NVMe" : (text.includes("USB-C") ? "USB Tipo-C de alta velocidad" : (text.includes("HDMI") ? "HDMI / DisplayPort" : "Estándar Universal")));
            specs.push({ label: "Interfaz / Conexión", value: iface });
        }

        specs.push({ label: "Garantía Oficial", value: "1 Año directo en Pedro Moreno 501 A" });
        specs.push({ label: "Estado del Producto", value: "100% Nuevo en empaque original sellado" });

        return specs;
    }

    // Extractor de viñetas "Acerca de este artículo" estilo Amazon
    function extractArticleHighlights(desc, name, category, brand) {
        if (!desc || desc.length < 15) {
            return [
                "Componente de grado comercial verificado y garantizado por VECTEC Guadalajara.",
                "Materiales de alta durabilidad con pruebas de laboratorio y rendimiento óptimo.",
                "Soporte técnico directo y asesoría de instalación en mostrador Pedro Moreno 501 A.",
                "Garantía oficial y factura electrónica con entrega inmediata en zona metropolitana."
            ];
        }

        const chunks = desc.split(/[.;|]\s+|\n+/).map(c => c.trim()).filter(c => c.length >= 15 && !c.toLowerCase().includes("www.") && !c.toLowerCase().includes("http"));
        if (chunks.length >= 3) {
            return chunks.slice(0, 5);
        }

        return [
            desc,
            "Alto rendimiento y fiabilidad para estaciones de trabajo, gaming y ensamble.",
            "Distribución oficial garantizada en Guadalajara Centro con entrega express el mismo día.",
            "Respaldo técnico integral y facturación fiscal inmediata."
        ];
    }

    // Intercambio interactivo de imagen en la galería del modal
    window.switchModalImage = function (src, clickedEl) {
        const mainImg = document.getElementById("vectecModalMainImg");
        if (mainImg && src) {
            mainImg.style.opacity = "0.3";
            setTimeout(() => {
                mainImg.src = src;
                mainImg.style.opacity = "1";
            }, 120);
        }
        if (clickedEl) {
            document.querySelectorAll("#vectecModalThumbs .thumb-btn").forEach(btn => {
                btn.classList.remove("ring-2", "ring-cyan-400", "border-cyan-400", "bg-cyan-950/40");
                btn.classList.add("border-slate-800");
            });
            clickedEl.classList.remove("border-slate-800");
            clickedEl.classList.add("ring-2", "ring-cyan-400", "border-cyan-400", "bg-cyan-950/40");
        }
    };

    // Manejador de cantidad en Buy Box
    window.modalQtyChange = function (delta) {
        const input = document.getElementById("vectecModalQtyInput");
        if (!input) return;
        let val = parseInt(input.value) || 1;
        val = Math.max(1, Math.min(99, val + delta));
        input.value = val;
    };

    // Manejador de formulario de suscripción VIP y cupones de descuento
    window.modalSubmitLead = function (sku) {
        const nameInput = document.getElementById("modalVipName");
        const contactInput = document.getElementById("modalVipContact");
        const container = document.getElementById("modalVipFormContainer");

        if (!nameInput || !contactInput || !container) return;

        const name = nameInput.value.trim();
        const contact = contactInput.value.trim();

        if (!name || !contact) {
            alert("Por favor ingresa tu nombre y WhatsApp o correo electrónico para enviarte tu cupón.");
            return;
        }

        // Guardar lead en localStorage del ecosistema
        try {
            const leads = JSON.parse(localStorage.getItem("vectec_vip_leads") || "[]");
            const leadData = {
                sku: sku,
                nombre: name,
                contacto: contact,
                fecha: new Date().toISOString(),
                origen: window.location.pathname
            };
            leads.push(leadData);
            localStorage.setItem("vectec_vip_leads", JSON.stringify(leads));
            localStorage.setItem("user_profile_name", name);
            localStorage.setItem("user_profile_contact", contact);
        } catch (e) {
            console.warn("[CRM] Guardado local de lead:", e);
        }

        const couponCode = "VECTEC-VIP0928";
        container.innerHTML = `
            <div class="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-center space-y-2 animate-fade-in">
                <div class="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                    <i class="fa-solid fa-circle-check text-sm"></i> ¡Suscripción confirmada, ${escapeHtml(name)}!
                </div>
                <p class="text-[11px] text-slate-300">Usa tu cupón para obtener un <strong>5% de descuento adicional</strong>:</p>
                <div class="flex items-center justify-center gap-2">
                    <span class="px-3 py-1 bg-slate-900 border-2 border-dashed border-emerald-400 text-emerald-300 font-mono font-black text-xs rounded-lg select-all">
                        ${couponCode}
                    </span>
                    <button type="button" onclick="navigator.clipboard.writeText('${couponCode}'); alert('✓ Cupón copiado al portapapeles');" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer">
                        Copiar
                    </button>
                </div>
                <span class="block text-[9.5px] text-slate-400 font-mono">Válido en compras en Pedro Moreno 501 A o mostrador en línea.</span>
            </div>
        `;
    };

    window.openProductDetailModal = async function (skuOrItem) {
        ensureModalDOM();
        const modal = document.getElementById(MODAL_ID);
        const container = document.getElementById(MODAL_CONTENT_ID);
        if (!modal || !container) return;

        let item = null;

        if (typeof skuOrItem === "object" && skuOrItem !== null) {
            item = skuOrItem;
        } else {
            const rawSku = String(skuOrItem || "").trim();
            const cleanRaw = rawSku.replace(/^[AB]-/, "");

            const normMatch = p => {
                if (!p) return false;
                const s = String(p.sku || p.s || p.id || "").trim();
                const sClean = s.replace(/^[AB]-/, "");
                return s === rawSku || sClean === cleanRaw || s === cleanRaw || sClean === rawSku;
            };

            const searchSources = [
                window.CT_CATALOG_DATA,
                window.CT_CATALOG_DATA_INITIAL,
                window.searchCatalog,
                window.inventory,
                window.masterItems,
                window.boutiqueProducts,
                window.filteredProducts,
                window.localProducts,
                window.techOutletProducts,
                window.techMasterProducts,
                window.productCatalog,
                window.products,
                window._currentDeptItems
            ];

            for (const src of searchSources) {
                if (src && Array.isArray(src)) {
                    item = src.find(normMatch);
                    if (item) break;
                }
            }

            if (!item && window.VectecSearchEngine && typeof window.VectecSearchEngine.search === "function") {
                const searchHits = window.VectecSearchEngine.search(cleanRaw, 1);
                if (searchHits && searchHits.length > 0) item = searchHits[0];
            }

            // Si aún no está en memoria, buscar asíncronamente en el catálogo local probando rutas relativas
            if (!item) {
                const tryFetchJson = async (filename) => {
                    const paths = [
                        "data/" + filename,
                        "../data/" + filename,
                        "./data/" + filename,
                        "../../data/" + filename,
                        filename
                    ];
                    for (const p of paths) {
                        try {
                            const res = await fetch(p);
                            if (res.ok) {
                                const data = await res.json();
                                if (Array.isArray(data)) return data;
                            }
                        } catch (e) {}
                    }
                    return null;
                };

                const compData = await tryFetchJson("catalogo_maestro_compact.json");
                if (compData) item = compData.find(normMatch);

                if (!item) {
                    const invData = await tryFetchJson("inventario_maestro_buscador.json");
                    if (invData) item = invData.find(normMatch);
                }
            }
        }

        if (!item) {
            const fallbackSku = typeof skuOrItem === "string" ? skuOrItem : "ARTICULO";
            item = {
                sku: fallbackSku,
                nombre: `Producto VECTEC [${fallbackSku}]`,
                marca: "VECTEC",
                categoria: "hardware_ensamble",
                precio: 0,
                precio_original: 0,
                stock: 0,
                disponible: false,
                descripcion: `Consulta sobre disponibilidad, especificaciones y cotización en mostrador Pedro Moreno 501 A, Guadalajara Centro.`
            };
        }

        const rawSku = item.sku || item.s || item.id || "";
        const cleanSku = rawSku.startsWith("A-") || rawSku.startsWith("B-") ? rawSku : ((rawSku.startsWith("B-") || item.prov === "B" || item.clave_proveedor === "B") ? "B-" + rawSku : "A-" + rawSku);
        const isClaveB = cleanSku.startsWith("B-") || rawSku.startsWith("B-") || item.prov === "B" || item.clave_proveedor === "B";
        const baseSku = cleanSku.replace(/^[AB]-/, "");
        const name = item.nombre || item.name || item.n || item.title || "Artículo VECTEC";
        const cat = item.categoria || item.c || item.cat || "accesorios_perifericos";
        const brand = item.marca || item.m || item.brand || "VECTEC";
        const desc = item.descripcion || item.d_desc || item.d || item.desc || "";
        const price = parseFloat(item.precio || item.p || item.price || 0);
        const originalPrice = parseFloat(item.precio_original || item.o || (price * 1.25));
        const wholesalePrice = parseFloat(item.precio_mayoreo || item.y || (price * 0.90));
        
        const stockQty = parseInt(item.stk !== undefined ? item.stk : (item.stock !== undefined ? item.stock : 1));
        const isAgotado = stockQty === 0 || item.disponible === false || item.d === 0 || item.a === 1 || 
                          item.estado_comercial === "bajo_pedido" || item.est_com === "bajo_pedido";
        
        const fichaUrl = item.ficha_tecnica_url || item.ficha_url || "";

        let mainImg = item.imagen || item.img || (item.k && item.k[0]) || "";
        if (!mainImg || !mainImg.startsWith("http")) {
            if (mainImg && (mainImg.startsWith("assets/") || mainImg.startsWith("./assets/"))) {
                // mantener
            } else {
                mainImg = `assets/img/${baseSku}.webp`;
            }
        }

        const vista1 = mainImg;
        const vista2 = (item.k && item.k[1]) ? item.k[1] : (item.imagen_secundaria || mainImg);

        const galleryImgs = [vista1];
        if (vista2 && vista2 !== vista1) {
            galleryImgs.push(vista2);
        }
        galleryImgs.push("assets/img/mascota_tigre.webp");

        const uniqueGallery = [...new Set(galleryImgs)];

        const specsTable = extractStructuredSpecs(desc, name, brand, cat, cleanSku);
        const highlightsBullets = extractArticleHighlights(desc, name, cat, brand);
        const subLabel = item.subcategoria || item.subgrupo_label || "";

        // RENDERIZADO DEL MODAL EN 3 COLUMNAS ESTRICTAS (AMAZON STYLE)
        container.innerHTML = `
            <!-- ENCABEZADO -->
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full uppercase">
                        Catálogo Oficial VECTEC
                    </span>
                    <span class="text-xs font-mono text-slate-300">
                        Código: <strong class="text-cyan-300 font-bold">${cleanSku}</strong>
                    </span>
                    <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${isAgotado ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'}">
                        ${isAgotado ? '⏳ BAJO PEDIDO (STOCK CERO)' : `✓ EN STOCK (${stockQty} pzas en Guadalajara)`}
                    </span>
                </div>
                <button type="button" onclick="window.closeProductDetailModal()" aria-label="Cerrar modal" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer shrink-0">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- CUERPO PRINCIPAL EN 3 COLUMNAS ESTRICTO (AMAZON STYLE) -->
            <div class="vectec-pdp-grid pt-1">
                
                <!-- COLUMNA 1 (IZQUIERDA): GALERÍA FOTOGRÁFICA -->
                <div class="vectec-col-left flex flex-col items-center space-y-3">
                    <div class="w-full aspect-square bg-slate-950 border-2 border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden shadow-2xl transition">
                        <img 
                            id="vectecModalMainImg"
                            src="${mainImg}" 
                            alt="${escapeHtml(name)}" 
                            width="360"
                            height="360"
                            class="w-full h-full object-contain transition-opacity duration-200"
                            onerror="this.onerror=null; this.src='assets/img/placeholders/acc_placeholder.jpg';"
                        />
                    </div>

                    <div class="w-full flex items-center justify-center gap-2 font-mono text-xs">
                        <button 
                            type="button" 
                            onclick="window.switchModalImage('${vista1}', this)" 
                            class="modal-view-btn active flex-1 py-1.5 px-2 rounded-xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow text-[11px]"
                        >
                            <i class="fa-solid fa-camera text-cyan-400"></i>
                            <span>Vista 1</span>
                        </button>
                        <button 
                            type="button" 
                            onclick="window.switchModalImage('${vista2}', this)" 
                            class="modal-view-btn flex-1 py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow text-[11px]"
                        >
                            <i class="fa-solid fa-images text-cyan-400"></i>
                            <span>Vista 2</span>
                        </button>
                    </div>

                    <div id="vectecModalThumbs" class="flex items-center justify-center gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
                        ${uniqueGallery.map((imgSrc, idx) => `
                            <button 
                                type="button" 
                                onclick="window.switchModalImage('${imgSrc}', this)" 
                                class="thumb-btn w-12 h-12 rounded-xl bg-slate-950 border ${idx === 0 ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/40' : 'border-slate-800 hover:border-slate-600'} p-1 shrink-0 overflow-hidden transition cursor-pointer flex items-center justify-center shadow"
                                title="Ver miniatura ${idx + 1}"
                            >
                                <img src="${imgSrc}" alt="Miniatura ${idx + 1}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='assets/img/placeholders/acc_placeholder.jpg';" />
                            </button>
                        `).join('')}
                    </div>

                    ${isClaveB ? `
                        <div class="p-2.5 w-full rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[10.5px] font-mono leading-relaxed text-center shadow-md">
                            <i class="fa-solid fa-triangle-exclamation text-amber-400 mr-1"></i>
                            <strong>Nota comercial:</strong> La imagen y empaque son ilustrativos y pueden presentar variaciones menores respecto al producto suministrado según disponibilidad y lote.
                        </div>
                    ` : ''}

                    <div class="w-full pt-2 border-t border-slate-800/80 space-y-2 text-center">
                        <div class="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-shield-halved text-cyan-400"></i>
                            <span>Garantía Oficial VECTEC • Pedro Moreno 501 A</span>
                        </div>
                        <div class="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono font-bold">
                            <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400"><i class="fa-brands fa-cc-visa"></i> VISA</span>
                            <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-orange-400"><i class="fa-brands fa-cc-mastercard"></i> MC</span>
                            <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400"><i class="fa-brands fa-cc-amex"></i> AMEX</span>
                            <span class="px-2 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-amber-300"><i class="fa-solid fa-money-bill-wave"></i> OXXO</span>
                            <span class="px-2 py-0.5 rounded bg-slate-950 border border-sky-500/40 text-sky-300"><i class="fa-solid fa-handshake"></i> Mercado Pago</span>
                        </div>
                    </div>
                </div>

                <!-- COLUMNA 2 (CENTRAL): FICHA TÉCNICA Y DETALLES -->
                <div class="vectec-col-center flex flex-col space-y-4 text-slate-200">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">${brand}</span>
                            ${subLabel ? `<span class="text-[9.5px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">${subLabel}</span>` : ''}
                        </div>
                        <h1 class="text-base sm:text-lg font-black text-white leading-snug">${escapeHtml(name)}</h1>
                        
                        <div class="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <span class="text-slate-400 font-semibold ml-1 text-[11px]">(4.9 • Valoraciones verificadas en Guadalajara)</span>
                        </div>
                    </div>

                    <!-- TABLA: DETALLES DEL PRODUCTO -->
                    <div class="bg-slate-950/80 rounded-2xl border border-slate-800 p-3.5 space-y-2 shadow-sm">
                        <h4 class="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <i class="fa-solid fa-sliders"></i> Detalles del Producto
                        </h4>
                        <div class="overflow-hidden rounded-xl border border-slate-850">
                            <table class="w-full text-xs font-mono text-left">
                                <tbody class="divide-y divide-slate-850">
                                    ${specsTable.map(s => `
                                        <tr class="hover:bg-slate-900/50 transition">
                                            <td class="py-1.5 px-3 font-bold text-slate-400 bg-slate-900/30 w-2/5">${escapeHtml(s.label)}</td>
                                            <td class="py-1.5 px-3 text-slate-200 font-semibold">${escapeHtml(s.value)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- SECCIÓN: ACERCA DE ESTE ARTÍCULO (VIÑETAS) -->
                    <div class="bg-slate-950/80 rounded-2xl border border-slate-800 p-3.5 space-y-2 shadow-sm">
                        <h4 class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <i class="fa-solid fa-circle-check"></i> Acerca de este artículo
                        </h4>
                        <ul class="space-y-1.5 text-xs text-slate-300 font-sans leading-relaxed">
                            ${highlightsBullets.map(b => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-angle-right text-cyan-400 mt-1 shrink-0 text-[10px]"></i>
                                    <span>${escapeHtml(b)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <!-- DESCRIPCIÓN COMPLETA DEL TEXTO DE EXCEL -->
                    <div class="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-3.5 space-y-1.5">
                        <h4 class="text-xs font-bold font-mono text-cyan-300 flex items-center gap-1.5 uppercase">
                            <i class="fa-solid fa-file-lines"></i> Descripción Técnica Completa:
                        </h4>
                        <p class="whitespace-pre-line text-xs text-slate-300 leading-relaxed font-sans">
                            ${escapeHtml(desc || (name + ". Producto original garantizado por VECTEC con respaldo técnico integral en mostrador central de Guadalajara."))}
                        </p>
                        ${fichaUrl ? `
                            <div class="pt-2 border-t border-slate-800 mt-2">
                                <a href="${fichaUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition underline font-bold">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Ficha Técnica del Fabricante
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- COLUMNA 3 (DERECHA): BUY BOX & SUSCRIPCIÓN -->
                <div class="vectec-col-right bg-slate-950/90 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 flex flex-col space-y-4 text-slate-100 shadow-2xl">
                    
                    <!-- BLOQUE DE PRECIO COMERCIAL VECTEC -->
                    <div class="space-y-1 font-mono border-b border-slate-800 pb-3">
                        <div class="flex items-baseline justify-between">
                            <span class="text-xs text-slate-400">Oferta VECTEC:</span>
                            <span class="text-2xl font-black text-emerald-400">${formatPrice(price)}</span>
                        </div>
                        <div class="flex items-center justify-between text-xs text-slate-400 pt-1">
                            <span>Precio Lista:</span>
                            <span class="line-through text-slate-500">${formatPrice(originalPrice)}</span>
                        </div>
                        <div class="flex items-center justify-between text-xs text-amber-300 pt-0.5 font-bold">
                            <span>Mayoreo (+10 pzas):</span>
                            <span>${formatPrice(wholesalePrice)}</span>
                        </div>
                        <span class="block text-[9.5px] text-slate-400 font-sans mt-1">IVA incluido • Facturamos tu compra</span>
                    </div>

                    <!-- LOGÍSTICA & STOCK -->
                    <div class="space-y-1.5 text-xs font-mono border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-1.5 ${isAgotado ? 'text-amber-400' : 'text-emerald-400'} font-bold">
                            <i class="fa-solid ${isAgotado ? 'fa-hourglass-half' : 'fa-circle-check'} text-sm"></i>
                            <span>${isAgotado ? 'Bajo Pedido (Consúltanos)' : `En stock (${stockQty} pzas disponibles)`}</span>
                        </div>
                        <div class="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <i class="fa-solid fa-truck text-cyan-400"></i>
                            <span>Entrega GRATIS en Guadalajara</span>
                        </div>
                        <div class="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <i class="fa-solid fa-location-dot text-amber-400"></i>
                            <span>Retiro en: <strong>Pedro Moreno 501 A</strong></span>
                        </div>
                    </div>

                    <!-- SELECTOR DE CANTIDAD & BOTONES DE COMPRA DIRECTA -->
                    ${!isAgotado ? `
                        <div class="space-y-3">
                            <div class="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-1.5 px-3 font-mono text-xs">
                                <span class="text-slate-400">Cantidad:</span>
                                <div class="flex items-center gap-2">
                                    <button type="button" onclick="window.modalQtyChange(-1)" class="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer transition">-</button>
                                    <input id="vectecModalQtyInput" type="text" value="1" readonly class="w-8 text-center bg-transparent font-bold text-white text-xs" />
                                    <button type="button" onclick="window.modalQtyChange(1)" class="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer transition">+</button>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                onclick="const q = parseInt(document.getElementById('vectecModalQtyInput')?.value)||1; window.modalAddToCart('${cleanSku}', q);" 
                                class="w-full bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-mono text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer uppercase tracking-wider min-h-[44px]"
                            >
                                <i class="fa-solid fa-cart-plus text-sm"></i>
                                <span>Agregar al carrito</span>
                            </button>

                            <button 
                                type="button" 
                                onclick="const q = parseInt(document.getElementById('vectecModalQtyInput')?.value)||1; window.modalBuyNow('${cleanSku}', q);" 
                                class="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-mono text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer uppercase tracking-wider min-h-[44px]"
                            >
                                <i class="fa-solid fa-bolt text-sm"></i>
                                <span>Comprar ahora</span>
                            </button>
                        </div>
                    ` : `
                        <div class="space-y-2.5">
                            <div class="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-mono">
                                <i class="fa-solid fa-triangle-exclamation text-amber-400 mr-1"></i>
                                Artículo bajo pedido especial o próxima llegada.
                            </div>
                            <button 
                                type="button" 
                                onclick="window.modalSpecialOrderInquiry('${cleanSku}', '${escapeJs(name)}')" 
                                class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xl transition active:scale-95 cursor-pointer min-h-[44px]"
                            >
                                <i class="fa-brands fa-whatsapp text-lg"></i>
                                <span>💬 Consultar Llegada</span>
                            </button>
                        </div>
                    `}

                    <!-- MÓDULO DE SUSCRIPCIÓN VIP Y PROMOCIONES (LEAD GEN) -->
                    <div id="modalVipFormContainer" class="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5 mt-2 shadow-lg">
                        <div class="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
                            <i class="fa-solid fa-gift text-sm"></i>
                            <span>Club VIP & Descuentos</span>
                        </div>
                        <p class="text-[10.5px] text-slate-300 leading-tight">
                            Déjanos tus datos y obtén un <strong>5% de descuento adicional</strong> inmediato en mostrador:
                        </p>
                        <div class="space-y-2">
                            <input 
                                type="text" 
                                id="modalVipName" 
                                placeholder="Tu nombre completo" 
                                class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none font-mono transition" 
                            />
                            <input 
                                type="text" 
                                id="modalVipContact" 
                                placeholder="WhatsApp o Correo" 
                                class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none font-mono transition" 
                            />
                            <button 
                                type="button" 
                                onclick="window.modalSubmitLead('${cleanSku}')" 
                                class="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-[11px] font-black py-2 rounded-lg transition active:scale-95 cursor-pointer uppercase tracking-wider shadow"
                            >
                                Suscribirme y Obtener Cupón
                            </button>
                        </div>
                    </div>

                    <!-- Enlace directo a mostrador -->
                    <button 
                        type="button" 
                        onclick="window.modalWhatsAppInquiry('${cleanSku}', '${escapeJs(name)}')" 
                        class="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 font-mono text-[10.5px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                        <i class="fa-brands fa-whatsapp text-emerald-400"></i>
                        <span>Atención Mostrador: Pedro Moreno 501 A</span>
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove("hidden");
    };

    window.closeProductDetailModal = function () {
        const modal = document.getElementById(MODAL_ID);
        if (modal) {
            modal.classList.add("hidden");
        }
    };

    window.modalAddToCart = function (sku, qty = 1) {
        if (typeof window.addToCartDirect === "function") {
            window.addToCartDirect(sku, qty);
        } else if (typeof window.addToCartCT === "function") {
            window.addToCartCT(sku, qty);
        } else if (typeof window.addToCartLocal === "function") {
            window.addToCartLocal(sku, qty);
        } else if (typeof window.addToCartTech === "function") {
            window.addToCartTech(sku, qty);
        } else if (typeof window.addToCart === "function") {
            window.addToCart(sku, qty);
        } else if (typeof window.quickAddFromSearch === "function") {
            window.quickAddFromSearch(sku, "Artículo VECTEC", 0, "");
        } else if (window.SharedCart) {
            const current = window.SharedCart.get();
            const exists = current.find(i => i.sku === sku);
            if (exists) {
                exists.qty = (exists.qty || 1) + qty;
                window.SharedCart.save([...current]);
            } else {
                window.SharedCart.save([...current, { sku: sku, qty: qty, stock: 1, disponible: true }]);
            }
            alert(`✓ ${qty} producto(s) agregado(s) al carrito.`);
        }
    };

    window.modalBuyNow = function (sku, qty = 1) {
        if (typeof window.buyNowDirect === "function") {
            window.buyNowDirect(sku, qty);
        } else if (typeof window.buyNowCT === "function") {
            window.buyNowCT(sku);
        } else if (typeof window.buyNowLocal === "function") {
            window.buyNowLocal(sku, qty);
        } else if (typeof window.buyNowTech === "function") {
            window.buyNowTech(sku, qty);
        } else if (typeof window.comprarAhoraDirecto === "function") {
            window.comprarAhoraDirecto(sku, qty);
        } else {
            window.modalAddToCart(sku, qty);
            window.location.href = "checkout.html";
        }
    };

    window.modalSpecialOrderInquiry = function (sku, name) {
        const text = `Hola VECTEC, me interesa consultar la próxima llegada o realizar un pedido especial del producto [${sku}]: ${name}`;
        window.open(`https://wa.me/523337271440?text=${encodeURIComponent(text)}`, "_blank");
    };

    window.modalWhatsAppInquiry = function (sku, name) {
        const text = `Hola VECTEC, deseo consultar sobre el producto [${sku}] ${name} en Pedro Moreno 501 A.`;
        window.open(`https://wa.me/523337271440?text=${encodeURIComponent(text)}`, "_blank");
    };

    // Alias para compatibilidad universal con todas las tiendas
    window.openQuickView = window.openProductDetailModal;
    window.closeQuickView = window.closeProductDetailModal;
})();
