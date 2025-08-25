import React from 'react';
import { useTranslation } from 'react-i18next';

export const FeedingCard = ({ feeding }) => {
        const { t } = useTranslation();

    const wasEaten = feeding.wasEaten;
const formatWeight = (weightInGrams) => {
    if (!weightInGrams && weightInGrams !== 0) return '';
    const kg = weightInGrams / 1000;
    return kg < 1 ? `${weightInGrams} g` : `${kg.toFixed(2)} k`;
};
    return (
        <div className={`relative p-4 rounded-lg border overflow-hidden ${wasEaten ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/50 dark:border-red-800'}`}>
            <div className={`absolute left-0 top-0 h-full w-1.5 ${wasEaten ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            
            <div className="ml-2">
                <div className="flex justify-between items-start">
                    <div>
                         <p className="font-semibold text-black dark:text-black">
                            {new Date(feeding.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-black dark:text-black">{feeding.foodType} ({feeding.quantity || 1} x {formatWeight(feeding.weightPerUnit)|| '-'}g)</p>
                    </div>
                     <p className={`font-bold text-sm ${wasEaten ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                        {wasEaten ? t('feedingCard.eat') : t('feedingCard.dontEat')}
                    </p>
                </div>
                
                <div className="text-sm text-black dark:text-black mt-2">
                     <p>
                        <strong>{t('feedingCard.nextFeeding')}</strong> {new Date(feeding.nextFeedingDate).toLocaleDateString()}
                    </p>
                    {feeding.notes && <p className="mt-1"><strong>{t('feedingCard.note')}</strong> {feeding.notes}</p>}
                </div>
            </div>
        </div>
    );
};