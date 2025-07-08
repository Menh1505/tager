"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!userId || !secret) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, secret, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Password Reset Successful</h1>
        <p className="mb-4">Your password has been reset successfully.</p>
        <Link href="/sign-in" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login with New Password
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {!userId || !secret ? (
        <div>
          <p className="mb-4">Invalid or expired reset link. Please request a new password reset.</p>
          <Link href="/forgot-password" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Request Password Reset
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}>
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPasswordPage;
