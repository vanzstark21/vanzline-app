import { useEffect, useState } from 'react';
import { cn, themePrimaryColors, themeTextColors } from '../../lib/utils';
import { useStore } from '../../store/useStore';

export function Clock() {
  const [time, setTime] = useState(new Date());
  const { theme } = useStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourStr = hours.toString().padStart(2, '0');
  const minuteStr = minutes.toString().padStart(2, '0');
  const secondStr = seconds.toString().padStart(2, '0');

  // Format date: JUMAT, 24 JULI 2026
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  const dateStr = `${days[time.getDay()]}, ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;

  // Calculate rotation angles
  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col items-center justify-center h-full relative overflow-hidden">
      
      {/* Analog Clock */}
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100 flex items-center justify-center bg-white shadow-inner">
          {/* Ticks */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-2 bg-gray-300"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-14px)`,
                transformOrigin: '50% 16px' // 32/2
              }}
            />
          ))}
          <div className="absolute w-full h-full rounded-full flex items-center justify-center">
             {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={cn("absolute text-xs font-semibold", themeTextColors[theme])}
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-24px) rotate(-${i * 30}deg)`,
                }}
              >
                {i === 0 ? 12 : i}
              </span>
            ))}
          </div>

          {/* Hands */}
          <div
            className="absolute w-1 h-12 bg-gray-800 rounded-full"
            style={{ bottom: '50%', transformOrigin: 'bottom center', transform: `rotate(${hourDegrees}deg)` }}
          />
          <div
            className={cn("absolute w-[2px] h-14 rounded-full", themePrimaryColors[theme].split(' ')[0])}
            style={{ bottom: '50%', transformOrigin: 'bottom center', transform: `rotate(${minuteDegrees}deg)` }}
          />
          <div
            className="absolute w-[1px] h-16 bg-red-400"
            style={{ bottom: '50%', transformOrigin: 'bottom center', transform: `rotate(${secondDegrees}deg)` }}
          />
          {/* Center dot */}
          <div className="absolute w-2 h-2 rounded-full bg-gray-800 z-10" />
        </div>
      </div>

      {/* Digital Clock */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800 tracking-widest mb-1">
          {hourStr}.{minuteStr}.{secondStr}
        </div>
        <div className="text-[10px] font-semibold text-gray-500 tracking-widest">
          {dateStr}
        </div>
      </div>
    </div>
  );
}
