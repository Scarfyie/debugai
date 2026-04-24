"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-800 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg">
          DebugAI
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/history"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                History
              </Link>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}