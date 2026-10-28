/**
 * AgroChaco Manager - Datos Iniciales y Parámetros Zonales
 * Configurado con valores de referencia reales para Pampa del Infierno, Chaco
 */

const DefaultData = {
  config: {
    establecimiento: "Establecimiento Don Alberto",
    ubicacion: "Pampa del Infierno, Chaco, Argentina",
    campania: "2026/2027",
    moneda: "USD",
    tipoCambioARS: 1250,
    ultimaActualizacion: new Date().toISOString()
  },

  // Cultivos disponibles
  cultivosDisponibles: [
    "Soja 1ra",
    "Soja 2da",
    "Maíz Tardío",
    "Girasol",
    "Trigo",
    "Sorgo Granífero",
    "Cebada",
    "Algodón",
    "Pastura Consociada"
  ],

  // Insumos y labores sugeridos
  sugerenciasInsumos: [
    { nombre: "Semilla fiscalizada", tipo: "Semilla", unidad: "bolsa" },
    { nombre: "Inoculante + Curasemilla", tipo: "Curasemilla / Inoculante", unidad: "dosis" },
    { nombre: "Glifosato 66%", tipo: "Herbicida", unidad: "l" },
    { nombre: "2,4-D Enlist / Dedalo Elite", tipo: "Herbicida", unidad: "l" },
    { nombre: "Atrazina 90%", tipo: "Herbicida", unidad: "kg" },
    { nombre: "Fosfato Monoamónico (MAP)", tipo: "Fertilizante", unidad: "kg" },
    { nombre: "Urea granulada", tipo: "Fertilizante", unidad: "kg" },
    { nombre: "Sulfato de Amonio", tipo: "Fertilizante", unidad: "kg" },
    { nombre: "Coragen / Rynaxypyr", tipo: "Insecticida", unidad: "l" },
    { nombre: "Fungicida Estrobirulina + Triazol", tipo: "Fungicida", unidad: "l" },
    { nombre: "Aceite metilado / Coadyuvante", tipo: "Coadyuvante", unidad: "l" }
  ],

  sugerenciasLabores: [
    "Barbecho químico inicial",
    "Barbecho pre-siembra",
    "Siembra directa con fertilización",
    "Pulverización terrestre 1ra",
    "Pulverización terrestre 2da",
    "Fertilización en línea",
    "Cosecha mecánica",
    "Monitoreo técnico de plagas"
  ],

  // Lotes Agrícolas Iniciales
  lotes: [
    {
      id: "lote-soja-1",
      nombre: "Lote 1 - El Quebracho",
      cultivo: "Soja 1ra",
      superficie: 280,
      alquilerHa: 0,
      rinde: 26, // qq/ha
      precio: 320, // USD/t
      comisionPct: 2.5,
      fletePorTonelada: 38, // USD/t (Pampa del Infierno a Rosario ~ 750 km)
      cosechaPct: 7.0, // 7% de cosecha
      cosechaFijaHa: 0,
      otrosCostosDirectosHa: 15, // Asesoramiento + seguros
      insumos: [
        { id: "i1", nombre: "Semilla Soja IPRO STS", tipo: "Semilla", dosis: 1.1, unidad: "bolsa", precio: 38 },
        { id: "i2", nombre: "Inoculante c/ bioprotector", tipo: "Curasemilla / Inoculante", dosis: 1, unidad: "dosis", precio: 7.5 },
        { id: "i3", nombre: "Glifosato 66% (2 pasadas)", tipo: "Herbicida", dosis: 4.5, unidad: "l", precio: 5.2 },
        { id: "i4", nombre: "2,4-D Enlist", tipo: "Herbicida", dosis: 1.5, unidad: "l", precio: 9.8 },
        { id: "i5", nombre: "Fosfato Monoamónico (MAP)", tipo: "Fertilizante", dosis: 60, unidad: "kg", precio: 0.78 },
        { id: "i6", nombre: "Insecticida p/ orugas y chinches", tipo: "Insecticida", dosis: 0.25, unidad: "l", precio: 32 },
        { id: "i7", nombre: "Fungicida foliar preventivo", tipo: "Fungicida", dosis: 0.5, unidad: "l", precio: 28 },
        { id: "i8", nombre: "Coadyuvante tensioactivo", tipo: "Coadyuvante", dosis: 0.6, unidad: "l", precio: 6.5 }
      ],
      labores: [
        { id: "l1", nombre: "Barbecho terrestre (x2)", pasadas: 2, costo: 8.5 },
        { id: "l2", nombre: "Siembra directa c/ doble fertilización", pasadas: 1, costo: 42 },
        { id: "l3", nombre: "Pulverización post-emergencia (x2)", pasadas: 2, costo: 8.5 }
      ]
    },
    {
      id: "lote-maiz-2",
      nombre: "Lote 2 - Los Algodonales",
      cultivo: "Maíz Tardío",
      superficie: 220,
      alquilerHa: 0,
      rinde: 62, // qq/ha (6.2 t/ha)
      precio: 185, // USD/t
      comisionPct: 2.5,
      fletePorTonelada: 38, // USD/t
      cosechaPct: 7.5,
      cosechaFijaHa: 0,
      otrosCostosDirectosHa: 18,
      insumos: [
        { id: "i21", nombre: "Semilla Híbrido VT Triple Pro", tipo: "Semilla", dosis: 0.9, unidad: "bolsa", precio: 195 },
        { id: "i22", nombre: "Atrazina 90%", tipo: "Herbicida", dosis: 1.8, unidad: "kg", precio: 8.5 },
        { id: "i23", nombre: "Glifosato 66%", tipo: "Herbicida", dosis: 3.5, unidad: "l", precio: 5.2 },
        { id: "i24", nombre: "Fosfato Monoamónico (MAP)", tipo: "Fertilizante", dosis: 80, unidad: "kg", precio: 0.78 },
        { id: "i25", nombre: "Urea Granulada", tipo: "Fertilizante", dosis: 120, unidad: "kg", precio: 0.58 },
        { id: "i26", nombre: "Insecticida p/ cogollero (Spodoptera)", tipo: "Insecticida", dosis: 0.15, unidad: "l", precio: 45 }
      ],
      labores: [
        { id: "l21", nombre: "Barbechos químicos (x2)", pasadas: 2, costo: 8.5 },
        { id: "l22", nombre: "Siembra neumática de maíz", pasadas: 1, costo: 45 },
        { id: "l23", nombre: "Fertilización incorporada", pasadas: 1, costo: 14 },
        { id: "l24", nombre: "Pulverización insecticida", pasadas: 1, costo: 8.5 }
      ]
    },
    {
      id: "lote-girasol-3",
      nombre: "Lote 3 - Pampa Norte",
      cultivo: "Girasol",
      superficie: 190,
      alquilerHa: 0,
      rinde: 20, // qq/ha (2.0 t/ha)
      precio: 360, // USD/t
      comisionPct: 2.5,
      fletePorTonelada: 36,
      cosechaPct: 8.0,
      cosechaFijaHa: 0,
      otrosCostosDirectosHa: 12,
      insumos: [
        { id: "i31", nombre: "Semilla Girasol Clearfield Plus", tipo: "Semilla", dosis: 0.35, unidad: "bolsa", precio: 180 },
        { id: "i32", nombre: "Herbicida Euro-Lightning / Imazapir", tipo: "Herbicida", dosis: 1.0, unidad: "l", precio: 42 },
        { id: "i33", nombre: "Glifosato barbecho", tipo: "Herbicida", dosis: 3.0, unidad: "l", precio: 5.2 },
        { id: "i34", nombre: "Fertilizante arrancador MAP", tipo: "Fertilizante", dosis: 50, unidad: "kg", precio: 0.78 },
        { id: "i35", nombre: "Insecticida curasemilla + oruga", tipo: "Insecticida", dosis: 0.3, unidad: "l", precio: 22 }
      ],
      labores: [
        { id: "l31", nombre: "Barbecho químico", pasadas: 2, costo: 8.5 },
        { id: "l32", nombre: "Siembra directa girasol", pasadas: 1, costo: 40 },
        { id: "l33", nombre: "Pulverización CL Plus", pasadas: 1, costo: 8.5 }
      ]
    },
    {
      id: "lote-trigo-4",
      nombre: "Lote 4 - El Mistol",
      cultivo: "Trigo",
      superficie: 150,
      alquilerHa: 0,
      rinde: 17, // qq/ha (1.7 t/ha)
      precio: 225, // USD/t
      comisionPct: 2.0,
      fletePorTonelada: 38,
      cosechaPct: 7.0,
      cosechaFijaHa: 0,
      otrosCostosDirectosHa: 10,
      insumos: [
        { id: "i41", nombre: "Semilla Trigo Ciclo Corto", tipo: "Semilla", dosis: 100, unidad: "kg", precio: 0.45 },
        { id: "i42", nombre: "Curasemilla integral", tipo: "Curasemilla / Inoculante", dosis: 1, unidad: "dosis", precio: 8 },
        { id: "i43", nombre: "Fosfato Monoamónico", tipo: "Fertilizante", dosis: 50, unidad: "kg", precio: 0.78 },
        { id: "i44", nombre: "Urea nitrogenada al macollaje", tipo: "Fertilizante", dosis: 80, unidad: "kg", precio: 0.58 },
        { id: "i45", nombre: "Herbicida Metsulfuron + 2,4-D", tipo: "Herbicida", dosis: 0.8, unidad: "l", precio: 12 }
      ],
      labores: [
        { id: "l41", nombre: "Barbecho presiembra", pasadas: 1, costo: 8.5 },
        { id: "l42", nombre: "Siembra fina directa", pasadas: 1, costo: 38 },
        { id: "l43", nombre: "Refertilización al voleo", pasadas: 1, costo: 7.5 }
      ]
    },
    {
      id: "lote-sorgo-5",
      nombre: "Lote 5 - Campo Alegre",
      cultivo: "Sorgo Granífero",
      superficie: 160,
      alquilerHa: 0,
      rinde: 48, // qq/ha (4.8 t/ha)
      precio: 165, // USD/t
      comisionPct: 2.5,
      fletePorTonelada: 38,
      cosechaPct: 7.5,
      cosechaFijaHa: 0,
      otrosCostosDirectosHa: 12,
      insumos: [
        { id: "i51", nombre: "Semilla Sorgo Granífero c/ antídoto", tipo: "Semilla", dosis: 10, unidad: "kg", precio: 3.8 },
        { id: "i52", nombre: "Atrazina + S-Metolacloro", tipo: "Herbicida", dosis: 2.2, unidad: "l", precio: 16.5 },
        { id: "i53", nombre: "Glifosato presiembra", tipo: "Herbicida", dosis: 3.0, unidad: "l", precio: 5.2 },
        { id: "i54", nombre: "MAP arrancador", tipo: "Fertilizante", dosis: 45, unidad: "kg", precio: 0.78 },
        { id: "i55", nombre: "Insecticida p/ pulgón amarillo (Melanaphis)", tipo: "Insecticida", dosis: 0.2, unidad: "l", precio: 35 }
      ],
      labores: [
        { id: "l51", nombre: "Barbechos químicos", pasadas: 2, costo: 8.5 },
        { id: "l52", nombre: "Siembra de sorgo", pasadas: 1, costo: 40 },
        { id: "l53", nombre: "Aplicación aérea/terrestre insecticida", pasadas: 1, costo: 11 }
      ]
    }
  ],

  // Módulo Ganadero de Cría
  ganaderia: {
    superficie: 950, // ha ganaderas (Pasturas Gatton Panic + monte diferido)
    tipoPastura: "Gatton Panic implantado y monte natural chaqueño",
    
    // Categorías de animales (Stock activo)
    categorias: {
      vacasMadre: 460, // Vientres entorados
      toros: 19, // ~4.1% de toros
      ternerosMachos: 172,
      ternerasHembras: 168,
      vaquillonasReposicion: 90, // Reposición para reposar descarte
      vaquillonasServicio: 45 // 15-18 meses
    },

    // Índices Reproductivos del ciclo
    reproduccion: {
      vacasPreniadas: 382, // Tacto rectal: 83.0% de preñez
      ternerosNacidos: 362, // 78.7% de parición
      ternerosDestetados: 340, // 73.9% de destete (172 machos + 168 hembras)
      muertesTotales: 22 // mortandad anual adulta y recría (sobre 1014 cabezas = ~2.1%)
    },

    // Producción de Carne Física (Kg)
    produccion: {
      kgConsumo: 2400, // Carne para personal de campo (6 novillitos/vaquillonas faenadas)
      kgDiferenciaInventario: 4500, // Crecimiento en peso del rodeo retenido
      kgCarneProducidosTotal: 88500 // Opcional de referencia
    },

    // Ventas del ciclo (Ingresos ganaderos)
    ventas: [
      {
        id: "v1",
        categoria: "Terneros Machos (Destete)",
        cabezas: 165,
        pesoPromedioKg: 175,
        precioKg: 2.30 // USD/kg vivo
      },
      {
        id: "v2",
        categoria: "Terneras Hembras excedente",
        cabezas: 85,
        pesoPromedioKg: 165,
        precioKg: 2.15 // USD/kg vivo
      },
      {
        id: "v3",
        categoria: "Vacas de Refugo / CUT (gordas y manufactura)",
        cabezas: 68,
        pesoPromedioKg: 420,
        precioKg: 1.35 // USD/kg vivo
      },
      {
        id: "v4",
        categoria: "Toros de descarte",
        cabezas: 4,
        pesoPromedioKg: 650,
        precioKg: 1.25 // USD/kg vivo
      }
    ],

    // Gastos comerciales de hacienda
    gastosComercializacionTotal: 5800, // Flete jaula a remate feria Charata/Sáenz Peña + comisiones martillero + SENASA

    // Costos Directos Ganaderos Anuales
    costosDirectos: {
      sanidadTotal: 8900, // Plan sanitario completo: Aftosa (2 campañas), Carbunclo, Mancha/Gangrena, Reproductivas, Ivermectina + Cobre/Zinc
      suplementacionAlimentacionTotal: 12400, // Sales minerales c/ fósforo (clave en Chaco) + rollos de Gatton Panic para baches invernales
      pasturasLaboresTotal: 9600, // Control mecánico de renuevos (rolo/desmalezado en pasturas) + siembra de rejuvenecimiento
      personalSueldosTotal: 16800, // Puestero / capataz ganadero permanente + aportes + jornales de vacunación y aparte
      mantenimientoInstalacionesTotal: 6200, // Reparación de aguadas, molinos, bombas solares, boyeros y alambrados perimetrales
      otrosCostosDirectosTotal: 3100 // Guías municipales, combustibles operativos camioneta/tractor ganadero
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefaultData;
}
