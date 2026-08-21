import React from 'react';
import {
  Stethoscope,
  Users,
  Award,
  ShieldCheck,
  Star,
  Building2,
} from 'lucide-react';

const stats = [
  {
    icon: Stethoscope,
    value: '25+',
    label: 'Specialties',
    color: '#2563EB',
    bgColor: '#EBF3FE',
  },
  {
    icon: Users,
    value: '200+',
    label: 'Expert Doctors',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  {
    icon: Award,
    value: '1M+',
    label: 'Patients Served',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    icon: Building2,
    value: '50+',
    label: 'Hospital Partners',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Patient Rating',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
];

const TrustedStats = () => {
  return (
    <section className="bg-white py-10 border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Box */}
        <div className="bg-[#F8FBFD] border border-slate-100 rounded-3xl p-6 lg:p-8 flex flex-col xl:flex-row items-center justify-between gap-8">
          
          {/* Left Title */}
          <div className="text-center xl:text-left shrink-0">
            <h3 className="text-lg font-bold text-[#0F2942] tracking-tight">
              Trusted by thousands.
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Preferred for care.
            </p>
          </div>

          {/* Center Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-8 flex-1 justify-items-center xl:justify-items-start">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-[#0F2942] leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1 leading-none whitespace-nowrap">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Accreditations */}
          <div className="flex items-center gap-4 border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-8 shrink-0">
            {/* NABH Badge */}
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-2 px-3 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="leading-tight">
                <p className="text-[9px] font-bold text-[#0F2942] tracking-wider uppercase">
                  NABH
                </p>
                <p className="text-[8px] text-slate-400 font-semibold">
                  Accredited Hospital
                </p>
              </div>
            </div>

            {/* ISO Badge */}
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-2 px-3 shadow-sm">
              <Award className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="leading-tight">
                <p className="text-[9px] font-bold text-[#0F2942] tracking-wider uppercase">
                  ISO 9001
                </p>
                <p className="text-[8px] text-slate-400 font-semibold">
                  Certified Care
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default TrustedStats;
