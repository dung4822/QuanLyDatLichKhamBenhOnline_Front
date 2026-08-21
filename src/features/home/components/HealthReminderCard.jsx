import React from 'react';
import { Bell } from 'lucide-react';

const HealthReminderCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/50 p-4 w-[240px] flex items-center gap-3.5 animate-float-card-2 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:scale-[1.02]">
      {/* Icon Badge */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#EBF3FE] text-[#2563EB] shrink-0">
        <Bell className="w-5 h-5 fill-[#2563EB]" />
        {/* Red notification dot */}
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h5 className="text-[13px] font-bold text-gray-800 leading-tight">Health Reminder</h5>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Don't forget your medication</p>
      </div>

      {/* Close/Mute Icon */}
      <button className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
        <Bell className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default HealthReminderCard;
