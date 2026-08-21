import React from 'react';
import { Apple, Play } from 'lucide-react';
import phoneImg from '../../../assets/phonetilte.png';

const DownloadApp = () => {
  return (
    <section className="bg-[#EBF3FE] py-12 lg:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column — Phone mockup (order-2 on mobile, order-1 on desktop) */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-start order-2 lg:order-1 mt-6 lg:mt-0">
            <div className="relative">
              {/* Soft background circle accent */}
              <div className="absolute inset-0 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
              
              <img
                src={phoneImg}
                alt="MediCare+ App on mobile phone"
                className="relative z-10 w-[240px] sm:w-[280px] lg:w-[320px] h-auto drop-shadow-[0_25px_50px_rgba(15,41,66,0.15)]
                  transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column — Text + Store buttons (order-1 on mobile, order-2 on desktop) */}
          <div className="lg:col-span-7 text-center lg:text-left order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0F2942] leading-tight tracking-tight mb-4">
              Healthcare at your{' '}
              <span className="text-[#1fb7ad]">
                fingertips
              </span>
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 font-medium">
              Download the <span className="font-semibold text-slate-700">MediCare+</span> app to book appointments, access reports, and manage your health anytime.
            </p>

            {/* Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-3 bg-black hover:bg-slate-900 text-white
                  rounded-xl px-5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-black/10 group"
              >
                <Apple className="w-6 h-6 text-white" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-300 font-medium leading-none uppercase tracking-wider">
                    Download on the
                  </p>
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">
                    App Store
                  </p>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-3 bg-black hover:bg-slate-900 text-white
                  rounded-xl px-5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-black/10 group"
              >
                <Play className="w-6 h-6 text-white fill-white" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-300 font-medium leading-none uppercase tracking-wider">
                    GET IT ON
                  </p>
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">
                    Google Play
                  </p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
