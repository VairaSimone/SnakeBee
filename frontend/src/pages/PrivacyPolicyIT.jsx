import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PrivacyPolicyIT = () => {
    const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800 leading-relaxed">
                      <Link to="/en/privacypolicy" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                        {t('ToEnglish')}
                      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Informativa sulla Privacy</h1>
      <p className="italic mb-6">Ultimo aggiornamento: 03 novembre 2025</p>

      <p className="mb-6">
        Questa Informativa sulla Privacy descrive le Nostre politiche e procedure relative alla raccolta, all'uso e alla divulgazione delle Tue informazioni quando utilizzi il Servizio e Ti informa sui Tuoi diritti in materia di privacy e su come la legge Ti protegge.
      </p>

      <p className="mb-6">
        Utilizziamo i Tuoi Dati Personali per fornire e migliorare il Servizio. Utilizzando il Servizio, acconsenti alla raccolta e all'uso delle informazioni in conformità con questa Informativa sulla Privacy. Questa Informativa sulla Privacy è stata creata con l'aiuto del Generatore di Informative sulla Privacy.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Interpretazione e Definizioni</h2>

      <h3 className="text-xl font-semibold mb-2">Interpretazione</h3>
      <p className="mb-6">
        Le parole la cui iniziale è maiuscola hanno un significato definito in base alle seguenti condizioni. Le seguenti definizioni avranno lo stesso significato indipendentemente dal fatto che appaiano al singolare o al plurale.
      </p>

      <h3 className="text-xl font-semibold mb-2">Definizioni</h3>
      <p className="mb-6">Ai fini di questa Informativa sulla Privacy:</p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>Account</strong> indica un account univoco creato per consentirti di accedere al nostro Servizio o a parti di esso.
        </li>
        <li>
          <strong>Affiliata</strong> indica un'entità che controlla, è controllata da, o è sotto il controllo comune di una parte, dove per "controllo" si intende il possesso del 50% o più delle azioni, degli interessi o di altri titoli aventi diritto di voto per l'elezione di direttori o altre autorità di gestione.
        </li>
        <li>
          <strong>Società</strong> (indicata in questo Accordo come "la Società", "Noi", "Ci" o "Nostro") si riferisce a SnakeBee.
        </li>
        <li>
          <strong>Cookie</strong> sono piccoli file che vengono salvati sul Tuo computer, dispositivo mobile o qualsiasi altro dispositivo da un sito web, e che contengono i dettagli della Tua cronologia di navigazione su quel sito, tra i loro molti usi.
        </li>
        <li>
          <strong>Paese</strong> si riferisce a: Italia
        </li>
        <li>
          <strong>Dispositivo</strong> indica qualsiasi dispositivo che può accedere al Servizio, come un computer, un telefono cellulare o un tablet digitale.
        </li>
        <li>
          <strong>Dati Personali</strong> sono qualsiasi informazione che si riferisce a un individuo identificato o identificabile.
        </li>
        <li>
          <strong>Servizio</strong> si riferisce al Sito Web.
        </li>
        <li>
          <strong>Fornitore di Servizi</strong> indica qualsiasi persona fisica o giuridica che elabora i dati per conto della Società. Si riferisce a società terze o individui impiegati dalla Società per facilitare il Servizio, per fornire il Servizio per conto della Società, per eseguire servizi relativi al Servizio o per assistere la Società nell'analizzare come il Servizio viene utilizzato.
        </li>
        <li>
          <strong>Dati di Utilizzo</strong> si riferiscono ai dati raccolti automaticamente, generati dall'uso del Servizio o dall'infrastruttura del Servizio stesso (ad esempio, la durata di una visita a una pagina).
        </li>
        <li>
          <strong>Sito Web</strong> si riferisce a SnakeBee, accessibile da{" "}
          <a
            href="https://snakebee.it"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://snakebee.it
          </a>
        </li>
        <li>
          <strong>Tu</strong> indica l'individuo che accede o utilizza il Servizio, o la società, o altra entità legale per conto della quale tale individuo accede o utilizza il Servizio, a seconda dei casi.
        </li>
      </ul>

      {/* --- Sezione: Raccolta e Uso dei Tuoi Dati Personali --- */}
      <h2 className="text-2xl font-semibold mb-3">
        Raccolta e Uso dei Tuoi Dati Personali
      </h2>

      <h3 className="text-xl font-semibold mb-2">Tipi di Dati Raccolti</h3>

<h4 className="text-lg font-semibold mb-1">Dati Personali</h4>
      <p className="mb-2">
        Durante l'utilizzo del Nostro Servizio, potremmo chiederti di fornirci
        determinate informazioni personali che possono essere utilizzate per
        contattarti o identificarti. Le informazioni personali possono
        includere, a titolo esemplificativo:
      </p>
      <ul className="list-disc pl-6 space-y-1 mb-4">
        <li>Indirizzo email</li>
        <li>Nome e cognome</li>
        <li>Immagine del profilo (avatar), se fornita tramite Google</li>
        <li>Numero di telefono</li>
        <li>Indirizzo, stato, provincia, CAP, città</li>
        <li>
          Dati fiscali (solo se forniti per la fatturazione), come Codice
          Fiscale, Partita IVA, Codice SDI e indirizzo PEC
        </li>
        <li>
          ID utente Telegram (solo se decidi di collegare il tuo account al
          nostro bot Telegram)
        </li>
        <li>
          Link ai profili social (es. Facebook, Instagram), se decidi di
          inserirli nel tuo profilo
        </li>
        <li>
          Informazioni relative al programma di referral (ad esempio, il codice
          di chi ti ha invitato)
        </li>
        <li>Dati di Utilizzo</li>
      </ul>

      <h4 className="text-lg font-semibold mb-1">Dati di Utilizzo</h4>
      <p className="mb-2">
        I Dati di Utilizzo vengono raccolti automaticamente durante l'uso del Servizio.
      </p>
      <p className="mb-2">
        I Dati di Utilizzo possono includere informazioni come l'indirizzo IP del Tuo Dispositivo, il tipo di browser, la versione del browser, le pagine del Nostro Servizio che visiti, l'ora e la data della Tua visita, il tempo trascorso su tali pagine, identificatori unici del dispositivo e altri dati diagnostici.
      </p>
      <p className="mb-2">
        Quando accedi al Servizio tramite un dispositivo mobile, potremmo raccogliere automaticamente determinate informazioni, tra cui, a titolo esemplificativo, il tipo di dispositivo mobile che utilizzi, l'ID univoco del Tuo dispositivo mobile, l'indirizzo IP del Tuo dispositivo mobile, il Tuo sistema operativo mobile, il tipo di browser internet mobile che utilizzi, identificatori unici del dispositivo e altri dati diagnostici.
      </p>
      <p className="mb-6">
        Potremmo anche raccogliere informazioni che il Tuo browser invia ogni volta che visiti il Nostro Servizio o quando accedi al Servizio tramite un dispositivo mobile.
      </p>

      <h3 className="text-xl font-semibold mb-2">
        Tecnologie di Tracciamento e Cookie
      </h3>
      <p className="mb-2">
        Utilizziamo Cookie e tecnologie di tracciamento simili per monitorare l'attività sul Nostro Servizio e conservare determinate informazioni. Le tecnologie di tracciamento utilizzate sono beacon, tag e script per raccogliere e tracciare informazioni e per migliorare e analizzare il Nostro Servizio. Le tecnologie che utilizziamo possono includere:
      </p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>Cookie o Cookie del Browser:</strong> Un cookie è un piccolo file salvato sul Tuo Dispositivo. Puoi istruire il Tuo browser a rifiutare tutti i Cookie o a indicare quando un Cookie viene inviato. Tuttavia, se non accetti i Cookie, potresti non essere in grado di utilizzare alcune parti del nostro Servizio. A meno che tu non abbia impostato il tuo browser in modo che rifiuti i Cookie, il nostro Servizio potrebbe utilizzarli.
        </li>
        <li>
          <strong>Web Beacon:</strong> Alcune sezioni del nostro Servizio e le nostre email possono contenere piccoli file elettronici noti come web beacon (anche noti come clear gif, pixel tag e single-pixel gif) che permettono alla Società, per esempio, di contare gli utenti che hanno visitato quelle pagine o aperto un'email e per altre statistiche correlate al sito web (ad esempio, registrare la popolarità di una certa sezione e verificare l'integrità del sistema e del server).
        </li>
        <li>
          I Cookie possono essere "persistenti" o di "sessione". I Cookie Persistenti rimangono sul Tuo computer o dispositivo mobile quando vai offline, mentre i Cookie di Sessione vengono cancellati non appena chiudi il Tuo browser web. Puoi saperne di più sui cookie sull'articolo del sito web di TermsFeed.
        </li>
      </ul>

      <p className="mb-4">
        Utilizziamo sia Cookie di Sessione che Cookie Persistenti per gli scopi indicati di seguito:
      </p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>Cookie Necessari / Essenziali</strong>
          <br />
          Tipo: Cookie di Sessione
          <br />
          Amministrati da: Noi
          <br />
          Scopo: Questi Cookie sono essenziali per fornirti i servizi disponibili attraverso il Sito Web e per consentirti di utilizzare alcune delle sue funzionalità. Aiutano ad autenticare gli utenti e a prevenire l'uso fraudolento degli account utente. Senza questi Cookie, i servizi che hai richiesto non possono essere forniti, e Noi utilizziamo questi Cookie solo per fornirti tali servizi.
        </li>
        <li>
          <strong>Cookie di Accettazione della Politica sui Cookie / dell'Informativa</strong>
          <br />
          Tipo: Cookie Persistenti
          <br />
          Amministrati da: Noi
          <br />
          Scopo: Questi Cookie identificano se gli utenti hanno accettato l'uso dei cookie sul Sito Web.
        </li>
        <li>
          <strong>Cookie di Funzionalità</strong>
          <br />
          Tipo: Cookie Persistenti
          <br />
          Amministrati da: Noi
          <br />
          Scopo: Questi Cookie ci consentono di ricordare le scelte che fai quando utilizzi il Sito Web, come ricordare i tuoi dati di accesso o la tua preferenza linguistica. Lo scopo di questi Cookie è quello di fornirti un'esperienza più personale e di evitarti di dover reinserire le tue preferenze ogni volta che utilizzi il Sito Web.
        </li>
      </ul>

      <p className="mb-6">
        Per maggiori informazioni sui cookie che utilizziamo e sulle tue scelte relative ai cookie, visita la nostra Informativa sui Cookie o la sezione Cookie della nostra Informativa sulla Privacy.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Utilizzo dei Tuoi Dati Personali
      </h2>

      <p className="mb-2">
        La Società può utilizzare i Dati Personali per i seguenti scopi:
      </p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          Per fornire e mantenere il nostro Servizio, inclusa la supervisione dell'utilizzo del nostro Servizio.
        </li>
        <li>
          Per gestire il Tuo Account: per gestire la Tua registrazione come utente del Servizio. I Dati Personali che fornisci possono darti accesso a diverse funzionalità del Servizio che sono disponibili per Te come utente registrato.
        </li>
        <li>
          Per l'esecuzione di un contratto: lo sviluppo, la conformità e l'adempimento del contratto di acquisto per i prodotti, gli articoli o i servizi che hai acquistato o di qualsiasi altro contratto con Noi tramite il Servizio.
        </li>
        <li>
          Per contattarti: per contattarti via email, telefonate, SMS o altre forme equivalenti di comunicazione elettronica, come le notifiche push di un'applicazione mobile, relative ad aggiornamenti o comunicazioni informative connesse alle funzionalità, ai prodotti o ai servizi contrattati, inclusi gli aggiornamenti di sicurezza, quando necessario o ragionevole per la loro attuazione.
        </li>
        <li>
          Per fornirti notizie, offerte speciali e informazioni generali su altri beni, servizi ed eventi che offriamo simili a quelli che hai già acquistato o per cui hai chiesto informazioni, a meno che tu non abbia scelto di non ricevere tali informazioni.
        </li>
        <li>
          Per gestire le Tue richieste: per gestire e rispondere alle Tue richieste a Noi.
        </li>
        <li>
          Per i trasferimenti di attività: potremmo utilizzare le Tue informazioni per valutare o condurre una fusione, cessione, ristrutturazione, riorganizzazione, scioglimento o altra vendita o trasferimento di alcuni o tutti i Nostri beni, sia come società in attività che come parte di un fallimento, liquidazione o procedimento simile, in cui i Dati Personali detenuti da Noi sui Nostri utenti del Servizio sono tra i beni trasferiti.
        </li>
        <li>
          Per altri scopi: potremmo utilizzare le Tue informazioni per altri scopi, come l'analisi dei dati, l'identificazione delle tendenze di utilizzo, la determinazione dell'efficacia delle Nostre campagne promozionali e per valutare e migliorare il Nostro Servizio, prodotti, servizi, marketing e la Tua esperienza.
        </li>
      </ul>

<h3 className="text-xl font-semibold mb-2">
        Finalità e Base Giuridica del Trattamento
      </h3>
      <p className="mb-2">
        Trattiamo i Tuoi Dati Personali per le seguenti finalità e in base alle
        seguenti basi giuridiche:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>Gestione dell'Account e del Servizio:</strong> per fornire il
          Servizio, gestire il tuo account e autenticare gli accessi (inclusa
          Google OAuth). <em>Base giuridica:</em> esecuzione di un contratto
          (Art. 6(1)(b) GDPR).
        </li>
        <li>
          <strong>
            Fornitura del Servizio tramite Bot Telegram (opzionale):
          </strong>{" "}
          per fornire le funzionalità del Servizio (come la registrazione di
          eventi o la consultazione dei propri animali) tramite il bot Telegram,
          se decidi di collegare il tuo account. <em>Base giuridica:</em>{" "}
          esecuzione di un contratto (Art. 6(1)(b) GDPR).
        </li>
        <li>
          <strong>Pagamenti e Abbonamenti:</strong> per gestire pagamenti,
          abbonamenti, fatture e addebiti tramite Stripe, inclusa la raccolta
          dei dati fiscali necessari. <em>Base giuridica:</em> esecuzione di un
          contratto e obblighi legali (Art. 6(1)(b) e 6(1)(c) GDPR).
        </li>
        <li>
          <strong>Gestione del Programma Referral:</strong> per gestire il
          programma di referral, associare il tuo account all'utente che ti ha
          invitato e generare (tramite Stripe) e comunicarti (tramite email)
          codici promozionali come ricompensa. <em>Base giuridica:</em>{" "}
          esecuzione di un contratto (Art. 6(1)(b) GDPR) e legittimo interesse
          (Art. 6(1)(f) GDPR).
        </li>
        <li>
          <strong>Sicurezza e Prevenzione Frodi:</strong> per proteggere il
          Servizio, monitorare la cronologia degli accessi, rilevare accessi non
          autorizzati e prevenire abusi. <em>Base giuridica:</em> legittimi
          interessi della Società (Art. 6(1)(f) GDPR).
        </li>
        <li>
          <strong>Notifiche Email:</strong> per email transazionali come reset
          password, notifiche di alimentazione e aggiornamenti del servizio
          tramite Amazon SES. <em>Base giuridica:</em> esecuzione di un
          contratto (Art. 6(1)(b) GDPR).
        </li>
        <li>
          <strong>Marketing e Promozioni:</strong> per inviare newsletter o
          comunicazioni promozionali, se hai acconsentito.{" "}
          <em>Base giuridica:</em> consenso (Art. 6(1)(a) GDPR).
        </li>
        <li>
          <strong>Conformità Legale:</strong> conservazione di registri
          fiscali, contabili e contrattuali. <em>Base giuridica:</em> obbligo
          legale (Art. 6(1)(c) GDPR).
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">
        Condivisione dei Tuoi Dati Personali
      </h3>
      <p className="mb-2">
        Potremmo condividere le Tue informazioni personali nelle seguenti situazioni:
      </p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          Con i Fornitori di Servizi: potremmo condividere le Tue informazioni personali con i Fornitori di Servizi per monitorare e analizzare l'uso del nostro Servizio, per contattarti.
        </li>
        <li>
          Per trasferimenti di attività: potremmo condividere o trasferire le Tue informazioni personali in relazione a, o durante le trattative di, qualsiasi fusione, vendita di beni della Società, finanziamento o acquisizione di tutta o una parte della Nostra attività a un'altra società.
        </li>
        <li>
          Con le Affiliate: potremmo condividere le Tue informazioni con le Nostre affiliate, nel qual caso richiederemo a tali affiliate di rispettare questa Informativa sulla Privacy. Le affiliate includono la Nostra società madre e qualsiasi altra filiale, partner di joint venture o altre società che Noi controlliamo o che sono sotto controllo comune con Noi.
        </li>
        <li>
          Con i partner commerciali: potremmo condividere le Tue informazioni con i Nostri partner commerciali per offrirti determinati prodotti, servizi o promozioni.
        </li>
        <li>
          Con altri utenti: quando condividi informazioni personali o interagisci in altro modo nelle aree pubbliche con altri utenti, tali informazioni possono essere visualizzate da tutti gli utenti e possono essere distribuite pubblicamente al di fuori del Servizio.
        </li>
        <li>
          Con il tuo consenso: potremmo divulgare le Tue informazioni personali per qualsiasi altro scopo con il Tuo consenso.
        </li>
      </ul>

<h3 className="text-xl font-semibold mb-2">
        Responsabili Esterni del Trattamento
      </h3>
      <p className="mb-2">
        Condividiamo i Tuoi Dati Personali con i seguenti fornitori di servizi
        terzi, che agiscono come Responsabili del Trattamento:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>Stripe Payments Europe Ltd.</strong> – elaborazione dei
          pagamenti, gestione degli abbonamenti e generazione di codici
          promozionali per il programma referral.
        </li>
        <li>
          <strong>Amazon Web Services EMEA SARL</strong> – servizi di posta
          elettronica tramite Amazon SES.
        </li>
        <li>
          <strong>Hostinger International Ltd.</strong> – servizi di hosting
          (VPS situato in Germania).
        </li>
        <li>
          <strong>Google Ireland Ltd.</strong> – autenticazione tramite Google
          OAuth.
        </li>
        <li>
          <strong>Telegram FZ-LLC</strong> (o entità legale pertinente) – per
          l'invio di notifiche e la gestione delle funzionalità del servizio (ad
          esempio, promemoria di alimentazione) tramite il bot Telegram,
          esclusivamente previo collegamento da parte dell'utente.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">
        Trasferimenti Internazionali di Dati
      </h3>
      <p className="mb-6">
        Alcuni dei nostri fornitori di servizi potrebbero trasferire i Tuoi dati al di fuori dello Spazio Economico Europeo (SEE). Tutti i trasferimenti sono condotti in base a Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea e utilizzando garanzie aggiuntive come la crittografia dei dati.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Conservazione dei Tuoi Dati Personali
      </h2>
      <p className="mb-2">
        La Società conserverà i Tuoi Dati Personali solo per il tempo necessario a soddisfare gli scopi indicati in questa Informativa sulla Privacy. Conserveremo e utilizzeremo i Tuoi Dati Personali nella misura necessaria per adempiere ai Nostri obblighi legali, risolvere controversie e far rispettare i Nostri accordi e politiche legali.
      </p>
      <p className="mb-6">
        La Società conserverà anche i Dati di Utilizzo per scopi di analisi interna. I Dati di Utilizzo sono generalmente conservati per un periodo di tempo più breve, tranne quando questi dati vengono utilizzati per rafforzare la sicurezza o per migliorare la funzionalità del Nostro Servizio, o quando siamo legalmente obbligati a conservare questi dati per periodi di tempo più lunghi.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Trasferimento dei Tuoi Dati Personali
      </h2>
      <p className="mb-6">
        Le Tue informazioni, inclusi i Dati Personali, sono trattate presso gli uffici operativi della Società e in qualsiasi altro luogo in cui si trovano le parti coinvolte nel trattamento. Ciò significa che queste informazioni possono essere trasferite a — e mantenute su — computer situati al di fuori del Tuo stato, provincia, paese o altra giurisdizione governativa in cui le leggi sulla protezione dei dati potrebbero differire da quelle della Tua giurisdizione.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Eliminazione dei Tuoi Dati Personali
      </h2>
      <p className="mb-6">
        Hai il diritto di eliminare o richiedere che ti assistiamo nell'eliminare i Dati Personali che abbiamo raccolto su di Te. Il Nostro Servizio potrebbe darti la possibilità di eliminare determinate informazioni su di Te dall'interno del Servizio stesso. Puoi aggiornare, modificare o eliminare le Tue informazioni in qualsiasi momento accedendo al Tuo Account, se ne hai uno, e visitando la sezione delle impostazioni dell'account che Ti consente di gestire le Tue informazioni personali. Puoi anche contattarci per richiedere l'accesso, la correzione o l'eliminazione di qualsiasi informazione personale che ci hai fornito. Ti preghiamo di notare, tuttavia, che potremmo aver bisogno di conservare determinate informazioni quando abbiamo un obbligo legale o una base legittima per farlo.
      </p>
      <h3 className="text-xl font-semibold mb-2">I Tuoi Diritti GDPR</h3>
      <p className="mb-2">
        Ai sensi del GDPR, hai i seguenti diritti riguardo ai Tuoi Dati Personali:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Diritto di accesso ai Tuoi dati (Art. 15 GDPR).</li>
        <li>Diritto di rettifica o aggiornamento dei Tuoi dati (Art. 16 GDPR).</li>
        <li>Diritto alla cancellazione dei Tuoi dati (Art. 17 GDPR).</li>
        <li>Diritto di limitazione del trattamento (Art. 18 GDPR).</li>
        <li>Diritto alla portabilità dei dati (Art. 20 GDPR).</li>
        <li>Diritto di opposizione al trattamento, incluso il marketing (Art. 21 GDPR).</li>
        <li>
          Diritto di revocare il consenso in qualsiasi momento, laddove il
          trattamento sia basato sul consenso.
        </li>
        <li>
          Diritto di proporre reclamo all'Autorità Garante per la Protezione dei
          Dati Personali (<a
            href="https://www.garanteprivacy.it"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Garante Privacy
          </a>
          ).
        </li>
      </ul>
      <p className="mb-6">
        Per esercitare uno qualsiasi di questi diritti, ti preghiamo di contattarci all'indirizzo{" "}
        <strong>support@snakebee.it</strong>.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Divulgazione dei Tuoi Dati Personali
      </h2>
      <h3 className="text-xl font-semibold mb-2">Transazioni Commerciali</h3>
      <p className="mb-2">
        Se la Società è coinvolta in una fusione, acquisizione o vendita di beni, i Tuoi Dati Personali potrebbero essere trasferiti. Forniremo un avviso prima che i Tuoi Dati Personali vengano trasferiti e diventino soggetti a una diversa Informativa sulla Privacy.
      </p>

      <h3 className="text-xl font-semibold mb-2">Applicazione della Legge</h3>
      <p className="mb-2">
        In determinate circostanze, la Società potrebbe essere tenuta a divulgare i Tuoi Dati Personali se richiesto dalla legge o in risposta a richieste valide da parte di autorità pubbliche (ad es. un tribunale o un'agenzia governativa).
      </p>

      <h3 className="text-xl font-semibold mb-2">Altri Obblighi Legali</h3>
      <p className="mb-6">
        La Società può divulgare i Tuoi Dati Personali in buona fede, ritenendo che tale azione sia necessaria per: Adempiere a un obbligo legale, Proteggere e difendere i diritti o la proprietà della Società, Prevenire o indagare su possibili illeciti in relazione al Servizio, Proteggere la sicurezza personale degli utenti del Servizio o del pubblico, Proteggersi da responsabilità legali.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Sicurezza dei Tuoi Dati Personali
      </h2>
      <p className="mb-6">
        La sicurezza dei Tuoi Dati Personali è importante per Noi, ma ricorda che nessun metodo di trasmissione su Internet, o metodo di archiviazione elettronica è sicuro al 100%. Mentre ci sforziamo di utilizzare mezzi commercialmente accettabili per proteggere i Tuoi Dati Personali, non possiamo garantirne la sicurezza assoluta.
      </p>
      <p className="mb-6">
        Implementiamo misure tecniche e organizzative appropriate per proteggere i Tuoi Dati Personali, tra cui:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Crittografia dei dati in transito tramite TLS.</li>
        <li>Password con hashing e salting per tutti gli account.</li>
        <li>Autenticazione a più fattori (MFA) per l'accesso amministrativo.</li>
        <li>Backup crittografati e archiviazione sicura dei dati sensibili.</li>
        <li>Separazione degli ambienti di sviluppo e di produzione.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Privacy dei Minori</h2>
      <p className="mb-6">
        Il nostro Servizio non si rivolge a nessuno di età inferiore ai 13 anni. Non raccogliamo consapevolmente informazioni personali identificabili da nessuno di età inferiore ai 13 anni. Se sei un genitore o un tutore e sei a conoscenza che tuo figlio ci ha fornito Dati Personali, ti preghiamo di contattarci. Se veniamo a conoscenza di aver raccolto Dati Personali da chiunque di età inferiore ai 13 anni senza verifica del consenso dei genitori, adottiamo misure per rimuovere tali informazioni dai Nostri server.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Link ad Altri Siti Web</h2>
      <p className="mb-6">
        Il Nostro Servizio può contenere link ad altri siti web che non sono gestiti da Noi. Se clicchi su un link di terze parti, verrai indirizzato al sito di quella terza parte. Ti consigliamo vivamente di rivedere l'Informativa sulla Privacy di ogni sito che visiti. Non abbiamo alcun controllo e non ci assumiamo alcuna responsabilità per il contenuto, le politiche sulla privacy o le pratiche di qualsiasi sito o servizio di terze parti.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        Modifiche a questa Informativa sulla Privacy
      </h2>
      <p className="mb-6">
        Potremmo aggiornare la Nostra Informativa sulla Privacy di volta in volta. Ti informeremo di eventuali modifiche pubblicando la nuova Informativa sulla Privacy su questa pagina. Ti informeremo via email e/o con un avviso evidente sul Nostro Servizio, prima che la modifica diventi effettiva e aggiorneremo la data di "Ultimo aggiornamento" in cima a questa Informativa sulla Privacy. Ti consigliamo di rivedere periodicamente questa Informativa sulla Privacy per eventuali modifiche. Le modifiche a questa Informativa sulla Privacy sono efficaci quando vengono pubblicate su questa pagina.
      </p>
      <p className="mb-2">
        Conserviamo i Tuoi Dati Personali solo per il tempo necessario agli scopi descritti in questa Informativa sulla Privacy:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6"> 
        <li>Dati dell'account e del profilo: fino alla cancellazione dell'account o alla richiesta dell'utente.</li>
        <li>Cronologia degli accessi e log di sicurezza: ultimi 20 accessi.</li>
        <li>Record di pagamento e abbonamento: 10 anni (obbligo legale).</li>
        <li>Consenso al marketing via email: fino a quando non viene revocato dall'utente.</li>
        <li>Contenuti generati dall'utente (rettili, post del forum/blog, immagini): fino alla cancellazione dell'account.</li>
        <li>Token di aggiornamento: per la durata dell'attività dell'account.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Contattaci</h2>
      <p className="mb-6">
        Se hai domande su questa Informativa sulla Privacy, puoi contattarci:
      </p>
      <p className="mb-6">
        Via email: support@snakebee.it || PEC simonevaira@postecertifica.it
      </p>
    </div>
  );
};

export default PrivacyPolicyIT;