'use client';

import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
}

interface Lease {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  daysLeft?: number;
  notes?: string;
  property: Property;
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    tenantName: '',
    propertyId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const resLease = await fetch('/api/leases');
      const dataLease = await resLease.json();
      if (dataLease.success) setLeases(dataLease.data);

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
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (result.success) {
        alert('Kontrak sewa berhasil ditambahkan!');
        setForm({ tenantName: '', propertyId: '', startDate: '', endDate: '', rentAmount: '', notes: '' });
        fetchData();
      } else {
        alert(result.error || 'Gagal menambahkan data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, daysLeft?: number) => {
    if (status === 'EXPIRED') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Kedaluwarsa</span>;
    }
    if (status === 'EXPIRING_SOON') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          Hampir Habis ({daysLeft} hari lagi)
        </span>
      );
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📄 Monitoring Masa Sewa - PT Duta Properti</h1>

        {/* Form Tambah Kontrak */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Input Kontrak Sewa Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Penyewa</label>
              <input
                type="text"
                required
                value={form.tenantName}
                onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Nama Perusahaan / Perorangan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Pilih Properti</label>
              <select
                required
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Mulai Sewa</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Berakhir Sewa</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nilai Sewa (Rp)</label>
              <input
                type="number"
                required
                value={form.rentAmount}
                onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="Contoh: 50000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Catatan Dokumen / Tambahan</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800"
                placeholder="No. Kontrak / Syarat Khusus"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan Kontrak Sewa'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Monitoring */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Daftar Status Masa Sewa</h2>
          {leases.length === 0 ? (
            <p className="text-gray-500">Belum ada kontrak sewa terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-3 px-4">Properti</th>
                    <th className="py-3 px-4">Penyewa</th>
                    <th className="py-3 px-4">Masa Sewa</th>
                    <th className="py-3 px-4">Nilai Sewa</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {leases.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{l.property?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{l.tenantName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(l.startDate).toLocaleDateString('id-ID')} s/d{' '}
                        {new Date(l.endDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        Rp {l.rentAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(l.status, l.daysLeft)}</td>
                      <td className="py-3 px-4 text-gray-600">{l.notes || '-'}</td>
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