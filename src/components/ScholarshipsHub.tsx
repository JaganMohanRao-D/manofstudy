import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  GraduationCap,
  ExternalLink,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Share2,
  Building2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Award,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Info,
  Layers,
  ArrowUpRight,
  BookOpen,
  Eye,
} from 'lucide-react';
import { ScholarshipDetailsModal } from './ScholarshipDetailsModal';

export interface IndianScholarship {
  id: string;
  title: string;
  provider: string;
  category: string;
  target: string;
  eligibility: string;
  amount: string;
  deadline: string;
  apply_link: string;
}

export function isExclusivelyForGirls(s: IndianScholarship): boolean {
  const exclusiveGirlIds = [
    'aicte-pragati-scholarship-2026',
    'kotak-kanya-scholarship-2026',
    'amazon-future-engineer-2026',
    'loreal-for-young-women-2026',
    'begum-hazrat-mahal-2026',
    'dr-reddy-sashakt-scholarship-2026',
    'adobe-women-in-tech-2026',
  ];
  if (exclusiveGirlIds.includes(s.id)) return true;
  const titleAndTarget = (s.title + ' ' + s.target).toLowerCase();
  return (
    titleAndTarget.includes('for girls') ||
    titleAndTarget.includes('kanya') ||
    titleAndTarget.includes('female engineering')
  );
}

export function getScholarshipSummary(s: IndianScholarship): string {
  if (s.id === 'sbi-asha-scholarship-2026') {
    return 'Merit & need grant for Class 9–12 and college students across India with family income ≤ ₹3–6 Lakhs. Open to all genders.';
  }
  if (s.id === 'reliance-foundation-ug-2026') {
    return 'Prestigious CSR grant of up to ₹2 Lakhs for 1st-year undergraduates across all disciplines with household income < ₹15 Lakhs.';
  }
  if (s.id === 'hdfc-parivartan-ecss-2026') {
    return 'Crisis support grant covering up to ₹75,000 for school, diploma, polytechnic, and undergraduate students from vulnerable families.';
  }
  if (s.id === 'aicte-pragati-scholarship-2026') {
    return 'Special government grant of ₹50,000/year for meritorious female students enrolled in AICTE technical degree and diploma colleges.';
  }
  if (s.id === 'tata-capital-pankh-2026') {
    return 'Financial grant of up to 80% tuition fees for Class 11-12, diploma, and undergraduate students with family income ≤ ₹4 Lakhs.';
  }
  const parts = s.eligibility.split('.');
  if (parts.length > 1 && parts[0].length >= 40) {
    return parts[0].trim() + '.';
  }
  return s.eligibility.length > 130 ? s.eligibility.slice(0, 125).trim() + '.' : s.eligibility;
}

// Initial full dataset matching /public/indian_scholarships.json
const INITIAL_SCHOLARSHIPS: IndianScholarship[] = [
  {
    id: 'reliance-foundation-ug-2026',
    title: 'Reliance Foundation Undergraduate Scholarship',
    provider: 'Reliance Foundation',
    category: 'Corporate CSR',
    target: 'UG First Year Students (All Streams)',
    eligibility: 'Class 12 pass with min 60% marks, enrolled in 1st year full-time UG degree, household income < ₹15 Lakhs (preference to income < ₹2.5 Lakhs), mandatory online aptitude test',
    amount: 'Up to ₹2,00,000 (over full course duration, disbursed annually)',
    deadline: 'Check Official Portal (typically Aug–Oct)',
    apply_link: 'https://scholarships.reliancefoundation.org',
  },
  {
    id: 'hdfc-parivartan-ecss-2026',
    title: "HDFC Bank Parivartan's Educational Crisis Scholarship Support (ECSS)",
    provider: 'HDFC Bank (Parivartan CSR)',
    category: 'Corporate CSR',
    target: 'Class 1–12, Diploma, ITI, Polytechnic, UG & PG Students',
    eligibility: 'Students facing financial/personal crisis in past 3 years, min 55% marks in previous exam, annual family income ≤ ₹2.5 Lakhs (preference criteria)',
    amount: 'Up to ₹75,000/year (₹15,000–₹75,000 depending on education level)',
    deadline: 'Check Official Portal (multiple cycles; Cycle 1 typically closes Aug–Oct)',
    apply_link: 'https://www.parivartanecss.com',
  },
  {
    id: 'sbi-asha-scholarship-2026',
    title: 'SBI Platinum Jubilee Asha Scholarship',
    provider: 'SBI Foundation',
    category: 'Corporate CSR',
    target: 'Class 9–12, UG, PG, Medical, IIT, IIM & Overseas Students',
    eligibility: 'Min 75% marks/7.5 CGPA (relaxation to 65% for SC/ST, 60% for PwBD), family income ≤ ₹3 Lakhs (school) or ≤ ₹6 Lakhs (UG/PG/Medical/IIT/IIM). Open to All Genders (Boys & Girls, with 50% reservation for female students)',
    amount: '₹15,000 (School) to ₹15,00,000+ (Overseas PG); ₹75,000 (UG), ₹2,50,000 (PG), ₹4,50,000 (Medical)',
    deadline: 'Check Official Portal (typically Jul–Sep)',
    apply_link: 'https://www.sbiashascholarship.co.in',
  },
  {
    id: 'amazon-future-engineer-2026',
    title: 'Amazon Future Engineer (AFE) India Scholarship',
    provider: 'Amazon (in partnership with Foundation for Excellence - FFE)',
    category: 'Corporate CSR',
    target: 'First-Year Female Engineering/CSE Students',
    eligibility: 'First-year female engineering students from low-income families, admitted via state/national entrance exam, financial need verified by FFE facilitator',
    amount: '₹50,000/year (up to ₹2,00,000 over 4 years) + free laptop, mentorship & Amazon internship opportunity',
    deadline: 'Check Official Portal (typically Dec–Jan)',
    apply_link: 'https://ffe.org/amazon-future-engineer',
  },
  {
    id: 'aicte-pragati-scholarship-2026',
    title: 'AICTE Pragati Scholarship Scheme for Girls',
    provider: 'AICTE (Ministry of Education, Govt. of India)',
    category: 'Government Scheme',
    target: 'Girl Students in Technical Diploma/Degree Courses',
    eligibility: 'Admitted to 1st year (or 2nd year via lateral entry) of AICTE-approved technical degree/diploma, max 2 girls per family, annual family income ≤ ₹8,00,000',
    amount: '₹50,000/year (5,000 scholarships each for degree & diploma annually)',
    deadline: '31 October (via National Scholarship Portal)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'aicte-saksham-scholarship-2026',
    title: 'AICTE Saksham Scholarship Scheme for Specially-Abled Students',
    provider: 'AICTE (Ministry of Education, Govt. of India)',
    category: 'Government Scheme',
    target: 'Specially-Abled Students in Technical Diploma/Degree Courses',
    eligibility: 'Min 40% disability, admitted to 1st year (or 2nd year via lateral entry) of AICTE-approved technical degree/diploma, annual family income ≤ ₹8,00,000',
    amount: '₹50,000/year (approx. 500 scholarships each for degree & diploma annually)',
    deadline: '31 October (via National Scholarship Portal)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'aicte-swanath-scholarship-2026',
    title: 'AICTE Swanath Scholarship Scheme',
    provider: 'AICTE (Ministry of Education, Govt. of India)',
    category: 'Government Scheme',
    target: 'Orphan/Specially Distressed Students in Technical Courses',
    eligibility: 'Orphan students or those who lost one/both parents, admitted to AICTE-approved degree/diploma course, income criteria as per AICTE notification',
    amount: '₹50,000/year (up to 4 years for degree, 3 years for diploma)',
    deadline: '31 October (via National Scholarship Portal)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'tata-capital-pankh-2026',
    title: 'Tata Capital Pankh Scholarship Programme',
    provider: 'Tata Capital Limited (CSR)',
    category: 'Corporate CSR',
    target: 'Class 11–12, UG, Diploma & ITI Students',
    eligibility: 'Min 60% marks in preceding class/semester, annual parental income ≤ ₹4 Lakhs, preference to girls/PwD/single-parent/orphan students',
    amount: 'Up to 80% of course fees (₹10,000–₹1,00,000 depending on level & marks)',
    deadline: 'Check Official Portal (typically Sep–Oct)',
    apply_link: 'https://www.buddy4study.com/tata-capital-pankh-scholarship-programme',
  },
  {
    id: 'ffe-technical-scholarship-2026',
    title: 'Foundation For Excellence (FFE) Scholarship for Technical Courses',
    provider: 'Foundation For Excellence (FFE)',
    category: 'Corporate CSR',
    target: 'First-Year B.E./B.Tech, Integrated M.Tech, MBBS & 5-Year LLB Students',
    eligibility: 'Min 70% marks in Class 12, admission via state/national entrance exam merit, annual family income ≤ ₹3,00,000, verified by FFE facilitator',
    amount: '₹50,000/year for full course duration (4/5 years) + mentorship & skilling programs',
    deadline: 'Check Official Portal (typically Aug–Jan, varies by cycle)',
    apply_link: 'https://ffe.org/scholarships',
  },
  {
    id: 'central-sector-scheme-ug-pg-2026',
    title: 'Central Sector Scheme of Scholarship for College and University Students (CSSS)',
    provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
    category: 'Government Scheme',
    target: 'UG & PG Students (All Streams incl. Engineering, Medical, Arts, Commerce)',
    eligibility: 'Top 20th percentile in Class 12 boards, min 80% marks, enrolled full-time regular UG/PG course, annual family income ≤ ₹4.5 Lakhs',
    amount: '₹12,000/year (Graduation, first 3 years); ₹20,000/year (PG/4th & 5th year professional courses)',
    deadline: 'Check Official Portal (via NSP, typically Oct–Nov)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'nsp-post-matric-sc-2026',
    title: 'Post Matric Scholarship for SC Students',
    provider: 'Ministry of Social Justice and Empowerment, Govt. of India',
    category: 'Government Scheme',
    target: 'SC Students in Class 11 onwards, Diploma, UG & PG',
    eligibility: 'Belongs to Scheduled Caste, studying post-matriculation/post-secondary stage, annual family income ≤ ₹2.5 Lakhs',
    amount: 'Maintenance allowance + full tuition fee/non-refundable fee reimbursement',
    deadline: 'Check Official Portal (via NSP, typically Oct–Nov)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'nsp-post-matric-obc-2026',
    title: 'Post Matric Scholarship for OBC Students',
    provider: 'Ministry of Social Justice and Empowerment, Govt. of India',
    category: 'Government Scheme',
    target: 'OBC Students in Class 11 onwards, Diploma, UG & PG',
    eligibility: 'Belongs to Other Backward Classes (Non-Creamy Layer), studying post-matriculation stage, annual family income ≤ ₹1.5 Lakhs',
    amount: 'Maintenance allowance + tuition fee reimbursement (varies by course)',
    deadline: 'Check Official Portal (via NSP, typically Oct–Nov)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'nsp-post-matric-minority-2026',
    title: 'Post Matric Scholarship for Minority Students',
    provider: 'Ministry of Minority Affairs, Govt. of India',
    category: 'Government Scheme',
    target: 'Muslim, Christian, Sikh, Buddhist, Parsi & Jain Students (Class 11 onwards, UG & PG)',
    eligibility: 'Belongs to notified minority community, min 50% marks in previous exam, annual family income ≤ ₹2 Lakhs',
    amount: 'Maintenance allowance (₹380–₹1,200/month) + course/admission fee reimbursement',
    deadline: 'Check Official Portal (via NSP, typically Oct–Nov)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'begum-hazrat-mahal-2026',
    title: 'Begum Hazrat Mahal National Scholarship',
    provider: 'Maulana Azad Education Foundation, Ministry of Minority Affairs',
    category: 'Government Scheme',
    target: 'Meritorious Minority Community Girl Students (Class 9–12)',
    eligibility: 'Girl student from notified minority community, min 50% marks in previous exam, annual family income ≤ ₹2 Lakhs',
    amount: '₹5,000–₹12,000/year depending on class',
    deadline: 'Check Official Portal (typically Aug–Oct)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'pm-yasasvi-scholarship-2026',
    title: 'PM YASASVI Scholarship (Young Achievers Scholarship Award Scheme for Vibrant India)',
    provider: 'Ministry of Social Justice and Empowerment, Govt. of India',
    category: 'Government Scheme',
    target: 'OBC, EBC & DNT Students (Class 9–12)',
    eligibility: 'Belongs to OBC/EBC/DNT category, qualifies YASASVI Entrance Test (YET), annual family income ≤ ₹2.5 Lakhs',
    amount: '₹75,000–₹1,25,000/year (Class 9-10: ₹75,000; Class 11-12: ₹1,25,000)',
    deadline: 'Check Official Portal (via NSP, typically Aug–Sep)',
    apply_link: 'https://yet.nta.ac.in',
  },
  {
    id: 'nmms-scholarship-2026',
    title: 'National Means-cum-Merit Scholarship Scheme (NMMS)',
    provider: 'Department of School Education & Literacy, Ministry of Education, Govt. of India',
    category: 'Government Scheme',
    target: 'Government/Govt-aided School Students (Class 9–12)',
    eligibility: 'Min 55% marks in Class 7 & 8, qualify state-level NMMS exam, annual family income ≤ ₹3,50,000',
    amount: '₹12,000/year (₹1,000/month), Class 9 to 12 (1,00,000 scholarships annually)',
    deadline: 'Check Official Portal (state-wise exam, typically Nov–Dec)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'inspire-she-scholarship-2026',
    title: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science and Technology, Govt. of India',
    category: 'Government Scheme',
    target: 'UG/Integrated MSc Students in Natural & Basic Sciences',
    eligibility: 'Top 1% in Class 12 board exams or top rank holders in JEE Advanced/NEET, pursuing full-time BSc/Integrated MSc',
    amount: '₹80,000/year (₹60,000 scholarship + ₹20,000 mentorship grant to host institution)',
    deadline: 'Check Official Portal (typically renews annually)',
    apply_link: 'https://online-inspire.gov.in',
  },
  {
    id: 'sitaram-jindal-foundation-2026',
    title: 'Sitaram Jindal Foundation Scholarship',
    provider: 'Sitaram Jindal Foundation',
    category: 'Corporate CSR',
    target: 'Class 11–12, ITI, Diploma, UG & PG Students',
    eligibility: 'Min marks vary by category (60–75%), annual family income ≤ ₹4 Lakhs (salaried) or ≤ ₹2.5 Lakhs (others)',
    amount: '₹6,000–₹38,400/year (₹500–₹3,200/month, disbursed monthly)',
    deadline: 'Check Official Portal (typically Mar–Sep, rolling cycles)',
    apply_link: 'https://sitaramjindalfoundation.org',
  },
  {
    id: 'aditya-birla-scholars-2026',
    title: 'Aditya Birla Scholars Programme',
    provider: 'Aditya Birla Group',
    category: 'Corporate CSR',
    target: 'Students at Premier Institutes (Engineering, MBA, Law)',
    eligibility: 'Enrolled at select premier institutions (IITs, IIMs, NLUs and other partner institutes), top academic performers',
    amount: 'Up to ₹3,00,000/year + leadership mentorship',
    deadline: 'Check Official Portal (typically Aug–Sep)',
    apply_link: 'https://www.adityabirlascholars.net',
  },
  {
    id: 'ongc-scholarship-2026',
    title: 'ONGC Scholarship Scheme for SC/ST/OBC/General Students',
    provider: 'ONGC Foundation (Oil and Natural Gas Corporation Ltd. CSR)',
    category: 'Corporate CSR',
    target: 'First-Year Engineering, MBBS, MBA & Geology/Geophysics Students',
    eligibility: 'Min 60% marks in Class 12, family income ≤ ₹2 Lakhs (General/OBC) or ≤ ₹4.5 Lakhs (SC/ST), 50% reserved for girls',
    amount: '₹48,000/year (₹4,000/month); 2,000 scholarships annually',
    deadline: 'Check Official Portal (typically Apr–May)',
    apply_link: 'https://ongcscholar.org',
  },
  {
    id: 'lic-golden-jubilee-2026',
    title: 'LIC Golden Jubilee Scholarship',
    provider: 'LIC Golden Jubilee Foundation',
    category: 'Corporate CSR',
    target: 'Class 10/12 Pass Students (Medicine, Engineering, Graduation, Diploma, ITI)',
    eligibility: 'Min 60% marks in Class 10 or 12, first-year admission, annual family income ≤ ₹4,50,000',
    amount: '₹15,000–₹50,000/year (Medicine: ₹50,000; Engineering: ₹40,000; Graduation/Diploma/ITI: ₹20,000)',
    deadline: '30 September (tentative, recurring annually)',
    apply_link: 'https://licindia.in/golden-jubilee-foundation',
  },
  {
    id: 'kotak-kanya-scholarship-2026',
    title: 'Kotak Kanya Scholarship Programme',
    provider: 'Kotak Mahindra Bank (CSR)',
    category: 'Corporate CSR',
    target: 'Girl Students Pursuing Professional UG/Diploma Courses',
    eligibility: 'Meritorious girl students from economically weaker sections, admitted to recognised professional UG programme, min 85% in Class 12, income ≤ ₹6 Lakhs',
    amount: 'Up to ₹1,50,000/year for full course duration',
    deadline: 'Check Official Portal (typically Sep–Nov)',
    apply_link: 'https://www.buddy4study.com/kotak-kanya-scholarship-programme',
  },
  {
    id: 'colgate-keep-india-smiling-2026',
    title: 'Colgate Keep India Smiling Scholarship',
    provider: 'Colgate-Palmolive (India) Limited (CSR)',
    category: 'Corporate CSR',
    target: 'UG & PG Students (All Streams)',
    eligibility: 'Enrolled in a recognized UG/PG course, merit-cum-means based selection, economically weaker background preferred',
    amount: 'Financial assistance for tuition and educational expenses (varies by cycle)',
    deadline: 'Check Official Portal (typically opens mid-year)',
    apply_link: 'https://www.buddy4study.com/colgate-keep-india-smiling-scholarship',
  },
  {
    id: 'sun-pharma-ambar-scholarship-2026',
    title: 'Sun Pharma Ambar Scholarship',
    provider: 'Sun Pharmaceutical Industries (CSR)',
    category: 'Corporate CSR',
    target: 'Meritorious Students from Economically Weaker Sections (School to UG)',
    eligibility: 'Merit-cum-means based, economically disadvantaged background, criteria set annually by Sun Pharma CSR team',
    amount: 'Financial assistance for educational expenses (varies by cycle)',
    deadline: 'Check Official Portal',
    apply_link: 'https://www.buddy4study.com/sun-pharma-ambar-scholarship',
  },
  {
    id: 'nsp-central-sector-she-inspire-2026',
    title: 'National Scholarship Portal (NSP) - Unified Application Gateway',
    provider: 'Ministry of Education, Government of India',
    category: 'Govt Portal',
    target: 'All Students Applying to Central/State Government Scholarships',
    eligibility: 'Varies by individual scheme hosted on the portal (Pre-Matric, Post-Matric, Merit-cum-Means, Central Sector Scheme, AICTE schemes)',
    amount: 'Varies by scheme (₹1,000 to ₹2,00,000+ per year)',
    deadline: 'Varies by scheme (portal typically active Jul–Nov)',
    apply_link: 'https://scholarships.gov.in',
  },
  {
    id: 'fair-and-lovely-loreal-women-science-2026',
    title: "L'Oréal India For Young Women in Science Scholarship",
    provider: "L'Oréal India (in association with UNESCO & Govt. of India)",
    category: 'Corporate CSR',
    target: 'Female Students Pursuing UG/PG in Science Streams',
    eligibility: 'Girl students enrolled in a recognized science degree programme, merit-cum-means based selection',
    amount: 'Financial assistance for science education (varies by cycle)',
    deadline: 'Check Official Portal',
    apply_link: 'https://www.forwomeninscience.com',
  },
  {
    id: 'google-generation-scholarship-2026',
    title: 'Generation Google Scholarship (India)',
    provider: 'Google',
    category: 'Corporate CSR',
    target: 'Underrepresented Students Pursuing Computer Science Degrees',
    eligibility: 'Enrolled in or admitted to an undergraduate/graduate CS-related degree program, demonstrated leadership and passion for technology',
    amount: 'Scholarship amount varies by region/cycle ($1,000–$2,500 equivalent)',
    deadline: 'Check Official Portal (typically opens annually)',
    apply_link: 'https://buildyourfuture.withgoogle.com/scholarships',
  },
  {
    id: 'swami-vivekananda-merit-cum-means-2026',
    title: 'Swami Vivekananda Merit-cum-Means Scholarship',
    provider: 'State Governments (e.g. West Bengal Dept. of Higher Education)',
    category: 'Government Scheme',
    target: 'UG, PG, Diploma, ITI, Professional & Technical Course Students',
    eligibility: 'Min 60% marks, enrolled in a recognized institution within the state, annual family income ≤ ₹2.5 Lakhs',
    amount: '₹1,000–₹5,000/month depending on course level',
    deadline: 'Check Official State Portal',
    apply_link: 'https://svmcm.wbhed.gov.in',
  },
];

type FastFilter = 'all' | 'engineering' | 'corporate' | 'govt' | 'girls';

export const ScholarshipsHub: React.FC = () => {
  const [scholarships, setScholarships] = useState<IndianScholarship[]>(INITIAL_SCHOLARSHIPS);
  const [selectedScholarship, setSelectedScholarship] = useState<IndianScholarship | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FastFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [dataSource, setDataSource] = useState<'live' | 'bundle'>('bundle');

  // Load scholarships directly from /indian_scholarships.json
  useEffect(() => {
    let isMounted = true;
    async function loadScholarshipsData() {
      try {
        setIsLoading(true);
        const res = await fetch('/indian_scholarships.json');
        if (!res.ok) {
          throw new Error(`Failed to fetch /indian_scholarships.json: status ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setScholarships(data);
          setDataSource('live');
        }
      } catch (err) {
        console.warn('Could not load /indian_scholarships.json via fetch, using initial dataset:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadScholarshipsData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Top flagship opportunities for showcase carousel
  const flagshipScholarships = useMemo(() => {
    const flagshipIds = [
      'reliance-foundation-ug-2026',
      'hdfc-parivartan-ecss-2026',
      'lic-golden-jubilee-2026',
      'kotak-kanya-scholarship-2026',
      'amazon-future-engineer-2026',
      'aicte-pragati-scholarship-2026',
      'sbi-asha-scholarship-2026',
    ];
    const found = scholarships.filter((s) => flagshipIds.includes(s.id));
    return found.length > 0 ? found : scholarships.slice(0, 5);
  }, [scholarships]);

  const currentFlagship = flagshipScholarships[carouselIndex] || flagshipScholarships[0];

  const handleNextFlagship = () => {
    setCarouselIndex((prev) => (prev + 1) % flagshipScholarships.length);
  };

  const handlePrevFlagship = () => {
    setCarouselIndex((prev) => (prev - 1 + flagshipScholarships.length) % flagshipScholarships.length);
  };

  // Filter & Search Logic
  const filteredScholarships = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return scholarships.filter((s) => {
      // 1. Category Filter Matching
      let matchFilter = true;
      if (activeFilter === 'engineering') {
        const text = (s.title + ' ' + s.target + ' ' + s.eligibility + ' ' + s.category).toLowerCase();
        matchFilter =
          text.includes('engineer') ||
          text.includes('b.tech') ||
          text.includes('b.e.') ||
          text.includes('technical') ||
          text.includes('polytechnic') ||
          text.includes('diploma') ||
          text.includes('cse') ||
          s.id.includes('aicte') ||
          s.id.includes('ffe');
      } else if (activeFilter === 'corporate') {
        matchFilter =
          s.category.toLowerCase().includes('corporate') ||
          s.category.toLowerCase().includes('csr');
      } else if (activeFilter === 'govt') {
        matchFilter =
          s.category.toLowerCase().includes('government') ||
          s.category.toLowerCase().includes('govt') ||
          s.category.toLowerCase().includes('scheme') ||
          s.category.toLowerCase().includes('portal');
      } else if (activeFilter === 'girls') {
        matchFilter = isExclusivelyForGirls(s) || (s.title + ' ' + s.target).toLowerCase().includes('girls') || s.eligibility.toLowerCase().includes('reservation for female');
      }

      // 2. Search Query Matching across all fields
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.target.toLowerCase().includes(q) ||
        s.eligibility.toLowerCase().includes(q) ||
        s.amount.toLowerCase().includes(q) ||
        s.deadline.toLowerCase().includes(q);

      return matchFilter && matchQuery;
    });
  }, [scholarships, searchQuery, activeFilter]);

  const handleShareToWhatsApp = (scholarship: IndianScholarship) => {
    const text = `🎓 *${scholarship.title}*\n🏛️ *Provider:* ${scholarship.provider}\n💰 *Benefit:* ${scholarship.amount}\n🎯 *Target:* ${scholarship.target}\n📋 *Eligibility:* ${scholarship.eligibility}\n📅 *Deadline:* ${scholarship.deadline}\n\n🔗 *Direct Apply Official Link:*\n${scholarship.apply_link}\n\n✨ Verified on StudyMacha Scholarships Radar: ${window.location.origin}/#scholarships`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Category filter tabs with live item count
  const filterButtons: Array<{ id: FastFilter; label: string; count: number }> = [
    { id: 'all', label: 'All Scholarships', count: scholarships.length },
    {
      id: 'engineering',
      label: 'Engineering & Tech',
      count: scholarships.filter((s) => {
        const text = (s.title + ' ' + s.target + ' ' + s.eligibility + ' ' + s.category).toLowerCase();
        return (
          text.includes('engineer') ||
          text.includes('b.tech') ||
          text.includes('b.e.') ||
          text.includes('technical') ||
          text.includes('polytechnic') ||
          text.includes('diploma') ||
          text.includes('cse') ||
          s.id.includes('aicte') ||
          s.id.includes('ffe')
        );
      }).length,
    },
    {
      id: 'corporate',
      label: 'Corporate CSR',
      count: scholarships.filter(
        (s) => s.category.toLowerCase().includes('corporate') || s.category.toLowerCase().includes('csr')
      ).length,
    },
    {
      id: 'govt',
      label: 'Govt & Merit Schemes',
      count: scholarships.filter(
        (s) =>
          s.category.toLowerCase().includes('government') ||
          s.category.toLowerCase().includes('govt') ||
          s.category.toLowerCase().includes('scheme') ||
          s.category.toLowerCase().includes('portal')
      ).length,
    },
    {
      id: 'girls',
      label: 'Girl Students & STEM',
      count: scholarships.filter(
        (s) => isExclusivelyForGirls(s) || (s.title + ' ' + s.target).toLowerCase().includes('girls') || s.eligibility.toLowerCase().includes('reservation for female')
      ).length,
    },
  ];

  const faqs = [
    {
      question: 'Can I apply for multiple scholarships simultaneously?',
      answer:
        'Yes! You can apply for both a Government scholarship (like NSP or State Post-Matric) and a Corporate CSR scholarship (like Reliance Foundation, HDFC Parivartan, or SBI Asha), unless an individual scheme explicitly forbids dual benefits (e.g., ONGC states applicants should not be receiving another parallel scholarship). Always check individual scheme terms.',
    },
    {
      question: 'What is Aadhaar DBT linking and why is it mandatory?',
      answer:
        'Direct Benefit Transfer (DBT) disburses scholarship funds directly to your bank account linked to your Aadhaar through the NPCI mapper. Ensure your savings account is KYC-updated and seeded for Aadhaar DBT at your bank branch; otherwise, NSP and central government disbursements cannot be credited.',
    },
    {
      question: 'How are Corporate CSR scholarships different from Government schemes?',
      answer:
        'Corporate CSR scholarships (funded by companies such as Reliance, Tata, HDFC, Amazon, SBI, and Kotak) often provide higher financial grants, laptops, or corporate mentorships based on merit and aptitude tests. Government schemes (NSP, AICTE Pragati, CSSS) strictly adhere to statutory income caps and state/board percentile rankings.',
    },
    {
      question: 'What if my annual family income exceeds ₹2.5 Lakhs?',
      answer:
        'Several major scholarships offer higher income limits: AICTE Pragati & Saksham accept family incomes up to ₹8,00,000/year; Reliance Foundation allows up to ₹15,00,000/year; SBI Asha allows up to ₹6,00,000 for college students; and Tata Capital Pankh allows up to ₹4,00,000/year.',
    },
    {
      question: 'Do I ever need to pay an application fee to apply?',
      answer:
        'NEVER! Legitimate government schemes on scholarships.gov.in and corporate CSR scholarships are 100% free of cost. Never pay any third-party agent, cyber cafe, or broker demanding processing fees, registration charges, or stamp fees.',
    },
  ];

  return (
    <div id="scholarships-radar-root" className="space-y-6">
      {/* Top Header Banner for Scholarships Radar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              LIVE VERIFIED DATASET
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Direct from <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">/indian_scholarships.json</code>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Scholarships Radar &amp; Opportunity Finder
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Explore verified 2026 national, state, AICTE, and corporate CSR scholarships for engineering, diploma, and degree students. Every listing links directly to the official government or corporate portal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Schemes
            </span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {scholarships.length} Active
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
              Max Grant
            </span>
            <span className="text-lg font-black text-emerald-800 font-mono">
              ₹2–15 Lakhs
            </span>
          </div>
        </div>
      </div>

      {/* 1. Flagship Scholarship Showcase Carousel */}
      {currentFlagship && (
        <div className="relative overflow-hidden rounded-2xl bg-white text-slate-900 border border-slate-200/90 shadow-sm p-5 sm:p-7">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Flagship Opportunity #{carouselIndex + 1} of {flagshipScholarships.length}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {currentFlagship.category}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {currentFlagship.title}
                </h2>
                <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Provided by {currentFlagship.provider}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {currentFlagship.eligibility}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>{currentFlagship.amount}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentFlagship.deadline}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons & Carousel Navigation */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <a
                href={currentFlagship.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Navigation Arrows & Indicators */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-1">
                <div className="flex items-center gap-1">
                  {flagshipScholarships.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        carouselIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={handlePrevFlagship}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Previous Scholarship"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextFlagship}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Next Scholarship"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Search Bar & Category Filter Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Working Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships by name, provider, engineering, girls, income limit, ₹ amount..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap self-end md:self-center">
            Showing <strong className="text-slate-900">{filteredScholarships.length}</strong> of{' '}
            {scholarships.length} Opportunities
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === btn.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{btn.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeFilter === btn.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {btn.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Scholarship Card Grid (Responsive 3-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredScholarships.map((scholarship) => {
          const isExclusiveGirls = isExclusivelyForGirls(scholarship);
          const genderTag = isExclusiveGirls ? 'Girl Students Only' : 'All Genders (Boys & Girls)';

          const isGovt =
            scholarship.category.toLowerCase().includes('government') ||
            scholarship.category.toLowerCase().includes('portal') ||
            scholarship.category.toLowerCase().includes('scheme');

          return (
            <div
              key={scholarship.id}
              onClick={() => setSelectedScholarship(scholarship)}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              {/* Card Top: Provider Icon, Category Badge & Target */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200 transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block truncate max-w-[170px]">
                        {scholarship.provider}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                          isGovt
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {scholarship.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isExclusiveGirls
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {genderTag}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 text-right max-w-[120px] truncate">
                      {scholarship.target.split('(')[0].trim()}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug line-clamp-2">
                    {scholarship.title}
                  </h3>
                </div>

                {/* Reward / Benefit Amount Badge */}
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Reward / Benefit
                    </span>
                    <span className="text-xs font-bold text-emerald-950 block truncate">
                      {scholarship.amount}
                    </span>
                  </div>
                </div>

                {/* Clean 2-Line Summary (No arbitrary ... truncation) */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      Eligibility Summary
                    </span>
                    <span className="text-[10px] text-sky-600 font-bold group-hover:underline flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      Details
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 font-normal">
                    {getScholarshipSummary(scholarship)}
                  </p>
                </div>

                {/* Deadline Info */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] truncate">
                    <strong>Deadline:</strong> {scholarship.deadline}
                  </span>
                </div>
              </div>

              {/* Card Footer: Action Buttons with prominent "Apply Now" and "View Details" buttons */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScholarship(scholarship);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Details</span>
                  </button>

                  <a
                    href={scholarship.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer group/btn shadow-xs"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareToWhatsApp(scholarship);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-medium text-emerald-800 transition-colors cursor-pointer"
                    title="Share details via WhatsApp"
                  >
                    <Share2 className="w-3 h-3 text-emerald-600" />
                    <span>Share WhatsApp</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(scholarship.id, scholarship.apply_link);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
                    title="Copy official portal URL"
                  >
                    {copiedId === scholarship.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search / Filter State */}
      {filteredScholarships.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No scholarships matching your query</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try searching for terms like "Reliance", "AICTE", "Girls", "Engineering", or reset your category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* 4. "Application Tips" Infobox Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-slate-800 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Essential Scholarship Application Tips for Indian Students
            </h3>
            <p className="text-xs text-slate-400">
              Follow these verified steps to maximize your chances of getting approved.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-xs font-bold text-white">Apply Early</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Official portals like NSP and Reliance Foundation experience severe server slowdowns in the final 48 hours. Submit at least 7 days before the closing date.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-white">Keep Documents Ready</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Keep digital copies under 200KB: MeeSeva Income Certificate, 10th/12th Marksheet, College Bonafide/Fee Receipt, and Passbook.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-xs font-bold text-white">Never Pay to Apply</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All official government schemes and legitimate corporate CSR scholarships are <strong>100% free</strong>. Beware of fake third-party agents asking for fee money.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h4 className="text-xs font-bold text-white">Ensure Aadhaar DBT Link</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Government scholarship grants are disbursed exclusively via Aadhaar-seeded bank accounts (DBT). Confirm with your bank branch that your account is mapped.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Scholarship FAQs Accordion */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions on Indian Scholarships
          </h3>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Details Modal */}
      {selectedScholarship && (
        <ScholarshipDetailsModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}
    </div>
  );
};

// Also export as ScholarshipsRadar for consistent terminology
export const ScholarshipsRadar = ScholarshipsHub;
