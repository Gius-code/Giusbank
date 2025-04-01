const bcrypt = require("bcrypt"); //modulo per criptare la password e fare i confronti
const LocalStrategy = require("passport-local").Strategy; //strategia username e password
const Utente = require("../models/utente"); // classe utente coi suoi metodi

function configurePassport(passport) {
  //definisce la strategia di autenticazione
  const strategy = new LocalStrategy(
    { usernameField: "email" }, // Usiamo l'email come username della strategia
    async (mail, password, done) => {
      try {
        const result = await Utente.trovaUtente(mail); //usiamo il metodo della classe utente per trovare l'utente
        //se  true allora saltiamo diretttamente il blocco then
        if (!result.success) {
          return done(null, false, { message: "Email non registrata" }); //se non trova l'emal ritorna un messaggio di errore false all'oggetto di ritorno e null come errore
        }
        const user = result.data; //otteniamo i dati utente

        // Confronta la password in chiaro con quella hashata
        const match = await bcrypt.compare(password, result.data.password); //confronto usando bscrypt metodo compare
        //se  coincidono saltiamo direttamente  slatiamo il then e restituiamo l'ggetto user
        if (!match) {
          return done(null, false, { message: "Credenziali errate." }); //se non coincidono le email ritorna un messaggio di errore false all'oggetto di ritorno e null come errore
        }
        return done(null, user); // restituiamo l'oggetto user senza errori
      } catch (err) {
        return done(err); //catturiamo qualsasi errore
      }
    }
  );

  passport.use(strategy);

  // dopo il login viene chiamata questa funzione che salva l'id dell'utente
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // dall'id utente salvato nella sessione  recupera tramite la query l'oggetto utente
  passport.deserializeUser(async (id, done) => {
    try {
      const pool = require("../config/dbu");
      const query = "SELECT * FROM utenti WHERE id = $1";
      const values = [id];
      const result = await pool.query(query, values);
      // controlliamo se ha restituito almeno un elemenento in questo array di oggetti
      if (result.rows.length === 0) {
        return done(new Error("Utente non trovato")); //generiamo l'errore  che poi viene catturato in configurePassport
      }
      done(null, result.rows[0]); // restituiamo l'oggetto senza errori
    } catch (err) {
      done(err); // restituiamo i vari errori
    }
  });
}

module.exports = configurePassport;
