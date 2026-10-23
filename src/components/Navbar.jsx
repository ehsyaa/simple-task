import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Sun, Moon, Plus } from 'lucide-react';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  activeTab, 
  setActiveTab, 
  onAddTask 
}) {
  return (
    <header className="max-w-6xl mx-auto flex items-center justify-between py-4 px-2">
      {/* Sisi Kiri: Logo & Subtitle */}
      <div className="flex items-center gap-3">
        {/* Icon Clock Container */}
        <div className="w-11 h-11 rounded-full bg-[#111c38] text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-sm">
          <Clock className="w-5 h-5" />
        </div>

        {/* Text Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue">
            Hi
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Lucky Girl💫
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Tombol Kalender / Riwayat */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab(activeTab === 'main' ? 'history' : 'main')}
          className="w-10 h-10 rounded-full bg-[#0f172a]/80 border border-gray-800 text-gray-300 flex items-center justify-center hover:border-gray-700 hover:text-white transition-colors"
          title="Kalender & Riwayat"
        >
          <Calendar className="w-4 h-4" />
        </motion.button>

        {/* Tombol Toggle Dark / Light Mode */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-full bg-[#0f172a]/80 border border-gray-800 text-gray-300 flex items-center justify-center hover:border-gray-700 hover:text-white transition-colors"
          title="Mode Terang / Gelap"
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </motion.button>

        {/* Tombol Tambah Task */}
        {activeTab === 'main' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddTask}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah task</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}