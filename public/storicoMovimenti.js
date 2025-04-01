//attivo un evento listener sul caricamento della pagina
document.addEventListener("DOMContentLoaded", async () => {
  try {
    //recupero l'id del conto  passato   e  lo sfrutto per accedere al servizio api tramite fetch
    const response = await fetch(`/api/movimenti/${contoId}`, {
      method: "GET",
      credentials: "include",
    });
    //attendo il risultato del fetch e lo metto in result
    const result = await response.json();
    //success true allora costruisco le righe della tabella
    if (result.success) {
      //recupero la sezione dove metterò le righe
      const tbody = document.getElementById("movimentiTabella");
      result.data.forEach((mov) => {
        // creo la riga e le varie celle cha la compongono
        // in fase di sviluppo le categorie non erano presenti quindi imposto di default con un or Altro dove non c'è
        //sfrutto date  toLocaleString per avere un formato locale di visualizazione data
        // con operatore ternario  invece gestisco il mittente e destinatario concatenado il nome  e il congome recuperati con left join
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${mov.tipo}</td>
            <td>${mov.categoria || "Altro"}</td> 
            <td>${mov.ammontare}</td>
            <td>${new Date(mov.created_at).toLocaleString()}</td>
            <td>${
              mov.nome_destinatario
                ? mov.nome_destinatario + " " + mov.cognome_destinatario
                : ""
            }</td>
            <td>${
              mov.nome_mittente
                ? mov.nome_mittente + " " + mov.cognome_mittente
                : ""
            }</td>`;
        tbody.appendChild(tr);//appenado all'elemento riga creato
      });
    } else {
      alert("Nessun movimento trovato.");
    }
  } catch (error) {
    console.error("Errore nel recupero dei movimenti:", error);
  }
});
