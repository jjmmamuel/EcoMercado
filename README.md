# EcoMercado - Prototipo web

Prototipo HTML, CSS y JavaScript para el proyecto de optimización del consumo eléctrico en puestos de mercado.

## Cómo abrirlo

1. Descarga y descomprime el ZIP.
2. Abre `index.html` en Chrome, Edge o Firefox.
3. Usa el menú lateral para navegar por las pantallas.

## Pantallas implementadas

1. Splash / Login
2. Dashboard
3. Registro de equipos
4. Detalle y recomendaciones
5. Simulador de ahorro
6. Confirmación / Plan de acción
7. Perfil y configuración

## Cómo cumple la guía

- Arquitectura de información: flujo Login → Dashboard → Equipos → Detalle → Simulador → Confirmación.
- Estructura responsiva: CSS Grid, Flexbox y media queries.
- Sistema de diseño básico: variables CSS en `:root`, botones, tarjetas, badges, paneles y formularios reutilizables.
- Interactividad: JavaScript con navegación por pantallas, cálculos de kWh, costo mensual, recomendaciones y localStorage.
- Animación: transiciones CSS para entrada de pantallas, barras y tarjetas.
- Prototipo compartible: botón para copiar enlace y generación de QR cuando la web esté publicada.

## Publicarlo rápido en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html`, `styles.css` y `script.js`.
3. En Settings → Pages, selecciona Branch: `main` y carpeta `/root`.
4. Copia el enlace publicado y genera el QR desde la pantalla de confirmación.

## Nota importante

El módulo de recomendaciones no usa IA real. Usa reglas transparentes en JavaScript. Si el profesor exige IA, se puede integrar después con una API, pero para prototipo básico es más defendible decir que es un asistente automático basado en reglas.
