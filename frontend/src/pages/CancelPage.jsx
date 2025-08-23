import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const CancelPage = () => {
  const navigate = useNavigate();
    const { t} = useTranslation();

  const goToSubscribe = () => navigate('/subscribe');
  const goToPlans = () => navigate('/pricing');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem 3rem',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h1 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>{t('cancelPage.paymentStop')}</h1>
        <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
          {t('cancelPage.paymentStopDesc')}
        </p>

        <button
          onClick={goToSubscribe}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '0.75rem',
            width: '100%',
            fontSize: '1rem'
          }}
        >
          {t('cancelPage.tryAgain')}
        </button>

        <button
          onClick={goToPlans}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '1rem'
          }}
        >
          {t('cancelPage.backwards')}
        </button>
      </div>
    </div>
  );
};

export default CancelPage;
