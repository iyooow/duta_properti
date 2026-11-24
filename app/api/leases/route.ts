import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        property: true,
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    // Otomatis kalkulasi status berdasarkan tanggal hari ini
    const today = new Date();
    const updatedLeases = leases.map((lease) => {
      const endDate = new Date(lease.endDate);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      let computedStatus = 'ACTIVE';
      if (diffDays < 0) {
        computedStatus = 'EXPIRED';
      } else if (diffDays <= 30) {
        computedStatus = 'EXPIRING_SOON';
      }

      return { ...lease, status: computedStatus, daysLeft: diffDays };
    });

    return NextResponse.json({ success: true, data: updatedLeases }, { status: 200 });
  } catch (error) {
    console.error('GET Lease Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat data sewa' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantName, startDate, endDate, rentAmount, propertyId, notes } = body;

    if (!tenantName || !startDate || !endDate || !rentAmount || !propertyId) {
      return NextResponse.json({ success: false, error: 'Semua field utama wajib diisi' }, { status: 400 });
    }

    const newLease = await prisma.lease.create({
      data: {
        tenantName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount),
        propertyId,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: newLease }, { status: 201 });
  } catch (error) {
    console.error('POST Lease Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menambahkan kontrak sewa' }, { status: 500 });
  }
}