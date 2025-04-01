const pool = require("../config/dbu");
//classe utente con metodi e attributi privati
//l'utente prevede una serie di dati anagraci  e l'email d'accesso e la password
class Utente {
  #nome;
  #cognome;
  #sesso;
  #cf;
  #dataNascita;
  #luogoNascita;
  #indirizzo;
  #professione;
  #email;
  #password;

  constructor(
    nome,
    cognome,
    sesso,
    cf,
    dataNascita,
    luogoNascita,
    indirizzo,
    professione,
    email,
    password
  ) {
    this.#nome = nome;
    this.#cognome = cognome;
    this.#sesso = sesso;
    this.#cf = cf;
    this.#dataNascita = dataNascita;
    this.#luogoNascita = luogoNascita;
    this.#indirizzo = indirizzo;
    this.#professione = professione;
    this.#email = email;
    this.#password = password;
  }

  //metodo per registrarsi e quindi inserire i dati nel db
  async registrati() {
    try {
      const query = `
        INSERT INTO utenti (
          nome, cognome, sesso, codice_fiscale, data_nascita, 
          luogo_nascita, indirizzo, professione, email, password
        ) VALUES (
          $1, $2, $3, $4, $5, 
          $6, $7, $8, $9, $10
        )
        RETURNING *;
      `;
      const values = [
        this.#nome,
        this.#cognome,
        this.#sesso,
        this.#cf,
        this.#dataNascita,
        this.#luogoNascita,
        this.#indirizzo,
        this.#professione,
        this.#email,
        this.#password,
      ];
      const result = await pool.query(query, values);
      return {
        //risposta positiva con passagio valori appena inseriti
        success: true,
        message: "Registrazione effettuata con successo!",
        data: result.rows[0],
      };
      //cattura degli errori con catch
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      return {
        success: false,
        message: "Utente già registrato",
      };
    }
  }
  // Metodo statico per recuperare i dati di un utente dal DB tramite email direttamente senza istanziare la classe
  static async trovaUtente(email) {
    try {
      const query = `
        SELECT * FROM utenti WHERE email = $1;
      `;
      const values = [email];
      const result = await pool.query(query, values);
      //se la query non da un array vuoto allora l'utente è stato trovato
      if (result.rows.length === 0) {
        return {
          success: false,
          message: "Utente non trovato.",
        };
      }
      return {
        //restituiamo esito positivo con messaggio di utente trovato e  i dati recuperati
        success: true,
        message: "Utente trovato.",
        data: result.rows[0],
      };
      //cattura degli errori
    } catch (error) {
      console.error("Errore nel recupero dell'utente:", error);
      return {
        success: false,
        message: "Errore durante il recupero dei dati.",
      };
    }
  }

  //metodo per aggiornare la password
  static async aggiornaPassword(id, nuovaPasswordHash) {
    try {
      //query di aggiornamento password con returnig per ottenre l'utente modificato
      const query = `
      UPDATE utenti 
      SET password = $1
      WHERE id = $2
      RETURNING *;
    `;
      //parametri per la query  e esecuzione del pool della query coi valori
      const values = [nuovaPasswordHash, id];
      const result = await pool.query(query, values);
      //se la query  da un array vuoto allora l'utente non è stato trovato
      if (result.rowCount === 0) {
        return { success: false, message: "Utente non trovato." };
      }
      //altrimenti restituisce l'utentencon le modiche  e passa i dati attraverso il bosy della response
      return { success: true, data: result.rows[0] };
    } catch (error) {
      //cattura degli errori
      console.error("Errore durante l'aggiornamento della password:", error);
      return { success: false, message: "Errore durante l'aggiornamento." };
    }
  }

  //aggiornamento degli unici dati modificabili lato utente
  static async aggiornaDati(id, indirizzo, professione) {
    //query di aggiornamento utente  per indirizzo e professione
    //aggiorna sempre i dati visto che i campi sono già presenti dell'input ed eventualmente modificati dall'utente
    const query = `
      UPDATE utenti
      SET indirizzo = $1,
          professione = $2
      WHERE id = $3
      RETURNING *;
    `; //returning restituisce cio che è stato modifcato
    const values = [indirizzo, professione, id];

    try {
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return {
          success: false,
          message: "Utente non trovato.",
        };
      }
      return {
        success: true,
        message: "Dati aggiornati con successo!",
        data: result.rows[0],
      };
    } catch (error) {
      console.error("Errore aggiornamento dati utente:", error);
      return {
        success: false,
        message: "Errore durante l'aggiornamento.",
      };
    }
  }
}

module.exports = Utente;
