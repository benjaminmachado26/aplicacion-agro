# 🌾 AgroChaco Manager

**Aplicación de Gestión Económica y Rentabilidad Integral Agropecuaria**  
*Diseñada y parametrizada específicamente para la región de Pampa del Infierno, Chaco, Argentina.*

---

## 📌 Descripción

AgroChaco Manager es una solución ágil y moderna creada para que los productores agropecuarios puedan calcular, analizar y visualizar en tiempo real los indicadores económicos y productivos clave de su establecimiento, sin perder tiempo en planillas complejas.

La aplicación separa de forma clara la actividad **Agrícola** (cultivos extensivos) de la **Ganadería de Cría**, consolidando ambos resultados en un **Tablero General** para evaluar la rentabilidad real de la empresa agropecuaria.

---

## 🚀 Características Principales

### 🌾 1. Módulo Agrícola (Cultivos Extensivos)
- **Cultivos soportados**: Soja (1ra y 2da), Maíz Tardío, Girasol, Trigo y Sorgo Granífero.
- **Gestión por lotes y superficies (ha)**.
- **Costos directos detallados**:
  - Insumos: semillas, curasemillas/inoculantes, fertilizantes (MAP, Urea), herbicidas (Glifosato, 2,4-D, Atrazina), insecticidas, fungicidas y coadyuvantes.
  - Labores agrícolas: barbechos químicos, siembra directa, fertilización y aplicaciones terrestres.
  - Cosecha: porcentaje sobre el ingreso bruto (%) o costo fijo por hectárea.
  - Fletes y comercialización: impacto del flete desde Chaco al Gran Rosario / acopios.
- **Índices económicos y márgenes**:
  - **Margen Bruto Total** y **Margen Bruto por Hectárea (USD/ha o ARS/ha)**.
  - **Margen Bruto / Costo Directo (MB/CD)**: retorno por cada peso/dólar invertido en costos directos.
  - **Rendimiento de Indiferencia (qq/ha)**: rinde de equilibrio para cubrir costos.
  - **Precio de Indiferencia (USD/t)**: precio mínimo de venta para cubrir costos.
  - **Margen de Seguridad (%)**.
  - **Matriz de Sensibilidad**: simulaciones automáticas de variaciones de $\pm 10\%$ y $\pm 20\%$ en rendimientos y precios.

---

### 🐂 2. Módulo Ganadero (Cría Bovina)
- **Superficie asignada (ha)**: pasturas implantadas (*Gatton Panic*), gramas y monte natural chaqueño.
- **Inventario de hacienda y categorías**:
  - Vacas madre (vientres entorados), Toros, Terneros machos, Terneras hembras, Vaquillonas de reposición y servicio.
  - Cálculo de **Carga Animal (Cabezas/ha)** y conversión a **Equivalente Vaca (EV/ha)**.
- **Índices de productividad física**:
  - **% de Preñez** (tacto rectal sobre vientres entorados).
  - **% de Parición** (terneros nacidos sobre vientres entorados).
  - **% de Destete** (terneros destetados sobre vientres entorados).
  - **Mermas reproductivas**: tacto-parición y parición-destete.
  - **% de Mortandad** total del rodeo.
  - **Semáforo de Benchmarking** frente a estándares zonales (INTA / CREA).
- **Producción de carne**:
  - **Kg de carne producidos por hectárea (kg/ha)**.
- **Económico ganadero**:
  - Ingresos por venta de terneros destetados, terneras excedentes y vacas/toros de refugo.
  - Costos directos ganaderos: sanidad (vacunas aftosa, carbunclo, reproductivas), suplementación (sales minerales con fósforo, rollos), pasturas (rolado/mantenimiento), personal y mantenimiento de instalaciones (aguadas, molinos, alambrados).
  - **Margen Bruto Ganadero Total** y **por Hectárea**.
  - **Margen Bruto por Kg Producido** y **Costo Directo por Kg**.
  - **Precio de Indiferencia del Ternero** ($/kg o USD/kg).

---

### 🏢 3. Tablero Consolidado (Empresa Agropecuaria)
- **Margen Bruto Total de la empresa** (Agricultura + Ganadería).
- **Margen Bruto Medio Ponderado por Hectárea**.
- **Retorno Global sobre Costos Directos**.
- **Participación relativa**: gráficos interactivos de ocupación de superficie, inversión en costos directos y generación de margen bruto por actividad.
- **Comparativa de MB/ha** entre todos los cultivos y la ganadería.

---

## 🛠️ Tecnologías y Funcionamiento

- **100% Offline**: Funciona en cualquier dispositivo (computadora, tablet o celular) sin necesidad de conexión a internet ni instalación de servidores.
- **Persistencia Local**: Guarda automáticamente todos los cambios en el navegador (`LocalStorage`).
- **Exportación e Importación**: Permite descargar y restaurar copias de seguridad en formato `.json`.
- **Impresión / Reporte PDF**: Estilos optimizados para exportar a PDF con calidad ejecutiva para bancos o socios.
- **Multi-moneda**: Soporte tanto para **USD** (dólares) como **ARS** (pesos argentinos).

---

## 📂 Cómo Ejecutar

1. Clona el repositorio o descarga el archivo `.zip`:
   ```bash
   git clone https://github.com/benjaminmachado26/aplicacion-agro.git
   ```
2. Abre el archivo `index.html` en cualquier navegador web (Google Chrome, Microsoft Edge, Firefox, Safari).
3. ¡Listo! La aplicación viene con datos iniciales precargados para Pampa del Infierno para que puedas explorar todas sus funcionalidades inmediatamente.

---

Desarrollado para optimizar la toma de decisiones económicas y agronómicas en el Chaco argentino.
