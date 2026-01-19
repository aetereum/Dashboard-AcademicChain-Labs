const axios = require('axios'); 
const crypto = require('crypto'); 

const validateDashboardKey = async (req, res, next) => { 
    const apiKey = req.headers['x-api-key']; 

    if (!apiKey) { 
        return res.status(401).json({ message: "No se proporcionó API Key" }); 
    } 

    try { 
        // Hasheamos la llave para no enviarla en texto plano por internet 
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex'); 

        // Consultamos al Backend del Dashboard en Render 
        const dashboardUrl = process.env.DASHBOARD_API_URL || 'http://localhost:3001';
        
        const response = await axios.post(`${dashboardUrl}/api/validate`, { 
            hash: keyHash, 
            endpoint: req.originalUrl 
        }); 

        if (response.data.valid) { 
            req.institution = response.data.institution; // Guardamos el nombre de la institución
            // Opcional: mostrar créditos restantes en logs del ledger
            if (response.data.remainingCredits !== undefined) {
                console.log(`[Guardian] Créditos restantes para ${req.institution}: ${response.data.remainingCredits}`);
            }
            next(); 
        } else { 
            // Manejo de error específico por créditos
            if (response.data.message && response.data.message.includes('Créditos')) {
                 return res.status(402).json({ message: response.data.message }); // 402 Payment Required
            }
            res.status(403).json({ message: "API Key inválida o revocada" }); 
        } 
    } catch (error) { 
        console.error("Error validando llave:", error.message); 
        res.status(500).json({ message: "Error en el sistema de validación" }); 
    } 
}; 

module.exports = { validateDashboardKey }; 
