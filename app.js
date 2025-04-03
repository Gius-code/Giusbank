require("dotenv").config(); // carico le variabili d'ambiente

// importo i moduli
const cors = require("cors"); //abilitare il Cross-Origin Resource Sharing
const path = require("path"); // gestire e manipolare i percorsi dei file

const session = require("express-session");//permette di gestire le sessioni
const passport = require("passport");//permette di gestire l'autenticazione

const express = require("express"); //framework per creare applicazioni web API
const app = express(); // creo una istanza di express

app.use(express.static("public")); //definisce la cartella 'public' come cartella statica
app.use(cors()); //abilita il Cross-Origin Resource Sharing
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

//connesione al database presente in un modulo separato
const pool = require("./config/dbu");

//middleware per la gestione delle sessioni all'app Express.
app.use(
  session({
    secret: process.env.SECRET,//chiave usata per firmare i cookie di sessione
    resave: false,
    saveUninitialized: false,//non salva le sessioni non inizializzate
  })
);
//importo il modulo di passport creato per l'autenticazione
const configurePassport = require("./config/passport");
configurePassport(passport);//richiamo la funzione per l'autenticazione

// Inizializzazione di Passport
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs"); //imposto il motore di template
app.set("views", path.join(__dirname, "views")); //imposto la cartella views

app.use("/", require("./route/Route"));//importo le rotte

PORT = process.env.PORT || 3000; //imposto la porta del server presa dalla variabile d'ambiente o 3000

// avvio il server con messaggio di successo
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
