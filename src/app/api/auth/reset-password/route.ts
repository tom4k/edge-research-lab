import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Password resets are managed directly by the Super Admin in User Management.' });
}
