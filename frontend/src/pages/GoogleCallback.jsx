import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginUser } from '../features/userSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
    const { t} = useTranslation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
     const language = navigator.language.split('-')[0]|| 'it'

    if (accessToken) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/v1/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
         'Accept-Language': language,
        },
        withCredentials: true,
      })
        .then((res) => {
          dispatch(loginUser(res.data));
          toast.success(t('googleCallback.success'));
          navigate('/dashboard');
        })
        .catch((err) => {
          toast.error(t('googleCallback.error'));
        });
    } else {
      toast.warning(t('googleCallback.warning'));
    }
  }, [navigate, dispatch]);

  return (
    <div className="container">
      <h2>Login in corso...</h2>
    </div>
  );
};

export default GoogleCallback;
