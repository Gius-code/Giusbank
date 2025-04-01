formRegistrazione = document.getElementById("formRegistrazione");
//recupero il form di registrazione e imposto un listener al submit del form
formRegistrazione.addEventListener("submit", async function (e) {
  e.preventDefault(); //evito che si ricarichi la pagina(comportamento di default del bottone submit)

  //Conversione in minuscolo di alcuni campi escluso nome cognome sesso e password
  //prendo dal form  i  dati e li rendo piccoli direttamente dentro   il  campo value del campo del form  con tutti i caratteri minuscoli
  document.getElementById("codiceFiscale").value = document
    .getElementById("codiceFiscale")
    .value.toLowerCase();
  document.getElementById("luogoNascita").value = document
    .getElementById("luogoNascita")
    .value.toLowerCase();

  document.getElementById("professione").value = document
    .getElementById("professione")
    .value.toLowerCase();
  document.getElementById("email").value = document
    .getElementById("email")
    .value.toLowerCase();
  // recupero  tutti i campi legati all'indirizzo di residenza li rendo minuscoli e elimino gli spazi inzio e fine stringa di ogni campo
  const via = document.getElementById("via").value.trim().toLowerCase();
  const civico = document.getElementById("civico").value.trim().toLowerCase();
  const citta = document.getElementById("citta").value.trim().toLowerCase();
  const cap = document.getElementById("cap").value.trim().toLowerCase();
  const provincia = document
    .getElementById("provincia")
    .value.trim()
    .toLowerCase();
  const nazione = document.getElementById("nazione").value.trim().toLowerCase();
  const indirizzoCompleto = `${via} ${civico}, ${citta}, ${cap}, ${provincia}, ${nazione}`;
  //tutti i campi manipolati li inserisco in un campo nascoto indirizzo da inviare con il form
  document.getElementById("indirizzo").value = indirizzoCompleto;

  // Validazione se maggiorenne
  let erroreeta = false;
  const messaggioErroreEta = document.getElementById("MessaggioErroreEta"); //recupero il campo del messaggio di errore
  const dataNascitaInput = document.getElementById("dataNascita").value; //recupero la data di nascita e se non vuota
  if (dataNascitaInput) {
    const dataNascita = new Date(dataNascitaInput); //conversione in oggetto date
    const oggi = new Date(); //creo oggetto con data corrente
    let eta = oggi.getFullYear() - dataNascita.getFullYear(); //differenza degli anni
    const differenzaMesi = oggi.getMonth() - dataNascita.getMonth(); //differenza dei mesi
    //(programmazione 2)
    //mese corrente inferiore a quello di nascita o mese uguale ma giorno corrente  inferiore allora decremento l'eta ricavata fagli anni
    if (
      differenzaMesi < 0 ||
      (differenzaMesi === 0 && oggi.getDate() < dataNascita.getDate())
    ) {
      eta--;
    }
    //se minorenne  mostra  un messaggio di avviso che prima era nascosto altrimenti non mostra nulla
    if (eta < 18) {
      erroreeta = true; // marca che l'età ha un problema di requisiti minimi
      messaggioErroreEta.style.display = "block";
      document.getElementById("dataNascita").classList.add("is-invalid");
    } else {
      messaggioErroreEta.style.display = "none";
      document.getElementById("dataNascita").classList.remove("is-invalid");
    }
  }

  //Validazione della password
  let errorepwd = false;
  //recupero i campi necessari
  const passwordInput = document.getElementById("password");
  const confermaPasswordInput = document.getElementById("confermaPassword");
  const passwordValue = passwordInput.value;
  const messaggioErrorePassword = document.getElementById(
    "MessaggioErrorePassword"
  );
  const messaggioErroreConfermaPassword = document.getElementById(
    "MessaggioErroreConfermaPassword"
  );

  //con  Regex: almeno una maiuscola, un numero, un carattere speciale e minimo 6 caratteri (programmazione 2)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  //confornto la stringa regex con  la passwrod scritta dall'utente
  if (!passwordRegex.test(passwordValue)) {
    errorepwd = true; //marca che la password ha un problema di requisiti
    messaggioErrorePassword.style.display = "block";
    passwordInput.classList.add("is-invalid");
  } else {
    messaggioErrorePassword.style.display = "none";
    passwordInput.classList.remove("is-invalid");
  }

  let confermaPasswordValue;
  if (confermaPasswordInput) {
    confermaPasswordValue = confermaPasswordInput.value;
  } else {
    confermaPasswordValue = "";
  }
//confornto la password scritta dall'utente con la conferma della password
  let erroreconf = false;
  if (passwordValue !== confermaPasswordValue) {
    erroreconf = true; //marca che la password ha un problema di uguaglianza
    messaggioErroreConfermaPassword.style.display = "block";
    passwordInput.classList.add("is-invalid");
  } else {
    messaggioErroreConfermaPassword.style.display = "none";
    passwordInput.classList.remove("is-invalid");
  }

  // Se ci sono errori, interrompe l'esecuzione e mostra un alert
  if (erroreeta || errorepwd || erroreconf) {
    alert("Ci sono errori nella compilazione.");
    return;
  }

  // estrae i dati dal form
  const formData = new FormData(e.target); //crea l'oggetto formdata che raccoglie i dati del form automaticamente prendendolo da e passato con il listener
  const data = Object.fromEntries(formData.entries()); // resituisce coppia chiave valore per ogni campo del form  e le trasforma in un  oggetto javascript
  //tutta la alvorazione viene messa in data preparati per passarli al server

  //Invia i dati al server
  try {
    const response = await fetch(e.target.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    //attendiamo il completamento della richiesta e in result mettiamo la risposta ottenuta
    const result = await response.json();
    if (result.success) {
      const conferma = confirm(
        `Registrazione effettuata con successo! Vuoi aprire un conto corrente?
         se prosegui accetti i termini e le condizioni.`
      );
      //se la registrazione va a buon fine mostro rimando all'api per creare il conto
      if (conferma) {
        const creaContoResponse = await fetch("/api/apri-conto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: result.data.email }), //passo l'email inserita nella registrazione per creare il conto
        });
        const contoResult = await creaContoResponse.json();
        if (contoResult.success) {
          alert("Conto creato con successo!"); //avviso esito positivo success true
        } else {
          alert("Errore nella creazione del conto: " + contoResult.message); //alert con errore
        }
        window.location.href = "/api/login"; //redirect al login
      } else {
        window.location.href = "/api/login";
      }
    } else {
      alert("Errore: " + result.message);
      window.location.href = "/api/registrazione";
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Impossibile contattare il server.");
    window.location.href = "/api/registrazione";
  }
});
