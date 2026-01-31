import authService from './auth.service';

/**
 * Initialize Google Identity Services
 * @returns {Object} Google auth instance
 */
export const initializeGoogleAuth = () => {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return null;
  }

  return window.google.accounts.id;
};

/**
 * Render Google Sign-In button
 * @param {string} elementId - HTML element ID to render button in
 * @param {Function} callback - Callback function for successful login
 */
export const renderGoogleButton = (elementId, callback) => {
  const google = initializeGoogleAuth();
  if (!google) return;

  google.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: async (response) => {
      try {
        const result = await authService.googleLogin(response.credential);
        callback(null, result.data);
      } catch (error) {
        callback(error, null);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  google.renderButton(
    document.getElementById(elementId),
    {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
    }
  );
};

/**
 * One-tap Google Sign-In
 * @param {Function} callback - Callback function
 */
export const initOneTap = (callback) => {
  const google = initializeGoogleAuth();
  if (!google) return;

  google.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: async (response) => {
      try {
        const result = await authService.googleLogin(response.credential);
        callback(null, result.data);
      } catch (error) {
        callback(error, null);
      }
    },
    auto_select: true,
    cancel_on_tap_outside: true,
    context: 'signin',
  });

  google.prompt();
};