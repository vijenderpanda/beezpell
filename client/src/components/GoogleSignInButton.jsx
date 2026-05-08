import React, { useEffect, useRef } from 'react';

const MOCK_PROFILES = {
  teacher: { sub: 'mock-teacher-google-id', email: 'teacher@test.com', name: 'Ms. Johnson', picture: '' },
  parent: { sub: 'mock-parent-google-id', email: 'parent@test.com', name: 'Sarah Parker', picture: '' },
};

const GoogleSignInButton = ({ onSuccess, role }) => {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          }
        },
      });
      if (buttonRef.current) {
        window.google?.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'pill',
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [clientId]);

  // ── Mock SSO for dev/local testing ──
  if (!clientId) {
    const handleMockLogin = () => {
      // Send a special mock token that the server knows to handle
      onSuccess('MOCK_GOOGLE_TOKEN');
    };

    return (
      <div className="w-full space-y-3">
        <button
          onClick={handleMockLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
          <span className="text-[10px] bg-amber-light text-amber px-2 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">DEV</span>
        </button>
        <p className="text-center text-[10px] text-gray-300">Mock SSO · Local development only</p>
      </div>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;
