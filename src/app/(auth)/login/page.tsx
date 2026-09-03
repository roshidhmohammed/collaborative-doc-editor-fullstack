import LoginForm from "@/features/auth/components/LoginForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Collaborative Document Editor account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  console.log("deployed version 1.1")
  return (
    <>
      <header className="mb-8 text-white  text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to continue to your workspace.
        </p>
      </header>

      <LoginForm />

      <footer className="mt-8 text-center text-sm">
        Are you a new user?
        <Link href="/register" className="text-blue-600 hover:underline ml-1">
          Create Account
        </Link>
      </footer>
    </>
  );
}
