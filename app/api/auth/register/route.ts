import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar sebelumnya
    const existingAgent = await prisma.agent.findUnique({
      where: { email },
    });

    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar, silakan gunakan email lain atau login' },
        { status: 400 }
      );
    }

    // Buat agen baru di database
    const newAgent = await prisma.agent.create({
      data: {
        name,
        email,
        password, // Catatan: Untuk produksi nyata, password sebaiknya di-hash menggunakan bcrypt
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registrasi berhasil',
        agent: { id: newAgent.id, name: newAgent.name, email: newAgent.email } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}