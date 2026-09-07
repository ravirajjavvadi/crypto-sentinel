"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "AUTHENTICATION FAILED: INVALID CREDENTIALS");
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden selection:bg-cyan-500/30">
      <div className="fixed inset-0 cyber-grid z-0 opacity-40 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-cyan-500/50 animate-scanline z-50 pointer-events-none blur-[2px]"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none z-0"></div>

      <Navbar />

      <div className="relative z-10 w-full max-w-md space-y-8 glass-panel p-10 rounded-2xl border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div>
          <h2 className="mt-2 text-center text-3xl font-black tracking-widest text-white uppercase glow-text">
            Log In
          </h2>
          <p className="mt-2 text-center text-xs font-mono text-cyan-400">Please log in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative block w-full appearance-none rounded-none border border-white/10 bg-black/50 px-3 py-3 text-white placeholder-gray-500 focus:z-10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm font-mono tracking-wider transition-colors"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-none border border-white/10 bg-black/50 px-3 py-3 text-white placeholder-gray-500 focus:z-10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm font-mono tracking-wider transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="border-l-4 border-red-500 bg-red-500/10 p-3">
              <p className="text-xs font-mono text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-sm font-mono font-bold tracking-widest text-cyan-300 transition-all hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] uppercase"
            >
              Log In
            </button>
          </div>
          <div className="text-center">
            <Link href="/signup" className="text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors">
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
