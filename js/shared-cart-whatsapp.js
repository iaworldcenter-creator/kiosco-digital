/**
 * shared-cart-whatsapp.js
 * Gestor Universal de Carrito, Cotizador Dinámico Uber Flash, PIN de Seguridad y Doble Notificación
 * Marca Oficial: VECTEC / Ecosistema Comercial
 * Contacto WhatsApp: +52 33 3727 1440
 * Origen de Despacho & Soporte: Pedro Moreno 501 A, Guadalajara Centro (CP 44100)
 */

(function () {
    const WHATSAPP_PHONE = "523337271440";
    const ADMIN_EMAIL = "pedromoreno501a@gmail.com";
    const CART_KEY = "ecosystem_global_cart";
    const ALT_CART_KEY = "cart_items";
    const PIN_KEY = "checkout_uber_pin";
    const ORDERS_LOG_KEY = "vectec_submitted_orders_log";
    const WEBHOOK_ENDPOINT = window.VECTEC_ORDER_WEBHOOK || "https://httpbin.org/post";

    const KNOWN_CART_KEYS = [
        "IAWC_MASTER_CART",
        "ecosystem_global_cart",
        "vectec_cart",
        "cart_items",
        "pc_custom_cart"
    ];

    function parseCleanPrice(val) {
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9.-]+/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    }
    window.parseCleanPrice = parseCleanPrice;

    // -------------------------------------------------------------------------
    // 1. GESTIÓN DEL CARRITO
    // -------------------------------------------------------------------------
    function getCart() {
        try {
            for (const key of KNOWN_CART_KEYS) {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map(item => {
                            const p = parseCleanPrice(item.price || item.precio || 0);
                            const q = parseInt(item.quantity || item.qty || 1) || 1;
                            return {
                                ...item,
                                price: p,
                                precio: p,
                                quantity: q,
                                qty: q
                            };
                        });
                    }
                }
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(items) {
        const json = JSON.stringify(items);
        KNOWN_CART_KEYS.forEach(k => {
            try { localStorage.setItem(k, json); } catch(e) {}
        });
        updateCartBadges();
        if (typeof window.renderDrawerItems === 'function') {
            window.renderDrawerItems();
        }
    }

    function updateCartBadges() {
        const items = getCart();
        const count = items.reduce((acc, i) => acc + (parseInt(i.quantity || i.qty || 1) || 1), 0);
        const totalNeto = items.reduce((acc, i) => acc + (parseCleanPrice(i.price || i.precio || 0) * (parseInt(i.quantity || i.qty || 1) || 1)), 0);

        document.querySelectorAll(".cart-counter-badge, #cartBadge, #cart-count, #cartCount, #items-count-badge, #chk-item-count, #drawer-cart-count, #boutique-cart-badge").forEach(el => {
            if (el.id === "chk-item-count" || el.id === "items-count-badge") {
                el.innerText = `${count} artículo${count === 1 ? '' : 's'}`;
            } else if (el.id === "drawer-cart-count") {
                el.innerText = `${count} artículo${count === 1 ? ' seleccionado' : 's seleccionados'}`;
            } else {
                el.innerText = count;
                el.classList.toggle("hidden", count === 0 && !el.id.includes('boutique'));
            }
        });

        document.querySelectorAll("#boutique-cart-total, .cart-total, #drawer-cart-total-badge").forEach(el => {
            el.innerText = `$${totalNeto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
        });
    }

    
    // -------------------------------------------------------------------------
    // 1b. ACCIONES DIRECTAS DE COMPRA Y ADICIÓN MULTI-CATÁLOGO
    // -------------------------------------------------------------------------
    window.addToCartDirect = function(skuOrItem, qty = 1) {
        let cart = getCart();
        let prod = null;
        if (typeof skuOrItem === 'object' && skuOrItem !== null) {
            prod = skuOrItem;
        } else {
            const rawSku = String(skuOrItem || '').trim();
            const cleanRaw = rawSku.replace(/^[AB]-/, '');
            const sources = [
                window.boutiqueProducts,
                window.defaultAparador200,
                window.CT_CATALOG_DATA,
                window.CT_CATALOG_DATA_INITIAL,
                window.searchCatalog,
                window.inventory
            ];
            for (const src of sources) {
                if (Array.isArray(src)) {
                    prod = src.find(p => (p.sku === rawSku || p.sku === cleanRaw || p.s === rawSku || p.id === rawSku || p.id === cleanRaw));
                    if (prod) break;
                }
            }
        }

        const targetSku = prod ? (prod.sku || prod.s || prod.id) : String(skuOrItem);
        const existing = cart.find(i => (i.sku === targetSku || i.id === targetSku));

        if (existing) {
            const curQ = parseInt(existing.quantity || existing.qty || 1);
            existing.quantity = curQ + qty;
            existing.qty = existing.quantity;
        } else {
            const name = prod ? (prod.nombre || prod.name || prod.n || prod.title || 'Artículo') : targetSku;
            const price = prod ? parseCleanPrice(prod.precio || prod.price || prod.p || 0) : 0;
            const img = prod ? (prod.img || prod.imagen || prod.image || `https://iaworldcenter-creator.github.io/vectec/assets/img/${targetSku}.webp`) : `https://iaworldcenter-creator.github.io/vectec/assets/img/${targetSku}.webp`;
            const cat = prod ? (prod.categoria || prod.c || 'general') : 'general';
            cart.push({
                id: targetSku,
                sku: targetSku,
                nombre: name,
                name: name,
                title: name,
                precio: price,
                price: price,
                quantity: qty,
                qty: qty,
                imagen: img,
                img: img,
                image: img,
                categoria: cat,
                stk: (prod && (prod.stk || prod.stock)) || 15,
                disponible: true
            });
        }
        saveCart(cart);

        const badge = document.getElementById("boutique-cart-badge");
        if (badge) {
            badge.classList.add("scale-125");
            setTimeout(() => badge.classList.remove("scale-125"), 200);
        }
        return cart;
    };

    window.buyNowDirect = function(skuOrItem, qty = 1) {
        window.addToCartDirect(skuOrItem, qty);
        window.location.href = "checkout.html";
    };

    // -------------------------------------------------------------------------
    // 2. GENERACIÓN Y GESTIÓN DEL PIN DE SEGURIDAD
    // -------------------------------------------------------------------------
    function getOrGeneratePin() {
        let pin = localStorage.getItem(PIN_KEY);
        if (!pin || pin.length !== 4 || isNaN(pin)) {
            pin = Math.floor(1000 + Math.random() * 9000).toString();
            localStorage.setItem(PIN_KEY, pin);
        }
        return pin;
    }

    function syncPinDisplay() {
        const pin = getOrGeneratePin();
        document.querySelectorAll("#checkout-pin, #col-checkout-pin, #chk-summary-pin, #delivery-pin-display").forEach(el => {
            el.innerText = pin;
        });
        return pin;
    }

    // -------------------------------------------------------------------------
    // 3. DETECCIÓN INTELIGENTE DE ARTÍCULOS VOLUMINOSOS / PESADOS
    // (Gabinetes con cristal templado, UPS/No-breaks, Monitores, Ensambles)
    // -------------------------------------------------------------------------
    function detectHeavyOrVolumetricItems(items) {
        let isHeavy = false;
        const reasons = [];
        let totalWeightKg = 0;

        items.forEach(item => {
            const text = `${item.name || ''} ${item.nombre || ''} ${item.category || ''} ${item.categoria || ''} ${item.sku || ''}`.toUpperCase();
            const qty = parseInt(item.quantity || item.qty || 1);

            if (text.includes("GABINETE") || text.includes("CRISTAL") || text.includes("TEMPLADO") || 
                text.includes("CHASSIS") || text.includes("CASE") || text.includes("TORRE") || text.includes("VIDRIO")) {
                isHeavy = true;
                reasons.push("Gabinete / Chasis con cristal templado (frágil/voluminoso)");
                totalWeightKg += 7.5 * qty;
            } else if (text.includes("UPS") || text.includes("NO-BREAK") || text.includes("NOBREAK") || text.includes("REGULADOR")) {
                isHeavy = true;
                reasons.push("Unidad UPS / No-Break (alto peso por baterías de plomo)");
                totalWeightKg += 10.0 * qty;
            } else if (text.includes("MONITOR") || text.includes("PANTALLA")) {
                isHeavy = true;
                reasons.push("Monitor / Pantalla (panel frágil / dimensiones no aptas para moto)");
                totalWeightKg += 5.5 * qty;
            } else if (text.includes("ENSAMBLE")) {
                isHeavy = true;
                reasons.push("Equipo de cómputo completo ensamblado");
                totalWeightKg += 11.0 * qty;
            } else if (text.includes("AIO") || text.includes("ALL IN ONE") || text.includes("IMPRESORA")) {
                isHeavy = true;
                reasons.push("Equipo Todo en Uno o Impresora voluminosa");
                totalWeightKg += 7.0 * qty;
            } else if (text.includes("LIQUIDA") || text.includes("DISIPADOR") || text.includes("ENFRIAMIENTO")) {
                totalWeightKg += 1.8 * qty;
            } else {
                totalWeightKg += 0.35 * qty;
            }
        });

        const totalQty = items.reduce((acc, i) => acc + parseInt(i.quantity || i.qty || 1), 0);
        if (totalQty >= 6) {
            isHeavy = true;
            reasons.push(`Volumen múltiple (${totalQty} artículos en pedido)`);
        }

        return {
            isHeavy: isHeavy,
            reasons: [...new Set(reasons)],
            estimatedWeightKg: Math.round(totalWeightKg * 10) / 10
        };
    }

    // -------------------------------------------------------------------------
    // 4. COTIZADOR DINÁMICO UBER FLASH (DESDE PEDRO MORENO 501 A)
    // -------------------------------------------------------------------------
    function estimateUberFlashRate(addressText = "", colonia = "", cp = "", city = "") {
        const combined = [addressText, colonia, cp, city].join(" ").toLowerCase().trim();

        if (!combined) {
            return {
                zone: 1,
                fee: 35,
                distanceKm: "~1.8 km",
                zoneName: "Zona 1: Centro / Cercanías (~1.8 km)",
                label: "Zona 1 (0-2.5 km Centro): Uber Flash Moto ($35.00 MXN)",
                isLocalZMG: true,
                originText: "Despacho desde Pedro Moreno 501 A, Guadalajara Centro (CP 44100)"
            };
        }

        const isJaliscoZMG = combined.includes("guadalajara") || combined.includes("zapopan") || 
                             combined.includes("tlaquepaque") || combined.includes("tonala") || 
                             combined.includes("tonalá") || combined.includes("tlajomulco") || 
                             combined.includes("jalisco") || combined.includes("zmg") || 
                             combined.includes("44") || combined.includes("45");

        if (!isJaliscoZMG && cp && !cp.startsWith("44") && !cp.startsWith("45")) {
            return {
                zone: 0,
                fee: 180,
                distanceKm: "Foráneo / Nacional",
                zoneName: "Envío Foráneo / Nacional",
                label: "Paquetería Foránea / Nacional (FedEx / DHL / Estafeta)",
                isLocalZMG: false,
                originText: "Despacho desde Pedro Moreno 501 A para envío nacional"
            };
        }

        if (combined.includes("tonala") || combined.includes("tonalá") || combined.includes("tlajomulco") || 
            combined.includes("periferico") || combined.includes("periférico") || combined.includes("bugambilias") || 
            combined.includes("tesistan") || combined.includes("tesistán") || combined.includes("454") || 
            combined.includes("456") || combined.includes("el colli") || combined.includes("santa margarita") || 
            combined.includes("las aguilas") || combined.includes("paseos del sol") || combined.includes("miramar") || 
            combined.includes("tabachines") || combined.includes("loma dorada")) {
            return {
                zone: 3,
                fee: 75,
                distanceKm: "~8 a 12 km",
                zoneName: "Zona 3: Periférico / Tonalá / Tlajomulco (~8+ km)",
                label: "Zona 3 (5.5-12+ km): Uber Flash Moto ($75.00 MXN)",
                isLocalZMG: true,
                originText: "Despacho desde Pedro Moreno 501 A"
            };
        }

        if (combined.includes("zapopan") || combined.includes("minerva") || combined.includes("providencia") || 
            combined.includes("tlaquepaque") || combined.includes("chapalita") || combined.includes("country") || 
            combined.includes("andares") || combined.includes("puerta de hierro") || combined.includes("446") || 
            combined.includes("450") || combined.includes("451") || combined.includes("455") || 
            combined.includes("ladron de guevara") || combined.includes("jardines del bosque") || 
            combined.includes("colinas") || combined.includes("estancia") || combined.includes("los arcos")) {
            return {
                zone: 2,
                fee: 52,
                distanceKm: "~3 a 5.5 km",
                zoneName: "Zona 2: Zapopan / Minerva / Providencia / Tlaquepaque (~4 km)",
                label: "Zona 2 (2.5-5.5 km): Uber Flash Moto ($52.00 MXN)",
                isLocalZMG: true,
                originText: "Despacho desde Pedro Moreno 501 A"
            };
        }

        return {
            zone: 1,
            fee: 35,
            distanceKm: "~1.8 km",
            zoneName: "Zona 1: Centro / Chapultepec / Americana (~1.8 km)",
            label: "Zona 1 (0-2.5 km Centro): Uber Flash Moto ($35.00 MXN)",
            isLocalZMG: true,
            originText: "Despacho desde Pedro Moreno 501 A"
        };
    }

    // -------------------------------------------------------------------------
    // 5. CÁLCULO LOGÍSTICO COMPLETO (SIN ENVÍO GRATIS CIEGO EN PESADOS)
    // -------------------------------------------------------------------------
    function calculateShippingDetails(items, addressData = {}) {
        const totalPieces = items.reduce((sum, i) => sum + (parseInt(i.quantity || i.qty || 1) || 1), 0);
        const subtotalBruto = items.reduce((sum, i) => {
            const p = parseCleanPrice(i.price || i.precio || 0);
            const q = parseInt(i.quantity || i.qty || 1) || 1;
            return sum + (p * q);
        }, 0);

        // Descuento de mayoreo aplicable si piezas totales >= 10 (8.57%)
        const discountMayoreo = totalPieces >= 10 ? Math.round(subtotalBruto * 0.0857 * 100) / 100 : 0;
        const subtotal = Math.max(0, subtotalBruto - discountMayoreo);

        const heavyData = detectHeavyOrVolumetricItems(items);
        const uberEstimate = estimateUberFlashRate(
            addressData.street || "",
            addressData.colonia || "",
            addressData.cp || "",
            addressData.city || ""
        );

        let finalCost = 0;
        let carrierName = "";
        let shippingLabel = "";
        let noticeHtml = "";
        let isFreeShipping = false;
        let requiresCustomLogistics = false;

        if (items.length === 0) {
            return {
                cost: 0,
                subtotal: 0,
                total: 0,
                carrier: "Por calcular",
                label: "Agrega productos",
                isHeavy: false,
                isFreeShipping: false,
                requiresCustomLogistics: false,
                pin: getOrGeneratePin(),
                uberEstimate: uberEstimate,
                heavyData: heavyData,
                noticeHtml: `<span class="text-slate-400">Ingresa tu domicilio para cotizar el flete exacto desde Pedro Moreno 501 A.</span>`
            };
        }

        if (heavyData.isHeavy) {
            requiresCustomLogistics = true;
            carrierName = "Paquetería Protegida / Camioneta Especializada";

            const excessKg = Math.max(0, heavyData.estimatedWeightKg - 2);
            let calculatedWeightFee = Math.round(120 + (excessKg * 16));

            if (subtotal >= 3000) {
                finalCost = Math.max(45, calculatedWeightFee - 100);
                shippingLabel = `Flete Especializado con Subsidio ($${finalCost.toFixed(2)} MXN)`;
                noticeHtml = `
                    <div class="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <i class="fa-solid fa-box-open text-amber-400"></i>
                        <span>📦 ARTÍCULO VOLUMINOSO / PESADO DETECTADO (~${heavyData.estimatedWeightKg} kg)</span>
                    </div>
                    <p class="text-amber-200 text-[11px]">
                        <strong>No apto para motocicleta Uber Flash:</strong> Tu pedido incluye ${heavyData.reasons.join(", ")}. Por seguridad y dimensiones, se despacha vía camioneta protegida / paquetería especializada.
                    </p>
                    <div class="p-2 bg-slate-950/80 rounded-xl border border-amber-500/30 text-[10.5px] text-slate-300">
                        🎉 <strong>Subsidio de $100 MXN aplicado</strong> por compra mayor a $3,000 MXN. Tarifa estimada por peso volumétrico: <strong class="text-emerald-300">$${finalCost.toFixed(2)} MXN</strong> (sujeto a validación final con el almacén mayorista).
                    </div>
                `;
            } else {
                finalCost = calculatedWeightFee;
                shippingLabel = `Flete Especializado Protegido por Peso (~${heavyData.estimatedWeightKg} kg): $${finalCost.toFixed(2)} MXN`;
                noticeHtml = `
                    <div class="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <i class="fa-solid fa-weight-hanging text-amber-400"></i>
                        <span>📦 CÁLCULO POR PESO/VOLUMEN (~${heavyData.estimatedWeightKg} kg)</span>
                    </div>
                    <p class="text-amber-200 text-[11px]">
                        <strong>No apto para motocicleta Uber Flash:</strong> ${heavyData.reasons.join(", ")}. Tarifa de flete calculada por peso volumétrico ($${finalCost.toFixed(2)} MXN) o a coordinar con logística por WhatsApp.
                    </p>
                `;
            }
        } else if (!uberEstimate.isLocalZMG) {
            carrierName = "FedEx / DHL / Estafeta Nacional Asegurado";
            if (subtotal >= 3000) {
                finalCost = 0;
                isFreeShipping = true;
                shippingLabel = "¡ENVÍO NACIONAL GRATIS ASEGURADO! (Compras > $3,000 MXN)";
                noticeHtml = `
                    <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <i class="fa-solid fa-truck-fast text-emerald-400"></i>
                        <span>🎉 ¡CALIFICAS PARA ENVÍO NACIONAL GRATIS!</span>
                    </div>
                    <p class="text-emerald-200 text-[11px]">
                        Tu compra supera los $3,000 MXN en piezas compactas. Despacho cubierto vía <strong>FedEx / DHL Asegurado ($0.00 MXN)</strong>.
                    </p>
                `;
            } else {
                finalCost = 180;
                shippingLabel = "Paquetería Nacional Asegurada FedEx / DHL ($180.00 MXN)";
                noticeHtml = `
                    <div class="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                        <i class="fa-solid fa-plane-departure text-cyan-400"></i>
                        <span>Destino Nacional / Foráneo (FedEx / DHL / Estafeta)</span>
                    </div>
                    <p class="text-slate-300 text-[11px]">
                        Despacho foráneo asegurado con guía de rastreo y firma de entrega ($180.00 MXN). Entrega en 24 a 48 horas hábiles.
                    </p>
                `;
            }
        } else {
            carrierName = `Uber Flash Moto Exprés (${uberEstimate.zoneName})`;
            
            if (subtotal >= 3000) {
                finalCost = 0;
                isFreeShipping = true;
                shippingLabel = "¡ENVÍO GRATIS ASEGURADO! (Compras > $3,000 MXN)";
                noticeHtml = `
                    <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <i class="fa-solid fa-gift text-emerald-400"></i>
                        <span>🎉 ¡CALIFICAS PARA ENVÍO GRATIS!</span>
                    </div>
                    <p class="text-emerald-200 text-[11px]">
                        Por superar los $3,000 MXN en componentes compactos, el flete corre por cuenta de la tienda ($0.00 MXN).
                    </p>
                `;
            } else {
                finalCost = uberEstimate.fee;
                shippingLabel = `${uberEstimate.label}`;
                noticeHtml = `
                    <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <i class="fa-solid fa-motorcycle text-amber-400"></i>
                        <span>🛵 Cotización Dinámica Uber Flash: ${uberEstimate.zoneName}</span>
                    </div>
                    <p class="text-slate-300 text-[11px]">
                        Tarifa calculada en tiempo real según distancia desde <strong>Pedro Moreno 501 A</strong> (${uberEstimate.distanceKm}): <strong class="text-emerald-300">$${finalCost.toFixed(2)} MXN</strong>.
                    </p>
                `;
            }
        }

        noticeHtml += `
            <div class="pt-2 border-t border-slate-800 text-[10.5px] text-slate-400 flex items-start gap-1.5 mt-2">
                <i class="fa-solid fa-location-dot text-cyan-400 mt-0.5 shrink-0"></i>
                <span><strong>Pedro Moreno 501 A (Atención y Garantías):</strong> Si requieres recolección personal en oficinas, coordínalo previamente vía WhatsApp (<strong class="text-cyan-300">+52 33 3727 1440</strong>) con <strong>al menos 24 horas hábiles de anticipación</strong> para dar tiempo a surtir el artículo del almacén mayorista.</span>
            </div>
        `;

        return {
            cost: finalCost,
            subtotal: subtotal,
            total: subtotal + finalCost,
            carrier: carrierName,
            label: shippingLabel,
            isHeavy: heavyData.isHeavy,
            heavyData: heavyData,
            uberEstimate: uberEstimate,
            isFreeShipping: isFreeShipping,
            requiresCustomLogistics: requiresCustomLogistics,
            pin: getOrGeneratePin(),
            noticeHtml: noticeHtml
        };
    }

    // Detección de artículos con stock cero o bajo pedido
    function isItemBackordered(item) {
        if (!item) return false;
        if (item.stock === 0 || item.stk === 0) return true;
        if (item.disponible === false || item.d === 0) return true;
        if (item.estado_comercial === "bajo_pedido" || item.est_com === "bajo_pedido") return true;
        return false;
    }

    function getBackorderedItems(items) {
        if (!Array.isArray(items)) return [];
        return items.filter(isItemBackordered);
    }

    function hasBackorderedItems(items) {
        return getBackorderedItems(items).length > 0;
    }

    // -------------------------------------------------------------------------
    // 6. DOBLE NOTIFICACIÓN ASÍNCRONA & CIERRE DE ORDEN
    // -------------------------------------------------------------------------
    async function processOrderDispatch(options = {}) {
        const items = getCart();
        if (items.length === 0) {
            alert("⚠️ Tu canasta de compras está vacía. Selecciona productos antes de continuar.");
            return;
        }

        // CANDADO DE SEGURIDAD: Bloqueo de checkout si existen artículos con stock cero
        const backordered = getBackorderedItems(items);
        if (backordered.length > 0) {
            const listText = backordered.map(i => `• [${i.sku || i.id || 'SKU'}] ${i.nombre || i.name || i.title || 'Artículo'}`).join('\n');
            alert(`⚠️ ACCIÓN BLOQUEADA: Tu canasta contiene artículos bajo pedido (sin stock inmediato):\n\n${listText}\n\nPor favor retíralos para continuar con la compra directa a domicilio, o comunícate con nuestro mostrador vía WhatsApp (+52 33 3727 1440) para programar su pedido especial.`);
            return;
        }

        const storeName = options.storeName || "VECTEC";
        const clientName = (options.clientName || "").trim();
        const clientPhone = (options.clientPhone || "").trim();
        const clientEmail = (options.clientEmail || "").trim();
        const street = (options.address || options.street || "").trim();
        const colonia = (options.colonia || "").trim();
        const city = (options.city || "Guadalajara, Jalisco").trim();
        const cp = (options.cp || "").trim();
        const references = (options.references || "").trim();
        const paymentMethod = options.paymentMethod || "tarjeta";
        const notes = (options.notes || "").trim();

        if (!clientName) {
            alert("⚠️ Por favor escribe tu nombre completo.");
            return;
        }
        if (!clientPhone) {
            alert("⚠️ Por favor proporciona un número de teléfono o WhatsApp.");
            return;
        }
        if (!clientEmail) {
            alert("⚠️ Por favor ingresa tu correo electrónico para confirmación.");
            return;
        }
        if (!street || !colonia || !city || !cp || !references) {
            alert("⚠️ El modelo de entrega 100% a domicilio exige obligatoriamente:\n- Calle y Número\n- Colonia\n- Código Postal (5 dígitos)\n- Ciudad / Municipio\n- Referencias de entrega");
            return;
        }

        const pin = getOrGeneratePin();
        const calc = calculateShippingDetails(items, { street, colonia, cp, city });

        let subtotal = 0;
        const itemsBreakdown = items.map((item) => {
            let rawSku = item.sku || item.id || "SKU";
            const isClaveB = rawSku.startsWith("B-") || item.prov === "B" || item.clave_proveedor === "B";
            const cleanSku = rawSku.startsWith("A-") || rawSku.startsWith("B-") 
                ? rawSku 
                : (isClaveB ? "B-" + rawSku : "A-" + rawSku);
            const clave = isClaveB ? "B" : "A";
            const name = item.nombre || item.name || item.title || "Artículo";
            const qty = parseInt(item.quantity || item.qty || 1);
            const price = parseCleanPrice(item.precio || item.price || 0);
            const itemTotal = price * qty;
            subtotal += itemTotal;
            return {
                sku: cleanSku,
                clave_proveedor: clave,
                name: name,
                qty: qty,
                unitPrice: price,
                total: itemTotal,
                lineText: `• ${qty}x [${cleanSku}] ${name} - $${itemTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
            };
        });

        const shippingCost = calc.cost;
        const grandTotal = subtotal + shippingCost;
        const orderId = "VT-" + Date.now().toString().slice(-6);
        const orderDate = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

        const orderData = {
            orderId: orderId,
            pin: pin,
            timestamp: new Date().toISOString(),
            dateFormatted: orderDate,
            store: storeName,
            customer: {
                name: clientName,
                phone: clientPhone,
                email: clientEmail,
                street: street,
                colonia: colonia,
                city: city,
                cp: cp,
                references: references
            },
            shipping: {
                carrier: calc.carrier,
                label: calc.label,
                cost: shippingCost,
                isHeavy: calc.isHeavy,
                estimatedWeightKg: calc.heavyData ? calc.heavyData.estimatedWeightKg : 0,
                pin: pin,
                dispatchNotice: "Despacho a domicilio en 24 a 48 hrs hábiles. No contamos con mostrador inmediato."
            },
            payment: {
                method: paymentMethod
            },
            items: itemsBreakdown,
            subtotal: subtotal,
            total: grandTotal,
            notes: notes
        };

        try {
            let log = JSON.parse(localStorage.getItem(ORDERS_LOG_KEY) || "[]");
            log.unshift(orderData);
            if (log.length > 50) log = log.slice(0, 50);
            localStorage.setItem(ORDERS_LOG_KEY, JSON.stringify(log));
        } catch (e) {}

        // ALERTA 1: Transmisión Asíncrona Backend / Webhook
        try {
            fetch(WEBHOOK_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    alert: "NUEVA_VENTA_VECTEC_CONFIRMADA",
                    order: orderData,
                    adminEmailTarget: ADMIN_EMAIL
                }),
                mode: "cors",
                keepalive: true
            }).catch(() => {});
        } catch (e) {}

        // ALERTA 2: Mensaje Directo a WhatsApp (+52 33 3727 1440)
        const paymentLabelMap = {
            tarjeta: "Tarjeta de Crédito / Débito (Mercado Pago)",
            spei: "Transferencia SPEI Directa BBVA (0% Comisión)",
            oxxo: "Depósito / Abono en Efectivo OXXO"
        };
        const paymentLabel = paymentLabelMap[paymentMethod] || paymentMethod;

        const messageLines = [
            `🚨 *NUEVO PEDIDO CONFIRMADO - ${storeName.toUpperCase()}*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `🆔 *Orden:* ${orderId}`,
            `📅 *Fecha:* ${orderDate}`,
            `🔐 *PIN ENTREGA UBER:* ${pin}`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👤 *DATOS DEL CLIENTE:*`,
            `• *Nombre:* ${clientName}`,
            `• *Teléfono / WhatsApp:* ${clientPhone}`,
            `• *Correo:* ${clientEmail}`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `📍 *DOMICILIO DE ENTREGA (100% A DOMICILIO):*`,
            `🏠 *Calle y Núm:* ${street}`,
            `🏘️ *Colonia:* ${colonia}`,
            `🏙️ *Ciudad/Estado:* ${city}`,
            `📮 *Código Postal:* ${cp}`,
            `🧭 *Referencias:* ${references}`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `🚚 *LOGÍSTICA Y TRANSPORTE:*`,
            `• *Modalidad:* ${calc.carrier}`,
            `• *Tarifa:* $${shippingCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
            calc.isHeavy ? `⚠️ *Peso Estimado:* ~${calc.heavyData.estimatedWeightKg} kg (${calc.heavyData.reasons.join(', ')})` : `🛵 *Zona Uber:* ${calc.uberEstimate.zoneName} (${calc.uberEstimate.distanceKm})`,
            `⏱️ *Plazo de Entrega:* 24 a 48 horas hábiles`,
            `ℹ️ _Recolección en Pedro Moreno 501 A requiere coordinación previa por WhatsApp de 24 hrs hábiles para surtido de almacén._`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `📦 *DESGLOSE DE ARTÍCULOS:*`,
            itemsBreakdown.map(i => i.lineText).join('\n'),
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `💵 *Subtotal:* $${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
            `🚚 *Envío:* $${shippingCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
            `💰 *TOTAL A LIQUIDAR: $${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `💳 *Forma de Pago:* ${paymentLabel}`,
            notes ? `📝 *Instrucciones:* ${notes}\n━━━━━━━━━━━━━━━━━━━━━━━━━━` : null,
            `⚠️ *ACCIÓN REQUERIDA:* Procesar pedido y generar despacho con PIN de seguridad.`
        ].filter(Boolean);

        const fullMessage = messageLines.join('\n');
        const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(fullMessage)}`;

        window.open(waUrl, "_blank");

        return orderData;
    }

    // -------------------------------------------------------------------------
    // 7. EXPOSICIÓN GLOBAL
    // -------------------------------------------------------------------------
    window.SharedCart = {
        addToCart: window.addToCartDirect,
        buyNow: window.buyNowDirect,
        get: getCart,
        save: saveCart,
        getPin: getOrGeneratePin,
        syncPin: syncPinDisplay,
        detectHeavyOrVolumetric: detectHeavyOrVolumetricItems,
        estimateUberFlashRate: estimateUberFlashRate,
        calculateShippingDetails: calculateShippingDetails,
        processOrderDispatch: processOrderDispatch,
        checkoutViaWhatsApp: processOrderDispatch,
        requiresProtectedShipping: function (items) {
            return detectHeavyOrVolumetricItems(items).isHeavy;
        },
        isItemBackordered: isItemBackordered,
        getBackorderedItems: getBackorderedItems,
        hasBackorderedItems: hasBackorderedItems,
        updateBadges: updateCartBadges
    };

    document.addEventListener("DOMContentLoaded", () => {
        updateCartBadges();
        syncPinDisplay();
    });
})();
