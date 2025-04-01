const Movimento = require("./Movimento");
const pool = require("../config/dbu");

class RiceviDenaro extends Movimento {
  #mittente;
  #destinatario;

  constructor(ammontare, conto, mittente, destinatario, categoria) {
    // Impostiamo il tipo ereditato dalla classe generale come "Ricevi denaro" direttamente e aggiungiamo il destinatario  e mittente
    super("ricevi denaro", ammontare, conto, categoria);
    this.#mittente = mittente;
    this.#destinatario = destinatario;
  }
  //metodo registra movimento si occupa di inserire una nuova riga nella tabella movimento sovrascrittura della classe base
  async registraMovimento() {
    const query = `
      INSERT INTO movimento (created_at, ammontare, tipo, conto, mittente, destinatario,categoria)
      VALUES (NOW(), $1, $2, $3, $4, $5,$6) RETURNING *;
    `;
    const values = [
      this.ammontare,
      this.tipo,
      this.conto,
      this.#mittente,
      this.#destinatario,
      this.categoria,
    ];

    try {
      const { rows } = await pool.query(query, values);
      console.log("Rows:", rows);
      console.log("Rows[0]:", rows[0]);
      return { success: true, data: rows[0] };
    } catch (error) {
      console.error("Errore inserimento movimento ricevi denaro:", error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = RiceviDenaro;
