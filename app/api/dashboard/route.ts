import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // ... kode di dalamnya ...
    const today = new Date();

    // 1. Ambil Statistik Properti
    const totalProperties = await prisma.property.count();
    const availableProperties = await prisma.property.count({
      where: { status: 'AVAILABLE' },
    });

    // 2. Ambil Data Lease & Hitung Status Kontrak
    const leases = await prisma.lease.findMany({
      include: { property: true },
      orderBy: { endDate: 'asc' },
    });

    let activeLeasesCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    const leasesWithStatus = leases.map((lease) => {
      const endDate = new Date(lease.endDate);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      let computedStatus = 'ACTIVE';
      if (diffDays < 0) {
        computedStatus = 'EXPIRED';
        expiredCount++;
      } else if (diffDays <= 30) {
        computedStatus = 'EXPIRING_SOON';
        expiringSoonCount++;
      } else {
        activeLeasesCount++;
      }

      return { ...lease, status: computedStatus, daysLeft: diffDays };
    });

    // 3. Ambil Agenda / Jadwal Terdekat
    const upcomingSchedules = await prisma.schedule.findMany({
      take: 5,
      orderBy: { date: 'asc' },
      include: { property: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          metrics: {
            totalProperties,
            availableProperties,
            activeLeasesCount,
            expiringSoonCount,
            expiredCount,
          },
          upcomingSchedules,
          expiringLeases: leasesWithStatus.filter((l) => l.status === 'EXPIRING_SOON' || l.status === 'EXPIRED').slice(0, 5),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET Dashboard Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat data dashboard' }, { status: 500 });
  }
}