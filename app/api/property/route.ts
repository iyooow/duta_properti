import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: properties }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const address = formData.get('address')?.toString() || '';
    const priceStr = formData.get('price')?.toString() || '0';
    const description = formData.get('description')?.toString() || '';
    const status = formData.get('status')?.toString() || 'AVAILABLE';
    const file = formData.get('image') as File | null;

    if (!name || !address || !priceStr) {
      return NextResponse.json(
        { success: false, error: 'Nama, alamat, dan harga wajib diisi' },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Proses penyimpanan file fisik asli
    if (file && typeof file === 'object' && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
      } catch (fileErr) {
        console.error('Gagal menyimpan file fisik:', fileErr);
      }
    }

    const newProperty = await prisma.property.create({
      data: {
        name,
        address,
        price: parseFloat(priceStr),
        description: description || null,
        title: name,
        status,
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}