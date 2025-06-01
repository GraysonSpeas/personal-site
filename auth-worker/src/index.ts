import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { cors } from 'hono/cors';

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const app = new Hono<Env>();

// Allow cross-origin requests from your frontend
app.use(
  '*',
  cors({
    origin: 'https://localhost:4321', // Use your real frontend URL in prod
    credentials: true,
  })
);

// CORS preflight
app.options('*', (c) => c.text('ok'));

// 🔐 Hash password with SHA-256
async function hashPassword(password: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 📝 Signup route
app.post('/auth/signup', async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email || !password) {
    return c.json({ message: 'Missing fields' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT 1 FROM users WHERE email = ?')
    .bind(email)
    .first();
  if (existing) {
    return c.json({ message: 'User already exists' }, 400);
  }

  const password_hash = await hashPassword(password);
  await c.env.DB.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .bind(email, password_hash, name || null)
    .run();

  // Set session cookie
  setCookie(c, 'session', btoa(email), {
    httpOnly: true,
    secure: true, // ✅ Set to true in prod (HTTPS)
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'Lax',
  });

  return c.json({ message: 'User created' });
});

// 🔐 Login route
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ message: 'Missing credentials' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first();
  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  const password_hash = await hashPassword(password);
  if (user.password_hash !== password_hash) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  // Set secure session cookie
  setCookie(c, 'session', btoa(email), {
    httpOnly: true,
    secure: true, // ✅ Required for HTTPS
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'Lax',
  });

  return c.json({ message: 'Logged in' });
});

// 🧠 /auth/account — returns full user info
app.get('/auth/account', async (c) => {
  const session = getCookie(c, 'session');
  if (!session) {
    return c.json({ message: 'Not logged in' }, 401);
  }

  const email = atob(session);
  const user = await c.env.DB.prepare('SELECT email, name, created_at FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (!user) return c.json({ message: 'User not found' }, 404);
  return c.json({ user });
});

// 👤 /auth/me — light check (for quick refetch)
app.get('/auth/me', (c) => {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ user: null });
  return c.json({ user: { email: atob(session) } });
});

// 🚪 Logout
app.post('/auth/logout', (c) => {
  deleteCookie(c, 'session', {
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });
  return c.json({ message: 'Logged out' });
});

export default app;