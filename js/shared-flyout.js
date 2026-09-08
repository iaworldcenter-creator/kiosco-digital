/**
 * shared-flyout.js
 * Mega Menú Interactivo Flyout de Cómputo & Tecnología VECTEC
 * Al posar el puntero (hover/focus), salta la hilera de departamentos
 * y los productos de la categoría estricta correspondiente.
 * Marca Oficial: VECTEC / Ecosistema Comercial
 */

(function () {
    const DEPARTMENTS = [
  {
    "id": "procesadores",
    "name": "Procesadores Intel & AMD",
    "icon": "fa-microchip",
    "badge": "Top Ventas",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-02-procesadores.html",
    "products": [
      {
        "sku": "A-CPUINT4010",
        "nombre": "Intel Core I9-12900K Alder Lake 3.20GHz (5.20GHz Turbo) LGA 1700 30 MB Intel Smart Cache, Gráficos : Intel® UHD Graphics",
        "marca": "VECTEC",
        "precio": 8612.5,
        "precio_original": 11483.33,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT4010.webp",
        "categoria": "Procesadores Intel & AMD"
      },
      {
        "sku": "A-CPUINT4020",
        "nombre": "Intel Core i9-12900KF Alder Lake 3.20GHz (5.20GHz Turbo) LGA 1700 30 MB Intel Smart Cache, 8 Núcleos y 8 subprocesos. CO",
        "marca": "VECTEC",
        "precio": 9997.0,
        "precio_original": 13329.33,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT4020.webp",
        "categoria": "Procesadores Intel & AMD"
      },
      {
        "sku": "A-CPUINT4210",
        "nombre": "Intel Core i9-12900 Alder Lake 2.40GHz (5.10GHz Turbo) LGA 1700 30 MB Intel Smart Cache, 16 Núcleos. COMPATIBLE SOLO CON",
        "marca": "VECTEC",
        "precio": 10456.94,
        "precio_original": 13942.59,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT4210.webp",
        "categoria": "Procesadores Intel & AMD"
      },
      {
        "sku": "A-CPUINT4160",
        "nombre": "Intel Core i7-12700 Alder Lake 2.10GHz (4.90GHz Turbo) LGA 1700 25 MB Intel Smart Cache, 8 Núcleos y 4 subprocesos. COMP",
        "marca": "VECTEC",
        "precio": 7117.63,
        "precio_original": 9490.17,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT4160.webp",
        "categoria": "Procesadores Intel & AMD"
      }
    ]
  },
  {
    "id": "tarjetas_video",
    "name": "Tarjetas de Video (GPUs)",
    "icon": "fa-vr-cardboard",
    "badge": "RTX Serie 50/40",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-03-tarjetas-de-video.html",
    "products": [
      {
        "sku": "A-TVIGIG3080",
        "nombre": "Tarjeta de video GIGABYTE GV-R76GAMING OC-8GD Radeon™ RX 7600 Reloj central Boost Clock*: hasta 2755 MHz Game Clock*: ha",
        "marca": "VECTEC",
        "precio": 6923.65,
        "precio_original": 9231.53,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/TVIGIG3080.webp",
        "categoria": "Tarjetas de Video (GPUs)"
      },
      {
        "sku": "A-TVIGIG3560",
        "nombre": "TARJETA DE VIDEO GIGABYTE GV-N5050OC-8GL Procesamiento de gráficos GeForce RTX™ 5050 Reloj central 2587 MHz (Tarjeta de",
        "marca": "VECTEC",
        "precio": 6814.6,
        "precio_original": 9086.13,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/TVIGIG3560.webp",
        "categoria": "Tarjetas de Video (GPUs)"
      },
      {
        "sku": "A-TVIGIG3420",
        "nombre": "Tarjeta de Video GIGABYTE GV-N5060 EAGLEMAX OC-8GD Procesamiento de gráficos GeForce RTX™ 5060 Reloj central 2550 MHz (T",
        "marca": "VECTEC",
        "precio": 8465.29,
        "precio_original": 11287.05,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/TVIGIG3420.webp",
        "categoria": "Tarjetas de Video (GPUs)"
      },
      {
        "sku": "A-TVIGIG3550",
        "nombre": "TARJETA DE VIDEO GIGABYTE GV-N5050GAMING OC-8GD Procesamiento de gráficos GeForce RTX™ 5050 Reloj central 2632 MHz (Tarj",
        "marca": "VECTEC",
        "precio": 6982.3,
        "precio_original": 9309.73,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/TVIGIG3550.webp",
        "categoria": "Tarjetas de Video (GPUs)"
      }
    ]
  },
  {
    "id": "tarjetas_madre",
    "name": "Tarjetas Madre (Motherboards)",
    "icon": "fa-chess-board",
    "badge": "AM5 / LGA1700",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-01-tarjetas-madre.html",
    "products": [
      {
        "sku": "A-MBDECS2220",
        "nombre": "Motherboard ECS H610H7-M2 Admite procesadores de la serie Intel® Core™ / Pentium / Celeron de 12.ª generación para zócal",
        "marca": "VECTEC",
        "precio": 1172.66,
        "precio_original": 1563.55,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MBDECS2220.webp",
        "categoria": "Tarjetas Madre (Motherboards)"
      },
      {
        "sku": "A-MBDECS2260",
        "nombre": "Motherboard ECS B660H7-M22 Admite procesadores de la serie Intel Core/Pentium/Celeron de 12.ª generación para zócalo LGA",
        "marca": "VECTEC",
        "precio": 1485.1,
        "precio_original": 1980.13,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MBDECS2260.webp",
        "categoria": "Tarjetas Madre (Motherboards)"
      },
      {
        "sku": "A-MBDECS2110",
        "nombre": "Motherboard ECS H410H6-M2 ONJUNTO DE CHIPS Conjunto de chips Intel H410 Express GRÁFICOS Compatible con DirectX® 12 MEMO",
        "marca": "VECTEC",
        "precio": 1196.59,
        "precio_original": 1595.45,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MBDECS2110.webp",
        "categoria": "Tarjetas Madre (Motherboards)"
      },
      {
        "sku": "A-MBDECS2290",
        "nombre": "MB ECS B650AM5-M, Admite el zócalo AMD AM5 para procesadores AMD Ryzen™, Potencia de diseño térmico de 6+2+1 fases, Dise",
        "marca": "VECTEC",
        "precio": 1462.5,
        "precio_original": 1950.0,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MBDECS2290.webp",
        "categoria": "Tarjetas Madre (Motherboards)"
      }
    ]
  },
  {
    "id": "memorias_ram",
    "name": "Memorias RAM (DDR4 / DDR5)",
    "icon": "fa-memory",
    "badge": "Hasta 7200MHz",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-04-memorias-ram.html",
    "products": [
      {
        "sku": "A-CPUINT4520",
        "nombre": "Procesador Intel® Core™ i5-14400 (14.ª generación). Con compatibilidad con PCIe 5.0 y 4.0, compatibilidad con DDR5 y DDR",
        "marca": "VECTEC",
        "precio": 4654.0,
        "precio_original": 6205.33,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT4520.webp",
        "categoria": "Memorias RAM (DDR4 / DDR5)"
      },
      {
        "sku": "A-CPUINT4510",
        "nombre": "Procesador Intel® Core™ i3-14100 (14.ª generación). Con compatibilidad con PCIe 5.0 y 4.0, DDR5 y DDR4, los procesadores",
        "marca": "VECTEC",
        "precio": 3198.26,
        "precio_original": 4264.35,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT4510.webp",
        "categoria": "Memorias RAM (DDR4 / DDR5)"
      },
      {
        "sku": "A-MEMKGN2870",
        "nombre": "Memoria KINGSTON 8GB 3200MHz DDR4 CL16 DIMM FURY Beast KF432C16BB/8 Negra",
        "marca": "VECTEC",
        "precio": 2176.53,
        "precio_original": 2902.04,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MEMKGN2870.webp",
        "categoria": "Memorias RAM (DDR4 / DDR5)"
      },
      {
        "sku": "A-MEMKGN2910",
        "nombre": "Memoria KINGSTON 16GB 3200MHz DDR4 CL16 DIMM 1Gx8 FURY Beast KF432C16BB1/16 Negra",
        "marca": "VECTEC",
        "precio": 3141.32,
        "precio_original": 4188.43,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MEMKGN2910.webp",
        "categoria": "Memorias RAM (DDR4 / DDR5)"
      }
    ]
  },
  {
    "id": "almacenamiento",
    "name": "Almacenamiento & SSDs NVMe",
    "icon": "fa-hard-drive",
    "badge": "PCIe 4.0/5.0",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-05-discos-duros.html",
    "products": [
      {
        "sku": "A-DDUKGT1290",
        "nombre": "Disco de Estado Solido SATA de 240GB SA400S37/240G",
        "marca": "VECTEC",
        "precio": 1100.06,
        "precio_original": 1466.75,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/DDUKGT1290.webp",
        "categoria": "Almacenamiento & SSDs NVMe"
      },
      {
        "sku": "A-DDUKGT1300",
        "nombre": "Disco de Estado Solido SATA de 480GB SA400S37/480G",
        "marca": "VECTEC",
        "precio": 1575.6,
        "precio_original": 2100.8,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/DDUKGT1300.webp",
        "categoria": "Almacenamiento & SSDs NVMe"
      },
      {
        "sku": "A-DDUKGT1360",
        "nombre": "Disco de Estado Solido SATA de 960GB SA400S37/960G",
        "marca": "VECTEC",
        "precio": 3056.3,
        "precio_original": 4075.07,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/DDUKGT1360.webp",
        "categoria": "Almacenamiento & SSDs NVMe"
      },
      {
        "sku": "A-DDUKGT2570",
        "nombre": "Disco de Estado Solido SATA de 480GB KC-S44480-7S",
        "marca": "VECTEC",
        "precio": 1664.0,
        "precio_original": 2218.67,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/DDUKGT2570.webp",
        "categoria": "Almacenamiento & SSDs NVMe"
      }
    ]
  },
  {
    "id": "laptops_pcs",
    "name": "Laptops & Computadoras",
    "icon": "fa-laptop",
    "badge": "Garantía 1 Año",
    "link": "https://iaworldcenter-creator.github.io/vectec/laptops/index.html",
    "products": [
      {
        "sku": "A-CFG-INTEL-14400",
        "nombre": "PC VECTEC Elite Intel Core i5-14400 | ASUS B760M | 16GB RAM | 1TB HDD | Kit Naceb 4en1 + Monitor 19.5\"",
        "marca": "INTEL / ASUS",
        "precio": 14868.2,
        "precio_original": 18585.25,
        "descuento_pct": 20,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/fachada-oficial.webp",
        "categoria": "Laptops & Computadoras"
      },
      {
        "sku": "A-CFG-INTEL-14700",
        "nombre": "PC VECTEC Pro Intel Core i7-14700 | ASUS B760M | 16GB RAM | 1TB HDD | Kit Naceb 4en1 + Monitor 19.5\"",
        "marca": "INTEL / ASUS",
        "precio": 18534.2,
        "precio_original": 23167.75,
        "descuento_pct": 20,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/fachada-oficial.webp",
        "categoria": "Laptops & Computadoras"
      },
      {
        "sku": "A-CFG-INTEL-14900",
        "nombre": "PC VECTEC Master Intel Core i9-14900 | ASUS B760M | 16GB RAM | 1TB HDD | Kit Naceb 4en1 + Monitor 19.5\"",
        "marca": "INTEL / ASUS",
        "precio": 23331.2,
        "precio_original": 29164.0,
        "descuento_pct": 20,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/fachada-oficial.webp",
        "categoria": "Laptops & Computadoras"
      },
      {
        "sku": "A-CFG-INTEL-12400",
        "nombre": "PC VECTEC Entry Intel Core i5-12400 | ASUS H610M | 8GB RAM | 1TB HDD | Kit Naceb 4en1 + Monitor 19.5\"",
        "marca": "INTEL / ASUS",
        "precio": 9840.47,
        "precio_original": 12300.59,
        "descuento_pct": 20,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/fachada-oficial.webp",
        "categoria": "Laptops & Computadoras"
      }
    ]
  },
  {
    "id": "monitores",
    "name": "Monitores & Pantallas",
    "icon": "fa-desktop",
    "badge": "144Hz - 240Hz",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-11-monitores-software.html",
    "products": [
      {
        "sku": "A-MONSMG2120",
        "nombre": "Monitor SAMSUNG Essential S3, S30GD, 22\", Modelo: LS22D300GALXZX; Tamaño de pantalla 22\"; Monitor Plano (Flat); Panel IP",
        "marca": "VECTEC",
        "precio": 28794.32,
        "precio_original": 38392.43,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MONSMG2120.webp",
        "categoria": "Monitores & Pantallas"
      },
      {
        "sku": "A-MONSMG2070",
        "nombre": "Monitor SAMSUNG Gamer Curvo 24\", FHD, Plano, Modelo: LS24DG300ELXZX; Tamaño de pantalla 24\"; Resolución FHD 1920 x 1080;",
        "marca": "VECTEC",
        "precio": 56726.53,
        "precio_original": 75635.37,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MONSMG2070.webp",
        "categoria": "Monitores & Pantallas"
      },
      {
        "sku": "A-MONSMG2360",
        "nombre": "Monitor SAMSUNG Essential S3, 24\", Modelo: LS24F334EALXZX; Tamaño de pantalla 24\"; Monitor Plano (Flat); Panel VA; Resol",
        "marca": "VECTEC",
        "precio": 37169.05,
        "precio_original": 49558.73,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/placeholders/acc_placeholder.jpg",
        "categoria": "Monitores & Pantallas"
      },
      {
        "sku": "A-MONSMG2090",
        "nombre": "Monitor SAMSUNG Essential S3, S30GD, 24\", Modelo: LS24D300GALXZX; Tamaño de pantalla 24\"; Monitor Plano (Flat); Panel IP",
        "marca": "VECTEC",
        "precio": 31873.26,
        "precio_original": 42497.68,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/MONSMG2090.webp",
        "categoria": "Monitores & Pantallas"
      }
    ]
  },
  {
    "id": "perifericos",
    "name": "Periféricos, Teclados & Audio",
    "icon": "fa-headphones",
    "badge": "E-Sports",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-09-perifericos.html",
    "products": [
      {
        "sku": "A-ACCYEY110",
        "nombre": "Base headset overpower serie1000 YEYIAN YAO-29201N, potencia nominal 5V - 250 mA, micrófono Ø 6 x 5 mm, configuración om",
        "marca": "VECTEC",
        "precio": 164.06,
        "precio_original": 218.75,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/ACCYEY110.webp",
        "categoria": "Periféricos, Teclados & Audio"
      },
      {
        "sku": "A-DDUDLL2550",
        "nombre": "Disco duro SATA Dell 400-BLLF - 4TB Hard Drive SATA 6Gbps 7.2K 512n 3.5in Hot-Plug, CUS Kit . Compatible con T350,T550,",
        "marca": "VECTEC",
        "precio": 236338.47,
        "precio_original": 315117.96,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/DDUDLL2550.webp",
        "categoria": "Periféricos, Teclados & Audio"
      },
      {
        "sku": "A-DDUDLL2530",
        "nombre": "Disco Duro Dell 161-BCBC 2TB Hard Drive SATA 6Gbps 7.2K 512n 3.5in Cabled Customer Kit. Compatible con servidor R250",
        "marca": "VECTEC",
        "precio": 145360.8,
        "precio_original": 193814.4,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/DDUDLL2530.webp",
        "categoria": "Periféricos, Teclados & Audio"
      },
      {
        "sku": "A-CPUVGO6150",
        "nombre": "Computadora Vorago SB5 RZN 5700GT-TR-21 RZN 5700GT 8GB RAM 240GB unidad de estado solido NO DVD/WINDOWS TRIAL, HDMI/VGA/",
        "marca": "VECTEC",
        "precio": 11070.97,
        "precio_original": 14761.29,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUVGO6150.webp",
        "categoria": "Periféricos, Teclados & Audio"
      }
    ]
  },
  {
    "id": "redes",
    "name": "Conectividad & Redes",
    "icon": "fa-network-wired",
    "badge": "Gigabit / Mesh",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-10-conectividad-redes.html",
    "products": [
      {
        "sku": "A-ROUTPL180",
        "nombre": "Router Balanceador de Carga Multi-Wan, (TL-R470T+) (3) WAN/LAN 10/100Mbps, (1) WAN 10/100Mbps y (1) LAN 10/100Mbps, Bala",
        "marca": "VECTEC",
        "precio": 731.25,
        "precio_original": 975.0,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/ROUTPL180.webp",
        "categoria": "Conectividad & Redes"
      },
      {
        "sku": "A-ROUTPL120",
        "nombre": "Router Balanceador de Carga Multi-Wan, (TL-R480T+) (3) WAN/LAN 10/100Mbps, (1) WAN 10/100Mbps, (1) LAN 10/100Mbps y (1)",
        "marca": "VECTEC",
        "precio": 965.25,
        "precio_original": 1287.0,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/ROUTPL120.webp",
        "categoria": "Conectividad & Redes"
      },
      {
        "sku": "A-ROUTPL1320",
        "nombre": "Wi-Fi Gigabit Omada AC1200 (ER605W) 1 puerto WAN Gigabit , 2 puertos WAN/LAN Gigabit ,2 puertos LAN Gigabit , ER605W ofr",
        "marca": "VECTEC",
        "precio": 1409.32,
        "precio_original": 1879.09,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/ROUTPL1320.webp",
        "categoria": "Conectividad & Redes"
      },
      {
        "sku": "A-ROUTPL970",
        "nombre": "Router VPN Gigabit-SDN Multi-Wan, (ER605) (1) WAN 10/100/1000Mbps, (3) LAN/WAN 10/100/100 (1) LAN 10/100/1000Mbps, integ",
        "marca": "VECTEC",
        "precio": 1143.41,
        "precio_original": 1524.55,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/ROUTPL970.webp",
        "categoria": "Conectividad & Redes"
      }
    ]
  },
  {
    "id": "gabinetes_energia",
    "name": "Fuentes, Chasis & Enfriamiento",
    "icon": "fa-server",
    "badge": "80 Plus Gold",
    "link": "https://iaworldcenter-creator.github.io/vectec/catalogo-07-gabinetes.html",
    "products": [
      {
        "sku": "A-CPUINT5080",
        "nombre": "Procesador Intel i7-14700 CM8071504820817 VERSION TRAY - SIN DISIPADOR, SIN CAJA, 20 núcleos, 28 subprocesos, 2.1 GHz b",
        "marca": "VECTEC",
        "precio": 7930.0,
        "precio_original": 10573.33,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT5080.webp",
        "categoria": "Fuentes, Chasis & Enfriamiento"
      },
      {
        "sku": "A-CPUINT5070",
        "nombre": "Procesador Intel i5-14400F CM8071505093011, VERSION TRAY - SIN DISIPADOR, SIN CAJA, SIN GRAFICOS 10 núcleos, 16 subproc",
        "marca": "VECTEC",
        "precio": 3680.3,
        "precio_original": 4907.07,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT5070.webp",
        "categoria": "Fuentes, Chasis & Enfriamiento"
      },
      {
        "sku": "A-CPUINT5090",
        "nombre": "Procesador Intel i5-14400 CM8071504821112, VERSION TRAY - SIN DISIPADOR, SIN CAJA, 10 núcleos, 16 subprocesos, 2.5 GHz",
        "marca": "VECTEC",
        "precio": 4110.6,
        "precio_original": 5480.8,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT5090.webp",
        "categoria": "Fuentes, Chasis & Enfriamiento"
      },
      {
        "sku": "A-CPUINT5020",
        "nombre": "Procesador Intel i9-12900F BX8071512900F, SIN GRAFICOS - INCLUYE DISIPADOR, 16 núcleos, 24 subprocesos, 2.40 GHz base y",
        "marca": "VECTEC",
        "precio": 8554.0,
        "precio_original": 11405.33,
        "descuento_pct": 25,
        "img": "https://iaworldcenter-creator.github.io/vectec/assets/img/CPUINT5020.webp",
        "categoria": "Fuentes, Chasis & Enfriamiento"
      }
    ]
  }
];

    function createFlyoutNav(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.classList.add("flyout-nav-wrapper");

        // Construir HTML del Menú
        container.innerHTML = `
            <button type="button" class="flyout-trigger-btn" id="flyoutTriggerBtn" aria-expanded="false" aria-label="Abrir catálogo por departamentos VECTEC">
                <i class="fa-solid fa-microchip text-cyan-400 text-sm"></i>
                <span>Cómputo & Tecnología VECTEC</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition transform duration-200" id="flyoutChevron"></i>
            </button>

            <div class="flyout-panel" id="flyoutPanel" role="region" aria-label="Menú de departamentos y productos">
                <div class="flyout-primary-list" id="flyoutPrimaryList"></div>
                <div class="flyout-sub-content" id="flyoutSubContent"></div>
            </div>
        `;

        const triggerBtn = document.getElementById("flyoutTriggerBtn");
        const panel = document.getElementById("flyoutPanel");
        const chevron = document.getElementById("flyoutChevron");
        const primaryList = document.getElementById("flyoutPrimaryList");
        const subContent = document.getElementById("flyoutSubContent");

        let activeDeptIndex = 0;
        let closeTimer = null;

        // Renderizar lista primaria de departamentos
        function renderPrimaryList() {
            primaryList.innerHTML = DEPARTMENTS.map((dept, index) => `
                <button type="button" class="flyout-primary-item ${index === activeDeptIndex ? 'active' : ''}" data-index="${index}">
                    <span class="flex items-center truncate">
                        <i class="fa-solid ${dept.icon} cat-icon"></i>
                        <span class="truncate">${dept.name}</span>
                    </span>
                    ${dept.badge ? `<span class="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 shrink-0 ml-1">${dept.badge}</span>` : '<i class="fa-solid fa-chevron-right text-[9px] text-slate-500 shrink-0"></i>'}
                </button>
            `).join('');

            primaryList.querySelectorAll(".flyout-primary-item").forEach(item => {
                item.addEventListener("mouseenter", () => {
                    const idx = parseInt(item.getAttribute("data-index"));
                    setActiveDepartment(idx);
                });
                item.addEventListener("click", () => {
                    const idx = parseInt(item.getAttribute("data-index"));
                    setActiveDepartment(idx);
                });
            });
        }

        // Renderizar productos de la categoría activa (estricta pertinencia)
        function renderSubContent(dept) {
            const products = dept.products || [];
            subContent.innerHTML = `
                <div class="flyout-sub-header">
                    <div class="flyout-sub-title">
                        <i class="fa-solid ${dept.icon} text-cyan-400"></i>
                        <span>${dept.name}</span>
                    </div>
                    <a href="${dept.link}" class="flyout-sub-btn-all" target="_blank">
                        <span>Ver departamento</span>
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </a>
                </div>
                <div class="flyout-products-grid">
                    ${products.map(p => `
                        <div class="flyout-product-card group">
                            <div>
                                <div class="flyout-product-img-wrap" onclick="window.openProductDetailModal ? window.openProductDetailModal('${p.sku}') : null" style="cursor: pointer;">
                                    <img src="${p.img}" alt="${p.nombre}" loading="lazy" onerror="this.onerror=null; this.src='https://iaworldcenter-creator.github.io/vectec/assets/img/mascota_tigre.webp';" />
                                    ${p.descuento_pct > 0 ? `<span class="flyout-product-badge">-${p.descuento_pct}%</span>` : ''}
                                </div>
                                <div class="flyout-product-meta">${p.marca} &bull; ${p.sku}</div>
                                <div class="flyout-product-title" title="${p.nombre}">${p.nombre}</div>
                            </div>
                            <div>
                                <div class="flyout-product-price-row">
                                    ${p.precio_original && p.precio_original > p.precio ? `<span class="flyout-product-price-orig">$${p.precio_original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>` : ''}
                                    <span class="flyout-product-price">$${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style="font-size: 9px; font-weight: normal; color: #94a3b8;">MXN</span></span>
                                </div>
                                <div class="flyout-product-actions">
                                    <button type="button" class="flyout-btn-action flyout-btn-ficha" onclick="window.openProductDetailModal ? window.openProductDetailModal('${p.sku}') : null" title="Ficha Técnica">
                                        <i class="fa-solid fa-circle-info"></i> Ficha
                                    </button>
                                    <button type="button" class="flyout-btn-action flyout-btn-cart" onclick="window.addToCartDirect ? window.addToCartDirect('${p.sku}', 1) : null" title="Agregar a la Canasta">
                                        <i class="fa-solid fa-cart-plus"></i> Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function setActiveDepartment(index) {
            activeDeptIndex = index;
            primaryList.querySelectorAll(".flyout-primary-item").forEach((btn, idx) => {
                btn.classList.toggle("active", idx === index);
            });
            renderSubContent(DEPARTMENTS[index]);
        }

        function openPanel() {
            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            panel.classList.add("is-open");
            triggerBtn.classList.add("active");
            triggerBtn.setAttribute("aria-expanded", "true");
            chevron.classList.add("rotate-180");
            setActiveDepartment(activeDeptIndex);
        }

        function closePanel() {
            panel.classList.remove("is-open");
            triggerBtn.classList.remove("active");
            triggerBtn.setAttribute("aria-expanded", "false");
            chevron.classList.remove("rotate-180");
        }

        function scheduleClose() {
            closeTimer = setTimeout(() => {
                closePanel();
            }, 250);
        }

        // Eventos Hover Inteligente (MouseEnter & MouseLeave)
        container.addEventListener("mouseenter", () => {
            openPanel();
        });

        container.addEventListener("mouseleave", () => {
            scheduleClose();
        });

        // Clic para alternar en dispositivos móviles/touch
        triggerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (panel.classList.contains("is-open")) {
                closePanel();
            } else {
                openPanel();
            }
        });

        // Cerrar al hacer clic fuera
        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) {
                closePanel();
            }
        });

        // Inicializar vistas internas
        renderPrimaryList();
        renderSubContent(DEPARTMENTS[0]);
    }

    window.initFlyoutNav = createFlyoutNav;

    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("vectec-flyout-container")) {
            createFlyoutNav("vectec-flyout-container");
        }
    });
})();
