'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  status: string;
  description?: string;
  imageUrl?: string;
}

export default function CatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog?search=${encodeURIComponent(query)}`);
      const result = await res.json();
      if (result.success) {
        setProperties(result.data);
      }
    } catch (error) {
      console.error('Gagal memuat katalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Katalog */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏡 Katalog Properti Tersedia</h1>
            <p className="text-gray-500 text-sm mt-1">Temukan ruko, gedung, atau ruang komersial impian Anda di PT Duta Properti.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/chat" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shadow-md">
              💬 Tanya Asisten Chatbot
            </Link>
          </div>
        </div>

        {/* Form Pencarian Properti */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama properti atau alamat (contoh: Bintaro, Ruko)..."
              className="flex-1 border rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium text-sm transition"
            >
              Cari Properti
            </button>
          </form>
        </div>

        {/* Daftar Kartu Katalog Properti */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">Memuat daftar properti tersedia...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border shadow-sm">
            <p className="text-gray-500 text-lg font-medium">Tidak ada properti yang cocok dengan pencarian Anda.</p>
            <button 
              onClick={() => { setSearchQuery(''); fetchCatalog(''); }}
              className="mt-4 text-blue-600 hover:underline text-sm font-medium"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col hover:shadow-lg transition-shadow">
                {/* Gambar Properti */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Foto Tidak Tersedia
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Tersedia
                  </span>
                </div>

                {/* Konten Detail */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{p.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.address}</p>
                    {p.description && (
                      <p className="text-gray-600 text-xs mt-2 bg-gray-50 p-2.5 rounded-lg border">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Harga Sewa / Tahun</p>
                      <p className="text-base font-bold text-blue-600">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Link
                      href={`/chat?property=${encodeURIComponent(p.name)}`}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      Tanya Info
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}