/**
 * shared-cart-whatsapp.js
 * Gestor Universal de Carrito, Cotizador Dinámico Uber Flash, PIN de Seguridad y Doble Notificación
 * Marca Oficial: VECTEC / Ecosistema Comercial
 * Contacto WhatsApp: +52 33 3727 1440
 * Origen de Despacho & Soporte: Pedro Moreno 501 A, Guadalajara Centro (CP 44100)
 */

(function () {
    const WHATSAPP_PHONE = "523337271440";
    const ADMIN_EMAIL = "iaworldcenter@gmail.com";
    const SECONDARY_EMAIL = "nfl.gdl@hotmail.com";
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

    function clearCart() {
        KNOWN_CART_KEYS.forEach(k => {
            try { localStorage.removeItem(k); } catch(e) {}
        });
        try { localStorage.removeItem(CART_KEY); } catch(e) {}
        try { localStorage.removeItem(ALT_CART_KEY); } catch(e) {}
        updateCartBadges();
        if (typeof window.renderDrawerItems === 'function') {
            window.renderDrawerItems();
        }
        window.dispatchEvent(new Event('storage'));
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

        // Descuento de mayoreo aplicable si piezas totales >= 10 (10% adicional sobre precio de oferta)
        const discountMayoreo = totalPieces >= 10 ? Math.round(subtotalBruto * 0.10 * 100) / 100 : 0;
        const subtotal = Math.max(0, subtotalBruto - discountMayoreo);

        const heavyData = detectHeavyOrVolumetricItems(items);
        const uberEstimate = estimateUberFlashRate(
            addressData.street || "",
            addressData.colonia || "",
            addressData.cp || "",
            addressData.city || ""
        );

        // SOPORTE OFICIAL: RECOLECCIÓN EN TIENDA / MOSTRADOR (GRATIS $0.00 MXN)
        if (addressData.deliveryMethod === 'tienda' || addressData.isPickup === true) {
            return {
                cost: 0,
                subtotal: subtotal,
                total: subtotal,
                carrier: "Recolección en Mostrador (Pedro Moreno 501 A)",
                label: "Recoger en Tienda - Gratis ($0.00 MXN)",
                isHeavy: heavyData.isHeavy,
                heavyData: heavyData,
                uberEstimate: uberEstimate,
                isFreeShipping: true,
                requiresCustomLogistics: false,
                pin: getOrGeneratePin(),
                noticeHtml: `
                    <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <i class="fa-solid fa-store text-emerald-400"></i>
                        <span>🏬 RECOLECCIÓN DIRECTA EN MOSTRADOR (GRATIS)</span>
                    </div>
                    <p class="text-emerald-200 text-[11px]">
                        Recoge tu pedido sin costo de envío en <strong>Pedro Moreno 501 A, Col. Centro, Guadalajara, Jalisco</strong>. Horario: Lunes a Sábado de 10:00 a 19:00 hrs.
                    </p>
                `
            };
        }

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


    const MP_PUBLIC_KEY = "APP_USR-2bad8b39-5c44-496d-a69c-93adfa377472";
    // Endpoint serverless de Cloudflare Worker (MP_ACCESS_TOKEN almacenado únicamente como Cloudflare Secret)
    const DEFAULT_MP_WORKER_ENDPOINT = "";

    function showPaymentLoader(title = "Conectando con pasarela segura...", subtitle = "Generando orden cifrada y habilitando pago con Tarjeta y Red Nacional de Efectivo (OXXO, 7-Eleven, Farmacias GDL, Soriana)...") {
        let loader = document.getElementById("mp-payment-loader");
        if (!loader) {
            loader = document.createElement("div");
            loader.id = "mp-payment-loader";
            loader.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;text-align:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    <div style="position:relative;width:68px;height:68px;margin-bottom:20px;">
                        <div style="position:absolute;inset:0;border:4px solid rgba(6,182,212,0.15);border-radius:50%;"></div>
                        <div style="position:absolute;inset:0;border:4px solid transparent;border-top-color:#06b6d4;border-right-color:#3b82f6;border-radius:50%;animation:mp-spin 0.85s cubic-bezier(0.55,0.15,0.45,0.85) infinite;"></div>
                    </div>
                    <h3 id="mp-loader-title" style="color:#ffffff;font-size:19px;font-weight:900;margin:0 0 10px 0;letter-spacing:-0.02em;">${title}</h3>
                    <p id="mp-loader-desc" style="color:#94a3b8;font-size:13px;max-width:440px;line-height:1.55;margin:0;">${subtitle}</p>
                    <style>
                        @keyframes mp-spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            const tEl = loader.querySelector("#mp-loader-title");
            const dEl = loader.querySelector("#mp-loader-desc");
            if (tEl) tEl.innerText = title;
            if (dEl) dEl.innerText = subtitle;
            loader.style.display = "flex";
        }
    }

    function hidePaymentLoader() {
        const loader = document.getElementById("mp-payment-loader");
        if (loader) {
            loader.style.display = "none";
        }
    }

    async function createMercadoPagoPreference(orderData) {
        const { items, customer, shipping, orderId, paymentMethod, discountFactor } = orderData;
        const factor = (typeof discountFactor === "number" && discountFactor > 0 && discountFactor <= 1) ? discountFactor : 1.0;

        // Sanitización y armado de artículos para Mercado Pago
        const mpItems = (items || []).map((item, idx) => {
            const rawPrice = parseCleanPrice(item.unitPrice || item.price || item.precio || 0) * factor;
            const qty = parseInt(item.qty || item.quantity || 1);
            return {
                id: String(item.sku || `ITEM-${idx + 1}`),
                title: String(item.name || item.nombre || item.title || "Artículo VECTEC").slice(0, 120),
                quantity: qty > 0 ? qty : 1,
                currency_id: "MXN",
                unit_price: isNaN(rawPrice) || rawPrice <= 0 ? 10.00 : parseFloat(rawPrice.toFixed(2))
            };
        });

        // Cargo de envío en los items de la preferencia
        const shippingCost = parseFloat(shipping?.cost || 0);
        if (shippingCost > 0) {
            mpItems.push({
                id: "SHIPPING-LOGISTICS",
                title: `Envío ${shipping?.carrier || 'Uber Flash / Paquetería'} (${shipping?.label || 'A Domicilio'})`,
                quantity: 1,
                currency_id: "MXN",
                unit_price: parseFloat(shippingCost.toFixed(2))
            });
        }

        let currentOrigin = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null")
            ? window.location.origin
            : "https://iaworldcenter-creator.github.io";
        // Blindaje contra 400 Bad Request de Mercado Pago en entornos de desarrollo local o file://
        if (!currentOrigin.startsWith("https://") || currentOrigin.includes("localhost") || currentOrigin.includes("127.0.0.1")) {
            currentOrigin = "https://iaworldcenter-creator.github.io";
        }
        let currentPath = (typeof window !== "undefined" && window.location && window.location.pathname) ? window.location.pathname : "/sitios-web/checkout.html";
        if (!currentPath || currentPath.includes(":") || currentPath.includes("\\") || currentPath === "/") {
            currentPath = "/sitios-web/checkout.html";
        }
        const returnUrl = `${currentOrigin}${currentPath}`;

        const cleanPhone = String(customer?.phone || "").replace(/[^0-9]/g, "");
        const payerObj = {
            name: customer?.name || "Cliente VECTEC",
            email: customer?.email || "cliente@ejemplo.com",
            address: {
                street_name: `${customer?.street || 'Pedro Moreno 501 A'} ${customer?.colonia || 'Centro'}`.trim(),
                zip_code: String(customer?.cp || "44100").replace(/[^0-9]/g, "").slice(0, 5) || "44100"
            }
        };
        if (cleanPhone.length >= 7) {
            payerObj.phone = { number: cleanPhone };
        }

        const payload = {
            items: mpItems,
            payer: payerObj,
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 12
            },
            back_urls: {
                success: `${returnUrl}?status=approved&order=${orderId}`,
                failure: `${returnUrl}?status=failure&order=${orderId}`,
                pending: `${returnUrl}?status=pending&order=${orderId}`
            },
            auto_return: "approved",
            external_reference: String(orderId),
            statement_descriptor: "VECTEC"
        };

        // Llamada segura al proxy Cloudflare Worker / Endpoint Serverless (sin tokens privados en frontend)
        const endpoint = (typeof window !== "undefined" && window.MP_PREFERENCE_ENDPOINT && typeof window.MP_PREFERENCE_ENDPOINT === "string")
            ? window.MP_PREFERENCE_ENDPOINT.trim()
            : DEFAULT_MP_WORKER_ENDPOINT;

        if (endpoint) {
            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.init_point) return data;
                } else {
                    console.warn("Endpoint Mercado Pago respondió con estado:", res.status);
                }
            } catch (e) {
                console.warn("No se pudo contactar con el Cloudflare Worker de Mercado Pago:", e);
            }
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // 6. DOBLE NOTIFICACIÓN ASÍNCRONA, MODAL SIN POPUP-BLOCKERS & CIERRE DE ORDEN
    // -------------------------------------------------------------------------
    function showOrderSuccessModal(orderData, waUrl, paymentDetails = {}) {
        hidePaymentLoader();
        const existing = document.getElementById("order-success-modal");
        if (existing) existing.remove();

        const { orderId, pin, grandTotal, storeName, paymentMethod, isPickup } = orderData;
        const mpInitPoint = paymentDetails.mpInitPoint || null;
        const clabeClean = "012180015425843949";
        const emailSubject = encodeURIComponent(`Nuevo Pedido ${orderId} - ${storeName}`);
        const emailBody = encodeURIComponent(orderData.rawMessageText || "");
        const mailUrl = `mailto:${ADMIN_EMAIL}?cc=${SECONDARY_EMAIL}&subject=${emailSubject}&body=${emailBody}`;

        let paymentSpecificHtml = "";
        if (paymentMethod === "spei") {
            paymentSpecificHtml = `
                <div style="background:rgba(16,185,129,0.1);border:1px solid #10b981;border-radius:16px;padding:16px;margin:16px 0;text-align:left;">
                    <div style="font-size:12px;color:#34d399;font-weight:bold;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
                        <span>🏦 DATOS PARA TRANSFERENCIA SPEI BBVA (0% COMISIÓN)</span>
                    </div>
                    <div style="font-size:13px;color:#f1f5f9;line-height:1.6;font-family:monospace;">
                        <div><strong>Banco:</strong> BBVA México</div>
                        <div><strong>Beneficiario:</strong> VECTEC / Ecosistema Vía MX</div>
                        <div style="display:flex;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap;">
                            <strong>CLABE:</strong> <span style="background:#020617;padding:3px 8px;border-radius:6px;border:1px solid #334155;color:#38bdf8;">${clabeClean}</span>
                            <button type="button" onclick="navigator.clipboard.writeText('${clabeClean}');this.innerText='¡Copiada!';" style="background:#0284c7;color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;">Copiar CLABE</button>
                        </div>
                        <div><strong>Monto Exacto:</strong> <span style="color:#4ade80;font-weight:bold;">$${grandTotal.toLocaleString('es-MX', {minimumFractionDigits:2})} MXN</span></div>
                        <div><strong>Concepto / Referencia:</strong> <span style="color:#f59e0b;font-weight:bold;">${orderId}</span></div>
                    </div>
                </div>
            `;
        } else if (mpInitPoint) {
            paymentSpecificHtml = `
                <div style="background:rgba(6,182,212,0.12);border:1px solid #06b6d4;border-radius:16px;padding:16px;margin:16px 0;text-align:left;">
                    <div style="font-size:12px;color:#22d3ee;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">
                        <span>💳 PASARELA MERCADO PAGO CHECKOUT PRO LISTA</span>
                    </div>
                    <p style="font-size:12.5px;color:#cbd5e1;margin:0;line-height:1.5;">
                        Tu enlace oficial de cobro por <strong>$${grandTotal.toLocaleString('es-MX', {minimumFractionDigits:2})} MXN</strong> está activo. Serás redirigido automáticamente en un instante o pulsa el botón azul inferior para pagar con Tarjeta o en Efectivo (OXXO / Red Nacional).
                    </p>
                </div>
            `;
        } else if (paymentMethod === "tarjeta") {
            paymentSpecificHtml = `
                <div style="background:rgba(6,182,212,0.1);border:1px solid #06b6d4;border-radius:16px;padding:16px;margin:16px 0;text-align:left;">
                    <div style="font-size:12px;color:#22d3ee;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">
                        <span>💳 PAGO CON TARJETA DE CRÉDITO / DÉBITO (MERCADO PAGO)</span>
                    </div>
                    <p style="font-size:12.5px;color:#cbd5e1;margin:0;line-height:1.5;">
                        Tu orden ha sido registrada. Al pulsar el botón de WhatsApp se enviará tu pedido al mostrador para proporcionarte atención y confirmar tu link directo de pago.
                    </p>
                </div>
            `;
        } else {
            paymentSpecificHtml = `
                <div style="background:rgba(245,158,11,0.1);border:1px solid #f59e0b;border-radius:16px;padding:16px;margin:16px 0;text-align:left;">
                    <div style="font-size:12px;color:#fbbf24;font-weight:bold;text-transform:uppercase;margin-bottom:8px;">
                        <span>💵 PAGO EN EFECTIVO (RED NACIONAL OXXO / TIENDAS)</span>
                    </div>
                    <p style="font-size:12.5px;color:#cbd5e1;margin:0;line-height:1.5;">
                        Tu orden ha sido registrada. Envía tu pedido por WhatsApp o correo para generar tu referencia oficial en OXXO, 7-Eleven, Farmacias Guadalajara o liquidar en tienda.
                    </p>
                </div>
            `;
        }

        let deliverySpecificHtml = "";
        if (isPickup) {
            deliverySpecificHtml = `
                <div style="background:rgba(59,130,246,0.1);border:1px solid #3b82f6;border-radius:16px;padding:14px;margin-bottom:16px;text-align:left;">
                    <div style="font-size:12px;color:#60a5fa;font-weight:bold;text-transform:uppercase;margin-bottom:4px;">
                        🏬 RECOLECCIÓN EN TIENDA / MOSTRADOR GUADALAJARA
                    </div>
                    <div style="font-size:12px;color:#e2e8f0;line-height:1.5;">
                        📍 <strong>Dirección:</strong> Pedro Moreno 501 A, Col. Centro, Guadalajara, Jal.<br>
                        🕒 <strong>Horario:</strong> Lunes a Sábado de 10:00 a 19:00 hrs.<br>
                        🔑 <strong>PIN de Entrega en Mostrador:</strong> <span style="font-family:monospace;background:#020617;padding:2px 8px;border-radius:4px;color:#34d399;font-weight:bold;">${pin}</span>
                    </div>
                </div>
            `;
        }

        const primaryMpBtnHtml = mpInitPoint ? `
            <a href="${mpInitPoint}" id="btn-modal-mp" target="_top" style="background:linear-gradient(135deg, #0284c7, #2563eb);color:#ffffff;text-decoration:none;padding:15px 20px;border-radius:14px;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 25px -5px rgba(37,99,235,0.5);cursor:pointer;">
                <span>💳 Pagar Ahora en Mercado Pago ($${grandTotal.toLocaleString('es-MX', {minimumFractionDigits:2})})</span>
            </a>
        ` : "";

        const modal = document.createElement("div");
        modal.id = "order-success-modal";
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(12px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <div style="background:#0f172a;border:2px solid #38bdf8;border-radius:24px;max-width:540px;width:100%;max-height:92vh;overflow-y:auto;padding:28px 24px;box-shadow:0 25px 60px -15px rgba(56,189,248,0.3);text-align:center;color:#ffffff;">
                    <div style="width:68px;height:68px;background:rgba(16,185,129,0.15);border:2px solid #10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;font-size:32px;">
                        ✅
                    </div>
                    <h2 style="font-size:22px;font-weight:900;margin:0 0 6px 0;letter-spacing:-0.02em;color:#ffffff;">¡Orden ${orderId} Registrada!</h2>
                    <p style="color:#94a3b8;font-size:13px;margin:0 0 16px 0;">Total a Liquidar: <strong style="color:#38bdf8;font-size:16px;">$${grandTotal.toLocaleString('es-MX', {minimumFractionDigits:2})} MXN</strong></p>
                    
                    ${deliverySpecificHtml}
                    ${paymentSpecificHtml}

                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${primaryMpBtnHtml}
                        <a href="${waUrl}" id="btn-modal-wa" target="_top" style="background:linear-gradient(135deg, #10b981, #059669);color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:14px;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 25px -5px rgba(16,185,129,0.4);cursor:pointer;">
                            <span>📲 Enviar Pedido por WhatsApp (+52 33 3727 1440)</span>
                        </a>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                            <a href="${mailUrl}" style="background:#1e293b;color:#e2e8f0;text-decoration:none;padding:11px 14px;border-radius:12px;font-weight:600;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid #334155;">
                                <span>📧 Enviar por Correo</span>
                            </a>
                            <button type="button" id="btn-modal-copy" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(orderData.rawMessageText || '')}'));this.innerText='¡Copiado!';" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;padding:11px 14px;border-radius:12px;font-weight:600;font-size:12px;cursor:pointer;">
                                📋 Copiar Resumen
                            </button>
                        </div>

                        <div style="font-size:11px;color:#94a3b8;margin-top:6px;line-height:1.5;border-top:1px solid #1e293b;padding-top:10px;">
                            📧 <strong>Pedidos:</strong> <a href="mailto:${ADMIN_EMAIL}" style="color:#38bdf8;text-decoration:none;font-weight:bold;">${ADMIN_EMAIL}</a><br>
                            📩 <strong>Respaldo / Soporte:</strong> <a href="mailto:${SECONDARY_EMAIL}" style="color:#cbd5e1;text-decoration:none;font-weight:bold;">${SECONDARY_EMAIL}</a>
                        </div>
                        <button type="button" onclick="document.getElementById('order-success-modal').remove();" style="background:transparent;border:none;color:#64748b;font-size:12px;margin-top:4px;padding:6px;cursor:pointer;">
                            Cerrar ventana
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Limpiar carrito solo cuando NO va pendiente de pago en Mercado Pago (en MP se limpia al volver con status=approved)
        if (!mpInitPoint && typeof clearCart === 'function') {
            clearCart();
        }

        // Auto-navegación directa sin popup-blockers (salvo en modo test automatizado)
        if (!window.__DISABLE_CHECKOUT_AUTOREDIRECT) {
            const targetUrl = mpInitPoint || waUrl;
            const delayMs = mpInitPoint ? 1200 : 1800;
            setTimeout(() => {
                try {
                    window.location.href = targetUrl;
                } catch(e) {}
            }, delayMs);
        }
    }

    async function processOrderDispatch(options = {}) {
        const items = (options.items && Array.isArray(options.items) && options.items.length > 0)
            ? options.items
            : getCart();

        if (!items || items.length === 0) {
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

        const isPickup = options.deliveryMethod === "tienda" || options.isPickup === true;
        const storeName = options.storeName || "VECTEC";
        const clientName = (options.clientName || "").trim();
        const clientPhone = (options.clientPhone || "").trim();
        const clientEmail = (options.clientEmail || "").trim();
        const street = isPickup ? "Pedro Moreno 501 A" : ((options.address || options.street || "").trim());
        const colonia = isPickup ? "Centro" : ((options.colonia || "").trim() || "Centro / Área Metropolitana");
        const city = isPickup ? "Guadalajara, Jalisco" : ((options.city || "Guadalajara, Jalisco").trim());
        const cp = isPickup ? "44100" : ((options.cp || "").trim());
        const references = isPickup ? "Recolección en Mostrador por el titular" : ((options.references || "").trim() || street);
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
        if (!isPickup && (!street || !cp)) {
            alert("⚠️ Para entrega a domicilio es obligatorio ingresar tu Domicilio Completo y Código Postal (5 dígitos).");
            return;
        }

        const pin = getOrGeneratePin();
        const calc = calculateShippingDetails(items, { 
            street, 
            colonia, 
            cp, 
            city, 
            deliveryMethod: isPickup ? 'tienda' : 'domicilio',
            isPickup: isPickup 
        });

        const totalPieces = items.reduce((sum, i) => sum + (parseInt(i.quantity || i.qty || 1) || 1), 0);
        const discountFactor = totalPieces >= 10 ? 0.90 : 1.0;

        let subtotalBruto = 0;
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
            subtotalBruto += itemTotal;
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

        const discountMayoreo = totalPieces >= 10 ? Math.round(subtotalBruto * 0.10 * 100) / 100 : 0;
        const subtotal = Math.max(0, subtotalBruto - discountMayoreo);
        const shippingCost = isPickup ? 0 : calc.cost;
        const grandTotal = subtotal + shippingCost;
        const orderId = "VT-" + Date.now().toString().slice(-6);
        const orderDate = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

        const orderData = {
            orderId: orderId,
            pin: pin,
            timestamp: new Date().toISOString(),
            dateFormatted: orderDate,
            storeName: storeName,
            isPickup: isPickup,
            deliveryMethod: isPickup ? 'tienda' : 'domicilio',
            discountFactor: discountFactor,
            discountMayoreo: discountMayoreo,
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
                cost: shippingCost,
                carrier: isPickup ? "Recolección en Mostrador" : calc.carrier,
                label: isPickup ? "Recolección en Tienda (Gratis)" : calc.label,
                isHeavy: calc.isHeavy
            },
            items: items,
            itemsBreakdown: itemsBreakdown,
            subtotal: subtotal,
            grandTotal: grandTotal,
            paymentMethod: paymentMethod,
            notes: notes
        };

        const paymentLabelMap = {
            tarjeta: "Tarjeta de Crédito / Débito (Mercado Pago)",
            spei: "Transferencia SPEI Directa BBVA (0% Comisión)",
            oxxo: "Depósito en Efectivo (Red Nacional: OXXO, 7-Eleven, Farmacias GDL, Soriana)"
        };
        const paymentLabel = paymentLabelMap[paymentMethod] || paymentMethod;

        const messageLines = [
            `🛍️ *PEDIDO OFICIAL — ${storeName}*`,
            `🆔 *Folio de Orden:* ${orderId}`,
            `📅 *Fecha y Hora:* ${orderDate}`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👤 *DATOS DEL CLIENTE:*`,
            `• *Nombre:* ${clientName}`,
            `• *WhatsApp / Tel:* ${clientPhone}`,
            `• *Correo:* ${clientEmail}`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            isPickup ? `🏬 *MODALIDAD: RECOLECCIÓN EN TIENDA / MOSTRADOR*` : `📍 *DOMICILIO DE ENTREGA (A DOMICILIO):*`,
            isPickup ? `• *Punto de Recolección:* Pedro Moreno 501 A, Col. Centro, Guadalajara, Jal.` : `• *Calle y Núm:* ${street}`,
            isPickup ? `• *Horario:* Lunes a Sábado de 10:00 a 19:00 hrs` : `• *Colonia:* ${colonia}`,
            isPickup ? `• *Ciudad:* Guadalajara, Jalisco` : `• *Ciudad/Estado:* ${city} (CP: ${cp})`,
            isPickup ? `• *PIN de Entrega en Mostrador:* ${pin}` : `• *Referencias:* ${references}`,
            !isPickup ? `• *PIN de Chofer Uber:* ${pin}` : null,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `🚚 *LOGÍSTICA Y TRANSPORTE:*`,
            `• *Modalidad:* ${isPickup ? "Recolección Personal en Mostrador" : calc.carrier}`,
            `• *Costo de Envío:* $${shippingCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN${isPickup ? " (GRATIS)" : ""}`,
            (!isPickup && calc.isHeavy) ? `⚠️ *Peso Estimado:* ~${calc.heavyData.estimatedWeightKg} kg (${calc.heavyData.reasons.join(', ')})` : null,
            (!isPickup && !calc.isHeavy) ? `🛵 *Zona Uber:* ${calc.uberEstimate.zoneName}` : null,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `📦 *DESGLOSE DE ARTÍCULOS:*`,
            itemsBreakdown.map(i => i.lineText).join('\n'),
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            discountMayoreo > 0 ? `🏷️ *Descuento Mayoreo (-10%):* -$${discountMayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : null,
            `💵 *Subtotal:* $${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
            `🚚 *Envío:* $${shippingCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
            `💰 *TOTAL A LIQUIDAR: $${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `💳 *Forma de Pago:* ${paymentLabel}`,
            paymentMethod === 'spei' ? `🏦 *Datos Bancarios BBVA:*\n• Banco: BBVA México\n• Beneficiario: VECTEC / Ecosistema Vía MX\n• CLABE: 012180015425843949\n• Concepto: ${orderId}` : null,
            notes ? `📝 *Instrucciones:* ${notes}\n━━━━━━━━━━━━━━━━━━━━━━━━━━` : null,
            `⚠️ *ACCIÓN REQUERIDA:* Procesar pedido y confirmar orden.`
        ].filter(Boolean);

        // Enviar webhook asíncrono si no está en modo stub
        try {
            fetch(WEBHOOK_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
                mode: "no-cors"
            }).catch(() => {});
        } catch(e) {}

        let mpInitPoint = null;
        if (paymentMethod === "tarjeta" || paymentMethod === "oxxo") {
            const loaderTitle = paymentMethod === "tarjeta"
                ? "Conectando con Pasarela Segura de Tarjetas..."
                : "Conectando con Red Nacional de Efectivo...";
            const loaderSub = paymentMethod === "tarjeta"
                ? "Generando preferencia cifrada en Mercado Pago Checkout Pro..."
                : "Habilitando ficha de pago en OXXO, 7-Eleven, Farmacias GDL y Soriana...";
            showPaymentLoader(loaderTitle, loaderSub);

            let pref = null;
            try {
                pref = await createMercadoPagoPreference(orderData);
            } catch(e) {}

            hidePaymentLoader();
            if (pref && pref.init_point) {
                mpInitPoint = pref.init_point;
                orderData.mpInitPoint = pref.init_point;
                orderData.mpPreferenceId = pref.preferenceId || null;
                messageLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                messageLines.push(`🔗 *ENLACE MERCADO PAGO CHECKOUT PRO:*`);
                messageLines.push(pref.init_point);
            } else if (paymentMethod === "tarjeta") {
                messageLines.push(`ℹ️ _Solicitud de Link de Pago Seguro Mercado Pago para liquidar con tarjeta._`);
            } else {
                messageLines.push(`ℹ️ _Solicitud de Ficha de Depósito en Efectivo OXXO / Red Nacional._`);
            }
        }

        const fullMessage = messageLines.join('\n');
        orderData.rawMessageText = fullMessage;
        const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(fullMessage)}`;

        // Persistencia en CRM y logs locales
        try {
            saveOrderToHistory(orderData);
        } catch(e) {}

        showOrderSuccessModal(orderData, waUrl, { paymentMethod, mpInitPoint });
        return orderData;
    }

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
        clear: clearCart,
        checkoutViaWhatsApp: processOrderDispatch,
        createMercadoPagoPreference: createMercadoPagoPreference,
        showPaymentLoader: showPaymentLoader,
        hidePaymentLoader: hidePaymentLoader,
        requiresProtectedShipping: function (items) {
            return detectHeavyOrVolumetricItems(items).isHeavy;
        },
        isItemBackordered: isItemBackordered,
        getBackorderedItems: getBackorderedItems,
        hasBackorderedItems: hasBackorderedItems,
        updateBadges: updateCartBadges
    };

    // -------------------------------------------------------------------------
    // 8. DETECCIÓN AUTOMÁTICA DE RETORNO MERCADO PAGO (SUCCESS / FAILURE / PENDING)
    // -------------------------------------------------------------------------
    function checkMercadoPagoReturnStatus() {
        if (typeof window === "undefined" || !window.location || !window.location.search) return;
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status") || params.get("collection_status");
        const orderId = params.get("order") || params.get("external_reference");
        const paymentId = params.get("payment_id") || params.get("collection_id") || "N/A";
        
        if (!status) return;

        if (status === "approved") {
            // Vaciar carrito tras pago acreditado
            saveCart([]);
            try { localStorage.removeItem("cart"); } catch(e) {}
            try { localStorage.removeItem("shared_cart_items"); } catch(e) {}
            updateCartBadges();

            let orderPin = "0000";
            try {
                const log = JSON.parse(localStorage.getItem(ORDERS_LOG_KEY) || "[]");
                const found = log.find(o => o.orderId === orderId);
                if (found && found.pin) orderPin = found.pin;
                else orderPin = getOrGeneratePin();
            } catch(e) {
                orderPin = getOrGeneratePin();
            }

            const waMsg = `✅ *PAGO CONFIRMADO MERCADO PAGO - VECTEC*\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `🆔 *Orden:* ${orderId || 'VT-CONFIRMADO'}\n` +
                          `💳 *No. Operación MP:* ${paymentId}\n` +
                          `🔐 *PIN de Entrega:* ${orderPin}\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `Hola, acabo de pagar mi pedido mediante Mercado Pago. Por favor confirmen la preparación (${found && found.isPickup ? "para recolección en mostrador Pedro Moreno 501 A" : "para despacho a domicilio"}).`;

            const waLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(waMsg)}`;

            const modal = document.createElement("div");
            modal.id = "mp-success-modal";
            modal.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(2,6,23,0.95);backdrop-filter:blur(14px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    <div style="background:#0f172a;border:1px solid #10b981;border-radius:24px;max-width:520px;width:100%;padding:32px 28px;box-shadow:0 25px 60px -15px rgba(16,185,129,0.3);text-align:center;color:#ffffff;position:relative;">
                        <div style="width:72px;height:72px;background:rgba(16,185,129,0.15);border:2px solid #10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;color:#10b981;font-size:32px;font-weight:900;">
                            ✓
                        </div>
                        <h2 style="font-size:24px;font-weight:900;margin:0 0 8px 0;letter-spacing:-0.03em;color:#ffffff;">¡Pago Acreditado con Éxito!</h2>
                        <p style="color:#94a3b8;font-size:14px;margin:0 0 24px 0;line-height:1.5;">Tu transacción ha sido validada y confirmada en tiempo real por Mercado Pago.</p>
                        
                        <div style="background:#1e293b;border-radius:16px;padding:18px;margin-bottom:24px;text-align:left;font-size:13px;line-height:1.8;">
                            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:8px;">
                                <span style="color:#94a3b8;">No. de Orden:</span>
                                <strong style="color:#38bdf8;font-family:monospace;font-size:15px;">${orderId || 'VT-DIRECT'}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:8px;">
                                <span style="color:#94a3b8;">Referencia MP:</span>
                                <strong style="color:#cbd5e1;font-family:monospace;">${paymentId}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:8px;">
                                <span style="color:#94a3b8;">PIN de Entrega (Uber):</span>
                                <strong style="color:#10b981;font-family:monospace;font-size:16px;background:rgba(16,185,129,0.1);padding:2px 8px;border-radius:6px;">${orderPin}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;">
                                <span style="color:#94a3b8;">Plazo de Entrega:</span>
                                <strong style="color:#f1f5f9;">24 a 48 horas hábiles</strong>
                            </div>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:12px;">
                            <a href="${waLink}" target="_blank" style="background:#10b981;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:14px;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 25px -5px rgba(16,185,129,0.4);transition:all 0.2s;">
                                <span>Notificar Mostrador por WhatsApp</span>
                            </a>
                            <a href="index.html" style="background:#334155;color:#f8fafc;text-decoration:none;padding:12px 20px;border-radius:14px;font-weight:600;font-size:13px;display:inline-block;transition:all 0.2s;">
                                Regresar al Catálogo
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

        } else if (status === "failure") {
            const modal = document.createElement("div");
            modal.id = "mp-failure-modal";
            modal.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(2,6,23,0.95);backdrop-filter:blur(14px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    <div style="background:#0f172a;border:1px solid #ef4444;border-radius:24px;max-width:500px;width:100%;padding:32px 28px;box-shadow:0 25px 60px -15px rgba(239,68,68,0.3);text-align:center;color:#ffffff;">
                        <div style="width:72px;height:72px;background:rgba(239,68,68,0.15);border:2px solid #ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;color:#ef4444;font-size:32px;font-weight:900;">
                            ✕
                        </div>
                        <h2 style="font-size:22px;font-weight:900;margin:0 0 8px 0;letter-spacing:-0.03em;color:#ffffff;">No se pudo procesar el pago</h2>
                        <p style="color:#94a3b8;font-size:14px;margin:0 0 24px 0;line-height:1.5;">El emisor declinó la operación o la sesión fue cancelada. No se aplicó ningún cobro.</p>
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            <a href="checkout.html" style="background:#0284c7;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:14px;font-weight:700;font-size:14px;display:inline-block;">
                                Intentar Nuevamente o Cambiar Tarjeta
                            </a>
                            <a href="https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola, tuve un detalle al pagar en línea la orden ' + (orderId || '') + ' y requiero asistencia.')}" target="_blank" style="background:#334155;color:#f8fafc;text-decoration:none;padding:12px 20px;border-radius:14px;font-weight:600;font-size:13px;display:inline-block;">
                                Solicitar Asistencia por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

        } else if (status === "pending") {
            const modal = document.createElement("div");
            modal.id = "mp-pending-modal";
            modal.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(2,6,23,0.95);backdrop-filter:blur(14px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    <div style="background:#0f172a;border:1px solid #f59e0b;border-radius:24px;max-width:500px;width:100%;padding:32px 28px;box-shadow:0 25px 60px -15px rgba(245,158,11,0.3);text-align:center;color:#ffffff;">
                        <div style="width:72px;height:72px;background:rgba(245,158,11,0.15);border:2px solid #f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;color:#f59e0b;font-size:32px;font-weight:900;">
                            ⏳
                        </div>
                        <h2 style="font-size:22px;font-weight:900;margin:0 0 8px 0;letter-spacing:-0.03em;color:#ffffff;">Pago Pendiente de Acreditación</h2>
                        <p style="color:#94a3b8;font-size:14px;margin:0 0 24px 0;line-height:1.5;">Si seleccionaste pago en OXXO, 7-Eleven o ventanilla bancaria, conserva tu ficha. Tu pedido se despachará en cuanto se acredite el pago.</p>
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            <a href="https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola, generé ficha de pago en efectivo para la orden ' + (orderId || '') + '.')}" target="_blank" style="background:#10b981;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:14px;font-weight:700;font-size:14px;display:inline-block;">
                                Enviar Ficha por WhatsApp
                            </a>
                            <a href="index.html" style="background:#334155;color:#f8fafc;text-decoration:none;padding:12px 20px;border-radius:14px;font-weight:600;font-size:13px;display:inline-block;">
                                Regresar al Catálogo
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        updateCartBadges();
        syncPinDisplay();
        checkMercadoPagoReturnStatus();
    });
})();
