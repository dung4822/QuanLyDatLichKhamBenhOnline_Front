import Header from '../../../components/layout/Header/Header'
import Footer from '../../../components/layout/Footer/Footer'
import HomeHeroSection from '../components/HomeHeroSection'
import BrowseSpecialties from '../components/BrowseSpecialties'
import FeaturedDoctors from '../components/FeaturedDoctors'
import HowItWorks from '../components/HowItWorks'
import { useDirectory } from '../useDirectory'

export default function HomePage() {
  const directory = useDirectory()
  return (
    <div className="home-page">
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <HomeHeroSection directory={directory} />
        <BrowseSpecialties directory={directory} />
        <FeaturedDoctors directory={directory} />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
