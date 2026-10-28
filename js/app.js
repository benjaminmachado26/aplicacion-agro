/**
 * AgroChaco Manager - Aplicación Principal y Controladores UI
 * Desarrollado para gestión agrícola y ganadera integral (Pampa del Infierno, Chaco)
 */

class AgroApp {
  constructor() {
    this.state = null;
    this.activeTab = 'tab-consolidado';
    this.selectedLoteId = null;
    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.render();
  }

  // Carga y Persistencia
  loadState() {
    try {
      const saved = localStorage.getItem('agrochaco_state_v1');
      if (saved) {
        this.state = JSON.parse(saved);
      } else {
        this.state = JSON.parse(JSON.stringify(DefaultData));
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
      this.state = JSON.parse(JSON.stringify(DefaultData));
    }

    if (!this.selectedLoteId && this.state.lotes && this.state.lotes.length > 0) {
      this.selectedLoteId = this.state.lotes[0].id;
    }
  }

  saveState() {
    try {
      localStorage.setItem('agrochaco_state_v1', JSON.stringify(this.state));
      this.showToast('Cambios guardados automáticamente');
    } catch (e) {
      console.error('Error al guardar estado:', e);
    }
  }

  resetToDefaults() {
    if (confirm('¿Restablecer todos los datos a los valores recomendados para Pampa del Infierno, Chaco?')) {
      this.state = JSON.parse(JSON.stringify(DefaultData));
      this.selectedLoteId = this.state.lotes[0]?.id;
      this.saveState();
      this.render();
      this.showToast('Datos de Pampa del Infierno restablecidos');
    }
  }

  // Escuchadores de eventos
  setupEventListeners() {
    // Pestañas
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Moneda global
    const monedaSelect = document.getElementById('global-moneda');
    if (monedaSelect) {
      monedaSelect.value = this.state.config.moneda || 'USD';
      monedaSelect.addEventListener('change', (e) => {
        this.state.config.moneda = e.target.value;
        this.saveState();
        this.render();
      });
    }

    // Botón Imprimir / PDF
    const printBtn = document.getElementById('btn-imprimir');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Botón Restablecer
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetToDefaults());
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
    this.render();
  }

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  // Render general reactivo
  render() {
    const config = this.state.config;
    const consolidado = AgroCalc.calcConsolidado(this.state.lotes, this.state.ganaderia, config);

    // Actualizar datos del header
    const headerTitle = document.getElementById('header-establecimiento');
    if (headerTitle) {
      headerTitle.textContent = config.establecimiento || 'Establecimiento Agropecuario';
    }

    if (this.activeTab === 'tab-consolidado') {
      this.renderConsolidado(consolidado);
    } else if (this.activeTab === 'tab-agricultura') {
      this.renderAgricultura(consolidado);
    } else if (this.activeTab === 'tab-ganaderia') {
      this.renderGanaderia(consolidado);
    } else if (this.activeTab === 'tab-graficos') {
      this.renderGraficos(consolidado);
    } else if (this.activeTab === 'tab-config') {
      this.renderConfig();
    }
  }

  // ==========================================
  // RENDER: TABLERO CONSOLIDADO
  // ==========================================
  renderConsolidado(data) {
    const container = document.getElementById('tab-consolidado');
    if (!container) return;

    const M = this.state.config.moneda;
    const C = AgroCalc;

    container.innerHTML = `
      <!-- KPIs Generales -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Superficie Total en Explotación</span>
          <span class="kpi-value">${C.formatNum(data.superficieTotal)} <small style="font-size:14px; font-weight:normal;">ha</small></span>
          <span class="kpi-sub">${C.formatNum(data.haAgricola)} ha Agro (${C.formatPct(data.partSuperficie.agricola)}) | ${C.formatNum(data.haGanadera)} ha Ganadería (${C.formatPct(data.partSuperficie.ganadera)})</span>
        </div>

        <div class="kpi-card gold">
          <span class="kpi-label">Margen Bruto Total del Establecimiento</span>
          <span class="kpi-value" style="color:${data.margenBrutoTotal >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'};">
            ${C.formatMoney(data.margenBrutoTotal, M)}
          </span>
          <span class="kpi-sub">Agro: ${C.formatMoney(data.margenBrutoAgricola, M)} | Ganadería: ${C.formatMoney(data.margenBrutoGanadero, M)}</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Margen Bruto Medio Ponderado</span>
          <span class="kpi-value">${C.formatMoney(data.mbMedioHaGlobal, M)} <small style="font-size:14px; font-weight:normal;">/ha</small></span>
          <span class="kpi-sub">Agro: ${C.formatMoney(data.mbPorHaAgricola, M)}/ha | Ganadería: ${C.formatMoney(data.mbPorHaGanadero, M)}/ha</span>
        </div>

        <div class="kpi-card info">
          <span class="kpi-label">Retorno s/ Costo Directo Invertido</span>
          <span class="kpi-value">${C.formatPct(data.retornoCDGlobal)}</span>
          <span class="kpi-sub">Inversión Directa Total: ${C.formatMoney(data.costoDirectoTotal, M)}</span>
        </div>
      </div>

      <!-- Gráficos Principales del Consolidado -->
      <div class="grid-2">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Participación en el Margen Bruto</h2>
              <p class="panel-subtitle">Aporte relativo de la Agricultura vs la Ganadería de Cría</p>
            </div>
          </div>
          <div id="chart-mb-mix"></div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Comparativa de Margen Bruto por Hectárea</h2>
              <p class="panel-subtitle">Rentabilidad por hectárea comparada entre actividades (${M}/ha)</p>
            </div>
          </div>
          <div id="chart-mb-ha-compare"></div>
        </div>
      </div>

      <!-- Resumen por Actividad y Cultivo -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Matriz Resumen de Rentabilidad y Participación</h2>
            <p class="panel-subtitle">Detalle agronómico y económico de la empresa agropecuaria</p>
          </div>
        </div>
        <div class="table-responsive">
          <table class="agro-table">
            <thead>
              <tr>
                <th>Actividad / Cultivo</th>
                <th class="num">Superficie (ha)</th>
                <th class="num">% Sup</th>
                <th class="num">Costo Directo (${M}/ha)</th>
                <th class="num">Costo Directo Total (${M})</th>
                <th class="num">Margen Bruto (${M}/ha)</th>
                <th class="num">Margen Bruto Total (${M})</th>
                <th class="num">MB / CD</th>
                <th class="num">% Aporte MB</th>
              </tr>
            </thead>
            <tbody>
              ${data.listaCultivos.map(c => `
                <tr>
                  <td><strong>${c.cultivo}</strong> (${c.lotes} lote${c.lotes > 1 ? 's' : ''})</td>
                  <td class="num">${C.formatNum(c.ha)}</td>
                  <td class="num">${C.formatPct(data.superficieTotal > 0 ? c.ha / data.superficieTotal : 0)}</td>
                  <td class="num">${C.formatNum(c.cdHa)}</td>
                  <td class="num">${C.formatNum(c.costoDirecto)}</td>
                  <td class="num" style="font-weight:700; color:${c.mbHa >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'};">${C.formatNum(c.mbHa)}</td>
                  <td class="num" style="font-weight:700;">${C.formatNum(c.margenBruto)}</td>
                  <td class="num">${C.formatPct(c.retornoCD)}</td>
                  <td class="num">${C.formatPct(c.participacionMB)}</td>
                </tr>
              `).join('')}
              <tr style="background:var(--color-primary-light);">
                <td><strong>Ganadería de Cría (Bovinos)</strong></td>
                <td class="num">${C.formatNum(data.haGanadera)}</td>
                <td class="num">${C.formatPct(data.partSuperficie.ganadera)}</td>
                <td class="num">${C.formatNum(data.ganCalc.costoDirectoGanaderoHa)}</td>
                <td class="num">${C.formatNum(data.costoDirectoGanadero)}</td>
                <td class="num" style="font-weight:700; color:${data.mbPorHaGanadero >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'};">${C.formatNum(data.mbPorHaGanadero)}</td>
                <td class="num" style="font-weight:700;">${C.formatNum(data.margenBrutoGanadero)}</td>
                <td class="num">${C.formatPct(data.retornoCDGanadero)}</td>
                <td class="num">${C.formatPct(data.partMargenBruto.ganadera)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL ESTABLECIMIENTO</td>
                <td class="num">${C.formatNum(data.superficieTotal)} ha</td>
                <td class="num">100 %</td>
                <td class="num">${C.formatNum(data.costoDirectoTotal / (data.superficieTotal || 1))}</td>
                <td class="num">${C.formatMoney(data.costoDirectoTotal, M)}</td>
                <td class="num">${C.formatNum(data.mbMedioHaGlobal)}</td>
                <td class="num">${C.formatMoney(data.margenBrutoTotal, M)}</td>
                <td class="num">${C.formatPct(data.retornoCDGlobal)}</td>
                <td class="num">100 %</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    // Gráficos
    AgroCharts.renderDonut('chart-mb-mix', [
      { label: 'Agricultura', value: Math.max(0, data.margenBrutoAgricola), color: '#2f6b3f' },
      { label: 'Ganadería de Cría', value: Math.max(0, data.margenBrutoGanadero), color: '#c08a1e' }
    ], {
      centerTitle: 'Margen Total',
      centerValue: C.formatMoney(data.margenBrutoTotal, M)
    });

    const compareItems = [
      ...data.listaCultivos.map(c => ({
        label: c.cultivo,
        value: c.mbHa,
        color: '#2f6b3f'
      })),
      {
        label: 'Ganadería de Cría',
        value: data.mbPorHaGanadero,
        color: '#c08a1e'
      }
    ];

    AgroCharts.renderBarChart('chart-mb-ha-compare', compareItems, { unit: `${M}/ha` });
  }

  // ==========================================
  // RENDER: MÓDULO AGRICULTURA
  // ==========================================
  renderAgricultura(data) {
    const container = document.getElementById('tab-agricultura');
    if (!container) return;

    const M = this.state.config.moneda;
    const C = AgroCalc;
    const lotes = this.state.lotes || [];
    
    // Si no hay lote seleccionado o el seleccionado fue borrado
    if (!lotes.find(l => l.id === this.selectedLoteId) && lotes.length > 0) {
      this.selectedLoteId = lotes[0].id;
    }

    const currentLote = lotes.find(l => l.id === this.selectedLoteId);
    const loteCalc = currentLote ? C.calcLote(currentLote, this.state.config) : null;

    container.innerHTML = `
      <!-- Selector de Lotes y Acciones -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; padding-bottom:4px; max-width:100%;">
          ${lotes.map(l => {
            const isSel = l.id === this.selectedLoteId;
            const c = C.calcLote(l, this.state.config);
            return `
              <button 
                class="btn ${isSel ? 'btn-primary' : ''}" 
                onclick="window.agroApp.selectLote('${l.id}')"
                style="display:flex; flex-direction:column; align-items:flex-start; padding:6px 12px; text-align:left;"
              >
                <span style="font-weight:700;">${l.nombre}</span>
                <small style="opacity:0.85;">${l.cultivo} · ${C.formatNum(l.superficie)} ha</small>
              </button>
            `;
          }).join('')}
          <button class="btn btn-primary" onclick="window.agroApp.crearLote()">+ Agregar Lote</button>
        </div>
        ${currentLote ? `
          <div style="display:flex; gap:8px;">
            <button class="btn btn-danger btn-sm" onclick="window.agroApp.eliminarLote('${currentLote.id}')">Eliminar Lote</button>
          </div>
        ` : ''}
      </div>

      ${!currentLote ? `
        <div class="panel" style="text-align:center; padding:40px;">
          <h3>No hay lotes agrícolas cargados</h3>
          <p class="panel-subtitle" style="margin-top:8px;">Comenzá cargando tu primer lote de Soja, Maíz, Girasol, Trigo o Sorgo.</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="window.agroApp.crearLote()">+ Cargar Primer Lote</button>
        </div>
      ` : `
        <!-- Panel de Datos Básicos del Lote -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">${currentLote.nombre}</h2>
              <p class="panel-subtitle">Parámetros productivos y agronómicos para Pampa del Infierno, Chaco</p>
            </div>
            <div>
              <span class="badge ${loteCalc.estado === 'good' ? 'good' : (loteCalc.estado === 'warn' ? 'warn' : 'bad')}">
                ${loteCalc.estado === 'good' ? 'Rentable' : (loteCalc.estado === 'warn' ? 'Ajustado' : 'En Pérdida')}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre del Lote</label>
              <input type="text" value="${currentLote.nombre}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'nombre', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Cultivo</label>
              <select onchange="window.agroApp.updateLoteField('${currentLote.id}', 'cultivo', this.value)">
                ${DefaultData.cultivosDisponibles.map(c => `
                  <option value="${c}" ${c === currentLote.cultivo ? 'selected' : ''}>${c}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Superficie (ha)</label>
              <input type="number" class="num-input" value="${currentLote.superficie}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'superficie', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Rinde Estimado (qq/ha)</label>
              <input type="number" step="0.1" class="num-input" value="${currentLote.rinde}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'rinde', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Precio Neto (${M}/t)</label>
              <input type="number" step="0.5" class="num-input" value="${currentLote.precio}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'precio', this.value)">
            </div>
          </div>

          <div class="form-row" style="margin-top:10px;">
            <div class="form-group">
              <label class="form-label">Flete a Puerto / Acopio (${M}/t)</label>
              <input type="number" step="0.5" class="num-input" value="${currentLote.fletePorTonelada || 0}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'fletePorTonelada', this.value)">
              <small style="color:var(--text-muted); font-size:11px;">Chaco a Rosario ~ 750 km</small>
            </div>
            <div class="form-group">
              <label class="form-label">Comisión & Acopio (% del IB)</label>
              <input type="number" step="0.1" class="num-input" value="${currentLote.comisionPct || 0}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'comisionPct', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Cosecha (% del IB)</label>
              <input type="number" step="0.5" class="num-input" value="${currentLote.cosechaPct || 0}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'cosechaPct', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Cosecha Fija (${M}/ha)</label>
              <input type="number" step="1" class="num-input" value="${currentLote.cosechaFijaHa || 0}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'cosechaFijaHa', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Alquiler (${M}/ha - opcional)</label>
              <input type="number" step="1" class="num-input" value="${currentLote.alquilerHa || 0}" onchange="window.agroApp.updateLoteField('${currentLote.id}', 'alquilerHa', this.value)">
            </div>
          </div>
        </div>

        <!-- Indicadores Económicos Calculados del Lote -->
        <div class="kpi-grid">
          <div class="kpi-card gold">
            <span class="kpi-label">Margen Bruto Total</span>
            <span class="kpi-value" style="color:${loteCalc.margenBrutoTotal >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'};">
              ${C.formatMoney(loteCalc.margenBrutoTotal, M)}
            </span>
            <span class="kpi-sub">${C.formatMoney(loteCalc.margenBrutoHa, M)} /ha</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Rinde de Indiferencia</span>
            <span class="kpi-value">${C.formatNum(loteCalc.rindeIndiferenciaQ, 1)} <small style="font-size:14px; font-weight:normal;">qq/ha</small></span>
            <span class="kpi-sub">
              ${loteCalc.rindeQ > 0 ? (loteCalc.rindeQ >= loteCalc.rindeIndiferenciaQ ? `Cubierto (+${C.formatNum(loteCalc.rindeQ - loteCalc.rindeIndiferenciaQ, 1)} qq/ha)` : `Faltan ${C.formatNum(loteCalc.rindeIndiferenciaQ - loteCalc.rindeQ, 1)} qq/ha`) : ''}
            </span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Precio de Indiferencia</span>
            <span class="kpi-value">${C.formatMoney(loteCalc.precioIndiferencia, M)} <small style="font-size:14px; font-weight:normal;">/t</small></span>
            <span class="kpi-sub">Precio actual: ${C.formatMoney(loteCalc.precioT, M)}/t</span>
          </div>

          <div class="kpi-card info">
            <span class="kpi-label">Margen Bruto / Costo Directo</span>
            <span class="kpi-value">${C.formatPct(loteCalc.retornoSobreCD)}</span>
            <span class="kpi-sub">CD Total: ${C.formatMoney(loteCalc.costoDirectoTotalHa, M)} /ha</span>
          </div>
        </div>

        <!-- Tablas de Insumos y Labores -->
        <div class="grid-2">
          <!-- Insumos -->
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title" style="font-size:18px;">Insumos Directos</h3>
                <p class="panel-subtitle">Semillas, fertilizantes, fitosanitarios y coadyuvantes</p>
              </div>
              <button class="btn btn-sm btn-primary" onclick="window.agroApp.agregarInsumo('${currentLote.id}')">+ Insumo</button>
            </div>
            <div class="table-responsive">
              <table class="agro-table">
                <thead>
                  <tr>
                    <th>Producto / Tipo</th>
                    <th class="num">Dosis/ha</th>
                    <th>Unidad</th>
                    <th class="num">Precio (${M})</th>
                    <th class="num">Costo/ha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${(currentLote.insumos || []).map((ins, idx) => `
                    <tr>
                      <td>
                        <input type="text" value="${ins.nombre}" placeholder="Nombre producto" onchange="window.agroApp.updateInsumo('${currentLote.id}', ${idx}, 'nombre', this.value)">
                      </td>
                      <td class="num">
                        <input type="number" step="0.01" class="num-input" value="${ins.dosis}" onchange="window.agroApp.updateInsumo('${currentLote.id}', ${idx}, 'dosis', this.value)">
                      </td>
                      <td>
                        <input type="text" value="${ins.unidad}" style="width:70px;" onchange="window.agroApp.updateInsumo('${currentLote.id}', ${idx}, 'unidad', this.value)">
                      </td>
                      <td class="num">
                        <input type="number" step="0.01" class="num-input" value="${ins.precio}" onchange="window.agroApp.updateInsumo('${currentLote.id}', ${idx}, 'precio', this.value)">
                      </td>
                      <td class="num">
                        ${C.formatNum(C.toNum(ins.dosis) * C.toNum(ins.precio), 1)}
                      </td>
                      <td>
                        <button class="btn btn-danger btn-sm" onclick="window.agroApp.eliminarInsumo('${currentLote.id}', ${idx})">×</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4">TOTAL INSUMOS</td>
                    <td class="num">${C.formatMoney(loteCalc.costoInsumosHa, M, 1)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Labores -->
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title" style="font-size:18px;">Labores Agrícolas</h3>
                <p class="panel-subtitle">Barbechos, siembra directa, pulverizaciones y aplicaciones</p>
              </div>
              <button class="btn btn-sm btn-primary" onclick="window.agroApp.agregarLabor('${currentLote.id}')">+ Labor</button>
            </div>
            <div class="table-responsive">
              <table class="agro-table">
                <thead>
                  <tr>
                    <th>Labor</th>
                    <th class="num">Pasadas</th>
                    <th class="num">Costo Pasada (${M})</th>
                    <th class="num">Costo/ha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${(currentLote.labores || []).map((lab, idx) => `
                    <tr>
                      <td>
                        <input type="text" value="${lab.nombre}" placeholder="Ej: Siembra" onchange="window.agroApp.updateLabor('${currentLote.id}', ${idx}, 'nombre', this.value)">
                      </td>
                      <td class="num">
                        <input type="number" step="1" class="num-input" value="${lab.pasadas}" onchange="window.agroApp.updateLabor('${currentLote.id}', ${idx}, 'pasadas', this.value)">
                      </td>
                      <td class="num">
                        <input type="number" step="0.5" class="num-input" value="${lab.costo}" onchange="window.agroApp.updateLabor('${currentLote.id}', ${idx}, 'costo', this.value)">
                      </td>
                      <td class="num">
                        ${C.formatNum(C.toNum(lab.pasadas) * C.toNum(lab.costo), 1)}
                      </td>
                      <td>
                        <button class="btn btn-danger btn-sm" onclick="window.agroApp.eliminarLabor('${currentLote.id}', ${idx})">×</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">TOTAL LABORES</td>
                    <td class="num">${C.formatMoney(loteCalc.costoLaboresHa, M, 1)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Matriz de Sensibilidad: Margen Bruto según Rinde vs Precio -->
        ${loteCalc.matrizSensibilidad ? `
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title" style="font-size:18px;">Matriz de Sensibilidad: Margen Bruto (${M}/ha)</h3>
                <p class="panel-subtitle">Impacto de variaciones de ±10% y ±20% en Rendimiento (qq/ha) y Precio (${M}/t)</p>
              </div>
            </div>
            <div class="table-responsive">
              <table class="agro-table sens-matrix">
                <thead>
                  <tr>
                    <th style="background:var(--bg-surface-sunk); text-align:left;">Rinde ↓ / Precio →</th>
                    ${loteCalc.matrizSensibilidad.precios.map((p, idx) => `
                      <th class="num ${idx === 2 ? 'base-cell' : ''}">${C.formatMoney(p, M, 0)}</th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${loteCalc.matrizSensibilidad.filas.map((fila, rIdx) => `
                    <tr>
                      <td style="font-weight:700; background:var(--bg-surface-sunk); text-align:left;">${C.formatNum(fila.rindeQ, 1)} qq</td>
                      ${fila.valores.map((val, cIdx) => {
                        const isBase = rIdx === 2 && cIdx === 2;
                        const isPos = val >= 0;
                        return `
                          <td class="num ${isBase ? 'base-cell' : ''}" style="color:${isPos ? 'var(--color-primary)' : 'var(--color-danger)'}; font-weight:${isBase ? '800' : '500'};">
                            ${C.formatNum(val, 0)}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      `}
    `;
  }

  // Métodos de manipulación de lotes
  selectLote(id) {
    this.selectedLoteId = id;
    this.render();
  }

  crearLote() {
    const num = (this.state.lotes?.length || 0) + 1;
    const nuevoLote = {
      id: `lote-${Date.now()}`,
      nombre: `Lote ${num}`,
      cultivo: "Soja 1ra",
      superficie: 150,
      alquilerHa: 0,
      rinde: 24,
      precio: 320,
      comisionPct: 2.5,
      fletePorTonelada: 38,
      cosechaPct: 7.0,
      cosechaFijaHa: 0,
      otrosCostosDirectosHa: 10,
      insumos: [
        { id: "i1", nombre: "Semilla fiscalizada", tipo: "Semilla", dosis: 1, unidad: "bolsa", precio: 38 },
        { id: "i2", nombre: "Glifosato 66%", tipo: "Herbicida", dosis: 3.5, unidad: "l", precio: 5.2 }
      ],
      labores: [
        { id: "l1", nombre: "Siembra directa", pasadas: 1, costo: 40 },
        { id: "l2", nombre: "Pulverización terrestre", pasadas: 2, costo: 8.5 }
      ]
    };
    this.state.lotes.push(nuevoLote);
    this.selectedLoteId = nuevoLote.id;
    this.saveState();
    this.render();
  }

  eliminarLote(id) {
    if (confirm('¿Eliminar este lote agrícola?')) {
      this.state.lotes = this.state.lotes.filter(l => l.id !== id);
      this.selectedLoteId = this.state.lotes[0]?.id || null;
      this.saveState();
      this.render();
    }
  }

  updateLoteField(loteId, field, value) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (!lote) return;
    lote[field] = value;
    this.saveState();
    this.render();
  }

  agregarInsumo(loteId) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (!lote) return;
    lote.insumos = lote.insumos || [];
    lote.insumos.push({
      id: `ins-${Date.now()}`,
      nombre: "Nuevo Insumo",
      tipo: "Herbicida",
      dosis: 1,
      unidad: "l",
      precio: 0
    });
    this.saveState();
    this.render();
  }

  updateInsumo(loteId, idx, field, value) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (lote && lote.insumos && lote.insumos[idx]) {
      lote.insumos[idx][field] = value;
      this.saveState();
      this.render();
    }
  }

  eliminarInsumo(loteId, idx) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (lote && lote.insumos) {
      lote.insumos.splice(idx, 1);
      this.saveState();
      this.render();
    }
  }

  agregarLabor(loteId) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (!lote) return;
    lote.labores = lote.labores || [];
    lote.labores.push({
      id: `lab-${Date.now()}`,
      nombre: "Nueva Labor",
      pasadas: 1,
      costo: 0
    });
    this.saveState();
    this.render();
  }

  updateLabor(loteId, idx, field, value) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (lote && lote.labores && lote.labores[idx]) {
      lote.labores[idx][field] = value;
      this.saveState();
      this.render();
    }
  }

  eliminarLabor(loteId, idx) {
    const lote = this.state.lotes.find(l => l.id === loteId);
    if (lote && lote.labores) {
      lote.labores.splice(idx, 1);
      this.saveState();
      this.render();
    }
  }

  // ==========================================
  // RENDER: MÓDULO GANADERÍA DE CRÍA
  // ==========================================
  renderGanaderia(data) {
    const container = document.getElementById('tab-ganaderia');
    if (!container) return;

    const M = this.state.config.moneda;
    const C = AgroCalc;
    const gan = this.state.ganaderia;
    const gCalc = data.ganCalc;

    container.innerHTML = `
      <!-- KPIs Ganaderos Principales -->
      <div class="kpi-grid">
        <div class="kpi-card gold">
          <span class="kpi-label">Margen Bruto Ganadero Total</span>
          <span class="kpi-value" style="color:${gCalc.margenBrutoGanaderoTotal >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'};">
            ${C.formatMoney(gCalc.margenBrutoGanaderoTotal, M)}
          </span>
          <span class="kpi-sub">${C.formatMoney(gCalc.margenBrutoGanaderoHa, M)} /ha ganadera</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Margen Bruto por Kg Producido</span>
          <span class="kpi-value">${C.formatMoney(gCalc.margenBrutoPorKgCarne, M, 2)} <small style="font-size:14px; font-weight:normal;">/kg</small></span>
          <span class="kpi-sub">Costo Directo: ${C.formatMoney(gCalc.costoDirectoPorKgCarne, M, 2)}/kg</span>
        </div>

        <div class="kpi-card info">
          <span class="kpi-label">Producción de Carne</span>
          <span class="kpi-value">${C.formatNum(gCalc.kgCarnePorHa, 1)} <small style="font-size:14px; font-weight:normal;">kg/ha</small></span>
          <span class="kpi-sub">${C.formatNum(gCalc.kgCarneTotalesProducidos)} kg producidos anuales</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Carga Animal</span>
          <span class="kpi-value">${C.formatNum(gCalc.cargaAnimalEVHa, 2)} <small style="font-size:14px; font-weight:normal;">EV/ha</small></span>
          <span class="kpi-sub">${C.formatNum(gCalc.totalCabezas)} cabezas en ${C.formatNum(gCalc.ha)} ha</span>
        </div>
      </div>

      <!-- Índices Reproductivos y Físicos (Preñez, Destete, Parición, Mortandad) -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Índices de Productividad Física del Rodeo</h2>
            <p class="panel-subtitle">Evaluación de eficiencia reproductiva y mortandad (Pampa del Infierno, Chaco)</p>
          </div>
        </div>

        <div id="benchmark-gauges"></div>

        <div class="form-row" style="margin-top:20px;">
          <div class="form-group">
            <label class="form-label">Superficie Ganadera (ha)</label>
            <input type="number" class="num-input" value="${gan.superficie}" onchange="window.agroApp.updateGanaderiaField('superficie', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Vientres Entorados (Vacas Madre)</label>
            <input type="number" class="num-input" value="${gan.categorias?.vacasMadre || 0}" onchange="window.agroApp.updateGanaderiaCat('vacasMadre', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Toros en Servicio</label>
            <input type="number" class="num-input" value="${gan.categorias?.toros || 0}" onchange="window.agroApp.updateGanaderiaCat('toros', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Vacas Preñadas (Tacto)</label>
            <input type="number" class="num-input" value="${gan.reproduccion?.vacasPreniadas || 0}" onchange="window.agroApp.updateGanaderiaRepro('vacasPreniadas', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Terneros Nacidos</label>
            <input type="number" class="num-input" value="${gan.reproduccion?.ternerosNacidos || 0}" onchange="window.agroApp.updateGanaderiaRepro('ternerosNacidos', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Terneros Destetados</label>
            <input type="number" class="num-input" value="${gan.reproduccion?.ternerosDestetados || 0}" onchange="window.agroApp.updateGanaderiaRepro('ternerosDestetados', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Mortandad Anual (Cabezas)</label>
            <input type="number" class="num-input" value="${gan.reproduccion?.muertesTotales || 0}" onchange="window.agroApp.updateGanaderiaRepro('muertesTotales', this.value)">
          </div>
        </div>
      </div>

      <!-- Rodeo y Categorías -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Composición del Rodeo por Categorías</h2>
            <p class="panel-subtitle">Inventario de hacienda y ponderación en Equivalente Vaca (EV)</p>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Terneros Machos</label>
            <input type="number" class="num-input" value="${gan.categorias?.ternerosMachos || 0}" onchange="window.agroApp.updateGanaderiaCat('ternerosMachos', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Terneras Hembras</label>
            <input type="number" class="num-input" value="${gan.categorias?.ternerasHembras || 0}" onchange="window.agroApp.updateGanaderiaCat('ternerasHembras', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Vaquillonas Reposición</label>
            <input type="number" class="num-input" value="${gan.categorias?.vaquillonasReposicion || 0}" onchange="window.agroApp.updateGanaderiaCat('vaquillonasReposicion', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Vaquillonas Servicio</label>
            <input type="number" class="num-input" value="${gan.categorias?.vaquillonasServicio || 0}" onchange="window.agroApp.updateGanaderiaCat('vaquillonasServicio', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Total Cabezas en Rodeo</label>
            <input type="text" class="num-input" disabled value="${C.formatNum(gCalc.totalCabezas)} cab">
          </div>
          <div class="form-group">
            <label class="form-label">Total Equivalente Vaca</label>
            <input type="text" class="num-input" disabled value="${C.formatNum(gCalc.totalEV, 1)} EV">
          </div>
        </div>
      </div>

      <!-- Ingresos Ganaderos (Ventas) y Costos Directos Ganaderos -->
      <div class="grid-2">
        <!-- Ventas -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title" style="font-size:18px;">Ingresos Ganaderos (Ventas del Ciclo)</h2>
              <p class="panel-subtitle">Terneros, terneras y vacas/toros de refugo</p>
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.agroApp.agregarVentaGanadera()">+ Venta</button>
          </div>
          <div class="table-responsive">
            <table class="agro-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th class="num">Cabezas</th>
                  <th class="num">Peso (kg)</th>
                  <th class="num">Precio (${M}/kg)</th>
                  <th class="num">Total (${M})</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${(gan.ventas || []).map((v, idx) => `
                  <tr>
                    <td>
                      <input type="text" value="${v.categoria}" onchange="window.agroApp.updateVenta(${idx}, 'categoria', this.value)">
                    </td>
                    <td class="num">
                      <input type="number" class="num-input" value="${v.cabezas}" onchange="window.agroApp.updateVenta(${idx}, 'cabezas', this.value)">
                    </td>
                    <td class="num">
                      <input type="number" class="num-input" value="${v.pesoPromedioKg}" onchange="window.agroApp.updateVenta(${idx}, 'pesoPromedioKg', this.value)">
                    </td>
                    <td class="num">
                      <input type="number" step="0.05" class="num-input" value="${v.precioKg}" onchange="window.agroApp.updateVenta(${idx}, 'precioKg', this.value)">
                    </td>
                    <td class="num" style="font-weight:700;">
                      ${C.formatNum(C.toNum(v.cabezas) * C.toNum(v.pesoPromedioKg) * C.toNum(v.precioKg))}
                    </td>
                    <td>
                      <button class="btn btn-danger btn-sm" onclick="window.agroApp.eliminarVenta(${idx})">×</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">TOTAL INGRESOS BRUTOS GANADEROS</td>
                  <td class="num">${C.formatMoney(gCalc.ingresoBrutoGanaderoTotal, M)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="form-row" style="margin-top:14px;">
            <div class="form-group">
              <label class="form-label">Gastos Comercialización Hacienda (${M})</label>
              <input type="number" class="num-input" value="${gan.gastosComercializacionTotal || 0}" onchange="window.agroApp.updateGanaderiaField('gastosComercializacionTotal', this.value)">
              <small style="color:var(--text-muted);">Flete jaula, comisiones y SENASA</small>
            </div>
            <div class="form-group">
              <label class="form-label">Ingreso Neto Ganadero (${M})</label>
              <input type="text" class="num-input" disabled value="${C.formatMoney(gCalc.ingresoNetoGanaderoTotal, M)}">
            </div>
          </div>
        </div>

        <!-- Costos Directos Ganaderos -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title" style="font-size:18px;">Costos Directos Ganaderos Anuales</h2>
              <p class="panel-subtitle">Insumos, sanidad, suplementos y personal específico</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="agro-table">
              <thead>
                <tr>
                  <th>Rubro de Costo Directo</th>
                  <th class="num">Costo Total (${M})</th>
                  <th class="num">${M}/ha</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sanidad (Vacunas aftosa, reproductivas, antiparasitarios)</td>
                  <td class="num">
                    <input type="number" class="num-input" value="${gan.costosDirectos?.sanidadTotal || 0}" onchange="window.agroApp.updateGanaderiaCosto('sanidadTotal', this.value)">
                  </td>
                  <td class="num">${C.formatNum(C.toNum(gan.costosDirectos?.sanidadTotal) / (gCalc.ha || 1), 1)}</td>
                </tr>
                <tr>
                  <td>Suplementación (Sales c/ Fósforo, rollos Gatton, granos)</td>
                  <td class="num">
                    <input type="number" class="num-input" value="${gan.costosDirectos?.suplementacionAlimentacionTotal || 0}" onchange="window.agroApp.updateGanaderiaCosto('suplementacionAlimentacionTotal', this.value)">
                  </td>
                  <td class="num">${C.formatNum(C.toNum(gan.costosDirectos?.suplementacionAlimentacionTotal) / (gCalc.ha || 1), 1)}</td>
                </tr>
                <tr>
                  <td>Pasturas y Labores Forrajeras (Control renuevos, rolado)</td>
                  <td class="num">
                    <input type="number" class="num-input" value="${gan.costosDirectos?.pasturasLaboresTotal || 0}" onchange="window.agroApp.updateGanaderiaCosto('pasturasLaboresTotal', this.value)">
                  </td>
                  <td class="num">${C.formatNum(C.toNum(gan.costosDirectos?.pasturasLaboresTotal) / (gCalc.ha || 1), 1)}</td>
                </tr>
                <tr>
                  <td>Personal y Sueldos Ganaderos (Puestero, peón)</td>
                  <td class="num">
                    <input type="number" class="num-input" value="${gan.costosDirectos?.personalSueldosTotal || 0}" onchange="window.agroApp.updateGanaderiaCosto('personalSueldosTotal', this.value)">
                  </td>
                  <td class="num">${C.formatNum(C.toNum(gan.costosDirectos?.personalSueldosTotal) / (gCalc.ha || 1), 1)}</td>
                </tr>
                <tr>
                  <td>Mantenimiento de Instalaciones (Aguadas, molinos, alambrados)</td>
                  <td class="num">
                    <input type="number" class="num-input" value="${gan.costosDirectos?.mantenimientoInstalacionesTotal || 0}" onchange="window.agroApp.updateGanaderiaCosto('mantenimientoInstalacionesTotal', this.value)">
                  </td>
                  <td class="num">${C.formatNum(C.toNum(gan.costosDirectos?.mantenimientoInstalacionesTotal) / (gCalc.ha || 1), 1)}</td>
                </tr>
                <tr>
                  <td>Otros Costos Directos Operativos</td>
                  <td class="num">
                    <input type="number" class="num-input" value="${gan.costosDirectos?.otrosCostosDirectosTotal || 0}" onchange="window.agroApp.updateGanaderiaCosto('otrosCostosDirectosTotal', this.value)">
                  </td>
                  <td class="num">${C.formatNum(C.toNum(gan.costosDirectos?.otrosCostosDirectosTotal) / (gCalc.ha || 1), 1)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL COSTOS DIRECTOS GANADERÍA</td>
                  <td class="num">${C.formatMoney(gCalc.costoDirectoGanaderoTotal, M)}</td>
                  <td class="num">${C.formatMoney(gCalc.costoDirectoGanaderoHa, M, 1)}/ha</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;

    // Render Gauges Físicos de Benchmarking
    AgroCharts.renderBenchmarkGauge('benchmark-gauges', [
      {
        label: 'Porcentaje de Preñez',
        actual: gCalc.pctPreniez,
        meta: 82.0,
        unit: '%',
        description: 'Tacto rectal sobre vientres entorados (Meta zonal Chaco: 80-85%)'
      },
      {
        label: 'Porcentaje de Parición',
        actual: gCalc.pctParicion,
        meta: 78.0,
        unit: '%',
        description: 'Terneros nacidos vivos sobre vientres entorados'
      },
      {
        label: 'Porcentaje de Destete',
        actual: gCalc.pctDestete,
        meta: 74.0,
        unit: '%',
        description: 'Eficiencia final de cría: terneros logrados por vaca entorada'
      },
      {
        label: 'Mortandad Total',
        actual: gCalc.pctMortandadRodeo,
        meta: 3.0,
        unit: '%',
        inverso: true,
        description: 'Muertes anuales en rodeo adulto y recría (Meta: < 3%)'
      }
    ]);
  }

  // Manipulaciones Ganadería
  updateGanaderiaField(field, value) {
    this.state.ganaderia[field] = value;
    this.saveState();
    this.render();
  }

  updateGanaderiaCat(field, value) {
    this.state.ganaderia.categorias = this.state.ganaderia.categorias || {};
    this.state.ganaderia.categorias[field] = value;
    this.saveState();
    this.render();
  }

  updateGanaderiaRepro(field, value) {
    this.state.ganaderia.reproduccion = this.state.ganaderia.reproduccion || {};
    this.state.ganaderia.reproduccion[field] = value;
    this.saveState();
    this.render();
  }

  updateGanaderiaCosto(field, value) {
    this.state.ganaderia.costosDirectos = this.state.ganaderia.costosDirectos || {};
    this.state.ganaderia.costosDirectos[field] = value;
    this.saveState();
    this.render();
  }

  agregarVentaGanadera() {
    this.state.ganaderia.ventas = this.state.ganaderia.ventas || [];
    this.state.ganaderia.ventas.push({
      id: `v-${Date.now()}`,
      categoria: "Terneros Machos",
      cabezas: 50,
      pesoPromedioKg: 170,
      precioKg: 2.20
    });
    this.saveState();
    this.render();
  }

  updateVenta(idx, field, value) {
    if (this.state.ganaderia.ventas && this.state.ganaderia.ventas[idx]) {
      this.state.ganaderia.ventas[idx][field] = value;
      this.saveState();
      this.render();
    }
  }

  eliminarVenta(idx) {
    if (this.state.ganaderia.ventas) {
      this.state.ganaderia.ventas.splice(idx, 1);
      this.saveState();
      this.render();
    }
  }

  // ==========================================
  // RENDER: GRÁFICOS Y COMPARATIVAS
  // ==========================================
  renderGraficos(data) {
    const container = document.getElementById('tab-graficos');
    if (!container) return;

    const M = this.state.config.moneda;
    const C = AgroCalc;

    container.innerHTML = `
      <div class="grid-2">
        <!-- Composición de Costos Directos Agrícolas Totales -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Estructura de Costos Directos Agrícolas</h2>
              <p class="panel-subtitle">Distribución porcentual en Insumos, Labores y Cosecha</p>
            </div>
          </div>
          <div id="chart-costos-agro"></div>
        </div>

        <!-- Composición de Costos Directos Ganaderos -->
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Estructura de Costos Ganaderos</h2>
              <p class="panel-subtitle">Sanidad, Suplementación, Pasturas y Sueldos</p>
            </div>
          </div>
          <div id="chart-costos-gan"></div>
        </div>
      </div>

      <!-- Participación Relativa en la Empresa -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Participación Relativa Agro vs Ganadería</h2>
            <p class="panel-subtitle">Comparación de ocupación de superficie, inversión en costos directos y generación de margen</p>
          </div>
        </div>
        
        <div style="margin-bottom:20px;">
          <h4 style="font-size:12px; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">1. Ocupación de Superficie (${C.formatNum(data.superficieTotal)} ha)</h4>
          <div id="bar-part-sup"></div>
        </div>

        <div style="margin-bottom:20px;">
          <h4 style="font-size:12px; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">2. Inversión en Costos Directos (${C.formatMoney(data.costoDirectoTotal, M)})</h4>
          <div id="bar-part-cd"></div>
        </div>

        <div>
          <h4 style="font-size:12px; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">3. Margen Bruto Generado (${C.formatMoney(data.margenBrutoTotal, M)})</h4>
          <div id="bar-part-mb"></div>
        </div>
      </div>
    `;

    // Gráfico Donut Costos Agro
    const rubrosAgro = [
      { label: 'Semillas y Curasemillas', value: 0, color: '#4ade80' },
      { label: 'Fertilizantes', value: 0, color: '#facc15' },
      { label: 'Herbicidas y Coadyuvantes', value: 0, color: '#38bdf8' },
      { label: 'Insecticidas y Fungicidas', value: 0, color: '#f87171' },
      { label: 'Labores y Siembra', value: 0, color: '#fb923c' },
      { label: 'Cosecha', value: 0, color: '#a78bfa' }
    ];

    data.lotesCalc.forEach(l => {
      (l.calc.desgloseCostos || []).forEach(d => {
        const item = rubrosAgro.find(r => r.label === d.rubro);
        if (item) item.value += (d.costo * l.calc.ha);
        else rubrosAgro[4].value += (d.costo * l.calc.ha);
      });
    });

    AgroCharts.renderDonut('chart-costos-agro', rubrosAgro, {
      centerTitle: 'Costos Agro',
      centerValue: C.formatMoney(data.costoDirectoAgricola, M)
    });

    // Gráfico Donut Costos Ganadería
    const rubrosGan = (data.ganCalc.desgloseCostosGanaderos || []).map(g => ({
      label: g.rubro,
      value: g.costo,
      color: g.color
    }));

    AgroCharts.renderDonut('chart-costos-gan', rubrosGan, {
      centerTitle: 'Costos Ganadería',
      centerValue: C.formatMoney(data.costoDirectoGanadero, M)
    });

    // Barras apiladas de participación
    AgroCharts.renderStackedBar('bar-part-sup', [
      { label: 'Agricultura', value: data.haAgricola, color: '#2f6b3f' },
      { label: 'Ganadería de Cría', value: data.haGanadera, color: '#c08a1e' }
    ]);

    AgroCharts.renderStackedBar('bar-part-cd', [
      { label: 'Agricultura', value: data.costoDirectoAgricola, color: '#2f6b3f' },
      { label: 'Ganadería de Cría', value: data.costoDirectoGanadero, color: '#c08a1e' }
    ]);

    AgroCharts.renderStackedBar('bar-part-mb', [
      { label: 'Agricultura', value: Math.max(0, data.margenBrutoAgricola), color: '#2f6b3f' },
      { label: 'Ganadería de Cría', value: Math.max(0, data.margenBrutoGanadero), color: '#c08a1e' }
    ]);
  }

  // ==========================================
  // RENDER: CONFIGURACIÓN Y EXPORTACIÓN
  // ==========================================
  renderConfig() {
    const container = document.getElementById('tab-config');
    if (!container) return;

    const cfg = this.state.config;

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Configuración del Establecimiento</h2>
            <p class="panel-subtitle">Personalizá los datos de tu campo en Pampa del Infierno</p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre del Campo / Establecimiento</label>
            <input type="text" value="${cfg.establecimiento}" onchange="window.agroApp.updateConfigField('establecimiento', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Ubicación</label>
            <input type="text" value="${cfg.ubicacion}" onchange="window.agroApp.updateConfigField('ubicacion', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Campaña Agrícola / Ciclo</label>
            <input type="text" value="${cfg.campania}" onchange="window.agroApp.updateConfigField('campania', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">Moneda Principal</label>
            <select onchange="window.agroApp.updateConfigField('moneda', this.value)">
              <option value="USD" ${cfg.moneda === 'USD' ? 'selected' : ''}>Dólares Estadounidenses (USD)</option>
              <option value="ARS" ${cfg.moneda === 'ARS' ? 'selected' : ''}>Pesos Argentinos (ARS)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de Cambio / Dólar Agro (ARS/USD)</label>
            <input type="number" class="num-input" value="${cfg.tipoCambioARS || 1250}" onchange="window.agroApp.updateConfigField('tipoCambioARS', this.value)">
          </div>
        </div>
      </div>

      <!-- Respaldo, Importación y Exportación -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Copia de Seguridad y Exportación</h2>
            <p class="panel-subtitle">Guardá tus datos en un archivo JSON o descargá un informe</p>
          </div>
        </div>

        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="window.agroApp.exportarJSON()">Descargar Copia de Seguridad (.json)</button>
          <label class="btn" style="cursor:pointer;">
            Restaurar Copia (.json)
            <input type="file" accept=".json" style="display:none;" onchange="window.agroApp.importarJSON(event)">
          </label>
          <button class="btn" onclick="window.print()">Imprimir Informe de Gestión</button>
          <button class="btn btn-danger" onclick="window.agroApp.resetToDefaults()">Restablecer Valores de Ejemplo</button>
        </div>
      </div>
    `;
  }

  updateConfigField(field, value) {
    this.state.config[field] = value;
    this.saveState();
    this.render();
  }

  exportarJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AgroChaco_${this.state.config.establecimiento.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Archivo de respaldo descargado');
  }

  importarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.lotes && imported.ganaderia) {
          this.state = imported;
          this.selectedLoteId = this.state.lotes[0]?.id || null;
          this.saveState();
          this.render();
          this.showToast('Datos importados con éxito');
        } else {
          alert('El archivo no posee el formato compatible de AgroChaco.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
  window.agroApp = new AgroApp();
});
