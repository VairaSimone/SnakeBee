import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useTranslation } from "react-i18next";
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/userSlice';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}



const SuccessPage = () => {
    const { t} = useTranslation();

  const paymentStatusMap = {
  paid: t('successPage.paid'),
  unpaid: t('successPage.unpaid'),
  no_payment_required: t('successPage.no_payment_required'),
  pending: t('successPage.pending'),
  failed: t('successPage.failed'),
  canceled: t('successPage.canceled'),
  incomplete: t('successPage.incomplete'),
  past_due: t('successPage.past_due'),
  succeeded: t('successPage.succeeded'),
};

  const query = useQuery();
  const sessionId = query.get('session_id');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!sessionId) {
      setError(t('successPage.paidError'));
      return;
    }

 api.get(`/stripe/session/${sessionId}`)
      .then(async (res) => {
        setSessionDetails(res.data);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const meResponse = await api.get(`/v1/me`);
            dispatch(loginUser(meResponse.data));
          } catch (err) {
            console.error("Errore nel refresh user:", err);
          }
        }
      })
      .catch(() => {
        setError(t('successPage.sessionError'));
      });
  }, [sessionId, dispatch, t]);

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  if (error) return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h2 style={{ color: 'black' }}>{t('successPage.error')}</h2>
        <p style={{ color: 'black' }}>{error}</p>
        <button onClick={handleDashboardClick} style={styles.button}>
          {t('successPage.dashboard')}
        </button>
      </div>
    </div>
  );

  if (!sessionDetails) return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <p style={{ color: 'black' }}>{t('successPage.loading')}</p>
      </div>
    </div>
  );

  const paymentStatusTranslated = paymentStatusMap[sessionDetails.payment_status] || t('successPage.unknown');

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h1 style={styles.title}>{t('successPage.paymentCompleted')} <span style={{ color: 'green' }}>✅</span></h1>
        <div style={styles.card}>
          <p><strong>{t('successPage.subscription')}</strong> {sessionDetails.planName || 'N/A'}</p>
          <p><strong>{t('successPage.total')}</strong> €{(sessionDetails.amount_total / 100).toFixed(2)}</p>
          <p><strong>{t('successPage.status')}</strong> {paymentStatusTranslated}</p>
        </div>
        <p style={{ color: 'black' }}>{t('successPage.thanks')}</p>
        <button onClick={handleDashboardClick} style={styles.button}>
          {t('successPage.dashboard')}
        </button>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  },
  container: {
    maxWidth: 480,
    width: '100%',
    padding: '2rem',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    borderRadius: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    color: 'black',
  },
  title: {
    marginBottom: '1.5rem',
    fontWeight: '700',
    fontSize: '1.8rem',
    color: 'black',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: '1rem 1.5rem',
    borderRadius: 8,
    marginBottom: '1.5rem',
    textAlign: 'left',
    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.05)',
    fontSize: '1rem',
    color: 'black',
  },
  button: {
    cursor: 'pointer',
    backgroundColor: '#007bff',
    border: 'none',
    color: '#fff',
    padding: '0.6rem 1.2rem',
    borderRadius: 6,
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.25s ease',
    marginTop: '1rem',
  }
};

export default SuccessPage;
