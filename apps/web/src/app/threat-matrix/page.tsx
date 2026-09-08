"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GraphPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [expiryFilter, setExpiryFilter] = useState("ALL");

  // Interaction State
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [migrationPlan, setMigrationPlan] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  
  // Pan & Zoom State
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Fetch AI Migration Plan when asset is selected
  useEffect(() => {
    if (!selectedAsset) {
      setMigrationPlan([]);
      return;
    }

    setLoadingPlan(true);
    
    // Find related findings for this asset based on algorithm or name
    const relatedFindings = (stats?.recent_findings || []).filter((f: any) => 
      f.algorithm === selectedAsset.algorithm || 
      (f.message && f.message.includes(selectedAsset.name))
    );

    fetch("/api/ai/migration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...selectedAsset,
        related_findings: relatedFindings 
      })
    })
    .then(res => res.json())
    .then(data => {
      setMigrationPlan(Array.isArray(data) ? data : []);
      setLoadingPlan(false);
    })
    .catch(() => {
      setMigrationPlan([{ title: "Error", desc: "AI generation failed." }]);
      setLoadingPlan(false);
    });
  }, [selectedAsset, stats]);


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
  
  // Filter Logic
  const filteredAssets = assets.filter((asset: any) => {
    if (typeFilter !== "ALL" && asset.type !== typeFilter) return false;
    
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

  const centerX = 500;
  const centerY = 300;
  const radius = 250;
  const totalNodes = filteredAssets.length;

  // Pan & Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => {
       const newK = Math.min(Math.max(0.2, prev.k * scaleFactor), 10);
       return { ...prev, k: newK };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

      <main className="relative z-10 h-[calc(100vh-64px)] w-full flex">
        {/* Graph Overlay UI */}
        <div className="absolute top-4 left-4 z-20 glass-panel p-4 w-64 space-y-4 pointer-events-auto">
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
                  className="w-full bg-black border border-cyan-900/50 text-cyan-400 p-1 cursor-pointer"
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
                  className="w-full bg-black border border-cyan-900/50 text-cyan-400 p-1 cursor-pointer"
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
          
          <div className="mt-4 pt-4 border-t border-cyan-900/50">
            <p className="text-[10px] text-gray-500 mb-1">CONTROLS</p>
            <p className="text-[10px] text-gray-400">Scroll to Zoom • Click & Drag to Pan • Click Node for AI Insights</p>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-4 text-[10px] text-right pointer-events-none">
          <p className="text-cyan-400">ENGINE: VIGHNARAJA GRAPH_QL (INTERACTIVE)</p>
          <p className="text-gray-500">NODES: {filteredAssets.length + 1} | EDGES: {filteredAssets.length}</p>
          <p className="text-gray-500">LAYOUT: RADIAL SIMULATION</p>
        </div>

        {/* Modal Overlay */}
        {selectedAsset && (
          <div className="absolute top-4 right-4 z-30 w-96 glass-panel flex flex-col shadow-2xl shadow-cyan-900/20 border border-cyan-500/30 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex justify-between items-start p-4 border-b border-cyan-900/50 bg-cyan-950/20">
              <div>
                <h3 className="text-sm font-bold text-white max-w-[280px] break-all">{selectedAsset.name}</h3>
                <p className="text-[10px] text-cyan-400 mt-1 uppercase tracking-widest">{selectedAsset.type}</p>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-black/40 p-2 border border-gray-800 rounded">
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1">Algorithm</span>
                  <span className="font-mono text-cyan-300">{selectedAsset.algorithm || "UNKNOWN"}</span>
                </div>
                <div className="bg-black/40 p-2 border border-gray-800 rounded">
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1">Key Size</span>
                  <span className="font-mono text-cyan-300">{selectedAsset.key_size ? `${selectedAsset.key_size}-bit` : "N/A"}</span>
                </div>
                <div className="bg-black/40 p-2 border border-gray-800 rounded">
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1">PQC Safe</span>
                  {selectedAsset.safe ? (
                    <span className="text-green-400">YES</span>
                  ) : (
                    <span className="text-red-400 animate-pulse">NO</span>
                  )}
                </div>
                <div className="bg-black/40 p-2 border border-gray-800 rounded">
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1">Expiry Date</span>
                  <span className="font-mono text-yellow-500/80">{selectedAsset.expiration_date ? new Date(selectedAsset.expiration_date).toLocaleDateString() : "-"}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <h4 className="text-xs font-bold text-purple-400 tracking-widest uppercase">GROQ AI Insights</h4>
                </div>
                
                {loadingPlan ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-900/50 before:to-transparent">
                      {migrationPlan.map((phase, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-purple-500 bg-black text-[8px] text-purple-400 shadow-[0_0_10px_purple] z-10 shrink-0">
                            {idx + 1}
                          </div>
                          <div className="w-[calc(100%-2rem)] bg-purple-950/10 border border-purple-900/30 p-3 rounded ml-3">
                            <h5 className="text-[10px] font-bold text-purple-300 mb-1">{phase.title}</h5>
                            <p className="text-[10px] text-gray-400 leading-relaxed whitespace-pre-wrap">{phase.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Dynamic Graph */}
        <div 
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
            <svg ref={svgRef} className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                  <g className="edges" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4">
                      {filteredAssets.map((asset: any, i: number) => {
                          const angle = (i / totalNodes) * 2 * Math.PI;
                          const staggeredRadius = radius + (i % 3 === 0 ? 60 : i % 3 === 1 ? -60 : 0) + (i % 5 === 0 ? 40 : 0);
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
                      <circle cx={centerX} cy={centerY} r="25" fill="#ffffff" className="animate-pulse shadow-[0_0_20px_white]" />
                      <text x={centerX} y={centerY + 40} fill="white" fontSize="14" textAnchor="middle" className="font-mono font-bold pointer-events-none">ALL TARGETS</text>
                      
                      {/* Dynamic Assets Nodes */}
                      {filteredAssets.map((asset: any, i: number) => {
                          const angle = (i / totalNodes) * 2 * Math.PI;
                          const staggeredRadius = radius + (i % 3 === 0 ? 60 : i % 3 === 1 ? -60 : 0) + (i % 5 === 0 ? 40 : 0);
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
                              <g 
                                key={`node-${asset.id}`} 
                                className="cursor-pointer transition-transform hover:scale-150 origin-center group"
                                style={{ transformOrigin: `${x}px ${y}px` }}
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent drag trigger if any
                                  setSelectedAsset(asset);
                                }}
                              >
                                  {isRisk && <circle cx={x} cy={y} r="16" fill={color} className="animate-ping opacity-40 pointer-events-none" />}
                                  <circle cx={x} cy={y} r="8" fill={color} className="group-hover:fill-white transition-colors" />
                                  <text 
                                    x={x} y={y + 18} 
                                    fill={color} 
                                    fontSize="8" 
                                    textAnchor="middle" 
                                    className="font-mono pointer-events-none group-hover:fill-white group-hover:font-bold transition-colors"
                                  >
                                      {asset.name.length > 20 ? asset.name.substring(0, 20) + "..." : asset.name}
                                  </text>
                              </g>
                          );
                      })}
                  </g>
                </g>
            </svg>
        </div>
      </main>
    </div>
  );
}
