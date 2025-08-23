import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from './config/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';
import './style/animations.css';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <React.StrictMode>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
           <I18nextProvider i18n={i18n}>

        <App />
            </I18nextProvider>

      </PersistGate>
    </Provider>
  </React.StrictMode>
);
