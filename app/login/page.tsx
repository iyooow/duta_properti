'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false); // State penentu mode Login / Register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (result.success) {
        if (isRegister) {
          // Jika berhasil daftar, otomatis pindah ke tab Login dan bersihkan password
          setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
          setIsRegister(false);
          setForm({ ...form, password: '' });
        } else {
          // Jika berhasil login, arahkan ke dashboard
          router.push('/dashboard');
        }
      } else {
        setErrorMsg(result.error || 'Terjadi kesalahan saat memproses data');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setErrorMsg('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk berpindah tab dan mereset pesan error
  const switchMode = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏢 Portal Agent</h1>
          <p className="text-gray-500 text-sm mt-1">PT Duta Properti Management System</p>
        </div>

        {/* Tab Switcher (Login vs Daftar) */}
        <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Alert Sukses Daftar */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {/* Form Dinamis (Login / Register) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Lengkap hanya muncul saat mode Daftar */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap Agen</label>
              <input
                type="text"
                required={isRegister}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-xl p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email Agen</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-xl p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="agent@dutaproperti.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-xl p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-md mt-2"
          >
            {loading
              ? 'Memproses...'
              : isRegister
              ? 'Daftar Akun Baru'
              : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* Footer Link ke Katalog Publik */}
        <div className="mt-8 text-center border-t pt-4">
          <p className="text-xs text-gray-500">
            Bukan agen?{' '}
            <Link href="/catalog" className="text-blue-600 hover:underline font-medium">
              Lihat Katalog Properti Publik
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}