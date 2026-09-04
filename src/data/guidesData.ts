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
    subtitle: 'A strategic blueprint for maximizing college upgrades, sliding rules, and securing JVD fee reimbursement',
    readTime: '8 min read',
    category: 'Counselling',
    badge: 'Admissions 2026',
    summary: 'Master Phase-2 web options, understand why coveted category seats remain unfilled in top colleges, prepare strict reporting documents, and avoid losing your Phase-1 allotment.',
    sections: [
      {
        id: 'phase-2-dynamics',
        heading: 'Phase-2 Vacancy Dynamics: Why Premium Seats Remain Open',
        content: `Following Phase-1 reporting, students often believe top-tier engineering institutions (such as Gayatri Vidya Parishad, VR Siddhartha, JNTU Kakinada, and AU College of Engineering) have zero vacancies. In reality, a significant number of seats re-enter the pool due to multiple structural dynamics:

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
            ['JVD Fee Reimbursement', 'Sanctioned for Category-A convener quota', '100% full tuition waiver remains intact if admitted via Convener quota']
          ]
        },
      },
      {
        id: 'web-option-strategy',
        heading: 'Strategic Web Option Structuring: The Three-Tier Ladder',
        content: `Many students make the fatal mistake of listing only 5 to 10 colleges or placing lower-grade private institutions above their current seat. To avoid disastrous downgrades, use the **Three-Tier Ladder Matrix**:

- **Tier A (Aspirational Upgrades - Top 30% of your list):** Colleges with cutoffs 2,000–5,000 ranks above your rank. Examples: AU, JNTUK, GVP, Vasireddy Venkatadri, or VR Siddhartha for CSE/IT/ECE. You may secure these due to unexpected Phase-2 seat surrender.
- **Tier B (Realistic Competitors - Middle 40%):** Colleges whose Phase-1 closing ranks matched your rank within a ±1,500 rank margin. Look closely at newly expanded specializations (AI & ML, Data Science, Cyber Security) where cutoffs fluctuate significantly.
- **Tier C (Safe Defensive Backups - Bottom 30%):** Only include colleges here if you DO NOT currently hold a Phase-1 seat and face the risk of completing counselling with zero admissions. If you already have a Phase-1 seat, omit Tier C entirely.`,
        table: {
          headers: ['Option Tier', 'Target Strategy', 'Rank Margin', 'Action & Institutional Targets'],
          rows: [
            ['Tier A (Aspirational Upgrades)', 'Top 30% of submitted options', '2,000–5,000 ranks above your rank', 'AUCE, JNTUK, GVP, VRSEC, VVIT (Capture Phase-2 surrendered seats)'],
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
          title: 'Aadhaar & Bank Account Seeding for JVD',
          text: 'Ensure the student’s and mother’s Aadhaar numbers are active, bio-authenticated, and linked to an NPCI-mapped savings bank account for smooth Jagananna Vidya Deevena (JVD) fee reimbursement disbursements.',
        },
      },
      {
        id: 'rtf-jvd-compliance',
        heading: 'Fee Reimbursement (RTF & JVD) Regulatory Compliance',
        content: `Under Andhra Pradesh's Jagananna Vidya Deevena (RTF - Reimbursement of Tuition Fee) regulations:
1. **Full Tuition Reimbursement** applies to eligible SC, ST, BC, EWS, Minority, and Kapu students admitted through convener quota (Category A) whose annual household income is beneath ₹2.50 Lakhs and who own less than specified land ceilings.
2. **Attendance Stipulation:** 75% to 80% biometric student attendance recorded through the institutional Facial Recognition Attendance System (FRAS) is non-negotiable. Falling short can trigger reimbursement withholding for that quarter.
3. **Internal Examination Compliance:** Students must attempt internal midterms and maintain active academic status without disciplinary sanctions.`,
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
    title: 'Affiliated & Autonomous Colleges vs Top Deemed Private Universities (VRSEC, GVP, VIT-AP, SRM AP, AU, JNTUK)',
    subtitle: 'Evaluating Fee ROI, Academic Flexibility, Campus Life, and Real Placement Outcomes Across Andhra Pradesh',
    readTime: '9 min read',
    category: 'Academic',
    badge: 'Institutional Guide',
    summary: 'A critical comparative breakdown of state universities, elite autonomous colleges, and top deemed private campuses: fee return-on-investment, academic autonomy, placement dynamics, and the ground reality of engineering success.',
    sections: [
      {
        id: 'core-comparison-matrix',
        heading: 'Core Comparison Matrix: State Universities vs Autonomous vs Deemed Private Campuses',
        content: `Choosing between a state university campus, an elite UGC autonomous engineering college, or a top deemed private university is one of the most critical financial and academic decisions for an engineering student. Below is the multi-dimensional benchmark analyzing parent university governance, fee models, syllabus agility, batch competition, and grading standards:`,
        table: {
          headers: [
            'Evaluation Metric',
            'Premier State Univ (AU, JNTUK)',
            'Elite Autonomous (VRSEC, GVP)',
            'Top Deemed Private (VIT-AP, SRM AP)',
          ],
          rows: [
            [
              '1. Parent University & Regulation',
              'State Government Public Universities governed by legislative acts (AU / JNTUK)',
              'UGC Autonomous Institutions affiliated with state university with academic autonomy',
              'Deemed-to-be / State Private Universities operating under independent UGC / AICTE mandates',
            ],
            [
              '2. Tuition & Living Expenses',
              '₹15,000–₹50,000/yr tuition (100% covered under JVD fee reimbursement scheme)',
              '₹50,000–₹1,05,000/yr (Govt regulated convener quota; 100% JVD fee waiver eligible)',
              '₹2,50,000–₹4,50,000+/yr tuition + hostel fees (Not eligible for JVD state fee reimbursement)',
            ],
            [
              '3. Curriculum Agility & Tech Electives',
              'Centralized 3–4 year university revision cycles; traditional core fundamentals',
              'Annual Board of Studies updates with industry electives (AI, Cloud, React, Embedded systems)',
              'Hyper-agile semester updates, flexible credit course selection (FFCS) & corporate certifications',
            ],
            [
              '4. Placement Demographics & Competition',
              'Batch size 300–600; strong legacy alumni pull in PSUs, core engineering & IT services',
              'Batch size 600–1,200; established regional placement cells with direct Tier-1 tech recruitments',
              'Mega-batch pooling (3,000–5,000+ candidates across campuses); intense peer competition for high-bracket offers',
            ],
            [
              '5. Evaluation Rigor & Grading',
              'Strict external university spot-valuation; longer supplementary examination waiting cycles',
              'Autonomous internal continuous evaluation (40/60 or 30/70); rapid backlog clearance exam cycles',
              'Continuous relative grading curves; digital portals, project-centric assignments & frequent quizzes',
            ],
          ],
        },
        keyPoints: [
          'Premier state universities provide highest fee ROI, zero debt, and unmatched credibility for public sector exams (GATE/PSUs) and foreign MS admissions.',
          'Elite autonomous colleges (VRSEC, GVP) balance government fee reimbursement (JVD) with industry-relevant electives and disciplined academic schedules.',
          'Deemed private universities offer premier infrastructure and cosmopolitan campus exposure, but require personal discipline to navigate massive batch sizes and high capital outlay.',
        ],
      },
      {
        id: 'institutional-breakdown',
        heading: 'Institutional Breakdown: Ground Reality Across Andhra Pradesh',
        content: `A closer inspection of each institutional tier reveals distinct operational strengths, placement channels, and campus cultures:

1. **Premier State Universities (AUCE Visakhapatnam, JNTU Kakinada):**
   - **Academic & Financial ROI:** Modest fee structures combined with 100% JVD eligibility make these the highest value-for-money institutions in Andhra Pradesh.
   - **Alumni Capital & Recognition:** Decades of alumni holding senior executive, scientific, and civil administration posts across India, Silicon Valley, and Europe. Unsurpassed brand equity for GATE, IES, ISRO, DRDO, PSUs, and Ivy League/top-tier international graduate admissions.
   - **Student Profile:** Attracts the state's top EAPCET rankers, creating a deeply competitive, self-reliant peer group.

2. **Elite Autonomous Institutions (Gayatri Vidya Parishad - GVP, Velagapudi Ramakrishna Siddhartha Engineering College - VRSEC):**
   - **Proven Regional Engines:** Proven regional placement engines with strong local alumni ties across Hyderabad, Bengaluru, and Chennai tech hubs.
   - **Curriculum Agility:** Autonomous Boards of Studies update syllabi annually with industry partners, bypassing traditional 4-year state university latency.
   - **Regulatory Protection:** Full state fee reimbursement compliance (JVD) under Convener Category-A, delivering high-quality engineering degrees at minimal cost for eligible families.

3. **Top Private Deemed Campuses (VIT-AP, SRM University-AP):**
   - **Modern Infrastructure & Global Immersion:** High-tech modern infrastructure, global immersion, diverse national peer groups, advanced laboratories, and vibrant hackathon cultures.
   - **Curriculum Flexibility:** Fully Flexible Credit Systems (FFCS) allowing students to choose specialized technical tracks, preferred instructors, and interdisciplinary minors.
   - **Financial Tradeoff & Competition:** Considerably higher fee structures (₹10–18 Lakhs across 4 years including residential costs) and intense competition during pooled campus placements with thousands of peer candidates.`,
        keyPoints: [
          'AU and JNTUK alumni networks are especially dominant in core engineering, government research (ISRO, DRDO), and foreign higher education.',
          'VRSEC and GVP are the benchmark autonomous colleges in AP with high placement conversion rates for tech roles.',
          'Deemed private campuses reward proactive, highly ambitious coders with top-tier hackathons and direct multinational placement pipelines.',
        ],
      },
      {
        id: 'student-empowerment-note',
        heading: 'Student Empowerment Note (Motivational Ground Truth)',
        content: `Regardless of whether your allotment reads a state university, a local autonomous college, or a prestigious deemed private campus, your engineering career is decided by what you build, not where you sleep.`,
        callout: {
          type: 'empowerment',
          title: 'STUDENT EMPOWERMENT NOTE (MOTIVATIONAL GROUND TRUTH)',
          text: 'The Truth Every Engineer Must Know: The college gates you walk through on Day 1 do not define the engineer you become on Day 1460. Whether you study at an affiliated rural college, an autonomous institution like VRSEC or GVP, or a sprawling private university like VIT or SRM—code compilers and technical interviewers do not care about your campus architecture. They evaluate your problem-solving resilience, system architecture depth, and real-world project commits. Own your trajectory, master your core fundamentals, build authentic software, and remember: Great engineers are never manufactured by institutions; they forge themselves.',
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
