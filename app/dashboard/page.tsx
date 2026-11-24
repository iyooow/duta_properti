'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Metrics {
  totalProperties: number;
  availableProperties: number;
  activeLeasesCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

interface Schedule {
  id: string;
  title: string;
  date: string;
  property?: { name: string };
}

interface Lease {
  id: string;
  tenantName: string;
  endDate: string;
  status: string;
  daysLeft?: number;
  property?: { name: string };
}

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  status: string;
  description?: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalProperties: 0,
    availableProperties: 0,
    activeLeasesCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
  });
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [expiringLeases, setExpiringLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modul Properti
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    price: '',
    description: '',
    status: 'AVAILABLE',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      if (result.success) {
        setMetrics(result.data.metrics);
        setUpcomingSchedules(result.data.upcomingSchedules);
        setExpiringLeases(result.data.expiringLeases);
      }
    } catch (error) {
      console.error('Gagal memuat data dashboard:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/property'); // Mengarah ke folder /api/property
      const data = await res.json();
      if (data.success) setProperties(data.data);
    } catch (error) {
      console.error('Gagal memuat properti:', error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchProperties()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

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

      const res = await fetch('/api/property', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        alert('Properti beserta foto berhasil ditambahkan!');
        setForm({ name: '', address: '', price: '', description: '', status: 'AVAILABLE' });
        setImageFile(null);
        fetchProperties();
        fetchDashboardData(); // Refresh metrics dashboard
      } else {
        alert('Gagal: ' + (result.error || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Memuat data Dashboard PT Duta Properti...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏢 System Management - PT Duta Properti</h1>
            <p className="text-gray-500 text-sm mt-1">Ringkasan properti, jadwal internal, monitoring sewa, dan pengelolaan unit.</p>
          </div>
          {/* Quick Nav Options */}
          <div className="flex flex-wrap gap-2">
            <Link href="/schedules" className="bg-white border px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              📅 Penjadwalan
            </Link>
            <Link href="/leases" className="bg-white border px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              📄 Monitoring Sewa
            </Link>
            <Link href="/chat" className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition">
              💬 Asisten Chatbot
            </Link>
          </div>
        </div>

        {/* Ringkasan Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Total Properti</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{metrics.totalProperties}</h2>
            <p className="text-xs text-green-600 mt-1">{metrics.availableProperties} Tersedia untuk disewa</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Kontrak Sewa Aktif</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">{metrics.activeLeasesCount}</h2>
            <p className="text-xs text-gray-400 mt-1">Masa sewa berjalan lancar</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Sewa Hampir Habis (≤30 Hari)</p>
            <h2 className="text-3xl font-bold text-orange-500 mt-2">{metrics.expiringSoonCount}</h2>
            <p className="text-xs text-orange-600 mt-1">Perlu konfirmasi perpanjangan</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Kontrak Kedaluwarsa</p>
            <h2 className="text-3xl font-bold text-red-600 mt-2">{metrics.expiredCount}</h2>
            <p className="text-xs text-red-500 mt-1">Perlu pembaruan atau serah terima</p>
          </div>
        </div>

        {/* Grid Informasi Detail (Monitoring & Agenda) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kontrak Perlu Perhatian */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">⚠️ Monitoring Sewa Mendatang</h2>
              <Link href="/leases" className="text-xs text-blue-600 hover:underline">Lihat Semua →</Link>
            </div>
            {expiringLeases.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">Tidak ada kontrak sewa yang hampir atau sudah kedaluwarsa.</p>
            ) : (
              <div className="space-y-3">
                {expiringLeases.map((lease) => (
                  <div key={lease.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{lease.tenantName}</p>
                      <p className="text-xs text-gray-500">{lease.property?.name || 'Properti PT Duta Properti'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        lease.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {lease.status === 'EXPIRED' ? 'Kedaluwarsa' : `${lease.daysLeft} hari lagi`}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">
                        s/d {new Date(lease.endDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agenda Internal Terdekat */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">📅 Agenda & Survei Terdekat</h2>
              <Link href="/schedules" className="text-xs text-blue-600 hover:underline">Kelola Agenda →</Link>
            </div>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">Belum ada agenda internal terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{schedule.title}</p>
                      <p className="text-xs text-gray-500">{schedule.property?.name || 'Properti'}</p>
                    </div>
                    <span className="text-xs text-gray-600 font-medium bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                      {new Date(schedule.date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODUL KELOLA PROPERTI & UPLOAD FOTO TERINTEGRASI */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">🏢 Modul Kelola Properti & Upload Foto</h2>

          {/* Form Input Properti Baru */}
          <form onSubmit={handlePropertySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Properti / Gedung</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800 bg-white"
                placeholder="Contoh: Ruko Bintaro Plaza Block A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status Properti</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800 bg-white"
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
                className="w-full border rounded-lg p-2.5 text-gray-800 bg-white"
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
                className="w-full border rounded-lg p-2.5 text-gray-800 bg-white"
                placeholder="Contoh: 75000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Upload File Foto Properti</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-2 text-sm text-gray-600 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi Tambahan</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-gray-800 bg-white"
                placeholder="Contoh: 3 Lantai, Listrik 4400W, Pinggir Jalan Utama"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                {submitting ? 'Menyimpan Properti & Foto...' : 'Tambah Properti Baru'}
              </button>
            </div>
          </form>

          {/* Tabel Daftar Properti */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Daftar Unit Properti Terdaftar</h3>
            {properties.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada unit properti yang terdaftar.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-gray-600 text-sm">
                      <th className="py-3 px-4">Foto</th>
                      <th className="py-3 px-4">Nama Properti</th>
                      <th className="py-3 px-4">Alamat</th>
                      <th className="py-3 px-4">Harga / Tahun</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 text-sm">
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
    </div>
  );
}