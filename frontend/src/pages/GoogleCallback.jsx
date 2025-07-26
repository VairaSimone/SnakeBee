import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginUser } from '../features/userSlice';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    if (accessToken) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
        .then((res) => {
          dispatch(loginUser(res.data));
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          alert('Errore durante il recupero dei dati utente.');
        });
    } else {
      console.error('Access token mancante');
      alert('Access token mancante. Riprova ad accedere.');
    }
  }, [navigate, dispatch]);

  return (
    <div className="container">
      <h2>Login in corso...</h2>
    </div>
  );
};

export default GoogleCallback;
