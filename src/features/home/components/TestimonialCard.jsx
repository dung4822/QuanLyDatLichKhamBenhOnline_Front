import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = ({ quote, name, role, avatar, rating }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 p-6 flex flex-col justify-between gap-5
      transition-all duration-300 hover:shadow-[0_12px_35px_rgba(15,41,66,0.07)] hover:-translate-y-1 group">

      {/* Quote icon + testimonial text */}
      <div className='relative'>
        <Quote 
          className="absolute w-5 h-5 text-[#2563EB]/15 rotate-180 top-0 -left-1.5" 
          strokeWidth={1.5}
          fill="currentColor"
        />
        <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed font-medium ml-5">
          {quote}
        </p>
      </div>

      {/* Author info + rating */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100/80">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shrink-0"
          />
          {/* Name & role */}
          <div className="min-w-0">
            <h4 className="text-[13px] font-bold text-slate-800 leading-tight truncate">
              {name}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              {role}
            </p>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
