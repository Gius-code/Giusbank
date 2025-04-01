//mi assicuro che venga caricato tutto il contenuto della pagina prima di eseguire il codice
document.addEventListener("DOMContentLoaded", async () => {
  //recupero l'elemento con id modaleSimulata e su quello creo una nuova istanza della modale bootstrap definita in modale simulata
  //deposito e prelievo
  const modaleSimulata = document.getElementById("modaleSimulata");
  const modaleOperazioni = new bootstrap.Modal(modaleSimulata);
  //data‑bs‑toggle="modal" gestisce l'apertura delle modali
  //recupero il form della modaleSimulata e ci applico un  listener al bottone  submit del form
  const formSimulato = document.getElementById("formSimulato");
  formSimulato.addEventListener("submit", async (e) => {
    e.preventDefault(); //evito che si ricarchi la pagina(comportamento di default del bottone submit)
    //recupero il tipo di operazione deposito/prelievo, l'importo e la categoria
    const operazioneSimulataTipo = document.getElementById(
      "operazioneSimulataTipo"
    ).value;
    const importoSimulato = document.getElementById("importoSimulato").value;
    const catagoriaSimulata =
      document.getElementById("catagoriaSimulata").value;
    //se non sono sono stati compilati  lancio un alert di avviso
    if (!operazioneSimulataTipo || !importoSimulato || !catagoriaSimulata) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }
    //preparo i dati per l'invio al relativo endpoint
    let url = "";
    let passaggioInfo = {
      ammontare: parseFloat(importoSimulato),
      categoria: catagoriaSimulata,
    };
    //in base alla scelta nel menu a tendina seleziona l'endpoint
    if (operazioneSimulataTipo === "deposito") {
      url = "/api/deposito";
    } else if (operazioneSimulataTipo === "prelievo") {
      url = "/api/prelievo";
    } else {
      alert("Tipo di operazione non valido.");
      return;
    }
    //invio la richiesta al server in modalità post  indicando il tipo di contenuto inviato in header
    //mi assicuro che le credenziali vengano inviate insieme alla richiesta
    //nel body viene  creata la stringa coi dati che dobbiamo passare
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passaggioInfo),
      });
      //attende response. json() e lo converte in un oggetto javascript in result
      const result = await response.json();
      //avendo strutturato l'esito della risposta con true o false per il successo  mostro il relstivo alert
      //se false mostro anche il messaggio di errore sempre previsto
      if (result.success) {
        alert("Operazione effettuata con successo.");
        location.reload();
      } else {
        alert("Errore: " + result.message);
      }
    } catch (error) {
      console.error("Errore di comunicazione:", error);
      alert("Errore nella comunicazione con il server.");
    }
    //richiudo la  modale, l'apertura della modale è gestita nei bottoni con data-bs-toggle="modal"
    modaleOperazioni.hide();
  });

  //recupero l'elemento con id modaleInvioDenaro e su quello creo una nuova istanza della modale bootstrap definita in modale invio denaro
  //invio denaro
  const modaleInvio = document.getElementById("modaleInvioDenaro");
  const modaleInvioDenaro = new bootstrap.Modal(modaleInvio);

  formInvioDenaro = document.getElementById("formInvioDenaro");
  formInvioDenaro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const destinatarioInvio =
      document.getElementById("destinatarioInvio").value;
    const importoInvio = document.getElementById("importoInvio").value;
    const categoriaInvio = document.getElementById("categoriaInvio").value;

    if (!destinatarioInvio || !importoInvio || !categoriaInvio) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    let passaggioInfo = {
      ammontare: parseFloat(importoInvio),
      categoria: categoriaInvio,
      destinatario: destinatarioInvio,
    };

    try {
      const response = await fetch("/api/invia-denaro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passaggioInfo),
      });
      const result = await response.json();
      if (result.success) {
        alert("Operazione effettuata con successo.");
        location.reload();
      } else {
        alert("Errore: " + result.message);
      }
    } catch (error) {
      console.error("Errore di comunicazione:", error);
      alert("Errore nella comunicazione con il server.");
    }

    modaleInvioDenaro.hide();
  });

  // Gestione della chiusura del conto
  const btnChiudiConto = document.getElementById("btnChiudiConto");
  btnChiudiConto.addEventListener("click", async () => {
    const conferma = confirm("Sei sicuro di voler chiudere il conto?");
    if (conferma) {
      try {
        //non viene passato nulla nel body perche i dati necessari sono dentro alle credenziali che si usano per la sessione
        const response = await fetch("/api/chiudi-conto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const result = await response.json();
        if (result.success) {
          alert(result.message);
          location.reload();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Errore di comunicazione con il server:", error);
        alert("Errore nella chiusura conto. Riprova.");
      }
    }
  });

  // bottone per creare il conto se non è stato trovato alcun conto che sfutta l'api /api/apri-conto
  const btnApriConto = document.getElementById("btnApriConto");
  if (btnApriConto) {
    btnApriConto.addEventListener("click", async () => {
      try {
        const response = await fetch("/api/apri-conto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: userEmail }), //passo la email necessaria per creare il conto
        });
        const result = await response.json();
        if (result.success) {
          alert("Conto creato con successo.");
          location.reload();
        } else {
          alert("Errore: " + result.message);
        }
      } catch (error) {
        console.error("Errore nella comunicazione:", error);
        alert("Errore nella comunicazione con il server.");
      }
    });
  }

  //viene passato il contoId da dashboard.ejs e con dataset recupero il id conto
  const contoIdDati = document.getElementById("contoId");
  const contoId = contoIdDati.dataset.id;

  // Gestione del filtro movimenti (utente sceglie un intervallo)
  const btnFiltraMovimenti = document.getElementById("btnFiltraMovimenti");
  btnFiltraMovimenti.addEventListener("click", async () => {
    //recupero dall'input date  la data di inzio e fine selezionata dall'utente
    const dataInizio = document.getElementById("dataInizio").value;
    const dataFine = document.getElementById("dataFine").value;

    if (!dataInizio || !dataFine) {
      alert("Seleziona entrambe le date per continuare.");
      return;
    }
    try {
      //non passo nulla attraverso body perche ho tutto nei parametri conto data inzio e fine
      const response = await fetch(
        `/api/movimenti/${contoId}/${dataInizio}/${dataFine}`,
        { credentials: "include" }
      );
      const result = await response.json();
      if (result.success) {
        //funzione creata per mostrare i movimenti  con i dati di result presenti in result.data come previsto  nella route api: api/movimenti/conto
        stampaMovimenti(result.data);
        //aggiornamento dei grafici visto che al caricamento della dashboard vengono mostrati solo quelli di 30 giorni
        aggiornaGrafici(result.data);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Errore durante il recupero movimenti:", error);
      alert("Errore di comunicazione con il server.");
    }
  });

  // Caricamento iniziale movimenti e grafici degli ultimi 30 giorni
  console.log(contoIdDati.dataset);
  if (contoIdDati) {
    // Calcola la data di inizio e fine  partendo da oggi fino a 30 giorni fa
    //con toISOStringsplit("T")[0] converto l'oggetto Date  in una stringa formattata secondo lo standard ISO, la parte prima della "T" rappresenta la data con split("T") divido la stringa ottenuta in un array  e [0] selezioniamo il primo elemento che è solo anno, mese e giorno
    const oggi = new Date();
    oggi.setDate(oggi.getDate() + 1); //impostare la visto fino all'effettiva giornata odierna
    const dataFine = oggi.toISOString().split("T")[0];
    const UnMeseFa = new Date(oggi);
    UnMeseFa.setDate(oggi.getDate() - 30);
    const dataInizio = UnMeseFa.toISOString().split("T")[0];

    //passo i dati ottenuti al server tramite fetch per usare la rotta api  per ottenere la lista movimenti filtrata degli ultimi 30 giorni
    try {
      const response = await fetch(
        `/api/movimenti/${contoId}/${dataInizio}/${dataFine}`,
        { credentials: "include" }
      );
      const result = await response.json();

      if (result.success) {
        const movimenti = result.data;
        // Visualizza i movimenti nella tabella
        stampaMovimenti(movimenti);

        // Aggiorna i grafici con i dati
        aggiornaGrafici(movimenti);
      } else {
        console.error("Errore nel recupero dei movimenti: " + result.message);
      }
    } catch (error) {
      console.error("Errore durante la fetch dei movimenti: ", error);
    }
  } else {
    console.error("Problema nel recupero del conto(contoId non trovato).");
  }
});

// Funzione per visualizzare i movimenti nella tabella
function stampaMovimenti(movimenti) {
  const tbody = document.getElementById("movimentiTabella");
  if (!tbody) {
    console.error("Non posso posizionare la tabella");
    return;
  }
  tbody.innerHTML = "";
  movimenti.forEach((mov) => {
    const tr = document.createElement("tr");

    const tdTipo = document.createElement("td");
    tdTipo.textContent = mov.tipo;

    const tdDirezione = document.createElement("td");
    tdDirezione.textContent = (mov.tipo === "deposito" || mov.tipo === "ricevi denaro") ? "Entrata" : "Uscita";

    const tdCategoria = document.createElement("td");
    tdCategoria.textContent = mov.categoria || "Altro";

    const tdAmmontare = document.createElement("td");
    tdAmmontare.textContent = mov.ammontare;

    const tdData = document.createElement("td");
    tdData.textContent = new Date(mov.created_at).toLocaleString();

    // Modifica per visualizzare nome e cognome come nello storico movimenti
    const tdDestinatario = document.createElement("td");
    tdDestinatario.textContent = mov.nome_destinatario ? mov.nome_destinatario + " " + mov.cognome_destinatario : "";

    const tdMittente = document.createElement("td");
    tdMittente.textContent = mov.nome_mittente ? mov.nome_mittente + " " + mov.cognome_mittente : "";

    tr.appendChild(tdTipo);
    // tr.appendChild(tdDirezione);
    tr.appendChild(tdCategoria);
    tr.appendChild(tdAmmontare);
    tr.appendChild(tdData);
    tr.appendChild(tdDestinatario);
    tr.appendChild(tdMittente);
    
    tbody.appendChild(tr);
  });
}

