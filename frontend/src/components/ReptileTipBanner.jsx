import React, { useState, useEffect } from 'react';

const tips = [
  "Alcuni rettili hanno bisogno di spot UVB per metabolismo e ossa forti 🦎☀️",
  "Hai mai pensato all’arricchimento ambientale? Tunnels e nascondigli riducono lo stress 🐢",
  "Ricorda: metà del terrario deve essere più fresca, l’altra calda 🌡️ per termoregolazione",
  "Lucertole e gechi amano salire! Aggiungi gradini o rami per stimolarli 🦎",
  "Pressatura di calcio su insetti? No: meglio spolverarli ogni volta 🐛🧂",
  "Pulizia frequente evita muffe: rimuovi feci e vecchie pelli quotidianamente 🧼",
  "La lingua biforcuta dei serpenti serve a 'sniffare' l'ambiente, non solo per stile 😏",
  "I camaleonti non cambiano colore per 'mimetizzarsi' — lo fanno per regolare la temperatura o comunicare 🎨",
  "Mai toccare un serpente subito dopo che ha mangiato. Ha appena fatto un pranzo da re 👑🐍",
  "Non mettere due maschi nello stesso terrario. Se non litigano, si ignorano… o peggio 👊",
  "L’umidità per un pitone reale deve stare tra il 50–60%. Troppa può causare muffa e infezioni 💧",
  "Durante la muta, non forzare la pelle del serpente. Meglio offrire una vaschetta d’acqua tiepida 🛁",
  "Le tartarughe NON ibernano a caso. Serve temperatura e controllo o rischiano la vita ❄️",
  "Lo sapevi? I serpenti non hanno palpebre. Quello che vedi è una 'squama oculare' 🐍👁️",
  "Mai mettere le mani in un terrario subito dopo aver maneggiato cibo. Sei tu lo snack ora 🍗➡️🖐️",
  "Alcune specie di lucertole rigenerano la coda, ma non è un trucco illimitato. Attenzione! 🔁",
  "Pulisci regolarmente la ciotola dell'acqua: molti batteri amano i beverini stagnanti 🚰",
  "I rettili non sono 'freddi': sono eterotermi! Usano il calore esterno per funzionare 🌞",
    "Mai dare cibo più grande della testa del serpente. È una bocca, non una valigia 🧳🐍",
  "Un terrario senza nascondigli è come una casa senza bagno: non vivibile 😅",
  "Non tutti i rettili mordono… ma quelli che lo fanno hanno perfetta mira 😬🎯",
  "Alcuni serpenti fischiano o soffiano. Non sono arrabbiati. Sono solo drama queen 🐍💨",
  "Non usare substrati profumati. I rettili non vogliono vivere in un deodorante per auto 🌲😵",

];

const quizzes = [
  {
    question: "Qual è la differenza tra un boa e un pitone?",
    options: [
      "I colori",
      "Le scaglie",
      "Il modo in cui uccidono la preda"
    ],
    correctIndex: 2,
    reactions: [
      "Oops, torna a leggere su Wikipedia 🐢",
      "Nope! Le scaglie non c'entrano 🧩",
      "Bravo, rettile saggio! 🐍✨"
    ]
  },
  {
    question: "Perché i camaleonti cambiano colore?",
    options: [
      "Per mimetizzarsi",
      "Per comunicare e regolare la temperatura",
      "Per moda"
    ],
    correctIndex: 1,
    reactions: [
      "No, non è solo mimetismo! 🦎",
      "Esatto! Sei un esperto di camouflage mentale 🧠🎨",
      "Hmm, questa non è una sfilata di moda 😅"
    ]
  },{
    question: "Quale tra questi NON è un rettile?",
    options: [
      "Geco",
      "Axolotl",
      "Varano"
    ],
    correctIndex: 1,
    reactions: [
      "No, il geco è un rettile 🦎",
      "Esatto! L’Axolotl è un anfibio 🐸",
      "No, il varano è un lucertolone serio 🦖"
    ]
  },
  {
    question: "I serpenti sentono i suoni…?",
    options: [
      "Con le orecchie interne",
      "Con la lingua",
      "Non sentono nulla"
    ],
    correctIndex: 0,
    reactions: [
      "Corretto! Hanno orecchie interne collegate al cranio 🎧🐍",
      "Non proprio… la lingua serve per gli odori 👅",
      "Sbagliato! Sentono le vibrazioni, non sono sordi 😌"
    ]
  },
  {
    question: "Cos'è il 'brumation' nei rettili?",
    options: [
      "Una danza di accoppiamento",
      "Un letargo controllato",
      "Una muta della pelle"
    ],
    correctIndex: 1,
    reactions: [
      "Nope! Non stanno facendo il moonwalk 🕺",
      "Esatto! È una specie di letargo nei rettili 💤",
      "Non confonderla con la muta! 📜"
    ]
  },
  {
    question: "Cosa può causare una muta incompleta?",
    options: [
      "Troppa luce",
      "Mancanza di umidità",
      "Cibo troppo piccolo"
    ],
    correctIndex: 1,
    reactions: [
      "No, la luce non c'entra molto qui 🌞❌",
      "Perfetto! Serve umidità per una muta perfetta 💧",
      "Cibo piccolo = muta peggiore? Non proprio 🤏"
    ]
  },
  {
    question: "I rettili hanno sangue…",
    options: [
      "Caldo",
      "Freddo",
      "Dipende dalla specie"
    ],
    correctIndex: 1,
    reactions: [
      "No, quello è per i mammiferi 🐻",
      "Esatto! Sono ectotermi, usano fonti esterne 🌡️",
      "Nah, è una regola abbastanza generale 🔁"
    ]
  },
  {
    question: "Perché i serpenti tirano fuori la lingua così spesso?",
    options: [
      "Per sembrare minacciosi",
      "Per termoregolarsi",
      "Per annusare l’ambiente"
    ],
    correctIndex: 2,
    reactions: [
      "Non è solo atteggiamento da cattivo 🐍😎",
      "La termoregolazione è un’altra storia 🌡️",
      "Bravissimo! È il loro modo di ‘sniffare’ l’aria 👅🧪"
    ]
  },
  {
    question: "Un pitone reale adulto può vivere quanti anni?",
    options: [
      "5–8 anni",
      "10–15 anni",
      "20–30 anni"
    ],
    correctIndex: 2,
    reactions: [
      "Troppo pochi! Non è un criceto 🐹",
      "Un po' meglio, ma ancora corto 🕰️",
      "Yes! Possono vivere anche più di 25 anni 🐍🎂"
    ]
  },
  {
    question: "Qual è la funzione delle unghie nelle tartarughe terrestri?",
    options: [
      "Per difendersi",
      "Per scavare",
      "Per arrampicarsi"
    ],
    correctIndex: 1,
    reactions: [
      "Non sono Wolverine 🐢❌",
      "Bravo! Amano scavare tane e buche 🕳️",
      "Nope, non sono gechi 😅"
    ]
  }, {
  question: "Cosa succede se maneggi un serpente subito dopo che ha mangiato?",
  options: [
    "Si affeziona di più",
    "Potrebbe rigurgitare",
    "Diventa più docile"
  ],
  correctIndex: 1,
  reactions: [
    "Affezionato sì, ma con calma 😅",
    "Esatto! Potrebbe rigurgitare per stress 🤮",
    "Eh no, lo stress lo rende nervoso, non docile 😬"
  ]
},
{
  question: "I gechi leopardo hanno palpebre?",
  options: [
    "Sì, e possono anche sbatterle",
    "No, usano la lingua per pulirsi gli occhi",
    "Solo i maschi"
  ],
  correctIndex: 0,
  reactions: [
    "Giusto! Sono tra i pochi gechi con palpebre vere 💤",
    "Quelli senza palpebre fanno così, ma non i leopardini 🦎👁️",
    "Questa la inventi tu eh 😂"
  ]
},
{
  question: "Che tipo di luce serve per la sintesi della vitamina D3 nei rettili?",
  options: [
    "Luce LED",
    "Luce UVB",
    "Luce infrarossa"
  ],
  correctIndex: 1,
  reactions: [
    "No, i LED sono belli ma inutili per questo 😎",
    "Perfetto! L'UVB è fondamentale per le ossa 💡🦎",
    "L'infrarosso scalda, ma non aiuta col calcio 🔥"
  ]
},
{
  question: "Un serpente può chiudere gli occhi?",
  options: [
    "Sì, quando dorme",
    "No, ha una scala oculare",
    "Solo se è arrabbiato"
  ],
  correctIndex: 1,
  reactions: [
    "Nope, niente palpebre per loro 😴❌",
    "Esattamente! Ha una squama trasparente sull’occhio 👁️🐍",
    "Se potesse farlo ti giudicherebbe ad occhi chiusi 😆"
  ]
},
{
  question: "Qual è il comportamento tipico di un rettile stressato?",
  options: [
    "Sbadiglia",
    "Rimane immobile o scappa",
    "Si mette a cantare"
  ],
  correctIndex: 1,
  reactions: [
    "Lo sbadiglio può essere altro, ma non è stress diretto 😬",
    "Esatto! È un meccanismo difensivo o di fuga 🏃‍♂️🐢",
    "Se inizia a cantare, vendilo a Netflix 🎤🦎"
  ]
},
{
  question: "Quale substrato è *pericoloso* per i serpenti?",
  options: [
    "Giornale",
    "Sabbia fine",
    "Fibre di cocco"
  ],
  correctIndex: 1,
  reactions: [
    "Il giornale non è bello, ma almeno è sicuro 🗞️",
    "Bravo! La sabbia può causare ostruzioni intestinali 🚫🐍",
    "Cocco va bene, se tenuto pulito 🥥"
  ]
},
{
  question: "Ogni quanto muta un serpente sano, in media?",
  options: [
    "Ogni 3–4 mesi",
    "Ogni settimana",
    "Ogni 4–6 settimane"
  ],
  correctIndex: 2,
  reactions: [
    "Un po’ troppo poco… mutano più spesso! 🔁",
    "Settimana?! Non è Spider-Man 🕸️",
    "Esatto! Circa una volta al mese, se cresce normalmente 🐍"
  ]
},
{
  question: "Cosa indica una lingua biforcuta nei serpenti?",
  options: [
    "Serve a respirare meglio",
    "Serve per percepire odori direzionali",
    "È solo estetica"
  ],
  correctIndex: 1,
  reactions: [
    "Respirano dal naso, non dalla lingua! 👃",
    "Perfetto! È come avere due nasi mobili 😁",
    "No dai, non sono influencer 😅"
  ]
},
{
  question: "Qual è la temperatura ideale nella zona calda per un pitone reale?",
  options: [
    "20–23°C",
    "28–32°C",
    "35–40°C"
  ],
  correctIndex: 1,
  reactions: [
    "Troppo freddo, povero pitone 🥶",
    "Esatto! Perfetto per digerire e stare attivo 🔥🐍",
    "Troppo caldo: si fa il barbecue da solo 😨"
  ]
},
{
  question: "Cosa succede se non dai abbastanza calcio a un rettile?",
  options: [
    "Diventa albino",
    "Sviluppa MBD (malattia metabolica ossea)",
    "Perde la coda"
  ],
  correctIndex: 1,
  reactions: [
    "No, l'albinismo è genetico 🎨",
    "Esatto! Il calcio è vitale per lo scheletro 🦴🦎",
    "Perdere la coda ha altre cause (e spesso solo i gechi) 🔁"
  ]
}
];

const ReptileTipBanner = () => {
  const [show, setShow] = useState(false);
  const [tip, setTip] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  
  useEffect(() => {
    if (sessionStorage.getItem('hideReptileTipBanner')) return;

    const chance = Math.random();
    if (chance < 0.4) {
      if (Math.random() < 0.3) {
        const idx = Math.floor(Math.random() * quizzes.length);
        setQuiz(quizzes[idx]);
      } else {
        const idx = Math.floor(Math.random() * tips.length);
        setTip(tips[idx]);
      }
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('hideReptileTipBanner', 'true');
  };

    const handleAnswer = (index) => {
    setUserAnswer(index);
    setTimeout(() => {
      handleClose();
    }, 2500); // Chiude dopo il feedback
  };

  if (!show) return null;

  return (
 <div className="fixed top-4 left-4 bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg shadow-lg z-50 max-w-xs animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <p className="text-sm font-semibold">{quiz ? "Quiz Reptiliano 🧠" : "Reptile Tip"}</p>
          {!quiz && <p className="text-xs mt-1">{tip}</p>}

          {quiz && (
            <div className="text-xs mt-1">
              <p className="mb-2">{quiz.question}</p>
              {quiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={userAnswer !== null}
                  className={`block w-full text-left py-1 px-2 rounded mb-1 
                    ${userAnswer === null ? 'hover:bg-green-200' : ''}
                    ${userAnswer !== null && i === userAnswer
                      ? (i === quiz.correctIndex ? 'bg-green-300' : 'bg-red-200')
                      : ''}
                  `}
                >
                  {quiz.correctIndex === i && userAnswer !== null && "✅ "}
                  {userAnswer !== null && i === userAnswer && i !== quiz.correctIndex && "❌ "}
                  {opt}
                </button>
              ))}
              {userAnswer !== null && (
                <p className="mt-2 italic text-green-700">
                  {quiz.reactions[userAnswer]}
                </p>
              )}
            </div>
          )}
        </div>
        <button onClick={handleClose} className="ml-4 text-sm text-green-700 hover:text-green-900">✕</button>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReptileTipBanner;
