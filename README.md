# Iglesia Live Overlay Studio

Aplicación web local para transmisiones en vivo en OBS con:

- Etiqueta de nombre (lower third)
- Fecha/hora
- Barra de anuncios
- Logo
- Alertas centrales
- Lista de nombres en standby
- Función oculta para volver al panel desde la salida

## Cómo ejecutar

```bash
python3 -m http.server 8080
```

Abre:

- Panel + vista previa: `http://localhost:8080/index.html`
- Salida limpia para OBS: `http://localhost:8080/output.html`

En OBS, agrega una fuente **Browser Source** con `http://localhost:8080/output.html`.

## Función oculta

En `output.html`, para mostrar el botón oculto de regreso al panel:

- Escribe `panel` en el teclado, **o**
- Usa `Ctrl + Alt + P`

Luego haz clic en el botón discreto en la esquina superior derecha.
