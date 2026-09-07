import { useState } from "react";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRepo: (url: string) => void;
  onSubmitDomain: (url: string) => void;
}

export default function ScanModal({ isOpen, onClose, onSubmitRepo, onSubmitDomain }: ScanModalProps) {
  const [activeTab, setActiveTab] = useState<"REPO" | "DOMAIN">("REPO");
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "REPO") {
      onSubmitRepo(inputValue);
    } else {
      onSubmitDomain(inputValue);
    }
    setInputValue("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel p-6 border border-cyan-500/30 rounded-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">New Scan</h2>

        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
          <button 
            type="button"
            className={\`text-sm tracking-widest uppercase ${activeTab === "REPO" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-500"}\}
            onClick={() => setActiveTab("REPO")}
          >
            GitHub Repository
          </button>
          <button 
            type="button"
            className={\`text-sm tracking-widest uppercase ${activeTab === "DOMAIN" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500"}\}
            onClick={() => setActiveTab("DOMAIN")}
          >
            Live Domain
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
              {activeTab === "REPO" ? "Repository URL" : "Website URL"}
            </label>
            <input
              type="text"
              required
              placeholder={activeTab === "REPO" ? "https://github.com/organization/repo" : "api.company.com"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 text-white px-4 py-2 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          
          <div className="text-xs text-gray-500 mt-2 font-mono">
            {activeTab === "REPO" 
              ? "> Will clone repository, scan dependencies, and analyze cryptographic code."
              : "> Will connect via TLS 443 and extract live certificate chains."}
          </div>

          <button 
            type="submit"
            className="w-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 py-3 mt-4 text-sm tracking-widest hover:bg-cyan-500 hover:text-black transition-all uppercase"
          >
            Start Scan
          </button>
        </form>
      </div>
    </div>
  );
}