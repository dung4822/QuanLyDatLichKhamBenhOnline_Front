import React from 'react';
import { Calendar } from 'lucide-react';

const UpcomingAppointmentCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/50 p-4 w-[260px] animate-float-card-1 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:scale-[1.02]">
      {/* Header */}
      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming Appointment</h4>
      
      {/* Doctor Info */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80" 
          alt="Dr. Ananya Sharma" 
          className="w-10 h-10 rounded-full object-cover border border-blue-100"
        />
        <div className="min-w-0">
          <h5 className="text-[13px] font-bold text-gray-800 leading-tight truncate">Dr. Ananya Sharma</h5>
          <p className="text-[11px] font-medium text-gray-500">Cardiologist</p>
        </div>
      </div>

      {/* Appointment Time */}
      <div className="flex items-center gap-2 bg-[#F0F5FD] px-3 py-2 rounded-lg text-[#2563EB]">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold">May 24, 2025 • 10:30 AM</span>
      </div>
    </div>
  );
};

export default UpcomingAppointmentCard;
