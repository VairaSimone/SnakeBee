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
          Accedendo o utilizzando il Servizio, l'utente dichiara di aver letto, compreso e accettato i presenti Termini e Condizioni, nonché la nostra Informativa sulla Privacy, che ne costituisce parte integrante. 
L'accesso al Servizio è consentito ai maggiori di 18 anni. Gli utenti tra i 14 e i 18 anni possono utilizzare la Piattaforma esclusivamente sotto la supervisione di un genitore o tutore legale, che assume la responsabilità delle obbligazioni contrattuali e finanziarie dell'utente.
          L'utente si impegna a fornire dati personali veritieri, accurati e completi durante la registrazione e a mantenerli aggiornati.
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
          <li>Acquistare pacchetti di attrezzatura per rettili (Kit) direttamente tramite il nostro Store integrato.</li>
          <li>
            Utilizzare l'integrazione con servizi di terze parti, come Telegram, per ricevere notifiche e interagire con il Servizio (ove tale funzionalità sia resa disponibile).
          </li>
          <li>
SnakeBee agisce come mero fornitore di spazio ospitante (hosting provider) per le sezioni 'Shop' e 'Allevatori' di terze parti. SnakeBee non controlla, approva o garantisce la qualità, sicurezza o liceità dei prodotti/servizi offerti da terzi. I profili degli allevatori sono visualizzati in base a [CRITERIO: es. data di iscrizione/vicinanza geografica]. Qualsiasi transazione avviene esclusivamente tra utente e terzo          </li>
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
        <p><strong>Sospensione/Chiusura dell'account:</strong> SnakeBee si riserva il diritto di sospendere o chiudere l'account in caso di gravi violazioni dei presenti Termini (es. frode, spam, contenuti illeciti), previa notifica motivata all'utente, salvo casi di urgenza o obblighi di legge..</p>
      </section>

      <section>
        <h2>4. Abbonamenti e pagamenti</h2>
        <p><strong>Piani Premium:</strong> Offriamo piani di abbonamento a pagamento ("Piani Premium") che sbloccano funzionalità aggiuntive. I dettagli dei prezzi e delle funzionalità sono specificati sulla Piattaforma.</p>

        <p><strong>Benefit Market (Buoni Sconto):</strong> Alcuni piani di abbonamento possono includere l'erogazione mensile di un buono sconto, non erogabile in denaro, da utilizzare esclusivamente sullo shop interno "SnakeBee Market" (<a href="https://snakebee.it/store" target="_blank" rel="noopener noreferrer">https://market.snakebee.it</a>). Si applicano le seguenti condizioni:</p>
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
        <p><strong>Diritto di recesso:</strong> Sottoscrivendo l'Abbonamento Premium, l'utente richiede l'esecuzione immediata del Servizio. Ai sensi dell'Art. 59, lett. o) del Codice del Consumo, l'utente accetta che, con l'attivazione delle funzionalità Premium, non potrà più esercitare il diritto di recesso.</p>
        <p><strong>Rimborsi:</strong> I rimborsi sono a nostra esclusiva discrezione e saranno gestiti in conformità con la nostra politica interna sui rimborsi. Di norma, non sono previsti rimborsi per abbonamenti già attivi e utilizzati.</p>
      </section>
      <section>
        <h2>5. Store Online e Acquisto Prodotti (Kit)</h2>
        <p><strong>Acquisti:</strong> Tramite lo Store integrato nella Piattaforma, l'utente può acquistare pacchetti di attrezzatura per rettili (Kit) venduti direttamente da SnakeBee. L'ordine si intende confermato e il contratto di compravendita concluso solo al momento della ricezione di un'e-mail di conferma d'ordine da parte nostra.</p>

        <p><strong>Prezzi e Disponibilità:</strong> Tutti i prezzi sono espressi in Euro e sono comprensivi di IVA (se applicabile). Ci riserviamo il diritto di modificare i prezzi dei prodotti in qualsiasi momento. Le immagini dei prodotti sono a scopo puramente illustrativo. In caso di indisponibilità di un prodotto dopo aver effettuato l'ordine, l'utente verrà tempestivamente informato e rimborsato integralmente.</p>

        <p><strong>Spedizione e Consegna:</strong> I tempi e i costi di spedizione stimati vengono indicati al momento del checkout. SnakeBee si impegna a rispettare tali tempistiche, ma non è responsabile per eventuali ritardi imputabili al corriere o a cause di forza maggiore.</p>

        <p><strong>Diritto di Recesso (Resi):</strong> Ai sensi del D.Lgs. 206/2005 (Codice del Consumo), l'utente consumatore ha il diritto di recedere dal contratto di acquisto di beni fisici entro 14 giorni dal ricevimento della merce, senza dover fornire alcuna motivazione. Per esercitare tale diritto, l'utente deve contattarci all'indirizzo email indicato nella sezione Contatti. I costi di spedizione per la restituzione del bene sono a carico dell'utente. Il prodotto deve essere restituito integro, non utilizzato e nella sua confezione originale. In caso di recesso per prodotti fisici, SnakeBee rimborserà tutti i pagamenti ricevuti, incluse le spese di consegna standard, entro 14 giorni dalla ricezione della merce. SnakeBee aderisce alla normativa RAEE: l'utente è informato dell'obbligo di non smaltire le apparecchiature elettriche (es. termostati) come rifiuti urbani. <em>Nota: Il diritto di recesso è escluso per i beni che rischiano di deteriorarsi o scadere rapidamente (es. cibo vivo) o per beni confezionati su misura.</em></p>

        <p><strong>Garanzia Legale:</strong> Tutti i prodotti fisici venduti direttamente da SnakeBee sono coperti dalla garanzia legale di 24 mesi per difetti di conformità, ai sensi del Codice del Consumo. In caso di prodotto difettoso, l'utente ha diritto alla riparazione o sostituzione gratuita.</p>

        <p><strong>Pagamenti:</strong> Le transazioni dello Store sono gestite in totale sicurezza tramite Stripe. Le condizioni di elaborazione del pagamento sono le medesime applicate per gli abbonamenti (vedi Sezione 4).</p>
      </section>

      <section>
        <h2>6. Contenuti generati dagli utenti</h2>
        <p><strong>Responsabilità:</strong> L'utente è l'unico e totale responsabile per tutti i contenuti (testi, immagini, dati, ecc.) che inserisce, carica, pubblica o condivide sulla Piattaforma.</p>
        <p><strong>Condotta:</strong> È vietato pubblicare contenuti che siano illeciti, diffamatori, offensivi, volgari, osceni, minacciosi, che incitino all'odio, che violino diritti di terzi (inclusi diritti di copyright, marchi, privacy) o che siano altrimenti non conformi alla legge e ai presenti Termini.</p>
        <p><strong>Licenza:</strong> L'utente concede a SnakeBee una licenza d'uso gratuita e non esclusiva sui contenuti pubblicati, limitata alla durata di permanenza dell'account sulla Piattaforma e finalizzata esclusivamente all'erogazione del Servizio. Segnalazioni di contenuti illeciti possono essere inviate a [EMAIL], includendo la descrizione del contenuto e il link.</p>
        <p><strong>Moderazione e rimozione:</strong> Ci riserviamo il diritto, ma non l'obbligo, di monitorare, moderare e rimuovere qualsiasi contenuto utente che, a nostro insindacabile giudizio, violi i presenti Termini o le leggi applicabili.</p>
        <p><strong>Digital Services Act (DSA):</strong> In conformità con il DSA (Regolamento (UE) 2022/2065), gli utenti possono segnalare contenuti che ritengono illeciti contattandoci direttamente ai recapiti indicati nella Sezione 12 (Contatti). Ci impegniamo a esaminare le segnalazioni in modo tempestivo e ad adottare le misure necessarie in conformità con la legge.</p>      </section>

      <section>
        <h2>7. Programma Referral</h2> {/* Ricorda di aggiornare il numero della sezione (es. "6.") */}
        <p>
          SnakeBee può offrire, a sua discrezione, un "Programma Referral" (o "Programma di Affiliazione") che consente agli utenti registrati di ottenere benefici (come sconti, crediti o estensioni di abbonamento) invitando nuovi utenti a registrarsi e/o sottoscrivere un abbonamento.
        </p>
        <p><strong>Modalità e Benefici:</strong> Le modalità specifiche, i benefici per l'utente che invita ("Referrer") e per l'utente invitato ("Referral") saranno dettagliati e resi noti all'interno della Piattaforma.</p>
        <p><strong>Condizioni e Abusi:</strong> L'utilizzo del Programma Referral è soggetto a condizioni di buona fede. Sono severamente vietati l'auto-invito, la creazione di account multipli per simulare inviti, la pubblicazione di codici su siti di coupon generici o qualsiasi altra attività considerata fraudolenta o abusiva. </p>
        <p><strong>Modifica e Sospensione:</strong> SnakeBee si riserva di modificare il Programma Referral con preavviso di 30 giorni. I benefici già maturati dall'utente al momento della modifica non verranno pregiudicati, salvo i casi di sospetto abuso o frode.</p>
      </section>

      <section>
        <h2>8. Diritti di proprietà intellettuale</h2>
        <p>
          Tutti i diritti di proprietà intellettuale relativi alla Piattaforma, inclusi il software, il codice, il design, i loghi, i marchi e i contenuti da noi forniti, sono di nostra esclusiva proprietà o dei nostri licenziatari. L'utilizzo della Piattaforma non concede all'utente alcun diritto su tali elementi. È vietato copiare, riprodurre, modificare, distribuire o utilizzare in qualsiasi modo il nostro materiale protetto da copyright senza la nostra autorizzazione scritta.
        </p>
      </section>

      <section>
        <h2>9. Limitazioni di responsabilità</h2>
        <p><strong>Esclusione di garanzie:</strong> SnakeBee fornisce il Servizio "così com'è" e "come disponibile". Non rilasciamo alcuna garanzia, espressa o implicita, riguardo all'accuratezza, all'affidabilità, alla disponibilità o alla funzionalità del Servizio. Non garantiamo che il Servizio sarà ininterrotto, esente da errori o virus.</p>
        <p><strong>Disclaimer Veterinario:</strong> Le funzionalità offerte da SnakeBee, incluse quelle per il monitoraggio dell'alimentazione e dello stato di salute, sono fornite esclusivamente a scopo informativo e gestionale. Il Servizio non costituisce, e non intende sostituire in alcun modo, una diagnosi, una consulenza o un trattamento veterinario professionale. Per qualsiasi problema di salute relativo ai propri animali, l'utente è tenuto a consultare tempestivamente un veterinario qualificato. SnakeBee non si assume alcuna responsabilità per decisioni relative alla salute degli animali basate esclusivamente sull'uso della Piattaforma.</p>
        <p><strong>Danni indiretti:</strong> Nella massima misura consentita dalla legge, SnakeBee, i suoi amministratori, dipendenti e affiliati non saranno in alcun caso responsabili per danni indiretti, incidentali, speciali, consequenziali o esemplari, inclusi, a titolo esemplificativo, danni per perdita di profitti, dati o altre perdite immateriali, derivanti dall'uso o dall'impossibilità di usare la Piattaforma.</p>
        <p><strong>Responsabilità per i contenuti:</strong> SnakeBee non esclude né limita la propria responsabilità per dolo o colpa grave. Per ogni altra ipotesi, la responsabilità di SnakeBee è limitata alla somma totale pagata dall'utente nei 12 mesi precedenti l'evento dannoso.</p>
        <p><strong>Sicurezza:</strong> Non possiamo garantire la totale sicurezza dei dati e delle comunicazioni. Sebbene utilizziamo misure di sicurezza adeguate, non possiamo essere ritenuti responsabili per eventuali accessi non autorizzati, perdite di dati o danni causati da azioni di terzi (es. hacker, phishing, malware).</p>
      </section>

      <section>
        <h2>10. Privacy e protezione dei dati</h2>
        <p>
          Il trattamento dei dati personali degli utenti è disciplinato dalla nostra Informativa sulla Privacy, disponibile al seguente <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a>. Utilizzando il Servizio, l'utente prende atto al trattamento dei propri dati personali secondo quanto descritto in tale informativa.
        </p>
      </section>

      <section>
        <h2>11. Modifiche ai Termini</h2>
        <p>
          Ci riserviamo il diritto di modificare i presenti Termini in qualsiasi momento, a nostra esclusiva discrezione. Le modifiche saranno rese note agli utenti tramite un'email all'indirizzo registrato o una notifica sulla Piattaforma. L'utilizzo continuativo del Servizio dopo la pubblicazione delle modifiche costituisce accettazione dei nuovi Termini. Se l'utente non accetta i nuovi Termini, dovrà cessare l'uso del Servizio e chiudere il proprio account.
        </p>
      </section>

      <section>
        <h2>12. Legge applicabile e foro competente</h2>
        <p>
          I presenti Termini sono regolati e interpretati in conformità con la legge italiana.
        </p>
        <ul>
          <li><strong>Per utenti consumatori:</strong> La controversia sarà devoluta al giudice del luogo di residenza o domicilio del consumatore, se ubicati in Italia.</li>
          <li><strong>Per utenti non consumatori (es. aziende o professionisti):</strong> La controversia sarà devoluta in via esclusiva al Foro di Torino.</li>
          <li>In conformità all'art. 14 del Regolamento (UE) n. 524/2013, si informa l'utente che è possibile presentare un reclamo tramite la piattaforma ODR dell'Unione Europea al seguente link: http://ec.europa.eu/consumers/odr/.</li>
        </ul>
      </section>

      <section>
        <h2>13. Disposizioni finali</h2>
        <p><strong>Invalidità:</strong> Qualora una o più disposizioni dei presenti Termini fossero ritenute non valide o inapplicabili da un tribunale competente, le restanti disposizioni rimarranno pienamente valide ed efficaci.</p>
        <p><strong>Comunicazioni:</strong> Tutte le comunicazioni legali e amministrative dovranno essere inviate all'indirizzo e-mail e all'indirizzo fisico indicati nella sezione "Contatti".</p>
      </section>

      <section className="contact-section">
        <h2>14. Contatti</h2>
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