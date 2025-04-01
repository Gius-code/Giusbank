const pool = require("../config/dbu");
// classe con metodi statici e  campi trivati
class ContoCorrente {
  #id;
  #saldo;
  #creato;
  #filiale;
  #idUtente;
  #stato;
  //costruttore che inizalizza i campi tranne id e creato
  constructor(saldo, filiale, idUtente, stato) {
    this.#saldo = saldo;
    this.#filiale = filiale;
    this.#idUtente = idUtente;
    this.#stato = stato;
  }

  //crea una nuova riga conto dentro la tabella conto_corrente  coi dati inseriti nell'oggetto
  async creaConto() {
    try {
      //scrivo la query in una variabile
      const query = `
        INSERT INTO conto_corrente (saldo, filiale, id_utente, stato)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `; //query di inserimento
      //scrivo i valori in un'altra variabile
      const values = [this.#saldo, this.#filiale, this.#idUtente, this.#stato];

      const result = await pool.query(query, values); //nuova connesione passando query e valori per la query

      const nuovoConto = result.rows[0]; // prendiamo solo row dell'oggetto result che contiene l'oggetto inserito
      //aggiungiomo ide e creato
      this.#id = nuovoConto.id;
      this.#creato = nuovoConto.creato;
      //restituiamo tutto con una response porisva i dati creati e  l'esito
      return {
        success: true,
        message: "Conto creato con successo!",
        data: nuovoConto,
      };
      //catturiamo gli errori
    } catch (error) {
      console.error("Errore durante la creazione del conto:", error);
      return {
        //la risposta  restituita in caso di errore
        success: false,
        message: "Errore durante la creazione del conto.",
      };
    }
  }
  //metodo per tovare un conto usando l'id utente
  static async trovaContoUtente(idUtente) {
    try {
      //cerco un contocorrente  attraverso l'id utente
      const query = `SELECT * FROM conto_corrente WHERE id_utente = $1;`; //query di selezione
      const values = [idUtente];
      const result = await pool.query(query, values);
      // console.log("sono qui", result.rows.length);
      if (result.rows.length === 0) {
        return { success: false, message: "Conto per l'utente non trovato." };
      }
      return { success: true, message: "Conto trovato.", data: result.rows[0] };
    } catch (error) {
      console.error("Errore durante la ricerca del conto per l'utente:", error);
      return {
        success: false,
        message: "Errore durante la ricerca del conto.",
      };
    }
  }
  //metodo per tovare un conto usando l'id
  //query per mostrare il conto  per id(nr conto)
  static async trovaConto(id) {
    try {
      const query = `SELECT * FROM conto_corrente WHERE id = $1;`;
      const values = [id];
      const result = await pool.query(query, values);
      // console.log(result.rows);
      if (result.rows.length === 0) {
        return {
          success: false,
          message: "Conto non trovato.",
        };
      }

      return {
        success: true,
        message: "Conto trovato.",
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Errore durante la ricerca del conto:", error);
      return {
        success: false,
        message: "Errore durante la ricerca del conto.",
      };
    }
  }
  //metodo per aggiornare  il saldo del conto
  //query update con saldo aggiornato
  static async aggiornaSaldo(idConto, nuovoSaldo) {
    try {
      const query = `
        UPDATE conto_corrente
        SET saldo = $1
        WHERE id = $2
        RETURNING *;
      `; //query di aggiornamento dati con returning  * restituisce i dati modificati
      const values = [nuovoSaldo, idConto];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return {
          success: false,
          message: "Impossibile aggiornare il saldo: conto non trovato.",
        };
      }
      return {
        success: true,
        message: "Saldo aggiornato correttamente.",
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Errore durante l'aggiornamento del saldo:", error);
      return {
        success: false,
        message: "Errore durante l'aggiornamento del saldo.",
      };
    }
  }

  //metodo per aggiorare lo stato del conto da aperto a chiuso
  //quey sql di update stato conto
  static async aggiornaStato(idConto, nuovoStato) {
    try {
      const query = `
        UPDATE conto_corrente
        SET stato = $1
        WHERE id = $2
        RETURNING *;
      `;
      const values = [nuovoStato, idConto];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          message: "Conto non trovato, impossibile aggiornarlo.",
        };
      }

      return {
        success: true,
        message: "Stato del conto aggiornato con successo.",
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Errore durante l'aggiornamento dello stato conto:", error);
      return {
        success: false,
        message: "Errore durante l'aggiornamento dello stato.",
      };
    }
  }
}

module.exports = ContoCorrente;
