//  variabili di riferimento per i grafici
let barChart;
let pieChart;

// Grafico entrate/uscite a barre prende il totale delle entrate e delle uscite come paramentro
function creagraficoBarre(totaleEntrate, totaleUscite) {
  //prende l'elemnto canvas con id graficoBarre e prende il contesto 2d necessario per crearlo
  const ctx = document.getElementById("graficoBarre").getContext("2d");

  // Se esiste già un grafico, lo elimina
  if (barChart) {
    barChart.destroy();
  }
  //crea un nuovo grafico a barre a cui passiamo il contesto il tipo e i dati da visualizzare con le etichette e colori
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Entrate", "Uscite"],
      datasets: [
        {
          label: [" Entrate"],
          data: [totaleEntrate, totaleUscite],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
    options: {
      responsive: true, //deve essere responsive per adattarsi a vari schermi
      scales: { y: { beginAtZero: true } },
    },
  });
}

// Grafico a torta per le categorie
function creaGraficoTortaCategorie(categorie) {
  const ctx = document.getElementById("graficoTortaCategorie").getContext("2d");
  const labels = Object.keys(categorie); //prendiamo tutte le categorie che sono chiave dell'oggetto categosria
  const dataValues = Object.values(categorie); //prendiamo tutti i valori per ogni categoria

  // Se esiste già un grafico, lo elimina
  if (pieChart) {
    pieChart.destroy();
  }
  //crea un nuovo grafico a torta a cui passiamo il contesto il tipo e i dati da visualizzare con le etichette e colori
  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Totale per Categoria",
          data: dataValues,
          backgroundColor: [
            "#4caf50",
            "#2196f3",
            "#ff9800",
            "#f44336",
            "#9c27b0",
          ],
        },
      ],
    },
    options: { responsive: true }, //deve essere responsive per adattarsi a vari schermi
  });
}

// Funzione per aggiornare i grafici (calcola totali e aggrega per categoria)
function aggiornaGrafici(movimenti) {
  //inizializzo le variabili accumulatori
  let totaleEntrate = 0;
  let totaleUscite = 0;
  let categorie = {};
  // estraiamo l'ammontare e lo convertiamo in numero decimale nel caso sia una stringa
  movimenti.forEach((mov) => {
    const ammontare = parseFloat(mov.ammontare);
    //incremento le variabili di accumulo in base al tipo di movimento
    if (mov.tipo === "deposito" || mov.tipo === "ricevi denaro") {
      totaleEntrate += ammontare;
    } else if (mov.tipo === "invio denaro" || mov.tipo === "prelievo") {
      totaleUscite += ammontare;
    }

    // Raggruppa per categoria se non è definita imposta ALtro
    const categoria = mov.categoria || "Altro";
    if (categorie[categoria]) {
      categorie[categoria] += ammontare;
    } else {
      categorie[categoria] = ammontare;
    }
  });

  // crea i nuovi grafici
  creagraficoBarre(totaleEntrate, totaleUscite);
  creaGraficoTortaCategorie(categorie);
}
