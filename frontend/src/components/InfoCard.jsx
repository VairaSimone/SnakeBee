import React from 'react';

export const InfoCard = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        {title && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-black dark:text-black">{title}</h3>
            </div>
        )}
        <div className="p-4 space-y-3">
            {children}
        </div>
    </div>
);

export const InfoItem = ({ label, value, children }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-black dark:text-black">{label}</p>
        {value ? <p className="font-semibold text-black dark:text-black text-right">{value}</p> : <div className="text-right">{children}</div>}
    </div>
);