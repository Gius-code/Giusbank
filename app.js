require("dotenv").config(); // carico le variabili d'ambiente

// importo i moduli
const cors = require("cors"); //abilitare il Cross-Origin Resource Sharing
const path = require("path"); // gestire e manipolare i percorsi dei file

const express = require("express"); //framework per creare applicazioni web e API
const app = express(); // creo una istanza di express

app.use(express.static("public")); //deffinisce la cartella 'public' come cartella statica
app.use(express.urlencoded({ extended: true })); //permette di leggere i dati inviati, tramite extended: true permette di leggere dati colplessi

app.set("view engine", "ejs");//imposto il motore di template
app.set("views", path.join(__dirname, "views"));//imposto la cartella views

app.get("/", function (req, res) {
  res.send("Hello World");
});

PORT = process.env.PORT || 3000; //imposto la porta del server presa dalla variabile d'ambiente o 3000
// avvio il server con messaggio di successo 
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
