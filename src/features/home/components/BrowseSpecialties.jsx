import React from 'react';
import {
  ArrowRight,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Ribbon,
  Sparkles,
  Ear,
  Eye,
} from 'lucide-react';
import SpecialtyCard from './SpecialtyCard';

const BrowseSpecialties = () => {
  // Danh sách chuyên khoa với icon, màu chủ đạo và subtitle mô tả ngắn.
  const specialties = [
    {
      name: 'Cardiology',
      subtitle: 'Heart & Vascular',
      icon: HeartPulse,
      color: '#E53E3E',
      bgColor: '#FEE2E2',
    },
    {
      name: 'Neurology',
      subtitle: 'Brain & Nerves',
      icon: Brain,
      color: '#7C3AED',
      bgColor: '#EDE9FE',
    },
    {
      name: 'Orthopedics',
      subtitle: 'Bones & Joints',
      icon: Bone,
      color: '#D97706',
      bgColor: '#FEF3C7',
    },
    {
      name: 'Pediatrics',
      subtitle: 'Child Care',
      icon: Baby,
      color: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      name: 'Gynecology',
      subtitle: "Women's Health",
      icon: Ribbon,
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
    {
      name: 'Dermatology',
      subtitle: 'Skin & Hair',
      icon: Sparkles,
      color: '#14B8A6',
      bgColor: '#CCFBF1',
    },
    {
      name: 'ENT',
      subtitle: 'Ear, Nose, Throat',
      icon: Ear,
      color: '#0EA5E9',
      bgColor: '#E0F2FE',
    },
    {
      name: 'Ophthalmology',
      subtitle: 'Eye Care',
      icon: Eye,
      color: '#059669',
      bgColor: '#D1FAE5',
    },
  ];

  return (
    <section className="bg-[#F8FBFD] py-16 lg:py-10 border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header — Cùng layout với FeaturedDoctors để giữ tính nhất quán */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2942] tracking-tight">
              Browse by Specialties
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">
              Find the right care for your health
            </p>
          </div>

          {/* Link xem tất cả */}
          <a
            href="#specialties"
            className="group text-sm font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View all specialties</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>  
        </div>

        {/* 
          Grid chuyên khoa: 
          - Mobile: 2 cột (vừa đủ để hiển thị icon nhỏ gọn)
          - Tablet: 4 cột
          - Desktop: 8 cột (1 hàng ngang đầy đủ như design)
        */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
          {specialties.map((specialty, idx) => (
            <SpecialtyCard
              key={idx}
              name={specialty.name}
              subtitle={specialty.subtitle}
              icon={specialty.icon}
              color={specialty.color}
              bgColor={specialty.bgColor}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default BrowseSpecialties;
