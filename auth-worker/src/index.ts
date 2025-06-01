import { Hono } from 'hono';
import { setCookie, getCookie } from 'hono/cookie';
import { cors } from 'hono/cors';

// Type for environment bindings
type Env = {
  Bindings: {
    USERS: KVNamespace;
  };
};

// Create app
const app = new Hono<Env>();

// ✅ Enable CORS (adjust origin to match your frontend)
app.use(
  '*',
  cors({
    origin: 'http://localhost:4321', // change this to your Astro/Vite dev origin
    credentials: true,
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })
);

// Utility: Hash password with SHA-256
function hashPassword(password: string): Promise<string> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)).then((buf) =>
    Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  );
}

// POST /auth/signup
app.post('/auth/signup', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ message: 'Missing fields' }, 400);
  }

  const existing = await c.env.USERS.get(email);
  if (existing) {
    return c.json({ message: 'User already exists' }, 400);
  }

  const hash = await hashPassword(password);
  await c.env.USERS.put(email, JSON.stringify({ email, password: hash }));

  return c.json({ message: 'Signed up' });
});

// POST /auth/login
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  const user = await c.env.USERS.get(email);
  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  const parsed = JSON.parse(user);
  const inputHash = await hashPassword(password);

  if (parsed.password !== inputHash) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  // 🔁 In dev, set secure to false (important if you're not on HTTPS)
  setCookie(c, 'session', btoa(email), {
    path: '/',
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: false, // 🔁 Set to true in production!
    sameSite: 'Lax',
  });

  return c.json({ message: 'Logged in' });
});

// GET /account
app.get('/account', (c) => {
  const session = getCookie(c, 'session');
  if (!session) {
    return c.json({ message: 'Not logged in' }, 401);
  }

  const email = atob(session);
  return c.json({ message: `Welcome, ${email}` });
});

export default app;