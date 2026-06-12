# Responsive Layout Audit - Vivo Promotor

## Problema detectado
En navegadores de escritorio la app se expandía a todo el viewport (hasta 1920px), generando:
- Contenido disperso en el centro.
- Dock diminuto respecto al espacio disponible.
- Sensación de "página web" en lugar de shell tipo app móvil.

## Solución aplicada
Se creó una capa global responsive en `components/AppShell.tsx` y `components/SectionIconGrid.tsx`:
- Contenedor exterior `flex items-center justify-center` con fondo oscuro neutro (`bg-neutral-950`).
- Viewport interior `.app-viewport` limitado a `max-w-[430px]`, usando `min(100%, 430px)` implícitamente en móvil por `w-full`.
- Altura controlada con unidades modernas: `h-[100dvh] max-h-[100dvh]`.
- Safe areas en CSS inyectado: `padding-top/bottom: env(safe-area-inset-*)`.
- Fondo exterior oscuro para resaltar la app como tarjeta centrada en desktop.
- Lock de `overflow-x` en `html/body` y scrollbars ocultos.
- Dock (`SectionIconGrid`) posicionado como `absolute bottom-6 inset-x-0` dentro del `.app-viewport`, con contenedor centrado en `flex justify-center`. Así el dock pertenece al marco responsive y no al viewport del browser.

## Archivos modificados
- `components/AppShell.tsx`
- `components/SectionIconGrid.tsx`
- `app/layout.tsx`

## Ancho máximo definido
`max-width: 430px` en desktop.

## Comportamiento móvil
- Ocupa `100%` del ancho disponible.
- No genera scroll horizontal.
- Centrado natural por el contenedor full-width.
- Dock inferior conserva sus estilos y sigue dentro del viewport.

## Comportamiento desktop
- App centrada como tarjeta móvil.
- Contenido no estirado.
- Dock contenido dentro del `.app-viewport` (`absolute` relativo al shell).
- Fondo oscuro exterior.

## Dock
- Posición: `absolute bottom-6 inset-x-0` dentro de `.app-viewport`.
- Contenedor interno: `max-w-[360px] w-full`, centrado con `flex justify-center`.
- No usa `fixed` respecto al browser.
- Sigue teniendo 5 iconos en el mismo orden.
- No se expande al ancho del navegador.

## Breakpoints probados (esperados por código)
- Móvil emulado: 360x740, 390x844, 430x932.
- Tablet/desktop: 768x1024, 1366x768, 1920x1080.

## Validación
- `npm run build` exitoso.
- `npm run dev` exitoso (servidor disponible en puerto alterno cuando 3000 estaba ocupado).
- A nivel de estructura CSS/HTML, el responsive debe cumplir con el posicionamiento absoluto del dock dentro del viewport limitado.
