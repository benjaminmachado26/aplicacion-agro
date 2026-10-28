/**
 * AgroChaco Manager - Motor Gráfico Ligero y Autónomo (SVG + Canvas)
 * Funciona 100% offline sin librerías externas ni dependencias
 */

const AgroCharts = {
  // Renderizar Gráfico de Donut / Torta en SVG interactivo
  renderDonut(containerId, items = [], options = {}) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    const total = items.reduce((acc, curr) => acc + (curr.value || 0), 0);
    if (total <= 0) {
      container.innerHTML = `<div class="empty-chart">Sin datos registrados para graficar</div>`;
      return;
    }

    const size = options.size || 240;
    const strokeWidth = options.strokeWidth || 38;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPct = 0;
    let paths = '';

    items.forEach((item, idx) => {
      const val = item.value || 0;
      if (val <= 0) return;
      const pct = val / total;
      const strokeDasharray = `${pct * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedPct * circumference;
      const color = item.color || this.getPaletteColor(idx);

      paths += `
        <circle 
          cx="${center}" 
          cy="${center}" 
          r="${radius}" 
          fill="none" 
          stroke="${color}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${strokeDasharray}" 
          stroke-dashoffset="${strokeDashoffset}"
          class="donut-segment"
          data-label="${item.label}"
          data-value="${val}"
          data-pct="${(pct * 100).toFixed(1)}"
          style="transition: stroke-width 0.2s, opacity 0.2s; cursor: pointer;"
        />
      `;
      accumulatedPct += pct;
    });

    const titleCenter = options.centerTitle || 'Total';
    const valueCenter = options.centerValue || `$ ${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

    const svg = `
      <div class="donut-chart-wrapper" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); overflow: visible;">
            ${paths}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">${titleCenter}</span>
            <span style="font-size: 17px; font-weight: 700; color: var(--text-main); font-family: var(--font-mono);">${valueCenter}</span>
          </div>
        </div>
        <div class="chart-legend" style="margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px 14px; justify-content: center; font-size: 12px;">
          ${items.filter(i => (i.value || 0) > 0).map((item, idx) => {
            const color = item.color || this.getPaletteColor(idx);
            const pct = ((item.value / total) * 100).toFixed(1);
            return `
              <div class="legend-item" style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 3px; background-color: ${color}; display: inline-block;"></span>
                <span style="color: var(--text-muted);">${item.label}:</span>
                <strong style="color: var(--text-main); font-family: var(--font-mono);">${pct}%</strong>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.innerHTML = svg;
    this.attachDonutTooltips(container);
  },

  attachDonutTooltips(container) {
    const segments = container.querySelectorAll('.donut-segment');
    segments.forEach(seg => {
      seg.addEventListener('mouseenter', () => {
        seg.style.strokeWidth = '44';
        seg.style.opacity = '0.9';
      });
      seg.addEventListener('mouseleave', () => {
        seg.style.strokeWidth = '38';
        seg.style.opacity = '1';
      });
    });
  },

  // Renderizar Gráfico de Barras Comparativo (Horizontal o Vertical)
  renderBarChart(containerId, items = [], options = {}) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="empty-chart">Sin datos para comparar</div>`;
      return;
    }

    const unit = options.unit || 'USD/ha';
    const values = items.map(i => i.value || 0);
    const maxVal = Math.max(...values.map(v => Math.abs(v)), 1);

    const html = `
      <div class="bar-chart-container" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
        ${items.map((item, idx) => {
          const val = item.value || 0;
          const isPositive = val >= 0;
          const widthPct = Math.min(100, Math.max(2, (Math.abs(val) / maxVal) * 100));
          const color = item.color || (isPositive ? 'var(--color-primary)' : 'var(--color-danger)');

          return `
            <div class="bar-item" style="display: grid; grid-template-columns: 140px 1fr 100px; align-items: center; gap: 12px; font-size: 13px;">
              <div style="font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.label}">
                ${item.label}
              </div>
              <div style="position: relative; height: 24px; background: var(--bg-surface-sunk); border-radius: 4px; overflow: hidden; display: flex; align-items: center;">
                <div style="
                  height: 100%; 
                  width: ${widthPct}%; 
                  background-color: ${color}; 
                  border-radius: 4px; 
                  transition: width 0.5s ease-out;
                  display: flex; 
                  align-items: center; 
                  justify-content: flex-end; 
                  padding-right: 8px;
                ">
                </div>
              </div>
              <div style="text-align: right; font-family: var(--font-mono); font-weight: 600; color: ${isPositive ? 'var(--text-main)' : 'var(--color-danger)'};">
                ${val.toLocaleString('es-AR', { maximumFractionDigits: 1 })} <small style="font-weight: 400; color: var(--text-muted);">${unit}</small>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  // Barra de progreso apilada (Stacked 100%)
  renderStackedBar(containerId, items = [], options = {}) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    const total = items.reduce((acc, curr) => acc + (curr.value || 0), 0);
    if (total <= 0) {
      container.innerHTML = `<div class="empty-chart">Sin datos registrados</div>`;
      return;
    }

    const html = `
      <div style="width: 100%;">
        <div style="display: flex; height: 18px; border-radius: 6px; overflow: hidden; background: var(--bg-surface-sunk); box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);">
          ${items.map((item, idx) => {
            const val = item.value || 0;
            if (val <= 0) return '';
            const pct = (val / total) * 100;
            const color = item.color || this.getPaletteColor(idx);
            return `<div style="height: 100%; width: ${pct}%; background-color: ${color};" title="${item.label}: ${pct.toFixed(1)}%"></div>`;
          }).join('')}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 8px; font-size: 12px;">
          ${items.map((item, idx) => {
            const val = item.value || 0;
            if (val <= 0) return '';
            const pct = (val / total) * 100;
            const color = item.color || this.getPaletteColor(idx);
            return `
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: ${color}; display: inline-block;"></span>
                <span style="color: var(--text-muted);">${item.label}</span>
                <strong style="color: var(--text-main); font-family: var(--font-mono);">${pct.toFixed(1)}%</strong>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  // Tarjetas de Indicadores Físicos Ganaderos vs Metas
  renderBenchmarkGauge(containerId, data = []) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    const html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; width: 100%;">
        ${data.map(item => {
          const val = item.actual || 0;
          const meta = item.meta || 0;
          const diff = val - meta;
          const isGood = item.inverso ? (val <= meta) : (val >= meta);
          const statusClass = isGood ? 'good' : (Math.abs(diff) < 5 ? 'warn' : 'bad');
          const statusColor = isGood ? '#22c55e' : (Math.abs(diff) < 5 ? '#eab308' : '#ef4444');
          const pctWidth = Math.min(100, Math.max(0, val));

          return `
            <div class="benchmark-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">${item.label}</span>
                <span class="badge ${statusClass}" style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                  ${isGood ? 'Óptimo' : 'A Mejorar'}
                </span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 6px;">
                <span style="font-size: 26px; font-weight: 700; font-family: var(--font-mono); color: var(--text-main);">${val.toFixed(1)}${item.unit || '%'}</span>
                <span style="font-size: 11px; color: var(--text-muted);">Meta: ${meta}${item.unit || '%'}</span>
              </div>
              <div style="position: relative; height: 8px; background: var(--bg-surface-sunk); border-radius: 4px; overflow: hidden; margin-top: 4px;">
                <div style="height: 100%; width: ${pctWidth}%; background-color: ${statusColor}; border-radius: 4px;"></div>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">
                ${item.description || ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  getPaletteColor(idx) {
    const palette = [
      '#2f6b3f', // Verde agro
      '#c08a1e', // Trigo dorado
      '#3b82f6', // Azul cielo
      '#8b5cf6', // Violeta
      '#ec4899', // Rosa
      '#f97316', // Naranja
      '#06b6d4', // Cyan
      '#10b981', // Esmeralda
      '#eab308', // Amarillo
      '#64748b'  // Gris neutro
    ];
    return palette[idx % palette.length];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgroCharts;
}
