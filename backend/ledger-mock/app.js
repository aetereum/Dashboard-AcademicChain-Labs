const express = require('express');
const { validateDashboardKey } = require('./src/middlewares/auth');

const app = express();
const PORT = 3002; // Corriendo en puerto diferente al Dashboard (3001)

app.use(express.json());

// Simulación de router de emisiones
const emissionsRouter = express.Router();

emissionsRouter.post('/create', (req, res) => {
    // Aquí iría la lógica real de crear una emisión en el Ledger
    res.json({
        success: true,
        message: `Emisión registrada exitosamente para ${req.institution}`,
        txId: "0.0.123456"
    });
});

// Todas las rutas de emisiones ahora requieren una llave válida administrada desde el Dashboard 
app.use('/api/emissions', validateDashboardKey, emissionsRouter);

app.listen(PORT, () => {
    console.log(`🔒 Ledger (Mock) corriendo en http://localhost:${PORT}`);
    console.log(`   - Validando llaves contra: ${process.env.DASHBOARD_API_URL || 'http://localhost:3001'}`);
});
