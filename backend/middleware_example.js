const axios = require('axios');
const crypto = require('crypto');

// URL del Dashboard en Render (o local si estás desarrollando)
// En producción, usa variables de entorno: process.env.DASHBOARD_API_URL
const DASHBOARD_URL = process.env.DASHBOARD_API_URL || 'http://localhost:3001';

const validateDashboardKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: "No se proporcionó API Key" });
    }

    try {
        // Hasheamos la llave para no enviarla en texto plano por internet
        // NOTA: El dashboard espera el hash SHA-256 de la llave completa (ac_live_...)
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Consultamos al Backend del Dashboard en Render
        const response = await axios.post(`${DASHBOARD_URL}/api/validate`, {
            hash: keyHash,
            endpoint: req.originalUrl
        });

        if (response.data.valid) {
            req.institution = response.data.institution; // Guardamos el nombre de la institución
            console.log(`[Guardian] Acceso autorizado para: ${req.institution}`);
            next();
        } else {
            console.warn(`[Guardian] Acceso denegado: Llave inválida o expirada`);
            res.status(403).json({ message: "API Key inválida o revocada" });
        }
    } catch (error) {
        console.error("Error validando llave con Dashboard:", error.message);
        res.status(500).json({ message: "Error en el sistema de validación centralizado" });
    }
};

module.exports = { validateDashboardKey };
