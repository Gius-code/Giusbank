document.addEventListener("DOMContentLoaded", () => {
  //recupero gli elementi del form necessari
  const btnCambiaPassword = document.getElementById("btnCambiaPassword");
  const vecchiaPassword = document.getElementById("vecchiaPassword");
  const nuovaPassword = document.getElementById("nuovaPassword");
  const confermaNuovaPassword = document.getElementById(
    "confermaNuovaPassword"
  );

  //stringa regular expression
  // almeno una maiuscola, un numero, un carattere speciale, minimo 6 caratteri
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

  btnCambiaPassword.addEventListener("click", async () => {
    //controllo sulla vecchia password  se vuota
    if (!vecchiaPassword.value) {
      alert("La vecchia password è obbligatoria.");
      return;
    }

    //controllo sulla vecchia nuova password se coincide con la conferma
    if (nuovaPassword.value !== confermaNuovaPassword.value) {
      alert("Le due password non coincidono.");
      return;
    }

    //controllo sul rispetto dei requisiti regex impostati tramite metodo test di regexp
    if (!passwordRegex.test(nuovaPassword.value)) {
      alert("La nuova password non rispetta i requisiti richiesti.");
      return;
    }

    try {
      //fetch put per passare i dati all'api
      const response = await fetch(`/api/utente/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vecchiaPassword: vecchiaPassword.value,
          nuovaPassword: nuovaPassword.value,
        }),
      });
      //attende l'esito e lo salva dentro result
      const result = await response.json();
      //se  success  = true allora conferma la modifica altrimenti  mostra l'errore
      if (result.success) {
        alert("Password modificata con successo!");
        window.location.href = "/api/dashboard";
      } else {
        alert("Errore: " + result.message);
      }
    } catch (error) {
      //catturo qualsiasi altro errore
      console.error("Errore nel cambio password:", error);
      alert("Errore di comunicazione col server.");
    }
  });
});
