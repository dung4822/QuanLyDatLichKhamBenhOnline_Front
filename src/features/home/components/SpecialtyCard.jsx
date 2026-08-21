import React from 'react';

const SpecialtyCard = ({ name, subtitle, icon: Icon, color, bgColor }) => {
  return (
    // Học điểm: Hover effect với scale + shadow tạo cảm giác card "nổi" lên khi rê chuột.
    <a
      href={`#specialty-${name.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl cursor-pointer
        transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgba(15,41,66,0.08)]
        hover:-translate-y-1 group"
    >
      {/* Icon container với background nhạt và viền mờ */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: bgColor }}
      >
        <Icon
          className="w-6 h-6 transition-colors duration-300"
          style={{ color: color }}
          strokeWidth={1.8}
        />
      </div>

      {/* Tên chuyên khoa */}
      <div>
        <h3 className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-[#2563EB] transition-colors">
          {name}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-tight">
          {subtitle}
        </p>
      </div>
    </a>
  );
};

export default SpecialtyCard;
