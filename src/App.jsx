import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Clock from './components/Clock';
import Month from './components/Month';
import Task from './components/Task';

export default function App() {
  // Simpan status Dark Mode di localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('my_waktura_theme');
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

  const [activeTab, setActiveTab] = useState('main');

  // Simpan otomatis pilihan tema (Dark Mode) ke localStorage
  useEffect(() => {
    localStorage.setItem('my_waktura_theme', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#080d1a] text-white' : 'bg-gray-50 text-gray-900'} p-4 sm:p-6 transition-colors duration-300`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="max-w-6xl mx-auto mt-8 space-y-8">
        {activeTab === 'main' ? (
          <>
            {/* Grid 2 Kolom Seimbang: Clock (Kiri) & Month/Kalender (Kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Kolom Kiri: Clock (Sudah mencakup Tanggal & Kutipan) */}
              <div className="w-full">
                <Clock darkMode={darkMode} />
              </div>

              {/* Kolom Kanan: Kalender Bulanan */}
              <div className="w-full">
                <Month darkMode={darkMode} />
              </div>
            </div>

            {/* Bagian Bawah: Task Manager */}
            <div className="w-full pt-2">
              <Task darkMode={darkMode} />
            </div>
          </>
        ) : (
          <div className="p-6 rounded-2xl border border-gray-800 bg-[#0b1329]">
            <h2 className="text-xl font-bold mb-2">Riwayat & Kalender</h2>
          </div>
        )}
      </main>
    </div>
  );
}