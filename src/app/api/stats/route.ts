import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');
  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing from/to parameters' },
      { status: 400 }
    );
  }

  const fromDate = new Date(from);
  const toDate   = new Date(to);

  // Use Prisma’s built-in aggregate so we never worry about table names
  const agg = await prisma.heartRate.aggregate({
    where: {
      time: {
        gte: fromDate,
        lte: toDate,
      },
    },
    _min: { bpm: true },
    _max: { bpm: true },
    _avg: { bpm: true },
  });

  // agg._min.bpm, agg._max.bpm, and agg._avg.bpm are numbers | null
  return NextResponse.json({
    min: agg._min.bpm ?? 0,
    max: agg._max.bpm ?? 0,
    avg: agg._avg.bpm ?? 0,
  });
}