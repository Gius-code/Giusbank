const ContoCorrente = require("../models/Conto"); // importo il modulo della classe conto

async function verificaProprietaConto(idConto, idUtente) {
  try {
    const contoResult = await ContoCorrente.trovaConto(idConto); //cerca nel db il conto
    //se non lo trova allora  ritorna  come risposta un messaggio di errore success false
    if (!contoResult.success) {
      return {
        success: false,
        status: 404,
        message: "Conto non trovato.",
      };
    }
    //altrimenti prosegue
    const conto = contoResult.data;
    //se sono diversi individua la violazione e ritorna un messaggio di errore forbidden
    if (conto.id_utente !== idUtente) {
      return {
        success: false,
        status: 403,
        message: "Accesso negato. Questo conto non appartiene all'utente.",
      };
    }
    //altrimenti manda come risposta  il conto con esito positivo
    return {
      success: true,
      conto,
    };
    //cattura tutti gli altri errori
  } catch (error) {
    console.error("Errore durante la verifica proprietà del conto:", error);
    return {
      success: false,
      status: 500,
      message: "Errore interno.",
    };
  }
}

module.exports = verificaProprietaConto;
