import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari agen berdasarkan email
    const agent = await prisma.agent.findUnique({
      where: { email },
    });

    if (!agent || agent.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Login sukses (Untuk sederhana, kita kembalikan status sukses)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Login berhasil',
        agent: { id: agent.id, name: agent.name, email: agent.email } 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}