/**
 * AgroChaco Manager - Motor de Cálculos Económicos y Productivos
 * Especializado para Región Chaqueña (Pampa del Infierno, Chaco)
 */

const AgroCalc = {
  // Conversión numérica segura
  toNum(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    let s = String(val).trim();
    if (s.includes(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    }
    const n = parseFloat(s);
    return isFinite(n) ? n : 0;
  },

  formatNum(num, dec = 0) {
    const n = this.toNum(num);
    return isFinite(n) ? n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '0';
  },

  formatMoney(num, moneda = 'USD', dec = 0) {
    const n = this.toNum(num);
    return `${moneda} ${this.formatNum(n, dec)}`;
  },

  formatPct(ratio, dec = 1) {
    const n = this.toNum(ratio);
    return `${this.formatNum(n * 100, dec)} %`;
  },

  // ==========================================
  // CÁLCULOS AGRÍCOLAS
  // ==========================================
  calcLote(lote, config = { moneda: 'USD' }) {
    const ha = this.toNum(lote.superficie);
    
    // Insumos directos
    const insumos = (lote.insumos || []).map(item => {
      const dosis = this.toNum(item.dosis);
      const precio = this.toNum(item.precio);
      const costoHa = dosis * precio;
      return {
        ...item,
        costoHa,
        costoTotal: costoHa * ha
      };
    });
    const costoInsumosHa = insumos.reduce((acc, curr) => acc + curr.costoHa, 0);

    // Labores agrícolas
    const labores = (lote.labores || []).map(item => {
      const pasadas = this.toNum(item.pasadas) || 1;
      const costo = this.toNum(item.costo);
      const costoHa = pasadas * costo;
      return {
        ...item,
        costoHa,
        costoTotal: costoHa * ha
      };
    });
    const costoLaboresHa = labores.reduce((acc, curr) => acc + curr.costoHa, 0);

    // Sueldos / Otros costos directos por ha
    const otrosCostosHa = this.toNum(lote.otrosCostosDirectosHa);

    // Rendimiento y precios
    // En Argentina el rinde se suele ingresar en qq/ha (1 quintal = 100 kg = 0.1 t)
    const rindeQ = this.toNum(lote.rinde);
    const rindeT = rindeQ / 10; // t/ha
    const precioT = this.toNum(lote.precio); // USD/t

    // Comercialización y Cosecha
    const comisionPct = this.toNum(lote.comisionPct) / 100;
    const fleteT = this.toNum(lote.fletePorTonelada); // USD/t
    const cosechaPct = this.toNum(lote.cosechaPct) / 100; // si se paga porcentaje de cosecha
    const cosechaFijaHa = this.toNum(lote.cosechaFijaHa); // o si se paga fija en USD/ha

    // Ingresos
    const ingresoBrutoHa = rindeT * precioT;
    const ingresoBrutoTotal = ingresoBrutoHa * ha;

    // Costo de cosecha
    const costoCosechaHa = (ingresoBrutoHa * cosechaPct) + cosechaFijaHa;

    // Gastos de comercialización (Flete + Comisiones)
    const comisionHa = ingresoBrutoHa * comisionPct;
    const fleteHa = rindeT * fleteT;
    const gastosComercializacionHa = comisionHa + fleteHa;
    const gastosComercializacionTotal = gastosComercializacionHa * ha;

    // Ingreso Neto
    const ingresoNetoHa = ingresoBrutoHa - gastosComercializacionHa;
    const ingresoNetoTotal = ingresoNetoHa * ha;

    // Costos Directos
    const costoDirectoSinCosechaHa = costoInsumosHa + costoLaboresHa + otrosCostosHa;
    const costoDirectoTotalHa = costoDirectoSinCosechaHa + costoCosechaHa;
    const costoDirectoTotal = costoDirectoTotalHa * ha;

    // Alquiler (si aplica)
    const alquilerHa = this.toNum(lote.alquilerHa);
    const alquilerTotal = alquilerHa * ha;

    // Margen Bruto
    const margenBrutoHa = ingresoNetoHa - costoDirectoTotalHa;
    const margenBrutoTotal = margenBrutoHa * ha;
    const resultadoDespuesAlquilerHa = margenBrutoHa - alquilerHa;
    const resultadoDespuesAlquilerTotal = resultadoDespuesAlquilerHa * ha;

    // Rentabilidad / Retorno sobre Costos Directos
    const retornoSobreCD = costoDirectoTotalHa > 0 ? (margenBrutoHa / costoDirectoTotalHa) : 0;
    const retornoTotal = (costoDirectoTotalHa + alquilerHa) > 0 ? (resultadoDespuesAlquilerHa / (costoDirectoTotalHa + alquilerHa)) : 0;

    // Rendimiento de Indiferencia (qq/ha para empatar)
    // Ingreso neto por tonelada = precioT * (1 - comisionPct - cosechaPct) - fleteT
    const netoPorTonelada = (precioT * (1 - comisionPct - cosechaPct)) - fleteT;
    let rindeIndiferenciaT = 0;
    let rindeIndiferenciaQ = 0;
    let rindeIndiferenciaAlqQ = 0;

    if (netoPorTonelada > 0) {
      rindeIndiferenciaT = (costoDirectoSinCosechaHa + cosechaFijaHa) / netoPorTonelada;
      rindeIndiferenciaQ = rindeIndiferenciaT * 10;
      if (alquilerHa > 0) {
        rindeIndiferenciaAlqQ = ((costoDirectoSinCosechaHa + cosechaFijaHa + alquilerHa) / netoPorTonelada) * 10;
      } else {
        rindeIndiferenciaAlqQ = rindeIndiferenciaQ;
      }
    }

    // Precio de Indiferencia (USD/t para cubrir costos con el rinde actual)
    let precioIndiferencia = 0;
    let precioIndiferenciaAlq = 0;
    const coefPrecio = (1 - comisionPct - cosechaPct);
    if (rindeT > 0 && coefPrecio > 0) {
      precioIndiferencia = ((costoDirectoSinCosechaHa + cosechaFijaHa) / rindeT + fleteT) / coefPrecio;
      precioIndiferenciaAlq = ((costoDirectoSinCosechaHa + cosechaFijaHa + alquilerHa) / rindeT + fleteT) / coefPrecio;
    }

    // Margen de Seguridad (% que puede caer el rinde antes de perder)
    const margenSeguridad = rindeQ > 0 ? ((rindeQ - rindeIndiferenciaQ) / rindeQ) : 0;

    // Estado del lote
    let estado = 'neutral';
    if (rindeQ > 0 && precioT > 0) {
      if (resultadoDespuesAlquilerHa > 50 && margenSeguridad >= 0.15) {
        estado = 'good'; // Rentable
      } else if (resultadoDespuesAlquilerHa >= 0) {
        estado = 'warn'; // Ajustado / Riesgo
      } else {
        estado = 'bad'; // Pérdida
      }
    }

    // Composición de Costos Directos
    const desgloseCostos = [
      { rubro: 'Semilla y Curasemilla', costo: 0, color: '#4ade80' },
      { rubro: 'Fertilizantes', costo: 0, color: '#facc15' },
      { rubro: 'Herbicidas y Coadyuvantes', costo: 0, color: '#38bdf8' },
      { rubro: 'Insecticidas y Fungicidas', costo: 0, color: '#f87171' },
      { rubro: 'Labores y Siembra', costo: costoLaboresHa, color: '#fb923c' },
      { rubro: 'Cosecha', costo: costoCosechaHa, color: '#a78bfa' },
      { rubro: 'Sueldos y Otros CD', costo: otrosCostosHa, color: '#94a3b8' }
    ];

    insumos.forEach(item => {
      const tipo = (item.tipo || '').toLowerCase();
      if (tipo.includes('semilla') || tipo.includes('curasemilla') || tipo.includes('inoculante')) {
        desgloseCostos[0].costo += item.costoHa;
      } else if (tipo.includes('fertilizante')) {
        desgloseCostos[1].costo += item.costoHa;
      } else if (tipo.includes('herbicida') || tipo.includes('coadyuvante')) {
        desgloseCostos[2].costo += item.costoHa;
      } else if (tipo.includes('insecticida') || tipo.includes('fungicida')) {
        desgloseCostos[3].costo += item.costoHa;
      } else {
        desgloseCostos[2].costo += item.costoHa;
      }
    });

    // Matriz de Sensibilidad (variaciones de rinde x precio)
    const matrizSensibilidad = this.calcularSensibilidad(lote, {
      costoDirectoSinCosechaHa,
      cosechaPct,
      cosechaFijaHa,
      comisionPct,
      fleteT,
      alquilerHa
    });

    return {
      ha,
      rindeQ,
      rindeT,
      precioT,
      insumos,
      labores,
      costoInsumosHa,
      costoLaboresHa,
      otrosCostosHa,
      costoCosechaHa,
      gastosComercializacionHa,
      gastosComercializacionTotal,
      ingresoBrutoHa,
      ingresoBrutoTotal,
      ingresoNetoHa,
      ingresoNetoTotal,
      costoDirectoTotalHa,
      costoDirectoTotal,
      alquilerHa,
      alquilerTotal,
      margenBrutoHa,
      margenBrutoTotal,
      resultadoDespuesAlquilerHa,
      resultadoDespuesAlquilerTotal,
      retornoSobreCD,
      retornoTotal,
      rindeIndiferenciaQ,
      rindeIndiferenciaAlqQ,
      precioIndiferencia,
      precioIndiferenciaAlq,
      margenSeguridad,
      estado,
      desgloseCostos: desgloseCostos.filter(d => d.costo > 0),
      matrizSensibilidad
    };
  },

  calcularSensibilidad(lote, params) {
    const rindeBaseQ = this.toNum(lote.rinde);
    const precioBaseT = this.toNum(lote.precio);
    if (!rindeBaseQ || !precioBaseT) return null;

    const deltasRinde = [-0.20, -0.10, 0, 0.10, 0.20];
    const deltasPrecio = [-0.20, -0.10, 0, 0.10, 0.20];

    const precios = deltasPrecio.map(d => precioBaseT * (1 + d));
    const filas = deltasRinde.map(dr => {
      const rQ = rindeBaseQ * (1 + dr);
      const rT = rQ / 10;
      const valores = precios.map(p => {
        const ib = rT * p;
        const comision = ib * params.comisionPct;
        const flete = rT * params.fleteT;
        const cosecha = (ib * params.cosechaPct) + params.cosechaFijaHa;
        const inet = ib - (comision + flete);
        const cd = params.costoDirectoSinCosechaHa + cosecha;
        const mb = inet - cd - params.alquilerHa;
        return mb;
      });
      return {
        rindeQ: rQ,
        esBase: dr === 0,
        valores
      };
    });

    return {
      precios,
      filas
    };
  },

  // ==========================================
  // CÁLCULOS GANADEROS (CRÍA BOVINA)
  // ==========================================
  calcGanaderia(ganaderia, config = { moneda: 'USD' }) {
    const ha = this.toNum(ganaderia.superficie);
    const categorias = ganaderia.categorias || {};

    // Cantidades de hacienda
    const vacasEntoradas = this.toNum(categorias.vacasMadre);
    const toros = this.toNum(categorias.toros);
    const ternerosMachos = this.toNum(categorias.ternerosMachos);
    const ternerasHembras = this.toNum(categorias.ternerasHembras);
    const vaquillonasReposicion = this.toNum(categorias.vaquillonasReposicion);
    const vaquillonasServicio = this.toNum(categorias.vaquillonasServicio);

    const totalCabezas = vacasEntoradas + toros + ternerosMachos + ternerasHembras + vaquillonasReposicion + vaquillonasServicio;

    // Equivalente Vaca (EV) regional Chaco
    // Vacas madre = 1.0 EV, Toros = 1.3 EV, Vaquillonas = 0.75 EV, Terneros/as = 0.45 EV
    const totalEV = (vacasEntoradas * 1.0) +
                    (toros * 1.3) +
                    ((vaquillonasReposicion + vaquillonasServicio) * 0.75) +
                    ((ternerosMachos + ternerasHembras) * 0.45);

    const cargaAnimalCabezasHa = ha > 0 ? (totalCabezas / ha) : 0;
    const cargaAnimalEVHa = ha > 0 ? (totalEV / ha) : 0;

    // Índices Productivos Físicos
    const tactadasPreniadas = this.toNum(ganaderia.reproduccion?.vacasPreniadas);
    const ternerosNacidos = this.toNum(ganaderia.reproduccion?.ternerosNacidos);
    const ternerosDestetados = this.toNum(ganaderia.reproduccion?.ternerosDestetados);
    const muertesTotales = this.toNum(ganaderia.reproduccion?.muertesTotales);

    // Cálculos porcentuales sobre vientres entorados
    const pctToros = vacasEntoradas > 0 ? (toros / vacasEntoradas) * 100 : 0;
    const pctPreniez = vacasEntoradas > 0 ? (tactadasPreniadas / vacasEntoradas) * 100 : 0;
    const pctParicion = vacasEntoradas > 0 ? (ternerosNacidos / vacasEntoradas) * 100 : 0;
    const pctDestete = vacasEntoradas > 0 ? (ternerosDestetados / vacasEntoradas) * 100 : 0;

    // Mermas
    const mermaTactoParicion = pctPreniez > 0 ? (pctPreniez - pctParicion) : 0;
    const mermaParicionDestete = pctParicion > 0 ? (pctParicion - pctDestete) : 0;
    const pctMortandadRodeo = totalCabezas > 0 ? (muertesTotales / totalCabezas) * 100 : 0;

    // Producción de Carne Física (Kg producidos en el ciclo anual)
    // Producción = Ventas (Kg) + Consumo (Kg) + (Inventario Final Kg - Inventario Inicial Kg)
    // Si el usuario carga el dato directo o por detalle de ventas + reposición:
    const kgVentasDetalle = (ganaderia.ventas || []).reduce((acc, curr) => {
      const cab = this.toNum(curr.cabezas);
      const peso = this.toNum(curr.pesoPromedioKg);
      return acc + (cab * peso);
    }, 0);

    const kgConsumo = this.toNum(ganaderia.produccion?.kgConsumo);
    const kgDiferenciaInventario = this.toNum(ganaderia.produccion?.kgDiferenciaInventario);
    
    // Si se cargaron ventas en detalle, sumamos; de lo contrario toma el valor global de kg si existe
    const kgCarneTotalesProducidos = (kgVentasDetalle > 0) 
      ? (kgVentasDetalle + kgConsumo + kgDiferenciaInventario)
      : this.toNum(ganaderia.produccion?.kgCarneProducidosTotal);

    const kgCarnePorHa = ha > 0 ? (kgCarneTotalesProducidos / ha) : 0;

    // Ingresos Ganaderos
    const ventas = (ganaderia.ventas || []).map(v => {
      const cabezas = this.toNum(v.cabezas);
      const pesoPromedioKg = this.toNum(v.pesoPromedioKg);
      const precioKg = this.toNum(v.precioKg);
      const kgTotales = cabezas * pesoPromedioKg;
      const ingresoTotal = kgTotales * precioKg;
      return {
        ...v,
        kgTotales,
        ingresoTotal
      };
    });

    const ingresoBrutoGanaderoTotal = ventas.reduce((acc, curr) => acc + curr.ingresoTotal, 0);
    const gastosComercializacionGanadera = this.toNum(ganaderia.gastosComercializacionTotal);
    const ingresoNetoGanaderoTotal = ingresoBrutoGanaderoTotal - gastosComercializacionGanadera;
    const ingresoNetoGanaderoHa = ha > 0 ? (ingresoNetoGanaderoTotal / ha) : 0;

    // Costos Directos Ganaderos
    const costos = ganaderia.costosDirectos || {};
    const sanidadTotal = this.toNum(costos.sanidadTotal);
    const alimentacionTotal = this.toNum(costos.suplementacionAlimentacionTotal);
    const pasturasLaboresTotal = this.toNum(costos.pasturasLaboresTotal);
    const personalSueldosTotal = this.toNum(costos.personalSueldosTotal);
    const mantenimientoInstalacionesTotal = this.toNum(costos.mantenimientoInstalacionesTotal);
    const otrosCostosDirectosTotal = this.toNum(costos.otrosCostosDirectosTotal);

    const costoDirectoGanaderoTotal = sanidadTotal + 
                                     alimentacionTotal + 
                                     pasturasLaboresTotal + 
                                     personalSueldosTotal + 
                                     mantenimientoInstalacionesTotal + 
                                     otrosCostosDirectosTotal;

    const costoDirectoGanaderoHa = ha > 0 ? (costoDirectoGanaderoTotal / ha) : 0;

    // Índices Económicos Ganaderos
    const margenBrutoGanaderoTotal = ingresoNetoGanaderoTotal - costoDirectoGanaderoTotal;
    const margenBrutoGanaderoHa = ha > 0 ? (margenBrutoGanaderoTotal / ha) : 0;
    
    // Margen Bruto y Costo por Kg de carne producido
    const margenBrutoPorKgCarne = kgCarneTotalesProducidos > 0 ? (margenBrutoGanaderoTotal / kgCarneTotalesProducidos) : 0;
    const costoDirectoPorKgCarne = kgCarneTotalesProducidos > 0 ? (costoDirectoGanaderoTotal / kgCarneTotalesProducidos) : 0;
    const precioPromedioObtenidoKg = kgVentasDetalle > 0 ? (ingresoBrutoGanaderoTotal / kgVentasDetalle) : 0;

    // Retorno sobre Costos Directos
    const retornoSobreCDGanadero = costoDirectoGanaderoTotal > 0 ? (margenBrutoGanaderoTotal / costoDirectoGanaderoTotal) : 0;

    // Precio de Indiferencia del Ternero (para cubrir la totalidad de los costos con la venta de terneros estimada)
    const ternerosVenta = ventas.find(v => (v.categoria || '').toLowerCase().includes('ternero')) || ventas[0];
    let precioIndiferenciaTerneroKg = 0;
    if (ternerosVenta && this.toNum(ternerosVenta.kgTotales) > 0) {
      // Ingresos de otras categorías (descartes)
      const otrosIngresos = ventas.filter(v => v !== ternerosVenta).reduce((a, c) => a + c.ingresoTotal, 0);
      const costoRemanente = (costoDirectoGanaderoTotal + gastosComercializacionGanadera) - otrosIngresos;
      precioIndiferenciaTerneroKg = costoRemanente > 0 ? (costoRemanente / ternerosVenta.kgTotales) : 0;
    }

    // Desglose de Costos Ganaderos
    const desgloseCostosGanaderos = [
      { rubro: 'Sanidad (Vacunas y antiparasitarios)', costo: sanidadTotal, color: '#06b6d4' },
      { rubro: 'Suplementación y Sales Minerales', costo: alimentacionTotal, color: '#f59e0b' },
      { rubro: 'Pasturas y Labores Forrajeras', costo: pasturasLaboresTotal, color: '#10b981' },
      { rubro: 'Personal y Sueldos Ganaderos', costo: personalSueldosTotal, color: '#6366f1' },
      { rubro: 'Mantenimiento (Aguadas/Alambrados)', costo: mantenimientoInstalacionesTotal, color: '#ec4899' },
      { rubro: 'Otros Costos Directos', costo: otrosCostosDirectosTotal, color: '#64748b' }
    ].filter(d => d.costo > 0);

    return {
      ha,
      totalCabezas,
      totalEV,
      cargaAnimalCabezasHa,
      cargaAnimalEVHa,
      // Físicos
      pctToros,
      pctPreniez,
      pctParicion,
      pctDestete,
      mermaTactoParicion,
      mermaParicionDestete,
      pctMortandadRodeo,
      kgCarneTotalesProducidos,
      kgCarnePorHa,
      kgVentasDetalle,
      // Económicos
      ventas,
      ingresoBrutoGanaderoTotal,
      gastosComercializacionGanadera,
      ingresoNetoGanaderoTotal,
      ingresoNetoGanaderoHa,
      costoDirectoGanaderoTotal,
      costoDirectoGanaderoHa,
      margenBrutoGanaderoTotal,
      margenBrutoGanaderoHa,
      margenBrutoPorKgCarne,
      costoDirectoPorKgCarne,
      precioPromedioObtenidoKg,
      retornoSobreCDGanadero,
      precioIndiferenciaTerneroKg,
      desgloseCostosGanaderos
    };
  },

  // ==========================================
  // CONSOLIDADO INTEGRAL DE LA EMPRESA
  // ==========================================
  calcConsolidado(lotesAgricolas = [], ganaderia = {}, config = { moneda: 'USD' }) {
    const lotesCalc = (lotesAgricolas || []).map(lote => ({
      ...lote,
      calc: this.calcLote(lote, config)
    }));

    const ganCalc = this.calcGanaderia(ganaderia, config);

    // Totales Agrícolas
    const haAgricola = lotesCalc.reduce((a, c) => a + c.calc.ha, 0);
    const ingresoBrutoAgricola = lotesCalc.reduce((a, c) => a + c.calc.ingresoBrutoTotal, 0);
    const gastosComercializacionAgricola = lotesCalc.reduce((a, c) => a + c.calc.gastosComercializacionTotal, 0);
    const ingresoNetoAgricola = lotesCalc.reduce((a, c) => a + c.calc.ingresoNetoTotal, 0);
    const costoDirectoAgricola = lotesCalc.reduce((a, c) => a + c.calc.costoDirectoTotal, 0);
    const margenBrutoAgricola = lotesCalc.reduce((a, c) => a + c.calc.margenBrutoTotal, 0);
    const alquileresAgricola = lotesCalc.reduce((a, c) => a + c.calc.alquilerTotal, 0);
    const resultadoDespuesAlquilerAgricola = margenBrutoAgricola - alquileresAgricola;
    const mbPorHaAgricola = haAgricola > 0 ? (margenBrutoAgricola / haAgricola) : 0;
    const retornoCDAgricola = costoDirectoAgricola > 0 ? (margenBrutoAgricola / costoDirectoAgricola) : 0;

    // Totales Ganaderos
    const haGanadera = ganCalc.ha;
    const ingresoBrutoGanadero = ganCalc.ingresoBrutoGanaderoTotal;
    const gastosComercializacionGanadero = ganCalc.gastosComercializacionGanadera;
    const ingresoNetoGanadero = ganCalc.ingresoNetoGanaderoTotal;
    const costoDirectoGanadero = ganCalc.costoDirectoGanaderoTotal;
    const margenBrutoGanadero = ganCalc.margenBrutoGanaderoTotal;
    const mbPorHaGanadero = ganCalc.margenBrutoGanaderoHa;
    const retornoCDGanadero = ganCalc.retornoSobreCDGanadero;

    // Totales Generales Empresa
    const superficieTotal = haAgricola + haGanadera;
    const ingresoBrutoTotal = ingresoBrutoAgricola + ingresoBrutoGanadero;
    const gastosComercializacionTotal = gastosComercializacionAgricola + gastosComercializacionGanadero;
    const ingresoNetoTotal = ingresoNetoAgricola + ingresoNetoGanadero;
    const costoDirectoTotal = costoDirectoAgricola + costoDirectoGanadero;
    const margenBrutoTotal = margenBrutoAgricola + margenBrutoGanadero;
    const resultadoTotal = resultadoDespuesAlquilerAgricola + margenBrutoGanadero;
    const mbMedioHaGlobal = superficieTotal > 0 ? (margenBrutoTotal / superficieTotal) : 0;
    const retornoCDGlobal = costoDirectoTotal > 0 ? (margenBrutoTotal / costoDirectoTotal) : 0;

    // Participaciones relativas
    const partSuperficie = {
      agricola: superficieTotal > 0 ? (haAgricola / superficieTotal) : 0,
      ganadera: superficieTotal > 0 ? (haGanadera / superficieTotal) : 0
    };

    const partCostoDirecto = {
      agricola: costoDirectoTotal > 0 ? (costoDirectoAgricola / costoDirectoTotal) : 0,
      ganadera: costoDirectoTotal > 0 ? (costoDirectoGanadero / costoDirectoTotal) : 0
    };

    const partMargenBruto = {
      agricola: margenBrutoTotal > 0 ? (margenBrutoAgricola / margenBrutoTotal) : (margenBrutoAgricola < 0 ? 0 : 0.5),
      ganadera: margenBrutoTotal > 0 ? (margenBrutoGanadero / margenBrutoTotal) : (margenBrutoGanadero < 0 ? 0 : 0.5)
    };

    // Resumen por cultivo individual
    const resumenPorCultivo = {};
    lotesCalc.forEach(l => {
      const cult = l.cultivo || 'Otro';
      if (!resumenPorCultivo[cult]) {
        resumenPorCultivo[cult] = {
          cultivo: cult,
          ha: 0,
          ingresoNeto: 0,
          costoDirecto: 0,
          margenBruto: 0,
          lotes: 0
        };
      }
      resumenPorCultivo[cult].ha += l.calc.ha;
      resumenPorCultivo[cult].ingresoNeto += l.calc.ingresoNetoTotal;
      resumenPorCultivo[cult].costoDirecto += l.calc.costoDirectoTotal;
      resumenPorCultivo[cult].margenBruto += l.calc.margenBrutoTotal;
      resumenPorCultivo[cult].lotes += 1;
    });

    const listaCultivos = Object.values(resumenPorCultivo).map(c => ({
      ...c,
      mbHa: c.ha > 0 ? (c.margenBruto / c.ha) : 0,
      cdHa: c.ha > 0 ? (c.costoDirecto / c.ha) : 0,
      retornoCD: c.costoDirecto > 0 ? (c.margenBruto / c.costoDirecto) : 0,
      participacionMB: margenBrutoTotal > 0 ? (c.margenBruto / margenBrutoTotal) : 0
    }));

    return {
      lotesCalc,
      ganCalc,
      haAgricola,
      haGanadera,
      superficieTotal,
      ingresoBrutoAgricola,
      ingresoBrutoGanadero,
      ingresoBrutoTotal,
      gastosComercializacionTotal,
      ingresoNetoAgricola,
      ingresoNetoGanadero,
      ingresoNetoTotal,
      costoDirectoAgricola,
      costoDirectoGanadero,
      costoDirectoTotal,
      margenBrutoAgricola,
      margenBrutoGanadero,
      margenBrutoTotal,
      resultadoDespuesAlquilerAgricola,
      resultadoTotal,
      mbPorHaAgricola,
      mbPorHaGanadero,
      mbMedioHaGlobal,
      retornoCDAgricola,
      retornoCDGanadero,
      retornoCDGlobal,
      partSuperficie,
      partCostoDirecto,
      partMargenBruto,
      listaCultivos
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgroCalc;
}
