# Dashboard AcademicChain Labs

Plataforma administrativa avanzada para la gestión, emisión y verificación de credenciales académicas utilizando tecnología blockchain. Este dashboard permite a las instituciones educativas y administradores gestionar todo el ciclo de vida de los certificados digitales de manera segura y transparente.

## 🚀 Características Principales

### 🏛️ Gestión de Instituciones
- **Panel de Control:** Vista detallada de estadísticas por universidad.
- **Métricas:** Seguimiento de emisiones, verificaciones y revocaciones en tiempo real.
- **Gestión de Créditos:** Visualización y recarga de créditos para emisiones.

### 🎓 Emisión de Credenciales
- **Certificados Digitales:** Emisión segura de diplomas y títulos en blockchain.
- **Revocación:** Capacidad de revocar credenciales comprometidas o erróneas.
- **Logs de Auditoría:** Registro inmutable de todas las acciones realizadas.

### 💰 Billetera Cripto (Crypto Wallet)
- **Gestión de Tokens:** Monitoreo de saldo de tokens y créditos.
- **Historial de Transacciones:** Registro detallado de ingresos (depósitos) y egresos (gastos por emisión).
- **Integración Transparente:** Conexión directa con la lógica financiera del backend.

### ⚙️ Backend Flexible con n8n
- **Arquitectura Low-Code:** Backend migrado a flujos de trabajo de n8n para máxima flexibilidad y fácil mantenimiento.
- **Rutas Dinámicas:** Manejo inteligente de peticiones API a través de webhooks.
- **Escalabilidad:** Fácil integración con bases de datos (MongoDB) y servicios externos.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React + Vite
- **Estilos:** Tailwind CSS + Lucide React (Iconos)
- **Estado:** React Context API
- **Backend / API:** n8n (Workflow Automation)
- **Despliegue:** Vercel

## 📦 Instalación y Configuración Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Aether-Connect-Labs/Dashboard-AcademicChain-Labs.git
    cd Dashboard-AcademicChain-Labs
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crear un archivo `.env` (opcional si usas la configuración por defecto) o configurar directamente en el código/Vercel:
    ```env
    VITE_API_BASE_URL=https://tu-instancia-n8n.com/webhook/academic-api
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

## 🌐 Integración con n8n

El backend de este proyecto funciona mediante un flujo de trabajo de n8n.
Para configurar tu propio backend:

1.  Revisa el archivo `GUIDE_N8N_IMPORT.md` incluido en este repositorio.
2.  Importa el archivo `n8n_backend_workflow.json` en tu instancia de n8n.
3.  Activa el workflow y actualiza la URL en el frontend.

## 🚀 Despliegue en Vercel

El proyecto está optimizado para Vercel.
- El archivo `vercel.json` maneja las reescrituras necesarias para la SPA (Single Page Application).
- Asegúrate de configurar la variable de entorno `VITE_API_BASE_URL` en el panel de Vercel si tu n8n cambia de dirección.

---
Desarrollado para **AcademicChain Labs**.
