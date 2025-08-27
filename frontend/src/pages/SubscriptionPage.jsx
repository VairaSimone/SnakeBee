import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    createStripeCheckout,
    manageStripeSubscription,
    cancelStripeSubscription,
    createStripePortalSession
} from '../services/api.js';
import { selectUser } from '../features/userSlice.jsx';

// --- Icon Components (Heroicons) ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
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

// --- PlanCard Component ---
const PlanCard = ({
    title,
    price,
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

                <div className="my-6">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{price.split('/')[0]}</span>
                    {price.includes('/') && (
                        <span className="text-gray-500 ml-1 text-lg">/{price.split('/')[1]}</span>
                    )}
                </div>

                <ul className="space-y-3 text-left mb-8">
                    {features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <div className="text-green-500 mr-3 mt-1 shrink-0">
                                <CheckCircleIcon />
                            </div>
                            <span className="text-gray-700">{feature}</span>
                        </li>
                    ))}
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

        const planKeyUpper = planKey.toUpperCase();

        // 🔒 se l’utente ha già il piano corrente → blocca e apri portale
if (
  (user.subscription?.status === 'active' || user.subscription?.status === 'processing') &&
  user.subscription.plan === planKeyUpper
){            return handlePortalRedirect();
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

    return (
        <div className="min-h-screen text-gray-800 p-4 sm:p-8 antialiased">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                        {t('subscriptionPage.title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subscriptionPage.subtitle')}</p>
                </header>

                {isSubscribed && (
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
                        return (
                            <PlanCard
                                key={planKey}
                                title={plan.title}
                                price={plan.price}
                                description={plan.description}
                                features={plan.features}
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

            {modal && <Modal {...modal} />}
        </div>
    );
};

export default SubscriptionPage;