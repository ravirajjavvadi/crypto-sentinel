"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GraphPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Just rely on middleware for now, or check via fetch
    fetch("/api/organizations/me").then(res => {
        if (!res.ok) router.push("/login");
    }).catch(() => router.push("/login"));
  }, [router]);

  return (
    <div className="relative min-h-screen bg-black text-gray-300 font-mono overflow-hidden selection:bg-cyan-500/30">
      
      {/* Dashboard Nav */}
      <nav className="relative z-50 border-b border-cyan-900/50 bg-black/80 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-cyan-900/50 border border-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
              </div>
              <span className="text-xl font-black text-white tracking-widest glow-text uppercase">Threat Matrix Graph</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xs text-cyan-400 hover:text-cyan-300 tracking-widest uppercase transition-colors hidden sm:block">
                [ RETURN TO DASHBOARD ]
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 h-[calc(100vh-64px)] w-full">
        {/* Graph Overlay UI */}
        <div className="absolute top-4 left-4 z-20 glass-panel p-4 w-64">
          <h2 className="text-xs text-cyan-400 mb-2 border-b border-cyan-900 pb-1">LEGEND</h2>
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div> Project Node</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_blue]"></div> Library / Dependency</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div> Cryptographic Asset</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red] animate-pulse"></div> Vulnerability / PQC Risk</div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-4 text-[10px] text-right">
          <p className="text-cyan-400">ENGINE: VIGHNARAJA GRAPH_QL</p>
          <p className="text-gray-500">NODES: 1,429 | EDGES: 3,892</p>
          <p className="text-gray-500">LAYOUT: FORCE-DIRECTED SIMULATION</p>
        </div>

        {/* CSS-based Mock Graph */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
            <svg className="w-[80vw] h-[80vh] opacity-60" viewBox="0 0 1000 600">
                <g className="edges" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4">
                    <line x1="500" y1="300" x2="300" y2="150" className="animate-pulse" />
                    <line x1="500" y1="300" x2="700" y2="200" />
                    <line x1="500" y1="300" x2="600" y2="500" />
                    <line x1="500" y1="300" x2="400" y2="450" />
                    <line x1="300" y1="150" x2="200" y2="100" />
                    <line x1="300" y1="150" x2="250" y2="250" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.8" />
                    <line x1="700" y1="200" x2="800" y2="150" />
                    <line x1="700" y1="200" x2="850" y2="300" />
                    <line x1="600" y1="500" x2="750" y2="550" />
                </g>
                <g className="nodes">
                    {/* Central Project Node */}
                    <circle cx="500" cy="300" r="15" fill="#ffffff" className="animate-pulse" />
                    <text x="500" y="330" fill="white" fontSize="12" textAnchor="middle" className="font-mono">core-auth-service</text>
                    
                    {/* Level 1 Nodes */}
                    <circle cx="300" cy="150" r="10" fill="#3b82f6" />
                    <text x="300" y="130" fill="#3b82f6" fontSize="10" textAnchor="middle">cryptography==3.4</text>
                    
                    <circle cx="700" cy="200" r="10" fill="#3b82f6" />
                    <text x="700" y="180" fill="#3b82f6" fontSize="10" textAnchor="middle">aws-encryption-sdk</text>

                    <circle cx="600" cy="500" r="10" fill="#06b6d4" />
                    <text x="600" y="480" fill="#06b6d4" fontSize="10" textAnchor="middle">x509_cert_prod</text>
                    
                    <circle cx="400" cy="450" r="8" fill="#06b6d4" />
                    <text x="400" y="435" fill="#06b6d4" fontSize="10" textAnchor="middle">hashlib.md5</text>

                    {/* Level 2 Nodes (Vulnerabilities/Assets) */}
                    <circle cx="200" cy="100" r="6" fill="#06b6d4" />
                    <text x="200" y="85" fill="#06b6d4" fontSize="8" textAnchor="middle">AES-256-GCM</text>

                    <circle cx="250" cy="250" r="12" fill="#ef4444" className="animate-ping" />
                    <circle cx="250" cy="250" r="8" fill="#ef4444" />
                    <text x="250" y="275" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">HARDCODED_KEY</text>

                    <circle cx="800" cy="150" r="6" fill="#06b6d4" />
                    <text x="800" y="135" fill="#06b6d4" fontSize="8" textAnchor="middle">KMS_RSA_2048</text>

                    <circle cx="850" cy="300" r="8" fill="#eab308" />
                    <text x="850" y="285" fill="#eab308" fontSize="10" textAnchor="middle">PQC_RISK: RSA</text>
                    
                    <circle cx="750" cy="550" r="6" fill="#06b6d4" />
                    <text x="750" y="535" fill="#06b6d4" fontSize="8" textAnchor="middle">ECDSA_SECP256R1</text>
                </g>
            </svg>
        </div>
      </main>
    </div>
  );
}
