import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between bg-[#0f172a] text-white px-4 py-3 shadow-md z-50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">E</span>
          <span className="font-bold text-lg">Ethara</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-gray-300 hover:text-white focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* FIXED SIDEBAR WRAPPER: Added w-64 and shrink-0 to fix desktop alignment */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-[#0f172a]
        transition-transform duration-300 ease-in-out md:transition-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar />
      </div>

      {/* Backdrop Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto w-full">
        {children}
      </main>
    </div>
  );
}