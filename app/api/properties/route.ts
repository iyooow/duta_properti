import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const properties = await prisma.property.findMany();
    return NextResponse.json({ success: true, data: properties }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memuat data properti' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, price, status } = body;

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return NextResponse.json({ success: false, error: 'Harga harus berupa angka valid' }, { status: 400 });
    }

    const newProperty = await prisma.property.create({
      data: {
        name,
        address,
        price: numericPrice,
        status: status || 'AVAILABLE',
      },
    });

    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menambahkan properti' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID properti diperlukan' }, { status: 400 });
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Properti berhasil dihapus' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus properti' }, { status: 500 });
  }
}