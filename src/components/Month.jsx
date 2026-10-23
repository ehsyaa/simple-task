import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function Month({ darkMode = true }) {
  // State untuk menyimpan tanggal saat ini
  const [currentDate, setCurrentDate] = useState(new Date());

  // Effect untuk memperbarui "Today" secara otomatis setiap kali hari berganti / jam 12 malam
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Mengecek setiap 1 menit

    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  
  // Dapatkan Tahun dan Bulan aktif saat ini
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nama Bulan dan Hari dalam Bahasa Indonesia
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Navigasi Bulan
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date());
  };

  // Kalkulasi Tanggal untuk Grid Kalender
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Buat Array untuk Tanggal
  const calendarDays = [];

  // 1. Tanggal dari bulan sebelumnya (sisa grid awal)
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 2. Tanggal bulan saat ini
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday: isToday,
    });
  }

  // 3. Tanggal bulan berikutnya (sisa grid akhir agar genap 42 kotak / 6 minggu)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return (
    <div
      className={`p-6 rounded-3xl border transition-all select-none ${
        darkMode
          ? 'bg-[#0b1329] border-gray-800 text-white shadow-xl'
          : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      }`}
    >
      {/* Header Kalender: Bulan, Tahun, dan Control Button */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Jadwal & Kalender Bulanan
            </p>
          </div>
        </div>

        {/* Tombol Navigasi */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              darkMode
                ? 'bg-[#080d1a] border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hari Ini
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode
                  ? 'bg-[#080d1a] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode
                  ? 'bg-[#080d1a] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Header Hari (Min - Sab) */}
      <div className="grid grid-cols-7 gap-2 mb-3 text-center">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6
                ? 'text-blue-400'
                : darkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid Tanggal Kalender */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative aspect-square rounded-2xl p-2 flex flex-col items-center justify-center text-sm font-semibold transition-all ${
              !item.isCurrentMonth
                ? darkMode
                  ? 'text-gray-700 bg-transparent'
                  : 'text-gray-300 bg-transparent'
                : item.isToday
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0b1329]'
                : darkMode
                ? 'bg-[#080d1a]/80 text-gray-200 border border-gray-800/60 hover:border-gray-700'
                : 'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>{item.day}</span>

            {/* Penanda "Today" berupa Titik Terang */}
            {item.isToday && (
              <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}