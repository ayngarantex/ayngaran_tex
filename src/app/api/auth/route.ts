import jwt from "jsonwebtoken";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserByUsername } from '@/server/repositories/loginRepositories';
import argon2 from 'argon2';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "ayngaran-tex-fallback-jwt-secret-key-998877"; 

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const UserName = body.UserName || body.userName;
    const Password = body.Password || body.password;

    if (!UserName || !Password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Validate user against the 'login' table via repositories
    const user = await findUserByUsername(UserName);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.IsActive !== 1) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    // Verify Password using Argon2id
    const isPasswordValid = await argon2.verify(user.Password || "", Password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.Id, role: user.UserType, superadmin: user.superadmin === 1 || user.superadmin === true }, 
      JWT_SECRET,
      { expiresIn: "30d" } 
    );

    // Set HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ token, userName: user.UserName, userType: user.UserType, superadmin: user.superadmin === 1 || user.superadmin === true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login Failed" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Logout Failed" }, { status: 500 });
  }
}
