export interface GuideTable {
  headers: string[];
  rows: string[][];
}

export interface GuideSection {
  id: string;
  heading: string;
  content: string;
  table?: GuideTable;
  keyPoints?: string[];
  callout?: {
    type: 'warning' | 'info' | 'tip' | 'checklist' | 'empowerment';
    title: string;
    text: string;
  };
}

export interface GuideChapter {
  id: string;
  chapterNumber: number;
  slug: string;
  title: string;
  subtitle: string;
  readTime: string;
  category: 'Counselling' | 'Academic' | 'Career' | 'Survival' | 'Hardware';
  badge: string;
  summary: string;
  sections: GuideSection[];
}

export const GUIDES_CHAPTERS: GuideChapter[] = [
  {
    id: 'guide-ch1',
    chapterNumber: 1,
    slug: 'eapcet-phase-2-counselling-strategy',
    title: 'AP EAPCET Phase-2 Counselling & Leftover Vacancy Strategy',
    subtitle: 'A strategic blueprint for maximizing college upgrades, sliding rules, and securing Post-Matric Tuition Fee Reimbursement (RTF)',
    readTime: '8 min read',
    category: 'Counselling',
    badge: 'Admissions 2026',
    summary: 'Master Phase-2 web options, understand why coveted category seats remain unfilled in top colleges, prepare strict reporting documents, and avoid losing your Phase-1 allotment.',
    sections: [
      {
        id: 'phase-2-dynamics',
        heading: 'Phase-2 Vacancy Dynamics: Why Premium Seats Remain Open',
        content: `Following Phase-1 reporting, students often believe top-tier engineering institutions (such as Andhra University, JNTU Kakinada, JNTU Anantapur, and SVUCE) have zero vacancies. In reality, a significant number of seats re-enter the pool due to multiple structural dynamics:

1. **IIT/NIT/IIIT JoSAA & CSAB Seat Allotments:** Thousands of top-ranking AP students register for AP EAPCET as a safety backup. Once JoSAA rounds 5 and 6 conclude alongside CSAB special rounds, these high rankers surrender their AP state seats.
2. **Category & Regional Conversion Cycles:** Unfilled reserved category seats (SC, ST, BC-E, Girls, and EWS) undergo phased sliding rules as mandated by APSCHE. When eligible category candidates exhaust options within a specific bracket, seats gradually slide across sub-categories or into the general merit conversion pool.
3. **Non-Reporting Auto-Cancellations:** Students who fail to complete self-reporting through both the online candidate portal and in-person physical college verification before the strict cutoff timestamp forfeit their provisional allotment automatically.

Understanding this dynamic is critical: **Phase-2 is not a leftover scrap round; it is an active reshuffling ground for high-tier seats.**`,
        keyPoints: [
          'High rankers surrender state seats once JoSAA/CSAB and BITS admissions conclude.',
          'Unfilled female quota seats and special category seats slide to general quotas in Phase-2.',
          'Never assume a top college is full—always place aspirational top choices above your current Phase-1 seat.',
        ],
        callout: {
          type: 'info',
          title: 'The Golden Rule of Web Options',
          text: 'If you are already holding an acceptable seat from Phase-1, you should ONLY submit web options for colleges and branches strictly BETTER than your current allotment. If Phase-2 allocates a seat, your Phase-1 seat is instantly canceled and given to another candidate.',
        },
        table: {
          headers: ['Admission Dynamics', 'Phase-1 Baseline', 'Phase-2 Tactical Reality'],
          rows: [
            ['Top College Vacancy', 'Perceived as 100% full upon initial reporting', 'High rankers surrender state seats after JoSAA/CSAB rounds 5 & 6 conclusion'],
            ['Reserved Category Seats', 'Rigid quota allocation (SC/ST/BC/EWS/Girls)', 'Unfilled category seats slide across sub-brackets into the general merit pool'],
            ['Reporting Time Window', 'Standard provisional document scrutiny', 'Strict 48–72 hour verification or instant irreversible seat cancellation'],
            ['Fee Reimbursement (RTF)', 'Sanctioned for Category-A convener quota (including 30-35% State Private Univ quota)', 'Direct 100% tuition coverage intact if admitted via Convener rank counselling']
          ]
        },
      },
      {
        id: 'web-option-strategy',
        heading: 'Strategic Web Option Structuring: The Three-Tier Ladder',
        content: `Many students make the fatal mistake of listing only 5 to 10 colleges or placing lower-grade private institutions above their current seat. To avoid disastrous downgrades, use the **Three-Tier Ladder Matrix**:

- **Tier A (Aspirational Upgrades - Top 30% of your list):** Colleges with cutoffs 2,000–5,000 ranks above your rank. Examples: AU, JNTUK, JNTUA, SVUCE, or top convener quotas in State Private Universities for CSE/IT/ECE. You may secure these due to unexpected Phase-2 seat surrender.
- **Tier B (Realistic Competitors - Middle 40%):** Colleges whose Phase-1 closing ranks matched your rank within a ±1,500 rank margin. Look closely at newly expanded specializations (AI & ML, Data Science, Cyber Security) where cutoffs fluctuate significantly.
- **Tier C (Safe Defensive Backups - Bottom 30%):** Only include colleges here if you DO NOT currently hold a Phase-1 seat and face the risk of completing counselling with zero admissions. If you already have a Phase-1 seat, omit Tier C entirely.`,
        table: {
          headers: ['Option Tier', 'Target Strategy', 'Rank Margin', 'Action & Institutional Targets'],
          rows: [
            ['Tier A (Aspirational Upgrades)', 'Top 30% of submitted options', '2,000–5,000 ranks above your rank', 'AUCE, JNTUK, JNTUA, SVUCE, top convener seats (Capture Phase-2 surrendered seats)'],
            ['Tier B (Realistic Competitors)', 'Middle 40% of submitted options', '±1,500 rank margin of Phase-1 cutoff', 'Target fluctuating specializations (AI/ML, Data Science, Cyber Security)'],
            ['Tier C (Defensive Safety Net)', 'Bottom 30% (Only if holding NO seat)', '3,000–8,000 ranks below your rank', 'Critical safety backup to prevent complete counselling zero-allocation']
          ]
        },
        keyPoints: [
          'Order of preference in the web form is absolute—the algorithm checks option #1 before checking option #2.',
          'Group colleges by location, autonomous track record, and verified placement records before submitting.',
          'Save your options frequently; do not wait until the final hour before server lock.',
        ],
      },
      {
        id: 'mandatory-documents',
        heading: 'Mandatory Physical Reporting Checklist',
        content: `Once the Phase-2 allotment letter is generated, physical reporting at the designated college within 48 to 72 hours is mandatory. Failure to produce even one required original document can jeopardize admissions. Carry three sets of gazetted attested photocopies along with original certificates:`,
        keyPoints: [
          'AP EAPCET 2026 Hall Ticket and Official Rank Card',
          'Provisional Allotment Order and Online Self-Reporting Acknowledgement Receipt',
          'SSC (10th Standard) Marks Memo and Intermediate Pass Certificate / Marks Memo',
          'Study & Residence Certificates from Class 6 through Intermediate (Proof of Local Status - AU/SVU/UR)',
          'Transfer Certificate (TC) and Conduct Certificate from the last attended junior college',
          'Integrated Community Certificate (Caste Certificate) for BC/SC/ST candidates issued through MeeSeva/Gram Ward Sachivalayam',
          'Income Certificate issued on or after January 1st of the current academic calendar, or valid White Ration Card / Rice Card',
          'EWS Certificate (Economically Weaker Sections) issued by Tahsildar if claiming 10% EWS quota',
        ],
        callout: {
          type: 'warning',
          title: 'Aadhaar & Bank Account Seeding for RTF & MTF',
          text: 'Ensure the student’s and mother’s Aadhaar numbers are active, bio-authenticated, and linked to an NPCI-mapped savings bank account for smooth Post-Matric Tuition Fee Reimbursement (RTF) and Maintenance Fee (MTF) disbursements.',
        },
      },
      {
        id: 'rtf-mtf-compliance',
        heading: 'Post-Matric Fee Reimbursement (RTF & MTF) Regulatory Compliance',
        content: `Under Andhra Pradesh's Post-Matric Tuition Fee Reimbursement (RTF) and Maintenance Fee (MTF) regulations:

1. **Post-Matric Tuition Fee Reimbursement (RTF - Reimbursement of Tuition Fee):** Direct institutional tuition fee coverage applies to eligible SC, ST, BC, EWS, Minority, and Kapu students admitted through convener quota (Category A, including the statutory 30%–35% convener quota in State Private Universities) whose annual household income is beneath ₹2.50 Lakhs and who satisfy land ceiling criteria.
2. **Maintenance Fee / Hostel Allowance (MTF - Maintenance Fee):** Food and living support allowance disbursed directly to eligible scholars.
3. **Attendance Stipulation:** 75% to 80% biometric student attendance recorded through the institutional Facial Recognition Attendance System (FRAS) is non-negotiable. Falling short can trigger reimbursement withholding for that quarter.
4. **Internal Examination Compliance:** Students must attempt internal midterms and maintain active academic status without disciplinary sanctions.`,
      },
    ],
  },
  {
    id: 'guide-ch2',
    chapterNumber: 2,
    slug: '75-percent-attendance-condonation-prevention',
    title: 'The 75% Attendance Doctrine: Condonation, Medical Clauses & Detention Prevention',
    subtitle: 'The legal mathematics of attendance thresholds, medical certificates, and safe bunk buffers',
    readTime: '6 min read',
    category: 'Academic',
    badge: 'Academic Defense',
    summary: 'Learn how universities compute attendance, the exact legal boundary between safe cutoffs, condonation zones (65%-75%), and irreversible examination detention.',
    sections: [
      {
        id: 'attendance-mathematics',
        heading: 'The Strict Mathematical Rules of Attendance Thresholds',
        content: `In Indian universities (including JNTU Kakinada, JNTU Anantapur, Andhra University, Osmania, and VTU), semester attendance is governed by statutory academic regulations. The calendar typically comprises 90 instructional days with approximately 400 to 500 instructional class periods:

- **≥ 75.00% (Green Zone):** Fully eligible to appear for Semester End Examinations (SEE) without penalties, fines, or bureaucratic hearings.
- **65.00% to 74.99% (Condonation Zone):** Ineligible for exams by default unless the Principal and Academic Committee accept valid medical grounds accompanied by a statutory Condonation Fee (typically ₹500 to ₹1,500 per semester).
- **< 65.00% (Detention Zone):** Statutorily non-condonable. The student is detained and barred from appearing for theory and laboratory end examinations. The semester must be repeated in full with the subsequent batch.`,
        keyPoints: [
          'Attendance is calculated per aggregate periods across all subjects, but lab courses frequently enforce an independent 75% threshold.',
          'Universities do not round up: 74.8% is legally under 75.0% and requires condonation.',
          'Missing 4 periods in a single day is a major hit during the first month of the semester.',
        ],
        callout: {
          type: 'checklist',
          title: 'The Safe Bunk Formula',
          text: 'If your current attendance is A out of C total periods, the maximum safe bunks B you can take while staying above 75% is: B = floor((A - 0.75 * C) / 0.75). Use StudyMacha’s Attendance Defender tool for exact dynamic calculations.',
        },
      },
      {
        id: 'medical-condonation-rules',
        heading: 'How to Legally Secure Medical Condonation (65%–75%)',
        content: `When severe illness, hospitalization, or genuine emergencies pull your attendance between 65% and 74.9%, you must present a verified medical docket before the cutoff deadline declared by the college exam cell:

1. **Government Civil Surgeon Certification:** Certificates from unverified homeopathic or private clinics without proper registration numbers are routinely rejected by college verification boards. Obtain a medical fitness & illness certificate with a government-registered doctor's stamp.
2. **Prescriptions & Discharge Summaries:** In cases of infectious illnesses (Dengue, Typhoid, Jaundice) or fractures, attach hospital admission slips, diagnostic lab test reports, and pharmacy bills matching the absent dates.
3. **Timely Submission:** Medical documents must be submitted to the Head of Department (HOD) within 7 working days of returning to campus—not on the eve of final examinations.`,
      },
      {
        id: 'recovery-strategy',
        heading: 'Deficit Recovery: Climbing Out of the Danger Zone',
        content: `If you have slipped below 75%, every missed class pushes your deficit exponentially deeper. To compute the exact consecutive classes R required to recover to 75%:
\`\`\`
R = ceil((0.75 * C - A) / (1 - 0.75)) = ceil((0.75 * C - A) / 0.25) = ceil(4 * (0.75 * C - A))
\`\`\`
Where **C** is total conducted periods and **A** is periods attended. 
For instance, if 200 classes were conducted and you attended 130 (65.0%):
\`R = ceil(4 * (150 - 130)) = 80 consecutive unattended classes without missing a single period.\`
This mathematical reality illustrates why proactive attendance tracking is far easier than late-semester recovery.`,
      },
    ],
  },
  {
    id: 'guide-ch3',
    chapterNumber: 3,
    slug: 'autonomous-vs-affiliated-colleges-grading',
    title: 'Premier State Universities vs State Private Universities vs Deemed-to-be Universities (AU, JNTUK, VIT-AP, SRM AP, SAHE/VRSEC, GVP, KL)',
    subtitle: 'A Policy-Accurate Blueprint of Regulation, Convener Quota Caps, Fee Structures, and RTF Fee Reimbursement Across Andhra Pradesh',
    readTime: '9 min read',
    category: 'Academic',
    badge: 'Institutional Guide',
    summary: 'A critical, policy-grounded breakdown across Andhra Pradesh engineering institutions: statutory governance, mandatory 30–35% convener quota surrender in State Private Universities, Deemed University fee autonomy, and Post-Matric Tuition Fee Reimbursement (RTF) eligibility.',
    sections: [
      {
        id: 'core-comparison-matrix',
        heading: 'Core Comparison Matrix: Premier State vs State Private vs Deemed-to-be Universities',
        content: `Choosing between a premier state university, a state private university, or a deemed-to-be university is one of the most consequential academic and financial choices for an engineering aspirant in Andhra Pradesh. Below is the statutory and operational benchmark analyzing governing legislation, entrance gateways, mandatory convener quota proportions, and Post-Matric Fee Reimbursement (RTF & MTF) eligibility:`,
        table: {
          headers: [
            'Evaluation Metric',
            'Premier State Univ (AU, JNTUK, SVUCE, JNTUA)',
            'State Private Univ (VIT-AP, SRM AP, VVIT, Aditya)',
            'Deemed-to-be Univ (SAHE/VRSEC, GVP, KL, VFSTR, GITAM)',
          ],
          rows: [
            [
              '1. Statutory Regulation & Legal Status',
              'State Public Universities enacted under AP State Legislative Acts (AU, JNTUK, JNTUA, SVU).',
              'Formed under Andhra Pradesh State Private Universities (Establishment and Regulation) Act.',
              'Declared under Section 3 of UGC Act / Central Ministry of Education Deemed University regulations.',
            ],
            [
              '2. AP EAPCET Convener Quota Proportion',
              '100% engineering seats allocated strictly through AP State EAPCET Convener Counselling.',
              'Statutorily required to surrender 30% to 35% of total engineering seats to AP EAPCET Convener Quota.',
              'Zero regular EAPCET Convener Quota counseling. Admissions run via institutional tests (KLEEE, VSAT, GAT).',
            ],
            [
              '3. State Fee Reimbursement (RTF & MTF) Eligibility',
              '100% full Post-Matric Tuition Fee Reimbursement (RTF) & Maintenance Allowance (MTF) for eligible candidates.',
              'Candidates securing seats under the 30%–35% EAPCET convener quota ARE FULLY ELIGIBLE for RTF & MTF. Non-convener seats ineligible.',
              'State government fee reimbursement schemes (RTF/MTF) DO NOT apply. Tuition is set autonomously without state reimbursement.',
            ],
            [
              '4. Tuition & Overall Living Expenses',
              '₹15,000–₹50,000/yr tuition (lowest in state, completely covered under RTF for eligible scholars).',
              'State-regulated convener tuition for 30–35% quota (RTF eligible); ₹2,50,000–₹4,50,000+/yr for institutional/management quotas.',
              '₹2,20,000–₹4,20,000+/yr tuition + hostel expenses; entirely self-funded with zero state fee reimbursement support.',
            ],
            [
              '5. Batch Sizes & Placement Pathways',
              'Batch size 300–600 per campus; unrivaled alumni brand for GATE, PSUs, ISRO, DRDO, and global MS admissions.',
              'Multi-thousand pooled batches; hyper-agile modern curricula (FFCS), global exchange, and national tech recruiter drives.',
              'Substantial campus-level cohorts; advanced private research labs, corporate hackathons, and centralized corporate placement cells.',
            ],
          ],
        },
        keyPoints: [
          'Premier State Universities (AUCE, JNTUK, JNTUA, SVUCE) fill 100% of seats via AP EAPCET convener quota with complete RTF fee reimbursement coverage and highest public-sector credibility.',
          'Under AP State Private Universities Act, 30% to 35% of engineering seats are mandatorily surrendered to AP EAPCET Convener Quota, and students admitted under this quota ARE ELIGIBLE for state fee reimbursement (RTF).',
          'Deemed-to-be Universities (SAHE/VRSEC, GVP deemed status, KL, Vignan VFSTR, GITAM) operate under central UGC regulations without state convener quota, and state fee reimbursement (RTF/MTF) DOES NOT apply.',
        ],
      },
      {
        id: 'institutional-breakdown',
        heading: 'Institutional Breakdown: Ground Realities Across Andhra Pradesh',
        content: `A rigorous analysis of each institutional category clarifies their governing statutory frameworks, admission gateways, and financial realities:

1. **Premier State Public Universities (AU College of Engineering Visakhapatnam, JNTU Kakinada, JNTU Anantapur, SVU College of Engineering Tirupati):**
   - **100% Convener Allocation:** Every single engineering seat is filled transparently through AP EAPCET convener rank counseling.
   - **Maximum Financial ROI & Full RTF Coverage:** Highly subsidized public tuition structures (₹15,000–₹50,000/year) combined with 100% Post-Matric Tuition Fee Reimbursement (RTF) and Maintenance Fee (MTF) for eligible income/reservation categories.
   - **Unrivaled Institutional Pedigree:** Decades of legacy alumni heading research institutions (ISRO, DRDO, BARC), public sector undertakings (BHEL, IOCL, ONGC), Indian Engineering Services (IES), and elite global university graduate programs.
   - **Student Caliber:** Absorbs the state's top-tier EAPCET rank holders, creating an organic culture of competitive problem solving and GATE excellence.

2. **State Private Universities (VIT-AP Amravati, SRM University-AP Mangalagiri, VVIT Private University status, Aditya University, Mohan Babu University MBU, Centurion University AP):**
   - **Statutory 30%–35% Convener Quota Mandate:** Under the Andhra Pradesh State Private Universities (Establishment and Regulation) Act, these universities are mandatorily required to surrender 30% to 35% of their total engineering seats to the AP State EAPCET Convener Quota.
   - **State Fee Reimbursement (RTF) Eligibility for Convener Scholars:** Candidates who secure admission within this 30%–35% convener bracket through their AP EAPCET rank ARE FULLY ELIGIBLE for Post-Matric Tuition Fee Reimbursement (RTF) and MTF, provided they meet standard government household income (under ₹2.50 Lakhs) and category guidelines.
   - **Institutional Entrance & Management Quotas (65%–70%):** The remaining 65% to 70% of seats are admitted through national/institutional entrance tests (e.g., VITEEE, SRMJEEE) or institutional management categories. Students admitted through these channels pay full private university tuition (₹2.50–₹4.50 Lakhs/year) and are ineligible for state fee reimbursement.
   - **Modern Infrastructure & Academic Flexibility:** Fully Flexible Credit Systems (FFCS), high-end computing laboratories, cosmopolitan peer demographics, and active hackathon environments.

3. **Deemed-to-be Universities (SAHE comprising VRSEC Vijayawada, Gayatri Vidya Parishad - GVP deemed status, KL University - KLEF, Vignan's Foundation VFSTR Vadlamudi, GITAM University Visakhapatnam):**
   - **Central UGC/MoE Deemed Regulations:** These institutions operate under Section 3 of the UGC Act and Central Ministry of Education guidelines rather than state affiliating university systems.
   - **No Regular State Convener Quota:** Admissions are conducted independently via their own national entrance examinations (such as KLEEE, VSAT, GAT) or institutional merit screening. They do not participate in regular AP EAPCET state convener seat matrix distribution.
   - **Ineligibility for State Fee Reimbursement:** Andhra Pradesh state fee reimbursement schemes (RTF and MTF) DO NOT apply to these deemed universities. Tuition and hostel fee structures are determined completely autonomously by institutional management boards.
   - **Autonomous Academic Rigor:** Rapid syllabus modernization, strong regional placement networks across southern tech hubs, and modern campus infrastructure.`,
        keyPoints: [
          'State Private Universities mandatorily surrender 30% to 35% of engineering seats to EAPCET convener counseling, unlocking RTF fee reimbursement for eligible rankers.',
          'Deemed-to-be Universities (SAHE/VRSEC, GVP, KL, Vignan, GITAM) do not participate in state convener quotas and are not covered by state RTF/MTF reimbursement schemes.',
          'Premier state universities (AU, JNTUK, JNTUA, SVU) maintain 100% convener allocation, lowest costs, and unrivaled standing for GATE, PSUs, and international master’s admissions.',
        ],
      },
      {
        id: 'student-empowerment-note',
        heading: 'Student Empowerment Note (Motivational Ground Truth)',
        content: `Regardless of whether your allotment reads a premier state university, a state private university convener seat, or an autonomous deemed campus, your engineering outcome is dictated by the software you build and the fundamentals you master.`,
        callout: {
          type: 'empowerment',
          title: 'STUDENT EMPOWERMENT NOTE (MOTIVATIONAL GROUND TRUTH)',
          text: 'The Truth Every Engineer Must Know: The college gates you walk through on Day 1 do not define the engineer you become on Day 1460. Whether you study at a premier public university like AUCE or JNTUK, secure an EAPCET convener quota seat at a state private university like VIT-AP or SRM-AP, or attend a deemed campus like SAHE (VRSEC), GVP, or KL University—code compilers and technical interviewers do not care about campus marble or administrative classification. They evaluate data structures mastery, system design depth, problem-solving resilience, and verifiable project commits. Own your trajectory, build authentic systems, contribute to open source, and remember: Great engineers are never manufactured by institutions; they forge themselves.',
        },
      },
    ],
  },
  {
    id: 'guide-ch4',
    chapterNumber: 4,
    slug: 'tier-3-engineering-survival-blueprint',
    title: 'Tier-3 Engineering Reality: The Self-Taught Engineer’s Survival Blueprint',
    subtitle: 'Overcoming obsolete college labs, 3.5 LPA mass recruiters, and building real proof-of-work',
    readTime: '9 min read',
    category: 'Survival',
    badge: 'Career Survival',
    summary: 'A candid survival guide for students in tier-3 campuses: ditching rote assignment culture, mastering Git/GitHub, and engineering production web software that earns high-paying jobs.',
    sections: [
      {
        id: 'tier-3-reality',
        heading: 'The Unfiltered Reality of Tier-3 Campuses',
        content: `If you are studying in a tier-3 engineering college in rural or semi-urban Andhra Pradesh or Telangana, you have likely realized:
- On-campus placement drives are dominated by IT service companies (TCS, Wipro, Infosys, Cognizant) offering the same entry salaries (₹3.36 to ₹4.0 LPA) they offered a decade ago.
- The college computer lab computers often run outdated operating systems and prohibit package installations like Node.js, Docker, or modern Python runtimes.
- College record books require hand-copying hundreds of pages of code that could be executed in two seconds.

Accepting this reality without cynicism is step one: **Your college degree qualifies you to sit for an interview; your self-taught portfolio determines your actual salary.**`,
      },
      {
        id: 'portfolio-over-records',
        heading: 'Building Verifiable Public Proof-of-Work',
        content: `Recruiters at top product companies and venture-funded startups care about what you can ship, not your college record book score. To stand out:

1. **A Green GitHub Contribution Graph:** Commit code every day. Even small bug fixes, documentation improvements, or algorithmic practice keep your momentum visible.
2. **Deploy Every Single Project:** Never present a project as \`localhost:3000\`. Deploy on Vercel, Netlify, Render, or Cloudflare Pages with custom domains. Include a live URL in your resume header.
3. **Eliminate Clone Projects:** Stop building weather apps, todo lists, or basic calculator clones. Build tools that solve real problems: an attendance calculator for your university, an automated exam notification bot on Telegram, or a localized PDF optimization tool.`,
        keyPoints: [
          'Document every repository with an exceptional README.md containing architecture diagrams, feature lists, and quickstart setup steps.',
          'Record 60-second video walkthroughs using Loom or OBS and embed them directly at the top of your GitHub repository.',
        ],
      },
      {
        id: 'hostel-room-hustle',
        heading: 'The 4-Year Execution Timeline',
        content: `How to break down your college semesters for maximum career leverage:
- **1st Year:** Master one language deeply (C++ or Java). Understand loops, memory pointers, OOP principles, and clean code formatting. Clear all 1st-year subjects to avoid backlog baggage.
- **2nd Year:** Complete foundational Data Structures (Arrays, Linked Lists, Trees, Graphs). Build foundational full-stack web applications using TypeScript, React, and Node.js.
- **3rd Year:** Enter national hackathons (Smart India Hackathon, Devfolio, MLH). Apply for remote internships on Wellfound and LinkedIn. Solve 250+ LeetCode problems across core patterns.
- **4th Year:** Target off-campus employee referrals, contribute to high-impact open-source repositories, and build production projects showcasing microservices or database optimizations.`,
      },
    ],
  },
  {
    id: 'guide-ch5',
    chapterNumber: 5,
    slug: 'cracking-off-campus-tech-hiring-referrals',
    title: 'Cracking Off-Campus Tech Hiring: Cold Emailing, Referrals & Hackathons',
    subtitle: 'Bypassing the ATS black hole through targeted networking and 24-hour hackathons',
    readTime: '8 min read',
    category: 'Career',
    badge: 'Placements 2026',
    summary: 'Discover why generic job portal applications fail, how to write cold messages on LinkedIn with a 30%+ response rate, and how hackathons unlock direct interviews at premier tech firms.',
    sections: [
      {
        id: 'ats-black-hole',
        heading: 'Why Applying on Company Portals Fails 98% of the Time',
        content: `When Google, Swiggy, Uber, or a high-growth startup posts an entry-level software engineer opening, they receive 15,000+ applications within 48 hours. Most applications are parsed by Applicant Tracking Systems (ATS) that auto-reject candidates based on rigid keyword filters, college tier classifications, or unformatted resumes.

If you rely solely on clicking "Apply" on corporate career sites, you are competing against astronomical odds. **The modern off-campus strategy is referral-first.**`,
      },
      {
        id: 'cold-messaging-mastery',
        heading: 'The Anatomy of a High-Conversion Cold Message',
        content: `Engineering managers and senior software engineers receive dozens of bland messages saying: *"Dear Sir, Please refer me for SDE-1."* These are almost always ignored. 

A high-converting outreach message adheres to the **Value-First Principle**:
1. **Target Specific Engineers:** Search LinkedIn for engineers who graduated from non-IIT/NIT colleges 2 to 4 years ago and currently work at your target company.
2. **Reference Specific Job IDs:** Never ask them to find a job for you. Provide the exact Job ID, title, and link.
3. **Highlight 3 Relevant Metrics:** Quantify your work (e.g., *"Built a distributed task queue handling 5,000 req/sec; solved 300+ LeetCode problems; created StudyMacha with 10k monthly active users"*).
4. **Include a Tailored 1-Click Blurb:** Write a concise 4-sentence blurb that the engineer can copy-paste directly into their internal company referral portal without editing.`,
        callout: {
          type: 'tip',
          title: 'Proven LinkedIn Cold Outreach Template',
          text: `Hi [Name], I noticed your work on [Company]'s payment gateway team. I'm a final-year CS undergrad who recently engineered an open-source latency benchmarking tool in Go & React (live at demo.dev). I saw Job ID #49201 (Frontend Engineer I). If my work aligns with your team's standards, would you be open to submitting an internal referral? I have drafted a 3-sentence blurb and my single-page ATS resume here: [Link]. Thanks for your time!`,
        },
      },
      {
        id: 'hackathons-backdoor',
        heading: 'Hackathons: The Ultimate Off-Campus Interview Ticket',
        content: `National hackathons (Smart India Hackathon, Devpost, ETHIndia, Devfolio hackathons) are primary hunting grounds for tech recruiters looking to skip initial screening rounds:
- **Judges are Hiring Decision-Makers:** Engineering Directors and VP-level leaders judge hackathon project demos. Impressing them during a 3-minute pitch often leads to immediate technical interview offers.
- **Team Roles Matter:** Position yourself as the core engineer responsible for architecture, live API integration, and deployment.
- **Publish Post-Mortems:** After every hackathon, write a technical post on LinkedIn/X detailing your architecture, the bugs you conquered, and your GitHub repository. Tag the organizers and sponsor companies.`,
      },
    ],
  },
  {
    id: 'guide-ch6',
    chapterNumber: 6,
    slug: 'modern-dsa-core-cs-priority-roadmap',
    title: 'The Modern DSA & Core CS Priority Roadmap',
    subtitle: 'Escaping tutorial hell, conquering 14 algorithmic patterns, and mastering core CS systems',
    readTime: '9 min read',
    category: 'Career',
    badge: 'DSA & Systems',
    summary: 'A structured pathway through algorithmic problem solving, core computer science subjects (OS, DBMS, CN), and modern system design essentials for product interviews.',
    sections: [
      {
        id: 'tutorial-hell-escape',
        heading: 'Escaping Tutorial Paralysis: The 20-Minute Rule',
        content: `Many students spend 6 months watching YouTube playlists on data structures without writing code independently. When presented with an unseen medium problem on LeetCode, they freeze.

Overcome this with the **20-Minute Rule**:
- Read the problem statement and write out two sample test cases on physical paper.
- Spend exactly 20 minutes brainstorming brute-force approaches and time complexity tradeoffs without checking the discussion tab.
- If completely stuck after 20 minutes, inspect ONLY the algorithm tags (e.g., "Two Pointer" or "Monotonic Queue").
- If still stuck after another 10 minutes, read the editorial explanation, close the tab, and **write the solution from scratch without copy-pasting.** Revisit the exact problem 3 days later.`,
      },
      {
        id: 'the-14-patterns',
        heading: 'Mastering the 14 High-Yield LeetCode Patterns',
        content: `Instead of attempting 800 random LeetCode questions, master the recurring algorithmic patterns that power 90% of technical interviews:

1. **Two Pointers & Sliding Window:** Array reversals, target pair sums, longest substrings without repeats.
2. **Fast & Slow Pointers:** Cycle detection in linked lists, middle of list, palindrome lists.
3. **Monotonic Stack:** Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram.
4. **Binary Search on Answer Space:** Koko Eating Bananas, Capacity To Ship Packages Within D Days, aggressive cows.
5. **Tree Traversal (BFS & DFS):** Level-order, diameter of tree, lowest common ancestor, path sum.
6. **Graph Algorithms:** Topological Sort (Kahn's Algorithm), Dijkstra's shortest path, Disjoint Set Union (Kruskal's).
7. **Dynamic Programming (Knapsack & Subsequences):** 0/1 Knapsack, Coin Change, Longest Increasing Subsequence, Edit Distance.`,
      },
      {
        id: 'core-cs-trio',
        heading: 'The Core CS Trio: OS, DBMS, and Computer Networks',
        content: `In 45-minute technical rounds, interviewers dedicate 15–20 minutes to core subjects:
- **Operating Systems:** Virtual Memory, Paging vs Segmentation, Process Synchronization (Semaphores, Mutexes, Deadlock Coffman Conditions), Multithreading, and CPU Scheduling.
- **DBMS & SQL:** ACID Properties, Normalization (1NF to BCNF), Indexing mechanics (B+ Trees vs Hash Indexing), Transactions, Isolation Levels, and writing complex JOINs / GROUP BY queries.
- **Computer Networks:** The TCP 3-Way Handshake, TCP vs UDP tradeoffs, DNS Resolution pipeline, What happens when you type google.com into your browser, HTTPS TLS Handshake, and HTTP/2 vs HTTP/3.`,
      },
    ],
  },
  {
    id: 'guide-ch7',
    chapterNumber: 7,
    slug: 'engineering-backlogs-recovery-mental-resilience',
    title: 'Engineering Backlog Management & Academic Mental Recovery',
    subtitle: 'A systematic action plan for clearing backlogs without compromising current semester GPA',
    readTime: '7 min read',
    category: 'Academic',
    badge: 'Mental Resilience',
    summary: 'De-stigmatizing backlogs, creating an aggressive subject clearance triage, mastering previous 5-year question papers, and understanding university re-evaluation procedures.',
    sections: [
      {
        id: 'destigmatizing-backlogs',
        heading: 'De-Stigmatizing the Backlog Trap',
        content: `In engineering colleges across Andhra Pradesh and Telangana, getting a backlog in subjects like Engineering Mathematics (M1/M2), Network Analysis, Data Structures, or Electromagnetic Fields is surprisingly common. Unfortunately, parental anxiety and social stigma often lead to panic, depression, and academic paralysis.

The first step toward recovery is clarity: **A backlog is not a character flaw; it is an unfinished technical transaction.** Thousands of top software engineers at multinational tech companies graduated with backlogs they cleared systematically along the way.`,
      },
      {
        id: 'backlog-triage-method',
        heading: 'The 2+1 Backlog Clearance Triage Method',
        content: `Students with 4 or 5 backlogs often make the mistake of attempting to clear all of them in a single supplementary examination window while trying to study 6 ongoing semester subjects. The result? They fail the supplementary exams and pick up new backlogs in the current semester.

Adopt the **2+1 Triage Framework**:
1. **Never Compromise Ongoing Semester Subjects:** Dedicate 70% of your daily study time to current semester subjects to guarantee your backlog tally does not grow.
2. **Select At Most Two Backlogs per Supplementary Cycle:** Choose one "High-Priority Easy Pass" (e.g., Environmental Science or an elective) and one "Heavy Hard Subject" (e.g., M1 or Electrical Circuits).
3. **The 5-Year Question Paper Rule:** State technical universities (JNTUK, JNTUA, AU) repeat question blueprints. Download the previous 5 years of semester end examination question papers. Group questions by unit syllabus: Unit-1 typically has two questions with an OR choice. Master 3 complete units thoroughly rather than skimming all 5 units superficially.`,
      },
      {
        id: 'reevaluation-recounting',
        heading: 'Re-evaluation & Recounting Tactics',
        content: `If you scored between 21 and 24 marks when the passing threshold was 25 or 28, apply for challenge revaluation immediately:
- **Photocopy Verification:** Apply for the scanned answer script copy. Check whether marks were accurately totaled and whether any answers were left unvalued by the external examiner.
- **Subject-Matter Faculty Review:** Review the scanned paper with your college subject professor before paying hefty challenge re-evaluation fees.`,
      },
    ],
  },
  {
    id: 'guide-ch8',
    chapterNumber: 8,
    slug: 'student-hardware-calculators-workstations-budget',
    title: 'Hardware, Calculators & Coding Workstations on a Student Budget',
    subtitle: 'Casio fx-991CW vs fx-991EX exam rules, laptop buying specs, and lightweight Linux setups',
    readTime: '6 min read',
    category: 'Hardware',
    badge: 'Hardware & Gear',
    summary: 'Navigate strict university calculator regulations (Casio models), budget laptop hardware specifications for CS/ECE students, and setting up Linux/WSL workstations on modest laptops.',
    sections: [
      {
        id: 'scientific-calculators',
        heading: 'University Calculator Regulations: Casio fx-991CW vs fx-991EX',
        content: `In engineering university examinations (JNTUK, JNTUA, Anna University, VTU, GATE), programmable calculators with alphanumeric storage capabilities are strictly banned. Invigilators routinely inspect and confiscate non-compliant models.

- **Casio fx-991CW (Current Gold Standard):** Fully compliant with university examination guidelines. Features a high-resolution Natural Textbook Display, 540+ functions, matrix operations (up to 4x4), complex numbers, polynomial equation solvers, and numerical calculus (differentiation & integration).
- **Casio fx-991EX ClassWiz (Older Favorite):** Widely loved but largely discontinued and heavily counterfeited in retail markets. If purchasing, ensure you verify the holographic barcode on Casio's official portal.
- **What is BANNED:** Graphic calculators (Casio fx-9860G, TI-84 Plus) and calculators with QWERTY keyboards or USB data transfer capabilities are strictly prohibited.`,
      },
      {
        id: 'budget-laptop-specs',
        heading: 'Engineering Laptop Buying Guide (Under ₹35,000–₹50,000)',
        content: `You do not need an expensive ₹1,00,000 Apple MacBook or a power-hungry gaming laptop to become a skilled software developer. A well-configured budget machine is more than sufficient:

1. **RAM is Non-Negotiable (16GB Minimum):** Running modern development tools (VS Code, Docker containers, Chrome tabs, and language servers) quickly overwhelms 8GB of RAM. If buying an 8GB laptop, confirm it has an empty SODIMM slot for a ₹1,800 upgrade to 16GB.
2. **CPU Tier:** Look for AMD Ryzen 5 (5500U / 7530U) or Intel Core i5 (12th or 13th Gen). Avoid Intel Celeron or AMD Athlon processors.
3. **Storage:** 512GB NVMe SSD. Avoid traditional rotating Hard Disk Drives (HDDs)—they cause agonizingly slow boot times and compilation bottlenecks.
4. **Refurbished Enterprise ThinkPads:** For students on a tight ₹20,000 budget, consider certified refurbished enterprise laptops like the Lenovo ThinkPad T480/T490 or Dell Latitude. These boast exceptional keyboard ergonomics, military-grade durability, and easy component upgradability.`,
      },
      {
        id: 'linux-wsl-workstation',
        heading: 'Lightweight Linux & WSL Setup for Peak Performance',
        content: `If your computer is sluggish under Windows 11 bloatware:
- **Windows Subsystem for Linux (WSL2):** Run native Ubuntu terminal environments directly inside Windows without performance penalties (\`wsl --install\`).
- **Dual-Boot Ubuntu or Linux Mint:** Installing a lightweight Linux distribution breathes new life into aging hardware, providing instant compilation speeds, native package managers (\`apt\`), and direct Docker integration.`,
      },
    ],
  },
];
