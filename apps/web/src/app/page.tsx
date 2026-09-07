import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-cyan-500/30">
      
      {/* Absolute Background Elements */}
      <div className="fixed inset-0 cyber-grid z-0 opacity-40 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-cyan-500/50 animate-scanline z-50 pointer-events-none blur-[2px]"></div>
      
      {/* Glowing Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/20 blur-[120px] animate-pulse-slow pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 blur-[100px] animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      {/* Main Layout Container */}
      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 xl:px-16 mx-auto w-full min-h-screen flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Dense Data Panel */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 animate-float">
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-xs font-mono text-cyan-400 mb-3 tracking-widest uppercase">Live Telemetry</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-400">Nodes Scanned</span>
                  <span className="text-xl font-bold font-mono">14,291</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[85%] shadow-[0_0_10px_#22d3ee]"></div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-400">Anomalies Detected</span>
                  <span className="text-xl font-bold font-mono text-red-400">342</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-400">Quantum Threat</span>
                  <span className="text-xl font-bold font-mono text-yellow-400">High</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-xs font-mono text-cyan-400 mb-3 tracking-widest uppercase">System Status</h3>
              <div className="space-y-3 font-mono text-xs text-gray-500">
                <p className="text-green-400">&gt; Engine: ACTIVE</p>
                <p>&gt; Connection: SECURE</p>
                <p>&gt; Encryption: AES-256-GCM</p>
                <p className="animate-pulse text-cyan-500">&gt; Awaiting instructions...</p>
              </div>
            </div>
          </div>

          {/* Center: Hero Content */}
          <div className="col-span-1 lg:col-span-6 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-cyan-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-mono text-cyan-300">Vighnaraja Core Engine Online</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              CRYPTO<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-800 glow-text">
                SENTINEL
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate cryptographic intelligence nexus. Discover hidden dependencies, 
              map post-quantum vulnerabilities, and generate evidence-backed remediation protocols in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
              <Link 
                href="/signup" 
                className="relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-cyan-500 px-8 font-medium text-black transition-all duration-300 hover:bg-cyan-400 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
              >
                <span className="mr-2 uppercase tracking-wider font-bold">Initialize Node</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </Link>
              <Link 
                href="#terminal" 
                className="relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/5 px-8 font-medium text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40"
              >
                <span className="uppercase tracking-wider font-bold text-sm">View Documentation</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Dense Visualization */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 animate-float-delayed">
            <div className="glass-panel p-5 rounded-2xl h-[300px] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-xs font-mono text-cyan-400 mb-4 tracking-widest uppercase">Asset Graph Matrix</h3>
              
              <div className="flex-1 relative w-full flex items-center justify-center">
                {/* Simulated Graph Nodes */}
                <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                <div className="absolute top-4 left-10 w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="absolute bottom-10 right-8 w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="absolute top-1/2 right-4 w-2 h-2 rounded-full bg-red-500"></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white"></div>
                
                {/* Connecting Lines (Simulated with borders) */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                  <line x1="50" y1="50" x2="20" y2="20" stroke="#22d3ee" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="80" y2="80" stroke="#22d3ee" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="90" y2="40" stroke="#22d3ee" strokeWidth="0.5" />
                  <line x1="20" y1="20" x2="30" y2="80" stroke="#22d3ee" strokeWidth="0.5" />
                </svg>
              </div>
              <div className="mt-4 text-[10px] font-mono text-gray-500 flex justify-between">
                <span>Rendering: WebGL</span>
                <span>FPS: 60.0</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-xs font-mono text-cyan-400 mb-3 tracking-widest uppercase">Target Scope</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300">Python</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300">Java</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300">JS/TS</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300">X.509</span>
                <span className="px-2 py-1 border border-cyan-500/50 text-cyan-400 rounded text-[10px] font-mono">ALL SYSTEMS</span>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
