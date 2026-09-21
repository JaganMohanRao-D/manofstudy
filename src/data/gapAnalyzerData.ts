export type SkillLevel = 'none' | 'beginner' | 'basic' | 'intermediate' | 'advanced';

export type CareerDirection =
  | 'industry'
  | 'entrepreneur'
  | 'higher-studies'
  | 'government'
  | 'not-sure';

export interface GapSkill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  skillId: string;
  options: { label: string; level: SkillLevel }[];
}

export interface CareerProfile {
  id: string;
  branchId: string;
  direction: Exclude<CareerDirection, 'not-sure'>;
  title: string;
  shortDescription: string;
  skills: { skillId: string; target: SkillLevel; weight: number; why: string; next: string }[];
  questions: AssessmentQuestion[];
  projects: string[];
}

export interface BranchProfile {
  id: string;
  name: string;
  description: string;
  careers: string[];
  domainSkills: GapSkill[];
}

const S = (id: string, name: string, category: string, description: string): GapSkill =>
  ({ id, name, category, description });

export const BRANCHES: BranchProfile[] = [
  {
    id: 'cse',
    name: 'Computer Science / IT',
    description: 'Software, data, systems, security and computing careers.',
    careers: ['cse-software', 'cse-data', 'cse-cyber'],
    domainSkills: [
      S('programming', 'Programming Fundamentals', 'Core', 'Variables, control flow, functions and clean problem solving.'),
      S('dsa', 'Data Structures & Algorithms', 'Core', 'Arrays, strings, recursion, searching, sorting and complexity.'),
      S('dbms', 'Databases / SQL', 'Core', 'Data modelling, queries, joins and practical database use.'),
      S('git', 'Git & GitHub', 'Tools', 'Version control, repositories, branches and documentation.'),
      S('web', 'Web Development', 'Software', 'HTML, CSS, JavaScript and basic web application concepts.'),
      S('python', 'Python', 'Data', 'Practical Python for automation, data and application work.'),
      S('networks', 'Computer Networks', 'Systems', 'TCP/IP, HTTP, DNS and basic network troubleshooting.'),
      S('linux', 'Linux / OS', 'Systems', 'Processes, files, permissions and command-line fundamentals.'),
    ],
  },
  {
    id: 'ece',
    name: 'Electronics & Communication',
    description: 'Embedded systems, electronics, VLSI, communications and IoT.',
    careers: ['ece-embedded', 'ece-vlsi', 'ece-iot'],
    domainSkills: [
      S('c_embedded', 'C / Embedded C', 'Core', 'Low-level programming, memory, pointers and microcontroller code.'),
      S('digital', 'Digital Electronics', 'Core', 'Logic gates, combinational/sequential circuits and digital design.'),
      S('microcontrollers', 'Microcontrollers', 'Embedded', 'MCUs, peripherals, timers, interrupts and interfacing.'),
      S('circuits', 'Electronic Circuits', 'Hardware', 'Analog/digital circuit analysis and practical measurement.'),
      S('communication', 'Communication Systems', 'Communication', 'Signals, modulation and basic communication concepts.'),
      S('verilog', 'Verilog / HDL', 'VLSI', 'RTL design, simulation and hardware description.'),
      S('pcb', 'PCB Design', 'Hardware', 'Schematics, footprints, routing and board-level thinking.'),
      S('iot', 'IoT Systems', 'Embedded', 'Sensors, connectivity, data collection and device integration.'),
    ],
  },
  {
    id: 'eee',
    name: 'Electrical & Electronics',
    description: 'Power, machines, control, automation, electrical systems and EVs.',
    careers: ['eee-power', 'eee-automation', 'eee-ev'],
    domainSkills: [
      S('electrical-circuits', 'Electrical Circuits', 'Core', 'Circuit laws, network analysis and practical measurements.'),
      S('machines', 'Electrical Machines', 'Core', 'Transformers, motors, generators and operating principles.'),
      S('power-systems', 'Power Systems', 'Power', 'Generation, transmission, distribution and protection basics.'),
      S('control', 'Control Systems', 'Automation', 'Feedback, transfer functions and controller concepts.'),
      S('plc', 'PLC / Industrial Automation', 'Automation', 'Industrial control logic, sensors and actuators.'),
      S('power-electronics', 'Power Electronics', 'Power', 'Converters, inverters, switching devices and drives.'),
      S('matlab', 'MATLAB / Simulation', 'Tools', 'Engineering modelling, plots and simulation workflows.'),
      S('ev', 'EV Electrical Systems', 'EV', 'Battery, motor drive, charging and vehicle electrical architecture.'),
    ],
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    description: 'Design, manufacturing, thermal systems, automation and robotics.',
    careers: ['mech-design', 'mech-manufacturing', 'mech-robotics'],
    domainSkills: [
      S('cad', 'CAD / 3D Modelling', 'Design', 'Engineering drawings, parts, assemblies and modelling workflows.'),
      S('mechanics', 'Engineering Mechanics', 'Core', 'Forces, motion, equilibrium and mechanical reasoning.'),
      S('materials', 'Materials & Manufacturing', 'Manufacturing', 'Material selection and common manufacturing processes.'),
      S('thermo', 'Thermodynamics / Heat', 'Thermal', 'Energy, heat transfer and thermal-system fundamentals.'),
      S('manufacturing', 'Manufacturing Processes', 'Manufacturing', 'Machining, forming, casting and production concepts.'),
      S('cae', 'CAE / Simulation', 'Design', 'Engineering simulation, meshing and interpreting results.'),
      S('automation', 'Automation', 'Robotics', 'Sensors, actuators and automated production systems.'),
      S('robotics-mech', 'Robotics Fundamentals', 'Robotics', 'Kinematics, mechanisms and robot-system basics.'),
    ],
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    description: 'Structures, construction, infrastructure, surveying and environmental work.',
    careers: ['civil-structures', 'civil-construction', 'civil-infra'],
    domainSkills: [
      S('structural', 'Structural Analysis', 'Structures', 'Loads, reactions, internal forces and structural behaviour.'),
      S('concrete', 'Concrete / RCC', 'Structures', 'Concrete properties, reinforcement and RCC design concepts.'),
      S('surveying', 'Surveying', 'Field', 'Measurements, levelling, coordinates and field data.'),
      S('autocad-civil', 'AutoCAD / Civil 3D', 'Design', 'Technical drawings, plans and civil design workflows.'),
      S('geotech', 'Geotechnical Engineering', 'Core', 'Soils, foundations and site investigation fundamentals.'),
      S('construction', 'Construction Management', 'Construction', 'Planning, estimation, scheduling and site coordination.'),
      S('quantity', 'Quantity / Estimation', 'Construction', 'BOQ, measurement, costing and tender basics.'),
      S('gis', 'GIS / Spatial Data', 'Infrastructure', 'Maps, spatial analysis and infrastructure planning.'),
    ],
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    description: 'Process design, plant operations, safety, materials and process control.',
    careers: ['chem-process', 'chem-plant', 'chem-safety'],
    domainSkills: [
      S('mass-energy', 'Mass & Energy Balances', 'Core', 'Material balances, energy balances and process reasoning.'),
      S('thermo-chem', 'Chemical Thermodynamics', 'Core', 'Phase behaviour, energy and equilibrium concepts.'),
      S('transport', 'Transport Phenomena', 'Core', 'Momentum, heat and mass transfer fundamentals.'),
      S('process-design', 'Process Design', 'Design', 'Flowsheets, equipment selection and process calculations.'),
      S('process-control', 'Process Control', 'Automation', 'Sensors, control loops and plant-control concepts.'),
      S('safety', 'Process Safety', 'Safety', 'Hazard identification, risk and safe plant operation.'),
      S('simulation', 'Process Simulation', 'Tools', 'Modelling processes with simulation software and interpreting results.'),
      S('plant', 'Plant Operations', 'Operations', 'Equipment, utilities, troubleshooting and production thinking.'),
    ],
  },
  {
    id: 'mechatronics',
    name: 'Mechatronics / Robotics',
    description: 'Mechanical systems combined with electronics, control and robotics.',
    careers: ['mecha-robotics', 'mecha-automation', 'mecha-controls'],
    domainSkills: [
      S('mecha-mechanics', 'Mechanical Systems', 'Core', 'Mechanisms, motion, forces and machine elements.'),
      S('mecha-electronics', 'Electronics', 'Core', 'Sensors, circuits and actuator interfaces.'),
      S('mecha-c', 'C / C++', 'Programming', 'Programming for controllers and robotic systems.'),
      S('control-mecha', 'Control Systems', 'Control', 'Feedback, stability and controller fundamentals.'),
      S('plc-mecha', 'PLC / Automation', 'Automation', 'Industrial automation logic and machine control.'),
      S('robotics', 'Robotics', 'Robotics', 'Kinematics, robot programming and integration.'),
      S('cad-mecha', 'CAD / Design', 'Design', 'Mechanical design and system integration.'),
      S('sensors', 'Sensors & Actuators', 'Hardware', 'Measurement, actuation and hardware interfacing.'),
    ],
  },
];

const Q = (id: string, question: string, skillId: string): AssessmentQuestion => ({
  id,
  question,
  skillId,
  options: [
    { label: 'I have not learned this yet', level: 'none' },
    { label: 'I know the basics', level: 'basic' },
    { label: 'I can use it in a small project', level: 'intermediate' },
    { label: 'I can solve practical problems independently', level: 'advanced' },
  ],
});

export const CAREERS: CareerProfile[] = [
  {
    id: 'cse-software', branchId: 'cse', direction: 'industry', title: 'Software Developer',
    shortDescription: 'Build and maintain software applications, APIs and user-facing products.',
    skills: [
      { skillId: 'programming', target: 'intermediate', weight: 3, why: 'Programming is the foundation of application development.', next: 'Build small programs without copying complete solutions.' },
      { skillId: 'dsa', target: 'basic', weight: 2, why: 'Problem solving and data structures support technical interviews and efficient code.', next: 'Practice arrays, strings, sorting and basic complexity.' },
      { skillId: 'git', target: 'basic', weight: 2, why: 'Version control is part of normal software teamwork.', next: 'Maintain one clean GitHub repository with meaningful commits.' },
      { skillId: 'dbms', target: 'basic', weight: 2, why: 'Many applications store and query structured data.', next: 'Build a small app that uses CRUD and a relational database.' },
      { skillId: 'web', target: 'basic', weight: 1, why: 'Web knowledge is useful for a large share of entry-level software roles.', next: 'Build and deploy one responsive web project.' },
    ],
    questions: [Q('cs1','Can you write a small program from a blank file and debug it yourself?','programming'), Q('cs2','Can you explain why one simple solution is faster than another?','dsa'), Q('cs3','Can you create a repository, commit changes and explain your README?','git'), Q('cs4','Can you write a basic SELECT/JOIN query?','dbms'), Q('cs5','Can you build a simple responsive page and connect it to data?','web')],
    projects: ['A useful end-to-end web or application project', 'A smaller problem-solving project with a clear README'],
  },
  {
    id: 'cse-data', branchId: 'cse', direction: 'industry', title: 'Data / AI Engineer',
    shortDescription: 'Work with data pipelines, analysis, machine learning and data-driven products.',
    skills: [
      { skillId: 'python', target: 'intermediate', weight: 3, why: 'Python is widely used for data work and automation.', next: 'Analyse a real dataset and explain every transformation.' },
      { skillId: 'dbms', target: 'basic', weight: 2, why: 'Data roles depend on reliable querying and data modelling.', next: 'Write practical SQL queries against a small database.' },
      { skillId: 'programming', target: 'basic', weight: 2, why: 'Programming is needed to turn analysis into repeatable workflows.', next: 'Automate one data-cleaning workflow.' },
      { skillId: 'dsa', target: 'basic', weight: 1, why: 'Core problem solving helps with coding and technical interviews.', next: 'Practice basic data structures and complexity.' },
    ],
    questions: [Q('cd1','Can you load, clean and transform a dataset using code?','python'), Q('cd2','Can you explain a SQL JOIN with a practical example?','dbms'), Q('cd3','Can you turn a repeated data task into a script?','programming'), Q('cd4','Can you reason about time/space trade-offs in a simple algorithm?','dsa')],
    projects: ['Data analysis project with a reproducible notebook', 'Small ML/data application with documented limitations'],
  },
  {
    id: 'cse-cyber', branchId: 'cse', direction: 'industry', title: 'Cybersecurity Analyst',
    shortDescription: 'Help protect systems, networks and applications through defensive security work.',
    skills: [
      { skillId: 'networks', target: 'intermediate', weight: 3, why: 'Defensive security depends on understanding how systems communicate.', next: 'Learn TCP/IP, DNS, HTTP and basic packet analysis.' },
      { skillId: 'linux', target: 'basic', weight: 2, why: 'Many security tools and systems rely on Linux concepts.', next: 'Practice files, permissions, processes and shell basics.' },
      { skillId: 'programming', target: 'basic', weight: 1, why: 'Scripting helps automate analysis and repetitive defensive tasks.', next: 'Write small safe log-processing scripts.' },
      { skillId: 'problem_solving', target: 'intermediate', weight: 2, why: 'Security work requires structured investigation and evidence-based reasoning.', next: 'Work through defensive incident-analysis exercises.' },
    ],
    questions: [Q('cc1','Can you explain DNS, HTTP and TCP at a basic level?','networks'), Q('cc2','Can you navigate Linux files, permissions and processes?','linux'), Q('cc3','Can you automate a small repetitive task with code?','programming'), Q('cc4','Can you investigate a technical problem step-by-step from evidence?','problem_solving')],
    projects: ['Defensive log-analysis project', 'Network fundamentals lab with a written security report'],
  },
  {
    id: 'ece-embedded', branchId: 'ece', direction: 'industry', title: 'Embedded Systems Engineer',
    shortDescription: 'Develop firmware and hardware-software interfaces for electronic devices.',
    skills: [
      { skillId: 'c_embedded', target: 'intermediate', weight: 3, why: 'Embedded firmware commonly depends on low-level C programming.', next: 'Write small C programs using pointers, structs and hardware-style state logic.' },
      { skillId: 'microcontrollers', target: 'intermediate', weight: 3, why: 'MCU peripherals and interrupts are central to embedded work.', next: 'Build a sensor or actuator project on a microcontroller.' },
      { skillId: 'digital', target: 'basic', weight: 2, why: 'Digital logic supports hardware reasoning and debugging.', next: 'Revise logic, registers and timing fundamentals.' },
      { skillId: 'circuits', target: 'basic', weight: 1, why: 'Firmware engineers need to understand the circuits they interface with.', next: 'Practise reading simple schematics and measurements.' },
    ],
    questions: [Q('ee1','Can you write and debug C using pointers and structs?','c_embedded'), Q('ee2','Can you configure or explain a microcontroller peripheral?','microcontrollers'), Q('ee3','Can you simplify a digital logic problem?','digital'), Q('ee4','Can you read a simple circuit diagram and identify key components?','circuits')],
    projects: ['Microcontroller sensor/actuator project', 'Firmware project with a clear hardware and software explanation'],
  },
  {
    id: 'ece-vlsi', branchId: 'ece', direction: 'industry', title: 'VLSI / RTL Engineer',
    shortDescription: 'Design and verify digital hardware using HDL and digital design principles.',
    skills: [
      { skillId: 'digital', target: 'intermediate', weight: 3, why: 'Digital design is the conceptual foundation of RTL work.', next: 'Design and explain sequential and combinational circuits.' },
      { skillId: 'verilog', target: 'intermediate', weight: 3, why: 'HDL is used to describe and simulate digital hardware.', next: 'Write small RTL modules and testbenches.' },
      { skillId: 'circuits', target: 'basic', weight: 1, why: 'Circuit awareness helps connect RTL to hardware behaviour.', next: 'Strengthen timing and basic electronics concepts.' },
    ],
    questions: [Q('ev1','Can you design a simple finite-state machine?','digital'), Q('ev2','Can you write a Verilog module and basic testbench?','verilog'), Q('ev3','Can you reason about timing or signal behaviour?','circuits')],
    projects: ['RTL module + testbench project', 'Small digital design portfolio with simulations'],
  },
  {
    id: 'ece-iot', branchId: 'ece', direction: 'industry', title: 'IoT Systems Engineer',
    shortDescription: 'Connect sensors, embedded devices and software into practical IoT systems.',
    skills: [
      { skillId: 'microcontrollers', target: 'intermediate', weight: 3, why: 'Devices need reliable firmware and peripheral control.', next: 'Build a sensor-to-controller prototype.' },
      { skillId: 'iot', target: 'intermediate', weight: 3, why: 'IoT roles combine sensing, connectivity and data flow.', next: 'Build a small connected device and document the data path.' },
      { skillId: 'c_embedded', target: 'basic', weight: 2, why: 'Embedded code is common at the device layer.', next: 'Practise embedded C fundamentals.' },
      { skillId: 'pcb', target: 'basic', weight: 1, why: 'Board-level understanding helps when moving beyond prototypes.', next: 'Learn schematic and PCB basics.' },
    ],
    questions: [Q('ei1','Can you interface a sensor with a microcontroller?','microcontrollers'), Q('ei2','Can you explain the path from sensor data to a connected service?','iot'), Q('ei3','Can you write basic embedded C?','c_embedded'), Q('ei4','Can you read a simple PCB/schematic design?','pcb')],
    projects: ['Connected sensor prototype', 'IoT dashboard with documented device-data flow'],
  },
  {
    id: 'eee-power', branchId: 'eee', direction: 'industry', title: 'Power Systems Engineer',
    shortDescription: 'Work with generation, transmission, distribution, protection and electrical infrastructure.',
    skills: [
      { skillId: 'electrical-circuits', target: 'intermediate', weight: 2, why: 'Circuit analysis supports wider electrical-system reasoning.', next: 'Solve network-analysis problems and validate with simulation.' },
      { skillId: 'machines', target: 'intermediate', weight: 3, why: 'Machines are central to power generation and utilisation.', next: 'Strengthen transformer and machine fundamentals.' },
      { skillId: 'power-systems', target: 'intermediate', weight: 3, why: 'Power-system knowledge is core to grid-focused roles.', next: 'Study load flow, protection and distribution basics.' },
      { skillId: 'matlab', target: 'basic', weight: 1, why: 'Simulation helps test engineering assumptions.', next: 'Model a small electrical system in MATLAB or equivalent software.' },
    ],
    questions: [Q('ep1','Can you solve a basic electrical network problem?','electrical-circuits'), Q('ep2','Can you explain transformer/motor operating principles?','machines'), Q('ep3','Can you explain how electricity moves from generation to consumers?','power-systems'), Q('ep4','Can you create a simple engineering simulation?','matlab')],
    projects: ['Power-system simulation study', 'Electrical machine or protection case study'],
  },
  {
    id: 'eee-automation', branchId: 'eee', direction: 'industry', title: 'Industrial Automation Engineer',
    shortDescription: 'Integrate sensors, controllers, PLCs and industrial processes.',
    skills: [
      { skillId: 'control', target: 'intermediate', weight: 3, why: 'Automation depends on feedback and control concepts.', next: 'Model simple feedback systems and explain controller behaviour.' },
      { skillId: 'plc', target: 'intermediate', weight: 3, why: 'PLCs are widely used for industrial machine control.', next: 'Create small ladder-logic exercises.' },
      { skillId: 'electrical-circuits', target: 'basic', weight: 1, why: 'Electrical fundamentals help diagnose automation hardware.', next: 'Revise sensors, relays and basic circuits.' },
    ],
    questions: [Q('ea1','Can you explain feedback and closed-loop control?','control'), Q('ea2','Can you create basic PLC logic?','plc'), Q('ea3','Can you troubleshoot a simple electrical control circuit?','electrical-circuits')],
    projects: ['PLC-controlled process simulation', 'Sensor-actuator automation prototype'],
  },
  {
    id: 'eee-ev', branchId: 'eee', direction: 'industry', title: 'EV Electrical Systems Engineer',
    shortDescription: 'Work on batteries, motor drives, charging and vehicle electrical systems.',
    skills: [
      { skillId: 'power-electronics', target: 'intermediate', weight: 3, why: 'Power converters and drives are fundamental to EV systems.', next: 'Study converters, inverters and switching devices.' },
      { skillId: 'ev', target: 'intermediate', weight: 3, why: 'EV architecture combines battery, motor and charging systems.', next: 'Map a basic EV electrical architecture.' },
      { skillId: 'control', target: 'basic', weight: 1, why: 'Motor and energy systems use control techniques.', next: 'Revise feedback and basic motor-control concepts.' },
    ],
    questions: [Q('eev1','Can you explain how an inverter supports an electric motor?','power-electronics'), Q('eev2','Can you describe the main electrical blocks in an EV?','ev'), Q('eev3','Can you explain a simple feedback loop?','control')],
    projects: ['EV subsystem simulation', 'Battery/charging or motor-drive study project'],
  },
  {
    id: 'mech-design', branchId: 'mechanical', direction: 'industry', title: 'Mechanical Design Engineer',
    shortDescription: 'Design parts and assemblies and communicate engineering intent through CAD and analysis.',
    skills: [
      { skillId: 'cad', target: 'intermediate', weight: 3, why: 'CAD is a primary tool for mechanical design work.', next: 'Model parts, assemblies and drawings with design intent.' },
      { skillId: 'mechanics', target: 'intermediate', weight: 2, why: 'Design decisions depend on mechanics and loads.', next: 'Strengthen force, motion and stress fundamentals.' },
      { skillId: 'materials', target: 'basic', weight: 1, why: 'Material choice affects performance, cost and manufacturability.', next: 'Compare common engineering materials for real parts.' },
      { skillId: 'cae', target: 'basic', weight: 2, why: 'Simulation can validate design assumptions.', next: 'Run and interpret one basic structural/thermal simulation.' },
    ],
    questions: [Q('md1','Can you model a part and assembly in CAD without following a step-by-step video?','cad'), Q('md2','Can you reason about loads and motion on a component?','mechanics'), Q('md3','Can you justify a material choice for a simple part?','materials'), Q('md4','Can you interpret a basic CAE result rather than only generate it?','cae')],
    projects: ['Designed part + manufacturing drawing', 'Small assembly with a documented design decision'],
  },
  {
    id: 'mech-manufacturing', branchId: 'mechanical', direction: 'industry', title: 'Manufacturing / Production Engineer',
    shortDescription: 'Improve production processes, quality, tooling and manufacturing operations.',
    skills: [
      { skillId: 'manufacturing', target: 'intermediate', weight: 3, why: 'Manufacturing knowledge is the basis of production engineering.', next: 'Study process selection, tolerances and production trade-offs.' },
      { skillId: 'materials', target: 'basic', weight: 2, why: 'Materials influence process choice and product quality.', next: 'Compare materials against manufacturing requirements.' },
      { skillId: 'cad', target: 'basic', weight: 1, why: 'Drawings and models communicate production requirements.', next: 'Practise engineering drawings and tolerances.' },
    ],
    questions: [Q('mm1','Can you choose a suitable manufacturing process for a simple part?','manufacturing'), Q('mm2','Can you explain why material choice changes manufacturing decisions?','materials'), Q('mm3','Can you read or create a basic engineering drawing?','cad')],
    projects: ['Manufacturing process study', 'Quality/production improvement case study'],
  },
  {
    id: 'mech-robotics', branchId: 'mechanical', direction: 'industry', title: 'Robotics / Automation Engineer',
    shortDescription: 'Combine mechanisms, automation and robotic systems for physical tasks.',
    skills: [
      { skillId: 'robotics-mech', target: 'intermediate', weight: 3, why: 'Robotics requires mechanical understanding of motion and mechanisms.', next: 'Study kinematics and build a small robotic mechanism.' },
      { skillId: 'automation', target: 'intermediate', weight: 3, why: 'Automation connects machines, sensors and control logic.', next: 'Build a sensor-actuator automation prototype.' },
      { skillId: 'cad', target: 'basic', weight: 1, why: 'Robotic mechanisms often start with mechanical design.', next: 'Model the mechanism in CAD.' },
    ],
    questions: [Q('mr1','Can you reason about a robot joint or mechanism moving through space?','robotics-mech'), Q('mr2','Can you connect a sensor to an actuator through control logic?','automation'), Q('mr3','Can you model a simple robot mechanism in CAD?','cad')],
    projects: ['Small robotic mechanism', 'Sensor-driven automation prototype'],
  },
  {
    id: 'civil-structures', branchId: 'civil', direction: 'industry', title: 'Structural Engineer',
    shortDescription: 'Analyse and design structures with attention to loads, materials and safety.',
    skills: [
      { skillId: 'structural', target: 'intermediate', weight: 3, why: 'Structural analysis is central to structural engineering.', next: 'Practise load paths, reactions and member behaviour.' },
      { skillId: 'concrete', target: 'intermediate', weight: 2, why: 'RCC/concrete knowledge is widely used in building structures.', next: 'Study reinforcement and basic RCC design concepts.' },
      { skillId: 'autocad-civil', target: 'basic', weight: 1, why: 'Drawings communicate structural design intent.', next: 'Create and read basic structural drawings.' },
    ],
    questions: [Q('cs1','Can you trace loads through a simple structure?','structural'), Q('cs2','Can you explain basic RCC reinforcement decisions?','concrete'), Q('cs3','Can you create or interpret a basic structural drawing?','autocad-civil')],
    projects: ['Small structural analysis/design case study', 'Drawing set for a simple structural element'],
  },
  {
    id: 'civil-construction', branchId: 'civil', direction: 'industry', title: 'Construction / Project Engineer',
    shortDescription: 'Plan and coordinate construction work, resources, schedules and site execution.',
    skills: [
      { skillId: 'construction', target: 'intermediate', weight: 3, why: 'Project engineers coordinate technical and execution activities.', next: 'Create a simple project schedule and resource plan.' },
      { skillId: 'quantity', target: 'basic', weight: 2, why: 'Estimation and measurement are important for project control.', next: 'Practise BOQ and quantity calculations.' },
      { skillId: 'surveying', target: 'basic', weight: 1, why: 'Site work relies on accurate measurement and layout.', next: 'Strengthen levelling and coordinate basics.' },
    ],
    questions: [Q('ccn1','Can you break a construction activity into a practical sequence?','construction'), Q('ccn2','Can you prepare a simple BOQ/quantity estimate?','quantity'), Q('ccn3','Can you explain basic site measurement or levelling?','surveying')],
    projects: ['Construction schedule + BOQ case study', 'Site-planning mini project'],
  },
  {
    id: 'civil-infra', branchId: 'civil', direction: 'industry', title: 'Infrastructure / Urban Planning Analyst',
    shortDescription: 'Use engineering and spatial information for infrastructure planning and public systems.',
    skills: [
      { skillId: 'gis', target: 'intermediate', weight: 3, why: 'Spatial data is useful for infrastructure and planning decisions.', next: 'Create a simple GIS map and explain the decision it supports.' },
      { skillId: 'surveying', target: 'basic', weight: 2, why: 'Spatial work depends on measurement and coordinate fundamentals.', next: 'Practise basic surveying and coordinate concepts.' },
      { skillId: 'autocad-civil', target: 'basic', weight: 1, why: 'Technical drawings help communicate infrastructure layouts.', next: 'Practise basic civil CAD drawings.' },
    ],
    questions: [Q('ci1','Can you create a basic map from spatial data?','gis'), Q('ci2','Can you explain coordinates and basic surveying measurements?','surveying'), Q('ci3','Can you communicate an infrastructure layout in CAD?','autocad-civil')],
    projects: ['GIS-based local infrastructure study', 'Small site/infrastructure planning case study'],
  },
  {
    id: 'chem-process', branchId: 'chemical', direction: 'industry', title: 'Process Engineer',
    shortDescription: 'Analyse and improve industrial chemical processes and process flows.',
    skills: [
      { skillId: 'mass-energy', target: 'intermediate', weight: 3, why: 'Mass and energy balances are fundamental process-engineering tools.', next: 'Solve and explain balances for simple process units.' },
      { skillId: 'process-design', target: 'intermediate', weight: 3, why: 'Process design turns fundamentals into plant-level decisions.', next: 'Read and build simple process flowsheets.' },
      { skillId: 'simulation', target: 'basic', weight: 1, why: 'Simulation helps test process assumptions.', next: 'Model a simple process and interpret the result.' },
    ],
    questions: [Q('cp1','Can you set up a basic material balance from a process description?','mass-energy'), Q('cp2','Can you read a simple process flowsheet?','process-design'), Q('cp3','Can you interpret a basic process simulation?','simulation')],
    projects: ['Process flow and balance case study', 'Small process simulation study'],
  },
  {
    id: 'chem-plant', branchId: 'chemical', direction: 'industry', title: 'Plant / Operations Engineer',
    shortDescription: 'Support safe, reliable and efficient operation of process plants.',
    skills: [
      { skillId: 'plant', target: 'intermediate', weight: 3, why: 'Plant roles require equipment and operations understanding.', next: 'Study equipment, utilities and basic troubleshooting.' },
      { skillId: 'safety', target: 'intermediate', weight: 3, why: 'Safe operation is fundamental in chemical plants.', next: 'Practise hazard identification and risk-control thinking.' },
      { skillId: 'process-control', target: 'basic', weight: 1, why: 'Control systems keep processes stable and within limits.', next: 'Learn sensors, loops and basic control logic.' },
    ],
    questions: [Q('co1','Can you explain how common plant equipment is used?','plant'), Q('co2','Can you identify hazards and propose controls for a process step?','safety'), Q('co3','Can you explain a basic process-control loop?','process-control')],
    projects: ['Plant operations case study', 'Process safety/Hazard analysis mini project'],
  },
  {
    id: 'chem-safety', branchId: 'chemical', direction: 'industry', title: 'Process Safety Engineer',
    shortDescription: 'Identify hazards, assess risk and improve safety in process environments.',
    skills: [
      { skillId: 'safety', target: 'intermediate', weight: 3, why: 'Hazard identification and risk control are the core of process safety.', next: 'Study HAZOP-style thinking, layers of protection and incident learning.' },
      { skillId: 'plant', target: 'basic', weight: 2, why: 'Safety decisions need an understanding of plant operations.', next: 'Learn common process equipment and operating conditions.' },
      { skillId: 'process-control', target: 'basic', weight: 1, why: 'Control and alarms are part of process risk reduction.', next: 'Understand sensors, alarms and interlocks.' },
    ],
    questions: [Q('cps1','Can you identify hazards from a simple process description?','safety'), Q('cps2','Can you explain what common plant equipment does?','plant'), Q('cps3','Can you distinguish a sensor, alarm and control action?','process-control')],
    projects: ['Process hazard analysis case study', 'Safety improvement proposal for a simple process'],
  },
  {
    id: 'mecha-robotics', branchId: 'mechatronics', direction: 'industry', title: 'Robotics Engineer',
    shortDescription: 'Build integrated robotic systems using mechanics, electronics and control.',
    skills: [
      { skillId: 'robotics', target: 'intermediate', weight: 3, why: 'Robot integration requires kinematics and robot-system reasoning.', next: 'Build and document a small robotic system.' },
      { skillId: 'sensors', target: 'intermediate', weight: 2, why: 'Robots depend on reliable sensing and actuation.', next: 'Interface sensors and actuators in a practical prototype.' },
      { skillId: 'mecha-c', target: 'basic', weight: 2, why: 'Controller programming is common in robotic systems.', next: 'Write small C/C++ control programs.' },
      { skillId: 'control-mecha', target: 'basic', weight: 2, why: 'Feedback helps robotic systems behave predictably.', next: 'Study basic feedback and controller concepts.' },
    ],
    questions: [Q('rb1','Can you explain basic robot kinematics or joint motion?','robotics'), Q('rb2','Can you integrate a sensor with an actuator?','sensors'), Q('rb3','Can you write basic C/C++ for a controller?','mecha-c'), Q('rb4','Can you explain why feedback is used in robots?','control-mecha')],
    projects: ['Small autonomous/assisted robot', 'Sensor + actuator integration project'],
  },
  {
    id: 'mecha-automation', branchId: 'mechatronics', direction: 'industry', title: 'Automation Engineer',
    shortDescription: 'Design automated machines and industrial control systems.',
    skills: [
      { skillId: 'plc-mecha', target: 'intermediate', weight: 3, why: 'PLC logic is common in industrial automation.', next: 'Build ladder-logic sequences for a small process.' },
      { skillId: 'sensors', target: 'intermediate', weight: 2, why: 'Automation relies on reliable sensing and actuation.', next: 'Map sensor inputs and actuator outputs for a process.' },
      { skillId: 'control-mecha', target: 'basic', weight: 2, why: 'Control concepts help tune and reason about automated systems.', next: 'Study feedback and basic controller behaviour.' },
      { skillId: 'mecha-mechanics', target: 'basic', weight: 1, why: 'Machines must be understood as physical systems.', next: 'Revise mechanisms and machine elements.' },
    ],
    questions: [Q('ma1','Can you create basic PLC control logic?','plc-mecha'), Q('ma2','Can you map sensors to actuator actions in a process?','sensors'), Q('ma3','Can you explain a simple feedback controller?','control-mecha')],
    projects: ['Automated process simulation', 'Sensor-driven machine-control prototype'],
  },
  {
    id: 'mecha-controls', branchId: 'mechatronics', direction: 'industry', title: 'Controls Engineer',
    shortDescription: 'Model and tune control systems used in machines and automation.',
    skills: [
      { skillId: 'control-mecha', target: 'intermediate', weight: 3, why: 'Control theory is the core technical area for controls engineering.', next: 'Practise modelling, stability and basic controller tuning.' },
      { skillId: 'sensors', target: 'basic', weight: 2, why: 'Control decisions depend on measured system state.', next: 'Study sensor selection and signal behaviour.' },
      { skillId: 'mecha-c', target: 'basic', weight: 1, why: 'Control implementations often require programming.', next: 'Implement a simple controller in code or simulation.' },
    ],
    questions: [Q('mc1','Can you explain closed-loop control and stability at a basic level?','control-mecha'), Q('mc2','Can you choose a sensor for a simple measurement problem?','sensors'), Q('mc3','Can you implement a simple control algorithm?','mecha-c')],
    projects: ['Controller simulation', 'Sensor-feedback control prototype'],
  },
];

export const ENTREPRENEUR_SKILLS: GapSkill[] = [
  S('problem-validation','Problem Validation','Business','Interview users, identify pain points and test whether the problem is real.'),
  S('customer-discovery','Customer Discovery','Business','Understand users, alternatives and buying/use behaviour.'),
  S('mvp','MVP / Prototyping','Execution','Build the smallest useful version for testing.'),
  S('business-model','Business Model','Business','Understand value proposition, revenue/cost logic and sustainability.'),
  S('communication','Communication / Pitching','People','Explain the problem, solution and evidence clearly.'),
  S('execution','Execution / Iteration','Execution','Run experiments, learn from feedback and improve the product.'),
];

export const ENTREPRENEUR_QUESTIONS: AssessmentQuestion[] = [
  Q('en1','Can you describe a real problem and the specific people who experience it?','problem-validation'),
  Q('en2','Have you spoken to potential users instead of relying only on assumptions?','customer-discovery'),
  Q('en3','Can you define the smallest version of your idea that could be tested?','mvp'),
  Q('en4','Can you explain how the idea creates value and how it could sustain itself?','business-model'),
  Q('en5','Can you explain your idea clearly and respond to critical questions?','communication'),
  Q('en6','Do you regularly test, learn and change your idea based on evidence?','execution'),
];

export const DIRECTION_LABELS: Record<CareerDirection, string> = {
  industry: 'Industry Job',
  entrepreneur: 'Entrepreneur / Startup',
  'higher-studies': 'Higher Studies / Research',
  government: 'Government / Public Sector',
  'not-sure': 'Not Sure Yet',
};

export const getBranch = (id: string) => BRANCHES.find((b) => b.id === id) || BRANCHES[0];
export const getCareer = (id: string) => CAREERS.find((c) => c.id === id);
export const getBranchSkills = (branchId: string) => getBranch(branchId).domainSkills;

export const buildDirectionCareers = (branchId: string, direction: CareerDirection): CareerProfile[] => {
  if (direction === 'industry') return CAREERS.filter((c) => c.branchId === branchId);
  return [];
};
