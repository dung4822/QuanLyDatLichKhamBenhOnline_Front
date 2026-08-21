import React from 'react';
import BookingForm from './BookingForm';
import UpcomingAppointmentCard from './UpcomingAppointmentCard';
import HealthReminderCard from './HealthReminderCard';
import SupportCard from './SupportCard';
import HeroBadges from './HeroBadges';
import backgroundImg from '../../../assets/backgroundhomeheroic.png';

const HomeHeroSection = () => {
  return (
    // Học điểm 3: Sử dụng background màu trắng và loại bỏ flex-centering để căn chỉnh sát mép trên.
    <section className="relative bg-white pt-8 pb-16 lg:pt-14 lg:pb-2 min-h-[640px] lg:h-[700px] flex items-center overflow-hidden">
      
      {/* Nền gradient chìm nhẹ nhàng để tăng chiều sâu mà không lộ viền ảnh */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#F8FBFD] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-30">
        
        {/* Layout 2 cột: Cột trái chứa text, cột phải chừa trống làm không gian cho ảnh tuyệt đối */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI (Chiếm 7/12 cột trên màn hình lớn) */}
          <div className="lg:col-span-7 pt-4 xl:pt-8 flex flex-col justify-start animate-in fade-in slide-in-from-left-4 duration-700">
            
            {/* Tag Line sát với mép trên như hình gốc */}
            <div className="mb-4">
              <span className="inline-block bg-[#EBF3FE] text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                Trusted care. Every time.
              </span>
            </div>

            {/* Heading chính */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-bold text-[#0F2942] leading-[1.12] mb-5 tracking-tight">
              Book hospital <br />
              appointments <br />
              <span className="text-[#2563EB] font-serif italic font-normal tracking-wide">
                easily & safely
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
              Consult with experienced doctors, book appointments in seconds, and manage your healthcare – all in one place.
            </p>
          </div>

          {/* CỘT PHẢI TRỐNG (Spacer) - Chỉ hiển thị trên desktop để tạo không gian cột cho hình nền absolute */}
          <div className="lg:col-span-5 h-[380px] lg:h-[460px] xl:h-[500px] pointer-events-none hidden lg:block"></div>
        </div>

        {/* 
          Học điểm 4: Đưa Booking Form ra ngoài Grid chính và kéo lùi (negative margin) hoặc 
          căn chỉnh để nó đè lên ảnh nền bên phải, tạo cảm giác 3D nổi hẳn lên.
          Giới hạn max-w-[940px] để tránh đè lên card 24/7 phía bên phải.
        */}
        <div className="relative z-40 lg:-mt-12 mb-10 w-full max-w-[1080px] animate-in fade-in slide-in-from-bottom-5 duration-700">
          <BookingForm />
        </div>

        {/* Trust Badges nằm ngay dưới Form Booking */}
        <div className="relative z-30 mt-6 lg:mt-10">
          <HeroBadges />
        </div>

      </div>

      {/* 
        Học điểm 5: Căn chỉnh ảnh nền absolute phủ từ cạnh phải sử dụng object-contain.
        Điều này đảm bảo ảnh nền (gồm cả bệnh nhân và bác sĩ) không bao giờ bị cắt mất một nửa.
      */}
      <div className="absolute right-0 top-0 bottom-0 w-[55vw] hidden lg:block z-10 select-none pointer-events-none">
        <img 
          src={backgroundImg} 
          alt="Medicare Hero Artwork" 
          className="w-full h-full object-contain object-right"
        />
      </div>

      {/* 
        Học điểm 6: Định vị tuyệt đối các Card nổi theo mép phải (right) của Section.
        Vì chiều cao Section là cố định (lg:h-[700px]) và ảnh sử dụng object-contain sát lề phải,
        vị trí của bác sĩ so với mép phải màn hình là CỐ ĐỊNH.
        Sử dụng right-[...] giúp các card luôn khớp chính xác vào hình ảnh bác sĩ trên mọi độ phân giải.
      */}
      {/* Card 1: Upcoming Appointment - Nổi sát mặt bác sĩ */}
      <div className="absolute top-[13%] right-[420px] xl:right-[455px] z-20 hidden lg:block">
        <UpcomingAppointmentCard />
      </div>

      {/* Card 2: Health Reminder - Dưới card 1 và chệch sang trái */}
      <div className="absolute top-[42%] right-[420px] xl:right-[470px] z-20 hidden lg:block">
        <HealthReminderCard />
      </div>

      {/* Card 3: 24/7 Support - Sát tay phải bác sĩ */}
      <div className="absolute bottom-[2%] right-[40px] xl:right-[80px] z-20 hidden lg:block">
        <SupportCard />
      </div>

      {/* Giao diện hiển thị trên Mobile (Do ảnh gốc là absolute trên desktop) */} 
 <div className="lg:hidden relative w-full aspect-[1.1] sm:aspect-[1.3] flex items-center justify-center mt-6 px-4">
        <img 
          src={backgroundImg} 
          alt="Medicare Hero Artwork Mobile" 
          className="w-full h-full object-contain"
        />
        
        {/* Định vị các card thu nhỏ (scale) trên Mobile để tránh tràn màn hình */}
        <div className="absolute top-[12%] left-[4%] scale-75 origin-top-left">
          <UpcomingAppointmentCard />
        </div>
        <div className="absolute top-[42%] left-[2%] scale-75 origin-top-left">
          <HealthReminderCard />
        </div>
        <div className="absolute bottom-[16%] right-[4%] scale-75 origin-bottom-right">
          <SupportCard />
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;