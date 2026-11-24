'use client';

import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  status: string;
  description?: string;
  imageUrl?: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    price: '',
    description: '',
    status: 'AVAILABLE',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (data.success) setProperties(data.data);
    } catch (error) {
      console.error('Gagal memuat properti:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('address', form.address);
      data.append('price', form.price);
      data.append('description', form.description);
      data.append('status', form.status);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch('/api/properties', {
        method: 'POST',
        body: data, // Menggunakan FormData untuk kirim file fisik
      });

      const result = await res.json();
      if (result.success) {
        alert('Properti beserta foto berhasil ditambahkan!');
        setForm({ name: '', address: '', price: '', description: '', status: 'AVAILABLE' });
        setImageFile(null);
        fetchProperties();
      } else {
        alert('Gagal: ' + (result.error || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🏢 Kelola Properti & Upload Foto - PT Duta Properti</h1>

        {/* Form Tambah Properti Baru */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Input Unit Properti Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Properti / Gedung</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Contoh: Ruko Bintaro Plaza Block A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status Properti</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
              >
                <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                <option value="RENTED">Tersewa (RENTED)</option>
                <option value="MAINTENANCE">Perbaikan (MAINTENANCE)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Jl. Utama No. 12, Sektor 3, Bintaro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Harga Sewa / Tahun (Rp)</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Contoh: 75000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Upload File Foto Properti</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-2 text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi Tambahan</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Contoh: 3 Lantai, Listrik 4400W, Pinggir Jalan Utama"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Menyimpan Properti & Foto...' : 'Tambah Properti Baru'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Daftar Properti */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Daftar Properti PT Duta Properti</h2>
          {properties.length === 0 ? (
            <p className="text-gray-500">Belum ada unit properti yang terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3 px-4">Foto</th>
                    <th className="py-3 px-4">Nama Properti</th>
                    <th className="py-3 px-4">Alamat</th>
                    <th className="py-3 px-4">Harga / Tahun</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-12 object-cover rounded-md border" />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                      <td className="py-3 px-4 text-gray-600">{p.address}</td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            p.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'RENTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {p.status === 'AVAILABLE' ? 'Tersedia' : p.status === 'RENTED' ? 'Tersewa' : 'Perbaikan'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}