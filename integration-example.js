// ------------------------------------------------------------------
// EJEMPLO DE INTEGRACIÓN: CÓMO CONECTAR TU PROYECTO AL DASHBOARD
// ------------------------------------------------------------------
//
// 1. Instala axios en tu proyecto: npm install axios
// 2. Copia este código en tu backend (donde vayas a emitir certificados)

const axios = require('axios');
const crypto = require('crypto');

// URL de tu Dashboard en Render
const DASHBOARD_URL = 'https://dashboard-academicchain-labs.onrender.com';

/**
 * Función para pedir permiso al Dashboard antes de realizar una acción (ej. emitir título)
 * @param {string} myApiKey - Tu llave de institución (ej. acp_8ba2...)
 * @returns {Promise<boolean>} - true si tienes permiso y créditos, false si no.
 */
async function solicitarPermisoDeEmision(myApiKey) {
    console.log('📡 Conectando con Dashboard en:', DASHBOARD_URL);

    try {
        // 1. Hasheamos la llave por seguridad (nunca enviar la original)
        const keyHash = crypto.createHash('sha256').update(myApiKey).digest('hex');

        // 2. Preguntamos al Dashboard
        const response = await axios.post(`${DASHBOARD_URL}/api/validate`, {
            hash: keyHash,
            endpoint: '/api/v1/emissions/mint' // Opcional: indica qué acción intentas hacer
        });

        // 3. Verificamos la respuesta
        if (response.data.valid) {
            console.log('✅ PERMISO CONCEDIDO');
            console.log(`   Institución: ${response.data.institution}`);
            console.log(`   Créditos restantes: ${response.data.remainingCredits}`);
            return true;
        } else {
            console.log('❌ PERMISO DENEGADO');
            console.log(`   Razón: ${response.data.message}`);
            return false;
        }

    } catch (error) {
        console.error('⚠️ Error de conexión con el Dashboard:', error.message);
        return false;
    }
}

// --- EJEMPLO DE USO ---

// Tu llave de prueba (Sequential Test Uni)
const MI_LLAVE = 'acp_8ba28e18_5968e84e0579411bbae50897f9c4d447';

async function main() {
    console.log("🎓 Iniciando proceso de emisión en TU PROYECTO...");
    
    const tengoPermiso = await solicitarPermisoDeEmision(MI_LLAVE);

    if (tengoPermiso) {
        console.log("🚀 Procediendo a emitir certificado en la Blockchain...");
        // AQUÍ VA TU LÓGICA DE EMISIÓN REAL
    } else {
        console.log("⛔ Proceso detenido: No tienes créditos o la llave es inválida.");
    }
}

main();
