import React from 'react';
import '../style/terms.css'; // Importiamo il file CSS per lo stile
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TermsAndConditionsIT = () => {
      const { t } = useTranslation();
  
  return (
    <div className="terms-container">
                            <Link to="/en/terms" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                              {t('ToEnglish')}
                            </Link>
      
      <header className="terms-header">
        <h1>Termini e Condizioni del Servizio – SnakeBee</h1>
        <p className="last-updated">Ultimo aggiornamento: 01 Febbraio 2026</p>
      </header>

      <section>
        <p>
          Benvenuto su SnakeBee ("Piattaforma", "Servizio", "noi", "nostro"). SnakeBee è una piattaforma software per la gestione e il monitoraggio di rettili domestici. L'accesso e l'utilizzo del nostro Servizio sono soggetti all'accettazione e al rispetto dei presenti Termini e Condizioni. Se non accetti di essere vincolato da questi Termini, non dovrai utilizzare la Piattaforma.
        </p>
      </section>

      <section>
        <h2>1. Accettazione dei Termini</h2>
        <p>
          Accedendo o utilizzando il Servizio, l'utente dichiara di aver letto, compreso e accettato i presenti Termini e Condizioni, nonché la nostra Informativa sulla Privacy, che ne costituisce parte integrante. L'utilizzo del Servizio è consentito esclusivamente a persone fisiche che abbiano compiuto 18 anni di età o, per i residenti nell'Unione Europea, che abbiano compiuto 14 anni di età, a condizione che l'uso sia sotto la supervisione e con il consenso di un genitore o tutore legale. L'utente si impegna a fornire dati personali veritieri, accurati e completi durante la registrazione e a mantenerli aggiornati.
        </p>
      </section>

      <section>
        <h2>2. Servizi offerti</h2>
        <p>
          SnakeBee fornisce una piattaforma online che consente agli utenti di:
        </p>
        <ul>
          <li>Registrare e gestire i dati relativi ai propri rettili domestici.</li>
          <li>Monitorare l'alimentazione, la crescita e lo stato di salute degli animali.</li>
          <li>Interagire in un forum e blog dedicati alla community.</li>
          <li>Accedere a funzionalità aggiuntive tramite abbonamento premium.</li>
        <li>
                Utilizzare l'integrazione con servizi di terze parti, come Telegram, per ricevere notifiche e interagire con il Servizio (ove tale funzionalità sia resa disponibile).
              </li>
              <li>
                Consultare sezioni dedicate ("Shop" e "Allevatori") che possono contenere vetrine di prodotti, servizi o elenchi di professionisti offerti da terze parti. SnakeBee agisce unicamente come fornitore di spazio e non è parte, né responsabile, di qualsiasi transazione o rapporto che possa derivare tra l'utente e tali terze parti.
              </li>
        </ul>
        <p>
          Il Servizio è fornito "così com'è" (as is) e "come disponibile" (as available). Non garantiamo che il Servizio sarà sempre ininterrotto, sicuro, esente da errori o che i difetti verranno corretti.
        </p>
      </section>
      
      <section>
        <h2>3. Gestione dell'account utente</h2>
        <p><strong>Registrazione:</strong> Per accedere a determinate funzionalità, è necessario creare un account. La registrazione può avvenire direttamente o tramite un servizio di autenticazione di terze parti (es. Google).</p>
        <p><strong>Responsabilità:</strong> L'utente è l'unico responsabile della sicurezza e della riservatezza delle proprie credenziali di accesso. Qualsiasi attività svolta tramite l'account è considerata responsabilità dell'utente, che si impegna a notificarci immediatamente qualsiasi uso non autorizzato del proprio account.</p>
        <p><strong>Divieto di condivisione:</strong> È severamente vietato condividere l'account con terzi. L'utente può detenere un solo account personale.</p>
        <p><strong>Sospensione/Chiusura dell'account:</strong> Ci riserviamo il diritto di sospendere o chiudere l'account di un utente, a nostra discrezione e senza preavviso, in caso di violazione dei presenti Termini, uso improprio del Servizio, frode o qualsiasi altra attività considerata dannosa per la Piattaforma o per altri utenti.</p>
      </section>

      <section>
        <h2>4. Abbonamenti e pagamenti</h2>
        <p><strong>Piani Premium:</strong> Offriamo piani di abbonamento a pagamento ("Piani Premium") che sbloccano funzionalità aggiuntive. I dettagli dei prezzi e delle funzionalità sono specificati sulla Piattaforma.</p>
        
        <p><strong>Benefit SnakeBee Market (Buoni Sconto):</strong> Alcuni piani di abbonamento possono includere l'erogazione mensile di un buono sconto da utilizzare esclusivamente sullo shop esterno "SnakeBee Market" (<a href="https://market.snakebee.it" target="_blank" rel="noopener noreferrer">https://market.snakebee.it</a>). Si applicano le seguenti condizioni:</p>
        <ul>
            <li>Il buono viene generato ed inviato mensilmente in concomitanza con il rinnovo dell'abbonamento.</li>
            <li>Il buono ha validità limitata al mese di riferimento e <strong>non è cumulabile</strong> con i mesi successivi o con altri buoni.</li>
            <li>In caso di mancato utilizzo entro la scadenza (rinnovo successivo), il buono decade e non sarà rimborsabile.</li>
            <li>SnakeBee si riserva il diritto di modificare l'importo del buono o sospendere il benefit con un preavviso di 30 giorni.</li>
            <li>Il premio è erogabile solamente tramite buono sconto entro 48 dall'attivazione/rinnovo del'abbonamento.</li>
            <li>Il buono, come il servizio SnakeBee Market, è utilizzabile solamente in italia.</li>
        </ul>
        <p><strong>Processore di pagamento:</strong> Tutti i pagamenti sono elaborati tramite il servizio di terze parti Stripe. SnakeBee non memorizza né ha accesso ai dati di pagamento sensibili degli utenti (es. numeri di carte di credito). L'utente accetta i termini e le condizioni di Stripe.</p>
        <p><strong>IVA e Rinnovo:</strong> I prezzi indicati includono l'Imposta sul Valore Aggiunto (IVA), se applicabile. Gli abbonamenti si rinnovano automaticamente alla fine di ogni ciclo di fatturazione, salvo disdetta.</p>
        <p><strong>Disdetta:</strong> L'utente può disdire il proprio abbonamento in qualsiasi momento dalla sezione "Gestisci abbonamento" della Piattaforma. La disdetta avrà effetto alla fine del periodo di fatturazione in corso.</p>
<p><strong>Diritto di recesso:</strong> Ai sensi dell'art. 59, comma 1, lettera o) del Codice del Consumo, l'utente rinuncia espressamente al diritto di recesso entro 14 giorni dalla sottoscrizione del servizio quando l'attivazione è immediata e l'utente ne usufruisce.</p>
        <p><strong>Rimborsi:</strong> I rimborsi sono a nostra esclusiva discrezione e saranno gestiti in conformità con la nostra politica interna sui rimborsi. Di norma, non sono previsti rimborsi per abbonamenti già attivi e utilizzati.</p>
      </section>

      <section>
        <h2>5. Contenuti generati dagli utenti</h2>
        <p><strong>Responsabilità:</strong> L'utente è l'unico e totale responsabile per tutti i contenuti (testi, immagini, dati, ecc.) che inserisce, carica, pubblica o condivide sulla Piattaforma.</p>
        <p><strong>Condotta:</strong> È vietato pubblicare contenuti che siano illeciti, diffamatori, offensivi, volgari, osceni, minacciosi, che incitino all'odio, che violino diritti di terzi (inclusi diritti di copyright, marchi, privacy) o che siano altrimenti non conformi alla legge e ai presenti Termini.</p>
        <p><strong>Licenza:</strong> Pubblicando contenuti, l'utente concede a SnakeBee una licenza non esclusiva, mondiale, perpetua, irrevocabile, trasferibile, sub-licenziabile e gratuita di utilizzare, riprodurre, modificare, adattare, pubblicare, tradurre, distribuire e mostrare tali contenuti in qualsiasi formato e tramite qualsiasi canale mediatico, esclusivamente per le finalità del Servizio e per la sua promozione.</p>
        <p><strong>Moderazione e rimozione:</strong> Ci riserviamo il diritto, ma non l'obbligo, di monitorare, moderare e rimuovere qualsiasi contenuto utente che, a nostro insindacabile giudizio, violi i presenti Termini o le leggi applicabili.</p>
<p><strong>Digital Services Act (DSA):</strong> In conformità con il DSA (Regolamento (UE) 2022/2065), gli utenti possono segnalare contenuti che ritengono illeciti contattandoci direttamente ai recapiti indicati nella Sezione 12 (Contatti). Ci impegniamo a esaminare le segnalazioni in modo tempestivo e ad adottare le misure necessarie in conformità con la legge.</p>      </section>

<section>
              <h2>6. Programma Referral</h2> {/* Ricorda di aggiornare il numero della sezione (es. "6.") */}
              <p>
                SnakeBee può offrire, a sua discrezione, un "Programma Referral" (o "Programma di Affiliazione") che consente agli utenti registrati di ottenere benefici (come sconti, crediti o estensioni di abbonamento) invitando nuovi utenti a registrarsi e/o sottoscrivere un abbonamento.
              </p>
              <p><strong>Modalità e Benefici:</strong> Le modalità specifiche, i benefici per l'utente che invita ("Referrer") e per l'utente invitato ("Referral") saranno dettagliati e resi noti all'interno della Piattaforma.</p>
              <p><strong>Condizioni e Abusi:</strong> L'utilizzo del Programma Referral è soggetto a condizioni di buona fede. Sono severamente vietati l'auto-invito, la creazione di account multipli per simulare inviti, la pubblicazione di codici su siti di coupon generici o qualsiasi altra attività considerata fraudolenta o abusiva. </p>
              <p><strong>Modifica e Sospensione:</strong> Ci riserviamo il diritto di modificare, sospendere o terminare il Programma Referral in qualsiasi momento, senza preavviso. Ci riserviamo inoltre il diritto di invalidare o revocare i benefici acquisiti in caso di sospetto abuso o violazione dei presenti termini.</p>
            </section>

      <section>
        <h2>7. Diritti di proprietà intellettuale</h2>
        <p>
          Tutti i diritti di proprietà intellettuale relativi alla Piattaforma, inclusi il software, il codice, il design, i loghi, i marchi e i contenuti da noi forniti, sono di nostra esclusiva proprietà o dei nostri licenziatari. L'utilizzo della Piattaforma non concede all'utente alcun diritto su tali elementi. È vietato copiare, riprodurre, modificare, distribuire o utilizzare in qualsiasi modo il nostro materiale protetto da copyright senza la nostra autorizzazione scritta.
        </p>
      </section>

      <section>
        <h2>8. Limitazioni di responsabilità</h2>
        <p><strong>Esclusione di garanzie:</strong> SnakeBee fornisce il Servizio "così com'è" e "come disponibile". Non rilasciamo alcuna garanzia, espressa o implicita, riguardo all'accuratezza, all'affidabilità, alla disponibilità o alla funzionalità del Servizio. Non garantiamo che il Servizio sarà ininterrotto, esente da errori o virus.</p>
        <p><strong>Disclaimer Veterinario:</strong> Le funzionalità offerte da SnakeBee, incluse quelle per il monitoraggio dell'alimentazione e dello stato di salute, sono fornite esclusivamente a scopo informativo e gestionale. Il Servizio non costituisce, e non intende sostituire in alcun modo, una diagnosi, una consulenza o un trattamento veterinario professionale. Per qualsiasi problema di salute relativo ai propri animali, l'utente è tenuto a consultare tempestivamente un veterinario qualificato. SnakeBee non si assume alcuna responsabilità per decisioni relative alla salute degli animali basate esclusivamente sull'uso della Piattaforma.</p>
        <p><strong>Danni indiretti:</strong> Nella massima misura consentita dalla legge, SnakeBee, i suoi amministratori, dipendenti e affiliati non saranno in alcun caso responsabili per danni indiretti, incidentali, speciali, consequenziali o esemplari, inclusi, a titolo esemplificativo, danni per perdita di profitti, dati o altre perdite immateriali, derivanti dall'uso o dall'impossibilità di usare la Piattaforma.</p>
        <p><strong>Responsabilità per i contenuti:</strong> Non siamo responsabili per la correttezza, l'accuratezza o la legalità dei contenuti pubblicati dagli utenti. L'utente solleva SnakeBee da ogni responsabilità e si impegna a manlevarla da qualsiasi pretesa, reclamo o azione legale di terzi che possa derivare dai contenuti da lui pubblicati.</p>
        <p><strong>Sicurezza:</strong> Non possiamo garantire la totale sicurezza dei dati e delle comunicazioni. Sebbene utilizziamo misure di sicurezza adeguate, non possiamo essere ritenuti responsabili per eventuali accessi non autorizzati, perdite di dati o danni causati da azioni di terzi (es. hacker, phishing, malware).</p>
      </section>

      <section>
        <h2>9. Privacy e protezione dei dati</h2>
        <p>
          Il trattamento dei dati personali degli utenti è disciplinato dalla nostra Informativa sulla Privacy, disponibile al seguente <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a>. Utilizzando il Servizio, l'utente acconsente al trattamento dei propri dati personali secondo quanto descritto in tale informativa.
        </p>
      </section>

      <section>
        <h2>10. Modifiche ai Termini</h2>
        <p>
          Ci riserviamo il diritto di modificare i presenti Termini in qualsiasi momento, a nostra esclusiva discrezione. Le modifiche saranno rese note agli utenti tramite un'email all'indirizzo registrato o una notifica sulla Piattaforma. L'utilizzo continuativo del Servizio dopo la pubblicazione delle modifiche costituisce accettazione dei nuovi Termini. Se l'utente non accetta i nuovi Termini, dovrà cessare l'uso del Servizio e chiudere il proprio account.
        </p>
      </section>
      
      <section>
        <h2>11. Legge applicabile e foro competente</h2>
        <p>
          I presenti Termini sono regolati e interpretati in conformità con la legge italiana.
        </p>
        <ul>
          <li><strong>Per utenti consumatori:</strong> La controversia sarà devoluta al giudice del luogo di residenza o domicilio del consumatore, se ubicati in Italia.</li>
          <li><strong>Per utenti non consumatori (es. aziende o professionisti):</strong> La controversia sarà devoluta in via esclusiva al Foro di Torino.</li>
        </ul>
      </section>
      
      <section>
        <h2>12. Disposizioni finali</h2>
        <p><strong>Invalidità:</strong> Qualora una o più disposizioni dei presenti Termini fossero ritenute non valide o inapplicabili da un tribunale competente, le restanti disposizioni rimarranno pienamente valide ed efficaci.</p>
        <p><strong>Comunicazioni:</strong> Tutte le comunicazioni legali e amministrative dovranno essere inviate all'indirizzo e-mail e all'indirizzo fisico indicati nella sezione "Contatti".</p>
      </section>

      <section className="contact-section">
        <h2>13. Contatti</h2>
        <p>
          Per qualsiasi domanda, richiesta, reclamo o per ricevere informazioni, si prega di contattare SnakeBee ai seguenti recapiti:
        </p>
        <div className="contact-details">
            <p><strong>Email:</strong> <a href="mailto:support@snakebee.it">support@snakebee.it || PEC simonevaira@postecertifica.it</a></p>
            <p><strong>Indirizzo:</strong> via varaita 10, torino</p>
            <p><strong>P.IVA:</strong> 13308020018</p>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditionsIT;