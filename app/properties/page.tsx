'use client';

import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  status: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProperties(data.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, price, status }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setProperties([...properties, data.data]);
      setName('');
      setAddress('');
      setPrice('');
      alert('Properti berhasil ditambahkan!');
    } else {
      alert('Gagal menambahkan properti');
    }
  };

  // Fungsi untuk menghapus properti
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus properti ini?')) return;

    const res = await fetch(`/api/properties?id=${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (data.success) {
      setProperties(properties.filter((prop) => prop.id !== id));
      alert('Properti berhasil dihapus!');
    } else {
      alert('Gagal menghapus properti');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'RENTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            PT Duta Properti
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sistem Informasi Manajemen Properti & Monitoring Masa Sewa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form Input */}
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>➕</span> Tambah Properti
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nama Properti
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ruko Grand Depok"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Margonda Raya No. 10"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Harga Sewa (IDR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 45000000"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Status Properti
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Properti'}
              </button>
            </form>
          </div>

          {/* Daftar Properti */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Properti ({properties.length})
            </h2>

            {properties.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                Belum ada data properti yang tersimpan. Silakan tambahkan melalui form di samping.
              </div>
            ) : (
              <div className="grid gap-4">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-slate-900">{prop.name}</h3>
                      <p className="text-sm text-slate-500">{prop.address}</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        Rp {Number(prop.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          prop.status
                        )}`}
                      >
                        {prop.status}
                      </span>
                      <button
                        onClick={() => handleDelete(prop.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-rose-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}