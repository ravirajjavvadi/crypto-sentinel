"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScanModal from "@/components/ScanModal";

export default function DashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<{ name: string } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  useEffect(() => {
    // Fetch org
    fetch("/api/organizations/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setOrg(data))
      .catch(() => router.push("/login"));

    // Fetch stats
    let url = "/api/scans/stats";
    if (selectedProject !== "ALL") {
      url += `?project_id=${selectedProject}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch(console.error);

  }, [router, selectedProject]);

  if (!org || !stats) return (
    <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p>INITIALIZING TELEMETRY...</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-black text-gray-300 font-mono overflow-x-hidden selection:bg-cyan-500/30">
      <div className="fixed inset-0 cyber-grid z-0 opacity-20 pointer-events-none"></div>
      
      {/* Dashboard Nav */}
      <nav className="relative z-50 border-b border-cyan-900/50 bg-black/80 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-cyan-900/50 border border-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="text-xl font-black text-white tracking-widest glow-text uppercase">CryptoSentinel</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/graph" className="text-xs text-purple-400 hover:text-purple-300 tracking-widest uppercase transition-colors hidden sm:block">
                [ THREAT MATRIX ]
              </Link>
              <Link href="/cbom" className="text-xs text-cyan-400 hover:text-cyan-300 tracking-widest uppercase transition-colors hidden sm:block">
                [ GENERATE CBOM ]
              </Link>
              <span className="text-xs text-cyan-400 border border-cyan-900 px-3 py-1 bg-cyan-950/30 rounded">
                ORG: {org.name.toUpperCase()}
              </span>
              <button 
                onClick={async () => { 
                  const { createClient } = await import('@/utils/supabase/client');
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push("/login"); 
                }}
                className="text-xs tracking-widest text-red-400 hover:text-red-300 transition-colors uppercase flex items-center gap-2"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 p-4 md:p-8 max-w-[1920px] mx-auto">
        <header className="mb-8 flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-light text-white tracking-widest uppercase glow-text">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-2 tracking-widest">CRYPTOGRAPHIC TELEMETRY</p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              className="bg-black/50 border border-gray-700 text-cyan-400 px-4 py-2 text-xs tracking-widest focus:border-cyan-500 focus:outline-none uppercase"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="ALL">All Targets</option>
              {stats.projects_list && stats.projects_list.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 px-6 py-2 text-xs tracking-widest hover:bg-cyan-500 hover:text-black transition-all uppercase"
              onClick={() => setIsModalOpen(true)}
            >
              New Scan +
            </button>
          </div>
        </header>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="glass-panel p-6 border-l-2 border-l-cyan-500 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform"><svg className="w-24 h-24 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg></div>
            <dt className="text-xs text-gray-500 tracking-widest mb-1">MONITORED PROJECTS</dt>
            <dd className="text-4xl font-light text-white font-sans">{stats.projects_count}</dd>
          </div>
          
          <div className="glass-panel p-6 border-l-2 border-l-blue-500 relative overflow-hidden group">
             <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform"><svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd"></path></svg></div>
            <dt className="text-xs text-gray-500 tracking-widest mb-1">DISCOVERED ASSETS</dt>
            <dd className="text-4xl font-light text-white font-sans">{stats.assets}</dd>
          </div>
          
          <div className="glass-panel p-6 border-l-2 border-l-red-500 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform"><svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg></div>
            <dt className="text-xs text-red-500/70 tracking-widest mb-1">CRITICAL FINDINGS</dt>
            <dd className="text-4xl font-light text-red-400 font-sans">{stats.critical_findings}</dd>
          </div>
          
          <div className="glass-panel p-6 border-l-2 border-l-yellow-500 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform"><svg className="w-24 h-24 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg></div>
            <dt className="text-xs text-yellow-500/70 tracking-widest mb-1">QUANTUM EXPOSURE</dt>
            <dd className="text-4xl font-light text-yellow-400 font-sans">{stats.quantum_exposure}</dd>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel p-6 min-h-[400px] flex flex-col">
            <h2 className="text-sm text-cyan-400 tracking-widest border-b border-gray-800 pb-2 mb-4">ASSET INVENTORY STREAM</h2>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Asset Name</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Algorithm</th>
                    <th scope="col" className="px-6 py-3">PQC Safe</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_assets.map((asset: any) => (
                    <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                        {asset.name}
                      </th>
                      <td className="px-6 py-4 font-mono text-xs text-cyan-400">
                        {asset.type}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {asset.algorithm} {asset.key_size ? `(${asset.key_size}-bit)` : ''}
                      </td>
                      <td className="px-6 py-4">
                        {asset.safe ? (
                          <span className="bg-green-900/50 text-green-400 border border-green-500/30 px-2 py-1 rounded text-xs">YES</span>
                        ) : (
                          <span className="bg-red-900/50 text-red-400 border border-red-500/30 px-2 py-1 rounded text-xs animate-pulse">NO</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="glass-panel p-6 flex flex-col">
            <h2 className="text-sm text-cyan-400 tracking-widest border-b border-gray-800 pb-2 mb-4">MONITORED TARGETS</h2>
            <div className="flex-1 space-y-2 text-xs font-mono text-gray-400 overflow-y-auto">
              {stats.projects_list && stats.projects_list.length > 0 ? (
                stats.projects_list.map((proj: any) => (
                  <div key={proj.id} className="p-2 border border-gray-800 rounded bg-black/20 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    {proj.name}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 italic">No targets monitored yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ScanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitRepo={async (url) => {
          try {
            await fetch("/api/scans/repo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url })
            });
            alert("Repository scan initiated successfully!");
            window.location.reload();
          } catch (e) {
            alert("Failed to start scan");
          }
        }}
        onSubmitDomain={async (url) => {
          try {
            await fetch("/api/scans/domain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url })
            });
            alert("Domain scan initiated successfully!");
            window.location.reload();
          } catch (e) {
            alert("Failed to start scan");
          }
        }}
      />
    </div>
  );
}
