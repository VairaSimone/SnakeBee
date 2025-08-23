import React from 'react';

export const EventCard = ({ event }) => {
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-black dark:text-black">
                    {new Date(event.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {event.weight && (
                     <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{event.weight} g</p>
                )}
            </div>
            {event.notes && (
                <p className="text-sm text-black dark:text-black mt-1">{event.notes}</p>
            )}
        </div>
    );
};