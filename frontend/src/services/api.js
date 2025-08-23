import axios from 'axios';
import { loginUser, logoutUser, selectLanguage } from '../features/userSlice';
export const getEvents = (reptileId) => api.get(`/reptile/events/${reptileId}`);
export const postEvent = (event) => api.post('/reptile/events', event);
export const deleteEvent = (eventId) => api.delete(`/reptile/events/${eventId}`);
export const createStripeCheckout = (plan, userId) => api.post('/stripe/create-checkout-session', { plan, userId });
export const manageStripeSubscription = (newPlan, userId) => api.post('/stripe/manage-subscription', { newPlan, userId });
export const cancelStripeSubscription = (userId) => api.post('/stripe/cancel-subscription', { userId });
export const createStripePortalSession = (userId) => api.post('/stripe/create-portal-session', { userId });
export const getCalendarEvents = (reptileId) =>
    api.get(`/calendar${reptileId ? `?reptileId=${reptileId}` : ""}`);

export const createCustomCalendarEvent = (event) =>
    api.post("/calendar/custom", event);

export const deleteCustomCalendarEvent = (eventId) =>
    api.delete(`/calendar/custom/${eventId}`);


let currentLanguage = navigator.language.split('-')[0] || 'it';
let reduxStore;
export const injectStore = (_store) => {
    reduxStore = _store;
};
export const setApiLanguage = (lang) => {
    currentLanguage = lang;
};

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    withCredentials: true,
});
function forceLogout() {
    reduxStore?.dispatch?.(logoutUser());
    localStorage.removeItem('token');
    reduxStore?.dispatch?.({ type: 'persist/PURGE' });
        localStorage.removeItem('persist:root');
    localStorage.removeItem('persist:user');
    // niente più refreshToken in localStorage: vive nei cookie httpOnly
    const isOnLoginPage = window.location.pathname.startsWith('/login');
    if (!isOnLoginPage) {
        window.location.href = '/login';
    }
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['Accept-Language'] = currentLanguage;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
let refreshPromise = null;

api.interceptors.response.use(

    response => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const isRefreshCall = originalRequest?.url?.includes('/v1/refresh-token');

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!refreshPromise) {
                refreshPromise = axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/v1/refresh-token`,
                    null,
                    { withCredentials: true }
                ).then(res => {
                    const newAT = res.data?.accessToken;
                    if (!newAT) throw new Error("No accessToken in refresh response");
                    localStorage.setItem('token', newAT);
                    return newAT;
                }).finally(() => {
                    refreshPromise = null;
                });
            }

            try {
                const newToken = await refreshPromise;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch {
                forceLogout();
                return Promise.reject(error);
            }
        }

        if (isRefreshCall && (status === 401 || status === 403)) {
            forceLogout();
        } return Promise.reject(error);
    }
);

export default api;
