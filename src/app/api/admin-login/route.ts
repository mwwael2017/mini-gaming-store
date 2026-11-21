import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'nexus_admin_token';
const ADMIN_COOKIE_VALUE = 'verified';
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return NextResponse.json({
    authenticated: token === ADMIN_COOKIE_VALUE,
  });
}

export async function POST(request: Request) {
  let credentials: unknown;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  if (
    typeof credentials !== 'object' ||
    credentials === null ||
    !('username' in credentials) ||
    !('password' in credentials)
  ) {
    return NextResponse.json(
      { error: 'Invalid admin username or password.' },
      { status: 401 },
    );
  }

  const { username, password } = credentials as {
    username: unknown;
    password: unknown;
  };

  const authenticated =
    typeof username === 'string' &&
    typeof password === 'string' &&
    Boolean(process.env.ADMIN_USERNAME) &&
    Boolean(process.env.ADMIN_PASSWORD) &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!authenticated) {
    return NextResponse.json(
      { error: 'Invalid admin username or password.' },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);

  return NextResponse.json({ authenticated: false });
}