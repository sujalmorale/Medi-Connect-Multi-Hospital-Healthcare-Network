import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initRedis, setCache } from './config/redis.js';
import { User } from './models/User.js';
import { Hospital } from './models/Hospital.js';
import { Doctor } from './models/Doctor.js';

dotenv.config();

const allMumbaiHospitals = [
  {
    customId: "hosp-mumbai-1",
    name: "Lilavati Hospital & Research Centre",
    tagline: "Human Care Medical Services • 24/7 Tertiary Super Speciality",
    city: "Mumbai",
    area: "Bandra West",
    address: "A-791, Bandra Reclamation, Bandra West, Mumbai 400050",
    phone: "+91 22 2675 1000",
    rating: 4.9,
    reviewCount: 1420,
    departments: ["General Physician", "Cardiologist", "Neurologist", "Orthopedic Specialist", "Pediatrician", "Gastroenterologist"],
    emergencyBeds: 8,
    icuAvailable: 5,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-2",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    tagline: "World-Class Multi-Speciality Healthcare & Trauma Care",
    city: "Mumbai",
    area: "Andheri West",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai 400053",
    phone: "+91 22 4269 6969",
    rating: 4.95,
    reviewCount: 2310,
    departments: ["Cardiologist", "Neurologist", "Oncologist", "Pediatrician", "Orthopedic Specialist"],
    emergencyBeds: 14,
    icuAvailable: 12,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-3",
    name: "Breach Candy Hospital Trust",
    tagline: "Premier Healthcare & Cardiac Excellence in South Mumbai",
    city: "Mumbai",
    area: "South Mumbai",
    address: "60-A, Bhulabhai Desai Road, Cumballa Hill, South Mumbai 400026",
    phone: "+91 22 2366 7788",
    rating: 4.85,
    reviewCount: 980,
    departments: ["General Physician", "Cardiologist", "Dermatologist", "Gynecologist"],
    emergencyBeds: 6,
    icuAvailable: 4,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-4",
    name: "Fortis Hospital Mulund",
    tagline: "5-Time JCI Accredited Heart & Organ Transplant Institute",
    city: "Mumbai",
    area: "Mulund West",
    address: "Mulund Goregaon Link Road, Mulund West, Mumbai 400078",
    phone: "+91 22 6799 4444",
    rating: 4.8,
    reviewCount: 1650,
    departments: ["Cardiologist", "Nephrologist", "Orthopedic Specialist", "Pulmonologist"],
    emergencyBeds: 10,
    icuAvailable: 8,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-5",
    name: "Sir H. N. Reliance Foundation Hospital",
    tagline: "Advanced Robotic Surgery & Precision Healthcare",
    city: "Mumbai",
    area: "Girgaon",
    address: "Raja Rammohan Roy Road, Prarthana Samaj, Girgaon, South Mumbai 400004",
    phone: "+91 22 6130 5000",
    rating: 4.9,
    reviewCount: 1890,
    departments: ["General Physician", "Cardiologist", "Gastroenterologist", "ENT Specialist"],
    emergencyBeds: 9,
    icuAvailable: 7,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-6",
    name: "Dr. L H Hiranandani Hospital",
    tagline: "Patient-Centric Multi-Speciality Center in Powai",
    city: "Mumbai",
    area: "Powai",
    address: "Hillside Road, Hiranandani Gardens, Powai, Mumbai 400076",
    phone: "+91 22 2576 3300",
    rating: 4.75,
    reviewCount: 840,
    departments: ["Pediatrician", "Orthopedic Specialist", "ENT Specialist", "Ophthalmologist"],
    emergencyBeds: 5,
    icuAvailable: 3,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-7",
    name: "Nanavati Max Super Speciality Hospital",
    tagline: "350-Bed Iconic Medical Institution in Vile Parle",
    city: "Mumbai",
    area: "Vile Parle West",
    address: "SV Road, Near Mithibai College, Vile Parle West, Mumbai 400056",
    phone: "+91 22 2618 2255",
    rating: 4.85,
    reviewCount: 1560,
    departments: ["General Physician", "Nephrologist", "Neurologist", "Cardiologist"],
    emergencyBeds: 11,
    icuAvailable: 9,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-8",
    name: "Navi Mumbai & Raigad Medical Clinics Association",
    tagline: "Verified Primary & Specialist Care Centers in Belapur & Uran",
    city: "Navi Mumbai",
    area: "CBD Belapur & Uran",
    address: "Sector-5 Market, CBD Belapur & Uran Dist. Raigad, Navi Mumbai 400614",
    phone: "+91 98181 52847",
    rating: 4.7,
    reviewCount: 430,
    departments: ["General Physician", "Pediatrician", "Family Medicine"],
    emergencyBeds: 4,
    icuAvailable: 3,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-9",
    name: "North Suburban Doctors Clinic Alliance",
    tagline: "Premier Family Clinics in Borivali, Kandivali & Dahisar",
    city: "Mumbai",
    area: "Borivali & Kandivali",
    address: "L.T. Road Borivali West, Thakur Village Kandivali East & Dahisar West, Mumbai 400091",
    phone: "+91 22 2886 7141",
    rating: 4.8,
    reviewCount: 780,
    departments: ["General Physician", "Pediatrician", "Internal Medicine"],
    emergencyBeds: 5,
    icuAvailable: 4,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-10",
    name: "Western Suburbs PolyClinic Network",
    tagline: "Multi-Speciality Clinics in Oshiwara, Goregaon, Khar & Malad",
    city: "Mumbai",
    area: "Goregaon & Oshiwara",
    address: "New Link Rd Oshiwara, S.V. Road Goregaon West & Malad West, Mumbai 400104",
    phone: "+91 22 2872 7553",
    rating: 4.75,
    reviewCount: 650,
    departments: ["General Physician", "Gynecologist", "Internal Medicine"],
    emergencyBeds: 6,
    icuAvailable: 5,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-11",
    name: "Thane & Central Suburbs Doctor Network",
    tagline: "Polyclinics across Ghodbunder Road Thane & Vikhroli East",
    city: "Mumbai",
    area: "Thane & Vikhroli",
    address: "Cosmos Regency Waghbil Thane West & Kannamwar Nagar Vikhroli East, Mumbai 400083",
    phone: "+91 22 2577 7803",
    rating: 4.7,
    reviewCount: 520,
    departments: ["General Physician", "Orthopedic Specialist", "Family Medicine"],
    emergencyBeds: 4,
    icuAvailable: 3,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-12",
    name: "South & Central Mumbai Clinic Network",
    tagline: "Verified Clinics in Dadar, Worli, Byculla & Grant Road",
    city: "Mumbai",
    area: "Dadar & Worli",
    address: "Behind Dadar Police Station, Worli Century Bazar & Grant Rd, Mumbai 400028",
    phone: "+91 22 2422 7281",
    rating: 4.82,
    reviewCount: 890,
    departments: ["General Physician", "Gynecologist", "Dermatologist"],
    emergencyBeds: 7,
    icuAvailable: 6,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
  },
  {
    customId: "hosp-mumbai-13",
    name: "Mid-Suburbs & East Mumbai Doctors Association",
    tagline: "Family Healthcare Clinics in Santacruz, Ghatkopar & Versova",
    city: "Mumbai",
    area: "Santacruz & Ghatkopar",
    address: "Santacruz East, Rajawadi Ghatkopar East & Versova Andheri, Mumbai 400077",
    phone: "+91 22 2613 2181",
    rating: 4.78,
    reviewCount: 610,
    departments: ["General Physician", "Cardiologist", "Child Care"],
    emergencyBeds: 5,
    icuAvailable: 4,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
  }
];

const allMumbaiDoctors = [
  {
    customId: "doc-mumbai-1",
    hospitalId: "hosp-mumbai-1",
    name: "Dr. Shashank Joshi",
    specialty: "General Physician",
    degree: "MD, DM (Endocrinology), FACP, FRCP",
    experienceYears: 24,
    consultationFee: 1200,
    rating: 4.9,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    availableSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"],
    bookedSlots: [],
    roomNo: "Cabin 104"
  },
  {
    customId: "doc-mumbai-2",
    hospitalId: "hosp-mumbai-1",
    name: "Dr. Ashwin Mehta",
    specialty: "Cardiologist",
    degree: "MD, DM (Cardiology), FACC",
    experienceYears: 28,
    consultationFee: 1800,
    rating: 4.95,
    availableDays: ["Mon", "Wed", "Fri"],
    availableSlots: ["10:30 AM", "11:45 AM", "03:00 PM", "05:15 PM"],
    bookedSlots: [],
    roomNo: "Cardiac Wing A-2"
  },
  {
    customId: "doc-dir-1",
    hospitalId: "hosp-mumbai-8",
    name: "Dr. Anuradha Naik",
    specialty: "General Physician",
    degree: "MBBS, Family Medicine Specialist",
    experienceYears: 15,
    consultationFee: 500,
    rating: 4.8,
    availableDays: ["Mon", "Tue", "Thu", "Sat"],
    availableSlots: ["10:00 AM", "11:30 AM", "05:00 PM", "06:30 PM"],
    bookedSlots: [],
    roomNo: "CBD Belapur Clinic"
  },
  {
    customId: "doc-dir-2",
    hospitalId: "hosp-mumbai-9",
    name: "Dr. Archana A. Nanaware",
    specialty: "General Physician",
    degree: "MBBS, Family Healthcare Specialist",
    experienceYears: 18,
    consultationFee: 600,
    rating: 4.85,
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    availableSlots: ["10:30 AM", "11:30 AM", "12:00 PM", "06:30 PM", "07:30 PM"],
    bookedSlots: [],
    roomNo: "Thakur Village Kandivali"
  },
  {
    customId: "doc-dir-3",
    hospitalId: "hosp-mumbai-9",
    name: "Dr. Arva Shirazi",
    specialty: "General Physician",
    degree: "MBBS, Child & General Health Practitioner",
    experienceYears: 14,
    consultationFee: 550,
    rating: 4.75,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availableSlots: ["10:00 AM", "11:00 AM", "05:30 PM", "07:00 PM"],
    bookedSlots: [],
    roomNo: "Borivali East"
  },
  {
    customId: "doc-dir-4",
    hospitalId: "hosp-mumbai-9",
    name: "Dr. B. Girishchandra Alva",
    specialty: "General Physician",
    degree: "MBBS, Lachu Clinic Chief Physician",
    experienceYears: 22,
    consultationFee: 650,
    rating: 4.9,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    availableSlots: ["09:30 AM", "11:00 AM", "12:30 PM", "06:00 PM", "08:00 PM"],
    bookedSlots: [],
    roomNo: "Lachu Clinic Borivali"
  }
];

const seedData = async () => {
  try {
    const isMongoConnected = await connectDB();
    await initRedis();

    if (isMongoConnected) {
      console.log('[Seed] Clearing existing collections...');
      await User.deleteMany({});
      await Hospital.deleteMany({});
      await Doctor.deleteMany({});

      console.log('[Seed] Creating default user accounts for all roles...');
      await User.create([
        { name: "Rahul Sharma", email: "patient@mediconnect.com", password: "Password123!", role: "patient", phone: "+91 98201 11223" },
        { name: "Lilavati Admin", email: "hospadmin@mediconnect.com", password: "Password123!", role: "hospAdmin", hospitalId: "hosp-mumbai-1" },
        { name: "Dr. Shashank Joshi", email: "doctor@mediconnect.com", password: "Password123!", role: "doctor", doctorId: "doc-mumbai-1", hospitalId: "hosp-mumbai-1" },
        { name: "System SuperAdmin", email: "superadmin@mediconnect.com", password: "SuperPassword123!", role: "superAdmin" }
      ]);

      console.log(`[Seed] Inserting ${allMumbaiHospitals.length} Mumbai Network Hospitals...`);
      await Hospital.insertMany(allMumbaiHospitals);

      console.log(`[Seed] Inserting ${allMumbaiDoctors.length} Doctors...`);
      await Doctor.insertMany(allMumbaiDoctors);

      console.log('[Seed] Seeding Redis cache keys...');
      await setCache('hospitals:all', allMumbaiHospitals, 600);
      await setCache('doctors:all:all', allMumbaiDoctors, 600);

      console.log('✅ Comprehensive Mumbai Healthcare dataset seeded successfully!');
    } else {
      console.log('[Seed] MongoDB not connected; cached all Mumbai hospital locations in Redis/Memory store.');
      await setCache('hospitals:all', allMumbaiHospitals, 600);
      await setCache('doctors:all:all', allMumbaiDoctors, 600);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
