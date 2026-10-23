import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Clock({ darkMode = true }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update waktu setiap 1 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Tanggal Bahasa Indonesia (contoh: Selasa, 22 September 2026)
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Format Jam & Menit Digital (contoh: 15.07)
  const digitalTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(':', '.');

  // Perhitungan Waktu
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  // Rotasi Dial 24 Jam (Angka 24 di paling atas = -90 derajat offset)
  // 360 derajat / 24 jam = 15 derajat per jam
  const hourAngle = ((hours + minutes / 60 + seconds / 3600) / 24) * 360;

  // Rotasi Menit (360 derajat / 60 menit = 6 derajat per menit)
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;

  // Rotasi Detik (360 derajat / 60 detik = 6 derajat per detik)
  const secondAngle = (seconds / 60) * 360;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto space-y-6 font-sans select-none"
    >
      {/* Header Tanggal & Salam */}
      <div>
        <p className="text-sm font-semibold text-blue-500 mb-1 capitalize">
          {formattedDate}
        </p>
        <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          I'll Do Better Next, Now Just Do It.
        </h2>
      </div>

      {/* Kartu Jam Analog & Digital */}
      <div 
        className={`p-6 sm:p-8 rounded-3xl border transition-colors flex flex-col justify-between items-center ${
          darkMode 
            ? 'bg-[#0b1329]/80 border-gray-800/80 shadow-2xl shadow-black/40' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}
      >
        {/* Waktu Digital */}
        <div className="w-full text-left mb-2">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
            WAKTU SEKARANG
          </span>
          <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {digitalTime}
          </div>
        </div>

        {/* Dial Jam 24 Angka Analog */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-4 flex items-center justify-center">
          {/* Garis-garis Penanda Detik/Menit (Tick Marks) */}
          {[...Array(72)].map((_, i) => {
            const angle = (i * 5) - 90;
            const isMajor = i % 3 === 0;
            return (
              <div
                key={`tick-${i}`}
                className="absolute origin-center flex justify-center items-start"
                style={{
                  transform: `rotate(${angle + 90}deg)`,
                  width: '100%',
                  height: '100%',
                }}
              >
                <div 
                  className={`rounded-full ${
                    isMajor 
                      ? 'w-[2px] h-3 bg-gray-500/80' 
                      : 'w-[1px] h-1.5 bg-gray-700/50'
                  }`} 
                />
              </div>
            );
          })}

          {/* Ring Dial Luar */}
          <div className="absolute inset-2 border border-gray-800/60 rounded-full" />

          {/* Angka Dial 1 - 24 */}
          {[...Array(24)].map((_, i) => {
            const hourVal = i === 0 ? 24 : i;
            const angle = (hourVal * 15) - 90; // 24 jam di posisi paling atas
            const rad = (angle * Math.PI) / 180;
            const radius = 118; // Jarak angka dari pusat
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);

            const isMainHour = [24, 3, 6, 9, 12, 15, 18, 21].includes(hourVal);

            return (
              <span
                key={`num-${i}`}
                className={`absolute text-center select-none font-semibold transition-all ${
                  isMainHour 
                    ? 'text-sm font-bold text-white scale-110' 
                    : 'text-[11px] text-gray-400/90'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                {hourVal}
              </span>
            );
          })}

          {/* Jarum Jam (24 Jam) */}
          <motion.div
            className="absolute origin-bottom z-10 flex flex-col items-center justify-end"
            animate={{ rotate: hourAngle }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{
              height: '80px',
              width: '8px',
              bottom: '50%',
            }}
          >
            <div className="w-full h-full bg-white rounded-full border-2 border-blue-500 shadow-md" />
          </motion.div>

          {/* Jarum Menit */}
          <motion.div
            className="absolute origin-bottom z-20 flex flex-col items-center justify-end"
            animate={{ rotate: minuteAngle }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
            style={{
              height: '110px',
              width: '4px',
              bottom: '50%',
            }}
          >
            <div className="w-full h-full bg-gray-200 rounded-full shadow-sm" />
          </motion.div>

          {/* Jarum Detik */}
          <motion.div
            className="absolute origin-bottom z-30 flex flex-col items-center justify-end"
            animate={{ rotate: secondAngle }}
            transition={{ ease: 'linear', duration: 0.2 }}
            style={{
              height: '120px',
              width: '2px',
              bottom: '50%',
            }}
          >
            <div className="w-full h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
          </motion.div>

          {/* Titik Pusat Jam */}
          <div className="w-4 h-4 bg-blue-500 rounded-full z-40 border-2 border-white shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}