import React from 'react';
import { Search, CalendarCheck, Stethoscope } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Search,
    title: 'Search & Select',
    description: 'Choose your specialty, doctor, location & time.',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    number: 2,
    icon: CalendarCheck,
    title: 'Book Instantly',
    description: 'Confirm your appointment in just a few clicks.',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  {
    number: 3,
    icon: Stethoscope,
    title: 'Visit & Consult',
    description: 'Meet your doctor and get the best care possible.',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-white py-16 lg:py-10 border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-12 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2942] tracking-tight">
            How it works
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">
            Book an appointment in just 3 simple steps
          </p>
        </div>

        {/* Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative max-w-4xl mx-auto">

          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">

              {/* Dashed connector line — chỉ hiện giữa các bước trên desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] z-0">
                  <svg
                    width="100%"
                    height="50"
                    viewBox="0 0 260 50"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    {/* đường cong */}
                    <path
                      d=" M20 25  C50 25, 70 8, 120 25 S190 42, 240 25 "
                      stroke="#CBD5E1"
                      strokeWidth="1.8"
                      strokeDasharray="7 5"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* mũi tên */}
                    <polyline
                      points="232,19 242,25 232,31"
                      stroke="#CBD5E1"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Step number badge */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white mb-3"
                style={{ backgroundColor: step.color }}
              >
                {step.number}
              </div>

              {/* Icon circle */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative z-10
                  transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: step.bgColor }}
              >
                <step.icon
                  className="w-7 h-7"
                  style={{ color: step.color }}
                  strokeWidth={1.8}
                />
              </div>

              {/* Text content */}
              <h3 className="text-[15px] font-bold text-slate-800 leading-snug mb-1">
                {step.title}
              </h3>
              <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
