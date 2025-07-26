import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Utensils, HeartPulse, EggFried } from "lucide-react";

const Home = () => {
    

    
    return (
        <div className="min-h-screen bg-[#FAF3E0] text-[#2B2B2B] font-sans">
            <main className="max-w-6xl mx-auto p-6">

                {/* Hero */}
                <section className="text-center py-16 sm:py-24">
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">La tua piattaforma per gestire rettili</h1>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                        SnakeBee è nata per semplificare la gestione quotidiana di allevamenti di serpenti, gechi e altri rettili. Tutto in un’unica app.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="bg-[#FFD700] text-[#2B2B2B] px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 transition"
                        >
                            Inizia ora
                        </Link>
                        <a
                            href="#come-funziona"
                            className="border border-[#2B2B2B] px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                        >
                            Scopri di più
                        </a>
                    </div>
                </section>

                {/* Come funziona */}
                <section id="come-funziona" className="py-16 border-t border-gray-300">
                    <h2 className="text-3xl font-bold text-center mb-12">Come funziona</h2>
                    <div className="grid sm:grid-cols-3 gap-8 text-center text-gray-800">
                        <div>
                            <PlusCircle className="mx-auto mb-4 h-16 w-16 text-[#228B22]" />
                            <h4 className="text-xl font-semibold mb-2">1. Registra i tuoi rettili</h4>
                            <p>Aggiungi informazioni su specie, morph, sesso e foto.</p>
                        </div>
                        <div>
                            <Utensils className="mx-auto mb-4 h-16 w-16 text-[#228B22]" />
                            <h4 className="text-xl font-semibold mb-2">2. Gestisci alimentazione e salute</h4>
                            <p>Monitora pasti, mute, feci e visite veterinarie con un click.</p>
                        </div>
                        <div>
                            <EggFried className="mx-auto mb-4 h-16 w-16 text-[#228B22]" />
                            <h4 className="text-xl font-semibold mb-2">3. Organizza le riproduzioni</h4>
                            <p>Pianifica accoppiamenti, nascite e segui la crescita dei baby.</p>
                        </div>
                    </div>
                </section>
                {/* Screenshot o preview */}
                <section className="py-16 border-t border-gray-300 text-center">
                    <h2 className="text-3xl font-bold mb-6">SnakeBee mantiene i tuoi dati al sicuro</h2>
                    <p className="text-gray-700 mb-8">Un’interfaccia semplice, veloce e pensata per gli allevatori.</p>
                    <img
                        src="/dashboard.png"
                        alt="Anteprima dashboard"
                        className="mx-auto rounded-lg shadow-lg border border-gray-200"
                    />
                </section>

                {/* Servizi */}
                <section id="servizi" className="py-16 border-t border-gray-300">
                    <h3 className="text-3xl font-bold mb-6">Cosa puoi fare con SnakeBee</h3>
                    <ul className="grid sm:grid-cols-2 gap-4 list-disc ml-6 text-gray-800">
                        <li><strong>Gestione rettili:</strong> peso, alimentazione, eventi sanitari e altro.</li>
                        <li><strong>Riproduzione:</strong> accoppiamenti, incubazione, baby tracking.</li>
                        <li><strong>Supporto notifiche:</strong> email automatiche per i pasti.</li>
                        <li><strong>Dati organizzati:</strong> filtra per specie, sesso, età o morph.</li>
                    </ul>
                </section>
                {/* Approfondimento Servizi */}
                <section className="py-16 border-t border-gray-300">
                    <h2 className="text-3xl font-bold text-center mb-12">Approfondimento sui Servizi</h2>
                    <div className="space-y-8 text-gray-800 max-w-4xl mx-auto text-lg leading-relaxed">
                        <div>
                            <h4 className="text-xl font-semibold mb-2">🦎 Gestione rettili</h4>
                            <p>
                                Inserisci e gestisci ogni rettile nel tuo allevamento, con informazioni su specie, morph, sesso,
                                peso, alimentazione, salute e moltissimo altro. Ogni rettile ha una scheda completa, sempre a portata di click.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">🐍 Riproduzione</h4>
                            <p>
                                Organizza le riproduzioni in modo strutturato: scegli i genitori, monitora le date di accoppiamento, uova, schiuse,
                                e tieni traccia dello sviluppo dei cuccioli fino alla cessione.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">📩 Notifiche email automatiche</h4>
                            <p>
                                Ricevi notifiche via email per ricordarti i pasti programmati dei tuoi animali. Niente più dimenticanze o disorganizzazione!
                                In futuro, potrai personalizzare questi promemoria e aggiungere altre notifiche utili.
                            </p>
                        </div>
                        <div className="text-sm text-gray-600 italic pt-4 border-t border-gray-200">
                            Alcune funzionalità potranno essere limitate nei piani gratuiti. In futuro verranno sbloccate con abbonamenti economici,
                            pensati per supportare il progetto senza sacrificare l’accessibilità.
                        </div>
                    </div>
                </section>

                {/* COSA VOGLIAMO COSTRUIRE */}
                <section className="py-16 border-t border-gray-300 text-center">
                    <h2 className="text-3xl font-bold mb-6">Cosa vogliamo costruire</h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        SnakeBee è appena nata, ma abbiamo grandi obiettivi. Vogliamo diventare il punto di riferimento per allevatori di rettili in Italia,
                        offrendo strumenti sempre più avanzati, una community attiva e un ecosistema completo.
                    </p>
                </section>

                {/* SUPPORTO / DONAZIONI */}
                <section className="py-16 border-t border-gray-300 text-center">
                    <h3 className="text-3xl font-bold mb-4">Supporta il progetto</h3>
                    <p className="text-gray-700 mb-6 max-w-xl mx-auto">
                        SnakeBee è un progetto indipendente, nato dalla passione di un allevatore. Se ti piace quello che stiamo costruendo, puoi aiutarci a crescere.
                    </p>
                    <a
                        href="https://www.paypal.com/donate/?hosted_button_id=8NYR4QZZ3QGBS"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#228B22] text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition"
                    >
                        💚 Fai una donazione
                    </a>
                </section>
                {/* CHI SIAMO */}
                <section id="chi-siamo" className="py-16 border-t border-gray-300 text-center">
                    <h2 className="text-3xl font-bold mb-6">Chi siamo</h2>
                    <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
                        SnakeBee è nato dall’idea di un allevatore appassionato di rettili, con l’obiettivo di creare uno strumento semplice ma potente
                        per chi, come noi, ha trasformato questa passione in una parte della propria vita. <br /><br />
                        L’intera piattaforma è stata sviluppata da zero, senza finanziamenti, senza team, solo con tanta determinazione e amore per questo mondo.
                        Il nostro scopo è offrire qualcosa di concreto e utile alla community italiana di allevatori, professionisti e appassionati.
                    </p>
                </section>

                {/* CONTATTI */}
                <section id="contatti" className="py-12 border-t border-gray-300 text-center">
                    <h3 className="text-2xl font-semibold mb-4">Contattaci</h3>
                    <p className="text-gray-700">
                        Domande? Suggerimenti? Scrivici a{" "}
                        <a href="mailto:info@snakebee.it" className="text-[#228B22] underline">info@snakebee.it</a>{" "}
                        o seguici su <a href="https://www.instagram.com/snakebeeofficial/" className="underline text-[#228B22]" target="_blank" rel="noreferrer">Instagram</a>.
                    </p>
                </section>

            </main>
        </div>
    );
};

export default Home;
