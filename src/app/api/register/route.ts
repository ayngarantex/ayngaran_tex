import { NextResponse } from 'next/server';
import { findUserByUsername, createUser } from '@/server/repositories/loginRepositories';
import argon2 from 'argon2';

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
    const UserType = body.UserType || body.userType;
    const IsActive = body.IsActive !== undefined ? body.IsActive : 1; 
    const Address = body.Address || body.address;
    const State = body.State || body.state;
    const Mobile = body.Mobile || body.mobile;

    if (!UserName || !Password || !UserType) {
      return NextResponse.json({ error: "UserName, Password, and UserType are required" }, { status: 400 });
    }

    // Check if UserName already exists in the login table
    const existingUser = await findUserByUsername(UserName);

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    // Hash the password with Argon2id
    const hashedPassword = await argon2.hash(Password);

    // Save user to the 'login' table via repositories
    const newUser = await createUser({
      UserName,
      Password: hashedPassword,
      UserType,
      IsActive: IsActive ? 1 : 0,
      Address,
      State,
      Mobile
    });

    // Return the new user record excluding the password
    return NextResponse.json({
      message: "User registered successfully",
      user: {
        Id: newUser.Id,
        UserName: newUser.UserName,
        UserType: newUser.UserType,
        IsActive: newUser.IsActive,
        Address: newUser.Address,
        State: newUser.State,
        Mobile: newUser.Mobile
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
