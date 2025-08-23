import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../features/userSlice';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children }) => {
  const user = useSelector(selectUser);
    const { t } = useTranslation();

  if (user === null) {
    const token = localStorage.getItem('token');
    if (token) {
      return <div>{t('ProtectedRoute.loading')}</div>;
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
