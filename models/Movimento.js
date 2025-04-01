const pool = require("../config/dbu");

class Movimento {
  #tipo;
  #ammontare;
  #conto;
  #categoria;

  constructor(tipo, ammontare, conto, categoria) {
    this.#tipo = tipo;
    this.#ammontare = ammontare;
    this.#conto = conto;
    this.#categoria = categoria;
  }

  // Getter per accedere ai valori nelle sottoclassi
  get tipo() {
    return this.#tipo;
  }
  get ammontare() {
    return this.#ammontare;
  }
  get conto() {
    return this.#conto;
  }
  get categoria() {
    return this.#categoria;
  }
  // metodo della classe base per registrare un mobimento generico
  async registraMovimento() {
    const query = `
INSERT INTO movimento (created_at, ammontare, tipo, conto, mittente, destinatario, categoria)
VALUES (NOW(), $1, $2, $3, $4, NULL,$5) RETURNING *;

    `; //anche se la classe non prevede il mittente perchè coincidente col proprietario del conto viene comunque inserito
    const values = [
      this.#ammontare,
      this.#tipo,
      this.#conto,
      this.#conto,
      this.#categoria,
    ];
    try {
      const { rows } = await pool.query(query, values);
      return { success: true, data: rows[0] };
    } catch (error) {
      console.error("Errore inserimento movimento:", error);
      return { success: false, message: error.message };
    }
  }

  //metodo per filtrare tutte le righe della tabella movimento per conto e  li ordino in maniera decrescente effettuando la join 
   //prendo tutte le colonne  di movimento e aggiungo le 4 colonne del mittente e destinatario nome e cognome passo da movimento a conto e da conto a utente per avere tutti i nomi e cognomi  e poi filtro per numero conto  decrescente  per data creazione

  static async getMovConto(conto) {
    const query = `
      SELECT
      movimento.*,
      utenti_mittente.nome    AS nome_mittente,
      utenti_mittente.cognome AS cognome_mittente,
      utenti_destinatario.nome    AS nome_destinatario,
      utenti_destinatario.cognome AS cognome_destinatario
    FROM movimento
      LEFT JOIN conto_corrente conto_mittente
        ON movimento.mittente = conto_mittente.id
      LEFT JOIN utenti utenti_mittente
        ON conto_mittente.id_utente = utenti_mittente.id
      LEFT JOIN conto_corrente conto_destinatario
        ON movimento.destinatario = conto_destinatario.id
      LEFT JOIN utenti utenti_destinatario
        ON conto_destinatario.id_utente = utenti_destinatario.id
    WHERE movimento.conto = $1
    ORDER BY movimento.created_at DESC;
    `;
    try {
      const { rows } = await pool.query(query, [conto]); //uso la destrutturazione per prendere direttamente  l'oggetto con tutte le righe
      return { success: true, data: rows }; //restituisco l'oggetto  con esito positivo con try e catch gestisco gli errori
    } catch (error) {
      console.error("Errore nel recupero movimenti per conto:", error);
      return { success: false, message: error.message };
    }
  }
  //metodo per recuperare i movimenti di un dato conto per un dato intervallo
  //fatta left join doppia per recuperare il nome e congome del mittente e destinatario  altrimenti all'inizio restituiva solo il numero del conto 
  //prendo tutte le colonne  di movimento e aggiungo le 4 colonne del mittente e destinatario nome e cognome passo da movimento a conto e da conto a utente per avere tutti i nomi e cognomi  e poi filtro per numero conto e intervallo date decrescente
  static async getMovimentiIntervallo(conto, dataInizio, dataFine) {
    const query = `
  SELECT
      movimento.*,
      utenti_mittente.nome    AS nome_mittente,
      utenti_mittente.cognome AS cognome_mittente,
      utenti_destinatario.nome    AS nome_destinatario,
      utenti_destinatario.cognome AS cognome_destinatario
    FROM movimento
      LEFT JOIN conto_corrente conto_mittente
        ON movimento.mittente = conto_mittente.id
      LEFT JOIN utenti utenti_mittente
        ON conto_mittente.id_utente = utenti_mittente.id
      LEFT JOIN conto_corrente conto_destinatario
        ON movimento.destinatario = conto_destinatario.id
      LEFT JOIN utenti utenti_destinatario
        ON conto_destinatario.id_utente = utenti_destinatario.id
    WHERE movimento.conto = $1
      AND movimento.created_at >= $2
      AND movimento.created_at <= $3
    ORDER BY movimento.created_at DESC;
    `;

    try {
      const { rows } = await pool.query(query, [conto, dataInizio, dataFine]);
      return { success: true, data: rows };
    } catch (error) {
      console.error(
        "Errore nel recupero movimenti per l'intervallo di date:",
        error
      );
      return { success: false, message: error.message };
    }
  }
}

module.exports = Movimento;
