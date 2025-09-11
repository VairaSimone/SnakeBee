import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ReptileTipBanner = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [tip, setTip] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);

useEffect(() => {
  if (sessionStorage.getItem('hideReptileTipBanner')) return;

  const allTips = t('ReptileTipBanner.tips', { returnObjects: true });
  const allQuizzes = t('ReptileTipBanner.quizzes', { returnObjects: true });

  const chance = Math.random();
  if (chance < 0.5) {
    if (Math.random() < 0.4) {
      const idx = Math.floor(Math.random() * allQuizzes.length);
      setQuiz(allQuizzes[idx]);
    } else {
      const idx = Math.floor(Math.random() * allTips.length);
      setTip(allTips[idx]);
    }
    setShow(true);
  }
}, [t]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('hideReptileTipBanner', 'true');
  };

  const handleAnswer = (index) => {
    setUserAnswer(index);
    setTimeout(handleClose, 2500);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg shadow-lg z-50 max-w-xs animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <p className="text-sm font-semibold">
            {quiz ? t('ReptileTipBanner.quizTitle') : t('ReptileTipBanner.tipTitle')}
          </p>
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
                      : ''
                    }`}
                >
                  {quiz.correctIndex === i && userAnswer !== null && "✅ "}
                  {userAnswer !== null && i === userAnswer && i !== quiz.correctIndex && "❌ "}
                  {opt}
                </button>
              ))}
              {userAnswer !== null && (
                <p className="mt-2 italic text-green-700">{quiz.reactions[userAnswer]}</p>
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
