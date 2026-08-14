import RegisterForm from "@/features/auth/components/RegisterForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register",
  description: "Register to your Collaborative Document Editor account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <main className="flex min-h- items-center justify-center  px-4">
      <div className="w-full text-white  max-w-md rounded-lg  p-8 shadow-lg">
        <h1 className="mb-2 text-white text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-8 text-center text-gray-500">Register to continue</p>

        <RegisterForm />
        <p className="text-center mt-2">
          Already have an account?
          <Link href="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
