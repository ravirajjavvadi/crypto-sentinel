"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function OrganizationPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("VIEWER");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Modal State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("DEVELOPER");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      }),
      fetch("/api/organizations/employees").then(res => res.json())
    ]).then(([userData, employeesData]) => {
      if (!["ORG_OWNER", "SECURITY_ADMIN"].includes(userData.role)) {
        router.push("/dashboard");
        return;
      }
      setUserRole(userData.role);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/organizations/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole })
      });
      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Enrollment failed");
      }
      
      // Auto-refresh
      const updated = await fetch("/api/organizations/employees").then(r => r.json());
      setEmployees(updated);
      setIsModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewRole("DEVELOPER");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await fetch(`/api/organizations/employees/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      setEmployees(employees.map(e => e.id === userId ? { ...e, role } : e));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center font-mono">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-purple-500/30">
      <Navbar />
      
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="space-y-8">
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-purple-500/20 pb-4">
            <div>
              <h1 className="text-3xl font-black tracking-widest text-purple-400 uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Organization Management</h1>
              <p className="text-gray-400 text-xs tracking-widest mt-1">ROLE-BASED ACCESS CONTROL CENTER</p>
            </div>
            
            <div className="flex gap-4">
              <Link 
                href="/dashboard"
                className="bg-black border border-white/20 text-white px-6 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-all uppercase flex items-center"
              >
                Back to Dashboard
              </Link>
              <button 
                className="bg-purple-500/10 border border-purple-500 text-purple-400 px-6 py-2 text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all uppercase"
                onClick={() => setIsModalOpen(true)}
              >
                Enroll Employee +
              </button>
            </div>
          </header>

          <div className="glass-panel overflow-x-auto border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-purple-400 uppercase bg-purple-900/10 border-b border-purple-500/20 tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-black">ID</th>
                  <th className="px-6 py-4 font-black">Email</th>
                  <th className="px-6 py-4 font-black">Role</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-purple-500/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-500">#{emp.id}</td>
                    <td className="px-6 py-4 text-white">{emp.email}</td>
                    <td className="px-6 py-4">
                      {userRole === "ORG_OWNER" ? (
                        <select 
                          className="bg-black border border-purple-500/30 text-purple-300 text-xs p-1 outline-none focus:border-purple-500 cursor-pointer"
                          value={emp.role}
                          onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        >
                          <option value="ORG_OWNER">ORG_OWNER</option>
                          <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                          <option value="DEVELOPER">DEVELOPER</option>
                          <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
                          <option value="AUDITOR">AUDITOR</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      ) : (
                        <span className="text-purple-300 text-xs px-2 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm">
                          {emp.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs text-gray-600 group-hover:text-purple-400 transition-colors cursor-not-allowed">Revoke Access</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ENROLL EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black w-full max-w-md border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-xl font-black text-purple-400 uppercase tracking-widest border-b border-purple-500/20 pb-2">Enroll Employee</h2>
              <p className="text-[10px] text-gray-400 mt-2 uppercase">Initial password will auto-provision from email prefix</p>
            </div>
            
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 tracking-widest uppercase">Full Name</label>
                <input 
                  type="text" required
                  className="w-full bg-purple-900/10 border border-purple-500/30 text-white px-3 py-2 outline-none focus:border-purple-500 transition-colors text-sm"
                  value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 tracking-widest uppercase">Email Address</label>
                <input 
                  type="email" required
                  className="w-full bg-purple-900/10 border border-purple-500/30 text-white px-3 py-2 outline-none focus:border-purple-500 transition-colors text-sm"
                  value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 tracking-widest uppercase">Assign Role</label>
                <select 
                  className="w-full bg-purple-900/10 border border-purple-500/30 text-purple-300 px-3 py-2 outline-none focus:border-purple-500 transition-colors text-sm cursor-pointer"
                  value={newRole} onChange={e => setNewRole(e.target.value)}
                >
                  <option value="DEVELOPER">DEVELOPER (Write)</option>
                  <option value="SECURITY_ADMIN">SECURITY_ADMIN (Write + Manage)</option>
                  <option value="SECURITY_ANALYST">SECURITY_ANALYST (Read)</option>
                  <option value="AUDITOR">AUDITOR (Read)</option>
                  <option value="VIEWER">VIEWER (Read-Only)</option>
                </select>
              </div>

              {error && <p className="text-red-400 text-xs animate-pulse border-l-2 border-red-500 pl-2">{error}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-500 text-white px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
