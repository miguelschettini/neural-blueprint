import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import https from "https";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Local imports
import db from "./src/db.js";
import { authMiddleware } from "./src/middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "neural-blueprint-jwt-secret-2026";
const CERT_PATH = path.join(__dirname, "cert.p12");

// Email Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/["']/g, "").trim(),
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  // Force IPv4 to avoid ENETUNREACH errors on some networks (like Render)
  // @ts-ignore
  family: 4
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("[SMTP] Connection Error:", error);
  } else {
    console.log("[SMTP] Server is ready to take our messages");
  }
});

// Helper: Get Efí Agent
function getEfiAgent() {
  const certBuffer = fs.readFileSync(CERT_PATH);
  const isPem = certBuffer.toString().includes("-----BEGIN CERTIFICATE-----");
  const agentOptions: any = { passphrase: "" };
  if (isPem) {
    agentOptions.cert = certBuffer;
    agentOptions.key = certBuffer;
  } else {
    agentOptions.pfx = certBuffer;
  }
  return new https.Agent(agentOptions);
}

// Helper: Get Efí Access Token
async function getAccessToken() {
  const isSandbox = process.env.EFI_SANDBOX === "true";
  const authBaseUrl = isSandbox 
    ? "https://api-pix-h.gerencianet.com.br" 
    : "https://api-pix.gerencianet.com.br";
  
  const credentials = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios({
    method: "post",
    url: `${authBaseUrl}/oauth/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    httpsAgent: getEfiAgent(),
    data: { grant_type: "client_credentials" },
  });

  return response.data.access_token;
}

// Verify environment variables on startup
console.log("[ENV] Verificando variáveis de ambiente...");
console.log("- EFI_CLIENT_ID:", process.env.EFI_CLIENT_ID ? "Configurado" : "AUSENTE");
console.log("- EFI_PIX_KEY:", process.env.EFI_PIX_KEY ? "Configurado" : "AUSENTE");
console.log("- SMTP_USER:", process.env.SMTP_USER ? "Configurado" : "AUSENTE");
console.log("- SMTP_PASS:", process.env.SMTP_PASS ? "Configurado" : "AUSENTE");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Configurado" : "AUSENTE (Usando padrão)");

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(authMiddleware);

  // Write certificate from base64 if provided
  if (process.env.EFI_CERTIFICATE_BASE64 && !fs.existsSync(CERT_PATH)) {
    try {
      const certBuffer = Buffer.from(process.env.EFI_CERTIFICATE_BASE64, "base64");
      fs.writeFileSync(CERT_PATH, certBuffer);
      console.log("Certificate file written successfully.");
    } catch (e) {
      console.error("Error writing certificate file:", e);
    }
  }

  // --- Auth Routes ---
  app.post("/api/auth/send-code", async (req, res) => {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ error: "Email é obrigatório." });

    if (type === 'reset') {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado com este e-mail." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      console.log(`[AUTH] Solicitando código para: ${email}`);
      db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);
      db.prepare("INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)")
        .run(email, code, expiresAt.toISOString());

      console.log(`[AUTH] Código gerado: ${code}`);

      if (process.env.SMTP_USER) {
        console.log(`[SMTP] Tentando enviar e-mail para ${email}...`);
        const emailHtml = `
          <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <div style="margin-bottom: 40px;">
                <h1 style="color: #00FF00; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; margin: 0;">Neural Blueprint</h1>
                <p style="color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">Sua jornada para o próximo nível começa aqui</p>
              </div>
              
              <div style="background-color: #141414; border: 1px solid rgba(255,255,255,0.05); padding: 40px 20px; border-radius: 12px; margin: 0 auto; max-width: 400px;">
                <p style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">
                  ${type === 'reset' ? 'Recuperação de Senha' : 'Seu código de verificação'}
                </p>
                <div style="background-color: #000000; border: 1px dashed #00FF00; padding: 20px 10px; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
                  <span style="font-size: 42px; font-weight: bold; color: #00FF00; letter-spacing: 6px; margin: 0; line-height: 1; font-family: 'Courier New', Courier, monospace; white-space: nowrap; display: block;">${code}</span>
                </div>
                <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 30px;">Copie o código acima e cole na tela do site.</p>
                
                <a href="${process.env.APP_URL || '#'}" style="display: inline-block; background-color: #00FF00; color: #000000; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Voltar para o Site</a>
              </div>
              
              <div style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px;">
                <p style="font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.6; margin: 0;">
                  Se você não solicitou este código, por favor ignore este e-mail.<br>
                  Neural Blueprint &copy; ${new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Neural Blueprint" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `${code} é o seu código de verificação`,
          html: emailHtml,
        });
        console.log(`[SMTP] E-mail enviado com sucesso para ${email}`);
      } else {
        console.warn("[SMTP] SMTP_USER não configurado. E-mail não enviado.");
        return res.status(400).json({ error: "Serviço de e-mail não configurado no servidor." });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("[AUTH] Erro ao enviar código:", error);
      res.status(500).json({ error: `Erro ao enviar código: ${error.message}` });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
      const verification = db.prepare("SELECT * FROM verification_codes WHERE email = ? AND code = ?").get(email, code) as any;
      if (!verification || new Date(verification.expires_at) < new Date()) {
        return res.status(400).json({ error: "Código inválido ou expirado." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hashedPassword, email);
      db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao redefinir senha." });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    const { email, password, fullName, code } = req.body;
    try {
      const verification = db.prepare("SELECT * FROM verification_codes WHERE email = ? AND code = ?").get(email, code) as any;
      if (!verification || new Date(verification.expires_at) < new Date()) {
        return res.status(400).json({ error: "Código inválido ou expirado." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const info = db.prepare("INSERT INTO users (email, password, full_name, is_verified) VALUES (?, ?, ?, ?)")
        .run(email, hashedPassword, fullName, 1);
      
      db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);
      
      const token = jwt.sign({ userId: info.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token });
    } catch (error) {
      res.status(400).json({ error: "Email já cadastrado ou dados inválidos." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Credenciais inválidas." });
    }
  });

  app.get("/api/auth/me", (req: any, res) => {
    if (!req.userId) return res.json({ user: null });
    const user = db.prepare("SELECT id, email, full_name, is_admin FROM users WHERE id = ?").get(req.userId) as any;
    const order = db.prepare("SELECT * FROM orders WHERE user_id = ? AND status = 'CONCLUIDA'").get(req.userId);
    res.json({ user: { ...user, hasPurchased: !!order } });
  });

  // --- Admin Routes ---
  app.get("/api/admin/sales", (req: any, res) => {
    if (!req.userId) return res.status(401).json({ error: "Não autorizado" });
    const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(req.userId) as any;
    if (!user?.is_admin) return res.status(403).json({ error: "Acesso negado" });

    const sales = db.prepare(`
      SELECT o.id, o.amount, o.status, o.created_at, u.full_name, u.email 
      FROM orders o JOIN users u ON o.user_id = u.id 
      WHERE o.status = 'CONCLUIDA' ORDER BY o.created_at DESC
    `).all();

    const stats = db.prepare(`
      SELECT COUNT(*) as total_sales, SUM(CAST(amount as REAL)) as total_revenue
      FROM orders WHERE status = 'CONCLUIDA'
    `).get();

    res.json({ sales, stats });
  });

  // --- Pix Routes ---
  app.post("/api/pix/create-charge", async (req: any, res) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Login necessário." });
      
      const existingOrder = db.prepare("SELECT * FROM orders WHERE user_id = ? AND status = 'CONCLUIDA'").get(req.userId);
      if (existingOrder) return res.status(400).json({ error: "Produto já adquirido." });

      db.prepare("DELETE FROM orders WHERE user_id = ? AND status = 'ATIVA'").run(req.userId);

      if (!process.env.EFI_CLIENT_ID || !process.env.EFI_PIX_KEY) {
        return res.status(400).json({ error: "Configuração Efí ausente." });
      }

      const token = await getAccessToken();
      const isSandbox = process.env.EFI_SANDBOX === "true";
      const baseUrl = isSandbox ? "https://api-pix-h.gerencianet.com.br" : "https://api-pix.gerencianet.com.br";

      const chargeResponse = await axios({
        method: "post",
        url: `${baseUrl}/v2/cob`,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        httpsAgent: getEfiAgent(),
        data: {
          calendario: { expiracao: 3600 },
          valor: { original: "29.90" },
          chave: process.env.EFI_PIX_KEY,
          solicitacaoPagador: "Neural Blueprint",
        },
      });

      const charge = chargeResponse.data;
      db.prepare("INSERT INTO orders (user_id, txid, status, amount) VALUES (?, ?, ?, ?)")
        .run(req.userId, charge.txid, charge.status, "29.90");

      const qrCodeResponse = await axios({
        method: "get",
        url: `${baseUrl}/v2/loc/${charge.loc.id}/qrcode`,
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: getEfiAgent(),
      });

      res.json({
        qrcode: qrCodeResponse.data.qrcode,
        imagemQrcode: qrCodeResponse.data.imagemQrcode,
        txid: charge.txid,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.response?.data?.mensagem || "Erro no Pix" });
    }
  });

  app.get("/api/pix/status/:txid", async (req, res) => {
    try {
      const token = await getAccessToken();
      const isSandbox = process.env.EFI_SANDBOX === "true";
      const baseUrl = isSandbox ? "https://api-pix-h.gerencianet.com.br" : "https://api-pix.gerencianet.com.br";

      const response = await axios({
        method: "get",
        url: `${baseUrl}/v2/cob/${req.params.txid}`,
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: getEfiAgent(),
      });

      const status = response.data.status;
      db.prepare("UPDATE orders SET status = ? WHERE txid = ?").run(status, req.params.txid);
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: "Erro status" });
    }
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist/index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server: http://localhost:${PORT}`));
}

startServer();
