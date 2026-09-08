"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GraphPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [expiryFilter, setExpiryFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/scans/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="tracking-widest animate-pulse text-sm">INITIALIZING THREAT MATRIX...</p>
        </div>
      </div>
    );
  }

  const assets = stats.recent_assets || [];
  const projects = stats.projects_list || [];
  
  // Filter Logic
  const filteredAssets = assets.filter((asset: any) => {
    // Type Filter
    if (typeFilter !== "ALL" && asset.type !== typeFilter) return false;
    
    // Expiry Filter
    if (expiryFilter !== "ALL") {
      if (!asset.expiration_date) return false;
      const expDate = new Date(asset.expiration_date);
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (expiryFilter === "EXPIRED" && diffDays >= 0) return false;
      if (expiryFilter === "EXPIRING_SOON" && (diffDays < 0 || diffDays > 90)) return false;
    }
    
    return true;
  });

  // Basic layout math
  const centerX = 500;
  const centerY = 300;
  const radius = 200;
  const totalNodes = filteredAssets.length;

  return (
    <div className="relative min-h-screen bg-black text-gray-300 font-mono overflow-hidden selection:bg-cyan-500/30">
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
        <div className="absolute top-4 left-4 z-20 glass-panel p-4 w-64 space-y-4">
          <div>
            <h2 className="text-xs text-cyan-400 mb-2 border-b border-cyan-900 pb-1">LEGEND</h2>
            <div className="space-y-2 text-[10px]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div> Target Scope</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_blue]"></div> Library / Dependency</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div> Cryptographic Asset</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red] animate-pulse"></div> At Risk / Expiring</div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xs text-purple-400 mb-2 border-b border-purple-900 pb-1">FILTERS</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">ASSET TYPE</label>
                <select 
                  className="w-full bg-black border border-cyan-900/50 text-cyan-400 p-1"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">ALL TYPES</option>
                  <option value="LIBRARY">LIBRARY</option>
                  <option value="CERTIFICATE">CERTIFICATE</option>
                  <option value="KEY">KEY</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">EXPIRY STATUS</label>
                <select 
                  className="w-full bg-black border border-cyan-900/50 text-cyan-400 p-1"
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                >
                  <option value="ALL">ALL DATES</option>
                  <option value="EXPIRING_SOON">EXPIRING SOON (&lt; 90D)</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-4 text-[10px] text-right">
          <p className="text-cyan-400">ENGINE: VIGHNARAJA GRAPH_QL (LIVE)</p>
          <p className="text-gray-500">NODES: {filteredAssets.length + 1} | EDGES: {filteredAssets.length}</p>
          <p className="text-gray-500">LAYOUT: RADIAL SIMULATION</p>
        </div>

        {/* CSS-based Dynamic Graph */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
            <svg className="w-[80vw] h-[80vh] opacity-80" viewBox="0 0 1000 600">
                <g className="edges" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4">
                    {filteredAssets.map((asset: any, i: number) => {
                        const angle = (i / totalNodes) * 2 * Math.PI;
                        const staggeredRadius = radius + (i % 3 === 0 ? 50 : i % 3 === 1 ? -50 : 0) + (i % 5 === 0 ? 30 : 0);
                        const x = centerX + staggeredRadius * Math.cos(angle);
                        const y = centerY + staggeredRadius * Math.sin(angle);
                        
                        let isRisk = false;
                        if (asset.expiration_date) {
                            const diffDays = Math.ceil((new Date(asset.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 90) isRisk = true;
                        }
                        if (!asset.safe) isRisk = true;

                        return (
                            <line 
                                key={`edge-${asset.id}`} 
                                x1={centerX} y1={centerY} 
                                x2={x} y2={y} 
                                className={isRisk ? "animate-pulse" : ""}
                                stroke={isRisk ? "#ef4444" : "#22d3ee"}
                            />
                        );
                    })}
                </g>
                <g className="nodes">
                    {/* Central Project Node */}
                    <circle cx={centerX} cy={centerY} r="20" fill="#ffffff" className="animate-pulse shadow-[0_0_15px_white]" />
                    <text x={centerX} y={centerY + 35} fill="white" fontSize="14" textAnchor="middle" className="font-mono font-bold">ALL TARGETS</text>
                    
                    {/* Dynamic Assets Nodes */}
                    {filteredAssets.map((asset: any, i: number) => {
                        const angle = (i / totalNodes) * 2 * Math.PI;
                        // Stagger the radius to avoid overlaps for large datasets
                        const staggeredRadius = radius + (i % 3 === 0 ? 50 : i % 3 === 1 ? -50 : 0) + (i % 5 === 0 ? 30 : 0);
                        const x = centerX + staggeredRadius * Math.cos(angle);
                        const y = centerY + staggeredRadius * Math.sin(angle);
                        
                        let color = "#06b6d4"; // Cyan for certificates
                        if (asset.type === "LIBRARY") color = "#3b82f6"; // Blue
                        if (asset.type === "KEY") color = "#eab308"; // Yellow
                        
                        let isRisk = false;
                        if (asset.expiration_date) {
                            const diffDays = Math.ceil((new Date(asset.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 90) isRisk = true;
                        }
                        
                        if (isRisk) color = "#ef4444"; // Red for risk

                        return (
                            <g key={`node-${asset.id}`}>
                                {isRisk && <circle cx={x} cy={y} r="14" fill={color} className="animate-ping opacity-50" />}
                                <circle cx={x} cy={y} r="6" fill={color} />
                                {/* Only show text for a few nodes if there are too many to avoid clutter */}
                                {(totalNodes < 50 || isRisk || i % 10 === 0) && (
                                    <text x={x} y={y + 15} fill={color} fontSize="8" textAnchor="middle" className="font-mono max-w-[100px]">
                                        {asset.name.length > 20 ? asset.name.substring(0, 20) + "..." : asset.name}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
      </main>
    </div>
  );
}
