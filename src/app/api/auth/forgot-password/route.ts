import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "").setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

    const account = new Account(client);

    // Create a URL for the password reset page
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

    // Send the password recovery email
    await account.createRecovery(email, url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);

    // Don't reveal if the user exists or not for security reasons
    return NextResponse.json({ success: true, message: "If your email exists, a reset link has been sent." }, { status: 200 });
  }
}
