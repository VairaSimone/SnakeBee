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
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

// --- Icon Components (Heroicons) ---
const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        <div className="mt-2 text-gray-600">{message}</div>
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

// --- Comparison Table Component ---
const ComparisonTable = ({ plansData, onAction, loadingAction }) => {
    const { t } = useTranslation();

    const features = [
        {
            label: t('comparison.animals', 'Numero Animali Registrabili'),
            neophyte: 'Max 5',
            practitioner: 'Max 50',
            breeder: t('comparison.unlimited', 'Illimitati'),
            key: 'neophyte'
        },
        {
            label: t('comparison.events', 'Eventi Base'),
            neophyte: '300',
            practitioner: t('comparison.unlimited', 'Illimitati'),
            breeder: t('comparison.unlimited', 'Illimitati'),
            key: 'practitioner'
        },
        {
            label: t('comparison.images', 'Immagini per Animale'),
            neophyte: '1',
            practitioner: '3',
            breeder: '10',
            key: 'breeder'
        },
        {
            label: t('comparison.marketAds', 'Annunci Market'),
            neophyte: '0',
            practitioner: 'Max 10',
            breeder: t('comparison.unlimited', 'Illimitati')
        },
        {
            label: t('comparison.citesGen', 'Creazione Cites automatici'),
            neophyte: true,
            practitioner: true,
            breeder: true
        },
        {
            label: t('comparison.morphCalc', 'Calcolatore morph Pitoni reali'),
            neophyte: true,
            practitioner: true,
            breeder: true
        },
        {
            label: t('comparison.dataExport', 'Esportazione Dati (Excel)'),
            neophyte: false,
            practitioner: true,
            breeder: true
        },
        {
            label: t('comparison.reminders', 'Promemoria Automatici'),
            neophyte: false,
            practitioner: true,
            breeder: true
        },
        {
            label: t('comparison.bot', 'Bot telegram'),
            neophyte: false,
            practitioner: true,
            breeder: true
        },
        {
            label: t('comparison.reproduction', 'Sezione Riproduzione'),
            neophyte: false,
            practitioner: true,
            breeder: true
        },
        {
            label: t('comparison.foodInventory', 'Inventario cibo'),
            neophyte: false,
            practitioner: false,
            breeder: true
        },
        {
            label: t('comparison.eventCalendar', 'Calendario eventi'),
            neophyte: false,
            practitioner: false,
            breeder: true
        },
        {
            label: t('comparison.pdfReports', 'Report PDF'),
            neophyte: false,
            practitioner: false,
            breeder: true
        },
        {
            label: t('comparison.qrCode', 'QR Code per ogni animale'),
            neophyte: false,
            practitioner: false,
            breeder: true
        },
        {
            label: t('comparison.team', 'Collaboratori/Team'),
            neophyte: false,
            practitioner: false,
            breeder: true
        },
        {
            label: t('comparison.finance', 'Gestione finanziaria'),
            neophyte: false,
            practitioner: false,
            breeder: true
        },
    ];

    const renderCell = (value, isLeftAligned = false) => {
        if (typeof value === 'boolean') {
            return value ? (
                <CheckCircleIcon className={`w-6 h-6 text-green-500 ${isLeftAligned ? '' : 'mx-auto'}`} />
            ) : (
                <span className="text-gray-300 font-bold">-</span>
            );
        }
        return <span className="font-semibold text-gray-700">{value}</span>;
    };

    return (
        <section className="mt-10 max-w-5xl mx-auto px-2 sm:px-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-8">
                {t('comparison.title', 'Confronta nel dettaglio i piani')}
            </h3>

            {/* 1. VISTA MOBILE: Cards Verticali */}
            <div className="block md:hidden space-y-8">
                {plansData.map((plan) => (
                    <div 
                        key={plan.key} 
                        className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all ${
                            plan.isRecommended ? 'border-green-500 ring-2 ring-green-500/20 shadow-lg' : 'border-gray-200'
                        }`}
                    >
                        {/* Header della Card */}
                        <div className={`p-5 text-center border-b border-gray-100 ${plan.isRecommended ? 'bg-green-50/50' : 'bg-gray-50/50'}`}>
                            <div className={`text-xl font-extrabold mb-2 ${plan.isRecommended ? 'text-green-700' : 'text-gray-900'}`}>
                                {plan.title} {plan.isRecommended && '⭐'}
                            </div>
                            
                            <div className="flex justify-center items-center h-12 my-2">
                                {plan.discountedPrice ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-extrabold text-red-600">{plan.discountedPrice}</span>
                                        <span className="text-sm text-gray-400 line-through">{plan.originalPriceValue}</span>
                                        {plan.priceSuffix && <span className="text-gray-500 text-xs">{plan.priceSuffix}</span>}
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-extrabold text-gray-900">{plan.originalPriceValue}</span>
                                        {plan.priceSuffix && <span className="text-gray-500 text-xs">{plan.priceSuffix}</span>}
                                    </div>
                                )}
                            </div>

                            {!plan.hideButton && (
                                <button
                                    onClick={() => onAction(plan.key)}
                                    disabled={loadingAction === plan.key || plan.isDisabled}
                                    className={`w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
                                        plan.isDisabled
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : plan.isRecommended
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                    } ${loadingAction === plan.key ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loadingAction === plan.key ? t('subscriptionPage.loading') : plan.buttonText}
                                </button>
                            )}
                        </div>

                        {/* Lista Caratteristiche del Piano */}
                        <div className="p-5 bg-white divide-y divide-gray-100 text-sm">
                            {features.map((feature, idx) => {
                                const val = feature[plan.key === 'practitioner' ? 'practitioner' : plan.key];
                                return (
                                    <div key={idx} className="py-3 flex justify-between items-center gap-4">
                                        <span className="text-gray-600 font-medium">{feature.label}</span>
                                        <div className="text-right shrink-0">
                                            {renderCell(val, true)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. VISTA DESKTOP: Tabella classica */}
            <div className="hidden md:block overflow-x-auto rounded-2xl shadow-sm border border-gray-200">
                <table className="w-full text-left bg-white border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 md:p-6 font-bold text-gray-800 w-1/4 align-top">
                                <div className="mt-4 text-xl">
                                    {t('comparison.featureHeader', 'Funzionalità')}
                                </div>
                            </th>
                            {plansData.map((plan) => (
                                <th key={plan.key} className={`p-4 md:p-6 text-center w-1/4 align-top ${plan.isRecommended ? 'bg-green-50 border-x-2 border-t-2 border-green-500' : ''}`}>
                                    <div className="flex flex-col h-full items-center justify-between">
                                        <div className={`text-xl font-extrabold mb-4 ${plan.isRecommended ? 'text-green-700' : 'text-gray-900'}`}>
                                            {plan.title} {plan.isRecommended && '⭐'}
                                        </div>

                                        <div className="mb-6 flex flex-col justify-center items-center h-16">
                                            {plan.discountedPrice ? (
                                                <>
                                                    <div>
                                                        <span className="text-3xl font-extrabold text-red-600 tracking-tight">
                                                            {plan.discountedPrice}
                                                        </span>
                                                        <span className="text-xl text-gray-400 line-through ml-2">
                                                            {plan.originalPriceValue}
                                                        </span>
                                                    </div>
                                                    {plan.priceSuffix && (
                                                        <span className="text-gray-500 text-sm">{plan.priceSuffix}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                                        {plan.originalPriceValue}
                                                    </span>
                                                    {plan.priceSuffix && (
                                                        <span className="text-gray-500 ml-1 text-sm">{plan.priceSuffix}</span>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {!plan.hideButton ? (
                                            <button
                                                onClick={() => onAction(plan.key)}
                                                disabled={loadingAction === plan.key || plan.isDisabled}
                                                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all
                                                    ${plan.isDisabled
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : plan.isRecommended
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:scale-[1.02]'
                                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:scale-[1.02]'}
                                                    ${loadingAction === plan.key ? 'opacity-70 cursor-wait' : ''}`}
                                            >
                                                {loadingAction === plan.key ? t('subscriptionPage.loading') : plan.buttonText}
                                            </button>
                                        ) : (
                                            <div className="h-[44px]"></div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {features.map((feature, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 md:p-6 text-gray-800 font-medium">{feature.label}</td>
                                <td className="p-4 md:p-6 text-center">{renderCell(feature.neophyte)}</td>
                                <td className="p-4 md:p-6 text-center bg-green-50 border-x-2 border-green-500">
                                    {renderCell(feature.practitioner)}
                                </td>
                                <td className="p-4 md:p-6 text-center">{renderCell(feature.breeder)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td></td>
                            <td></td>
                            <td className="border-b-2 border-x-2 border-green-500 bg-green-50 h-2"></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};

// --- Market Explanation Section Component ---
const MarketExplanationSection = () => {
    const { t } = useTranslation();
    
    return (
        <section className="mt-20 mb-10">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-4 tracking-wide uppercase">
                        Snakebee Market
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        {t('market.explanation.title', 'Vendi e acquista in totale sicurezza')}
                    </h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        {t('market.explanation.subtitle', 'Il market integrato pensato esclusivamente per erpetofili professionisti e amatoriali.')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                🔄
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('market.explanation.step1_title', 'Sincronizzazione Totale')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {t('market.explanation.step1_desc', 'Pubblica un animale sul market direttamente dalla sua scheda di allevamento in un secondo.')}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                📩
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('market.explanation.step2_title', 'Contatti Diretti')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {t('market.explanation.step2_desc', 'Gli utenti interessati ti contatteranno direttamente tramite i tuoi canali preferiti o social.')}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                🛍️
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('market.explanation.step3_title', 'Vetrina Professionale')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {t('market.explanation.step3_desc', 'Mostra la genealogia, i QR code e la storia dellanimale incrementando il valore percepito.')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
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
    const [billingInterval, setBillingInterval] = useState('monthly');
    const isDelegate = !!localStorage.getItem('operateAsId');

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
                handlePlanAction(pendingPlanKey);
                setPendingPlanKey(null);
            }
        } catch (err) {
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
        if (!user || !user._id) {
            setModal({
                type: 'error',
                title: t('subscriptionPage.modal.accessRequired.title'),
                message: t('subscriptionPage.modal.accessRequired.message'),
                onClose: () => setModal(null)
            });
            return;
        }

        const planKeyUpper = planKey === 'practitioner' ? 'PRACTITIONER' : planKey.toUpperCase();

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
                await manageStripeSubscription(planKeyUpper, user._id, billingInterval);
                onSuccess(t('subscriptionPage.plans.changeSuccess'));
            } else {
                const response = await createStripeCheckout(planKeyUpper, user._id, billingInterval);
                if (response.data.url) {
                    window.location.href = response.data.url;
                } else {
                    throw new Error("Checkout URL not received.");
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
            else throw new Error("Portal URL not received.");
        } catch (err) {
            onError(err);
            onFinally();
        }
    };

    const subscriptionStatus = user?.subscription?.status;
    const currentPlan = user?.subscription?.plan?.toUpperCase();
    const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'pending_cancellation' || subscriptionStatus === 'processing';
    const planWeights = { NEOPHYTE: 0, PRACTITIONER: 1, BREEDER: 2 };
    
    const getTranslatedPlanName = (planKey) => {
        const mappedKey = planKey === 'practitioner' ? 'practitioner' : planKey;
        return t(`subscriptionPage.plans.${mappedKey}.title`);
    };

    const getButtonProps = (planKey) => {
        const mappedKey = planKey === 'practitioner' ? 'practitioner' : planKey;
        if (!isSubscribed) {
            return { text: t(`subscriptionPage.plans.${mappedKey}.button.subscribeNow`), disabled: false };
        }

        const planKeyUpper = planKey === 'practitioner' ? 'PRACTITIONER' : planKey.toUpperCase();
        if (currentPlan === planKeyUpper) {
            return { text: t(`subscriptionPage.plans.${mappedKey}.button.currentPlan`), disabled: true };
        }

        const isUpgrade = planWeights[planKeyUpper] > (planWeights[currentPlan] || 0);
        return {
            text: isUpgrade ? t('subscriptionPage.plans.upgrade') : t('subscriptionPage.plans.changePlan'),
            disabled: false
        };
    };

    const renewalDate = useMemo(() => {
        if (user?.subscription?.currentPeriodEnd) {
            return new Date(user.subscription.currentPeriodEnd).toLocaleDateString(user?.language || 'it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
        }
        return null;
    }, [user]);
    
    const isBlackFridayPeriod = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startDate = new Date(currentYear, 10, 24);
        const endDate = new Date(currentYear, 11, 2);
        return now >= startDate && now < endDate;
    }, []); 

    if (isDelegate) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full mx-4">
                    <FiAlertTriangle className="mx-auto text-yellow-500 w-16 h-16 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('subscriptionPage.delegate.title', 'Accesso Limitato')}</h2>
                    <p className="text-slate-600 mb-6">
                        {t('subscriptionPage.delegate.message', 'Non puoi visualizzare o modificare il profilo, la sicurezza e gli abbonamenti di un account mentre operi come delegato.')}
                    </p>
                    <Link 
                        to="/dashboard" 
                        className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        {t('subscriptionPage.delegate.backBtn', 'Torna alla Dashboard')}
                    </Link>
                </div>
            </div>
        );
    }

    const planKeys = ['neophyte', 'practitioner', 'breeder'];
    const plansData = planKeys.map(planKey => {
        const plan = t(`subscriptionPage.plans.${planKey}`, { returnObjects: true });
        const { text: buttonText, disabled: isDisabled } = getButtonProps(planKey);

        let originalPriceString = plan.price;
        let priceSuffix = originalPriceString.includes('/') ? `/${originalPriceString.split('/')[1]}` : null;
        let originalPriceValue = originalPriceString.split('/')[0];
        
        if (billingInterval === 'yearly' && originalPriceString.includes('€')) {
            const priceMatch = originalPriceString.match(/[\d,.]+/);
            if (priceMatch) {
                const priceNumber = parseFloat(priceMatch[0].replace(',', '.'));
                const yearlyNumber = priceNumber * 10; 
                originalPriceValue = `€${yearlyNumber.toFixed(2)}`;
                priceSuffix = t('subscriptionPage.interval.yearlySuffix', '/anno');
            }
        }
        
        let discountedPrice = null;
        if (isBlackFridayPeriod && originalPriceValue.includes('€')) {
            const priceMatch = originalPriceValue.match(/[\d,.]+/);
            if (priceMatch) {
                const priceNumber = parseFloat(priceMatch[0].replace(',', '.'));
                const discountedNumber = priceNumber * 0.5; 
                discountedPrice = `€${discountedNumber.toFixed(2)}`;
            }
        }
        
        return {
            key: planKey,
            title: plan.title,
            price: originalPriceString,
            originalPriceValue,
            priceSuffix,
            discountedPrice,
            buttonText,
            isDisabled,
            hideButton: !user || planKey === 'neophyte',
            isRecommended: planKey === 'practitioner'
        };
    });

    return (
        <div className="min-h-screen text-gray-800 p-4 sm:p-8 antialiased">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                        {t('subscriptionPage.title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subscriptionPage.subtitle')}</p>
                </header>
                
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
                
                {isSubscribed && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-12 max-w-3xl mx-auto border border-gray-200">
                        <h3 className="text-xl font-bold mb-3 text-gray-800">{t('subscriptionPage.yourSubscription')}</h3>
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
                                    className="font-medium"
                                    dangerouslySetInnerHTML={{
                                        __html: t('subscriptionPage.currentPlan', { plan: getTranslatedPlanName(currentPlan.toLowerCase()) })
                                    }}
                                />
                            )}
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <button 
                                onClick={handlePortalRedirect} 
                                disabled={loadingAction === 'portal'} 
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
                            >
                                {loadingAction === 'portal' ? t('subscriptionPage.loading') : t('subscriptionPage.manageBilling')}
                            </button>
                            
                            {subscriptionStatus !== 'pending_cancellation' && (
                                <button 
                                    onClick={handleCancelSubscription} 
                                    disabled={loadingAction === 'cancel'} 
                                    className="text-gray-400 hover:text-red-500 underline text-sm transition-colors font-medium disabled:opacity-50"
                                >
                                    {loadingAction === 'cancel' ? t('subscriptionPage.cancelling') : t('subscriptionPage.cancelSubscription')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center mb-8 mt-12">
                    <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-full shadow-inner border border-gray-200">
                        <span 
                            className={`text-md px-4 py-2 rounded-full transition-all duration-300 font-semibold cursor-pointer ${billingInterval === 'monthly' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} 
                            onClick={() => setBillingInterval('monthly')}
                        >
                            {t('subscriptionPage.interval.monthly', 'Mensile')}
                        </span>
                        
                        <button
                            onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${billingInterval === 'yearly' ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                        
                        <span 
                            className={`flex items-center text-md px-4 py-2 rounded-full transition-all duration-300 font-semibold cursor-pointer ${billingInterval === 'yearly' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} 
                            onClick={() => setBillingInterval('yearly')}
                        >
                            {t('subscriptionPage.interval.yearly', 'Annuale')}
                            <span className="ml-2 text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-md animate-pulse">
                                -16%
                            </span>
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 font-medium">{t('subscriptionPage.interval.yearlyBenefit', 'Con il piano annuale ricevi 2 mesi in regalo!')}</p>
                </div>

                <ComparisonTable 
                    plansData={plansData} 
                    onAction={handlePlanAction} 
                    loadingAction={loadingAction} 
                />

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
                                className="border rounded p-2 w-full mt-2 text-black"
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