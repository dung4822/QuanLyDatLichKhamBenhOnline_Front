import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';

const DoctorCard = ({ name, specialty, experience, rating, reviews, image }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    // Học điểm 1: Bố cục flex ngang trong card kết hợp căn chỉnh absolute cho các chi tiết phụ (nút thích).
    <div className="bg-white rounded-2xl border border-slate-100/80 p-4.5 flex items-center gap-4 relative transition-all duration-300 hover:shadow-[0_15px_40px_rgba(15,41,66,0.06)] hover:-translate-y-1.5 group">
      
      {/* 
        Hình đại diện Bác sĩ:
        Học điểm 3: Sử dụng class "doctor-mask" đã được định nghĩa trong index.css
        để tạo hình dạng bo góc bất đối xứng (organic shape), giúp ảnh bác sĩ trông nghệ thuật hơn hình tròn đơn thuần.
      */}
      <div className="w-20 h-20 shrink-0 overflow-hidden bg-slate-50 doctor-mask border border-slate-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Phần thông tin chi tiết */}
      <div className="flex-1 min-w-0">
        {/* Tên bác sĩ và Nút yêu thích */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[15px] font-bold text-slate-800 leading-snug break-words group-hover:text-blue-600 transition-colors flex-1">
            {name}
          </h4>
          
          {/* 
            Nút yêu thích (Heart Icon):
            Học điểm 2: Nút tương tác dạng toggle sử dụng state đơn giản.
            Sử dụng transition-transform để tăng hiệu ứng phản hồi khi di chuột.
          */}
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="text-slate-300 hover:text-red-500 transition-colors duration-200 cursor-pointer active:scale-90 shrink-0 mt-0.5"
            aria-label="Add to favorites"
          >
            <Heart 
              className={`w-4.5 h-4.5 transition-all duration-200  ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:text-slate-400'}`} 
            />
          </button>
        </div>
        
        {/* Chuyên khoa */}
        <p className="text-[12px] font-semibold text-slate-400 mt-0.5 leading-none">
          {specialty}
        </p>

        {/* Kinh nghiệm */}
        <p className="text-[12px] text-slate-500 mt-3 font-medium leading-none">
          {experience} years experience
        </p>

        {/* Đánh giá sao & lượt review */}
        <div className="flex items-center gap-1 mt-2.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-[12px] font-bold text-slate-700 leading-none mt-0.5">
            {rating}
          </span>
          <span className="text-[12px] text-slate-400 leading-none mt-0.5 font-normal">
            ({reviews}+)
          </span>
        </div>
      </div>

    </div>
  );
};

export default DoctorCard;
