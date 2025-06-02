import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import type { Context } from 'hono';

type Bindings = {
  DB: D1Database;
  SENDGRID_API_KEY: string;
  FROM_EMAIL: string;
  BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = ['http://localhost:4321', 'https://speas.org'];
      return allowed.includes(origin ?? '') ? origin : '';
    },
    credentials: true,
  })
);

app.options('*', (c) => c.text('ok'));

async function hashPassword(password: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function validatePassword(password: string): boolean {
  const re = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  return re.test(password);
}

function generateToken(length = 48): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function sendEmail(
  c: Context<{ Bindings: Bindings }>,
  toEmail: string,
  subject: string,
  text: string,
  html: string
) {
  const body = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: c.env.FROM_EMAIL },
    subject,
    content: [
      { type: 'text/plain', value: text },
      { type: 'text/html', value: html },
    ],
  };
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`SendGrid error: ${await res.text()}`);
  }
}

// --- SIGNUP ---
app.post('/auth/signup', async (c) => {
  const { email, password, name } = await c.req.json();

  if (!email || !password) {
    return c.json({ message: 'Missing fields' }, 400);
  }

  if (!validatePassword(password)) {
    return c.json(
      {
        message:
          'Password must be at least 8 characters long, contain at least one uppercase letter and one symbol',
      },
      400
    );
  }

  const existing = await c.env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return c.json({ message: 'User already exists' }, 400);
  }

  const password_hash = await hashPassword(password);
  const verification_token = generateToken();
  const verification_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await c.env.DB
    .prepare(
      `INSERT INTO users (email, password_hash, name, email_verified, verification_token, verification_token_expiry)
       VALUES (?, ?, ?, 0, ?, ?)`
    )
    .bind(email, password_hash, name || null, verification_token, verification_token_expiry)
    .run();

  const verificationUrl = `${c.env.BASE_URL}/verify-email?token=${verification_token}`;

  try {
    await sendEmail(
      c,
      email,
      'Welcome to Speas.org – Verify Your Email',
      `Hi ${name || ''},\n\nClick this link to verify your email: ${verificationUrl}`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #111;">Welcome to <span style="color: #6366f1;">Speas.org</span></h2>
        <p>Hi ${name || ''},</p>
        <p>Thanks for signing up. Please verify your email by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p><a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #999;">If you didn’t create an account, you can safely ignore this email.</p>
      </div>
      `
    );
  } catch (err) {
    console.error('SendGrid error:', err);
    return c.json({ message: 'Failed to send verification email' }, 500);
  }

  return c.json({ message: 'User created. Please verify your email.' });
});

// --- VERIFY EMAIL ---
app.get('/auth/verify', async (c) => {
  const token = c.req.query('token') as string | undefined;
  if (!token) return c.json({ message: 'Missing token' }, 400);

  const user: {
    email: string;
    email_verified: number;
    verification_token_expiry: string;
  } | null = await c.env.DB
    .prepare('SELECT email, email_verified, verification_token_expiry FROM users WHERE verification_token = ?')
    .bind(token)
    .first();

  if (!user) return c.json({ message: 'Invalid token' }, 400);
  if (user.email_verified) {
    return c.json({ message: 'Email already verified' });
  }
  if (new Date() > new Date(user.verification_token_expiry)) {
    return c.json({ message: 'Token expired' }, 400);
  }

  await c.env.DB
    .prepare(
      `UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expiry = NULL WHERE email = ?`
    )
    .bind(user.email)
    .run();

  return c.json({ message: 'Email verified successfully' });
});

// --- LOGIN ---
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) return c.json({ message: 'Missing credentials' }, 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ message: 'Invalid credentials' }, 401);
  if (!user.email_verified) return c.json({ message: 'Please verify your email before logging in' }, 403);

  const password_hash = await hashPassword(password);
  if (user.password_hash !== password_hash) return c.json({ message: 'Invalid credentials' }, 401);

  setCookie(c, 'session', btoa(email), {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'Lax',
  });

  return c.json({ message: 'Logged in' });
});

// --- ACCOUNT INFO ---
app.get('/auth/account', async (c) => {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ message: 'Not logged in' }, 401);

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ message: 'Invalid session' }, 401);
  }

  const user = await c.env.DB
    .prepare('SELECT email, name, created_at, email_verified FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (!user) return c.json({ message: 'User not found' }, 404);

  return c.json({ user });
});

// --- SESSION CHECK ---
app.get('/auth/me', (c) => {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ user: null });

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ user: null });
  }

  return c.json({ user: { email } });
});

// --- LOGOUT ---
app.post('/auth/logout', (c) => {
  deleteCookie(c, 'session', {
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });
  return c.json({ message: 'Logged out' });
});

// --- REQUEST PASSWORD RESET ---
app.post('/auth/request-password-reset', async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ message: 'Email required' }, 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ message: 'If that email exists, a reset email was sent' });

  // Generate new token and expiry each time (invalidate old tokens)
  const token = generateToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await c.env.DB
    .prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?')
    .bind(token, expiry, email)
    .run();

  const resetUrl = `${c.env.BASE_URL}/auth/reset-password?token=${token}`;

  try {
    await sendEmail(
      c,
      email,
      'Password Reset Request - Speas.org',
      `Click this link to reset your password: ${resetUrl}`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #111;">Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p><a href="${resetUrl}" style="color: #6366f1;">${resetUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #999;">If you didn’t request this email, you can safely ignore it.</p>
      </div>
      `
    );
  } catch (err) {
    console.error('SendGrid error:', err);
    return c.json({ message: 'Failed to send password reset email' }, 500);
  }

  return c.json({ message: 'If that email exists, a reset email was sent' });
});

// --- RESET PASSWORD ---
app.post('/auth/reset-password', async (c) => {
  const { token, newPassword } = await c.req.json();
  if (!token || !newPassword) return c.json({ message: 'Missing fields' }, 400);

  if (!validatePassword(newPassword)) {
    return c.json(
      {
        message:
          'Password must be at least 8 characters long, contain at least one uppercase letter and one symbol',
      },
      400
    );
  }

  const user = await c.env.DB
    .prepare('SELECT email, reset_token_expiry FROM users WHERE reset_token = ?')
    .bind(token)
    .first();

  if (!user) return c.json({ message: 'Invalid or expired token' }, 400);

  // Validate reset_token_expiry field
  if (
    !user.reset_token_expiry ||
    typeof user.reset_token_expiry !== 'string'
  ) {
    return c.json({ message: 'Invalid or expired token' }, 400);
  }

  const expiryDate = new Date(user.reset_token_expiry);
  if (isNaN(expiryDate.getTime())) {
    return c.json({ message: 'Invalid token expiry date' }, 400);
  }

  if (new Date() > expiryDate) {
    return c.json({ message: 'Token expired' }, 400);
  }

  const password_hash = await hashPassword(newPassword);

  await c.env.DB
    .prepare(
      `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?`
    )
    .bind(password_hash, user.email)
    .run();

  return c.json({ message: 'Password reset successful' });
});


// --- RESEND VERIFICATION EMAIL ---
app.post('/auth/resend-verification', async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ message: 'Email required' }, 400);

  const user = await c.env.DB
    .prepare('SELECT email, name, email_verified FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (!user) return c.json({ message: 'If that email exists, a verification email was sent' });
  if (user.email_verified) return c.json({ message: 'Email already verified' });

  const newVerificationToken = generateToken();
  const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await c.env.DB
    .prepare(
      `UPDATE users SET verification_token = ?, verification_token_expiry = ? WHERE email = ?`
    )
    .bind(newVerificationToken, newExpiry, email)
    .run();

  const verificationUrl = `${c.env.BASE_URL}/verify-email?token=${newVerificationToken}`;

  try {
    await sendEmail(
      c,
      email,
      'Resend Verification Email - Speas.org',
      `Hi ${user.name || ''},\n\nClick this link to verify your email: ${verificationUrl}`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #111;">Verify Your Email at <span style="color: #6366f1;">Speas.org</span></h2>
        <p>Hi ${user.name || ''},</p>
        <p>Please verify your email by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p><a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #999;">If you didn’t request this email, you can safely ignore it.</p>
      </div>
      `
    );
  } catch (err) {
    console.error('SendGrid error:', err);
    return c.json({ message: 'Failed to send verification email' }, 500);
  }

  return c.json({ message: 'Verification email resent' });
});

export default app;