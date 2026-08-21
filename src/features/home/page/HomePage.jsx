import React from 'react'
import Header from '../../../components/layout/Header/Header';
import HomeHeroSection from '../components/HomeHeroSection';
import FeaturedDoctors from '../components/FeaturedDoctors';
import BrowseSpecialties from '../components/BrowseSpecialties';
import HowItWorks from '../components/HowItWorks';
import TrustedStats from '../components/TrustedStats';
import PatientTestimonials from '../components/PatientTestimonials';
import DownloadApp from '../components/DownloadApp';
import Footer from '../../../components/layout/Footer/Footer';

const HomePage = () => {
  return (
    <div>
      <Header />
      <HomeHeroSection />
      <FeaturedDoctors />
      <BrowseSpecialties />
      <HowItWorks />
      <TrustedStats />
      <PatientTestimonials />
      <DownloadApp />
      <Footer />
    </div>
  )
}
export default HomePage;
