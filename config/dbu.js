const { Pool } = require("pg"); //imoprto l'ogetto pool serve per la connessione al db riutilizzabile migliorando le prestazioni

//nuova istanza di pool
const pool = new Pool({
  connectionString: process.env.URI_DB || process.env.URI_DB2, // stringa di connessione al database 2 per prblemi rete
  max: 20, // numero massimo di connessioni contemporanee nel pool
  idleTimeoutMillis: 30000, // tempo massimo in ms che una connessione può rimanere inattiva 30s
});

//test connesione db
async function testConnesione() {
  try {
    const client = await pool.connect(); // cerca di ottenere i dati dal pool
    console.log("Connessione al database avvenuta con successo!");
    client.release(); //rilascia la connesione
  } catch (err) {
    console.log("Errore durante la connessione al database:", err);
  }
}

// Richiama la funzione per testare la connessione al database
testConnesione();

module.exports = pool;
