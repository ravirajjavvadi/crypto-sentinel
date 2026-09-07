"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CBOMPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  useEffect(() => {
    const query = selectedProject !== "ALL" ? `?project_id=${selectedProject}` : "";
    fetch(`/api/scans/stats${query}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch(() => router.push("/login"));
  }, [router, selectedProject]);

  const handleExport = (format: string) => {
    // In a real app, this would trigger a download from the backend
    alert(`Generating ${format} CBOM...`);
  };

  if (!stats) return (
    <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p>GENERATING CBOM...</p>
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
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <span className="text-xl font-black text-white tracking-widest glow-text uppercase">CBOM Export</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <select 
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="appearance-none bg-black border border-cyan-800 text-cyan-400 px-4 py-1.5 pr-8 text-xs tracking-widest outline-none focus:border-cyan-500 transition-colors cursor-pointer w-48 uppercase"
                >
                  <option value="ALL">ALL TARGETS</option>
                  {stats.projects_list?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <Link href="/dashboard" className="text-xs text-cyan-400 hover:text-cyan-300 tracking-widest uppercase transition-colors hidden sm:block">
                [ RETURN TO DASHBOARD ]
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 p-4 md:p-8 max-w-[1920px] mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-light text-white tracking-widest uppercase glow-text">Cryptographic Bill of Materials</h1>
            <p className="text-xs text-gray-500 mt-2 tracking-widest">CYCLONEDX / SPDX COMPLIANT EXPORT</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleExport("JSON")} className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 px-6 py-2 text-xs tracking-widest hover:bg-cyan-500 hover:text-black transition-all uppercase">
              EXPORT JSON
            </button>
            <button onClick={() => handleExport("CycloneDX")} className="bg-blue-500/10 border border-blue-500 text-blue-400 px-6 py-2 text-xs tracking-widest hover:bg-blue-500 hover:text-black transition-all uppercase">
              EXPORT CYCLONEDX
            </button>
          </div>
        </header>

        <div className="glass-panel p-6 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-cyan-500 uppercase bg-cyan-950/20 border-b border-cyan-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Component ID</th>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Algorithm</th>
                  <th scope="col" className="px-6 py-4">Key Size</th>
                  <th scope="col" className="px-6 py-4">PQC Safe</th>
                  <th scope="col" className="px-6 py-4">Expiry</th>
                  <th scope="col" className="px-6 py-4">OIDs</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_assets.map((asset: any) => (
                  <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                      urn:uuid:{Math.random().toString(36).substring(2, 15)}
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {asset.name}
                    </th>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">
                      {asset.type}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {asset.algorithm}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {asset.key_size ? asset.key_size : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {asset.safe ? (
                        <span className="text-green-400">TRUE</span>
                      ) : (
                        <span className="text-red-400">FALSE</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-yellow-500/80">
                        {asset.expiration_date ? new Date(asset.expiration_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                      {asset.algorithm === "RSA" ? "1.2.840.113549.1.1.1" : (asset.algorithm === "AES-256" ? "2.16.840.1.101.3.4.1.42" : "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
