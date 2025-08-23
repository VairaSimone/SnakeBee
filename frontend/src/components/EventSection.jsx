import React from 'react';
import { EventCard } from './EventCard'; 
import { useTranslation } from 'react-i18next';

export const EventSection = ({ title, icon, items, visibleCount, onToggleVisibility, renderItem, emptyMessage }) => {
    const hasMore = items.length > visibleCount;
    const isShowingAll = !hasMore && items.length > 5;
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-black dark:text-black mb-4">{icon} {title}</h3>

            {items.length > 0 ? (
                <div className="space-y-4">
                    {items.slice(0, visibleCount).map(item => (
                        renderItem ? renderItem(item) : <EventCard key={item._id} event={item} />
                    ))}
                    
                    {(hasMore || isShowingAll) && (
                        <div className="flex space-x-2 pt-2">
                            {hasMore && (
                                <button
                                    onClick={() => onToggleVisibility(true)}
                                    className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 text-black dark:text-black rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {t('eventSection.other')}
                                </button>
                            )}
                            {isShowingAll && (
                                <button
                                    onClick={() => onToggleVisibility(false)}
                                    className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-700 text-black dark:text-black rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                     {t('eventSection.show')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-4 px-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <p className="text-sm text-black dark:text-black">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
};