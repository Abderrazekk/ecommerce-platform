import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App'
import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import './i18n/config';

// Function to check and set direction on mount
const setInitialDirection = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  } else {
    document.documentElement.dir = 'ltr';
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  }
};

// Set direction before React renders
setInitialDirection();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)