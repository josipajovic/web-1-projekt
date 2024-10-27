require("dotenv").config();

module.exports = {
  db: {
    host: process.env.DB_HOST || 'dpg-csfbo38gph6c73f1u50g-a.frankfurt-postgres.render.com',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'ticketsdb_cb0l_user',
    password: process.env.DB_PASSWORD || 'gWHcyMu3600rogbnTxmLLhHVNzDu52Im',
    database: process.env.DB_NAME || 'ticketsdb_cb0l',
  },
  auth: {
    clientId: process.env.AUTH_CLIENT_ID,
    secret: process.env.AUTH_CLIENT_SECRET,
    issuerBaseUrl: process.env.AUTH_ISSUER_BASE_URL,
  },
};
