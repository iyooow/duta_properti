import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        property: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
    return NextResponse.json({ success: true, data: schedules }, { status: 200 });
  } catch (error) {
    console.error('GET Schedule Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat data jadwal' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, propertyId, status } = body;

    if (!title || !date) {
      return NextResponse.json({ success: false, error: 'Judul dan tanggal wajib diisi' }, { status: 400 });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        propertyId: propertyId && propertyId !== '' ? propertyId : null,
        status: status || 'PENDING',
      },
    });

    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error) {
    console.error('POST Schedule Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menambahkan jadwal ke database' }, { status: 500 });
  }
}