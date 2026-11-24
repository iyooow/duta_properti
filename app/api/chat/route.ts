import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Mengambil riwayat pesan
export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: messages }, { status: 200 });
  } catch (error) {
    console.error('GET Chat Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat riwayat chat' }, { status: 500 });
  }
}

// POST: Mengirim pesan baru & memberikan respons otomatis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    // 1. Simpan pesan dari user
    const userMessage = await prisma.chatMessage.create({
      data: { sender: 'user', message },
    });

    // 2. Logika respons otomatis asisten virtual
    let botReplyText = 'Halo! Ada yang bisa saya bantu terkait properti atau jadwal sewa di PT Duta Properti?';
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('sewa') || lowerMsg.includes('kontrak')) {
      botReplyText = 'Untuk pengecekan masa sewa, Anda dapat melihatnya langsung melalui menu Monitoring Masa Sewa (/leases).';
    } else if (lowerMsg.includes('jadwal') || lowerMsg.includes('survei')) {
      botReplyText = 'Agenda dan jadwal internal dapat diatur melalui menu Penjadwalan (/schedules).';
    } else if (lowerMsg.includes('properti') || lowerMsg.includes('ruko')) {
      botReplyText = 'PT Duta Properti mengelola berbagai properti komersial dan ruko strategis. Silakan cek data properti untuk detail unit.';
    }

    // 3. Simpan balasan dari bot
    const botMessage = await prisma.chatMessage.create({
      data: { sender: 'bot', message: botReplyText },
    });

    return NextResponse.json({ success: true, data: [userMessage, botMessage] }, { status: 201 });
  } catch (error) {
    console.error('POST Chat Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memproses pesan' }, { status: 500 });
  }
}