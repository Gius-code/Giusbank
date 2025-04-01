const Movimento = require("./Movimento"); // classe basemovimento  coi suoi metodi  e attributi
const pool = require("../config/dbu");
// classe con metodi statici e  campi trivati estensione/specializzazione della classe movimento eredita attributi e metodi questi ultimi possono essere anche sovreascritti
class InvioDenaro extends Movimento {
  #destinatario; //attributo privato aggiunti rispetto alla classe movimento

  constructor(ammontare, conto, destinatario, categoria) {
    // Impostiamo il tipo ereditato dalla classe generale come "invio denaro" direttamente e aggiungiamo il destinatario
    super("invio denaro", ammontare, conto, categoria); //viene chiamato il costruttore base (movimento)
    this.#destinatario = destinatario; // viene seegnato il destinatario
  }

  //metodo registra movimento si occupa di inserire una nuova riga nella tabella movimento sovrascrittura del metodo della classe base
  async registraMovimento() {
    const query = `
INSERT INTO movimento (created_at, ammontare, tipo, conto, mittente, destinatario, categoria)
VALUES (NOW(), $1, $2, $3, $4, $5,$6) RETURNING *;
    `; //il campo created_at viene inserito automaticamente al momento dell'inserimento
    const values = [
      this.ammontare,
      this.tipo,
      this.conto, //necessario per la gestione del movimento
      this.conto, //necessario come report e come mittente nella tabella
      this.#destinatario,
      this.categoria,
    ];

    try {
      const { rows } = await pool.query(query, values); //usiamo la destrutturazione per prendere solo l'oggetto
      // console.log("Rows:", rows);
      // console.log("Rows[0]:", rows[0]);
      return { success: true, data: rows[0] };
    } catch (error) {
      console.error("Errore inserimento movimento invio denaro:", error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = InvioDenaro;
