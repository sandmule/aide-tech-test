import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from/to parameters' }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const data = await prisma.heartRate.findMany({
    where: {
      time: {
        gte: fromDate,
        lte: toDate,
      }
    },
    orderBy: { time: 'asc' },
    select: { time: true, bpm: true }
  });

  return NextResponse.json(data);
}


export async function POST(request: Request) {
  try {
    const { time, bpm } = await request.json();
    if (!time || typeof bpm !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload, expected { time: string, bpm: number }' },
        { status: 400 }
      );
    }
    await prisma.heartRate.create({
      data: { time: new Date(time), bpm },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Persist error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}