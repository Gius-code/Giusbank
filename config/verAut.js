//funzione middleware espress per le rotte protette per impedire l'accesso alle pagine riservate
//con next  è la funzione che permette di andare avanti  con l'esecuzione
function verificaAutenticazione(req, res, next) {
  // console.log("Sessione attuale:", req.session);
  // console.log("Utente attuale:", req.user);
  //se è autenticato  prosegue se presente al successivo middleware altimenti ti ridireziona alla pagina di login
  if (req.isAuthenticated()) {
    console.log("autenticato");
    return next();
  } else {
    console.log("non autenticato");
    res.redirect("/api/login");
  }
}

module.exports = verificaAutenticazione;
