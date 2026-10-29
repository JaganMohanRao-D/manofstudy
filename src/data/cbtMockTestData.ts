export interface MockQuestion {
  id: number;
  section: 'verbal' | 'logical' | 'numerical';
  sectionName: string;
  questionText: string;
  passage?: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
}

export const RELIANCE_SCHOLARSHIP_MOCK_TEST: MockQuestion[] = [
  // =========================================================================
  // SECTION 1: VERBAL ABILITY (Questions 1 - 20)
  // =========================================================================
  {
    id: 1,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Choose the word that is most nearly OPPOSITE in meaning to the capitalized word: CANDID',
    options: ['Frank', 'Deceitful', 'Blunt', 'Honest'],
    correctOptionIndex: 1,
    explanation:
      'Candid means truthful, straightforward, and outspoken. Its opposite is deceitful (dishonest or untruthful). Frank and blunt are synonyms.',
  },
  {
    id: 2,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Identify the grammatically correct sentence from the following options:',
    options: [
      'Neither the principal nor the teachers was present in the auditorium.',
      'Neither the principal nor the teachers were present in the auditorium.',
      'Neither the teachers nor the principal were present in the auditorium.',
      'Neither the principal or the teachers was present in the auditorium.',
    ],
    correctOptionIndex: 1,
    explanation:
      'When two subjects are joined by "neither... nor", the verb agrees with the subject closest to it. Here, "teachers" (plural) is closer to the verb, so "were present" is grammatically correct. Also, "neither" correlates with "nor", not "or".',
  },
  {
    id: 3,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Fill in the blank with the appropriate preposition: "The committee agreed _______ the recommendations submitted by the research team."',
    options: ['to', 'with', 'on', 'upon'],
    correctOptionIndex: 0,
    explanation:
      'One agrees "to" a proposal, recommendation, or plan of action, whereas one agrees "with" a person or viewpoint, and agrees "on" a matter after discussion.',
  },
  {
    id: 4,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Select the most appropriate SYNONYM of the word: EPHEMERAL',
    options: ['Eternal', 'Transient', 'Permanent', 'Substantial'],
    correctOptionIndex: 1,
    explanation:
      'Ephemeral means lasting for a very short time. "Transient" also means lasting only for a short time, making it the direct synonym.',
  },
  {
    id: 5,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Rearrange the following parts to form a coherent sentence:\n(P) sustainable development goals\n(Q) imperative for universities\n(R) integrating green practices with\n(S) has become an educational',
    options: ['R - P - S - Q', 'S - Q - R - P', 'P - R - S - Q', 'R - Q - S - P'],
    correctOptionIndex: 0,
    explanation:
      'The logical flow is: "Integrating green practices with (R) sustainable development goals (P) has become an educational (S) imperative for universities (Q)". Hence, R - P - S - Q is the correct order.',
  },
  {
    id: 6,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Choose the option that correctly converts the given sentence into Passive Voice:\n"The philanthropic foundation provides merit-cum-means scholarships to eligible undergraduates."',
    options: [
      'Merit-cum-means scholarships are provided to eligible undergraduates by the philanthropic foundation.',
      'Merit-cum-means scholarships were provided to eligible undergraduates by the philanthropic foundation.',
      'Merit-cum-means scholarships have been provided to eligible undergraduates by the philanthropic foundation.',
      'Eligible undergraduates are being provided merit-cum-means scholarships by the philanthropic foundation.',
    ],
    correctOptionIndex: 0,
    explanation:
      'The original sentence is in the Simple Present tense ("provides"). In passive voice, Simple Present becomes "is/are + past participle (provided)". Thus: "Merit-cum-means scholarships are provided..." is correct.',
  },
  {
    id: 7,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Select the word which means: "A person who donates time, money, or resources to promote the welfare of others, especially by funding humanitarian projects."',
    options: ['Misanthrope', 'Philanthropist', 'Hedonist', 'Polyglot'],
    correctOptionIndex: 1,
    explanation:
      'A philanthropist is a person who seeks to promote the welfare of others, especially by the generous donation of money to good causes.',
  },
  {
    id: 8,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Identify the part of the sentence containing an error:\n"One of the primary reason (A) / why students fail (B) / is lack of persistent practice (C) / during preparation (D)."',
    options: ['Part (A)', 'Part (B)', 'Part (C)', 'Part (D)'],
    correctOptionIndex: 0,
    explanation:
      'The phrase "One of the..." is always followed by a plural noun. Hence, it must be "One of the primary reasons", not "reason". The error is in Part (A).',
  },
  {
    id: 9,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'What is the meaning of the idiom: "To burn the midnight oil"?',
    options: [
      'To waste valuable energy on futile arguments',
      'To study or work hard late into the night',
      'To ignite a conflict unexpectedly',
      'To economize on household expenses',
    ],
    correctOptionIndex: 1,
    explanation:
      '"To burn the midnight oil" originates from working by the light of an oil lamp late at night and means to work or study until late hours.',
  },
  {
    id: 10,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    passage:
      'Read the passage and answer the question:\n"Technological literacy has transitioned from a specialized workplace asset to a foundational prerequisite for participatory democracy. Modern computational tools empower decentralized innovation, allowing grassroots problem-solvers in developing nations to bypass conventional capital bottlenecks. However, without equitable infrastructural bandwidth and pedagogical modernization, digital ubiquity risks exacerbating pedagogical inequality rather than bridging it."',
    questionText: 'According to the passage, what is the prerequisite to prevent technology from widening educational disparity?',
    options: [
      'Banning non-governmental educational software',
      'Providing equitable infrastructure and modernizing pedagogical frameworks',
      'Relying entirely on conventional capital investments',
      'Restricting digital learning to technical universities only',
    ],
    correctOptionIndex: 1,
    explanation:
      'The passage states: "without equitable infrastructural bandwidth and pedagogical modernization, digital ubiquity risks exacerbating pedagogical inequality", implying that these two factors are necessary to avoid disparity.',
  },
  {
    id: 11,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Based on the passage in Question 10, the author implies that computational tools:',
    options: [
      'Inevitably cause socio-economic friction',
      'Allow grassroots innovators to circumvent conventional funding barriers',
      'Eliminate the need for foundational schooling',
      'Are beneficial only in developed economies',
    ],
    correctOptionIndex: 1,
    explanation:
      'The passage explicitly mentions that computational tools "allow grassroots problem-solvers in developing nations to bypass conventional capital bottlenecks."',
  },
  {
    id: 12,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Fill in the blank with the most appropriate idiom:\n"Despite rigorous cross-examination by the committee, the scholar _______ and explained every formula calmly."',
    options: [
      'kept her fingers crossed',
      'kept her composure',
      'spilled the beans',
      'burned the bridges',
    ],
    correctOptionIndex: 1,
    explanation:
      '"Kept her composure" means maintained calm, self-control and dignity under intense pressure, which fits the context of explaining calmly during cross-examination.',
  },
  {
    id: 13,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Find the correctly spelt word:',
    options: ['Accomodation', 'Accommodation', 'Acommodation', 'Accomadation'],
    correctOptionIndex: 1,
    explanation:
      'The correct spelling is "Accommodation" with double "c" and double "m".',
  },
  {
    id: 14,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Select the word that best fits the blank:\n"His argument was so _______ that even his staunchest critics were forced to acknowledge its validity."',
    options: ['specious', 'cogent', 'ambiguous', 'tenuous'],
    correctOptionIndex: 1,
    explanation:
      '"Cogent" means clear, logical, and convincing. "Specious" means superficially plausible but actually wrong, and "tenuous" means very weak or slight.',
  },
  {
    id: 15,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Identify the indirect speech for:\nShe said, "I have completed all the mock tests for the aptitude exam."',
    options: [
      'She said that she had completed all the mock tests for the aptitude exam.',
      'She said that she has completed all the mock tests for the aptitude exam.',
      'She said that I have completed all the mock tests for the aptitude exam.',
      'She says that she had completed all the mock tests for the aptitude exam.',
    ],
    correctOptionIndex: 0,
    explanation:
      'In reported speech with past reporting verb ("said"), Present Perfect ("have completed") changes to Past Perfect ("had completed"), and the pronoun "I" shifts to "she".',
  },
  {
    id: 16,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Choose the antonym for the word: MITIGATE',
    options: ['Alleviate', 'Aggravate', 'Moderate', 'Assuage'],
    correctOptionIndex: 1,
    explanation:
      'To mitigate means to make something less severe or painful. Its antonym is to aggravate (to make worse or more serious). Alleviate and assuage are synonyms.',
  },
  {
    id: 17,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Fill in the blank with the appropriate modal verb:\n"Scholars _______ submit their original bonafide certificate before the deadline; failure to do so will result in forfeiture of the grant."',
    options: ['must', 'might', 'could', 'may'],
    correctOptionIndex: 0,
    explanation:
      '"Must" indicates an obligatory and mandatory requirement where failure has strict consequences.',
  },
  {
    id: 18,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText: 'Select the pair that shows the same relationship as: SCRIPT : PLAY',
    options: [
      'Blueprint : Building',
      'Brush : Painting',
      'Score : Composer',
      'Actor : Stage',
    ],
    correctOptionIndex: 0,
    explanation:
      'A script is the detailed written plan from which a play is enacted. Similarly, a blueprint is the detailed design plan from which a building is constructed.',
  },
  {
    id: 19,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Complete the sentence with the correct conjunction:\n"_______ she faced severe financial hurdles, she secured top honors in her engineering cohort."',
    options: ['Although', 'Despite', 'Because', 'Since'],
    correctOptionIndex: 0,
    explanation:
      '"Although" introduces a subordinate clause expressing contrast ("Although she faced..."). "Despite" would require a noun phrase or gerund ("Despite facing...").',
  },
  {
    id: 20,
    section: 'verbal',
    sectionName: 'Verbal Ability',
    questionText:
      'Choose the most logical sentence to conclude the paragraph:\n"Educational institutions are integrating artificial intelligence into continuous assessment. Algorithmic feedback provides immediate insights to learners on their conceptual gaps."',
    options: [
      'Consequently, traditional textbooks will cease to exist immediately.',
      'As a result, timely interventions can be tailored to strengthen individual comprehension.',
      'Therefore, human teachers have become redundant in modern schooling.',
      'Nevertheless, examinations are universally abandoned by state boards.',
    ],
    correctOptionIndex: 1,
    explanation:
      'The conclusion logically builds upon "immediate insights to learners on conceptual gaps", leading to timely tailored interventions for comprehension.',
  },

  // =========================================================================
  // SECTION 2: ANALYTICAL & LOGICAL ABILITY (Questions 21 - 40)
  // =========================================================================
  {
    id: 21,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText: 'Find the missing number in the sequence: 4, 9, 25, 49, 121, 169, ?',
    options: ['225', '256', '289', '361'],
    correctOptionIndex: 2,
    explanation:
      'The sequence consists of squares of prime numbers: 2² = 4, 3² = 9, 5² = 25, 7² = 49, 11² = 121, 13² = 169. The next prime number is 17, and 17² = 289. (Note: 15 is not prime, so 225 is incorrect).',
  },
  {
    id: 22,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'In a certain code language, "RELIANCE" is coded as "SELMBOFD". How will "STUDENT" be coded in that same pattern?',
    options: ['TUVEFOU', 'TTVEDOU', 'TUVEEOU', 'TTUEFOU'],
    correctOptionIndex: 1,
    explanation:
      'Pattern analysis:\nR (+1) -> S\nE (0) -> E\nL (+1) -> M\nI (0) -> I (Wait: in RELIANCE -> R+1=S, E=E, L+1=M, I-1? Let\'s check: R(+1)=S, E(0)=E, L(+1)=M, I(-1)? Let us observe: alternating +1 and 0:\nS(+1)=T, T(0)=T, U(+1)=V, D(0)=E? If +1 on every alternate letter: S+1=T, T=T, U+1=V, D=E? S(+1)->T, T(0)->T, U(+1)->V, D(+1)->E, E(0)->D? Let\'s check: S+1=T, T+0=T, U+1=V, D+1=E, E-1=D, N+1=O, T+1=U -> TTVEDOU.',
  },
  {
    id: 23,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Pointing to a photograph of a gentleman, Ananya said, "His mother is the only daughter of my maternal grandfather." How is Ananya related to the gentleman in the photograph?',
    options: ['Mother', 'Sister', 'Aunt', 'Daughter'],
    correctOptionIndex: 1,
    explanation:
      'The only daughter of Ananya\'s maternal grandfather is Ananya\'s mother. Therefore, the gentleman\'s mother is Ananya\'s mother. Hence, Ananya is the sister of the gentleman.',
  },
  {
    id: 24,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Statements:\n1. All engineers are innovators.\n2. Some innovators are researchers.\n\nConclusions:\nI. Some engineers are researchers.\nII. Some innovators are engineers.\n\nWhich of the conclusions logically follows?',
    options: [
      'Only conclusion I follows',
      'Only conclusion II follows',
      'Both I and II follow',
      'Neither I nor II follows',
    ],
    correctOptionIndex: 1,
    explanation:
      'From "All engineers are innovators", it directly follows by conversion that "Some innovators are engineers" (Conclusion II is valid). However, we cannot deduce that engineers and researchers overlap from the given premises. Thus only II follows.',
  },
  {
    id: 25,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'A student walks 20 meters North, turns right and walks 30 meters, then turns right again and walks 35 meters. Then she turns left and walks 15 meters. Finally, she turns left and walks 15 meters. In which direction and how far is she from her starting point?',
    options: ['45 meters East', '45 meters West', '50 meters East', '35 meters South'],
    correctOptionIndex: 0,
    explanation:
      'Coordinate tracking:\nStart = (0, 0)\n20m North -> (0, 20)\nTurn right, 30m East -> (30, 20)\nTurn right, 35m South -> (30, 20 - 35) = (30, -15)\nTurn left, 15m East -> (30 + 15, -15) = (45, -15)\nTurn left, 15m North -> (45, -15 + 15) = (45, 0)\nEnd point is (45, 0), which is exactly 45 meters due East of origin.',
  },
  {
    id: 26,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Five friends — P, Q, R, S, and T — sit in a row facing North. S is between T and Q. Q is to the immediate left of R. P is to the immediate left of T. Who is sitting in the middle of the row?',
    options: ['P', 'T', 'S', 'Q'],
    correctOptionIndex: 2,
    explanation:
      'Analyzing positions:\nP is to the immediate left of T -> P, T\nS is between T and Q -> P, T, S, Q\nQ is to the immediate left of R -> P, T, S, Q, R\nThe five friends from left to right are P, T, S, Q, R. The person in the middle (3rd position) is S.',
  },
  {
    id: 27,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText: 'Find the odd one out among the following groups of letters: BDF, HJL, NPR, KMO, TVX',
    options: ['BDF', 'HJL', 'NPR', 'KMO'],
    correctOptionIndex: 3,
    explanation:
      'Let us examine alphabetical gaps:\nB(+2)=D(+2)=F (2, 4, 6)\nH(+2)=J(+2)=L (8, 10, 12)\nN(+2)=P(+2)=R (14, 16, 18)\nT(+2)=V(+2)=X (20, 22, 24)\nK(11), M(13), O(15) also has +2. Wait, let\'s check vowel presence: KMO contains two vowels (O), or if we look at letter parity, BDF, HJL, NPR, TVX are all even positions, while KMO has odd positions (11, 13, 15). KMO is the odd one out.',
  },
  {
    id: 28,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'If "+" means "×", "-" means "÷", "×" means "+", and "÷" means "-", then evaluate the expression:\n24 - 4 + 6 × 10 ÷ 5',
    options: ['41', '36', '45', '51'],
    correctOptionIndex: 0,
    explanation:
      'Substituting operator definitions:\n24 ÷ 4 × 6 + 10 - 5\nApplying BODMAS:\nDivision first: 24 ÷ 4 = 6\nMultiplication next: 6 × 6 = 36\nAddition: 36 + 10 = 46\nSubtraction: 46 - 5 = 41.',
  },
  {
    id: 29,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Statement: "The university should introduce mandatory internships in the curriculum to improve graduate employability."\nAssumptions:\nI. Practical industry exposure improves students\' readiness for professional roles.\nII. Most companies prefer hiring candidates who possess hands-on project experience.',
    options: [
      'Only assumption I is implicit',
      'Only assumption II is implicit',
      'Both assumptions I and II are implicit',
      'Neither I nor II is implicit',
    ],
    correctOptionIndex: 2,
    explanation:
      'Both assumptions logically underpin the recommendation. If internships didn\'t provide practical readiness (I) or if companies didn\'t value hands-on experience (II), introducing mandatory internships would not improve employability.',
  },
  {
    id: 30,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'In a college sports meet, Rohan ranked 11th from the top and 28th from the bottom among successful candidates. Three students did not participate and two students failed. How many total students were in the batch?',
    options: ['41', '42', '43', '44'],
    correctOptionIndex: 2,
    explanation:
      'Total successful candidates = (Top rank + Bottom rank - 1) = (11 + 28 - 1) = 38.\nTotal students in the batch = Successful (38) + Did not participate (3) + Failed (2) = 43.',
  },
  {
    id: 31,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText: 'Complete the letter series: AZ, BY, CX, DW, ?',
    options: ['EV', 'FU', 'EU', 'FV'],
    correctOptionIndex: 0,
    explanation:
      'The first letter increments (+1): A, B, C, D -> E.\nThe second letter decrements (-1): Z, Y, X, W -> V. Also, the letters are pairs whose alphabetical position sum is 27. E (5) + V (22) = 27. Hence, EV.',
  },
  {
    id: 32,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'A cube has six faces painted with different colors: Red, Blue, Green, Yellow, Orange, and White. Red is opposite Green. Blue is opposite Yellow. If Orange is on the top face, which color is on the bottom face?',
    options: ['Red', 'White', 'Blue', 'Yellow'],
    correctOptionIndex: 1,
    explanation:
      'Opposite pairs are:\nPair 1: Red - Green\nPair 2: Blue - Yellow\nThe remaining two faces must form the third opposite pair: Orange - White. Therefore, White is on the bottom face opposite Orange.',
  },
  {
    id: 33,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText: 'If 1st January 2024 was a Monday, what day of the week was 1st January 2025?',
    options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    correctOptionIndex: 1,
    explanation:
      '2024 is a leap year (366 days), having February 29th. A leap year has 366 mod 7 = 2 odd days. Moving from 1st Jan 2024 to 1st Jan 2025 advances the day by 2: Monday + 2 days = Wednesday.',
  },
  {
    id: 34,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Read the conditional rule: "If a student scores above 90% in class 12 AND family income is below ₹2.5 Lakh, they receive a 100% scholarship. If they score above 90% BUT family income is between ₹2.5 Lakh and ₹6 Lakh, they receive a 50% scholarship."\nCandidate Amit scored 94% in Class 12 and his annual family income is ₹3.8 Lakh. What is his scholarship entitlement?',
    options: ['100% scholarship', '50% scholarship', '25% scholarship', 'Not eligible'],
    correctOptionIndex: 1,
    explanation:
      'Amit scored 94% (above 90%) and his family income is ₹3.8 Lakh (which lies strictly between ₹2.5 Lakh and ₹6 Lakh). Hence, he fulfills the exact criterion for a 50% scholarship.',
  },
  {
    id: 35,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Which number replaces the question mark in the matrix?\n| 6 | 8 | 10 |\n| 9 | 12 | 15 |\n| 15 | 20 | ? |',
    options: ['22', '24', '25', '30'],
    correctOptionIndex: 2,
    explanation:
      'Looking at rows as Pythagorean triples or proportional ratios: 6 : 8 : 10 is 3 : 4 : 5. 9 : 12 : 15 is 3 : 4 : 5. Therefore the third row 15 : 20 : ? must also be in the ratio 3 : 4 : 5. Since 15 = 3 × 5 and 20 = 4 × 5, the missing number is 5 × 5 = 25.',
  },
  {
    id: 36,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Six candidates (A, B, C, D, E, F) appear for scholarship interviews. B was interviewed after A but before C. D was interviewed before E but after C. F was interviewed before A. Who was the last candidate interviewed?',
    options: ['C', 'D', 'E', 'F'],
    correctOptionIndex: 2,
    explanation:
      'Constructing chronological interview order:\n- F before A: F, A\n- B after A but before C: F, A, B, C\n- D before E but after C: F, A, B, C, D, E\nCandidate E was interviewed last.',
  },
  {
    id: 37,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'What angle is formed between the hour hand and minute hand of a clock at 3:40?',
    options: ['120°', '130°', '140°', '150°'],
    correctOptionIndex: 1,
    explanation:
      'Formula for angle: |30H - (11/2)M|\nHere H = 3, M = 40:\nAngle = |30(3) - (11/2)(40)| = |90 - 220| = |-130| = 130°.',
  },
  {
    id: 38,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'In a code, "MIND" is written as "KGLB" and "DIAGRAM" is written as "BGYEPYK". How is "STUDY" written in that code?',
    options: ['QRSCW', 'QRSBW', 'PRTCW', 'QRTCW'],
    correctOptionIndex: 0,
    explanation:
      'Each letter is shifted backward by 2 (-2):\nM(-2) = K, I(-2) = G, N(-2) = L, D(-2) = B.\nApplying -2 to STUDY:\nS(-2) = Q\nT(-2) = R\nU(-2) = S\nD(-2) = B? Wait: D(4) - 2 = B. U(21) - 2 = S. T(20) - 2 = R. S(19) - 2 = Q. Y(25) - 2 = W.\nSo Q, R, S, B, W -> option 1: QRSBW.',
  },
  {
    id: 39,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'If South-East becomes North, North-East becomes West, and all other directions change in the same manner, what will West become?',
    options: ['North-East', 'South-East', 'South-West', 'North-West'],
    correctOptionIndex: 1,
    explanation:
      'South-East (135°) becomes North (0° / 360°), which is a rotation of 135° counter-clockwise. Applying a 135° counter-clockwise rotation to West (270°): 270° - 135° = 135°, which corresponds to South-East.',
  },
  {
    id: 40,
    section: 'logical',
    sectionName: 'Analytical & Logical Ability',
    questionText:
      'Statement: Should high-speed fiber-optic internet be subsidized by the government for all registered rural colleges?\nArguments:\nI. Yes, digital disparity cannot be bridged unless affordable high-speed access is universal.\nII. No, rural colleges have other primary needs such as physical labs and libraries that deserve exclusive priority.',
    options: [
      'Only argument I is strong',
      'Only argument II is strong',
      'Both arguments I and II are strong',
      'Neither argument I nor II is strong',
    ],
    correctOptionIndex: 0,
    explanation:
      'Argument I presents a strong, constructive principle because digital learning and lab simulations require internet. Argument II creates a false dilemma (libraries and internet access are complementary, not mutually exclusive). Thus only I is strong.',
  },

  // =========================================================================
  // SECTION 3: NUMERICAL ABILITY (Questions 41 - 60)
  // =========================================================================
  {
    id: 41,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'A scholarship grant of ₹1,20,000 is distributed among three scholars A, B, and C in the ratio 3 : 4 : 5. How much more money does C receive than A?',
    options: ['₹10,000', '₹20,000', '₹30,000', '₹40,000'],
    correctOptionIndex: 1,
    explanation:
      'Sum of ratio parts = 3 + 4 + 5 = 12.\nValue of 1 part = 1,20,000 / 12 = ₹10,000.\nDifference between C and A = (5 - 3) = 2 parts.\n2 parts × ₹10,000 = ₹20,000.',
  },
  {
    id: 42,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'A student needs to score 40% marks to pass an examination. If she gets 178 marks and fails by 22 marks, what is the maximum aggregate marks of the exam?',
    options: ['400', '500', '600', '450'],
    correctOptionIndex: 1,
    explanation:
      'Pass marks needed = 178 + 22 = 200 marks.\nGiven 40% of Maximum Marks = 200.\nMaximum Marks = (200 / 40) × 100 = 500.',
  },
  {
    id: 43,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'If 12 computers cost ₹4,80,000, what will be the total cost of 18 such computers with an additional 5% bulk educational discount on the total amount?',
    options: ['₹6,84,000', '₹6,90,000', '₹7,20,000', '₹6,60,000'],
    correctOptionIndex: 0,
    explanation:
      'Cost per computer = 4,80,000 / 12 = ₹40,000.\nBase cost of 18 computers = 18 × 40,000 = ₹7,20,000.\n5% bulk discount = 0.05 × 7,20,000 = ₹36,000.\nDiscounted cost = 7,20,000 - 36,000 = ₹6,84,000.',
  },
  {
    id: 44,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'A train running at 72 km/h crosses a 250-meter long railway platform in 25 seconds. What is the length of the train in meters?',
    options: ['200 m', '250 m', '300 m', '150 m'],
    correctOptionIndex: 1,
    explanation:
      'Speed in m/s = 72 × (5/18) = 20 m/s.\nTotal distance covered in 25 seconds = Speed × Time = 20 × 25 = 500 meters.\nTotal distance = Length of train + Length of platform.\n500 = Length of train + 250 => Length of train = 250 meters.',
  },
  {
    id: 45,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'The average score of 24 students in an aptitude test was 65. If the professor\'s score of 90 is included, what becomes the new average score of the group?',
    options: ['65.5', '66', '66.5', '67'],
    correctOptionIndex: 1,
    explanation:
      'Sum of 24 students = 24 × 65 = 1,560.\nNew total with professor = 1,560 + 90 = 1,650.\nNew total number of individuals = 25.\nNew Average = 1,650 / 25 = 66.',
  },
  {
    id: 46,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'P can complete a research assignment in 15 days, and Q can complete the same assignment in 30 days. If they work together, how many days will they take to finish the assignment?',
    options: ['8 days', '10 days', '12 days', '9 days'],
    correctOptionIndex: 1,
    explanation:
      '1 day work of P = 1/15.\n1 day work of Q = 1/30.\nCombined 1 day work = 1/15 + 1/30 = 3/30 = 1/10.\nTogether, they complete the work in 10 days.',
  },
  {
    id: 47,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'What is the compound interest on a scholarship endowment of ₹50,000 for 2 years at 10% per annum, compounded annually?',
    options: ['₹10,000', '₹10,500', '₹11,000', '₹10,250'],
    correctOptionIndex: 1,
    explanation:
      'Amount = P(1 + r/100)ⁿ = 50,000 × (1.10)² = 50,000 × 1.21 = ₹60,500.\nCompound Interest = Amount - Principal = 60,500 - 50,000 = ₹10,500.',
  },
  {
    id: 48,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'The price of a technical handbook is first increased by 20% and then decreased by 20%. What is the net percentage change in the final price compared to the original price?',
    options: ['No change (0%)', '4% increase', '4% decrease', '2% decrease'],
    correctOptionIndex: 2,
    explanation:
      'Net percentage change formula: a + b + (ab/100).\nHere a = +20, b = -20.\nNet change = 20 - 20 + [20 × (-20) / 100] = 0 - 400/100 = -4% (a 4% decrease).',
  },
  {
    id: 49,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'The ratio of the ages of Priya and Sneha is 4 : 5. After 6 years, the ratio of their ages will become 5 : 6. What is Priya\'s present age?',
    options: ['20 years', '24 years', '25 years', '30 years'],
    correctOptionIndex: 1,
    explanation:
      'Let present ages be 4x and 5x.\nAfter 6 years: (4x + 6) / (5x + 6) = 5 / 6.\nCross-multiplying: 6(4x + 6) = 5(5x + 6)\n24x + 36 = 25x + 30\nx = 6.\nPriya\'s present age = 4x = 4 × 6 = 24 years.',
  },
  {
    id: 50,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'What is the greatest number that will divide 148, 246, and 623 leaving remainders 4, 6, and 11 respectively?',
    options: ['12', '16', '18', '24'],
    correctOptionIndex: 0,
    explanation:
      'The required number is HCF of:\n(148 - 4) = 144\n(246 - 6) = 240\n(623 - 11) = 612\n144 = 12 × 12\n240 = 12 × 20\n612 = 12 × 51\nThe highest common factor of 144, 240, and 612 is 12.',
  },
  {
    id: 51,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'In how many different ways can the letters of the word "ENGINEER" be arranged?',
    options: ['3,360', '10,080', '20,160', '40,320'],
    correctOptionIndex: 0,
    explanation:
      'Total letters in "ENGINEER" = 8.\nFrequencies: E = 3, N = 2, G = 1, I = 1, R = 1.\nNumber of permutations = 8! / (3! × 2!) = 40,320 / (6 × 2) = 40,320 / 12 = 3,360 ways.',
  },
  {
    id: 52,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'A shopkeeper sells a scientific calculator for ₹1,800 making a profit of 20%. If he had sold it for ₹1,650, what would have been his profit percentage?',
    options: ['8%', '10%', '12%', '15%'],
    correctOptionIndex: 1,
    explanation:
      'Cost Price (CP) = Selling Price / (1 + Profit%) = 1,800 / 1.20 = ₹1,500.\nAt new Selling Price ₹1,650: Profit = 1,650 - 1,500 = ₹150.\nProfit percentage = (150 / 1,500) × 100 = 10%.',
  },
  {
    id: 53,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'Two pipes A and B can fill a cistern in 20 minutes and 30 minutes respectively. If both pipes are opened simultaneously, how long will they take to fill the empty cistern?',
    options: ['10 minutes', '12 minutes', '15 minutes', '18 minutes'],
    correctOptionIndex: 1,
    explanation:
      'Part filled in 1 min = (1/20 + 1/30) = (3 + 2)/60 = 5/60 = 1/12.\nTherefore, both pipes together fill the cistern in 12 minutes.',
  },
  {
    id: 54,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'A sum of money doubles itself in 8 years at simple interest. What is the rate of interest per annum?',
    options: ['10%', '12.5%', '15%', '16.67%'],
    correctOptionIndex: 1,
    explanation:
      'Let Principal = P. Amount = 2P, so Simple Interest SI = P.\nSI = (P × R × T) / 100\nP = (P × R × 8) / 100\nR = 100 / 8 = 12.5% per annum.',
  },
  {
    id: 55,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'If the perimeter of a semi-circular park is 72 meters, what is its radius? (Use π = 22/7)',
    options: ['7 meters', '14 meters', '21 meters', '28 meters'],
    correctOptionIndex: 1,
    explanation:
      'Perimeter of semi-circle = πr + 2r = r(π + 2).\nr(22/7 + 2) = 72\nr(36/7) = 72\nr = (72 × 7) / 36 = 14 meters.',
  },
  {
    id: 56,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'Two dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on the two dice is a prime number?',
    options: ['5/12', '7/18', '15/36', '1/2'],
    correctOptionIndex: 0,
    explanation:
      'Total outcomes = 6 × 6 = 36.\nPossible prime sums: 2, 3, 5, 7, 11.\n- Sum = 2: (1,1) -> 1\n- Sum = 3: (1,2), (2,1) -> 2\n- Sum = 5: (1,4), (2,3), (3,2), (4,1) -> 4\n- Sum = 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) -> 6\n- Sum = 11: (5,6), (6,5) -> 2\nTotal favorable outcomes = 1 + 2 + 4 + 6 + 2 = 15.\nProbability = 15/36 = 5/12.',
  },
  {
    id: 57,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'A motorist travels from Town A to Town B at an average speed of 60 km/h and returns along the same route at 40 km/h. What is the average speed for the entire journey?',
    options: ['48 km/h', '50 km/h', '52 km/h', '45 km/h'],
    correctOptionIndex: 0,
    explanation:
      'Average speed for equal distances = 2xy / (x + y)\n= 2 × 60 × 40 / (60 + 40) = 4,800 / 100 = 48 km/h.',
  },
  {
    id: 58,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'Solve for x in the exponential equation: 2^(x + 2) × 2^x = 64',
    options: ['1', '2', '3', '4'],
    correctOptionIndex: 1,
    explanation:
      'Using the exponent product rule aᵐ × aⁿ = a^(m + n):\n2^((x + 2) + x) = 64\n2^(2x + 2) = 2^6\nSince the bases are equal, equate the exponents:\n2x + 2 = 6\n2x = 4\nx = 2.',
  },
  {
    id: 59,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'In a college library, the ratio of science books to literature books was 5 : 3. When 60 new literature books were added, the ratio became 5 : 4. What was the original total number of books in both categories?',
    options: ['400', '480', '520', '600'],
    correctOptionIndex: 1,
    explanation:
      'Let science books = 5x and literature books = 3x.\nAfter adding 60 literature books:\n5x / (3x + 60) = 5 / 4\n5x × 4 = 5(3x + 60)\n20x = 15x + 300\n5x = 300 => x = 60.\nOriginal science books = 5(60) = 300.\nOriginal literature books = 3(60) = 180.\nOriginal total books = 300 + 180 = 480.',
  },
  {
    id: 60,
    section: 'numerical',
    sectionName: 'Numerical Ability',
    questionText:
      'If the standard deviation of a dataset of test scores is 4.5, and every student\'s score is increased by 5 bonus marks, what will be the new standard deviation of the dataset?',
    options: ['4.5', '9.5', '22.5', '0'],
    correctOptionIndex: 0,
    explanation:
      'Standard deviation is a measure of dispersion and is independent of changes in origin (addition or subtraction of a constant). Adding 5 to each score shifts the entire distribution without altering the spread. Hence, the new standard deviation remains exactly 4.5.',
  },
];
