document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault(); // previene il submit tradizionale

    // Estrai i dati dal form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const dati = { email, password };

    // richiesta HTTP POST dove prende il formLogin.action(cosi se dovessi cambiare endpoint basta cambiare nel frontend) l'url api /api/login
    //nell'header definisco  il tipo di contenuto del body e poi passo i dati  sottoforma di stringa JSON
    try {
      const response = await fetch(formLogin.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dati),
      });
      //attendiamo il completamento della richiesta e in result mettiamo la risposta ottenuta
      const result = await response.json();

      if (result.success) {
        // Reindirizza alla dashboard se true
        window.location.href = "/api/dashboard";
      } else {
        // Mostra il messaggio d'errore
        alert(result.message);
      }
    } catch (err) {
      console.error("Errore durante il login:", err);
      alert("Errore durante il login. Riprova.");
    }
  });
});
