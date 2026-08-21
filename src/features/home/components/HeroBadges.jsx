import React from 'react';
import { Shield, Clock, Lock } from 'lucide-react';

const HeroBadges = () => {
  const badges = [
    {
      icon: <Shield className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      title: 'Verified Doctors',
      desc: 'Experienced & trusted',
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      title: 'Instant Booking',
      desc: 'Quick & easy process',
    },
    {
      icon: <Lock className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
      title: 'Secure & Private',
      desc: 'Your data is protected',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-6 lg:gap-12 mt-10">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex items-center gap-3 group cursor-pointer">
          {/* Icon wrapper with subtle scale hover */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${badge.bg} transition-all duration-300 group-hover:scale-110 shadow-sm`}>
            {badge.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
              {badge.title}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroBadges;
