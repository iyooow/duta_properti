'use client';

import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: string;
  property?: Property;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    propertyId: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const resSched = await fetch('/api/schedules');
      const dataSched = await resSched.json();
      if (dataSched.success) setSchedules(dataSched.data);

      const resProp = await fetch('/api/properties');
      const dataProp = await resProp.json();
      if (dataProp.success) setProperties(dataProp.data);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (result.success) {
        alert('Jadwal berhasil ditambahkan!');
        setForm({ title: '', description: '', date: '', propertyId: '' });
        fetchData();
      } else {
        alert(result.error || 'Gagal menambahkan jadwal');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Penjadwalan Internal - PT Duta Properti</h1>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Tambah Agenda Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Judul Agenda</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Contoh: Survei Lokasi Klien"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Waktu Kegiatan</label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kaitkan dengan Properti (Opsional)</label>
              <select
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
              >
                <option value="">-- Pilih Properti --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi / Catatan</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Catatan tambahan agenda..."
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Daftar Agenda Internal</h2>
          {schedules.length === 0 ? (
            <p className="text-gray-500">Belum ada agenda terjadwal.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3 px-4">Agenda</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Properti Terkait</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{s.title}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(s.date).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{s.property?.name || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{s.description || '-'}</td>
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