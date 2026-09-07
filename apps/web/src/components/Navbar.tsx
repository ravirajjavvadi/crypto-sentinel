import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed w-full z-[100] top-0 start-0 border-b border-cyan-500/20 bg-black/40 backdrop-blur-xl">
      <div className="max-w-[1920px] flex flex-wrap items-center justify-between mx-auto p-4 md:px-8">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
          <div className="w-8 h-8 rounded-sm bg-cyan-500/20 border border-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/40 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <span className="self-center text-xl font-black tracking-widest whitespace-nowrap text-white uppercase glow-text">
            CryptoSentinel
          </span>
        </Link>
        
        <div className="flex md:order-2 space-x-4 rtl:space-x-reverse items-center">
          <Link
            href="/login"
            className="text-gray-300 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
          >
            Authenticate
          </Link>
          <Link
            href="/signup"
            className="relative inline-flex h-9 items-center justify-center overflow-hidden border border-cyan-500/50 bg-cyan-500/10 px-6 font-mono text-xs uppercase tracking-widest text-cyan-300 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            Initialize
          </Link>
        </div>
        
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-mono text-xs uppercase tracking-widest border border-gray-800 rounded-lg md:space-x-12 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
            <li>
              <Link href="#telemetry" className="block py-2 px-3 text-gray-400 hover:text-cyan-400 md:p-0 transition-colors">
                Telemetry
              </Link>
            </li>
            <li>
              <Link href="#matrix" className="block py-2 px-3 text-gray-400 hover:text-cyan-400 md:p-0 transition-colors">
                Threat Matrix
              </Link>
            </li>
            <li>
              <Link href="#protocol" className="block py-2 px-3 text-gray-400 hover:text-cyan-400 md:p-0 transition-colors">
                Protocol
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
