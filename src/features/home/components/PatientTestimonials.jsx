import React from 'react';
import TestimonialCard from './TestimonialCard';

const PatientTestimonials = () => {
  const testimonials = [
    {
      quote:
        'Booking was so easy and the doctor was very attentive. The whole experience was well organized, seamless.',
      name: 'Richa Malhotra',
      role: 'Verified Patient',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
      rating: 5,
    },
    {
      quote:
        'Great platform! I found the best specialist near me and got an appointment instantly. Highly recommend it.',
      name: 'Amit Verma',
      role: 'Verified Patient',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
      rating: 5,
    },
    {
      quote:
        'Very professional and user-friendly. Highly recommended for hassle-free healthcare booking and consultations.',
      name: 'Neha Kapoor',
      role: 'Verified Patient',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80',
      rating: 5,
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-10 border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2942] tracking-tight">
            What our patients say
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">
            Real stories from people who trust us with their care
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <TestimonialCard
              key={idx}
              quote={t.quote}
              name={t.name}
              role={t.role}
              avatar={t.avatar}
              rating={t.rating}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default PatientTestimonials;
