/**
 * shared-product-modal.js
 * Modal de Ficha Técnica Interactivo (PDP) - Ecosistema Oficial VECTEC
 * Marca Oficial: VECTEC (sin H)
 * Pedro Moreno 501 A, Guadalajara Centro, Jalisco
 * WhatsApp Oficial: +52 33 3727 1440
 * 
 * Reglas Comerciales Estrictas:
 * 1. Galería Visual Interactiva: Imagen principal de alta resolución + tira de miniaturas clicables con cambio suave.
 * 2. Usos y Aplicaciones: Viñetas dinámicas según categoría técnica y perfil de hardware.
 * 3. Leyenda Comercial de Variación (SOLO Clave B / SKU B-):
 *    "Nota comercial: La imagen y empaque son ilustrativos y pueden presentar variaciones menores respecto al producto final suministrado según disponibilidad y lote."
 *    (Los artículos de Clave A NUNCA muestran esta leyenda).
 * 4. Secreto Comercial Absoluto:
 *    Cero menciones públicas a mayoristas o distribuidores externos.
 *    Toda trazabilidad ante el usuario final se maneja como catálogo interno VECTEC (A-[SKU] / B-[SKU]).
 * 5. Conmutación Inteligente de Botones según Stock:
 *    - Stock > 0: "Seguir comprando", "+ Agregar al carrito", "Comprar ahora / Proceder al pago".
 *    - Stock == 0: Oculta compra directa; muestra "💬 Consultar Próxima Llegada / Pedido Especial" (WhatsApp) y "Seguir comprando".
 */

(function () {
    const MODAL_ID = "vectecProductModal";
    const MODAL_CONTENT_ID = "vectecProductModalContent";

    function ensureModalDOM() {
        let modal = document.getElementById(MODAL_ID);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = MODAL_ID;
            modal.className = "fixed inset-0 z-[300] hidden flex items-center justify-center p-3 sm:p-4 overflow-y-auto";
            modal.innerHTML = `
                <div class="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onclick="window.closeProductDetailModal()"></div>
                <div id="${MODAL_CONTENT_ID}" class="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] p-5 sm:p-6 z-10 max-h-[92vh] overflow-y-auto text-slate-100 space-y-4">
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

    // Generador dinámico de "Usos y Aplicaciones" según taxonomía técnica
    function getUsosYAplicaciones(category, name, brand) {
        const cat = (category || "").toLowerCase();
        const nm = (name || "").toLowerCase();

        if (cat.includes("video") || nm.includes("geforce") || nm.includes("radeon") || nm.includes("rtx") || nm.includes("gtx")) {
            return [
                "Gaming competitivo en resoluciones 1080p, 1440p y 4K con altas tasas de refresco (FPS).",
                "Modelado 3D, animación y renderizado en tiempo real (Blender, Maya, Cinema 4D).",
                "Aceleración por GPU para edición de video 4K/8K en Premiere Pro y DaVinci Resolve.",
                "Cálculo e inferencia de Inteligencia Artificial local y modelos LLM/difusión."
            ];
        }
        if (cat.includes("procesador") || nm.includes("intel core") || nm.includes("ryzen") || nm.includes("xeon") || nm.includes("threadripper")) {
            return [
                "Computación de alto rendimiento y multitarea intensiva sin cuellos de botella.",
                "Compilación ágil de código, desarrollo de software y máquinas virtuales.",
                "Estaciones de trabajo de ingeniería, cálculo numérico y simulaciones complejas.",
                "Fluidez absoluta en gaming combinado con streaming y captura simultánea."
            ];
        }
        if (cat.includes("ram") || nm.includes("ddr4") || nm.includes("ddr5") || nm.includes("dimm") || nm.includes("sodimm")) {
            return [
                "Optimización de latencias y eliminación de tartamudeos (stuttering) en entornos multiapp.",
                "Fluidez garantizada en edición pesada con Premiere, After Effects y Photoshop.",
                "Estabilidad en multitarea con decenas de pestañas de navegador y bases de datos locales.",
                "Máxima compatibilidad certificada con plataformas modernas Intel y AMD."
            ];
        }
        if (cat.includes("ssd") || cat.includes("disco") || nm.includes("nvme") || nm.includes("m.2") || nm.includes("sata")) {
            return [
                "Carga ultra-rápida del sistema operativo Windows/Linux en menos de 10 segundos.",
                "Tiempos de espera mínimos en pantallas de carga de videojuegos AAA.",
                "Transferencias continuas de archivos pesados con protección de integridad térmica.",
                "Almacenamiento confiable para respaldos críticos, bibliotecas de proyectos y bases de datos."
            ];
        }
        if (cat.includes("madre") || nm.includes("motherboard") || nm.includes("b760") || nm.includes("b550") || nm.includes("b650") || nm.includes("z790")) {
            return [
                "Plataforma base sólida con suministro eléctrico reforzado (VRM) para trabajo 24/7.",
                "Conectividad de última generación PCIe Gen 4/5 y soporte para memoria de alta velocidad.",
                "Blindaje térmico integrado para unidades M.2 NVMe y puertos reforzados para tarjetas pesadas.",
                "Audio de alta fidelidad y puertos de red Gigabit blindados contra interferencias."
            ];
        }
        if (cat.includes("enfriamiento") || cat.includes("ventilador") || cat.includes("disipador") || nm.includes("cooler") || nm.includes("liquida")) {
            return [
                "Control térmico superior para evitar el estrangulamiento térmico (thermal throttling).",
                "Operación acústica silenciosa gracias a perfiles PWM y ventiladores de fluido hidrodinámico.",
                "Preservación de la vida útil del procesador bajo cargas extremas continuas.",
                "Compatibilidad universal con los sockets más recientes de Intel y AMD."
            ];
        }
        if (cat.includes("fuente") || nm.includes("80 plus") || nm.includes("power supply") || nm.includes("fuente de poder")) {
            return [
                "Suministro de energía limpio, continuo y eficiente con certificación 80 Plus.",
                "Protecciones integradas completas (OVP, UVP, SCP, OPP, OTP) contra anomalías eléctricas.",
                "Alimentación estable para tarjetas gráficas de gama media y alta.",
                "Cables mallados y diseño optimizado para un flujo de aire impecable dentro del chasis."
            ];
        }
        if (cat.includes("monitor") || cat.includes("pantalla") || nm.includes("fhd") || nm.includes("144hz") || nm.includes("ips")) {
            return [
                "Productividad ejecutiva expandida con mayor área de trabajo y texto ultranítido.",
                "Fidelidad de color precisa para edición fotográfica, diseño web y artes gráficas.",
                "Protección visual para jornadas prolongadas con tecnologías antiparpadeo y reducción de luz azul.",
                "Conectividad múltiple vía HDMI, DisplayPort y ajuste ergonómico de inclinación."
            ];
        }
        if (cat.includes("laptop") || cat.includes("portatil") || cat.includes("all_in_one") || cat.includes("ensambladas")) {
            return [
                "Equipo listo para operar en entornos corporativos, educativos o centros de comando personal.",
                "Rendimiento equilibrado con garantía integral directa en Guadalajara Centro.",
                "Conectividad completa para periféricos, monitores secundarios y redes cableadas/inalámbricas.",
                "Soporte y asesoría técnica especializada permanente en Pedro Moreno 501 A."
            ];
        }
        if (cat.includes("impresora") || cat.includes("toner") || cat.includes("tinta") || cat.includes("punto_de_venta")) {
            return [
                "Emisión continua y nítida de documentos, comprobantes de pago y facturación en mostrador.",
                "Rendimiento optimizado para bajo costo por página impresa o etiqueta comercial.",
                "Integración sencilla con sistemas punto de venta y terminales de inventario.",
                "Operación confiable de trabajo pesado para comercios, despachos y oficinas."
            ];
        }
        if (cat.includes("red") || cat.includes("cable") || cat.includes("switch") || cat.includes("router")) {
            return [
                "Infraestructura de cableado estructurado para transmisión de datos Gigabit sin pérdidas.",
                "Baja latencia en enlaces de red local para gaming, videollamadas y streaming.",
                "Materiales de alta durabilidad con blindaje contra interferencias electromagnéticas.",
                "Conexión confiable para oficinas, hogares inteligentes e instalaciones de videovigilancia."
            ];
        }

        // Fallback genérico para accesorios y componentes
        return [
            "Compatibilidad certificada para ensamble, oficina o entretenimiento digital.",
            "Materiales resistentes de grado comercial con control de calidad riguroso.",
            "Garantía oficial VECTEC con atención directa en Pedro Moreno 501 A, Guadalajara Centro.",
            "Asesoría técnica y soporte de instalación vía WhatsApp (+52 33 3727 1440)."
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

    window.openProductDetailModal = function (skuOrItem) {
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

            // Buscar en todos los catálogos posibles en memoria
            const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || window.searchCatalog || [];
            item = all.find(p => p.sku === rawSku || p.sku === cleanRaw || p.s === rawSku || p.id === rawSku || p.id === cleanRaw);

            if (!item && window.inventory && Array.isArray(window.inventory)) {
                item = window.inventory.find(p => p.sku === rawSku || p.sku === cleanRaw || p.id === rawSku);
            }

            // Si aún no se encuentra, buscar en el catálogo del buscador si está preindexado
            if (!item && window.VectecSearchEngine) {
                const searchHits = window.VectecSearchEngine.search(cleanRaw, 1);
                if (searchHits.length > 0) item = searchHits[0];
            }
        }

        if (!item) {
            console.warn("[VECTEC Modal] Producto no encontrado en índices locales:", skuOrItem);
            // Si no se encuentra en memoria, ofrecer consulta de cotización directa
            const fallbackSku = typeof skuOrItem === "string" ? skuOrItem : "ARTICULO";
            window.modalWhatsAppInquiry(fallbackSku, "Consulta de Ficha Técnica");
            return;
        }

        // Normalizar campos del producto
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
        
        // Detección estricta de stock
        const stockQty = parseInt(item.stk !== undefined ? item.stk : (item.stock !== undefined ? item.stock : 1));
        const isAgotado = stockQty === 0 || item.disponible === false || item.d === 0 || item.a === 1 || 
                          item.estado_comercial === "bajo_pedido" || item.est_com === "bajo_pedido";
        
        const fichaUrl = item.ficha_tecnica_url || item.ficha_url || "";

        // Resolver galería de imágenes
        let mainImg = item.imagen || item.img || (item.k && item.k[0]) || "";
        if (!mainImg) {
            mainImg = isClaveB ? `assets/img/B-${baseSku}.webp` : `assets/img/${baseSku}.webp`;
        }

        // Armar lista de miniaturas para la galería
        const galleryImgs = [];
        if (Array.isArray(item.k) && item.k.length > 0) {
            galleryImgs.push(...item.k);
        } else {
            galleryImgs.push(mainImg);
            // Vistas complementarias para enriquecer la experiencia interactiva
            galleryImgs.push(mainImg); // vista de detalle
            galleryImgs.push("assets/img/fachada-oficial.webp"); // respaldo y garantía física
        }

        // Deduplicar URLs conservando orden
        const uniqueGallery = [...new Set(galleryImgs)];

        const usosBullets = getUsosYAplicaciones(cat, name, brand);
        const isSubLabel = item.subcategoria || item.subgrupo_label || "";

        // RENDERIZADO DEL MODAL
        container.innerHTML = `
            <!-- ENCABEZADO -->
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full uppercase">
                        Catálogo Oficial VECTEC
                    </span>
                    <span class="text-xs font-mono text-slate-300">
                        Código: <strong class="text-cyan-300">${cleanSku}</strong>
                    </span>
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isAgotado ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'}">
                        ${isAgotado ? '⏳ BAJO PEDIDO (STOCK CERO)' : `✓ EN STOCK (${stockQty} pzas)`}
                    </span>
                </div>
                <button type="button" onclick="window.closeProductDetailModal()" aria-label="Cerrar modal" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer shrink-0">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- CUERPO PRINCIPAL EN 2 COLUMNAS -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-1">
                
                <!-- COLUMNA IZQUIERDA: GALERÍA FOTOGRÁFICA INTERACTIVA Y VARIACIÓN -->
                <div class="md:col-span-5 flex flex-col items-center">
                    <!-- Vista Principal Grande -->
                    <div class="w-full aspect-square bg-slate-950 border-2 border-cyan-500/30 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden shadow-2xl">
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

                    <!-- TIRA DE MINIATURAS INTERACTIVAS (THUMBNAILS STRIP) -->
                    <div id="vectecModalThumbs" class="flex items-center gap-2 mt-3 w-full overflow-x-auto pb-1.5 no-scrollbar">
                        ${uniqueGallery.map((imgSrc, idx) => `
                            <button 
                                type="button" 
                                onclick="window.switchModalImage('${imgSrc}', this)"
                                class="thumb-btn w-14 h-14 rounded-xl bg-slate-950 border ${idx === 0 ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/40' : 'border-slate-800 hover:border-slate-600'} p-1 shrink-0 overflow-hidden transition cursor-pointer flex items-center justify-center shadow"
                                title="Ver vista ${idx + 1}"
                                aria-label="Vista ${idx + 1}"
                            >
                                <img src="${imgSrc}" alt="Vista miniatura ${idx + 1}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='assets/img/placeholders/acc_placeholder.jpg';" />
                            </button>
                        `).join('')}
                    </div>

                    <!-- LEYENDA COMERCIAL DE VARIACIÓN: EXCLUSIVAMENTE PARA CLAVE B -->
                    ${isClaveB ? `
                        <div class="mt-3 p-3 w-full rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono leading-relaxed text-center shadow-md">
                            <i class="fa-solid fa-triangle-exclamation text-amber-400 mr-1.5"></i>
                            <strong>Nota comercial:</strong> La imagen y empaque son ilustrativos y pueden presentar variaciones menores respecto al producto final suministrado según disponibilidad y lote.
                        </div>
                    ` : ''}

                    <div class="mt-3 text-center text-[10.5px] font-mono text-slate-400 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-shield-halved text-cyan-400"></i>
                        <span>Garantía Oficial VECTEC • Pedro Moreno 501 A</span>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: INFORMACIÓN TÉCNICA, USOS/APLICACIONES Y ACCIONES -->
                <div class="md:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">${brand}</span>
                            ${isSubLabel ? `<span class="text-[9.5px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">${isSubLabel}</span>` : ''}
                        </div>
                        <h2 class="text-base sm:text-lg font-bold text-white leading-snug mb-2">${escapeHtml(name)}</h2>

                        <!-- PRECIOS -->
                        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono mb-3">
                            <div class="flex items-baseline justify-between">
                                <span class="text-xs text-slate-400">Precio Menudeo:</span>
                                <span class="text-xl font-black text-emerald-400">${formatPrice(price)}</span>
                            </div>
                            <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                                <span>Precio de Lista: <span class="line-through text-slate-400">${formatPrice(originalPrice)}</span></span>
                                <span class="text-amber-300 font-bold">Mayoreo: ${formatPrice(wholesalePrice)}</span>
                            </div>
                        </div>

                        <!-- ESPECIFICACIONES TÉCNICAS -->
                        <div class="space-y-1.5 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 mb-3">
                            <h4 class="font-bold font-mono text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase">
                                <i class="fa-solid fa-microchip"></i> Ficha Técnica & Especificaciones:
                            </h4>
                            <p class="whitespace-pre-line text-slate-300 text-xs">
                                ${escapeHtml(desc || (name + ". Producto original garantizado por VECTEC con respaldo técnico integral en Guadalajara."))}
                            </p>
                            ${fichaUrl ? `
                                <div class="pt-2 border-t border-slate-800 mt-2">
                                    <a href="${fichaUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition underline font-bold">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Ficha Técnica Completa del Fabricante
                                    </a>
                                </div>
                            ` : ''}
                        </div>

                        <!-- SECCIÓN: USOS Y APLICACIONES -->
                        <div class="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                            <h4 class="font-bold font-mono text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                <i class="fa-solid fa-circle-check"></i> Usos & Aplicaciones Recomendadas:
                            </h4>
                            <ul class="space-y-1.5 text-xs text-slate-300 font-sans">
                                ${usosBullets.map(b => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-angle-right text-cyan-400 mt-1 shrink-0 text-[10px]"></i>
                                        <span>${escapeHtml(b)}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <!-- CONMUTACIÓN INTELIGENTE DE BOTONES SEGÚN STOCK -->
                    <div class="pt-2 border-t border-slate-800 space-y-2">
                        ${!isAgotado ? `
                            <!-- DISPONIBLE: FLUJO DE COMPRA DIRECTA COMPLETO -->
                            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <button 
                                    type="button" 
                                    onclick="window.closeProductDetailModal()" 
                                    class="sm:col-span-3 btn-action bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[46px]"
                                >
                                    <i class="fa-solid fa-arrow-left text-xs"></i>
                                    <span>Seguir</span>
                                </button>
                                <button 
                                    type="button" 
                                    onclick="window.modalAddToCart('${cleanSku}')" 
                                    class="sm:col-span-4 btn-action bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer min-h-[46px]"
                                >
                                    <i class="fa-solid fa-cart-plus"></i>
                                    <span>+ Carrito</span>
                                </button>
                                <button 
                                    type="button" 
                                    onclick="window.modalBuyNow('${cleanSku}')" 
                                    class="sm:col-span-5 btn-action bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono text-xs font-black py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer min-h-[46px] uppercase tracking-wider"
                                >
                                    <i class="fa-solid fa-bolt"></i>
                                    <span>Comprar Ahora</span>
                                </button>
                            </div>
                        ` : `
                            <!-- STOCK CERO / BAJO PEDIDO: FLUJO DE VENTA ASISTIDA -->
                            <div class="p-3 bg-amber-950/50 border border-amber-500/50 rounded-2xl text-amber-200 text-xs font-mono flex items-center gap-2 mb-2">
                                <i class="fa-solid fa-triangle-exclamation text-amber-400 text-base shrink-0"></i>
                                <span>Este artículo se encuentra <strong>bajo pedido</strong>. Solicita la programación especial o consulta fecha estimada de llegada con mostrador.</span>
                            </div>

                            <div class="flex flex-col sm:flex-row gap-2">
                                <button 
                                    type="button" 
                                    onclick="window.closeProductDetailModal()" 
                                    class="sm:w-1/3 btn-action bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer min-h-[48px]"
                                >
                                    <i class="fa-solid fa-arrow-left"></i>
                                    <span>Seguir Comprando</span>
                                </button>
                                
                                <button 
                                    type="button" 
                                    onclick="window.modalSpecialOrderInquiry('${cleanSku}', '${escapeJs(name)}')" 
                                    class="sm:flex-1 btn-action bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl transition active:scale-95 cursor-pointer min-h-[48px]"
                                >
                                    <i class="fa-brands fa-whatsapp text-lg text-white"></i>
                                    <span>💬 Consultar Próxima Llegada / Pedido Especial</span>
                                </button>
                            </div>
                        `}

                        <button 
                            type="button" 
                            onclick="window.modalWhatsAppInquiry('${cleanSku}', '${escapeJs(name)}')" 
                            class="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 font-mono text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer min-h-[40px]"
                        >
                            <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                            <span>Atención Directa Mostrador: Pedro Moreno 501 A</span>
                        </button>
                    </div>
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

    window.modalAddToCart = function (sku) {
        if (typeof window.addToCartCT === "function") {
            window.addToCartCT(sku);
        } else if (typeof window.quickAddFromSearch === "function") {
            window.quickAddFromSearch(sku, "Artículo VECTEC", 0, "");
        } else if (window.SharedCart) {
            window.SharedCart.save([...window.SharedCart.get(), { sku: sku, qty: 1, stock: 1, disponible: true }]);
            alert("✓ Producto agregado al carrito.");
        }
    };

    window.modalBuyNow = function (sku) {
        if (typeof window.buyNowCT === "function") {
            window.buyNowCT(sku);
        } else {
            window.modalAddToCart(sku);
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

    // Alias para compatibilidad con interfaces existentes
    window.openQuickView = window.openProductDetailModal;
    window.closeQuickView = window.closeProductDetailModal;
})();
