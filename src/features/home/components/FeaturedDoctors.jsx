import { ArrowRight } from 'lucide-react';
import DoctorCard from './DoctorCard';

const FeaturedDoctors = () => {
  const doctorsList = [
    {
      name: 'Dr. Ananya Sharma',
      specialty: 'Cardiologist',
      experience: 12,
      rating: 4.9,
      reviews: 1200,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    },
    {
      name: 'Dr. Rohan Mehta',
      specialty: 'Neurologist',
      experience: 10,
      rating: 4.8,
      reviews: 980,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&h=200&q=80',
    },
    {
      name: 'Dr. Priya Nair',
      specialty: 'Dermatologist',
      experience: 8,
      rating: 4.7,
      reviews: 860,
      image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    {
      name: 'Dr. Arvind Kapoor',
      specialty: 'Orthopedic Surgeon',
      experience: 15,
      rating: 4.9,
      reviews: 1100,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80',
    },
  ];

  return (
    // Học điểm 4: Sử dụng padding rộng rãi để phân tách các khu vực nội dung (Section) rõ ràng.
    <section className="bg-white py-16 lg:py-10 border-b border-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header của Section */}
        {/* Học điểm 5: Flexbox phân bố 2 đầu (justify-between) và căn dòng dưới chân (items-end) giúp bố cục cân đối. */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2942] tracking-tight">
              Featured Doctors
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">
              Top specialists recommended for you
            </p>
          </div>
          
          {/* Link Xem tất cả */}
          <a 
            href="/admin/doctors" 
            className="group text-sm font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View all doctors</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Grid chứa danh sách các Doctor Cards */}
        {/* Học điểm 6: Sử dụng CSS Grid responsive từ 1 cột (mobile) -> 2 cột (tablet) -> 4 cột (desktop) rất ngắn gọn. */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6.5">
          {doctorsList.map((doctor, idx) => (
            <DoctorCard 
              key={idx}
              name={doctor.name}
              specialty={doctor.specialty}
              experience={doctor.experience}
              rating={doctor.rating}
              reviews={doctor.reviews}
              image={doctor.image}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedDoctors;
