import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-black">
      <h1 className="text-3xl font-bold mb-6">🛡️ Privacy Policy – SnakeBee</h1>
      <p className="mb-4"><strong>Ultimo aggiornamento:</strong> 21 luglio 2025</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Titolare del trattamento</h2>
      <p>Il Titolare del trattamento è <strong>SnakeBee di Simone [Cognome]</strong>, con sede legale in Torino, Italia. Per qualsiasi richiesta: <a className="text-blue-600 underline" href="mailto:info@snakebee.it">info@snakebee.it</a></p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Tipi di dati raccolti</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Dati forniti:</strong> nome, email, avatar, password, note inserite</li>
        <li><strong>Dati automatici:</strong> IP, user-agent, accessi, cronologia</li>
        <li><strong>Dati sensibili indiretti:</strong> abitudini, eventi sanitari (uso personale)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Finalità del trattamento</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Accesso e registrazione</li>
        <li>Notifiche automatiche</li>
        <li>Gestione funzionalità piattaforma</li>
        <li>Sicurezza e prevenzione frodi</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Base giuridica</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Contratto:</strong> uso del servizio</li>
        <li><strong>Consenso:</strong> per Cloudinary, privacy, cookie</li>
        <li><strong>Legittimo interesse:</strong> sicurezza e miglioramento</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Modalità del trattamento</h2>
      <p>I dati sono protetti da hash, JWT, token sicuri, revoca e crittografia. L’accesso è consentito solo a personale autorizzato.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Conservazione dei dati</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Account inattivi → eliminati dopo 2 anni</li>
        <li>Cronologia accessi → 6 mesi</li>
        <li>Feeding/eventi → 3 anni</li>
        <li>Token → revoca automatica, pulizia notturna</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Trasferimento a terze parti</h2>
      <table className="table-auto text-left border mt-2 mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Servizio</th>
            <th className="border px-2 py-1">Dati</th>
            <th className="border px-2 py-1">Server</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border px-2 py-1">Cloudinary</td><td className="border px-2 py-1">Immagini</td><td className="border px-2 py-1">UE/USA</td></tr>
          <tr><td className="border px-2 py-1">Amazon SES</td><td className="border px-2 py-1">Email</td><td className="border px-2 py-1">UE/USA</td></tr>
          <tr><td className="border px-2 py-1">Google OAuth</td><td className="border px-2 py-1">Account</td><td className="border px-2 py-1">UE/USA</td></tr>
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Diritti dell’utente</h2>
      <p>Puo richiedere accesso, modifica, cancellazione, portabilità, revoca del consenso e presentare reclami al Garante. Scrivi a <a href="mailto:info@snakebee.it" className="text-blue-600 underline">info@snakebee.it</a></p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Età minima</h2>
      <p>La registrazione è consentita solo ai maggiori di 14 anni. Non è attualmente previsto il consenso genitoriale automatico.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">10. Modifiche</h2>
      <p>Questa informativa può essere aggiornata. Gli utenti saranno avvisati via email o tramite alert in-app.</p>

      <hr className="my-10 border-gray-300" />

      <h1 className="text-3xl font-bold mb-6">🍪 Cookie Policy – SnakeBee</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Cosa sono i cookie?</h2>
      <p>I cookie sono piccoli file salvati sul tuo dispositivo per migliorare l’esperienza di navigazione e gestire la sessione.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Tipologie di cookie</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Cookie tecnici:</strong> essenziali per autenticazione e sicurezza</li>
        <li><strong>Analitici:</strong> non utilizzati</li>
        <li><strong>Profilazione:</strong> non utilizzati</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Cookie di terze parti</h2>
      <table className="table-auto text-left border mt-2 mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Terza Parte</th>
            <th className="border px-2 py-1">Finalità</th>
            <th className="border px-2 py-1">Link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">Google</td>
            <td className="border px-2 py-1">OAuth Login</td>
            <td className="border px-2 py-1"><a href="https://policies.google.com/privacy" className="text-blue-600 underline">Google</a></td>
          </tr>
          <tr>
            <td className="border px-2 py-1">Cloudinary</td>
            <td className="border px-2 py-1">Hosting immagini</td>
            <td className="border px-2 py-1"><a href="https://cloudinary.com/privacy" className="text-blue-600 underline">Cloudinary</a></td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Durata dei cookie</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Access token: 30 min</li>
        <li>Refresh token: 7 giorni</li>
        <li>Cookie banner: 150 giorni</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Gestione cookie</h2>
      <p>Puoi gestire o eliminare i cookie direttamente dalle impostazioni del tuo browser.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Contatti</h2>
      <p>Per dubbi sui cookie scrivi a: <a className="text-blue-600 underline" href="mailto:info@snakebee.it">info@snakebee.it</a></p>
    </div>
  );
};

export default PrivacyPolicy;
