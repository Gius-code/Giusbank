// importo i moduli necessari
const express = require("express"); // express per le route e le richieste HTTP
const passport = require("passport"); //passport per l'autenticazione
const bcrypt = require("bcrypt"); // per la crittografia della password

const verificaAutenticazione = require("../config/verAut"); //importo il middleware per l'autenticazione
//importo i moduli per gesire i dati
const ContoCorrente = require("../models/Conto");
const Utente = require("../models/utente");
const Movimento = require("../models/Movimento");
const InvioDenaro = require("../models/invioDenaro");
const RiceviDenaro = require("../models/ricevidenaro");
//importo il modulo per la verifica della proprieta del conto
// si poteva fare forse sotto forma di middleware???
const verificaProprietaConto = require("../config/verificaAutorizza");
const router = express.Router(); //crea un'istanza si express  per la gestione delle rotte e richieste HTTP

//rotta per accedere alla pagina di registrazione
router.get("/api/registrazione", (req, res) => {
  res.render("registrazione"); // Mostra la pagina di registrazione` da vedere error_msg se va tolto
});

//rotta che visualizza solo i termini e le condizioni
router.get("/api/termini-condizioni", (req, res) => {
  res.render("termini-e-condizioni"); // Mostra la pagina di registrazione` da vedere error_msg se va tolto
});
//api post  per passare i dati di registrazione
router.post("/api/registrazione", async (req, res) => {
  //destrutturazione dati  passati da req.body
  const {
    nome,
    cognome,
    sesso,
    codiceFiscale,
    dataNascita,
    luogoNascita,
    indirizzo,
    professione,
    email,
    password,
  } = req.body;

  const salt = 10; //valore passato insieme alla password per aumentare la sicurezza dell'hash
  const hashedPassword = await bcrypt.hash(password, salt); //eseguo l'hash della password
  // Crea una nuova istanza della classe con i dati ricevuti
  const nuovoUtente = new Utente(
    nome,
    cognome,
    sesso,
    codiceFiscale,
    dataNascita,
    luogoNascita,
    indirizzo,
    professione,
    email,
    hashedPassword
  );

  // chiamo il metodo registrati per inserire il nuovo utente e attendo il risultato
  const result = await nuovoUtente.registrati();

  // controllo risposta
  if (result.success) {
    return res.status(201).json(result); // risposta created inserito nel db
  } else {
    return res.status(409).json(result); //risposta  conflict perche l'utente è già presente nel db
  }
});

//rotta per accedere alla pagina di Login
router.get("/api/login", (req, res) => {
  res.render("login"); // Mostra la pagina di login`
});

//api post  per passare i dati di login e effetuare l'accesso
router.post("/api/login", (req, res, next) => {
  //si definisce la stategia di autenticazione local per passport
  const autenticazione = passport.authenticate(
    "local",
    //err eventuale errroe, user se le credenziali sono corrette messaggio legato al motivo del fallimento
    function (err, user, mess) {
      if (err) {
        return next(err); //se c'è un errore viene passato al moddleware degli errori
      }
      if (!user) {
        return res.status(401).json({ success: false, message: mess.message }); // se non trova l'utente viene resituito 401 non autorizzato
      }
      //stabilisce la sessione invocando il metodo login
      req.logIn(user, (err) => {
        if (err) {
          return next(err); //se si verifica un errore durante il login lo gestiesc il middleware degli errori
        }
        // Se l'autenticazione va a buon fine, restituiscie l'utente autenticato successo messaggio e stato 200
        return res.status(200).json({
          success: true,
          message: "Login effettuato con successo",
          user,
        });
      });
    }
  );
  autenticazione(req, res, next); //invochiamo il processo di autenticazione cosi che passport lo gestisca
});

//rotta per accedere alla pagina di logout
router.get("/api/logout", (req, res) => {
  res.render("logout");
});

// api post per il logout
router.post("/api/logout", (req, res, next) => {
  //termina la sessione invocando il metodo logout
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).json({
      success: true,
      message: "Logout effettuato con successo",
    });
  });
});

//rotta per accedere alla pagina dell'area riservata prima della callback eseguiamo il middleware di verifica dell'autenticazione
router.get("/api/dashboard", verificaAutenticazione, async (req, res) => {
  const idUtenteLoggato = req.user.id;
  try {
    // usa il metodo trovaContoUtente per ottenere il conto dell'utente
    const contoResult = await ContoCorrente.trovaContoUtente(idUtenteLoggato);
    let conto = null;
    if (contoResult.success) {
      conto = contoResult.data;
    }
    // Passa alla view sia i dati dell'utente che il saldo
    res.status(200).render("dashboard", { user: req.user, conto });
  } catch (error) {
    console.error("Errore nel recupero del conto:", error);
    res.status(404).render("dashboard", { user: req.user, saldo: null });
  }
});

//api post per creare un nuovo conto
router.post("/api/apri-conto", async (req, res) => {
  try {
    // l'emal dell'utente viene recuperata dalla richiesta
    const { email } = req.body;
    //se non esiste restituiamo errore bad request 400 con messaggio esplicativo
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "L'email è obbligatoria per creare il conto.",
      });
    }

    // Trova l'utente utilizzando il metodo trovaUtente di utente
    const utenteResult = await Utente.trovaUtente(email);
    //se non lo trova  restituisce risposta not found
    if (!utenteResult.success) {
      return res.status(404).json({
        success: false,
        message: "Utente non trovato.",
      });
    }

    const user = utenteResult.data; //prendiamo l'utente dalla risposta del metodo

    // Verifica se l'utente possiede già un conto usando il metodo trovaContoUtente di ContoCorrente
    const contoEsistente = await ContoCorrente.trovaContoUtente(user.id);
    //se esiste restituisce risposta forbidden l'utente possiede già un conto
    if (contoEsistente.success) {
      return res.status(403).json({
        success: false,
        message: "L'utente possiede già un conto.",
      });
    }

    // Se non esiste, crea un nuovo conto.
    // Impostiamo per esempio: saldo iniziale a 0, filiale "Default"(prevista ampliamento futuro) e stato "Aperto"
    const nuovoConto = new ContoCorrente(0, "Default", user.id, "Aperto");
    const creaContoResult = await nuovoConto.creaConto();

    if (creaContoResult.success) {
      return res.status(201).json(creaContoResult); //esito positivo created
    } else {
      return res.status(500).json(creaContoResult); //esito negativo errore interno
    }
  } catch (error) {
    console.error("Errore nella creazione del conto:", error);
    //esito negativo service unavailable
    return res.status(503).json({
      success: false,
      message: "Errore interno del server.",
    });
  }
});

//api post per chiudere un conto , si passa dalla verifica middlware di autenticazione
router.post("/api/chiudi-conto", verificaAutenticazione, async (req, res) => {
  try {
    const idUtente = req.user.id;

    // Cerca il conto dell’utente e attende la risposta
    const contoResult = await ContoCorrente.trovaContoUtente(idUtente);
    //se non lo trova 404 not found
    if (!contoResult.success) {
      return res
        .status(404)
        .json({ success: false, message: "Conto non trovato." });
    }
    //se lo trova  estraiamo il conto dalla risposta
    const conto = contoResult.data;

    //Se il conto è già chiuso, ritorna un messaggio
    if (conto.stato === "chiuso") {
      // conflict 409 conto già chiuso
      return res.status(409).json({
        success: false,
        message: "Conto già chiuso.",
      });
    }

    // imposta lo stato del conto da aperto a chiuso con il metodo aggiorna stato
    const chiudiResult = await ContoCorrente.aggiornaStato(conto.id, "Chiuso");

    if (!chiudiResult.success) {
      return res
        .status(404)
        .json({ success: false, message: chiudiResult.message });
    }

    // in caso di successo passo il messaggio per informare l'utente
    return res.json({
      success: true,
      status: 200,
      message:
        "Conto chiuso. Recati in filiale per ritirare il saldo rimanente.",
    });
  } catch (error) {
    //cattura dell'errore
    console.error("Errore nella chiusura del conto:", error);
    return res.status(500).json({
      success: false,
      message: "Errore interno del server.",
    });
  }
});

//api post per il deposito di denaro , si passa dalla verifica middlware di autenticazione
router.post("/api/deposito", verificaAutenticazione, async (req, res) => {
  const { ammontare, categoria } = req.body; //recupero dal body della richiesta importo e categoria
  const idUtente = req.user.id;
  // console.log("idUtente", idUtente);
  // console.log("ammontare", ammontare);
  try {
    // Cerca il conto dell’utente e attende la risposta
    const contoResult = await ContoCorrente.trovaContoUtente(idUtente);
    //se non lo trova 404 not found
    if (!contoResult.success) {
      return res
        .status(404)
        .json({ success: false, message: "Conto non trovato." });
    }
    //se lo trova  estraiamo il conto dalla risposta
    const conto = contoResult.data;
    // aggiungiamo l'importo del deposito al saldo del conto
    const nuovoSaldo = parseFloat(conto.saldo) + parseFloat(ammontare);

    // aggiornaimo il saldo del conto questo metodo non restituisce nulla
    await ContoCorrente.aggiornaSaldo(conto.id, nuovoSaldo);

    res
      .status(200)
      .json({ success: true, message: "Deposito effettuato con successo." });

    //creiamo una nuova instanza del movimento per registrarlo
    const nuovoMovimento = new Movimento(
      //tipo deposito , importo, conto interessato,categoria
      "deposito",
      ammontare,
      conto.id,
      categoria
    );
    //richiamo il metodo che registra il movimento il nuovo movimento
    await nuovoMovimento.registraMovimento();
  } catch (error) {
    //erorre generico nel tentativo di depositare la somma
    console.error("Errore deposito:", error);
    res.status(500).json({ success: false, message: "Errore interno." });
  }
});

//api post per il prelievo di denaro , si passa dalla verifica middlware di autenticazione alcuni parti sono simili al deposito
router.post("/api/prelievo", verificaAutenticazione, async (req, res) => {
  const { ammontare, categoria } = req.body;
  const idUtente = req.user.id;
  try {
    const contoResult = await ContoCorrente.trovaContoUtente(idUtente);
    if (!contoResult.success) {
      return res
        .status(404)
        .json({ success: false, message: "Conto non trovato." });
    }
    const conto = contoResult.data;
    //verifichiamo se l'importo da prelevare è minore del saldo del conto
    if (parseFloat(conto.saldo) < parseFloat(ammontare)) {
      // 400 bad request saldo insufficiente come stato e risposta
      return res
        .status(400)
        .json({ success: false, message: "Saldo insufficiente." });
    }
    //se il saldo è disponibile preleviamo l'importo
    const nuovoSaldo = parseFloat(conto.saldo) - parseFloat(ammontare);

    // Aggiorna il saldo
    await ContoCorrente.aggiornaSaldo(conto.id, nuovoSaldo);

    res
      .status(200)
      .json({ success: true, message: "Prelievo effettuato con successo." });

    // Registra il movimento
    const nuovoMovimento = new Movimento(
      "prelievo",
      ammontare,
      conto.id,
      categoria
    );
    await nuovoMovimento.registraMovimento();
  } catch (error) {
    console.error("Errore prelievo:", error);
    res.status(500).json({ success: false, message: "Errore interno." });
  }
});

//api post per l'invio di denaro, si passa dalla verifica middlware di autenticazione
router.post("/api/invia-denaro", verificaAutenticazione, async (req, res) => {
  const { destinatario, ammontare, categoria } = req.body;
  //se non esiste destinatorio e importo 400 bad request
  if (!destinatario || !ammontare) {
    return res.status(400).json({
      success: false,
      message:
        "Campi obbligatori mancanti: destinatario e ammontare sono richiesti.",
    });
  }
  // se la categoria non esiste la impostiamo come "altro" altrimenti usiamo quella passata dal body della richiesta
  const categoriaMovimento = categoria || "Altro";
  try {
    //recuperiamo il conto del mittente
    const mittenteresult = await ContoCorrente.trovaContoUtente(req.user.id);
    //se non lo trova 404 not found
    if (!mittenteresult.success) {
      return res
        .status(404)
        .json({ success: false, message: "Conto mittente non trovato." });
    }
    //estraiamo il conto dalla risposta della ricerca del mittente
    const mittenteConto = mittenteresult.data;
    //se il saldo del mittente non è sufficiente per l'invio 400 bad request
    if (parseFloat(mittenteConto.saldo) < parseFloat(ammontare)) {
      return res
        .status(400)
        .json({ success: false, message: "Saldo insufficiente." });
    }
    //recuperiamo il conto del destinatario
    const destinatarioResult = await ContoCorrente.trovaConto(destinatario);
    if (!destinatarioResult.success) {
      return res
        .status(404)
        .json({ success: false, message: "Conto destinatario non trovato." });
    }

    //aggiorno i ripsettivi saldi del mittente e del destinatario
    const destinatarioConto = destinatarioResult.data;

    const nuovoSaldoMittente =
      parseFloat(mittenteConto.saldo) - parseFloat(ammontare);
    const nuovoSaldoDestinatario =
      parseFloat(destinatarioConto.saldo) + parseFloat(ammontare);
    //eseguo il metodo per aggiornare i saldi su entrambi i conti e attendo la risposta
    await ContoCorrente.aggiornaSaldo(mittenteConto.id, nuovoSaldoMittente);
    await ContoCorrente.aggiornaSaldo(
      destinatarioConto.id,
      nuovoSaldoDestinatario
    );

    // Registro l'invnio di denaro per il mittente per  il conto del mittente
    const invio = new InvioDenaro(
      ammontare,
      mittenteConto.id,
      destinatario,
      categoriaMovimento
    );
    //eseguo il metodo per registrare il movimento nel db
    await invio.registraMovimento();

    // Registro La ricezione di denaro per il destinatario per il conto del destinatario
    const ricezione = new RiceviDenaro(
      ammontare,
      destinatarioConto.id,
      mittenteConto.id,
      destinatarioConto.id,
      categoriaMovimento
    );
    //eseguo il metodo per registrare il movimento nel db
    await ricezione.registraMovimento();

    return res.status(200).json({
      success: true,
      message: "Trasferimento effettuato con successo.",
    });
  } catch (error) {
    console.error("Errore nel trasferimento:", error);
    return res.status(500).json({ success: false, message: "Errore interno." });
  }
});

//rotta per visualizzare la pagina  dello storico dei movimenti totali di un conto, si passa dalla verifica middlware di autenticazione
router.get(
  "/api/storico-movimenti",
  verificaAutenticazione,
  async (req, res) => {
    try {
      //usa il metodo trovaContoUtente per ottenere il conto dell'utente
      const contoResult = await ContoCorrente.trovaContoUtente(req.user.id);
      //se non lo trova 404 not found ririmanda al dashboard
      if (!contoResult.success) {
        return res.status(404).redirect("api/dashboard");
      }
      //si renderizza la pagina sotirco movimenti passando  conto e utente
      res.status(200).render("storicoMovimenti", {
        conto: contoResult.data,
        user: req.user,
      });
    } catch (error) {
      //catturo qualsiasi errore
      console.error("Errore nel recupero del conto:", error);
      res.status(500).redirect("api/dashboard");
    }
  }
);

//api get per visualizzare lo storico dei movimenti, si passa dalla verifica middlware di autenticazione
router.get(
  "/api/movimenti/:conto",
  verificaAutenticazione,
  async (req, res) => {
    //recupero  i dati dai parametri passati dalla rotta
    const conto = req.params.conto;
    //controllo che l'id del conto coincida con quello del parametro per evitare che possano accedere a movimenti di altri utenti
    const idUtenteLoggato = req.user.id;
    const verifica = await verificaProprietaConto(conto, idUtenteLoggato);
    if (!verifica.success) {
      //nella risposta  recupero lo stato e il messaggio di errore
      return res
        .status(verifica.status)
        .json({ success: false, message: verifica.message });
    }

    try {
      //richiamo il metodo della classe o della sua estensione per recuperare i movimenti
      const result = await Movimento.getMovConto(conto);
      //se non trova movimenti 404 not found
      if (!result.success) {
        return res
          .status(404)
          .json({ success: false, message: "Movimenti non trovati." });
      }
      //altrimenti restiuisce i dati
      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      //catturo qualsiasi errore
      console.error("Errore nel recupero movimenti per conto:", error);
      res.status(500).json({ success: false, message: "Errore interno." });
    }
  }
);
//api get per visualizzare lo storico dei movimenti per inrvallo di tempo, si passa dalla verifica middlware di autenticazione
router.get(
  "/api/movimenti/:conto/:dataInizio/:dataFine",
  verificaAutenticazione,
  async (req, res) => {
    //recupero  i dati dai parametri passati dalla rotta
    const { conto, dataInizio, dataFine } = req.params;
    //controllo che l'id del conto coincida con quello del parametro per evitare che possano accedere a movimenti di altri utenti
    const idUtenteLoggato = req.user.id;
    const verifica = await verificaProprietaConto(conto, idUtenteLoggato);
    if (!verifica.success) {
      return res
        .status(verifica.status)
        .json({ success: false, message: verifica.message });
    }
    //creo le istanze date per le date inizio e fine cosi da poter fare le operazioni di confronto
    const inizio = new Date(dataInizio);
    const fine = new Date(dataFine);
    //controllo che le date siano valide
    if (isNaN(inizio) || isNaN(fine)) {
      return res.status(400).json({
        success: false,
        message: "Le date inserite non sono valide. Usa formato YYYY-MM-DD.",
      });
    }

    try {
      //richiamo il metodo della classe o della sua estensione per recuperare i movimenti per intervallo di tempo
      const result = await Movimento.getMovimentiIntervallo(
        conto,
        inizio,
        fine
      );
      if (!result.success) {
        //se non trova movimenti 404 not found
        return res.status(404).json({
          success: false,
          message: "Movimenti non trovati per l'intervallo richiesto.",
        });
      }
      //altrimenti restiuisce i dati con stato 200 e success true
      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      //catturo qualsiasi errore
      console.error(
        "Errore nel recupero movimenti per intervallo di date:",
        error
      );
      res.status(500).json({ success: false, message: "Errore interno." });
    }
  }
);
//rotta  per accedere alla pagina profilo con i dati dell'utente loggato
router.get("/api/profilo-utente", verificaAutenticazione, (req, res) => {
  const utenteLoggato = req.user;
  res.render("profiloUtente", { user: utenteLoggato }); //passaggio utente loggato
});

//rotta per la vista di modifica dati indirizzo e professione
router.get("/api/modifica-utente", verificaAutenticazione, (req, res) => {
  const utenteLoggato = req.user;
  res.render("modificaUtente", { user: utenteLoggato }); //renderizzazione della gagina
});
//api di modifica dati professione e indirizzo
router.put("/api/utente/:id", verificaAutenticazione, async (req, res) => {
  const { id } = req.params; //recupero l'id passato dalla rotta
  const { indirizzo, professione } = req.body; //recupero i dati passati dal body

  try {
    //richiamo il metodo della classe e aggiorni i dati modificati
    const result = await Utente.aggiornaDati(id, indirizzo, professione);
    //se non trova l'utente  restiuisce 404 not found
    if (!result.success) {
      return res.status(404).json(result);
    }
    //altrimenti 200 ok con i dati
    return res.status(200).json(result);
  } catch (error) {
    //catturo qualsiasi errore
    console.error("Errore nell'aggiornamento dati utente:", error);
    return res.status(500).json({
      success: false,
      message: "Errore interno del server",
    });
  }
});
//api per la modifica della password
router.put(
  "/api/utente/:id/password",
  verificaAutenticazione,
  async (req, res) => {
    try {
      //recupero l'id passato dalla rotta  e i dati passati dal body
      const { id } = req.params;
      const { vecchiaPassword, nuovaPassword } = req.body;

      // Controllo che l'utente loggato sia lo stesso che sta modificando i dati
      if (parseInt(id) !== parseInt(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Non sei autorizzato a modificare questo utente.",
        });
      }

      //recupero i dati  dell'utente
      const user = req.user;

      // verifico che la vecchia password coincide
      const match = await bcrypt.compare(vecchiaPassword, user.password);
      if (!match) {
        //altrimenti forbidden 403
        return res.status(403).json({
          success: false,
          message: "La vecchia password non è corretta.",
        });
      }

      //se coincide faccio l'hash della nuova password e  aggiorno il db col metodo presente in untente
      const salt = 10;
      const newHashedPassword = await bcrypt.hash(nuovaPassword, salt);

      const result = await Utente.aggiornaPassword(id, newHashedPassword);
      //bad request se non ottiene risposta
      if (!result.success) {
        return res.status(400).json(result);
      }

      // se tutto va a buon fine 200 ok
      return res.status(200).json({
        success: true,
        message: "Password aggiornata con successo!",
      });
    } catch (error) {
      //catturo qualsiasi errore
      console.error("Errore nel cambio password:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server.",
      });
    }
  }
);
//rotta per la vista di modifica password
router.get("/api/cambia-password", verificaAutenticazione, (req, res) => {
  res.render("cambiaPassword", { user: req.user });//passaggio dell'utente
});

//catture tutte le rotte non defintie e ritorna un errore
router.all("/*", function (req, res) {
  res.send("rotta non consentita");
});

//esporto le rotte per importarle nell'app.js
module.exports = router;
