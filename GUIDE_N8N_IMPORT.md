# Guía: Cómo importar tu Backend en n8n

He creado un flujo de trabajo completo que simula todo el backend de AcademicChain dentro de n8n.
Sigue estos pasos para activarlo.

## 1. Importar el Flujo

1. Abre tu dashboard de n8n.
2. Ve a **Workflows** -> **Add Workflow**.
3. Haz clic en el menú de tres puntos (arriba a la derecha) -> **Import from File**.
4. Selecciona el archivo `n8n_backend_workflow.json` que está en la carpeta de este proyecto.

## 2. Configurar la URL en Vercel

Una vez importado el flujo:

1. Haz doble clic en el nodo **Webhook**.
2. Copia la **Production URL** (ej. `https://tu-n8n.com/webhook/uuid...`).
3. Ve a tu proyecto en **Vercel**.
4. Entra en **Settings** -> **Environment Variables**.
5. Edita (o crea) la variable `VITE_API_BASE_URL`.
6. Pega la URL de tu Webhook.
7. **Redesplegar** tu frontend en Vercel para que los cambios surtan efecto.

## 3. ¿Qué incluye este flujo?

Este flujo maneja automáticamente las siguientes rutas:

- `/dashboard/overview`: Datos generales del dashboard.
- `/partner/institutions`: Lista de universidades.
- `/partner/institutions/:id/credentials`: Credenciales por universidad.
- `/dashboard/wallet`: Billetera principal (HBAR).
- `/partner/crypto/transactions`: **Nuevo!** Registro de criptomonedas y tokens.

## Nota sobre la API Key

Has proporcionado una API Key de n8n. Si deseas usarla para proteger este webhook:
1. En el nodo Webhook, cambia "Authentication" a "Header Auth".
2. Configura el nombre del header como `X-API-Key`.
3. Configura la credencial con tu clave.

Por defecto, el flujo está abierto para facilitar la conexión inicial.
