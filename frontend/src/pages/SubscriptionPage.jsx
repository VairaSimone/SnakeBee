import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import api, {
    createStripeCheckout,
    manageStripeSubscription,
    cancelStripeSubscription,
    createStripePortalSession
} from '../services/api.js';
import { selectUser, updateUserFiscalDetails } from '../features/userSlice.jsx';

// --- Icon Components (Heroicons) ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TicketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94c-.956.309-2.1.672-3.146.945a.75.75 0 01-.854.75 3 3 0 010-6c.414 0 .75.336.75.75v1.94c.956.309 2.1.672 3.146.945A.75.75 0 0121 6v12a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-1.94c-.956-.309-2.1-.672-3.146-.945a.75.75 0 01-.854-.75 3 3 0 010 6c-.414 0-.75-.336-.75-.75z" clipRule="evenodd" />
        <path d="M12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" />
    </svg>
);

const ModalIcon = ({ type }) => {
    const iconStyles = "w-10 h-10";
    const icons = {
        success: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconStyles} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        error: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconStyles} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        warning: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconStyles} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        info: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconStyles} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return icons[type] || icons['info'];
};

// --- Modal Component ---
const Modal = ({ type = 'info', title, message, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const confirmButtonColors = {
        success: 'bg-green-600 hover:bg-green-700',
        error: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        info: 'bg-blue-600 hover:bg-blue-700',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 scale-100">
                <div className="flex items-start">
                    <div className="mr-4 shrink-0">
                        <ModalIcon type={type} />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                        <p className="mt-2 text-gray-600">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors ${confirmButtonColors[type]}`}
                        >
                            {t('subscriptionPage.modal.confirm')}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2 rounded-lg transition-colors"
                    >
                        {t('subscriptionPage.modal.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Market Explanation Section Component ---
const MarketExplanationSection = () => {
    const { t } = useTranslation();
    
    return (
        <section className="mt-20 mb-10">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-4 tracking-wide uppercase">
                        Snakebee Market
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        {t('market.explanation.title')}
                    </h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        {t('market.explanation.subtitle')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                🔄
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('market.explanation.step1_title')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {t('market.explanation.step1_desc')}
                            </p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                📩
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('market.explanation.step2_title')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {t('market.explanation.step2_desc')}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                🛍️
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('market.explanation.step3_title')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {t('market.explanation.step3_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-center gap-3 text-left md:text-center md:items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-600 shrink-0">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        <p className="text-amber-900 text-sm font-medium">
                            {t('market.explanation.note')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};


// --- PlanCard Component ---
const PlanCard = ({
    title,
    price,
    discountedPrice,
    description,
    features,
    planKey,
    onAction,
    isLoading,
    buttonText,
    isDisabled,
    hideButton,
    isRecommended
}) => {
    const { t } = useTranslation();
    const priceSuffix = price.includes('/') ? `/${price.split('/')[1]}` : null;
    const originalPriceValue = price.split('/')[0];

    return (
        <div className={`relative flex flex-col rounded-2xl p-8 shadow-md transition-all duration-300 ${isDisabled ? 'border border-indigo-400 bg-slate-50' : 'bg-white border border-gray-200'} ${isRecommended ? 'border-2 border-green-500 shadow-lg shadow-green-100' : ''} hover:shadow-xl hover:scale-[1.02]`}>
            {/* Badge sopra */}
            {isRecommended && !isDisabled && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    ⭐ {t('subscriptionPage.plans.popular')}
                </div>
            )}
            {isDisabled && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {t('subscriptionPage.plans.currentPlan')}
                </div>
            )}

            {/* Contenuto */}
            <div className="text-center flex flex-col flex-grow">
                <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
                {Array.isArray(description) ? (
                    description.map((line, idx) => (
                        <p key={idx} className="text-gray-500 text-sm mt-2">{line}</p>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm mt-2">{description}</p>
                )}

                {/* --- BLOCCO PREZZO AGGIORNATO --- */}
                <div className="my-6 h-16 flex flex-col justify-center items-center">
                    {discountedPrice ? (
                        <>
                            {/* Prezzo Scontato */}
                            <div>
                                <span className="text-4xl font-extrabold text-red-600 tracking-tight">
                                    {discountedPrice}
                                </span>
                                {/* Prezzo Originale Barrato */}
                                <span className="text-2xl text-gray-400 line-through ml-2">
                                    {originalPriceValue}
                                </span>
                            </div>
                            {/* Suffisso (es. /mese) */}
                            {priceSuffix && (
                                <span className="text-gray-500 text-lg">{priceSuffix}</span>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Logica Originale (per piano Gratis) */}
                            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{originalPriceValue}</span>
                            {priceSuffix && (
                                <span className="text-gray-500 ml-1 text-lg">{priceSuffix}</span>
                            )}
                        </>
                    )}
                </div>
                {/* --- FINE BLOCCO PREZZO --- */}


                <ul className="space-y-3 text-left mb-8">
                    {features?.map((feature, index) => {
                        // --- LOGICA DI RENDER FEATURE SPECIALE ---
                        // Se la feature è un oggetto con isPromo: true, renderizzala in modo diverso
                        if (typeof feature === 'object' && feature.isPromo) {
                            return (
                                <li key={index} className={`flex items-center p-3 rounded-lg border ${feature.highlightClass} shadow-sm animate-pulse-slow`}>
                                    <div className={`mr-3 shrink-0 ${feature.iconClass}`}>
                                        <TicketIcon />
                                    </div>
                                    <span className={`font-bold text-sm ${feature.textClass}`}>
                                        {feature.text}
                                    </span>
                                </li>
                            );
                        }

                        // Render standard
                        return (
                            <li key={index} className="flex items-start">
                                <div className="text-green-500 mr-3 mt-1 shrink-0">
                                    <CheckCircleIcon />
                                </div>
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        );
                    })}
                </ul>

                {!hideButton && (
                    <button
                        onClick={() => onAction(planKey)}
                        disabled={isLoading || isDisabled}
                        className={`mt-auto w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all
    ${isDisabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isRecommended
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-300 hover:shadow-green-400 hover:scale-[1.02]'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-[1.01]'}
    ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isLoading ? t('subscriptionPage.loading') : buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main SubscriptionPage Component ---
const SubscriptionPage = () => {
    const { t } = useTranslation();
    const [loadingAction, setLoadingAction] = useState(null);
    const [modal, setModal] = useState(null);
    const user = useSelector(selectUser);
    const [taxCode, setTaxCode] = useState(user?.fiscalDetails?.taxCode || "");
    const [showTaxCodeModal, setShowTaxCodeModal] = useState(false);
    const [pendingPlanKey, setPendingPlanKey] = useState(null);
    const dispatch = useDispatch();


    const requestTaxCode = (planKey) => {
        setPendingPlanKey(planKey);
        setShowTaxCodeModal(true);
    };

    const confirmTaxCode = async () => {
        try {
            await api.patch(`/user/fiscalDetails`, { taxCode });
            dispatch(updateUserFiscalDetails({ taxCode }));
            setShowTaxCodeModal(false);
            if (pendingPlanKey) {
                handlePlanAction(pendingPlanKey); // retry
                setPendingPlanKey(null);
            }
        } catch (err) {
            // Show a modal instead of alert
            setModal({
                type: 'error',
                title: t('subscriptionPage.modal.errorTitle'),
                message: t('subscriptionPage.modal.invalidTaxCode'),
                onClose: () => setModal(null),
            });
        }
    };
    const handleApiResponse = () => ({
        onSuccess: (message) => setModal({ type: 'success', title: t('subscriptionPage.modal.successTitle'), message, onClose: () => window.location.reload() }),
        onError: (err) => setModal({ type: 'error', title: t('subscriptionPage.modal.errorTitle'), message: err.response?.data?.error || t('subscriptionPage.modal.errorMessage'), onClose: () => setModal(null) }),
        onFinally: () => setLoadingAction(null)
    });

    const handlePlanAction = async (planKey) => {
        const userCountry = user?.billingDetails?.address?.country || user.language;
        const userTaxCode = user?.fiscalDetails?.taxCode;

        //    if (userCountry.toLowerCase() === "it" && !userTaxCode) {
        //     return requestTaxCode(planKey);
        // }
        if (!user || !user._id) {
            setModal({
                type: 'error',
                title: t('subscriptionPage.modal.accessRequired.title'),
                message: t('subscriptionPage.modal.accessRequired.message'),
                onClose: () => setModal(null)
            });
            return;
        }

        const planKeyUpper = planKey.toUpperCase();

        // 🔒 se l’utente ha già il piano corrente → blocca e apri portale
        if (
            (user.subscription?.status === 'active' || user.subscription?.status === 'processing') &&
            user.subscription.plan === planKeyUpper
        ) {
            return handlePortalRedirect();
        }

        setLoadingAction(planKey);
        const { onSuccess, onError, onFinally } = handleApiResponse();

        try {
            if ((user.subscription?.status === 'active' || user.subscription?.status === 'processing') && user.subscription.plan !== planKeyUpper) {
                await manageStripeSubscription(planKeyUpper, user._id);
                onSuccess(t('subscriptionPage.plans.changeSuccess'));
            } else {
                const response = await createStripeCheckout(planKeyUpper, user._id);
                if (response.data.url) {
                    window.location.href = response.data.url;
                } else {
                    throw new Error("URL di checkout non ricevuto.");
                }
            }
        } catch (err) {
            onError(err);
            onFinally();
        }
    };
    const handleCancelSubscription = () => {
        setModal({
            type: 'warning',
            title: t('subscriptionPage.modal.cancelSubscription.title'),
            message: t('subscriptionPage.modal.cancelSubscription.message'),
            onClose: () => setModal(null),
            onConfirm: async () => {
                setModal(null);
                setLoadingAction('cancel');
                const { onSuccess, onError, onFinally } = handleApiResponse();
                try {
                    await cancelStripeSubscription(user._id);
                    onSuccess(t('subscriptionPage.modal.cancelSubscription.successMessage'));
                } catch (err) {
                    onError(err);
                } finally {
                    onFinally();
                }
            }
        });
    };

    const handlePortalRedirect = async () => {
        setLoadingAction('portal');
        const { onError, onFinally } = handleApiResponse();
        try {
            const response = await createStripePortalSession(user._id);
            if (response.data.url) window.location.href = response.data.url;
            else throw new Error("URL del portale non ricevuto.");
        } catch (err) {
            onError(err);
            onFinally();
        }
    };

    const subscriptionStatus = user?.subscription?.status;
    const currentPlan = user?.subscription?.plan?.toUpperCase();
    const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'pending_cancellation' || subscriptionStatus === 'processing';;
    const planWeights = { NEOPHYTE: 0, APPRENTICE: 1, PRACTITIONER: 2, BREEDER: 3 };
    const getTranslatedPlanName = (planKey) => {
        return t(`subscriptionPage.plans.${planKey}.title`);
    };

    const getButtonProps = (planKey) => {
        if (!isSubscribed) {
            return { text: t(`subscriptionPage.plans.${planKey}.button.subscribeNow`), disabled: false };
        }

        if (currentPlan === planKey.toUpperCase()) {
            return { text: t(`subscriptionPage.plans.${planKey}.button.currentPlan`), disabled: true };
        }

        const isUpgrade = planWeights[planKey.toUpperCase()] > planWeights[currentPlan];
        return {
            text: isUpgrade ? t('subscriptionPage.plans.upgrade') : t('subscriptionPage.plans.changePlan'),
            disabled: false
        };
    };

    const renewalDate = useMemo(() => {
        if (user?.subscription?.currentPeriodEnd) {
            return new Date(user.subscription.currentPeriodEnd).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
        }
        return null;
    }, [user]);
    const isBlackFridayPeriod = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        // Mese 10 = Novembre (0-indexed)
        const startDate = new Date(currentYear, 10, 24);
        // Mese 11 = Dicembre. Mettiamo il 2 per includere tutto il 1° Dicembre
        const endDate = new Date(currentYear, 11, 2);

        // Per testare, puoi de-commentare una di queste righe:
        // return true; // Forza la visualizzazione
        // return false; // Forza a nascondere

        return now >= startDate && now < endDate;
    }, []); // Dipendenze vuote: calcola solo una volta
    // --- FINE LOGICA DATE ---
    return (
        <div className="min-h-screen text-gray-800 p-4 sm:p-8 antialiased">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                        {t('subscriptionPage.title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subscriptionPage.subtitle')}</p>
                </header>
                {/* --- INIZIO BLOCCO BLACK FRIDAY (TEMA CALDO) --- */}
                {isBlackFridayPeriod && (
                    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white rounded-2xl p-6 sm:p-8 text-center mb-12 shadow-xl max-w-4xl mx-auto border-4 border-yellow-300">
                        <h2 className="text-3xl font-extrabold text-yellow-300 tracking-tight drop-shadow-md">
                            {t('subscriptionPage.blackFriday.title')}
                        </h2>
                        <p className="mt-2 text-2xl font-bold drop-shadow-sm">
                            {t('subscriptionPage.blackFriday.subtitle')}
                        </p>
                        <p className="mt-3 text-gray-100 text-lg">
                            {t('subscriptionPage.blackFriday.duration')}
                        </p>
                        <p
                            className="mt-3 text-gray-100 text-lg"
                            dangerouslySetInnerHTML={{
                                __html: t('subscriptionPage.blackFriday.instructions')
                            }}
                        />
                        <p className="mt-2 text-gray-200 text-sm">
                            {t('subscriptionPage.blackFriday.terms')}
                        </p>
                    </div>
                )}
                {/* --- FINE BLOCCO BLACK FRIDAY --- */}                {/* --- FINE BLOCCO BLACK FRIDAY --- */}                {isSubscribed && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-12 max-w-3xl mx-auto border border-gray-200">
                        <h3 className="text-xl font-bold mb-3">{t('subscriptionPage.yourSubscription')}</h3>
                        <div className="text-gray-700">
                            {subscriptionStatus === 'pending_cancellation' ? (
                                <p
                                    className="font-semibold text-yellow-600"
                                    dangerouslySetInnerHTML={{
                                        __html: t('subscriptionPage.pendingCancellation', { plan: getTranslatedPlanName(currentPlan.toLowerCase()), date: renewalDate })
                                    }}
                                />
                            ) : (
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: t('subscriptionPage.currentPlan', { plan: getTranslatedPlanName(currentPlan.toLowerCase()) })
                                    }}
                                />
                            )}

                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <button onClick={handlePortalRedirect} disabled={loadingAction === 'portal'} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-indigo-300">
                                {loadingAction === 'portal' ? t('subscriptionPage.loading') : t('subscriptionPage.manageBilling')}
                            </button>
                            {subscriptionStatus !== 'pending_cancellation' && (
                                <button onClick={handleCancelSubscription} disabled={loadingAction === 'cancel'} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-red-300">
                                    {loadingAction === 'cancel' ? t('subscriptionPage.cancelling') : t('subscriptionPage.cancelSubscription')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch justify-center">
                    {['neophyte', 'apprentice', 'practitioner', 'breeder'].map(planKey => {
                        const plan = t(`subscriptionPage.plans.${planKey}`, { returnObjects: true });
                        const { text: buttonText, disabled: isDisabled } = getButtonProps(planKey);

                        // --- INTEGRAZIONE SNAKEBEE MARKET ---
                        const marketDiscounts = {
                            apprentice: 1,
                            practitioner: 3,
                            breeder: 5
                        };

                        // Clona le features esistenti per non mutare l'oggetto i18n
                        const currentFeatures = plan.features ? [...plan.features] : [];

                        // Aggiunge il buono sconto se previsto per il piano
                        if (marketDiscounts[planKey]) {
                            const isBreeder = planKey === 'breeder'; // Il buono da 5 euro
                            
                            currentFeatures.push({
                                isPromo: true,
                                text: t('market.benefit_label', {
                                    amount: marketDiscounts[planKey],
                                    defaultValue: `Buono mensile Market: ${marketDiscounts[planKey]}€`
                                }),
                                // Stile Gold/Amber per Breeder, Verde brillante per gli altri
                                highlightClass: 'bg-green-50 border-green-300',
                                iconClass:  'text-green-600',
                                textClass:  'text-green-800'
                            });
                        }
                        // --- FINE INTEGRAZIONE ---

                        let discountedPrice = null;
                        const originalPriceString = plan.price; // es. "€8.99/mese"

                        if (isBlackFridayPeriod && originalPriceString.includes('€')) {                            // Estrae il numero (es. "8.99")
                            const priceMatch = originalPriceString.match(/[\d,.]+/);

                            if (priceMatch) {
                                // Sostituisce la virgola con il punto per il calcolo
                                const priceNumber = parseFloat(priceMatch[0].replace(',', '.'));
                                const discountedNumber = priceNumber * 0.5;

                                // Riformatta come stringa di valuta (es. "€4.50")
                                // Usiamo toFixed(2) per forzare due decimali
                                discountedPrice = `€${discountedNumber.toFixed(2)}`;
                            }
                        }
                        return (
                            <PlanCard
                                key={planKey}
                                title={plan.title}
                                price={originalPriceString} // Prezzo originale (es. "€8.99/mese")
                                discountedPrice={discountedPrice} // Nuovo prezzo (es. "€4.50") o null
                                description={plan.description}
                                features={currentFeatures} // Usa la lista aggiornata con i buoni
                                planKey={planKey}
                                onAction={handlePlanAction}
                                isLoading={loadingAction === planKey}
                                buttonText={buttonText}
                                isDisabled={isDisabled}
                                hideButton={!user || planKey === 'neophyte'}
                                isRecommended={planKey === 'practitioner'}
                            />);
                    })}
                </main>
                
                {/* --- NUOVA SEZIONE SPIEGAZIONE MARKET --- */}
                <MarketExplanationSection />
                
                <footer className="mt-20 text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">{t('subscriptionPage.cta.questionTitle')}</h2>
                        <p className="text-gray-600 mb-8 max-w-xl mx-auto">{t('subscriptionPage.cta.questionText')}</p>
                        <a href="mailto:support@snakebee.it" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-transform hover:scale-105">
                            {t('subscriptionPage.cta.contactButton')}
                        </a>
                    </div>
                </footer>
            </div>
            {showTaxCodeModal && (
                <Modal
                    type="info"
                    title={t('subscriptionPage.modal.taxCodeTitle')}
                    message={
                        <div>
                            <p>{t('subscriptionPage.modal.taxCodeMessage')}</p>
                            <input
                                type="text"
                                value={taxCode}
                                onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
                                className="border rounded p-2 w-full mt-2"
                            />
                        </div>
                    }
                    onConfirm={confirmTaxCode}
                    onClose={() => setShowTaxCodeModal(false)}
                />
            )}
            {modal && <Modal {...modal} />}
        </div>
    );
};

export default SubscriptionPage;