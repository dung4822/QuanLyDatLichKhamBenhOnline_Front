import React from 'react';
import { Headphones } from 'lucide-react';

const SupportCard = () => {
  return (
    <div className="bg-white rounded-2xl lg:rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100/50 px-5 py-3 w-[250px] flex items-center gap-3.5 animate-float-card-3 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:scale-[1.02]">
      {/* Icon Badge */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#EBF3FE] text-[#2563EB] shrink-0">
        <Headphones className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <h5 className="text-[13px] font-bold text-gray-800 leading-tight">24/7 Support</h5>
        <p className="text-[11px] font-medium text-gray-500 mt-0.5 truncate">We are here to help you</p>
      </div>
    </div>
  );
};

export default SupportCard;
