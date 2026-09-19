import './Auth.css';

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  X,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';

import { useStore } from '../../context/StoreContext.jsx';
import { errMsg } from '../../api.js';

/*
|--------------------------------------------------------------------------
| GOOGLE BUTTON
|--------------------------------------------------------------------------
|
| Google backend integration will be connected separately.
| For now this keeps the requested UI.
|
*/

function GoogleButton() {
  const { loginWithGoogle, toast } = useStore();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || typeof window === 'undefined') return;

    const scriptId = 'govaly-google-gsi';

    const init = () => {
      if (!window.google?.accounts?.id) return;

      if (window.__govalyGoogleInitialized) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        context: 'signin',
        ux_mode: 'popup',
        auto_select: false,
        callback: async (response) => {
          try {
            if (!response?.credential) {
              toast('Google sign-in was canceled. Please try again.', 'err');
              return;
            }

            await loginWithGoogle(response.credential);
          } catch (error) {
            toast(errMsg(error, 'Google sign-in failed.'), 'err');
          }
        },
      });

      window.__govalyGoogleInitialized = true;
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.body.appendChild(script);
      return;
    }

    init();
  }, [clientId, loginWithGoogle, toast]);

  const handleGoogleLogin = () => {
    if (!clientId) {
      toast('Google sign-in is not configured yet.', 'err');
      return;
    }

    if (!window.google?.accounts?.id) {
      toast('Google sign-in is still loading. Please try again in a moment.', 'err');
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        toast(
          'Google sign-in is not available in this browser. Please sign in to a Google account or use email login.',
          'err'
        );
      }
    });
  };

  return (
    <button
      type="button"
      className="google-auth-btn"
      onClick={handleGoogleLogin}
      disabled={!clientId}
    >
      <span className="google-icon">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.23z"
          />

          <path
            fill="#34A853"
            d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.5z"
          />

          <path
            fill="#FBBC05"
            d="M6.53 13.6a5.86 5.86 0 0 1 0-3.2V7.88H3.28a9.75 9.75 0 0 0 0 8.24l3.25-2.52 1.72-1.34z"
          />

          <path
            fill="#EA4335"
            d="M12 6.37c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.5 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.38l3.25 2.52C7.3 8.09 9.46 6.37 12 6.37z"
          />
        </svg>
      </span>

      <span>Continue with Google</span>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| PASSWORD FIELD
|--------------------------------------------------------------------------
*/

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  minLength = 6,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-field">
      <label>{label}</label>

      <div className="auth-input-wrap">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          required
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() =>
            setShowPassword((prev) => !prev)
          }
          aria-label={
            showPassword
              ? 'Hide password'
              : 'Show password'
          }
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| OTP INPUT
|--------------------------------------------------------------------------
*/

function OTPInput({ value, onChange }) {
  const inputsRef = useRef([]);

  const digits = Array.from(
    { length: 6 },
    (_, index) => value[index] || ''
  );

  const focusInput = (index) => {
    if (index < 0 || index > 5) return;

    inputsRef.current[index]?.focus();
  };

  const handleChange = (index, rawValue) => {
    const cleanValue = rawValue
      .replace(/\D/g, '');

    /*
     * Pasting / entering the full OTP.
     */
    if (cleanValue.length > 1) {
      const pasted = cleanValue
        .slice(0, 6)
        .split('');

      const next = Array(6).fill('');

      pasted.forEach((digit, i) => {
        next[i] = digit;
      });

      onChange(next.join(''));

      focusInput(
        Math.min(pasted.length, 5)
      );

      return;
    }

    const next = digits.slice();

    next[index] = cleanValue.slice(0, 1);

    onChange(next.join(''));

    if (cleanValue && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (
      event.key === 'Backspace' &&
      !digits[index] &&
      index > 0
    ) {
      focusInput(index - 1);
    }

    if (
      event.key === 'ArrowLeft' &&
      index > 0
    ) {
      focusInput(index - 1);
    }

    if (
      event.key === 'ArrowRight' &&
      index < 5
    ) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    onChange(pasted);

    focusInput(
      Math.min(pasted.length, 5)
    );
  };

  return (
    <div
      className="otp-input-container"
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] =
              element;
          }}
          className="otp-input"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) =>
            handleChange(
              index,
              event.target.value
            )
          }
          onKeyDown={(event) =>
            handleKeyDown(index, event)
          }
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN AUTH MODAL
|--------------------------------------------------------------------------
|
| This component is intended to be rendered globally.
|
| Example:
|
| <Auth />
|
| It listens for:
|
| window.dispatchEvent(
|   new CustomEvent('govaly:open-auth', {
|     detail: { mode: 'login' }
|   })
| )
|
*/

export default function Auth() {
  const {
    user,

    login,
    requestRegisterOtp,
    verifyRegisterOtp,

    requestLoginOtp,
    verifyLoginOtp,

    setPassword,

    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,

    toast,
  } = useStore();

  /*
   * Main modal state
   *
   * login
   * register
   * forgot
   */
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');

  /*
   * Login tab:
   *
   * password
   * otp
   */
  const [loginMethod, setLoginMethod] =
    useState('password');

  /*
   * Registration / login / forgot steps
   */
  const [step, setStep] = useState('email');

  /*
   * Modal visibility
   */
  const [open, setOpen] = useState(false);

  /*
   * Email
   */
  const [email, setEmail] = useState('');

  /*
   * Password login
   */
  const [password, setPasswordValue] =
    useState('');

  /*
   * New password
   */
  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  /*
   * OTP
   */
  const [otp, setOtp] = useState('');

  /*
   * Forgot password reset token
   */
  const [resetToken, setResetToken] =
    useState('');

  /*
   * Loading
   */
  const [busy, setBusy] = useState(false);

  /*
   * Error
   */
  const [error, setError] = useState('');

  /*
   * Resend countdown
   */
  const [resendSeconds, setResendSeconds] =
    useState(0);

  /*
   * Prevent automatic verification
   * from firing repeatedly.
   */
  const verifyingOtpRef = useRef(false);

  /*
   |--------------------------------------------------------------------------
   | OPEN AUTH EVENT
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    const handleOpenAuth = (event) => {
      const requestedMode =
        event.detail?.mode || 'login';

      setMode(requestedMode);
      setLoginMethod('password');
      setStep('email');

      setEmail('');
      setPasswordValue('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setResetToken('');
      setError('');
      setBusy(false);

      if (requestedMode === 'login') {
        navigate('/login', { replace: false });
      }

      if (requestedMode === 'register') {
        navigate('/register', { replace: false });
      }

      if (requestedMode === 'forgot') {
        navigate('/forgot-password', { replace: false });
      }

      setOpen(true);
    };

    window.addEventListener(
      'govaly:open-auth',
      handleOpenAuth
    );

    return () => {
      window.removeEventListener(
        'govaly:open-auth',
        handleOpenAuth
      );
    };
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setOpen(false);
      return;
    }

    const pathMode = location.pathname;

    if (pathMode === '/login') {
      setMode('login');
      setLoginMethod('password');
      setStep('email');
      setOpen(true);
      return;
    }

    if (pathMode === '/register') {
      setMode('register');
      setStep('email');
      setOpen(true);
      return;
    }

    if (
      pathMode === '/forgot-password' ||
      pathMode.startsWith('/reset-password/')
    ) {
      setMode('forgot');
      setStep('email');
      setOpen(true);
    }
  }, [location.pathname, user]);

  /*
   |--------------------------------------------------------------------------
   | AUTO OPEN IF USER IS NOT LOGGED IN
   |--------------------------------------------------------------------------
   |
   | We don't automatically open the modal on every page.
   |
   */

  /*
   |--------------------------------------------------------------------------
   | RESEND TIMER
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((current) =>
        current > 0
          ? current - 1
          : 0
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [resendSeconds]);

  /*
   |--------------------------------------------------------------------------
   | CLOSE
   |--------------------------------------------------------------------------
   */

  const closeModal = () => {
    setOpen(false);

    setMode('login');
    setLoginMethod('password');
    setStep('email');

    setEmail('');
    setPasswordValue('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setResetToken('');
    setError('');
    setBusy(false);
    setResendSeconds(0);

    const authRoute = ['/login', '/register', '/forgot-password'];
    if (authRoute.includes(location.pathname) || location.pathname.startsWith('/reset-password/')) {
      const previous = sessionStorage.getItem('govaly:last-non-auth-route') || '/';
      navigate(previous, { replace: true });
    }
  };

  /*
   |--------------------------------------------------------------------------
   | SWITCH MODE
   |--------------------------------------------------------------------------
   */

  const openLogin = () => {
    setMode('login');
    setLoginMethod('password');
    setStep('email');
    setOtp('');
    setError('');
    setBusy(false);
    navigate('/login', { replace: false });
  };

  const openRegister = () => {
    setMode('register');
    setStep('email');
    setOtp('');
    setError('');
    setBusy(false);
    navigate('/register', { replace: false });
  };

  const openForgot = () => {
    setMode('forgot');
    setStep('email');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setBusy(false);
    navigate('/forgot-password', { replace: false });
  };

  /*
   |--------------------------------------------------------------------------
   | BACK
   |--------------------------------------------------------------------------
   */

  const goBack = () => {
    setError('');

    if (step === 'otp') {
      setStep('email');
      setOtp('');
      return;
    }

    if (step === 'password') {
      if (mode === 'register') {
        setStep('otp');
      }

      return;
    }

    if (mode === 'forgot') {
      openLogin();
      return;
    }

    if (mode === 'register') {
      openLogin();
      return;
    }
  };

  /*
   |--------------------------------------------------------------------------
   | PASSWORD LOGIN
   |--------------------------------------------------------------------------
   */

  const handlePasswordLogin = async (
    event
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    if (!password) {
      setError(
        'Please enter your password.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      await login(
        email.trim(),
        password
      );

      closeModal();
    } catch (errorObject) {
      const message = errMsg(
        errorObject,
        'Login failed. Please check your email and password.'
      );

      if (
        message.includes('does not have a password')
      ) {
        setLoginMethod('otp');
        setStep('email');
      }

      setError(message);
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | REQUEST LOGIN OTP
   |--------------------------------------------------------------------------
   */

  const handleRequestLoginOtp = async (
    event
  ) => {
    event?.preventDefault();

    if (!email.trim()) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response =
        await requestLoginOtp(
          email.trim()
        );

      setStep('otp');

      setOtp('');

      setResendSeconds(
        response?.data?.resendAfterSeconds ??
          response?.resendAfterSeconds ??
          60
      );

      toast(
        'OTP sent to your email.',
        'ok'
      );
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Could not send OTP.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | VERIFY LOGIN OTP
   |--------------------------------------------------------------------------
   */

  const handleVerifyLoginOtp = async (
    event
  ) => {
    event?.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError(
        'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    if (verifyingOtpRef.current) return;

    verifyingOtpRef.current = true;

    setBusy(true);
    setError('');

    try {
      await verifyLoginOtp(
        email.trim(),
        otp
      );

      closeModal();
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Invalid or expired OTP.'
        )
      );
    } finally {
      setBusy(false);
      verifyingOtpRef.current = false;
    }
  };

  /*
   |--------------------------------------------------------------------------
   | REGISTER REQUEST OTP
   |--------------------------------------------------------------------------
   */

  const handleRegisterRequestOtp = async (
    event
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response = await requestRegisterOtp(
        email.trim()
      );

      setStep('otp');
      setOtp('');
      setResendSeconds(
        response?.data?.resendAfterSeconds ??
          response?.resendAfterSeconds ??
          60
      );

      toast(
        'OTP sent to your email.',
        'ok'
      );
    } catch (errorObject) {
      const message = errMsg(
        errorObject,
        'Could not create your account.'
      );

      setError(message);

      if (
        message.toLowerCase().includes('already exists')
      ) {
        setMode('login');
        setLoginMethod('password');
        setStep('email');
        setPasswordValue('');
        setOtp('');
        navigate('/login', { replace: false });
      }
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | REGISTER VERIFY OTP
   |--------------------------------------------------------------------------
   */

  const handleRegisterVerifyOtp = async (
    event
  ) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError(
        'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response =
        await verifyRegisterOtp(
          email.trim(),
          otp
        );

      /*
       * Backend registration verification
       * should return a token so the user can
       * immediately set a password.
       */

      setStep('password');

      setOtp('');

      toast(
        'Email verified successfully.',
        'ok'
      );

      /*
       * Keep response available for future
       * backend changes.
       */
      void response;
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Invalid or expired OTP.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | SET PASSWORD AFTER REGISTRATION
   |--------------------------------------------------------------------------
   */

  const handleSetPassword = async (
    event
  ) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      await setPassword(
        newPassword,
        confirmPassword
      );

      closeModal();
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Could not save your password.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | SKIP PASSWORD
   |--------------------------------------------------------------------------
   */

  const handleSkipPassword = () => {
    toast(
      'You can set your password later from Account Info.',
      'ok'
    );

    closeModal();
  };

  /*
   |--------------------------------------------------------------------------
   | FORGOT PASSWORD REQUEST OTP
   |--------------------------------------------------------------------------
   */

  const handleForgotRequestOtp = async (
    event
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response =
        await requestForgotPasswordOtp(
          email.trim()
        );

      setStep('otp');

      setOtp('');

      setResendSeconds(
        response?.data?.resendAfterSeconds ??
          response?.resendAfterSeconds ??
          60
      );

      toast(
        'Password reset OTP sent to your email.',
        'ok'
      );
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Could not send reset OTP.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | FORGOT PASSWORD VERIFY OTP
   |--------------------------------------------------------------------------
   */

  const handleForgotVerifyOtp = async (
    event
  ) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError(
        'Please enter the complete 6-digit OTP.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response =
        await verifyForgotPasswordOtp(
          email.trim(),
          otp
        );

      /*
       * Backend returns:
       *
       * resetToken
       *
       * This token is used only for the
       * password reset request.
       */

      const token =
        response?.resetToken ||
        response?.data?.resetToken;

      if (!token) {
        throw new Error(
          'Reset token was not returned by the server.'
        );
      }

      setResetToken(token);
      setOtp('');
      setStep('password');

      toast(
        'OTP verified successfully.',
        'ok'
      );
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Invalid or expired OTP.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | RESET PASSWORD
   |--------------------------------------------------------------------------
   */

  const handleResetPassword = async (
    event
  ) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    if (!resetToken) {
      setError(
        'Reset session has expired. Please request a new OTP.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      await resetPassword(
        email.trim(),
        resetToken,
        newPassword,
        confirmPassword
      );

      toast(
        'Password reset successfully.',
        'ok'
      );

      closeModal();
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Could not reset your password.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | RESEND OTP
   |--------------------------------------------------------------------------
   */

  const handleResendOtp = async () => {
    if (resendSeconds > 0) return;

    setBusy(true);
    setError('');

    try {
      let response;

      if (
        mode === 'register'
      ) {
        response =
          await requestRegisterOtp(
            email.trim()
          );
      } else if (
        mode === 'login'
      ) {
        response =
          await requestLoginOtp(
            email.trim()
          );
      } else {
        response =
          await requestForgotPasswordOtp(
            email.trim()
          );
      }

      setOtp('');

      setResendSeconds(
        response?.data?.resendAfterSeconds ??
          response?.resendAfterSeconds ??
          60
      );

      toast(
        'A new OTP has been sent.',
        'ok'
      );
    } catch (errorObject) {
      setError(
        errMsg(
          errorObject,
          'Could not resend OTP.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | ENTER KEY / OTP
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    if (
      step !== 'otp' ||
      otp.length !== 6 ||
      busy
    ) {
      return;
    }

    /*
     * We intentionally don't automatically
     * submit here.
     *
     * User can press Verify.
     */
  }, [
    otp,
    step,
    busy,
  ]);

  /*
   |--------------------------------------------------------------------------
   | DON'T RENDER WHEN CLOSED
   |--------------------------------------------------------------------------
   */

  if (!open || user) {
    return null;
  }

  /*
   |--------------------------------------------------------------------------
   | RENDER
   |--------------------------------------------------------------------------
   */

  return (
    <div
      className="auth-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          closeModal();
        }
      }}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Authentication"
      >
        {/* CLOSE */}

        <button
          type="button"
          className="auth-close"
          onClick={closeModal}
          aria-label="Close authentication"
        >
          <X size={21} />
        </button>

        {/* HEADER */}

        <div className="auth-modal-content">

          {step !== 'email' && (
            <button
              type="button"
              className="auth-back-btn"
              onClick={goBack}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {/* =========================================================
              LOGIN
              ========================================================= */}

          {mode === 'login' && (
            <>
              {step === 'email' && (
                <>
                  <div className="auth-heading">
                    <h2>Log In</h2>

                    <p>
                      Access your Govaly account
                    </p>
                  </div>

                  {/* LOGIN TABS */}

                  <div className="auth-tabs">
                    <button
                      type="button"
                      className={
                        loginMethod === 'password'
                          ? 'active'
                          : ''
                      }
                      onClick={() => {
                        setLoginMethod(
                          'password'
                        );
                        setError('');
                      }}
                    >
                      Via Password
                    </button>

                    <button
                      type="button"
                      className={
                        loginMethod === 'otp'
                          ? 'active'
                          : ''
                      }
                      onClick={() => {
                        setLoginMethod('otp');
                        setError('');
                      }}
                    >
                      Via OTP
                    </button>
                  </div>

                  {/* PASSWORD LOGIN */}

                  {loginMethod ===
                    'password' && (
                    <form
                      className="auth-form"
                      onSubmit={
                        handlePasswordLogin
                      }
                    >
                      <div className="auth-field">
                        <label>
                          Email / Phone Number
                        </label>

                        <div className="auth-input-icon">
                          <Mail size={17} />

                          <input
                            type="text"
                            value={email}
                            onChange={(event) =>
                              setEmail(
                                event.target.value
                              )
                            }
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <PasswordField
                        label="Password"
                        value={password}
                        onChange={(event) =>
                          setPasswordValue(
                            event.target.value
                          )
                        }
                        placeholder="Enter your password"
                      />

                      {error && (
                        <p className="auth-error">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={busy}
                      >
                        <LogIn size={18} />

                        <span>
                          {busy
                            ? 'Logging in…'
                            : 'Log In'}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="auth-text-btn"
                        onClick={openForgot}
                      >
                        Forgot Password?
                      </button>
                    </form>
                  )}

                  {/* OTP LOGIN */}

                  {loginMethod === 'otp' && (
                    <form
                      className="auth-form"
                      onSubmit={
                        handleRequestLoginOtp
                      }
                    >
                      <div className="auth-field">
                        <label>
                          Email / Phone Number
                        </label>

                        <div className="auth-input-icon">
                          <Mail size={17} />

                          <input
                            type="text"
                            value={email}
                            onChange={(event) =>
                              setEmail(
                                event.target.value
                              )
                            }
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <p className="auth-description">
                        We'll send a 6-digit
                        verification code to your
                        email.
                      </p>

                      {error && (
                        <p className="auth-error">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={busy}
                      >
                        <ShieldCheck size={18} />

                        <span>
                          {busy
                            ? 'Sending…'
                            : 'Send OTP'}
                        </span>
                      </button>
                    </form>
                  )}

                  <div className="auth-divider">
                    <span />
                    <strong>or</strong>
                    <span />
                  </div>

                  <button
                    type="button"
                    className="auth-create-btn"
                    onClick={openRegister}
                  >
                    <UserPlus size={18} />

                    <span>
                      Create New Account
                    </span>

                    <ArrowRight
                      size={17}
                      className="create-arrow"
                    />
                  </button>

                  <GoogleButton />
                </>
              )}

              {/* LOGIN OTP */}

              {step === 'otp' && (
                <form
                  className="auth-form auth-otp-form"
                  onSubmit={
                    handleVerifyLoginOtp
                  }
                >
                  <div className="auth-heading">
                    <div className="auth-step-icon">
                      <ShieldCheck size={28} />
                    </div>

                    <h2>Enter OTP</h2>

                    <p>
                      We've sent a 6-digit
                      verification code to
                    </p>

                    <strong>
                      {email}
                    </strong>
                  </div>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                  />

                  {error && (
                    <p className="auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={
                      busy ||
                      otp.length !== 6
                    }
                  >
                    <ShieldCheck size={18} />

                    <span>
                      {busy
                        ? 'Verifying…'
                        : 'Verify & Log In'}
                    </span>
                  </button>

                  <div className="otp-resend">
                    {resendSeconds > 0 ? (
                      <span>
                        Resend OTP in{' '}
                        <strong>
                          {resendSeconds}s
                        </strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          handleResendOtp
                        }
                        disabled={busy}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* =========================================================
              REGISTER
              ========================================================= */}

          {mode === 'register' && (
            <>
              {step === 'email' && (
                <>
                  <div className="auth-heading">
                    <h2>
                      Enter Your Email/Phone
                    </h2>

                    <p>
                      Create your Govaly account
                    </p>
                  </div>

                  <form
                    className="auth-form"
                    onSubmit={
                      handleRegisterRequestOtp
                    }
                  >
                    <div className="auth-field">
                      <label>
                        Email / Phone Number
                      </label>

                      <div className="auth-input-icon">
                        <Mail size={17} />

                        <input
                          type="text"
                          value={email}
                          onChange={(event) =>
                            setEmail(
                              event.target.value
                            )
                          }
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="auth-error">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="auth-primary-btn"
                      disabled={busy}
                    >
                      <ArrowRight size={18} />

                      <span>
                        {busy
                          ? 'Sending…'
                          : 'Submit'}
                      </span>
                    </button>
                  </form>

                  <div className="switch-auth">
                    <span>
                      Already have an account?
                    </span>

                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={openLogin}
                    >
                      Log In
                    </button>
                  </div>

                  <div className="auth-divider">
                    <span />
                    <strong>or</strong>
                    <span />
                  </div>

                  <GoogleButton />
                </>
              )}

              {/* REGISTER OTP */}

              {step === 'otp' && (
                <form
                  className="auth-form auth-otp-form"
                  onSubmit={
                    handleRegisterVerifyOtp
                  }
                >
                  <div className="auth-heading">
                    <div className="auth-step-icon">
                      <Mail size={28} />
                    </div>

                    <h2>
                      Verify Your Email
                    </h2>

                    <p>
                      Enter the 6-digit OTP sent
                      to
                    </p>

                    <strong>
                      {email}
                    </strong>
                  </div>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                  />

                  {error && (
                    <p className="auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={
                      busy ||
                      otp.length !== 6
                    }
                  >
                    <ShieldCheck size={18} />

                    <span>
                      {busy
                        ? 'Verifying…'
                        : 'Verify OTP'}
                    </span>
                  </button>

                  <div className="otp-resend">
                    {resendSeconds > 0 ? (
                      <span>
                        Resend OTP in{' '}
                        <strong>
                          {resendSeconds}s
                        </strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          handleResendOtp
                        }
                        disabled={busy}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* SET PASSWORD */}

              {step === 'password' && (
                <form
                  className="auth-form"
                  onSubmit={
                    handleSetPassword
                  }
                >
                  <div className="auth-heading">
                    <div className="auth-step-icon">
                      <LockKeyhole size={28} />
                    </div>

                    <h2>
                      Set New Password
                    </h2>

                    <p>
                      Your account has been
                      created. You can set a
                      password now or do it later
                      from Account Info.
                    </p>
                  </div>

                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="At least 6 characters"
                  />

                  <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter password again"
                  />

                  {error && (
                    <p className="auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={busy}
                  >
                    <LockKeyhole size={18} />

                    <span>
                      {busy
                        ? 'Saving…'
                        : 'Save'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="auth-skip-btn"
                    onClick={
                      handleSkipPassword
                    }
                    disabled={busy}
                  >
                    Skip
                  </button>
                </form>
              )}
            </>
          )}

          {/* =========================================================
              FORGOT PASSWORD
              ========================================================= */}

          {mode === 'forgot' && (
            <>
              {step === 'email' && (
                <form
                  className="auth-form"
                  onSubmit={
                    handleForgotRequestOtp
                  }
                >
                  <div className="auth-heading">
                    <div className="auth-step-icon">
                      <LockKeyhole size={28} />
                    </div>

                    <h2>
                      Forgot Password?
                    </h2>

                    <p>
                      Enter your email and we'll
                      send you a verification code.
                    </p>
                  </div>

                  <div className="auth-field">
                    <label>Email</label>

                    <div className="auth-input-icon">
                      <Mail size={17} />

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value
                          )
                        }
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={busy}
                  >
                    <ArrowRight size={18} />

                    <span>
                      {busy
                        ? 'Sending…'
                        : 'Send OTP'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="auth-text-btn"
                    onClick={openLogin}
                  >
                    ← Back to Login
                  </button>
                </form>
              )}

              {/* FORGOT OTP */}

              {step === 'otp' && (
                <form
                  className="auth-form auth-otp-form"
                  onSubmit={
                    handleForgotVerifyOtp
                  }
                >
                  <div className="auth-heading">
                    <div className="auth-step-icon">
                      <ShieldCheck size={28} />
                    </div>

                    <h2>
                      Enter Reset OTP
                    </h2>

                    <p>
                      We've sent a 6-digit code
                      to
                    </p>

                    <strong>
                      {email}
                    </strong>
                  </div>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                  />

                  {error && (
                    <p className="auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={
                      busy ||
                      otp.length !== 6
                    }
                  >
                    <ShieldCheck size={18} />

                    <span>
                      {busy
                        ? 'Verifying…'
                        : 'Verify OTP'}
                    </span>
                  </button>

                  <div className="otp-resend">
                    {resendSeconds > 0 ? (
                      <span>
                        Resend OTP in{' '}
                        <strong>
                          {resendSeconds}s
                        </strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          handleResendOtp
                        }
                        disabled={busy}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* RESET PASSWORD */}

              {step === 'password' && (
                <form
                  className="auth-form"
                  onSubmit={
                    handleResetPassword
                  }
                >
                  <div className="auth-heading">
                    <div className="auth-step-icon">
                      <LockKeyhole size={28} />
                    </div>

                    <h2>
                      Set New Password
                    </h2>

                    <p>
                      Create a new password for
                      your Govaly account.
                    </p>
                  </div>

                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="At least 6 characters"
                  />

                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter password again"
                  />

                  {error && (
                    <p className="auth-error">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={busy}
                  >
                    <LockKeyhole size={18} />

                    <span>
                      {busy
                        ? 'Saving…'
                        : 'Reset Password'}
                    </span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| OPTIONAL COMPATIBILITY EXPORTS
|--------------------------------------------------------------------------
|
| These prevent import errors if your existing router still imports:
|
| Login
| Register
| ForgotPassword
| ResetPassword
|
| The new application should render <Auth /> globally instead.
|
*/

export function Login() {
  return <Auth />;
}

export function Register() {
  return <Auth />;
}

export function ForgotPassword() {
  return <Auth />;
}

export function ResetPassword() {
  return <Auth />;
}