const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-dashboard-secret';

app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Tráfico inusual detectado.',
});

app.use(generalLimiter);

// --- In-Memory Database (Simulation) ---
const db = {
  institutions: [
    {
      id: "inst-1",
      name: "Tech University",
      slug: "tech-university",
      status: "active",
      plan: "Enterprise",
      emissions: 420,
      verifications: 1500,
      createdAt: new Date().toISOString()
    },
    {
      id: "inst-2",
      name: "Escuela de Negocios Global",
      slug: "escuela-negocios",
      status: "active",
      plan: "Startup",
      emissions: 210,
      verifications: 800,
      createdAt: new Date().toISOString()
    }
  ],
  apiKeys: [],
  logs: []
};

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_2FA_SECRET = process.env.ADMIN_2FA_SECRET;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de acceso, intenta más tarde.',
});

function requireAdmin(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  const token = req.cookies && req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Sesión inválida' });
  }
}

app.post('/admin/login', loginLimiter, async (req, res) => {
  const { user, password, token } = req.body || {};

  if (!user || !password || !token) {
    return res.status(400).json({ success: false, message: 'Credenciales incompletas' });
  }

  if (!ADMIN_USER || !ADMIN_PASSWORD_HASH || !ADMIN_2FA_SECRET) {
    return res.status(500).json({ success: false, message: 'Administrador no configurado' });
  }

  if (user !== ADMIN_USER) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }

  const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  const tokenOk = speakeasy.totp.verify({
    secret: ADMIN_2FA_SECRET,
    encoding: 'base32',
    token,
  });

  if (!passwordOk || !tokenOk) {
    return res.status(403).json({ success: false, message: 'Credenciales inválidas' });
  }

  const signed = jwt.sign({ role: 'admin', user: ADMIN_USER }, JWT_SECRET, {
    expiresIn: '2h',
  });

  res.cookie('admin_token', signed, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000,
  });

  return res.json({ success: true, message: 'Acceso concedido' });
});

app.post('/admin/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

app.get('/admin/me', requireAdmin, (req, res) => {
  res.json({ user: req.admin.user, role: req.admin.role });
});

// --- Helper Functions ---

// Generate API Key Logic (as requested)
function generateApiKey(institutionId, name, role, expiresAt) {
  // 1. Generate random secret
  const rawKey = crypto.randomBytes(32).toString('hex');
  const keyPrefix = "ac_live_";
  const fullKey = `${keyPrefix}${rawKey}`;

  // 2. Hash for DB
  const hash = crypto.createHash('sha256').update(fullKey).digest('hex');

  // 3. Create Record
  const newKeyRecord = {
    id: crypto.randomUUID(),
    institutionId,
    name,
    role: role || 'institution_admin',
    keyPrefix,
    keyHash: hash, // In real DB, store this
    status: true, // Active
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    lastUsed: null
  };

  db.apiKeys.push(newKeyRecord);

  return {
    record: newKeyRecord,
    secret: fullKey // Shown ONLY once
  };
}

// --- Endpoints ---

// 1. Dashboard Overview
app.get('/dashboard/overview', (req, res) => {
  const totalEmissions = db.institutions.reduce((acc, inst) => acc + (inst.emissions || 0), 0);
  const totalVerifications = db.institutions.reduce((acc, inst) => acc + (inst.verifications || 0), 0);
  const revokedCount = db.apiKeys.filter(k => !k.status).length;
  const activeInstitutions = db.institutions.filter(i => i.status === 'active').length;

  const countsByDay = {};
  db.logs.forEach(log => {
    const day = log.timestamp.slice(0, 10);
    countsByDay[day] = (countsByDay[day] || 0) + 1;
  });
  const usageSeries = Object.entries(countsByDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, value]) => ({ label: day, value }));

  const byInstitution = db.institutions.map(inst => {
    const institutionLogs = db.logs.filter(l => l.institutionId === inst.id);
    return {
      name: inst.name,
      emissions: inst.emissions,
      plan: inst.plan,
      requests: institutionLogs.length
    };
  });

  res.json({
    totalEmissions,
    totalVerifications,
    revokedCount,
    activeInstitutions,
    hbarBalance: 12500,
    usageSeries,
    byInstitution
  });
});

// 2. Institutions
app.get('/partner/institutions', (req, res) => {
  const data = db.institutions.map(inst => ({
    ...inst,
    activeKeys: db.apiKeys.filter(k => k.institutionId === inst.id && k.status).length
  }));
  res.json(data);
});

app.post('/partner/institutions', (req, res) => {
  const { name, slug, plan } = req.body;
  const newInst = {
    id: crypto.randomUUID(),
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    status: 'active',
    plan: plan || 'Startup',
    emissions: 0,
    verifications: 0,
    createdAt: new Date().toISOString()
  };
  db.institutions.push(newInst);
  res.json(newInst);
});

app.get('/partner/institutions/:id', (req, res) => {
  const inst = db.institutions.find(i => i.id === req.params.id);
  if (!inst) return res.status(404).json({ message: "Institución no encontrada" });
  res.json(inst);
});

// 3. API Keys
app.get('/partner/api-keys', (req, res) => {
  // Return keys without the secret hash, obviously
  // Join with institution name for UI
  const keysWithInstName = db.apiKeys.map(k => {
    const inst = db.institutions.find(i => i.id === k.institutionId);
    return {
      ...k,
      institutionName: inst ? inst.name : 'Unknown',
      keyHash: undefined // Hide hash
    };
  });
  res.json(keysWithInstName);
});

// Create API Key for Institution
app.post('/partner/institutions/:id/generate-key', (req, res) => {
  const { id } = req.params;
  const { name, role, expiresAt } = req.body;
  
  const inst = db.institutions.find(i => i.id === id);
  if (!inst) return res.status(404).json({ message: "Institución no encontrada" });

  const result = generateApiKey(id, name, role, expiresAt);

  res.json({
    ...result.record,
    apiKey: result.secret, // Important: Send secret here
    institutionName: inst.name
  });
});

// Revoke API Key
app.delete('/partner/api-keys/:id', (req, res) => {
  const { id } = req.params;
  const keyIndex = db.apiKeys.findIndex(k => k.id === id);
  
  if (keyIndex === -1) return res.status(404).json({ message: "Llave no encontrada" });
  
  // Hard delete or Soft delete? User said "Revocación", usually soft delete (status = false) or delete.
  // But user also said "Dejará de funcionar inmediatamente".
  // Let's remove it for now to match frontend "filter" logic, or just mark inactive.
  // Frontend does: setRows(rows.filter(r => r.id !== keyId)); so it expects it gone from list.
  
  db.apiKeys.splice(keyIndex, 1); // Removing completely for "Revocation" in this demo context
  
  res.json({ success: true, message: "Llave revocada y eliminada" });
});

app.get('/partner/logs', (req, res) => {
  const result = db.logs
    .slice()
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .map(log => {
      const inst = db.institutions.find(i => i.id === log.institutionId);
      return {
        ...log,
        institutionName: inst ? inst.name : null
      };
    });
  res.json(result);
});

app.post('/api/validate', (req, res) => {
  const { hash, endpoint } = req.body || {};
  if (!hash) {
    return res.status(400).json({ valid: false, message: "Hash requerido" });
  }

  const key = db.apiKeys.find(k => k.keyHash === hash && k.status);
  const now = new Date().toISOString();

  if (key) {
    // Check expiration if exists
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
       return res.json({ valid: false, message: "Llave expirada" });
    }

    key.lastUsed = now;
    const logEntry = {
      id: crypto.randomUUID(),
      institutionId: key.institutionId,
      endpoint: endpoint || "",
      status: "success",
      timestamp: now
    };
    db.logs.push(logEntry);

    const inst = db.institutions.find(i => i.id === key.institutionId);

    // Increment emissions if it's an emission endpoint (simulation)
    if (endpoint && endpoint.includes('emissions') && inst) {
      inst.emissions = (inst.emissions || 0) + 1;
    }

    return res.json({
      valid: true,
      institution: inst ? inst.name : null
    });
  }

  const failedLog = {
    id: crypto.randomUUID(),
    institutionId: null,
    endpoint: endpoint || "",
    status: "failed",
    timestamp: now
  };
  db.logs.push(failedLog);

  res.json({ valid: false });
});

app.listen(PORT, () => {
  console.log(`✅ Dashboard Backend corriendo en http://localhost:${PORT}`);
  console.log(`   - Institutions: ${db.institutions.length}`);
  console.log(`   - API Keys: ${db.apiKeys.length}`);
});
