const express = require("express");
const { query } = require("./db");
const {expressjwt: jwt} = require('express-jwt');
const jwks = require('jwks-rsa');
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");
const db = require("./db");
require('dotenv').config();

const app = express();
app.use(express.json());

const authenticate = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://dev-siyjlo2ctm63pfaa.eu.auth0.com/.well-known/jwks.json`,
    }),
    audience: 'https://dev-siyjlo2ctm63pfaa.eu.auth0.com/api/v2/',
    issuer: `https://dev-siyjlo2ctm63pfaa.eu.auth0.com/`,
    algorithms: ['RS256'],
  });

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM tickets");
    res.send(`Broj generiranih ulaznica: ${result.rows[0].count}`);
  } catch (error) {
    res.status(500).send("Greška pri kreiranju ulaznice");
  }
});

app.post("/generate-ticket", authenticate, async (req, res) => {
  const { vatin, firstName, lastName } = req.body;

  if (!vatin || !firstName || !lastName) {
    return res.status(400).send("Nedostaju podaci: vatin, firstName, lastName su obavezni.");
  }

  try {
    const result = await db.query("SELECT COUNT(*) FROM tickets WHERE vatin = $1", [vatin]);
    if (result.rows[0].count >= 3) {
      return res.status(400).send("Maksimalno 3 ulaznice za isti OIB.");
    }

    const ticketId = uuidv4();
    await query("INSERT INTO tickets (id, vatin, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, NOW())", [ticketId, vatin, firstName, lastName]);

    const qrCodeData = `${req.protocol}://${req.get("host")}/ticket/${ticketId}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);

    res.status(201).send(`<img src="${qrCode}" alt="QR Code"/>`);
  } catch (error) {
    res.status(500).send("Greška pri kreiranju ulaznice");
  }
});

app.get("/ticket/:id", authenticate, async (req, res) => {
  const ticketId = req.params.id;

  try {
    const result = await db.query("SELECT vatin, first_name, last_name, created_at FROM tickets WHERE id = $1", [ticketId]);
    if (result.rows.length === 0) return res.status(404).send("Ulaznica nije pronađena.");

    const { vatin, first_name, last_name, created_at } = result.rows[0];
    res.send(`Detalji ulaznice:<br>OIB: ${vatin}<br>Ime: ${first_name}<br>Prezime: ${last_name}<br>Vrijeme nastanka: ${created_at}`);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).send("Greška u dohvaćanju podataka o ulaznici");
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
