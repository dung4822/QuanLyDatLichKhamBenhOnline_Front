import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, User, MapPin, Calendar, ChevronDown, Search } from 'lucide-react';

const BookingForm = () => {
  const [specialty, setSpecialty] = useState('');
  const [doctor, setDoctor] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const specialties = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology'
  ];

  const doctors = [
    'Dr. Ananya Sharma',
    'Dr. Rohan Mehta',
    'Dr. Priya Nair',
    'Dr. Arvind Kapoor'
  ];

  const locations = [
    'New Delhi, India',
    'Mumbai, Maharashtra',
    'Bangalore, Karnataka',
    'Chennai, Tamil Nadu'
  ];

  const handleSelect = (type, value) => {
    if (type === 'specialty') setSpecialty(value);
    if (type === 'doctor') setDoctor(value);
    if (type === 'location') setLocation(value);
    setOpenDropdown(null);
  };

  const toggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  return (
    <div 
      ref={dropdownRef}
      className="bg-white rounded-3xl lg:rounded-full shadow-[0_15px_45px_rgba(15,41,66,0.08)] p-3 lg:p-2.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-1 w-full max-w-5xl border border-slate-100 relative z-40 transition-all duration-300 hover:shadow-[0_20px_55px_rgba(15,41,66,0.12)]"
    >
      {/* 1. SPECIALTY SELECT */}
      <div 
        className="flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/80 rounded-xl lg:rounded-full cursor-pointer transition-all duration-200 flex-1 relative group"
        onClick={() => toggleDropdown('specialty')}
      >
        <div className="flex items-center justify-center w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 leading-none">Specialty</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[13px] truncate leading-none ${specialty ? 'text-slate-700 font-medium' : 'text-slate-400 font-normal'}`}>
              {specialty || 'Choose specialty'}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === 'specialty' ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`} />

        {/* Specialty Dropdown Menu */}
        {openDropdown === 'specialty' && (
          <div className="absolute top-[105%] left-0 w-full lg:w-60 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {specialties.map((item) => (
              <div
                key={item}
                className="px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('specialty', item);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block h-10 w-[1px] bg-slate-200/80 self-center"></div>

      {/* 2. DOCTOR SELECT */}
      <div 
        className="flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/80 rounded-xl lg:rounded-full cursor-pointer transition-all duration-200 flex-1 relative group"
        onClick={() => toggleDropdown('doctor')}
      >
        <div className="flex items-center justify-center w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 leading-none">Doctor</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[13px] truncate leading-none ${doctor ? 'text-slate-700 font-medium' : 'text-slate-400 font-normal'}`}>
              {doctor || 'Choose doctor'}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === 'doctor' ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`} />

        {/* Doctor Dropdown Menu */}
        {openDropdown === 'doctor' && (
          <div className="absolute top-[105%] left-0 w-full lg:w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {doctors.map((item) => (
              <div
                key={item}
                className="px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('doctor', item);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block h-10 w-[1px] bg-slate-200/80 self-center"></div>

      {/* 3. LOCATION SELECT */}
      <div 
        className="flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/80 rounded-xl lg:rounded-full cursor-pointer transition-all duration-200 flex-1 relative group"
        onClick={() => toggleDropdown('location')}
      >
        <div className="flex items-center justify-center w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 leading-none">Location</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-[13px] truncate leading-none ${location ? 'text-slate-700 font-medium' : 'text-slate-400 font-normal'}`}>
              {location || 'Choose location'}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === 'location' ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`} />

        {/* Location Dropdown Menu */}
        {openDropdown === 'location' && (
          <div className="absolute top-[105%] left-0 w-full lg:w-60 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {locations.map((item) => (
              <div
                key={item}
                className="px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect('location', item);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block h-10 w-[1px] bg-slate-200/80 self-center"></div>

      {/* 4. DATE SELECT */}
      <div className="flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/80 rounded-xl lg:rounded-full cursor-pointer transition-all duration-200 flex-1 relative group">
        <div className="flex items-center justify-center w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 leading-none">Date</p>
          <div className="relative mt-1">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            />
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[13px] truncate leading-none ${date ? 'text-slate-700 font-medium' : 'text-slate-400 font-normal'}`}>
                {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
              </span>
            </div>
          </div>
        </div>
        <Calendar className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600 pointer-events-none" />
      </div>

      {/* 5. FIND APPOINTMENT BUTTON */}
      <button 
        type="button"
        className="bg-[#0B2545] hover:bg-[#133A66] active:scale-98 text-white font-bold text-[15px] px-6 py-4 lg:py-4 rounded-xl lg:rounded-full shadow-md hover:shadow-lg transition-all duration-200 tracking-wide shrink-0 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Find Appointment</span>
      </button>
    </div>
  );
};

export default BookingForm;
