import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const { userId, secret, password } = await request.json();

    if (!userId || !secret || !password) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "").setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

    const account = new Account(client);

    // Complete the password recovery process
    await account.updateRecovery(userId, secret, password);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password error:", error);

    return NextResponse.json({ message: error.message || "Failed to reset password" }, { status: 500 });
  }
}
