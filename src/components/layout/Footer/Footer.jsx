import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import logo from '../../../assets/logo1.png';

// Custom inline SVG icons because Lucide removed brand icons in recent versions
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const footerLinks = {
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Doctors', href: '#doctors' },
    { label: 'Careers', href: '#' },
    { label: 'News & Updates', href: '#' },
    { label: 'Contact Us', href: '#contact' },
  ],
  'For Patients': [
    { label: 'Find Doctors', href: '#doctors' },
    { label: 'Book Appointment', href: '#' },
    { label: 'Health Packages', href: '#' },
    { label: 'Insurance Partners', href: '#' },
    { label: 'Patient Support', href: '#' },
  ],
  Resources: [
    { label: 'Health Library', href: '#' },
    { label: 'Blogs', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const socialLinks = [
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
];

const Footer = () => {
  return (
    <footer className="bg-white text-slate-500 border-t border-slate-100">

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-5 hover:cursor-pointer">
                <img
                  src={logo}
                  alt="MediCare+ Logo"
                  className="h-10 w-auto object-contain mix-blend-multiply"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#0F2942] leading-tight">
                    MediCare+
                  </span>
                  <span className="text-[10px] text-[#13b3a9] font-medium tracking-wide">
                    Multi-Speciality Hospital
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs font-medium">
                Compassionate care. Advanced technology. Better health for all.
              </p>
            </div>

            {/* Social Icons (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-100
                    flex items-center justify-center transition-all duration-200 text-slate-400 hover:text-[#2563EB] hover:-translate-y-0.5"
                >
                  <social.icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <h4 className="text-sm font-bold text-[#0F2942] mb-4 tracking-wide">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-[#2563EB] transition-colors 
                        flex items-center gap-1 group font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Us Column */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-[#0F2942] mb-4 tracking-wide">
              Contact Us
            </h4>
            <div className="space-y-3 font-medium">
              <a href="tel:+919876543210" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-[#2563EB] transition-colors group">
                <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
                +91 98765 43210
              </a>
              <a href="mailto:care@medicareplus.com" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-[#2563EB] transition-colors group">
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
                care@medicareplus.com
              </a>
              <div className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>123 Health Way, Medical District, New Delhi - 110001, India</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} MediCare+. All rights reserved.
          </p>

          {/* Social Icons (Mobile) */}
          <div className="flex lg:hidden items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-100
                  flex items-center justify-center transition-all duration-200 text-slate-400 hover:text-[#2563EB] hover:-translate-y-0.5"
              >
                <social.icon className="w-4.5 h-4.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
