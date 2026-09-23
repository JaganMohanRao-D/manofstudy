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
    description: 'Software, data, systems, security and cloud computing careers.',
    careers: ['cse-software', 'cse-data', 'cse-cyber'],
    domainSkills: [
      S('dsa', 'Data Structures & Algorithms', 'Core', 'Problem-solving frequency, arrays, trees, dynamic programming and complexity analysis.'),
      S('oop', 'OOP & Clean Code Design', 'Core', 'Classes, interfaces, inheritance, polymorphism, design patterns, and clean modular code.'),
      S('dbms', 'DBMS & SQL Modeling', 'Core', 'Relational data modeling, ACID transactions, normalization, and complex multi-table JOINs.'),
      S('git', 'Git & GitHub Repo Proof', 'Tools', 'Version control, branch management, pull requests, and verifiable public repo commits.'),
      S('linux', 'Operating Systems & Linux', 'Systems', 'Process scheduling, virtual memory, threads/concurrency, and Linux shell/CLI navigation.'),
      S('web', 'Web & Cloud Fundamentals', 'Software', 'Client-server architecture, REST APIs, frontend/backend integration, and basic cloud deployment.'),
      S('python', 'Python & Scripting', 'Data', 'Practical Python for automation, data wrangling, APIs, and scripting.'),
      S('networks', 'Computer Networks', 'Systems', 'TCP/IP, DNS, HTTP/HTTPS, sockets, and network troubleshooting.'),
    ],
  },
  {
    id: 'ece',
    name: 'Electronics & Communication',
    description: 'Embedded systems, electronics, VLSI, communications and IoT.',
    careers: ['ece-embedded', 'ece-vlsi', 'ece-iot'],
    domainSkills: [
      S('digital', 'Digital Electronics & Logic', 'Core', 'Logic gates, Boolean algebra, K-maps, combinational/sequential circuits, and FSM state machines.'),
      S('microcontrollers', 'Microcontrollers & ARM', 'Embedded', 'ARM Cortex/STM32/ESP32, registers, timers, interrupts, ADC, and GPIO configuration.'),
      S('c_embedded', 'Embedded C & Verilog HDL', 'Core', 'Low-level C pointers/bitmasks and synthesizable RTL hardware description with testbenches.'),
      S('communication', 'Signals & Systems / DSP', 'Core', 'Fourier/Laplace transforms, frequency response, modulation, and signal sampling theorems.'),
      S('python_ece', 'Python for Hardware/Firmware', 'Tools', 'Automated testing, serial COM port communication, sensor logging, and analysis.'),
      S('circuits', 'Electronic Circuit Analysis', 'Hardware', 'Analog/digital circuits, operational amplifiers, and oscilloscope measurement.'),
      S('pcb', 'PCB Design & Schematics', 'Hardware', 'Schematic capture, footprints, trace routing in KiCad/Altium, and manufacturing.'),
      S('iot', 'IoT Systems & Sensors', 'Embedded', 'Sensor interfacing, wireless protocols (Wi-Fi, BLE, MQTT), and edge integration.'),
    ],
  },
  {
    id: 'eee',
    name: 'Electrical & Electronics',
    description: 'Power, machines, control, automation, electrical systems and EVs.',
    careers: ['eee-power', 'eee-automation', 'eee-ev'],
    domainSkills: [
      S('circuit_theory', 'Circuit Theory & Networks', 'Core', 'AC/DC network theorems (Thevenin, Norton, superposition), transient analysis, and resonance.'),
      S('matlab', 'MATLAB & Engineering Simulation', 'Tools', 'Mathematical modeling, Simulink block simulations, and numerical state-space analysis.'),
      S('power_electronics', 'Power Electronics & Drives', 'Power', 'Converters, inverters, MOSFET/IGBT switching, PWM, and motor speed control.'),
      S('control_systems', 'Control Systems', 'Automation', 'Transfer functions, root locus, Bode/Nyquist stability criteria, and PID controller tuning.'),
      S('iot_eee', 'IoT & Smart Grid Systems', 'Smart Grid', 'Microcontroller sensor interfacing, smart energy metering, and telemetry via MQTT/HTTP.'),
      S('machines', 'Electrical Machines', 'Core', 'Transformers, induction motors, synchronous machines, and torque-speed characteristics.'),
      S('power_systems', 'Power Systems & Protection', 'Power', 'Generation, transmission lines, load flow studies, and switchgear/relays.'),
      S('plc', 'PLC & Industrial Automation', 'Automation', 'PLC ladder logic programming, industrial sensors, relays, and SCADA basics.'),
    ],
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    description: 'Design, manufacturing, thermal systems, simulation and robotics.',
    careers: ['mech-design', 'mech-manufacturing', 'mech-robotics'],
    domainSkills: [
      S('cad_autocad', 'CAD / AutoCAD & 3D Modeling', 'Design', 'Parametric 3D part and assembly modeling in SolidWorks/CATIA/AutoCAD with GD&T tolerances.'),
      S('ansys_solidworks', 'Ansys / SolidWorks Simulation', 'Design', 'Finite Element Analysis (FEA), meshing, boundary conditions, and stress/thermal results.'),
      S('structural_analysis_mech', 'Mechanics & Stress Analysis', 'Core', 'Statics, dynamics, free-body diagrams, shear force/bending moment diagrams, failure theories.'),
      S('python_mech', 'Python & Numerical Computation', 'Tools', 'Scientific Python (NumPy/SciPy) for thermodynamics, vibrations, and design calculations.'),
      S('thermo', 'Thermodynamics & Heat Transfer', 'Thermal', 'Laws of thermodynamics, power/refrigeration cycles, heat exchangers, conduction/convection.'),
      S('manufacturing', 'Manufacturing Processes', 'Manufacturing', 'Machining (CNC/lathe), casting, forming, welding, and metrology.'),
      S('automation', 'Automation & Robotics', 'Robotics', 'Forward/inverse kinematics, actuators, pneumatic/hydraulic systems, and mechanisms.'),
      S('materials', 'Materials & Metallurgy', 'Core', 'Engineering materials selection, stress-strain behavior, and heat treatment.'),
    ],
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    description: 'Structures, construction, infrastructure, surveying and planning.',
    careers: ['civil-structures', 'civil-construction', 'civil-infra'],
    domainSkills: [
      S('autocad_civil', 'AutoCAD / Civil 3D Drafting', 'Design', 'Drafting structural layouts, architectural plans, sections, elevations, and civil site grading.'),
      S('structural_analysis', 'Structural Analysis (STAAD/ETABS)', 'Structures', 'Determinate/indeterminate structures, moment distribution, and multi-story frame analysis.'),
      S('concrete_rcc', 'Concrete Technology & RCC Design', 'Structures', 'Mix design, limit state method, IS 456 compliance for beams, slabs, columns, footings.'),
      S('python_civil', 'Python & Spreadsheet Modeling', 'Tools', 'Python/Excel automation for BOQ calculations, surveying adjustments, and project scheduling.'),
      S('surveying', 'Surveying & GIS Spatial Data', 'Field', 'Total station, GPS, leveling, contouring, and GIS spatial mapping for infrastructure.'),
      S('geotech', 'Geotechnical Engineering & Soils', 'Core', 'Soil classification, shear strength, bearing capacity, settlement, and foundation design.'),
      S('construction', 'Construction Management & BOQ', 'Construction', 'Project scheduling (CPM/PERT), bill of quantities (BOQ), rate analysis, contracts.'),
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
    { label: '0 - None (Have not learned this yet)', level: 'none' },
    { label: '1 - Beginner (Theoretical knowledge only)', level: 'beginner' },
    { label: '2 - Basic (Can build with guided tutorials)', level: 'basic' },
    { label: '3 - Intermediate (Can build mini-projects independently)', level: 'intermediate' },
    { label: '4 - Advanced (Independent mastery & optimization)', level: 'advanced' },
  ],
});

export const CAREERS: CareerProfile[] = [
  {
    id: 'cse-software', branchId: 'cse', direction: 'industry', title: 'Software Developer',
    shortDescription: 'Build and maintain web applications, APIs, databases and production systems.',
    skills: [
      { skillId: 'dsa', target: 'intermediate', weight: 3, why: 'Algorithmic problem solving and complexity reasoning are fundamental for engineering interviews and performant code.', next: 'Practice 2-3 algorithmic problems weekly on arrays, trees, and dynamic programming independently.' },
      { skillId: 'oop', target: 'intermediate', weight: 3, why: 'Writing modular, maintainable, object-oriented code prevents fragile software architecture.', next: 'Refactor procedural code into modular classes and design patterns in a portfolio project.' },
      { skillId: 'dbms', target: 'basic', weight: 2, why: 'Backend systems store, index, and query structured relational data.', next: 'Build an application backed by PostgreSQL/MySQL with multi-table JOINs and foreign keys.' },
      { skillId: 'git', target: 'basic', weight: 2, why: 'Public GitHub repositories with meaningful commit history prove authentic hands-on coding.', next: 'Publish 1-2 completed projects with thorough READMEs, commit histories, and deployment links.' },
      { skillId: 'linux', target: 'basic', weight: 2, why: 'Cloud servers and microservices run almost exclusively on Linux operating systems.', next: 'Practice Linux bash commands, process inspection, file permissions, and environment variables.' },
      { skillId: 'web', target: 'basic', weight: 2, why: 'Connecting frontend clients to backend APIs and deploying live is standard software work.', next: 'Build and deploy a full-stack CRUD application with client-server architecture.' },
    ],
    questions: [
      Q('cs1','Core Problem-Solving: How frequently do you solve algorithmic problems (Arrays, HashMaps, Trees, Sorting) independently without viewing solutions?','dsa'),
      Q('cs2','OOP & Clean Code: Can you design classes, interfaces, and apply OOP principles (encapsulation, polymorphism) in a real project?','oop'),
      Q('cs3','Databases & SQL: Can you write complex SQL queries (multi-table JOINs, aggregations) and design normalized relational schemas?','dbms'),
      Q('cs4','GitHub Repo Proof: Do you maintain active GitHub repositories with meaningful commit history, clean READMEs, and verifiable code proof?','git'),
      Q('cs5','Systems & Linux: Can you explain threads/concurrency, virtual memory, and comfortably navigate Linux command line / bash?','linux'),
      Q('cs6','Web & Cloud Deployment: Can you build and deploy an end-to-end full-stack or REST API project connected to a live database?','web'),
    ],
    projects: ['Production-ready full-stack web application with authentication and SQL database', 'Algorithmic problem-solving repository with documented time/space complexity'],
  },
  {
    id: 'cse-data', branchId: 'cse', direction: 'industry', title: 'Data / AI Engineer',
    shortDescription: 'Work with data pipelines, SQL transformations, machine learning and analytical models.',
    skills: [
      { skillId: 'python', target: 'intermediate', weight: 3, why: 'Python is the industry standard language for data manipulation, automation, and AI.', next: 'Clean, analyze, and visualize a real-world messy dataset using Pandas and NumPy.' },
      { skillId: 'dbms', target: 'intermediate', weight: 3, why: 'Data pipelines rely heavily on SQL queries, window functions, and relational schema designs.', next: 'Master advanced SQL: window functions, CTEs, indexing, and query optimization.' },
      { skillId: 'dsa', target: 'basic', weight: 2, why: 'Algorithmic efficiency is needed when processing large datasets.', next: 'Practice data structure fundamentals and algorithmic complexity.' },
      { skillId: 'oop', target: 'basic', weight: 2, why: 'Production ML models require clean modular code rather than fragmented notebooks.', next: 'Package Python data scripts into clean modular classes.' },
      { skillId: 'git', target: 'basic', weight: 2, why: 'Reproducible research and model versioning require Git version control.', next: 'Publish a reproducible data analysis repository with clean requirements.txt and README.' },
    ],
    questions: [
      Q('cd1','Python Data Science: Can you load, clean, transform, and visualize a complex dataset using Python?','python'),
      Q('cd2','SQL & Data Warehousing: Can you write advanced SQL (CTEs, window functions, aggregations) to extract business insights?','dbms'),
      Q('cd3','Problem-Solving Foundation: Can you write efficient algorithmic logic to filter and transform large data arrays?','dsa'),
      Q('cd4','Modular Code: Can you structure data analysis scripts into reusable Python functions and classes?','oop'),
      Q('cd5','GitHub Portfolio Proof: Do you have public Git repositories with reproducible data experiments and clean documentation?','git'),
    ],
    projects: ['End-to-end data pipeline analyzing a real public dataset with interactive visualizations', 'Machine learning predictive model deployed with a simple API interface'],
  },
  {
    id: 'cse-cyber', branchId: 'cse', direction: 'industry', title: 'Cybersecurity Analyst',
    shortDescription: 'Protect systems, networks and applications through defensive security and security auditing.',
    skills: [
      { skillId: 'networks', target: 'intermediate', weight: 3, why: 'Defensive security depends on deep comprehension of network communication protocols.', next: 'Capture and inspect network packets using Wireshark and master TCP/IP handshake.' },
      { skillId: 'linux', target: 'intermediate', weight: 3, why: 'Security analysis, log investigation, and server hardening are done through Linux shells.', next: 'Set up a Linux VM, analyze syslog/auth logs, and configure firewall rules.' },
      { skillId: 'python', target: 'basic', weight: 2, why: 'Security analysts write automation scripts to parse logs and detect threat patterns.', next: 'Write a Python script to parse access logs and flag anomalous IP attempts.' },
      { skillId: 'git', target: 'basic', weight: 2, why: 'Tracking security tool configurations and defensive rules requires version control.', next: 'Document and publish a defensive security lab with step-by-step audit logs on GitHub.' },
    ],
    questions: [
      Q('cc1','Network Protocols: Can you explain TCP/IP three-way handshake, DNS resolution, and inspect packets in Wireshark?','networks'),
      Q('cc2','Linux Systems Hardening: Can you navigate Linux CLI, inspect file permissions, manage services, and audit auth logs?','linux'),
      Q('cc3','Security Scripting: Can you write a Python script to automate log parsing and alert on suspicious activity?','python'),
      Q('cc4','Defensive Tooling & Git: Have you configured firewalls, Snort/Suricata rules, and documented your lab on GitHub?','git'),
    ],
    projects: ['Defensive network lab analyzing attack logs with automated threat detection scripts', 'System hardening benchmark audit report with documented remediation steps'],
  },
  {
    id: 'ece-embedded', branchId: 'ece', direction: 'industry', title: 'Embedded Systems Engineer',
    shortDescription: 'Develop firmware, low-level drivers and hardware-software interfaces for smart electronics.',
    skills: [
      { skillId: 'digital', target: 'intermediate', weight: 3, why: 'Understanding logic gates, registers, and timing is essential for microcontroller interfaces.', next: 'Design and verify a finite state machine (FSM) for a hardware controller.' },
      { skillId: 'microcontrollers', target: 'intermediate', weight: 3, why: 'Configuring ARM Cortex/STM32/ESP32 hardware peripherals is the heart of embedded systems.', next: 'Write bare-metal peripheral drivers for GPIO, UART, and hardware timers on an MCU.' },
      { skillId: 'c_embedded', target: 'intermediate', weight: 3, why: 'Embedded firmware is built on C pointers, memory-mapped registers, and bit manipulation.', next: 'Build a project using C bit manipulation, circular buffers, and interrupt service routines.' },
      { skillId: 'communication', target: 'basic', weight: 2, why: 'Hardware communication requires understanding signal timing, filtering, and sampling.', next: 'Study signal sampling, Nyquist criteria, and digital filtering basics.' },
      { skillId: 'python_ece', target: 'basic', weight: 2, why: 'Firmware engineers use Python to test hardware via serial COM ports and log sensor telemetry.', next: 'Write a Python script to communicate with an MCU over UART/Serial and graph sensor data.' },
    ],
    questions: [
      Q('ee1','Digital Logic Foundation: Can you design and analyze combinational and sequential logic circuits (K-maps, FSM state machines, flip-flops)?','digital'),
      Q('ee2','ARM / Microcontrollers: Can you configure MCU peripherals (Timers, Interrupts, GPIO, UART, SPI, I2C) on STM32 or ESP32?','microcontrollers'),
      Q('ee3','Embedded C & Firmware: Can you write low-level Embedded C with register bitmasks, pointers, and ISR interrupt routines?','c_embedded'),
      Q('ee4','Signals & Systems: Can you analyze frequency response, Fourier/Laplace transforms, and explain signal filtering or sampling theorems?','communication'),
      Q('ee5','Python Hardware Automation: Can you write Python scripts to automate serial COM port communication, sensor data logging, and analysis?','python_ece'),
    ],
    projects: ['STM32/ESP32 sensor monitoring system with custom UART/I2C firmware drivers', 'Low-power microcontroller data logger with Python serial visualization dashboard'],
  },
  {
    id: 'ece-vlsi', branchId: 'ece', direction: 'industry', title: 'VLSI / RTL Design Engineer',
    shortDescription: 'Design, verify, and simulate digital integrated circuits using HDL and FPGA platforms.',
    skills: [
      { skillId: 'digital', target: 'intermediate', weight: 3, why: 'RTL architecture is direct digital logic mapped into silicon gates and flip-flops.', next: 'Design complex sequential FSMs and pipelined datapath blocks.' },
      { skillId: 'c_embedded', target: 'intermediate', weight: 3, why: 'Hardware Description Languages (Verilog/SystemVerilog) describe synthesizable hardware blocks.', next: 'Write synthesizable Verilog modules with self-checking testbenches.' },
      { skillId: 'circuits', target: 'basic', weight: 2, why: 'Setup/hold times, clock skew, and fanout dictate chip timing closure.', next: 'Study static timing analysis (STA) and timing constraints.' },
      { skillId: 'python_ece', target: 'basic', weight: 2, why: 'Verification engineers use Python to generate randomized test vectors for HDL simulations.', next: 'Write a Python script to generate stimulus vectors and verify HDL simulation outputs.' },
    ],
    questions: [
      Q('ev1','Digital Architecture: Can you design multi-state FSMs, counters, and pipelined datapaths?','digital'),
      Q('ev2','Verilog / RTL Coding: Can you write synthesizable Verilog modules and build self-checking testbenches?','c_embedded'),
      Q('ev3','Timing & Physical Constraints: Can you explain setup/hold time violations, clock domains, and metastabilities?','circuits'),
      Q('ev4','Verification Scripting: Can you write Python/Bash scripts to automate EDA synthesis and simulation runs?','python_ece'),
    ],
    projects: ['Verilog RTL implementation of an ALU / UART controller with comprehensive testbench verification', 'FPGA digital design project synthesized with timing constraint reports'],
  },
  {
    id: 'ece-iot', branchId: 'ece', direction: 'industry', title: 'IoT Systems Engineer',
    shortDescription: 'Connect sensor nodes, wireless communication modules and cloud endpoints.',
    skills: [
      { skillId: 'microcontrollers', target: 'intermediate', weight: 3, why: 'Sensor acquisition and power optimization occur at the microcontroller level.', next: 'Build an ESP32 sensor node operating with deep-sleep power modes.' },
      { skillId: 'iot', target: 'intermediate', weight: 3, why: 'IoT architectures bridge wireless protocols (Wi-Fi, BLE, MQTT) to cloud telemetry.', next: 'Publish live sensor telemetry from an embedded device to an MQTT broker.' },
      { skillId: 'c_embedded', target: 'basic', weight: 2, why: 'Firmware stability prevents remote device bricking and memory leaks.', next: 'Write non-blocking sensor acquisition loops in C.' },
      { skillId: 'pcb', target: 'basic', weight: 2, why: 'Moving from breadboard prototypes to reliable deployment requires PCB design.', next: 'Design a schematic and 2-layer PCB layout for a sensor node in KiCad.' },
    ],
    questions: [
      Q('ei1','Microcontroller Interfacing: Can you interface digital/analog sensors with an MCU using I2C/SPI and ADC?','microcontrollers'),
      Q('ei2','Wireless Protocols & IoT: Can you transmit sensor payloads reliably over Wi-Fi, BLE, or MQTT to a backend?','iot'),
      Q('ei3','Firmware Robustness: Can you write non-blocking embedded C firmware with watchdog timers and error recovery?','c_embedded'),
      Q('ei4','Schematic & PCB Design: Can you design a clean schematic, assign footprints, and route a PCB in KiCad or Altium?','pcb'),
    ],
    projects: ['Wireless IoT environmental monitoring node publishing MQTT data to a live web dashboard', 'Custom-designed 2-layer PCB for a battery-operated microcontroller sensor'],
  },
  {
    id: 'eee-power', branchId: 'eee', direction: 'industry', title: 'Power Systems Engineer',
    shortDescription: 'Design and analyze generation, transmission, distribution, and grid protection systems.',
    skills: [
      { skillId: 'circuit_theory', target: 'intermediate', weight: 3, why: 'Network theorems and AC three-phase analysis form the core foundation of power engineering.', next: 'Solve symmetrical and unsymmetrical fault calculations on three-phase power networks.' },
      { skillId: 'power_systems', target: 'intermediate', weight: 3, why: 'Transmission line parameters, load flow, and relay protection safeguard electrical infrastructure.', next: 'Perform load flow analysis (Gauss-Seidel / Newton-Raphson) on a multi-bus system.' },
      { skillId: 'machines', target: 'intermediate', weight: 3, why: 'Synchronous generators and power transformers are the workhorses of the power grid.', next: 'Analyze transformer equivalent circuits and synchronous generator capability curves.' },
      { skillId: 'matlab', target: 'basic', weight: 2, why: 'Power system engineers simulate grid faults and stability in MATLAB Simulink.', next: 'Model a 3-phase transmission line with breaker protection in Simulink.' },
      { skillId: 'power_electronics', target: 'basic', weight: 2, why: 'Modern grids integrate HVDC and FACTS power electronic converters.', next: 'Study grid-tied inverter topologies and power factor correction.' },
    ],
    questions: [
      Q('ep1','Circuit Theory Foundation: Can you solve complex AC/DC circuits using Thevenin, Norton, superposition theorems and transient analysis?','circuit_theory'),
      Q('ep2','Power Systems & Grid: Can you perform load flow studies, calculate fault currents, and explain distance relay protection?','power_systems'),
      Q('ep3','Electrical Machines: Can you analyze transformer regulation, induction motor slip-torque, and generator excitation?','machines'),
      Q('ep4','MATLAB & Simulation: Can you model and simulate electrical circuits, transfer functions, or power subsystems in MATLAB / Simulink?','matlab'),
      Q('ep5','Power Electronics: Can you explain grid-tied inverters and reactive power compensation basics?','power_electronics'),
    ],
    projects: ['MATLAB/Simulink simulation of a multi-bus power distribution network with fault analysis', 'Protection relay coordination study for an industrial distribution substation'],
  },
  {
    id: 'eee-automation', branchId: 'eee', direction: 'industry', title: 'Industrial Automation Engineer',
    shortDescription: 'Integrate PLCs, SCADA, motor drives and control feedback loops in industrial manufacturing.',
    skills: [
      { skillId: 'control_systems', target: 'intermediate', weight: 3, why: 'Feedback control and PID loops maintain process stability in industrial plants.', next: 'Tune PID controller parameters using Ziegler-Nichols frequency response methods.' },
      { skillId: 'plc', target: 'intermediate', weight: 3, why: 'Programmable Logic Controllers (PLCs) execute industrial logic and sensor actuation.', next: 'Program ladder logic with timers, counters, and interlocking circuits for a conveyor system.' },
      { skillId: 'circuit_theory', target: 'intermediate', weight: 2, why: 'Troubleshooting control panels requires reading industrial electrical schematics.', next: 'Practice reading industrial wiring diagrams, contactors, and 4-20mA loop sensors.' },
      { skillId: 'matlab', target: 'basic', weight: 2, why: 'Simulation verifies control stability before deploying to physical hardware.', next: 'Simulate closed-loop motor speed control with a PID block in Simulink.' },
      { skillId: 'iot_eee', target: 'basic', weight: 2, why: 'Industry 4.0 integrates smart energy meters and telemetry with SCADA/cloud.', next: 'Connect an energy meter or sensor to an industrial IoT gateway.' },
    ],
    questions: [
      Q('ea1','Control Systems: Can you determine closed-loop stability using Bode plots, Nyquist criteria, and tune PID controllers?','control_systems'),
      Q('ea2','PLC Ladder Logic: Can you program PLC ladder logic with interlocking, timers, counters, and state sequencing?','plc'),
      Q('ea3','Circuit & Control Hardware: Can you troubleshoot industrial control circuits, relays, contactors, and 4-20mA sensor loops?','circuit_theory'),
      Q('ea4','MATLAB / Simulation: Can you simulate dynamic plant feedback loops and evaluate step response settling times?','matlab'),
      Q('ea5','IoT & Smart Metering: Can you interface smart energy meters or sensors and transmit telemetry via Modbus/MQTT?','iot_eee'),
    ],
    projects: ['PLC-simulated automated sorting and packaging station with ladder logic interlocks', 'Closed-loop DC motor speed controller with tuned PID algorithm in MATLAB/Simulink'],
  },
  {
    id: 'eee-ev', branchId: 'eee', direction: 'industry', title: 'EV Electrical Systems Engineer',
    shortDescription: 'Engineer electric powertrain subsystems, inverters, battery management systems and chargers.',
    skills: [
      { skillId: 'power_electronics', target: 'intermediate', weight: 3, why: 'Buck-boost DC-DC converters and 3-phase traction inverters drive electric vehicles.', next: 'Design and simulate a bidirectional DC-DC converter for battery charging in Simulink.' },
      { skillId: 'control_systems', target: 'intermediate', weight: 3, why: 'Vector control (FOC) enables efficient electric motor torque-speed modulation.', next: 'Study Field-Oriented Control (FOC) principles for permanent magnet synchronous motors.' },
      { skillId: 'circuit_theory', target: 'intermediate', weight: 2, why: 'Battery packs and charging circuits require rigorous circuit modeling.', next: 'Model battery cell equivalent circuits (SOC/SOH) and charging current limits.' },
      { skillId: 'matlab', target: 'basic', weight: 2, why: 'EV powertrain simulation evaluates driving cycle range and energy consumption.', next: 'Simulate an EV drive cycle (WLTP/NEDC) with battery discharge modeling in MATLAB.' },
      { skillId: 'iot_eee', target: 'basic', weight: 2, why: 'EV telematics transmit battery state, temperature, and diagnostic fault codes.', next: 'Build an MCU battery voltage/temperature monitor with CAN bus or telemetry transmission.' },
    ],
    questions: [
      Q('eev1','Power Electronics: Can you design and analyze DC-DC buck/boost converters, inverters, and PWM switching drives?','power_electronics'),
      Q('eev2','Control Systems: Can you explain motor drive control loops and feedback current controllers?','control_systems'),
      Q('eev3','Circuit Theory & Battery: Can you model battery equivalent circuits, cell balancing, and charging kinetics?','circuit_theory'),
      Q('eev4','MATLAB Powertrain Modeling: Can you simulate vehicle driving cycles and evaluate motor energy demands in Simulink?','matlab'),
      Q('eev5','IoT / Telematics: Can you interface sensors to monitor battery thermal management and transmit CAN/MQTT telemetry?','iot_eee'),
    ],
    projects: ['Simulink model of an EV powertrain traction inverter with regenerative braking simulation', 'Microcontroller-based Battery Management System (BMS) cell voltage and temperature monitor'],
  },
  {
    id: 'mech-design', branchId: 'mechanical', direction: 'industry', title: 'Mechanical Design Engineer',
    shortDescription: 'Design mechanical components, assemblies, and validate using CAD and FEA simulation.',
    skills: [
      { skillId: 'cad_autocad', target: 'intermediate', weight: 3, why: 'Parametric CAD modeling and GD&T drafting are the universal language of mechanical design.', next: 'Model a multi-part mechanical assembly with mated constraints and detailed manufacturing drawings.' },
      { skillId: 'ansys_solidworks', target: 'intermediate', weight: 3, why: 'Finite Element Analysis (FEA) validates that parts will not yield or fail under operational loads.', next: 'Run static structural stress and displacement simulations on a loaded bracket in Ansys or SolidWorks.' },
      { skillId: 'structural_analysis_mech', target: 'intermediate', weight: 3, why: 'Free body diagrams, shear-moment calculations, and failure theories guide sizing before simulation.', next: 'Calculate factor of safety using von Mises and Tresca failure criteria for combined loading.' },
      { skillId: 'python_mech', target: 'basic', weight: 2, why: 'Mechanical engineers use Python for parametric sizing, thermodynamics equations, and test data analysis.', next: 'Write a Python script to calculate shaft diameters or gear ratios based on input torque.' },
    ],
    questions: [
      Q('md1','CAD & 3D Modeling: Can you independently create parametric 3D parts, assemblies with GD&T tolerances, and export manufacturing drawings in CAD?','cad_autocad'),
      Q('md2','FEA Simulation: Can you set up boundary conditions, mesh elements, and interpret stress/deformation results in Ansys or SolidWorks Simulation?','ansys_solidworks'),
      Q('md3','Mechanics & Stress: Can you draw shear force / bending moment diagrams, calculate principal stresses, and apply failure theories?','structural_analysis_mech'),
      Q('md4','Numerical Python: Can you write Python scripts to solve thermodynamics equations, numerical analysis, or process mechanical experimental data?','python_mech'),
    ],
    projects: ['Complete parametric CAD assembly of a gearbox or robotic gripper with full GD&T drawing package', 'Ansys FEA structural optimization study reducing component mass while maintaining factor of safety'],
  },
  {
    id: 'mech-manufacturing', branchId: 'mechanical', direction: 'industry', title: 'Manufacturing / Production Engineer',
    shortDescription: 'Optimize production machining, CNC operations, tooling, casting and quality metrology.',
    skills: [
      { skillId: 'manufacturing', target: 'intermediate', weight: 3, why: 'Process selection (milling, turning, casting, additive) dictates production cost and feasibility.', next: 'Design a process plan and tooling setup for a precision machined component.' },
      { skillId: 'cad_autocad', target: 'intermediate', weight: 3, why: 'Interpreting manufacturing prints with surface finishes and dimensional tolerances is vital.', next: 'Create production-ready 2D drawings with datum references and tolerance stack-up analysis.' },
      { skillId: 'structural_analysis_mech', target: 'basic', weight: 2, why: 'Clamping forces and cutting tool forces induce deflections during machining.', next: 'Calculate cutting forces and power requirements for turning and milling operations.' },
      { skillId: 'python_mech', target: 'basic', weight: 2, why: 'Statistical Process Control (SPC) uses Python/Excel for tolerance distribution analysis.', next: 'Write a Python script to calculate Cp/Cpk process capability metrics from inspection data.' },
    ],
    questions: [
      Q('mm1','Manufacturing Processes: Can you choose suitable manufacturing processes, tooling, and speeds/feeds for metal and polymer parts?','manufacturing'),
      Q('mm2','Production CAD & GD&T: Can you draft and interpret production drawings with datum references, fit tolerances, and surface finishes?','cad_autocad'),
      Q('mm3','Machining Mechanics: Can you calculate cutting forces, tool life, and analyze clamping deflections?','structural_analysis_mech'),
      Q('mm4','Quality & Data Analysis: Can you use Python or spreadsheets for Statistical Process Control (SPC) and quality inspection data?','python_mech'),
    ],
    projects: ['Comprehensive manufacturing process plan and tooling sheet for a multi-axis CNC component', 'Statistical Process Control (SPC) quality analysis study on production dimensional variations'],
  },
  {
    id: 'mech-robotics', branchId: 'mechanical', direction: 'industry', title: 'Robotics / Automation Engineer',
    shortDescription: 'Design robotic mechanisms, kinematics, actuators and automated physical systems.',
    skills: [
      { skillId: 'automation', target: 'intermediate', weight: 3, why: 'Robotics merges mechanical linkages with electric actuators and sensor feedback.', next: 'Calculate actuator torque requirements based on joint inertia and payload dynamics.' },
      { skillId: 'cad_autocad', target: 'intermediate', weight: 3, why: 'Robotic arms and AGV chassis require precision CAD modeling and mass balancing.', next: 'Model a 3-DOF robotic arm mechanism with bearing mounts and motor brackets in CAD.' },
      { skillId: 'structural_analysis_mech', target: 'intermediate', weight: 2, why: 'Dynamic accelerations produce shock loads on robot links and gearboxes.', next: 'Calculate forward/inverse kinematics equations for a planar 2-DOF mechanism.' },
      { skillId: 'python_mech', target: 'basic', weight: 2, why: 'Robot trajectory planning and kinematics simulations are programmed in Python.', next: 'Write a Python script to simulate robot end-effector trajectory and plot workspace reach.' },
    ],
    questions: [
      Q('mr1','Robotics & Mechanisms: Can you calculate joint torque requirements, gear reductions, and design multi-DOF linkages?','automation'),
      Q('mr2','Robotic CAD Modeling: Can you model robotic mechanisms with bearing fits, motor mounts, and center-of-gravity balancing?','cad_autocad'),
      Q('mr3','Kinematics & Dynamics: Can you derive forward/inverse kinematics equations and calculate dynamic inertial forces?','structural_analysis_mech'),
      Q('mr4','Python Robot Simulation: Can you write Python scripts to simulate kinematics, trajectory paths, and plot workspace boundaries?','python_mech'),
    ],
    projects: ['Parametric CAD model and kinematic simulation of a multi-DOF robotic manipulator', 'Python simulation of robotic arm forward/inverse kinematics with visual workspace mapping'],
  },
  {
    id: 'civil-structures', branchId: 'civil', direction: 'industry', title: 'Structural Design Engineer',
    shortDescription: 'Analyze and design building frames, foundations and reinforced concrete structures.',
    skills: [
      { skillId: 'structural_analysis', target: 'intermediate', weight: 3, why: 'Calculating moments, shears, and axial forces in indeterminate structures ensures structural safety.', next: 'Analyze a multi-story building frame for dead, live, and wind/seismic loads in STAAD.Pro or ETABS.' },
      { skillId: 'concrete_rcc', target: 'intermediate', weight: 3, why: 'Reinforced concrete design according to IS 456 / limit state codes dictates beam and column sizing.', next: 'Design a continuous RCC beam and column with reinforcement detailing and bar-bending schedules.' },
      { skillId: 'autocad_civil', target: 'intermediate', weight: 3, why: 'Structural engineers produce clear reinforcement layouts and general arrangement drawings.', next: 'Draft complete structural framing plans and cross-sectional reinforcement details in AutoCAD.' },
      { skillId: 'python_civil', target: 'basic', weight: 2, why: 'Engineers use Python or automated spreadsheets for repetitive design calculations and BOQ schedules.', next: 'Build an automated spreadsheet or Python script to calculate column load takeoffs and steel quantities.' },
    ],
    questions: [
      Q('cs1','Structural Analysis: Can you trace load paths, calculate bending moments, and analyze multi-story frames in STAAD.Pro or ETABS?','structural_analysis'),
      Q('cs2','RCC Design: Can you design reinforced concrete beams, columns, and slabs conforming to IS 456 limit-state design standards?','concrete_rcc'),
      Q('cs3','AutoCAD Drafting: Can you draft detailed structural layouts, building plans, sections, elevations, and reinforcement schedules?','autocad_civil'),
      Q('cs4','Python / Spreadsheet Automation: Can you use Python or advanced Excel macros to automate BOQ estimation and bar-bending schedules?','python_civil'),
    ],
    projects: ['STAAD.Pro/ETABS structural analysis and design of a G+3 residential RCC framed building', 'Detailed structural AutoCAD drawing package with reinforcement schedules and IS 456 calculations'],
  },
  {
    id: 'civil-construction', branchId: 'civil', direction: 'industry', title: 'Construction / Project Engineer',
    shortDescription: 'Manage construction site execution, scheduling, resource planning and quantity surveying.',
    skills: [
      { skillId: 'construction', target: 'intermediate', weight: 3, why: 'Scheduling activities (CPM/PERT) and tracking milestone completion keeps projects on budget.', next: 'Develop a construction project schedule with critical path analysis in MS Project or Excel.' },
      { skillId: 'concrete_rcc', target: 'intermediate', weight: 2, why: 'Overseeing concrete pours, slump testing, and rebar placement guarantees structural integrity.', next: 'Study concrete mix design (M25/M30), curing standards, and non-destructive site testing.' },
      { skillId: 'surveying', target: 'intermediate', weight: 2, why: 'Accurate site leveling, total station boundary setting, and benchmark transfer prevent construction errors.', next: 'Practice contour mapping, leveling calculations, and coordinate layout with a total station.' },
      { skillId: 'python_civil', target: 'basic', weight: 2, why: 'Project engineers use data tools to track material procurement, budget variances, and labor productivity.', next: 'Create a spreadsheet dashboard calculating Bill of Quantities (BOQ) and cost estimation.' },
    ],
    questions: [
      Q('ccn1','Construction Scheduling: Can you break a building project into work packages, sequence activities, and determine the Critical Path (CPM)?','construction'),
      Q('ccn2','Site Quality & Concrete: Can you inspect reinforcement steel, manage concrete mix batches, and perform slump/cube strength tests?','concrete_rcc'),
      Q('ccn3','Surveying & Leveling: Can you perform leveling calculations, set building centerlines, and operate a total station or auto-level?','surveying'),
      Q('ccn4','Quantity Surveying & BOQ: Can you prepare detailed material estimates, rate analysis, and track project cost variations using spreadsheets?','python_civil'),
    ],
    projects: ['Comprehensive construction project schedule (CPM) with resource allocation and procurement plan', 'Detailed Bill of Quantities (BOQ) and cost estimation case study for a multi-story building'],
  },
  {
    id: 'civil-infra', branchId: 'civil', direction: 'industry', title: 'Infrastructure / Urban Planning Analyst',
    shortDescription: 'Plan transportation corridors, water networks, drainage and municipal infrastructure with GIS.',
    skills: [
      { skillId: 'surveying', target: 'intermediate', weight: 3, why: 'GIS spatial data layers and terrain elevation models guide infrastructure route alignments.', next: 'Create a GIS map analyzing terrain slopes, water drainage basins, and road network alignments.' },
      { skillId: 'autocad_civil', target: 'intermediate', weight: 3, why: 'Civil 3D is used to draft highway corridors, cross-sections, and grading earthwork volumes.', next: 'Model a road alignment with longitudinal profiles and earthwork cut/fill volumes in Civil 3D.' },
      { skillId: 'construction', target: 'basic', weight: 2, why: 'Infrastructure projects involve public contracts, environmental impact, and phased municipal budgets.', next: 'Study tender documentation, environmental compliance, and public works execution.' },
      { skillId: 'python_civil', target: 'basic', weight: 2, why: 'Spatial data analysts use Python (GeoPandas) for traffic flow and stormwater runoff computations.', next: 'Write a Python script to compute runoff volumes using the Rational Method for an urban catchment.' },
    ],
    questions: [
      Q('ci1','GIS & Spatial Mapping: Can you analyze terrain elevation data, watershed boundaries, and create infrastructure maps in GIS?','surveying'),
      Q('ci2','Civil 3D & Alignment: Can you design road alignments, longitudinal profiles, and calculate cut/fill earthwork in Civil 3D?','autocad_civil'),
      Q('ci3','Infrastructure Coordination: Can you evaluate drainage network capacity, utility easements, and traffic corridor planning?','construction'),
      Q('ci4','Hydrology / Data Python: Can you use Python or analytical spreadsheets to model urban runoff and stormwater channel dimensions?','python_civil'),
    ],
    projects: ['GIS-based regional urban watershed and drainage network analysis report', 'Civil 3D roadway corridor design with profiles, cross-sections, and mass-haul earthwork diagram'],
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
      { skillId: 'plant', target: 'intermediate', weight: 3, why: 'Plant operations require familiarity with pumps, valves, columns and heat exchangers.', next: 'Study major process equipment and common operational failure modes.' },
      { skillId: 'safety', target: 'intermediate', weight: 3, why: 'Safe operations are mandatory in chemical plants.', next: 'Learn HAZOP and basic risk-reduction concepts.' },
      { skillId: 'process-control', target: 'basic', weight: 2, why: 'Understanding control loops helps operators keep processes within safe bounds.', next: 'Study temperature, level, pressure and flow control loops.' },
    ],
    questions: [Q('cpl1','Can you identify the main components of a pump/piping loop?','plant'), Q('cpl2','Can you identify a safety hazard in a process line?','safety'), Q('cpl3','Can you explain how a PID controller keeps tank level steady?','process-control')],
    projects: ['Plant operations case study', 'HAZOP review of a simple process unit'],
  },
  {
    id: 'chem-safety', branchId: 'chemical', direction: 'industry', title: 'Process Safety Specialist',
    shortDescription: 'Identify hazards, assess risk and ensure safe plant design and operation.',
    skills: [
      { skillId: 'safety', target: 'intermediate', weight: 3, why: 'Safety specialists focus on risk identification and prevention.', next: 'Conduct a mock HAZOP study for a small reactor unit.' },
      { skillId: 'mass-energy', target: 'basic', weight: 2, why: 'Understanding reaction energetics and runaway risk requires balance knowledge.', next: 'Study runaway reactions and relief system sizing.' },
      { skillId: 'process-control', target: 'basic', weight: 2, why: 'Safety Instrumented Systems (SIS) rely on control logic.', next: 'Learn interlocks and emergency shutdown (ESD) concepts.' },
    ],
    questions: [Q('csf1','Can you identify three common industrial process safety hazards?','safety'), Q('csf2','Can you explain why runaway reactions occur?','mass-energy'), Q('csf3','Can you explain the function of an interlock?','process-control')],
    projects: ['Process hazard analysis report', 'Safety relief valve sizing exercise'],
  },
  {
    id: 'mecha-robotics', branchId: 'mechatronics', direction: 'industry', title: 'Robotics Systems Engineer',
    shortDescription: 'Build and program integrated robots combining mechanics, electronics and code.',
    skills: [
      { skillId: 'robotics', target: 'intermediate', weight: 3, why: 'Robotics requires combining kinematic reasoning with programming.', next: 'Build a small multi-DOF arm or mobile robot.' },
      { skillId: 'mecha-c', target: 'intermediate', weight: 3, why: 'Microcontroller and system programming is essential for robotics.', next: 'Write low-level robot control code with sensor feedback.' },
      { skillId: 'sensors', target: 'basic', weight: 2, why: 'Sensors provide the perception robots need to interact with the world.', next: 'Interface ultrasonic, IMU and optical sensors with a controller.' },
      { skillId: 'control-mecha', target: 'basic', weight: 2, why: 'Motion control depends on closed-loop feedback.', next: 'Implement a PID motor speed or position controller.' },
    ],
    questions: [Q('mr1','Can you explain forward and inverse kinematics?','robotics'), Q('mr2','Can you write embedded code to control a motor via PWM?','mecha-c'), Q('mr3','Can you read data from an IMU or sensor over I2C/SPI?','sensors')],
    projects: ['Autonomous mobile robot with obstacle avoidance', '2-DOF or 3-DOF robotic arm with inverse kinematics control'],
  },
  {
    id: 'mecha-automation', branchId: 'mechatronics', direction: 'industry', title: 'Mechatronics Automation Specialist',
    shortDescription: 'Design and integrate automated production machinery and electro-mechanical systems.',
    skills: [
      { skillId: 'plc-mecha', target: 'intermediate', weight: 3, why: 'Industrial automation runs on PLCs and fieldbus communication.', next: 'Build a simulated packaging or sorting line in a PLC tool.' },
      { skillId: 'sensors', target: 'intermediate', weight: 2, why: 'Automation requires reliable sensor-actuator pairing.', next: 'Select sensors for position, proximity and presence detection.' },
      { skillId: 'control-mecha', target: 'basic', weight: 2, why: 'Closed-loop systems maintain speed, position and tension.', next: 'Study feedback controllers for industrial drives.' },
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
