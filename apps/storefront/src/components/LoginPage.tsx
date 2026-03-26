import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithGoogle } from '../services/auth.api';
import { ShoppingBag } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
    handleGoogleCredential?: (response: any) => void;
  }
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const btnRef = useRef<HTMLDivElement>(null);
  const redirect = searchParams.get('redirect') || '/malang-pusat';

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    window.handleGoogleCredential = async (response: any) => {
      try {
        const data = await loginWithGoogle(response.credential);
        localStorage.setItem('customer_token', data.token);
        localStorage.setItem('customer_id', data.customerId);
        localStorage.setItem('customer_name', data.name);
        localStorage.setItem('customer_email', data.email);
        if (data.avatarUrl) localStorage.setItem('customer_avatar', data.avatarUrl);

        if (data.needsProfile) {
          navigate(`/profile?redirect=${encodeURIComponent(redirect)}`);
        } else {
          navigate(redirect);
        }
      } catch (err: any) {
        alert('Login gagal: ' + err.message);
      }
    };

    // Load Google Sign-In script
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle(googleClientId);
      document.head.appendChild(script);
    } else if (window.google) {
      initGoogle(googleClientId);
    }

    function initGoogle(clientId: string) {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 300,
        shape: 'pill',
      });
    }

    return () => { window.handleGoogleCredential = undefined; };
  }, [navigate, redirect]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 max-w-sm mx-auto">
      <div className="w-20 h-20 bg-primary rounded-[28px] flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20">
        <ShoppingBag size={40} strokeWidth={2.5} />
      </div>

      <h1 className="text-3xl font-black text-gray-900 text-center mb-2 tracking-tight">
        Masuk ke Warung BuJo
      </h1>
      <p className="text-gray-500 text-center mb-10 text-sm font-medium leading-relaxed">
        Login untuk memesan, lacak status pesanan, dan simpan alamat pengirimanmu.
      </p>

      <div ref={btnRef} className="mb-6" />

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors"
        >
          ← Kembali
        </button>
      </div>

      <p className="mt-16 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
        Powered by BuJo POS System
      </p>
    </div>
  );
};
