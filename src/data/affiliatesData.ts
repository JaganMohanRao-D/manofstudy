export interface AffiliateProduct {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  tag: string;
  url: string;
  type: 'Calculator' | 'Laptop' | 'Book' | 'Smartphone' | 'Audio' | 'Headphones' | 'Mouse' | 'Keyboard' | string;
  imageUrl: string;
}

export const affiliateCatalog: AffiliateProduct[] = [
  // CATEGORY 1: Engineering & Coding Essentials
  {
    id: "calc-1",
    category: "Engineering Tools",
    title: "Casio fx-991CW ClassWiz Scientific Calculator",
    subtitle: "Essential non-programmable calculator for JNTU & Autonomous engineering exams.",
    tag: "Mandatory Tool",
    url: "https://link.amazon/B0cSKT99f",
    type: "Calculator",
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "lap-1",
    category: "Coding Laptops",
    title: "Performance Coding Laptop (Intel Core i5 / 16GB)",
    subtitle: "Optimized for programming, web dev, simulators, and multitasking.",
    tag: "Top Pick for CSE",
    url: "https://link.amazon/B04NKMAbU",
    type: "Laptop",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "lap-2",
    category: "Coding Laptops",
    title: "Sleek Student Thin & Light Laptop",
    subtitle: "High battery endurance, crisp display for long study & coding sessions.",
    tag: "Best Value",
    url: "https://link.amazon/B09RDVJQV",
    type: "Laptop",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "lap-3",
    category: "Coding Laptops",
    title: "Heavy Compute & Developer Workstation Laptop",
    subtitle: "High-tier CPU for machine learning tasks, compilation & heavy builds.",
    tag: "Pro Performance",
    url: "https://link.amazon/B0gHwJgxx",
    type: "Laptop",
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "lap-4",
    category: "Coding Laptops",
    title: "Balanced Budget Student Laptop",
    subtitle: "Reliable engineering companion for coursework and online lectures.",
    tag: "Budget Friendly",
    url: "https://link.amazon/B07isDH4Y",
    type: "Laptop",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"
  },

  // CATEGORY 2: Entrance Exam & Competitive Prep (EAPCET / NEET)
  {
    id: "prep-1",
    category: "Entrance Exam Prep",
    title: "AP EAPCET 2026 Chapter-wise Previous Year Questions (PYQs)",
    subtitle: "Comprehensive solved question bank with detailed explanations.",
    tag: "EAPCET 2026",
    url: "https://link.amazon/B08R4Y46w",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "prep-2",
    category: "Entrance Exam Prep",
    title: "AP EAPCET Solved Papers & Practice Sets",
    subtitle: "Mock tests mapped strictly to the latest EAPCET examination blueprint.",
    tag: "Practice Sets",
    url: "https://link.amazon/B01Vbw6Be",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "prep-3",
    category: "Entrance Exam Prep",
    title: "EAPCET 2027 All-in-One Shortcut & Formula Handbook",
    subtitle: "Quick revision mind maps, high-yield shortcuts for fast solving.",
    tag: "Formula Vault",
    url: "https://link.amazon/B0fXDe0S1",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "prep-4",
    category: "Entrance Exam Prep",
    title: "MTG NCERT at your FINGERTIPS + 39 Years NEET PYQ Combo (6 Books)",
    subtitle: "Physics, Chemistry & Biology with video solutions & digital prep access.",
    tag: "NEET 2027 Complete Set",
    url: "https://link.amazon/B03hxBWLq",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "prep-5",
    category: "Entrance Exam Prep",
    title: "Disha Errorless 39 Years NEET Solved Papers (3 Books)",
    subtitle: "Chapter-wise & topic-wise coverage including retest papers.",
    tag: "NEET Master Edition",
    url: "https://link.amazon/A0e0u58aX",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
  },

  // CATEGORY 3: Student Growth, Mindset & Philosophy
  {
    id: "book-1",
    category: "Growth & Books",
    title: "Philosophy & Mental Resilience Masterworks",
    subtitle: "Cultivate mental clarity, emotional poise, and deep thinking habits.",
    tag: "Life Philosophy",
    url: "https://link.amazon/B09vsbPxv",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "book-2",
    category: "Growth & Books",
    title: "Classic Philosophical Reflections on Purpose & Focus",
    subtitle: "Timeless insights on discipline, logic, and self-mastery.",
    tag: "Critical Thinking",
    url: "https://link.amazon/B05PXuFsM",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "book-3",
    category: "Growth & Books",
    title: "Stoic Wisdom & Modern Mindset Essentials",
    subtitle: "Practical stoic philosophy adapted for academic stress and focus.",
    tag: "Stoic Principles",
    url: "https://link.amazon/B0bIIdNz1",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "book-4",
    category: "Growth & Books",
    title: "Mastering Professional Communication & Personality Development",
    subtitle: "Essential guide to campus interviews, group discussions & fluent English.",
    tag: "Placement Prep",
    url: "https://link.amazon/B03pXrw61",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1554415707-9e4966a604f7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "book-5",
    category: "Growth & Books",
    title: "Impactful Speaking, Social Confidence & Soft Skills",
    subtitle: "Techniques for presentations, viva-voce, and workplace leadership.",
    tag: "Career Skills",
    url: "https://link.amazon/B0gxF9sgH",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "book-6",
    category: "Growth & Books",
    title: "Rich Dad Poor Dad — Robert Kiyosaki",
    subtitle: "Foundational financial literacy and wealth mindset for young scholars.",
    tag: "Financial Wisdom",
    url: "https://link.amazon/B0hTYwb5q",
    type: "Book",
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80"
  },

  // CATEGORY 4: Tech & Hardware Gear (Mobiles, Audio & Peripherals)
  {
    id: "phone-1",
    category: "Smartphones & Audio",
    title: "High-Battery Student Smartphone with 5G",
    subtitle: "Optimal for online lectures, study apps, and long screen-on time.",
    tag: "5G Smartphone",
    url: "https://link.amazon/B0aR5yumf",
    type: "Smartphone",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "phone-2",
    category: "Smartphones & Audio",
    title: "Balanced Daily Driver Student Phone",
    subtitle: "Smooth display and reliable performance for everyday college use.",
    tag: "All-Rounder",
    url: "https://link.amazon/B0cp1LRdR",
    type: "Smartphone",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "phone-3",
    category: "Smartphones & Audio",
    title: "Performance Focus Smartphone",
    subtitle: "Fast app switching and rapid fast-charging support.",
    tag: "Performance Pick",
    url: "https://link.amazon/B0fcwoxXY",
    type: "Smartphone",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "phone-4",
    category: "Smartphones & Audio",
    title: "Crisp Display Multi-Tasking Phone",
    subtitle: "Clear reading mode and eye protection for reading PDFs & ebooks.",
    tag: "Reading Friendly",
    url: "https://link.amazon/B0aIzQTkb",
    type: "Smartphone",
    imageUrl: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "audio-1",
    category: "Smartphones & Audio",
    title: "Active Noise Cancelling TWS Earbuds",
    subtitle: "Block library and hostel noise for uninterrupted deep study sessions.",
    tag: "Deep Focus Audio",
    url: "https://link.amazon/B02Hs2clt",
    type: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "audio-2",
    category: "Smartphones & Audio",
    title: "Ergonomic Long-Battery TWS Earbuds",
    subtitle: "Comfortable in-ear fit for attending long marathon webinars and classes.",
    tag: "Marathon Battery",
    url: "https://link.amazon/B062xt1eI",
    type: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "audio-3",
    category: "Smartphones & Audio",
    title: "Crystal Voice Study Earbuds with Low Latency",
    subtitle: "Clean mic pickup for online viva, college meetings & calls.",
    tag: "Clear Mic",
    url: "https://link.amazon/B002U27nW",
    type: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "audio-4",
    category: "Smartphones & Audio",
    title: "Compact Pocket Earbuds",
    subtitle: "Lightweight charging case and instant pairing for campus daily commutes.",
    tag: "Campus Carry",
    url: "https://link.amazon/B03LrSbYw",
    type: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "audio-5",
    category: "Smartphones & Audio",
    title: "Deep Bass Balanced Wireless Earbuds",
    subtitle: "Rich audio profile for lectures, coding soundtracks, and music.",
    tag: "Bass Edition",
    url: "https://link.amazon/B05byOQ4V",
    type: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "headphone-1",
    category: "Smartphones & Audio",
    title: "Over-Ear ANC Study Headphones",
    subtitle: "Cushioned earcups and total sound isolation for intense study focus.",
    tag: "Studio Comfort",
    url: "https://link.amazon/B04O5CPVj",
    type: "Headphones",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "headphone-2",
    category: "Smartphones & Audio",
    title: "Foldable Lightweight Wireless Headphones",
    subtitle: "Space-saving backpack design with ultra-fast charging.",
    tag: "Travel Friendly",
    url: "https://link.amazon/A03sS5gxy",
    type: "Headphones",
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "headphone-3",
    category: "Smartphones & Audio",
    title: "Hi-Res Audio Wireless Headset",
    subtitle: "Precision clarity for language labs, audiobooks & coding focus.",
    tag: "Hi-Res Audio",
    url: "https://link.amazon/B0i1uraL0",
    type: "Headphones",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "headphone-4",
    category: "Smartphones & Audio",
    title: "Pro Hybrid Noise Cancelling Headband",
    subtitle: "Multi-point connection to seamlessly switch between laptop and phone.",
    tag: "Dual Pairing",
    url: "https://link.amazon/B05OnzX3G",
    type: "Headphones",
    imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=800&q=80"
  },

  // CATEGORY 5: Keyboards & Ergonomic Mice
  {
    id: "peri-1",
    category: "Keyboards & Mice",
    title: "Ergonomic Wireless Silent Mouse",
    subtitle: "Whisper-quiet clicks suited for quiet libraries and exam halls.",
    tag: "Library Silent",
    url: "https://link.amazon/B0hSjjZKl",
    type: "Mouse",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-2",
    category: "Keyboards & Mice",
    title: "Multi-Device Bluetooth & 2.4GHz Mouse",
    subtitle: "Instant toggling across dual laptops or tablet setups.",
    tag: "Multi-Device",
    url: "https://link.amazon/B074t1TpC",
    type: "Mouse",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-3",
    category: "Keyboards & Mice",
    title: "Precision Ergonomic Coding Mouse",
    subtitle: "Comfortable thumb grip reducing wrist strain during long coding hours.",
    tag: "Ergonomic Grip",
    url: "https://link.amazon/B0hEsqrgq",
    type: "Mouse",
    imageUrl: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-4",
    category: "Keyboards & Mice",
    title: "Compact Travel Mouse",
    subtitle: "Ultra-slim profile fitting easily in laptop sleeves.",
    tag: "Pocket Sized",
    url: "https://link.amazon/B0aUZgkHq",
    type: "Mouse",
    imageUrl: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-5",
    category: "Keyboards & Mice",
    title: "High-DPI Fast Response Mouse",
    subtitle: "Precise sensor tracking across all desk surfaces without mousepads.",
    tag: "Smooth Tracking",
    url: "https://link.amazon/B08D5qWMP",
    type: "Mouse",
    imageUrl: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-6",
    category: "Keyboards & Mice",
    title: "Minimalist Wireless Keyboard & Mouse Combo",
    subtitle: "Single dongle clean desk setup for hostel study tables.",
    tag: "Clean Desk Combo",
    url: "https://link.amazon/B05gqPIJX",
    type: "Keyboard",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-7",
    category: "Keyboards & Mice",
    title: "Mechanical Feel Developer Keyboard",
    subtitle: "Satisfying tactile keystrokes for typing code and assignments.",
    tag: "Typing Comfort",
    url: "https://link.amazon/B0fLlxd1J",
    type: "Keyboard",
    imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-8",
    category: "Keyboards & Mice",
    title: "Multi-OS Bluetooth Compact Keyboard",
    subtitle: "Seamless compatibility with Windows, Android, Mac, and iPad.",
    tag: "Universal Sync",
    url: "https://link.amazon/B0dbgQQJW",
    type: "Keyboard",
    imageUrl: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-9",
    category: "Keyboards & Mice",
    title: "Backlit Full-Size Ergonomic Keyboard",
    subtitle: "Illuminated keys for late-night hostel project work without turning on room lights.",
    tag: "Backlit Night Mode",
    url: "https://link.amazon/B0bNZUAPD",
    type: "Keyboard",
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peri-10",
    category: "Keyboards & Mice",
    title: "Durable Spill-Resistant Desk Keyboard",
    subtitle: "Rugged construction built for daily student assignments and lab notes.",
    tag: "Durable Build",
    url: "https://link.amazon/B02OCz5Io",
    type: "Keyboard",
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80"
  }
];
