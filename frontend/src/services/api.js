import axios from 'axios';
import { store } from '../config/store';
import { loginUser, logoutUser } from '../features/userSlice';
export const getEvents = (reptileId) => api.get(`reptile/events/${reptileId}`);
export const postEvent = (event) => api.post('reptile/events', event);
export const deleteEvent = (eventId) => api.delete(`reptile/events/${eventId}`);

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
const refreshToken = localStorage.getItem('refreshToken');

let data;
if (refreshToken) {
  // fallback per Safari
  const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/refresh-token`, null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  data = response.data;
} else {
  // normale cookie-based
  const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/refresh-token`, null, {
    withCredentials: true,
  });
  data = response.data;
}
                if (data.accessToken) {
                    store.dispatch(loginUser(data.accessToken));
                    localStorage.setItem('token', data.accessToken);

                    originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                store.dispatch(logoutUser());
                localStorage.removeItem('token');
                window.location.href = '/login'
            }
        }

        return Promise.reject(error);
    }
);

export default api;
