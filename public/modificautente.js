
//recupero l'elemento bottone e gli imput
const btnSalva = document.getElementById("btnSalva");
const professioneInput = document.getElementById("professione");
const indirizzoInput = document.getElementById("indirizzo");
//assegno unn listener al click la bottone salva 
btnSalva.addEventListener("click", async () => {
  // Prepara i dati da inviare
  const datiDaInviare = {
    professione: professioneInput.value,
    indirizzo: indirizzoInput.value,
  };

  try {
    //uso put per passare i dati all'api che aggiornerà la passowrd dell'utente
    const response = await fetch(`/api/utente/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datiDaInviare),
    });
    //attendiamo il completamento della richiesta e in result mettiamo la risposta ottenuta
    const result = await response.json();

    if (result.success) {
      alert("Dati aggiornati con successo!");
      //rimando alla dashboard
      window.location.href = "/api/dashboard";
    } else {
      //altrimenti mostro l'errore
      alert("Errore: " + result.message);
    }
  } catch (error) {
    //catturo qualsiasi altro errore
    console.error("Errore fetch:", error);
    alert("Errore di comunicazione con il server.");
  }
});
