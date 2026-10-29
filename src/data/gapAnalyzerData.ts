export type SkillLevel = 'none' | 'beginner' | 'basic' | 'intermediate' | 'advanced';

export type AcademicStage =
  | '1st Year – Sem 1'
  | '1st Year – Sem 2'
  | '2nd Year – Sem 3'
  | '2nd Year – Sem 4'
  | '3rd Year – Sem 5'
  | '3rd Year – Sem 6'
  | '4th Year – Sem 7'
  | '4th Year – Sem 8'
  | 'Graduate';

export type CareerDirection =
  | 'industry'
  | 'entrepreneur'
  | 'higher-studies'
  | 'government'
  | 'not-sure';

export const DIRECTION_LABELS: Record<CareerDirection, string> = {
  industry: 'Industry & Private Tech',
  entrepreneur: 'Startup / Entrepreneurship',
  'higher-studies': 'Higher Studies (GATE / GRE / MS)',
  government: 'PSU / Government Careers',
  'not-sure': 'Open Branch Exploration',
};

export interface BranchDefinition {
  id: string;
  name: string;
  category: 'cs_it' | 'circuits' | 'mechanical_aero' | 'civil_infra' | 'chemical_bio' | 'agri_food' | 'other';
  description: string;
}

export const ALL_BRANCHES: BranchDefinition[] = [
  { id: 'cse', name: 'CSE', category: 'cs_it', description: 'Computer Science and Engineering core software & computing.' },
  { id: 'cse_ai', name: 'CSE (AI)', category: 'cs_it', description: 'Artificial Intelligence specialisation within Computer Science.' },
  { id: 'cse_aiml', name: 'CSE (AI & ML)', category: 'cs_it', description: 'Machine Learning algorithms, deep networks and AI systems.' },
  { id: 'cse_ds', name: 'CSE (Data Science)', category: 'cs_it', description: 'Big data pipelines, analytics, statistics, and machine learning.' },
  { id: 'cse_cyber', name: 'CSE (Cyber Security)', category: 'cs_it', description: 'Network defense, ethical hacking, digital forensics, and cryptography.' },
  { id: 'cse_iot', name: 'CSE (IoT)', category: 'cs_it', description: 'Connected smart devices, sensors, edge computing, and networks.' },
  { id: 'it', name: 'IT', category: 'cs_it', description: 'Information Technology, cloud services, and enterprise software.' },
  { id: 'aids', name: 'AI & Data Science', category: 'cs_it', description: 'Combined AI reasoning, statistical modeling, and data pipelines.' },
  { id: 'ece', name: 'ECE', category: 'circuits', description: 'Electronics, communications, VLSI, microcontrollers and embedded.' },
  { id: 'eee', name: 'EEE', category: 'circuits', description: 'Electrical energy, power systems, power electronics, and drives.' },
  { id: 'ee', name: 'Electrical Engineering', category: 'circuits', description: 'Electrical machines, power grids, renewable energy, and control.' },
  { id: 'instrumentation', name: 'Instrumentation', category: 'circuits', description: 'Process instrumentation, sensors, control loops, and automation.' },
  { id: 'mechanical', name: 'Mechanical', category: 'mechanical_aero', description: 'Mechanics, CAD, thermal systems, manufacturing, and design.' },
  { id: 'mech_robotics', name: 'Mechanical & Robotics', category: 'mechanical_aero', description: 'Robotic kinematics, actuators, automation, and mechanical design.' },
  { id: 'mechatronics', name: 'Mechatronics', category: 'mechanical_aero', description: 'Integration of mechanical, electronics, and control systems.' },
  { id: 'civil', name: 'Civil', category: 'civil_infra', description: 'Structures, concrete, construction management, and infrastructure.' },
  { id: 'chemical', name: 'Chemical', category: 'chemical_bio', description: 'Chemical processes, reactors, mass/heat transfer, and refining.' },
  { id: 'biotechnology', name: 'Biotechnology', category: 'chemical_bio', description: 'Bioprocesses, bioinformatics, molecular biology, and pharmaceuticals.' },
  { id: 'biomedical', name: 'Biomedical', category: 'chemical_bio', description: 'Medical instrumentation, biosensors, imaging, and healthcare tech.' },
  { id: 'aerospace', name: 'Aerospace', category: 'mechanical_aero', description: 'Aerodynamics, propulsion, aircraft structures, and flight mechanics.' },
  { id: 'automobile', name: 'Automobile', category: 'mechanical_aero', description: 'Vehicle dynamics, powertrains, chassis, and EV technology.' },
  { id: 'production', name: 'Production', category: 'mechanical_aero', description: 'Manufacturing operations, quality control, tooling, and supply chain.' },
  { id: 'industrial', name: 'Industrial', category: 'mechanical_aero', description: 'Operations research, process efficiency, ergonomics, and logistics.' },
  { id: 'food_tech', name: 'Food Technology', category: 'agri_food', description: 'Food processing, preservation, quality compliance, and packaging.' },
  { id: 'agricultural', name: 'Agricultural Engineering', category: 'agri_food', description: 'Farm machinery, irrigation, precision agri-tech, and soil water.' },
  { id: 'other', name: 'Other', category: 'other', description: 'Interdisciplinary or emerging engineering branches.' },
];

export const ACADEMIC_STAGES: AcademicStage[] = [
  '1st Year – Sem 1',
  '1st Year – Sem 2',
  '2nd Year – Sem 3',
  '2nd Year – Sem 4',
  '3rd Year – Sem 5',
  '3rd Year – Sem 6',
  '4th Year – Sem 7',
  '4th Year – Sem 8',
  'Graduate',
];

export interface CareerOption {
  id: string;
  title: string;
  domain: 'software' | 'data' | 'cyber' | 'embedded' | 'vlsi' | 'electrical' | 'mechanical' | 'civil' | 'chemical' | 'biotech' | 'agri' | 'general';
  category: string;
  description: string;
  typicalTools: string[];
}

export const ALL_CAREERS: CareerOption[] = [
  // CSE / IT / AI / DS
  { id: 'software-engineer', title: 'Software Engineer', domain: 'software', category: 'Core Tech', description: 'Building scalable applications, services, and backend systems.', typicalTools: ['Java', 'C++', 'Python', 'Git', 'SQL'] },
  { id: 'frontend-developer', title: 'Frontend Developer', domain: 'software', category: 'Core Tech', description: 'Crafting responsive user interfaces, design systems, and client logic.', typicalTools: ['React', 'TypeScript', 'Tailwind', 'Next.js'] },
  { id: 'backend-developer', title: 'Backend Developer', domain: 'software', category: 'Core Tech', description: 'Designing high-performance APIs, databases, authentication, and servers.', typicalTools: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'Redis'] },
  { id: 'full-stack-developer', title: 'Full Stack Developer', domain: 'software', category: 'Core Tech', description: 'End-to-end web architecture from reactive UI to cloud database schemas.', typicalTools: ['TypeScript', 'React', 'Node/Python', 'PostgreSQL', 'REST'] },
  { id: 'mobile-developer', title: 'Mobile Developer', domain: 'software', category: 'Core Tech', description: 'Native and cross-platform mobile apps for Android and iOS.', typicalTools: ['Flutter', 'React Native', 'Kotlin', 'Swift'] },
  { id: 'cloud-engineer', title: 'Cloud Engineer', domain: 'software', category: 'Infrastructure', description: 'Architecting resilient cloud infrastructure, VPCs, and serverless compute.', typicalTools: ['AWS', 'GCP', 'Terraform', 'Kubernetes'] },
  { id: 'devops-engineer', title: 'DevOps Engineer', domain: 'software', category: 'Infrastructure', description: 'CI/CD automation, container orchestration, monitoring, and release pipelines.', typicalTools: ['Docker', 'Kubernetes', 'GitHub Actions', 'Linux'] },
  { id: 'data-analyst', title: 'Data Analyst', domain: 'data', category: 'Data & Analytics', description: 'Transforming raw business data into actionable dashboards and SQL insights.', typicalTools: ['SQL', 'Python/Pandas', 'PowerBI', 'Tableau'] },
  { id: 'data-scientist', title: 'Data Scientist', domain: 'data', category: 'Data & Analytics', description: 'Statistical modelling, predictive analytics, hypothesis testing, and ML.', typicalTools: ['Python', 'Scikit-learn', 'Statistics', 'SQL'] },
  { id: 'ml-engineer', title: 'ML Engineer', domain: 'data', category: 'AI & Data', description: 'Deploying machine learning models to production and tuning inference pipelines.', typicalTools: ['PyTorch', 'TensorFlow', 'MLOps', 'FastAPI'] },
  { id: 'ai-engineer', title: 'AI Engineer', domain: 'data', category: 'AI & Data', description: 'Integrating LLMs, RAG pipelines, agentic workflows, and neural architectures.', typicalTools: ['Python', 'LangChain', 'Gemini/OpenAI APIs', 'Vector DBs'] },
  { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst', domain: 'cyber', category: 'Security', description: 'Defending networks, assessing vulnerabilities, incident response, and pen testing.', typicalTools: ['Wireshark', 'Burp Suite', 'Linux', 'Nmap', 'SIEM'] },
  { id: 'qa-automation-engineer', title: 'QA/Automation Engineer', domain: 'software', category: 'Quality', description: 'Automated test frameworks, integration tests, performance benchmarking, and QA.', typicalTools: ['Selenium', 'Cypress', 'Playwright', 'Postman'] },
  { id: 'database-engineer', title: 'Database Engineer', domain: 'software', category: 'Data Architecture', description: 'Database performance tuning, index optimization, sharding, and ACID replication.', typicalTools: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { id: 'embedded-software-engineer', title: 'Embedded Software Engineer', domain: 'embedded', category: 'Hardware/Software', description: 'Low-level C/C++ firmware, device drivers, and microcontrollers.', typicalTools: ['C', 'C++', 'ARM Cortex', 'FreeRTOS', 'Linux'] },
  { id: 'product-engineer', title: 'Product Engineer', domain: 'software', category: 'Product', description: 'Bridging engineering execution, user metrics, and agile feature delivery.', typicalTools: ['Figma', 'TypeScript', 'Analytics', 'Git'] },
  { id: 'startup-entrepreneur', title: 'Startup/Entrepreneur', domain: 'general', category: 'Entrepreneurship', description: 'Customer discovery, rapid MVP validation, technical prototyping, and venture launch.', typicalTools: ['MVP Tech', 'Stripe', 'User Interviews', 'Pitch Deck'] },

  // ECE
  { id: 'embedded-engineer', title: 'Embedded Engineer', domain: 'embedded', category: 'Core Electronics', description: 'Microcontrollers, firmware design, real-time operating systems, and interfaces.', typicalTools: ['Embedded C', 'STM32', 'ESP32', 'UART/SPI/I2C'] },
  { id: 'vlsi-engineer', title: 'VLSI Engineer', domain: 'vlsi', category: 'Semiconductors', description: 'RTL design, Verilog/VHDL, ASIC/SoC workflows, and synthesis.', typicalTools: ['Verilog', 'SystemVerilog', 'Cadence/Synopsys', 'FPGA'] },
  { id: 'fpga-engineer', title: 'FPGA Engineer', domain: 'vlsi', category: 'Digital Hardware', description: 'Hardware acceleration, high-throughput DSP, and FPGA fabric synthesis.', typicalTools: ['Xilinx Vivado', 'Verilog', 'VHDL', 'ModelSim'] },
  { id: 'pcb-design-engineer', title: 'PCB Design Engineer', domain: 'embedded', category: 'Hardware Design', description: 'Schematic capture, multi-layer board routing, signal integrity, and fabrication.', typicalTools: ['KiCad', 'Altium Designer', 'Eagle', 'Gerber'] },
  { id: 'iot-engineer', title: 'IoT Engineer', domain: 'embedded', category: 'Connected Systems', description: 'Sensor integration, wireless telemetry, MQTT broker pipelines, and edge compute.', typicalTools: ['MQTT', 'ESP-IDF', 'C/C++', 'Node-RED'] },
  { id: 'robotics-engineer', title: 'Robotics Engineer', domain: 'mechanical', category: 'Robotics', description: 'Kinematics, actuator control, ROS, sensor fusion, and autonomous navigation.', typicalTools: ['ROS 2', 'Python', 'C++', 'Gazebo', 'LiDAR'] },
  { id: 'control-systems-engineer', title: 'Control Systems Engineer', domain: 'electrical', category: 'Automation', description: 'Feedback control, PID tuning, state-space modeling, and industrial PLCs.', typicalTools: ['MATLAB', 'Simulink', 'PLC Ladder', 'SCADA'] },
  { id: 'telecom-rf-engineer', title: 'Telecom/RF Engineer', domain: 'embedded', category: 'Communications', description: 'RF circuit design, antenna design, 5G/4G cellular architectures, and modulation.', typicalTools: ['ADS', 'HFSS', 'GNU Radio', 'Spectrum Analyzers'] },

  // EEE & Electrical
  { id: 'power-systems', title: 'Power Systems', domain: 'electrical', category: 'Core Electrical', description: 'Grid transmission, load flow studies, substation engineering, and protective relays.', typicalTools: ['ETAP', 'MATLAB/Simulink', 'PowerWorld'] },
  { id: 'electrical-design', title: 'Electrical Design', domain: 'electrical', category: 'Engineering Design', description: 'Single line diagrams, switchboards, load calculations, and industrial installations.', typicalTools: ['AutoCAD Electrical', 'Revit', 'Dialux'] },
  { id: 'power-electronics', title: 'Power Electronics', domain: 'electrical', category: 'Core Electrical', description: 'Switched-mode power supplies, inverters, converters, and motor drive controllers.', typicalTools: ['Simulink', 'PSIM', 'LTspice', 'IGBT/MOSFETs'] },
  { id: 'ev-engineer', title: 'EV Engineer', domain: 'electrical', category: 'Clean Mobility', description: 'Battery pack design, BMS firmware, electric powertrains, and charging interfaces.', typicalTools: ['Simulink', 'CAN Bus', 'BMS Algorithms', 'Thermal Tools'] },
  { id: 'renewable-energy', title: 'Renewable Energy', domain: 'electrical', category: 'Clean Tech', description: 'Solar PV farm engineering, wind turbine systems, and grid-tied inverters.', typicalTools: ['PVsyst', 'HOMER Pro', 'MATLAB'] },

  // Mechanical / Aero / Auto / Mechatronics
  { id: 'mechanical-design', title: 'Mechanical Design', domain: 'mechanical', category: 'Core Mechanical', description: 'Mechanical component modeling, tolerance stack-up, GD&T, and prototyping.', typicalTools: ['SolidWorks', 'CATIA', 'Creo', 'GD&T'] },
  { id: 'cad-engineer', title: 'CAD Engineer', domain: 'mechanical', category: 'Drafting & Modeling', description: 'Parametric 3D part modeling, sheet metal design, and production drawings.', typicalTools: ['SolidWorks', 'AutoCAD', 'Inventor'] },
  { id: 'cae-engineer', title: 'CAE Engineer', domain: 'mechanical', category: 'Simulation', description: 'Finite Element Analysis (FEA), structural stress analysis, and CFD fluid dynamics.', typicalTools: ['ANSYS Mechanical', 'HyperMesh', 'Fluent', 'Abaqus'] },
  { id: 'manufacturing', title: 'Manufacturing', domain: 'mechanical', category: 'Industrial', description: 'CNC programming, machining processes, tooling design, and factory shop floor.', typicalTools: ['Mastercam', 'CAMWorks', 'Lean 5S', 'Six Sigma'] },
  { id: 'production', title: 'Production', domain: 'mechanical', category: 'Industrial', description: 'Assembly line balancing, throughput maximization, and production scheduling.', typicalTools: ['ERP Systems', 'Kaizen', 'Work Study'] },
  { id: 'automotive', title: 'Automotive', domain: 'mechanical', category: 'Mobility', description: 'Chassis design, suspension kinematics, internal combustion & electric powertrains.', typicalTools: ['ADAMS/Car', 'MATLAB', 'CATIA'] },
  { id: 'automation', title: 'Automation', domain: 'mechanical', category: 'Industrial Tech', description: 'Factory automation, pneumatic/hydraulic circuits, and industrial manipulators.', typicalTools: ['Siemens TIA Portal', 'Omron PLC', 'RoboDK'] },
  { id: 'mechatronics', title: 'Mechatronics', domain: 'mechanical', category: 'Interdisciplinary', description: 'Actuators, microcontrollers, sensor integration, and closed-loop electro-mechanical rigs.', typicalTools: ['Arduino/STM32', 'SolidWorks', 'MATLAB', 'Sensors'] },
  { id: 'aerospace', title: 'Aerospace', domain: 'mechanical', category: 'Aviation', description: 'Airfoil aerodynamics, structural airframe design, propulsion, and avionics basics.', typicalTools: ['ANSYS Fluent', 'XFLR5', 'CATIA'] },
  { id: 'product-design', title: 'Product Design', domain: 'mechanical', category: 'Design', description: 'Industrial design, aesthetic form factors, DFM, injection molding, and ergonomic UX.', typicalTools: ['SolidWorks', 'Rhino', 'KeyShot'] },
  { id: 'industrial-engineering', title: 'Industrial Engineering', domain: 'mechanical', category: 'Operations', description: 'Supply chain optimization, logistics networks, plant layout, and quality assurance.', typicalTools: ['Arena Simulation', 'Minitab', 'Linear Programming'] },

  // Civil
  { id: 'structural', title: 'Structural', domain: 'civil', category: 'Core Civil', description: 'RCC and structural steel design, seismic resistance, load calculations, and IS codes.', typicalTools: ['STAAD.Pro', 'ETABS', 'SAFE', 'IS 456 / IS 800'] },
  { id: 'construction', title: 'Construction', domain: 'civil', category: 'Site Management', description: 'Execution planning, material testing, safety protocols, and contract management.', typicalTools: ['Primavera P6', 'MS Project', 'Site Inspection'] },
  { id: 'site-engineer', title: 'Site Engineer', domain: 'civil', category: 'Field Operations', description: 'Site layout leveling, bar bending schedules, formwork oversight, and concrete pours.', typicalTools: ['Total Station', 'AutoCAD', 'BBS Spreadsheets'] },
  { id: 'transportation', title: 'Transportation', domain: 'civil', category: 'Infrastructure', description: 'Highway geometric design, pavement design, traffic engineering, and road safety.', typicalTools: ['Civil 3D', 'MX Road', 'VISSIM'] },
  { id: 'geotechnical', title: 'Geotechnical', domain: 'civil', category: 'Soil Mechanics', description: 'Foundation design, soil bearing capacity, slope stability, and earth retaining walls.', typicalTools: ['PLAXIS', 'GeoStudio', 'Soil Lab Testing'] },
  { id: 'environmental', title: 'Environmental', domain: 'civil', category: 'Sustainability', description: 'Water treatment plants, sewage network design, EIA, and solid waste management.', typicalTools: ['WaterGEMS', 'SewerGEMS', 'EPANET'] },
  { id: 'bim', title: 'BIM', domain: 'civil', category: 'Digital Construction', description: 'Building Information Modeling, 3D architectural/structural clash detection, and Revit.', typicalTools: ['Autodesk Revit', 'Navisworks', 'BIM 360'] },
  { id: 'quantity-surveying', title: 'Quantity Surveying', domain: 'civil', category: 'Cost Engineering', description: 'Detailed bill of quantities (BOQ), rate analysis, cost estimation, and tenders.', typicalTools: ['PlanSwift', 'Excel BOQ', 'CostX'] },
  { id: 'infrastructure', title: 'Infrastructure', domain: 'civil', category: 'Public Works', description: 'Bridges, urban metro corridors, drainage basins, and smart city infrastructure.', typicalTools: ['Civil 3D', 'Bentley OpenRoads'] },
  { id: 'gis', title: 'GIS', domain: 'civil', category: 'Spatial Tech', description: 'Geospatial mapping, remote sensing, satellite data analysis, and terrain elevation.', typicalTools: ['ArcGIS', 'QGIS', 'Google Earth Engine'] },

  // Chemical & Bio
  { id: 'process-engineer', title: 'Process Engineer', domain: 'chemical', category: 'Core Chemical', description: 'Continuous process flows, heat/mass exchangers, distillation, and plant efficiency.', typicalTools: ['Aspen Plus', 'DWSIM', 'ChemCAD'] },
  { id: 'plant-operations', title: 'Plant Operations', domain: 'chemical', category: 'Manufacturing', description: 'Chemical plant control rooms, P&ID compliance, emergency shutdowns, and hazop.', typicalTools: ['SCADA', 'P&ID Diagrams', 'HAZOP Protocols'] },
  { id: 'petrochemical-refining', title: 'Petrochemical & Refining', domain: 'chemical', category: 'Energy', description: 'Fractionation columns, catalytic cracking, desulfurization, and refinery workflows.', typicalTools: ['Aspen HYSYS', 'Petroleum Testing Standards'] },
  { id: 'polymers-materials', title: 'Polymers & Materials', domain: 'chemical', category: 'Materials', description: 'Polymer synthesis, rheology, composite materials, and characterization (DSC/FTIR).', typicalTools: ['Materials Lab', 'Rheometer', 'Extrusion Tools'] },
  { id: 'safety-environmental', title: 'Safety & Environmental', domain: 'chemical', category: 'Compliance', description: 'Industrial occupational health, effluent treatment plants, and carbon auditing.', typicalTools: ['OSHA Standards', 'EIA', 'Gas Detectors'] },
  { id: 'quality-control', title: 'Quality Control', domain: 'chemical', category: 'Analytical', description: 'HPLC, GCMS chromatography, analytical wet chemistry, and validation protocols.', typicalTools: ['HPLC', 'Spectrophotometry', 'GMP'] },
  { id: 'biochemical-pharmaceuticals', title: 'Biochemical / Pharmaceuticals', domain: 'chemical', category: 'Pharma', description: 'API formulation, sterile processing, bioreactors, and drug delivery systems.', typicalTools: ['Bioreactors', 'GMP Guidelines', 'Sterilization'] },
  { id: 'bioinformatics', title: 'Bioinformatics / Computational Biology', domain: 'biotech', category: 'Bio-Tech', description: 'Genomic sequence alignment, structural biology, molecular docking, and NGS data.', typicalTools: ['Python/Biopython', 'R/Bioconductor', 'BLAST', 'PyMOL'] },
  { id: 'clinical-research', title: 'Clinical Research', domain: 'biotech', category: 'Healthcare', description: 'Clinical trials monitoring, ICH-GCP regulatory filings, and patient data management.', typicalTools: ['EDC Systems', 'ICH-GCP', 'SAS/R'] },
  { id: 'biomedical-equipment-engineer', title: 'Biomedical Equipment Engineer', domain: 'biotech', category: 'Hospital Tech', description: 'Calibration, maintenance, and compliance for patient monitors, ventilators, and MRI.', typicalTools: ['Biomedical Analyzers', 'Oscilloscopes', 'IEC 60601'] },

  // Food & Agri
  { id: 'food-quality-safety', title: 'Food Quality & Safety (QA/QC)', domain: 'agri', category: 'Quality', description: 'HACCP, ISO 22000, FSSAI regulations, microbiology testing, and adulteration checks.', typicalTools: ['FSSAI Standards', 'HACCP Manuals', 'Lab Analytics'] },
  { id: 'food-processing-preservation', title: 'Food Processing & Preservation', domain: 'agri', category: 'Manufacturing', description: 'Thermal processing, canning, cold storage logistics, extrusion, and freeze drying.', typicalTools: ['Packaging Machines', 'Retort Cookers', 'Cold Chain'] },
  { id: 'agritech-automation', title: 'Agri-Tech Automation / Precision Farming', domain: 'agri', category: 'Smart Agri', description: 'Drones, soil moisture sensors, automated drip fertigation, and satellite farm analytics.', typicalTools: ['IoT Sensors', 'Arduino/ESP32', 'GIS Imagery'] },
  { id: 'irrigation-water-resources', title: 'Irrigation & Water Resources', domain: 'agri', category: 'Water Tech', description: 'Canal hydraulics, drip irrigation network design, watershed management, and hydrology.', typicalTools: ['HEC-RAS', 'CropWat', 'GIS'] },
  { id: 'farm-machinery-design', title: 'Farm Machinery Design', domain: 'agri', category: 'Equipment', description: 'Tractor implements, combine harvesters, seed drills, and power transmission.', typicalTools: ['SolidWorks', 'CAD', 'Field Testing'] },

  // Universal Cross-Domain
  { id: 'other-career', title: 'Other / Explore a different career', domain: 'general', category: 'Exploration', description: 'Tailor your assessment for any unique or interdisciplinary career target.', typicalTools: ['Custom Stack'] },
];

/**
 * Returns dynamic, authentic career options strictly matching the selected branch.
 * Includes the branch-native roles, core crossover paths, and the "Other / Explore" escape hatch.
 */
export function getCareersForBranch(branchId: string): CareerOption[] {
  const otherOption = ALL_CAREERS.find((c) => c.id === 'other-career')!;

  switch (branchId) {
    case 'cse':
    case 'cse_ai':
    case 'cse_aiml':
    case 'cse_ds':
    case 'cse_cyber':
    case 'cse_iot':
    case 'it':
    case 'aids':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'software-engineer',
            'frontend-developer',
            'backend-developer',
            'full-stack-developer',
            'mobile-developer',
            'cloud-engineer',
            'devops-engineer',
            'data-analyst',
            'data-scientist',
            'ml-engineer',
            'ai-engineer',
            'cybersecurity-analyst',
            'qa-automation-engineer',
            'database-engineer',
            'embedded-software-engineer',
            'product-engineer',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'ece':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'embedded-engineer',
            'vlsi-engineer',
            'fpga-engineer',
            'pcb-design-engineer',
            'iot-engineer',
            'robotics-engineer',
            'control-systems-engineer',
            'telecom-rf-engineer',
            'software-engineer',
            'ai-engineer',
            'data-analyst',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'eee':
    case 'ee':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'power-systems',
            'electrical-design',
            'power-electronics',
            'ev-engineer',
            'control-systems-engineer',
            'embedded-engineer',
            'renewable-energy',
            'software-engineer',
            'data-analyst',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'instrumentation':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'automation',
            'control-systems-engineer',
            'embedded-engineer',
            'iot-engineer',
            'biomedical-equipment-engineer',
            'software-engineer',
            'data-analyst',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'mechanical':
    case 'mech_robotics':
    case 'mechatronics':
    case 'automobile':
    case 'aerospace':
    case 'production':
    case 'industrial':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'mechanical-design',
            'cad-engineer',
            'cae-engineer',
            'manufacturing',
            'production',
            'automotive',
            'robotics-engineer',
            'automation',
            'mechatronics',
            'ev-engineer',
            'aerospace',
            'product-design',
            'industrial-engineering',
            'software-engineer',
            'data-analyst',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'civil':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'structural',
            'construction',
            'site-engineer',
            'transportation',
            'geotechnical',
            'environmental',
            'bim',
            'quantity-surveying',
            'infrastructure',
            'gis',
            'software-engineer',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'chemical':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'process-engineer',
            'plant-operations',
            'petrochemical-refining',
            'polymers-materials',
            'safety-environmental',
            'quality-control',
            'biochemical-pharmaceuticals',
            'data-analyst',
            'software-engineer',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'biotechnology':
    case 'biomedical':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'bioinformatics',
            'clinical-research',
            'biomedical-equipment-engineer',
            'quality-control',
            'biochemical-pharmaceuticals',
            'data-analyst',
            'software-engineer',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    case 'food_tech':
    case 'agricultural':
      return [
        ...ALL_CAREERS.filter((c) =>
          [
            'food-quality-safety',
            'food-processing-preservation',
            'agritech-automation',
            'irrigation-water-resources',
            'farm-machinery-design',
            'quality-control',
            'data-analyst',
            'software-engineer',
            'startup-entrepreneur',
          ].includes(c.id)
        ),
        otherOption,
      ];

    default:
      return ALL_CAREERS;
  }
}

/**
 * Universal Personal Profile Questions (Section 2)
 */
export interface PersonalProfileQuestion {
  id: string;
  label: string;
  description: string;
  options: { label: string; value: string; weight: number }[];
}

export const PERSONAL_QUESTIONS: PersonalProfileQuestion[] = [
  {
    id: 'confidence',
    label: 'How confident are you about targeting this career?',
    description: 'Helps us tailor whether you need broader exploration or targeted placement drills.',
    options: [
      { label: 'Just exploring / Curious beginner', value: 'exploring', weight: 1 },
      { label: 'Interested, but still evaluating options', value: 'evaluating', weight: 2 },
      { label: 'Fairly confident with a clear goal in mind', value: 'confident', weight: 3 },
      { label: '100% committed — actively training for this role', value: 'committed', weight: 4 },
    ],
  },
  {
    id: 'time_weekly',
    label: 'How much time can you realistically invest per week?',
    description: 'Ensures milestone roadmaps fit your academic semester without burnout.',
    options: [
      { label: '3–5 hours / week (Light pace / Exam heavy)', value: 'light', weight: 1 },
      { label: '6–10 hours / week (Balanced steady routine)', value: 'balanced', weight: 2 },
      { label: '11–15 hours / week (Dedicated skill builder)', value: 'focused', weight: 3 },
      { label: '16+ hours / week (Intensive interview/placement grind)', value: 'intensive', weight: 4 },
    ],
  },
  {
    id: 'project_experience',
    label: 'What project experience do you currently have?',
    description: 'We evaluate verifiable repositories, simulations, and working prototypes.',
    options: [
      { label: 'No projects yet / Theoretical understanding only', value: 'none', weight: 0 },
      { label: 'Followed YouTube tutorials / Replicated guided repos', value: 'tutorials', weight: 1 },
      { label: 'Built 1–2 small standalone projects independently', value: 'standalone', weight: 2 },
      { label: 'Built a multi-component / deployed project with public repo', value: 'deployed', weight: 3 },
      { label: 'Built production systems, open-source work, or research prototypes', value: 'advanced', weight: 4 },
    ],
  },
  {
    id: 'internship_experience',
    label: 'Any prior technical internship or real-world experience?',
    description: 'Industry exposure accelerates candidate shortlisting.',
    options: [
      { label: 'No internship or industry experience yet', value: 'none', weight: 0 },
      { label: 'Active in college technical club / lab projects', value: 'club', weight: 1 },
      { label: 'Completed virtual or training simulation internship', value: 'virtual', weight: 2 },
      { label: 'Completed 1+ formal industry internships with certificate/proof', value: 'industry', weight: 3 },
      { label: 'Working professional, active freelancer, or contract dev', value: 'working', weight: 4 },
    ],
  },
  {
    id: 'independent_learning',
    label: 'How comfortable are you learning independently without a professor?',
    description: 'Measures your self-driven debugging and technical exploration agility.',
    options: [
      { label: 'Need guided step-by-step hand-holding', value: 'guided', weight: 1 },
      { label: 'Can follow structured video courses and tutorials', value: 'courses', weight: 2 },
      { label: 'Comfortable reading official docs, APIs, and books', value: 'docs', weight: 3 },
      { label: 'Can debug StackOverflow/source code and solve roadblocks alone', value: 'autonomous', weight: 4 },
    ],
  },
  {
    id: 'explaining_work',
    label: 'How comfortable are you explaining your technical work to others?',
    description: 'Vital for viva panels, tech recruiter screens, and system design rounds.',
    options: [
      { label: 'Hesitant — I struggle to articulate my technical decisions', value: 'hesitant', weight: 1 },
      { label: 'Can explain if asked direct, specific questions', value: 'prompted', weight: 2 },
      { label: 'Comfortable walking through my code, circuits, or drawings', value: 'comfortable', weight: 3 },
      { label: 'Confident defending trade-offs, architecture, and edge cases to seniors', value: 'confident', weight: 4 },
    ],
  },
];

/**
 * Adaptive Question Definition
 */
export interface AdaptiveQuestion {
  id: string;
  competencyId: string;
  competencyName: string;
  category: 'core' | 'tools' | 'systems' | 'applied' | 'communication';
  prompt: string;
  helperText?: string;
  options: {
    label: string;
    level: SkillLevel;
    numericWeight: number; // 0 to 4
    explanation: string;
  }[];
}

/**
 * Year-aware expectation mapping
 */
export function getYearExpectedLevel(stage: AcademicStage, competencyCategory: string): number {
  const isFirstYear = stage.startsWith('1st Year');
  const isSecondYear = stage.startsWith('2nd Year');
  const isThirdYear = stage.startsWith('3rd Year');

  if (isFirstYear) {
    if (competencyCategory === 'core') return 2; // Basic
    if (competencyCategory === 'communication') return 2;
    return 1; // Beginner for systems/tools/applied
  }

  if (isSecondYear) {
    if (competencyCategory === 'core') return 2.5; // Basic to Developing
    if (competencyCategory === 'tools') return 2;
    return 2;
  }

  if (isThirdYear) {
    if (competencyCategory === 'core') return 3; // Intermediate / Developing
    if (competencyCategory === 'applied') return 3;
    return 2.5;
  }

  // 4th Year or Graduate
  return 3.5; // Proficient / Industry ready
}

/**
 * Question Bank organized by Target Career Family
 */
export const CAREER_QUESTION_BANKS: Record<string, AdaptiveQuestion[]> = {
  // 1. SOFTWARE & TECH (Software Engineer, Full Stack, Backend, Frontend, Cloud)
  software: [
    {
      id: 'sw_lang',
      competencyId: 'programming',
      competencyName: 'Primary Programming Language Mastery',
      category: 'core',
      prompt: 'How comfortable are you writing code in your primary language (Java / C++ / Python) without copying from a tutorial?',
      helperText: 'Assesses pure programming fluently and muscle memory without external assistance.',
      options: [
        { label: 'Never written code independently / Still learning basic syntax', level: 'none', numericWeight: 0, explanation: 'Has not yet established basic command of conditional logic and loops.' },
        { label: 'Can modify existing code snippets or complete tutorial exercises', level: 'beginner', numericWeight: 1, explanation: 'Understands basic syntax but depends on external templates to build.' },
        { label: 'Can write simple console programs, helper functions, and loops from memory', level: 'basic', numericWeight: 2, explanation: 'Solid foundation in variables, control flows, and standard methods.' },
        { label: 'Can comfortably implement moderate problem logic, classes, and file I/O independently', level: 'intermediate', numericWeight: 3, explanation: 'Competent engineer capable of translating business requirements into clean functions.' },
        { label: 'Deeply fluent: write idiomatic, high-performance code with memory/concurrency awareness', level: 'advanced', numericWeight: 4, explanation: 'Senior proficiency with language internals, garbage collection, and standard libraries.' },
      ],
    },
    {
      id: 'sw_dsa',
      competencyId: 'dsa',
      competencyName: 'Data Structures & Algorithmic Problem Solving',
      category: 'core',
      prompt: 'When given a medium coding problem on LeetCode/HackerRank, what is your current ability?',
      helperText: 'Assesses your ability to select appropriate structures and analyze time complexity.',
      options: [
        { label: 'Never practiced algorithmic problems / Unfamiliar with Big-O notation', level: 'none', numericWeight: 0, explanation: 'No formal algorithm practice yet.' },
        { label: 'Can solve basic array and string problems after looking up hints', level: 'beginner', numericWeight: 1, explanation: 'Developing basic loops and conditionals intuition.' },
        { label: 'Comfortable with Arrays, HashMaps, Two Pointers, and Binary Search with O(N) analysis', level: 'basic', numericWeight: 2, explanation: 'Strong foundation for second-year student placements.' },
        { label: 'Can independently solve Medium problems involving Trees, Graphs (BFS/DFS), and Stacks', level: 'intermediate', numericWeight: 3, explanation: 'Placement-ready for Tier 1 service companies and product initial screens.' },
        { label: 'Comfortably tackle Dynamic Programming, Graph algorithms, and write clean production edge cases', level: 'advanced', numericWeight: 4, explanation: 'Competitive candidate for top-tier product engineering roles.' },
      ],
    },
    {
      id: 'sw_oop',
      competencyId: 'oop',
      competencyName: 'OOP & Modular Code Design',
      category: 'core',
      prompt: 'How do you apply Object-Oriented Programming (OOP) and Clean Code principles in your projects?',
      helperText: 'Encapsulation, inheritance, polymorphism, abstraction, and modular separation.',
      options: [
        { label: 'Have not used classes or OOP concepts yet', level: 'none', numericWeight: 0, explanation: 'Procedural or script-only code.' },
        { label: 'Know textbook definitions of Polymorphism/Inheritance but struggle to use them in code', level: 'beginner', numericWeight: 1, explanation: 'Theory-heavy; needs practical class refactoring.' },
        { label: 'Regularly create classes, methods, and private variables to structure project code cleanly', level: 'basic', numericWeight: 2, explanation: 'Solid grasp of modular object modeling.' },
        { label: 'Comfortably design abstract interfaces, handle inheritance, and write decoupled reusable modules', level: 'intermediate', numericWeight: 3, explanation: 'Writes production-maintainable code with design pattern awareness.' },
        { label: 'Fluent with SOLID principles, design patterns (Factory, Observer, Singleton), and architecture', level: 'advanced', numericWeight: 4, explanation: 'Industry-grade software architecture capability.' },
      ],
    },
    {
      id: 'sw_git',
      competencyId: 'git',
      competencyName: 'Version Control & GitHub Workflow',
      category: 'tools',
      prompt: 'What is your current practical experience with Git and GitHub in your day-to-day work?',
      helperText: 'Recruiters evaluate commit history, branch management, and verifiable public proof.',
      options: [
        { label: 'Never used Git or GitHub / Save code in local folders', level: 'none', numericWeight: 0, explanation: 'Zero version control trail.' },
        { label: 'Only use GitHub website upload or copy-paste repo files manually', level: 'beginner', numericWeight: 1, explanation: 'Needs terminal CLI version control workflow.' },
        { label: 'Comfortable with git init, add, commit, push, and clone from terminal', level: 'basic', numericWeight: 2, explanation: 'Working daily version control proficiency.' },
        { label: 'Comfortable branching, handling merge conflicts, creating Pull Requests, and README docs', level: 'intermediate', numericWeight: 3, explanation: 'Team-ready collaboration standard.' },
        { label: 'Active public contributor: automated GitHub Actions CI/CD, rebase, and open-source PRs', level: 'advanced', numericWeight: 4, explanation: 'Demonstrable engineering excellence.' },
      ],
    },
    {
      id: 'sw_sql',
      competencyId: 'dbms',
      competencyName: 'Relational Databases & SQL Querying',
      category: 'core',
      prompt: 'How comfortable are you designing schemas and writing multi-table SQL queries?',
      helperText: 'Relational modeling, primary/foreign keys, joins, aggregation, and normalization.',
      options: [
        { label: 'Never written an SQL query or created a database table', level: 'none', numericWeight: 0, explanation: 'No database exposure.' },
        { label: 'Can run basic SELECT * and WHERE queries on a single pre-existing table', level: 'beginner', numericWeight: 1, explanation: 'Beginner querying skills.' },
        { label: 'Can write INNER/LEFT JOINs, GROUP BY aggregations, and create normalized schemas', level: 'basic', numericWeight: 2, explanation: 'Reliable backend data querying capabilities.' },
        { label: 'Comfortable with transactions (ACID), indexes, subqueries, and foreign key cascades', level: 'intermediate', numericWeight: 3, explanation: 'Production-ready database modeling.' },
        { label: 'Expert at query optimization, EXPLAIN execution plans, connection pools, and migration scripts', level: 'advanced', numericWeight: 4, explanation: 'Enterprise database engineering capability.' },
      ],
    },
    {
      id: 'sw_api',
      competencyId: 'apis',
      competencyName: 'REST APIs & Web Networking Protocols',
      category: 'applied',
      prompt: 'How do you build or consume web APIs (HTTP, REST, JSON, status codes)?',
      helperText: 'Client-server separation, request headers, JSON payloads, and response codes.',
      options: [
        { label: 'Unfamiliar with how web APIs or HTTP requests work', level: 'none', numericWeight: 0, explanation: 'No web integration experience.' },
        { label: 'Have consumed a public API using fetch or Postman following a guide', level: 'beginner', numericWeight: 1, explanation: 'Basic consumer awareness.' },
        { label: 'Can build custom CRUD endpoints (GET, POST, PUT, DELETE) in Node/Python/Java', level: 'basic', numericWeight: 2, explanation: 'Functional backend engineer.' },
        { label: 'Build structured RESTful APIs with auth (JWT/OAuth), error middleware, and input validation', level: 'intermediate', numericWeight: 3, explanation: 'Production backend standard.' },
        { label: 'Design microservices, rate-limiting, WebSockets/gRPC, and API gateway routing', level: 'advanced', numericWeight: 4, explanation: 'High-scale distributed systems competency.' },
      ],
    },
    {
      id: 'sw_os',
      competencyId: 'cs_fundamentals',
      competencyName: 'Operating Systems & Linux CLI',
      category: 'systems',
      prompt: 'How comfortable are you with Linux terminal navigation, processes, and memory concepts?',
      helperText: 'Processes, threads, file permissions, pipes, and virtual memory.',
      options: [
        { label: 'Only use GUI (Windows/Mac) / Never opened a Linux shell or terminal', level: 'none', numericWeight: 0, explanation: 'Terminal avoidance.' },
        { label: 'Know 3–4 basic commands (cd, ls, mkdir) but struggle when errors occur', level: 'beginner', numericWeight: 1, explanation: 'Minimal CLI comfort.' },
        { label: 'Comfortable with file permissions (chmod), grep, pipes, processes (ps, kill), and SSH', level: 'basic', numericWeight: 2, explanation: 'Solid server navigation skills.' },
        { label: 'Understand OS internals: process vs thread, virtual memory paging, mutex locks, and deadlocks', level: 'intermediate', numericWeight: 3, explanation: 'Strong CS interview foundational mastery.' },
        { label: 'Write bash automation scripts, configure systemd daemons, and debug memory leaks in production', level: 'advanced', numericWeight: 4, explanation: 'Systems engineering proficiency.' },
      ],
    },
    {
      id: 'sw_debugging',
      competencyId: 'debugging',
      competencyName: 'Debugging & Unit Testing Discipline',
      category: 'tools',
      prompt: 'When your code crashes or produces the wrong output, how do you diagnose it?',
      helperText: 'Testing habits, stack trace inspection, breakpoints, and test frameworks.',
      options: [
        { label: 'Give up or randomly change lines until it works (or copy to ChatGPT without understanding)', level: 'none', numericWeight: 0, explanation: 'Passive debugging reliance.' },
        { label: 'Add print/console.log statements everywhere to guess where it broke', level: 'beginner', numericWeight: 1, explanation: 'Elementary troubleshooting.' },
        { label: 'Carefully read stack traces, inspect variable states, and isolate root causes methodically', level: 'basic', numericWeight: 2, explanation: 'Disciplined practical troubleshooter.' },
        { label: 'Use interactive IDE debuggers (breakpoints, step over, watch expressions) and write unit tests', level: 'intermediate', numericWeight: 3, explanation: 'Professional software engineering standard.' },
        { label: 'Test-Driven Development (TDD), mocking external dependencies, and automated regression testing', level: 'advanced', numericWeight: 4, explanation: 'High-assurance code quality.' },
      ],
    },
    {
      id: 'sw_project_proof',
      competencyId: 'projects',
      competencyName: 'Independent Full-Stack / Project Execution',
      category: 'applied',
      prompt: 'What best describes the projects currently visible on your resume or GitHub?',
      helperText: 'Recruiters reject tutorial clones; they look for problem validation and architecture.',
      options: [
        { label: 'No projects on GitHub or only university lab boilerplate', level: 'none', numericWeight: 0, explanation: 'Zero demonstrable proof.' },
        { label: 'To-do list or weather app directly cloned from a YouTube tutorial', level: 'beginner', numericWeight: 1, explanation: 'Cloned work; lacks individual initiative.' },
        { label: 'At least 1 original standalone project with clean code, UI/backend, and README documentation', level: 'basic', numericWeight: 2, explanation: 'Good foundation for second-year student.' },
        { label: 'Deployed live application with database persistence, authentication, and actual user testing', level: 'intermediate', numericWeight: 3, explanation: 'Outstanding competitive portfolio proof.' },
        { label: 'Production software with CI/CD, automated tests, monitoring, and active user traffic/stars', level: 'advanced', numericWeight: 4, explanation: 'Top 1% campus candidate profile.' },
      ],
    },
    {
      id: 'sw_interview_readiness',
      competencyId: 'interview_readiness',
      competencyName: 'Technical Interview & Viva Communication',
      category: 'communication',
      prompt: 'If an interviewer asks: "Explain the time complexity of your solution and the trade-offs you considered", how do you perform?',
      helperText: 'Articulating thought process under pressure is 50% of the hiring decision.',
      options: [
        { label: 'Freeze up or get overwhelmed when asked to explain my code aloud', level: 'none', numericWeight: 0, explanation: 'Interview anxiety / unpracticed verbalization.' },
        { label: 'Can state the final answer but struggle to walk through the reasoning step-by-step', level: 'beginner', numericWeight: 1, explanation: 'Needs structured communication practice.' },
        { label: 'Can clearly explain the brute force vs optimal solution and big-O time/space trade-offs', level: 'basic', numericWeight: 2, explanation: 'Clear, dependable candidate communication.' },
        { label: 'Think out loud naturally, ask clarifying questions on edge cases, and accept interviewer hints gracefully', level: 'intermediate', numericWeight: 3, explanation: 'Interview-ready delivery for product companies.' },
        { label: 'Lead the discussion, proactively discuss architectural scalability, failure modes, and monitoring', level: 'advanced', numericWeight: 4, explanation: 'Senior engineer level articulation.' },
      ],
    },
  ],

  // 2. DATA SCIENCE & AI (Data Scientist, ML Engineer, AI Engineer, Data Analyst)
  data: [
    {
      id: 'ds_python',
      competencyId: 'python_data',
      competencyName: 'Python for Scientific & Data Computing',
      category: 'core',
      prompt: 'How comfortable are you writing Python for data wrangling without relying on copy-paste code?',
      helperText: 'List comprehensions, generators, dictionaries, lambda functions, and vectorization.',
      options: [
        { label: 'Never written Python or only know basic print/variables', level: 'none', numericWeight: 0, explanation: 'No Python data programming foundation.' },
        { label: 'Can write simple scripts but struggle with functional Python and list comprehensions', level: 'beginner', numericWeight: 1, explanation: 'Syntax beginner.' },
        { label: 'Comfortably manipulate arrays, nested dictionaries, file parsing, and write clean functions', level: 'basic', numericWeight: 2, explanation: 'Solid programming baseline for data work.' },
        { label: 'Write efficient, vectorized Python code leveraging itertools, generators, and typing', level: 'intermediate', numericWeight: 3, explanation: 'Fluent data engineer standard.' },
        { label: 'Profile and optimize Python execution (Cython/multiprocessing/NumPy vectorization)', level: 'advanced', numericWeight: 4, explanation: 'High-performance computing capability.' },
      ],
    },
    {
      id: 'ds_stats',
      competencyId: 'statistics',
      competencyName: 'Applied Statistics & Probability',
      category: 'core',
      prompt: 'How well do you understand statistical hypothesis testing and distributions?',
      helperText: 'Mean/median/std, normal distribution, p-values, Bayes theorem, confidence intervals.',
      options: [
        { label: 'Unfamiliar with probability distributions and statistics beyond high school math', level: 'none', numericWeight: 0, explanation: 'Missing foundational math for data/ML.' },
        { label: 'Know formulas for mean, median, variance, and standard deviation only', level: 'beginner', numericWeight: 1, explanation: 'Descriptive stats only.' },
        { label: 'Comfortable with normal distribution, z-scores, p-values, hypothesis testing, and Bayes theorem', level: 'basic', numericWeight: 2, explanation: 'Sufficient statistical grounding for analyst roles.' },
        { label: 'Perform ANOVA, Chi-Square, A/B testing design, and understand Central Limit Theorem deeply', level: 'intermediate', numericWeight: 3, explanation: 'Data scientist analytical benchmark.' },
        { label: 'Advanced probabilistic modeling, Markov chains, Bayesian inference, and stochastic processes', level: 'advanced', numericWeight: 4, explanation: 'Research-grade statistical competence.' },
      ],
    },
    {
      id: 'ds_pandas',
      competencyId: 'pandas_numpy',
      competencyName: 'Data Wrangling (Pandas & NumPy)',
      category: 'core',
      prompt: 'When given a messy dataset with missing values, strange dates, and duplicates, how do you handle it?',
      helperText: 'Data cleaning, groupbys, pivot tables, merge/joins, and feature transformation.',
      options: [
        { label: 'Never used Pandas or NumPy / Only know basic Excel', level: 'none', numericWeight: 0, explanation: 'No programmatic data cleaning.' },
        { label: 'Can load a CSV (pd.read_csv) and print .head() following a tutorial', level: 'beginner', numericWeight: 1, explanation: 'Introductory familiarity.' },
        { label: 'Clean missing data (fillna/dropna), filter rows, group by metrics, and join DataFrames', level: 'basic', numericWeight: 2, explanation: 'Practical data cleaning capability.' },
        { label: 'Handle datetime parsing, multi-level indexing, melt/pivot, and vector calculations cleanly', level: 'intermediate', numericWeight: 3, explanation: 'Industry-standard data wrangling.' },
        { label: 'Optimize memory footprint for large datasets (chunking, categorical dtypes, Polars/Dask)', level: 'advanced', numericWeight: 4, explanation: 'Big data wrangling proficiency.' },
      ],
    },
    {
      id: 'ds_sql',
      competencyId: 'sql_analytics',
      competencyName: 'SQL Analytics & Window Functions',
      category: 'core',
      prompt: 'How comfortable are you extracting complex analytics using SQL?',
      helperText: 'CTEs, window functions (ROW_NUMBER, RANK, LAG/LEAD), and aggregations.',
      options: [
        { label: 'Never written SQL queries', level: 'none', numericWeight: 0, explanation: 'No SQL knowledge.' },
        { label: 'Can write simple SELECT, WHERE, and single table queries', level: 'beginner', numericWeight: 1, explanation: 'Basic query ability.' },
        { label: 'Can join multiple tables and write GROUP BY with HAVING aggregations', level: 'basic', numericWeight: 2, explanation: 'Solid baseline query capability.' },
        { label: 'Comfortably use Window Functions (OVER, PARTITION BY, LAG/LEAD) and CTEs (WITH clauses)', level: 'intermediate', numericWeight: 3, explanation: 'Industry data analyst / scientist ready.' },
        { label: 'Tune query execution plans, design dimensional star schemas, and write data pipeline stored procs', level: 'advanced', numericWeight: 4, explanation: 'Data warehouse architecture mastery.' },
      ],
    },
    {
      id: 'ds_ml',
      competencyId: 'machine_learning',
      competencyName: 'Machine Learning Fundamentals & Scikit-Learn',
      category: 'applied',
      prompt: 'How do you build, evaluate, and tune machine learning models for classification or regression?',
      helperText: 'Train/test split, overfitting, cross-validation, precision/recall, and tree algorithms.',
      options: [
        { label: 'Never trained a machine learning model', level: 'none', numericWeight: 0, explanation: 'No applied ML experience.' },
        { label: 'Can call model.fit() in Scikit-Learn by copying Kaggle or tutorial notebooks', level: 'beginner', numericWeight: 1, explanation: 'Copy-paste ML script runner.' },
        { label: 'Understand train/test splits, feature scaling, and evaluate with accuracy/RMSE correctly', level: 'basic', numericWeight: 2, explanation: 'Sound foundational ML understanding.' },
        { label: 'Prevent data leakage, tune hyper-parameters (Grid/RandomSearchCV), evaluate precision/recall and ROC-AUC', level: 'intermediate', numericWeight: 3, explanation: 'Production ML engineer benchmark.' },
        { label: 'Implement XGBoost/LightGBM, ensemble architectures, and understand bias-variance trade-offs deeply', level: 'advanced', numericWeight: 4, explanation: 'Advanced ML modeling practitioner.' },
      ],
    },
    {
      id: 'ds_ai_genai',
      competencyId: 'genai_llms',
      competencyName: 'LLMs, Vector Databases & GenAI Integration',
      category: 'applied',
      prompt: 'What is your hands-on experience with Large Language Models (LLMs), RAG pipelines, or APIs?',
      helperText: 'Prompt engineering, embeddings, vector databases (Chroma/Pinecone), and LangChain/LlamaIndex.',
      options: [
        { label: 'Only use ChatGPT as an end-user web interface / Never used an AI API in code', level: 'none', numericWeight: 0, explanation: 'Consumer user only.' },
        { label: 'Have made a single API call to Gemini/OpenAI using an example script', level: 'beginner', numericWeight: 1, explanation: 'Basic API familiarity.' },
        { label: 'Can construct structured prompt templates, parse JSON model responses, and handle API keys safely', level: 'basic', numericWeight: 2, explanation: 'Practical GenAI integration ability.' },
        { label: 'Built a working Retrieval-Augmented Generation (RAG) system with embeddings and vector store', level: 'intermediate', numericWeight: 3, explanation: 'Modern AI engineer portfolio standard.' },
        { label: 'Evaluate hallucination rates, implement multi-agent workflows, fine-tuning, and semantic caching', level: 'advanced', numericWeight: 4, explanation: 'Cutting-edge AI engineering proficiency.' },
      ],
    },
    {
      id: 'ds_projects',
      competencyId: 'data_projects',
      competencyName: 'Data Portfolio & Verifiable Insights',
      category: 'applied',
      prompt: 'What concrete data projects do you have documented on GitHub or Kaggle?',
      helperText: 'Exploratory data analysis, reproducible notebooks, and deployed dashboards.',
      options: [
        { label: 'No data projects completed yet', level: 'none', numericWeight: 0, explanation: 'No portfolio proof.' },
        { label: 'Standard Titanic or Iris dataset notebook from a tutorial without custom insight', level: 'beginner', numericWeight: 1, explanation: 'Generic clone projects.' },
        { label: 'Original exploratory analysis on a unique real-world dataset with clean visualizations', level: 'basic', numericWeight: 2, explanation: 'Promising candidate initiative.' },
        { label: 'End-to-end data pipeline: web scraping/API ingestion -> cleaning -> modeling -> Streamlit app', level: 'intermediate', numericWeight: 3, explanation: 'Compelling hiring portfolio.' },
        { label: 'Deployed production ML microservice with FastAPI, Docker container, and automated retraining', level: 'advanced', numericWeight: 4, explanation: 'Enterprise-grade ML portfolio.' },
      ],
    },
    {
      id: 'ds_storytelling',
      competencyId: 'data_storytelling',
      competencyName: 'Data Storytelling & Executive Communication',
      category: 'communication',
      prompt: 'When presenting data findings to a professor or stakeholder who does not know code, how do you communicate?',
      helperText: 'Focus on business impact, actionable recommendations, and clear visual charts.',
      options: [
        { label: 'Show code and raw numbers without explaining what it means to the user', level: 'none', numericWeight: 0, explanation: 'Lacks audience empathy.' },
        { label: 'Can explain charts if questioned, but rely mostly on technical jargon', level: 'beginner', numericWeight: 1, explanation: 'Needs executive communication polish.' },
        { label: 'Frame insights around clear conclusions and highlight actionable recommendations', level: 'basic', numericWeight: 2, explanation: 'Effective business communication.' },
        { label: 'Build intuitive visual dashboards (Plotly/Streamlit/Tableau) that tell a clear, persuasive narrative', level: 'intermediate', numericWeight: 3, explanation: 'High-value analytical storyteller.' },
      ],
    },
  ],

  // 3. CYBERSECURITY
  cyber: [
    {
      id: 'sec_net',
      competencyId: 'networking',
      competencyName: 'Computer Networks & Packet Analysis',
      category: 'core',
      prompt: 'How well can you analyze network traffic, TCP/IP handshakes, and packet captures?',
      helperText: 'OSI model, Wireshark, TCP flags, DNS resolution, and routing fundamentals.',
      options: [
        { label: 'Unfamiliar with network protocols or how IP packets travel', level: 'none', numericWeight: 0, explanation: 'No networking foundation.' },
        { label: 'Know the 7 layers of OSI model from textbook definition only', level: 'beginner', numericWeight: 1, explanation: 'Bookish theory; no packet analysis.' },
        { label: 'Can capture and inspect HTTP/DNS packets in Wireshark and explain the 3-way handshake', level: 'basic', numericWeight: 2, explanation: 'Solid network analysis foundation.' },
        { label: 'Analyze anomalous packet headers, TCP retransmissions, firewall logs, and subnetting', level: 'intermediate', numericWeight: 3, explanation: 'SOC / Security analyst ready.' },
        { label: 'Deep protocol reverse engineering, crafting custom raw sockets, and packet injection', level: 'advanced', numericWeight: 4, explanation: 'Offensive / Defensive network specialist.' },
      ],
    },
    {
      id: 'sec_linux',
      competencyId: 'linux_security',
      competencyName: 'Linux Administration & Command Line Security',
      category: 'systems',
      prompt: 'How comfortable are you auditing Linux permissions, bash scripts, and system services?',
      helperText: 'Sudoers, file permissions (SUID/SGID), iptables, and system log analysis.',
      options: [
        { label: 'No Linux experience / Only use Windows GUI', level: 'none', numericWeight: 0, explanation: 'Critical gap for cybersecurity roles.' },
        { label: 'Can run basic commands (cd, ls, cat) in Kali Linux or Ubuntu', level: 'beginner', numericWeight: 1, explanation: 'Introductory navigation.' },
        { label: 'Understand permissions (chmod/chown), SUID binaries, cron jobs, and inspecting auth.log', level: 'basic', numericWeight: 2, explanation: 'Working Linux security admin skills.' },
        { label: 'Can write bash scripts for log auditing, configure UFW/iptables, and manage SSH keys securely', level: 'intermediate', numericWeight: 3, explanation: 'Practical security analyst benchmark.' },
        { label: 'Linux kernel hardening, SELinux policies, privilege escalation detection, and container security', level: 'advanced', numericWeight: 4, explanation: 'Advanced security engineering proficiency.' },
      ],
    },
    {
      id: 'sec_web',
      competencyId: 'web_security',
      competencyName: 'Web Application Security & OWASP Top 10',
      category: 'applied',
      prompt: 'How do you test and defend against SQL Injection, XSS, and broken authentication?',
      helperText: 'OWASP Top 10, Burp Suite, input sanitization, and secure HTTP headers.',
      options: [
        { label: 'Never tested web vulnerabilities or heard of OWASP Top 10', level: 'none', numericWeight: 0, explanation: 'No web security foundation.' },
        { label: 'Know what SQL Injection and XSS are theoretically from YouTube videos', level: 'beginner', numericWeight: 1, explanation: 'Theory only; no lab experience.' },
        { label: 'Have intercepted and modified requests in Burp Suite and exploited basic lab vulnerabilities', level: 'basic', numericWeight: 2, explanation: 'Hands-on practice in PortSwigger/TryHackMe.' },
        { label: 'Can identify and remediate CSRF, IDOR, SSRF, and configure Content-Security-Policy (CSP)', level: 'intermediate', numericWeight: 3, explanation: 'Junior AppSec / PenTester standard.' },
        { label: 'Perform full manual web app penetration testing and provide remediation code reviews', level: 'advanced', numericWeight: 4, explanation: 'Professional AppSec consultant.' },
      ],
    },
    {
      id: 'sec_labs',
      competencyId: 'security_labs',
      competencyName: 'Hands-on Labs (TryHackMe / HackTheBox)',
      category: 'applied',
      prompt: 'What is your hands-on laboratory experience on platforms like TryHackMe, HackTheBox, or CTFs?',
      helperText: 'Hands-on capture-the-flag and lab rooms demonstrate applied offensive/defensive skill.',
      options: [
        { label: 'Never registered or solved a challenge on TryHackMe or HackTheBox', level: 'none', numericWeight: 0, explanation: 'No lab verification.' },
        { label: 'Completed 1–2 beginner rooms with the help of a walk-through guide', level: 'beginner', numericWeight: 1, explanation: 'Tutorial reliant.' },
        { label: 'Earned badges or solved 10+ easy/medium rooms independently on TryHackMe', level: 'basic', numericWeight: 2, explanation: 'Verifiable personal discipline.' },
        { label: 'Competed in college/national CTFs and write technical write-ups explaining solutions', level: 'intermediate', numericWeight: 3, explanation: 'High-signal candidate proof.' },
      ],
    },
  ],

  // 4. EMBEDDED & VLSI (Embedded Systems, VLSI, IoT, FPGA)
  embedded: [
    {
      id: 'emb_c',
      competencyId: 'embedded_c',
      competencyName: 'Low-Level C & Bitwise Manipulation',
      category: 'core',
      prompt: 'How comfortable are you manipulating memory registers, bitmasks, and pointers in C?',
      helperText: 'Bit shifts (&, |, ^, ~), pointer arithmetic, volatile keyword, and memory-mapped I/O.',
      options: [
        { label: 'Never written low-level C / Unfamiliar with pointers and bitwise operators', level: 'none', numericWeight: 0, explanation: 'Missing bedrock firmware prerequisite.' },
        { label: 'Understand basic pointers in theory but get segmentation faults frequently', level: 'beginner', numericWeight: 1, explanation: 'Needs structured pointer practice.' },
        { label: 'Comfortably use bitmasks to set, clear, and toggle specific hardware register bits in C', level: 'basic', numericWeight: 2, explanation: 'Solid firmware coding baseline.' },
        { label: 'Understand volatile, const, static, struct packing, and memory-mapped peripheral registers', level: 'intermediate', numericWeight: 3, explanation: 'Production-ready embedded C developer.' },
        { label: 'Write custom startup code, linker scripts, and interrupt service routines (ISRs) without IDE wizards', level: 'advanced', numericWeight: 4, explanation: 'Senior firmware engineer capability.' },
      ],
    },
    {
      id: 'emb_mcu',
      competencyId: 'microcontrollers',
      competencyName: 'Microcontrollers (ARM Cortex / STM32 / ESP32)',
      category: 'systems',
      prompt: 'What microcontroller architectures have you programmed beyond simple Arduino libraries?',
      helperText: 'Bare-metal programming, timers, interrupts, ADCs, and hardware clock configuration.',
      options: [
        { label: 'Never worked with physical hardware or microcontrollers', level: 'none', numericWeight: 0, explanation: 'Zero embedded hardware exposure.' },
        { label: 'Only used Arduino digitalWrite() and delay() from basic tutorial kits', level: 'beginner', numericWeight: 1, explanation: 'High-level wrapper abstraction only.' },
        { label: 'Programmed STM32/ESP32 using HAL or ESP-IDF, configuring GPIOs and hardware timers', level: 'basic', numericWeight: 2, explanation: 'Good progress toward professional firmware.' },
        { label: 'Configured hardware interrupts (EXTI), DMA data transfers, and sleep modes for low-power', level: 'intermediate', numericWeight: 3, explanation: 'Embedded engineer benchmark.' },
        { label: 'Deep bare-metal register-level programming on ARM Cortex-M architecture with CMSIS', level: 'advanced', numericWeight: 4, explanation: 'Enterprise embedded systems specialist.' },
      ],
    },
    {
      id: 'emb_comm',
      competencyId: 'protocols',
      competencyName: 'Communication Protocols (UART, I2C, SPI, CAN)',
      category: 'core',
      prompt: 'How do you interface sensors and peripherals using hardware communication buses?',
      helperText: 'Baud rates, master-slave addressing, clock polarity/phase (CPOL/CPHA), and ACK bits.',
      options: [
        { label: 'Never connected sensors via serial protocols', level: 'none', numericWeight: 0, explanation: 'No hardware interface knowledge.' },
        { label: 'Used pre-made Arduino libraries without understanding how I2C or SPI actually work', level: 'beginner', numericWeight: 1, explanation: 'Abstract consumer only.' },
        { label: 'Understand clock/data lines, pull-up resistors, slave addresses, and frame packets for I2C and UART', level: 'basic', numericWeight: 2, explanation: 'Working communication protocol competence.' },
        { label: 'Can write driver code to read sensor registers via SPI/I2C and debug signals with a logic analyzer', level: 'intermediate', numericWeight: 3, explanation: 'Hardware debugging standard.' },
        { label: 'CAN bus protocol implementation for automotive/industrial networks with error frame analysis', level: 'advanced', numericWeight: 4, explanation: 'Automotive / Industrial bus specialist.' },
      ],
    },
    {
      id: 'emb_pcb',
      competencyId: 'pcb_schematics',
      competencyName: 'Schematic Capture & PCB Layout (KiCad / Altium)',
      category: 'tools',
      prompt: 'What is your practical experience designing physical circuit boards?',
      helperText: 'Component footprints, trace routing, decoupling capacitors, ground planes, and design rules.',
      options: [
        { label: 'Never opened PCB design software / Only used breadboards', level: 'none', numericWeight: 0, explanation: 'No PCB layout skills.' },
        { label: 'Can draw a simple schematic symbol but never routed a physical board layout', level: 'beginner', numericWeight: 1, explanation: 'Schematic-only beginner.' },
        { label: 'Designed and routed a 2-layer PCB in KiCad with ground planes and generated Gerber files', level: 'basic', numericWeight: 2, explanation: 'Solid verified hardware engineering proof.' },
        { label: 'Designed multi-layer boards with impedance matching, decoupling, and manufactured working boards', level: 'intermediate', numericWeight: 3, explanation: 'Industry hardware designer standard.' },
      ],
    },
  ],

  // 5. MECHANICAL & ROBOTICS (Mechanical Design, CAD, Robotics, Mechatronics, Automotive)
  mechanical: [
    {
      id: 'mech_cad',
      competencyId: 'cad_modeling',
      competencyName: '3D Parametric CAD Modeling (SolidWorks / Fusion 360)',
      category: 'core',
      prompt: 'How comfortable are you creating parametric 3D parts, assemblies, and manufacturing drawings?',
      helperText: 'Fully constrained sketches, mates, design for manufacturing (DFM), and technical drawings.',
      options: [
        { label: 'Never used 3D CAD modeling software', level: 'none', numericWeight: 0, explanation: 'No CAD foundation.' },
        { label: 'Can make basic extrusions and cylinders following video tutorials', level: 'beginner', numericWeight: 1, explanation: 'Basic geometrical modeling.' },
        { label: 'Build fully constrained parametric sketches and multi-part assemblies with realistic mates', level: 'basic', numericWeight: 2, explanation: 'Solid mechanical modeling baseline.' },
        { label: 'Create production-ready drawings with standard GD&T tolerances, fits, and bill of materials (BOM)', level: 'intermediate', numericWeight: 3, explanation: 'Design engineer industry standard.' },
        { label: 'Complex surface modeling, sheet metal development, injection mold design, and design automation', level: 'advanced', numericWeight: 4, explanation: 'Senior CAD/Mechanical specialist.' },
      ],
    },
    {
      id: 'mech_som',
      competencyId: 'strength_of_materials',
      competencyName: 'Engineering Mechanics & Strength of Materials',
      category: 'core',
      prompt: 'How do you calculate stress, shear forces, bending moments, and factor of safety in components?',
      helperText: 'Shear force / bending moment diagrams (SFD/BMD), Von Mises stress, stress concentration.',
      options: [
        { label: 'Struggle with free-body diagrams and equilibrium equations', level: 'none', numericWeight: 0, explanation: 'Missing engineering physics core.' },
        { label: 'Can calculate simple tensile stress and strain using textbook formulas', level: 'beginner', numericWeight: 1, explanation: 'Elementary theory only.' },
        { label: 'Draw SFD and BMD for beams, calculate principal stresses, and apply Factor of Safety (FOS)', level: 'basic', numericWeight: 2, explanation: 'Competent mechanical analysis foundation.' },
        { label: 'Apply failure theories (Von Mises, Tresca), calculate fatigue life, and stress concentrations', level: 'intermediate', numericWeight: 3, explanation: 'Core mechanical engineering competence.' },
        { label: 'Dynamic vibration analysis, modal frequencies, and structural optimization for aerospace/auto', level: 'advanced', numericWeight: 4, explanation: 'Advanced analytical engineering.' },
      ],
    },
    {
      id: 'mech_fea',
      competencyId: 'fea_simulation',
      competencyName: 'Finite Element Analysis (FEA / ANSYS)',
      category: 'tools',
      prompt: 'What is your practical experience running structural or thermal simulations in ANSYS / Abaqus?',
      helperText: 'Mesh independence, boundary conditions, fixed supports, and interpreting stress contours.',
      options: [
        { label: 'Never used simulation or FEA software', level: 'none', numericWeight: 0, explanation: 'No FEA exposure.' },
        { label: 'Clicked through a tutorial in ANSYS Workbench but do not understand meshing quality', level: 'beginner', numericWeight: 1, explanation: 'Tutorial clicker without mesh theory.' },
        { label: 'Apply correct boundary conditions, verify mesh convergence, and interpret Von Mises plots', level: 'basic', numericWeight: 2, explanation: 'Solid simulation practitioner.' },
        { label: 'Perform non-linear analysis, contact pairs, transient thermal, or modal harmonic studies', level: 'intermediate', numericWeight: 3, explanation: 'CAE industry engineer benchmark.' },
      ],
    },
    {
      id: 'mech_mfg',
      competencyId: 'manufacturing_dfm',
      competencyName: 'Manufacturing Processes & DFM',
      category: 'applied',
      prompt: 'How well do you understand how parts are actually made in factories (machining, casting, welding)?',
      helperText: 'Design for Manufacturing (DFM), CNC milling limitations, draft angles, and sheet metal bend allowances.',
      options: [
        { label: 'Only studied manufacturing as textbook theory for university exams', level: 'none', numericWeight: 0, explanation: 'No shop-floor reality checks.' },
        { label: 'Familiar with basic lathe and drilling operations from college workshop', level: 'beginner', numericWeight: 1, explanation: 'Introductory lab awareness.' },
        { label: 'Consider machining tool accessibility, sheet metal bend radii, and standard stock sizes in CAD', level: 'basic', numericWeight: 2, explanation: 'Good practical DFM awareness.' },
        { label: 'Design parts specifically for CNC milling, injection molding draft angles, and 3D printing tolerances', level: 'intermediate', numericWeight: 3, explanation: 'Production-ready design engineer.' },
      ],
    },
    {
      id: 'mech_robotics_applied',
      competencyId: 'robotics_kinematics',
      competencyName: 'Robotic Kinematics & Actuator Control',
      category: 'applied',
      prompt: 'For robotics or automation: how do you program actuators, sensor feedback, and kinematics?',
      helperText: 'Forward/inverse kinematics, stepper/servo PWM control, PID loops, and ROS.',
      options: [
        { label: 'No robotics or automated mechanism experience', level: 'none', numericWeight: 0, explanation: 'Pure static mechanics.' },
        { label: 'Assembled a basic hobby 2-wheel robot kit following instructions', level: 'beginner', numericWeight: 1, explanation: 'Hobby kit builder.' },
        { label: 'Wrote microcontroller code to control servos, read encoder feedback, and tune a PID speed loop', level: 'basic', numericWeight: 2, explanation: 'Applied mechatronics foundation.' },
        { label: 'Calculated forward/inverse kinematics matrices (DH parameters) and worked with ROS/ROS 2 nodes', level: 'intermediate', numericWeight: 3, explanation: 'Robotics engineer benchmark.' },
      ],
    },
  ],

  // 6. CIVIL & INFRASTRUCTURE (Structural, BIM, Construction, Transportation)
  civil: [
    {
      id: 'civ_som',
      competencyId: 'structural_analysis',
      competencyName: 'Structural Mechanics & Analysis',
      category: 'core',
      prompt: 'How comfortably can you analyze determinate and indeterminate structures?',
      helperText: 'Moment distribution, slope deflection, truss analysis, and deflection calculations.',
      options: [
        { label: 'Struggle with support reactions and internal shear/moment diagrams', level: 'none', numericWeight: 0, explanation: 'Core civil foundation missing.' },
        { label: 'Can solve simply supported beams and simple trusses using textbook methods', level: 'beginner', numericWeight: 1, explanation: 'Elementary structural calculations.' },
        { label: 'Comfortably analyze indeterminate frames using Moment Distribution and matrix stiffness methods', level: 'basic', numericWeight: 2, explanation: 'Solid structural engineering grounding.' },
        { label: 'Model complex multi-story structures, seismic lateral loads, and wind combinations', level: 'intermediate', numericWeight: 3, explanation: 'Structural designer benchmark.' },
      ],
    },
    {
      id: 'civ_software',
      competencyId: 'staad_etabs',
      competencyName: 'Structural Software (STAAD.Pro / ETABS)',
      category: 'tools',
      prompt: 'What is your practical experience modeling buildings and frames in ETABS or STAAD.Pro?',
      helperText: 'Section properties, dead/live/seismic load definitions, and reinforcement detailing.',
      options: [
        { label: 'Never opened STAAD.Pro or ETABS / Only manual calculation', level: 'none', numericWeight: 0, explanation: 'No industry software tool familiarity.' },
        { label: 'Followed a YouTube demo to draw a simple 2D frame in STAAD', level: 'beginner', numericWeight: 1, explanation: 'Basic UI familiarity.' },
        { label: 'Modeled a 3D G+3 building with slabs, beams, columns, and assigned IS load combinations', level: 'basic', numericWeight: 2, explanation: 'Valuable student portfolio asset.' },
        { label: 'Perform dynamic response spectrum analysis, design shear walls, and verify code compliance', level: 'intermediate', numericWeight: 3, explanation: 'Industry consulting ready.' },
      ],
    },
    {
      id: 'civ_codes',
      competencyId: 'is_codes',
      competencyName: 'Indian Standard Codes (IS 456, IS 800, IS 1893)',
      category: 'core',
      prompt: 'How well do you understand Limit State Design rules in IS 456 (RCC) and IS 800 (Steel)?',
      helperText: 'Flexure, shear design, development length, deflection limits, and detailing standards.',
      options: [
        { label: 'Never read or applied IS code clauses', level: 'none', numericWeight: 0, explanation: 'No code familiarity.' },
        { label: 'Memorized a few formulas for college examinations without seeing the actual codebook', level: 'beginner', numericWeight: 1, explanation: 'Exam-cramming habit.' },
        { label: 'Navigate IS 456 clauses comfortably for beam and column reinforcement design', level: 'basic', numericWeight: 2, explanation: 'Sound design compliance foundation.' },
        { label: 'Design steel connections, slab systems, and earthquake-resistant detailing as per SP 34 / IS 13920', level: 'intermediate', numericWeight: 3, explanation: 'Professional detailing capability.' },
      ],
    },
    {
      id: 'civ_cad_bim',
      competencyId: 'autocad_bim',
      competencyName: 'Drafting & BIM (AutoCAD / Revit)',
      category: 'tools',
      prompt: 'Can you produce structural drafting plans and Bar Bending Schedules (BBS)?',
      helperText: 'Architectural drawings, structural layout, column grid lines, and BBS calculation.',
      options: [
        { label: 'Cannot draft plans in AutoCAD', level: 'none', numericWeight: 0, explanation: 'Missing core civil communication tool.' },
        { label: 'Can draw lines and simple room plans in 2D AutoCAD', level: 'beginner', numericWeight: 1, explanation: 'Elementary drafting.' },
        { label: 'Prepare detailed structural reinforcement drawings and calculate accurate BBS quantities', level: 'basic', numericWeight: 2, explanation: 'Site and office ready drafting.' },
        { label: '3D BIM modeling in Revit with parametric families and Navisworks clash detection', level: 'intermediate', numericWeight: 3, explanation: 'Modern BIM coordinator standard.' },
      ],
    },
  ],

  // 7. ELECTRICAL & POWER (Power Systems, Electrical Design, Power Electronics, EV)
  electrical: [
    {
      id: 'ee_circuits',
      competencyId: 'circuit_analysis',
      competencyName: 'Network Analysis & AC Circuits',
      category: 'core',
      prompt: 'How comfortably can you analyze 3-phase AC networks, power factor, and transient responses?',
      helperText: 'Thevenin/Norton theorems, phasor diagrams, reactive power (kVAR), and resonance.',
      options: [
        { label: 'Struggle with AC circuit phasors and impedance calculations', level: 'none', numericWeight: 0, explanation: 'Missing circuits baseline.' },
        { label: 'Can solve DC resistive circuits using KVL/KCL comfortably', level: 'beginner', numericWeight: 1, explanation: 'DC only; needs AC depth.' },
        { label: 'Calculate 3-phase power, power factor correction, and analyze RLC transients', level: 'basic', numericWeight: 2, explanation: 'Solid electrical engineering core.' },
        { label: 'Symmetrical components analysis, unbalanced 3-phase faults, and harmonics mitigation', level: 'intermediate', numericWeight: 3, explanation: 'Power systems engineer benchmark.' },
      ],
    },
    {
      id: 'ee_power_elec',
      competencyId: 'power_electronics',
      competencyName: 'Power Electronics & Inverters (MOSFET/IGBT)',
      category: 'core',
      prompt: 'How do you design and simulate DC-DC converters, PWM inverters, and motor drives?',
      helperText: 'Buck/Boost converters, gate driver circuits, switching losses, and MATLAB Simulink models.',
      options: [
        { label: 'No exposure to power semiconductor devices or converter circuits', level: 'none', numericWeight: 0, explanation: 'No power electronics foundation.' },
        { label: 'Know textbook diode/thyristor characteristics from college lectures', level: 'beginner', numericWeight: 1, explanation: 'Theory only; no design or simulation.' },
        { label: 'Built and simulated Buck/Boost converter circuits in MATLAB Simulink or LTspice', level: 'basic', numericWeight: 2, explanation: 'Applied converter modeling competence.' },
        { label: 'Design closed-loop voltage/current controllers and gate drivers for BLDC/PMSM EV motors', level: 'intermediate', numericWeight: 3, explanation: 'EV & power drive engineer standard.' },
      ],
    },
    {
      id: 'ee_power_grid',
      competencyId: 'power_systems',
      competencyName: 'Power Systems & Grid Protection',
      category: 'systems',
      prompt: 'What is your understanding of transmission lines, load flows, and protection relays?',
      helperText: 'Bus admittance matrices, Newton-Raphson load flow, circuit breakers, and overcurrent relays.',
      options: [
        { label: 'Never studied transmission lines or grid modeling', level: 'none', numericWeight: 0, explanation: 'No grid engineering foundation.' },
        { label: 'Understand simple line models (short, medium, long) from textbook chapters', level: 'beginner', numericWeight: 1, explanation: 'Introductory theory.' },
        { label: 'Simulated load flow studies and symmetrical fault analysis in ETAP or MATLAB', level: 'basic', numericWeight: 2, explanation: 'Dependable grid analysis skill.' },
        { label: 'Coordinate protective relay curves, differential protection, and renewable microgrid integration', level: 'intermediate', numericWeight: 3, explanation: 'Utility / substation engineer ready.' },
      ],
    },
  ],

  // 8. GENERAL & CAREER TRANSITION (Universal, for branch switches or open exploration)
  transition: [
    {
      id: 'trans_coding',
      competencyId: 'transition_coding',
      competencyName: 'Cross-Branch Programming Ramp-up',
      category: 'core',
      prompt: 'Since your target career involves software/data from a different branch, how are you building coding fluency?',
      helperText: 'Evaluates your transition momentum and bridging discipline outside your formal college curriculum.',
      options: [
        { label: 'Have not started coding yet / Planning to start soon', level: 'none', numericWeight: 0, explanation: 'Transition has not formally started.' },
        { label: 'Watching tutorials or enrolled in an online course, but rarely code without guidance', level: 'beginner', numericWeight: 1, explanation: 'Passive learner stage.' },
        { label: 'Coding 3–5 days a week independently; can solve basic problems and build small scripts', level: 'basic', numericWeight: 2, explanation: 'Active, healthy career transition momentum.' },
        { label: 'Built an original project with clean code that proves technical capability to non-branch recruiters', level: 'intermediate', numericWeight: 3, explanation: 'Strong bridge proof that bypasses branch bias.' },
      ],
    },
    {
      id: 'trans_github',
      competencyId: 'transition_portfolio',
      competencyName: 'Verifiable Non-Branch Portfolio Proof',
      category: 'applied',
      prompt: 'How do you plan to prove your skills on your resume when your college degree is in a different engineering branch?',
      helperText: 'Non-CS students need verifiable public GitHub/live links to pass automated ATS filters.',
      options: [
        { label: 'Relying only on my college resume and GPA', level: 'none', numericWeight: 0, explanation: 'High risk of rejection by automated resume filters.' },
        { label: 'Planning to list online certificates on LinkedIn without public code repositories', level: 'beginner', numericWeight: 1, explanation: 'Certificates carry low weight without code proof.' },
        { label: 'Have an active GitHub profile with at least 1 well-documented repository and live demo', level: 'basic', numericWeight: 2, explanation: 'Effective proof that commands recruiter respect.' },
        { label: 'Multiple deployed projects, technical blog posts explaining architecture, and open source commits', level: 'intermediate', numericWeight: 3, explanation: 'Top-tier transition candidate profile.' },
      ],
    },
  ],
};

/**
 * Dynamically resolves the best 12 to 18 adaptive questions based on:
 * branch + targetCareer + academicStage + user personal inputs
 */
export function selectAdaptiveQuestions(
  branchId: string,
  careerId: string,
  stage: AcademicStage
): AdaptiveQuestion[] {
  const career = ALL_CAREERS.find((c) => c.id === careerId);
  const branch = ALL_BRANCHES.find((b) => b.id === branchId);

  const isTransition =
    (branch?.category === 'mechanical_aero' ||
      branch?.category === 'civil_infra' ||
      branch?.category === 'chemical_bio' ||
      branch?.category === 'agri_food') &&
    (career?.domain === 'software' || career?.domain === 'data' || career?.domain === 'cyber');

  const selectedQuestions: AdaptiveQuestion[] = [];

  // 1. Choose primary domain bank
  let primaryPool: AdaptiveQuestion[] = [];
  if (career?.domain === 'software') {
    primaryPool = CAREER_QUESTION_BANKS.software || [];
  } else if (career?.domain === 'data') {
    primaryPool = CAREER_QUESTION_BANKS.data || [];
  } else if (career?.domain === 'cyber') {
    primaryPool = CAREER_QUESTION_BANKS.cyber || [];
  } else if (career?.domain === 'embedded' || career?.domain === 'vlsi') {
    primaryPool = CAREER_QUESTION_BANKS.embedded || [];
  } else if (career?.domain === 'mechanical') {
    primaryPool = CAREER_QUESTION_BANKS.mechanical || [];
  } else if (career?.domain === 'civil') {
    primaryPool = CAREER_QUESTION_BANKS.civil || [];
  } else if (career?.domain === 'electrical') {
    primaryPool = CAREER_QUESTION_BANKS.electrical || [];
  } else {
    // Default to software + transition
    primaryPool = CAREER_QUESTION_BANKS.software || [];
  }

  // Add all primary domain questions
  selectedQuestions.push(...primaryPool);

  // 2. If it's a cross-branch career transition, inject transition-specific bridge questions
  if (isTransition) {
    const transitionQuestions = CAREER_QUESTION_BANKS.transition || [];
    selectedQuestions.push(...transitionQuestions);
  }

  // 3. For 1st/2nd year students, ensure foundational reasoning and Git questions are always included
  const hasGit = selectedQuestions.some((q) => q.competencyId === 'git');
  if (!hasGit) {
    const gitQ = CAREER_QUESTION_BANKS.software.find((q) => q.competencyId === 'git');
    if (gitQ) selectedQuestions.push(gitQ);
  }

  const hasComm = selectedQuestions.some((q) => q.competencyId === 'interview_readiness' || q.competencyId === 'data_storytelling');
  if (!hasComm) {
    const commQ = CAREER_QUESTION_BANKS.software.find((q) => q.competencyId === 'interview_readiness');
    if (commQ) selectedQuestions.push(commQ);
  }

  // Ensure total questions count is strictly between 12 and 18
  if (selectedQuestions.length < 12) {
    // Pad with complementary core and system questions
    const extraCandidates = [
      ...CAREER_QUESTION_BANKS.software,
      ...CAREER_QUESTION_BANKS.data,
      ...CAREER_QUESTION_BANKS.transition,
    ];
    for (const extra of extraCandidates) {
      if (selectedQuestions.length >= 14) break;
      if (!selectedQuestions.some((q) => q.id === extra.id)) {
        selectedQuestions.push(extra);
      }
    }
  }

  return selectedQuestions.slice(0, 16);
}

/**
 * Concrete Project Recommendations based on Branch + Career + Academic Stage
 */
export interface RecommendedProject {
  id: string;
  title: string;
  stageSuitability: string;
  category: string;
  shortSummary: string;
  tools: string[];
  deliverableProof: string;
  whyThisMatters: string;
}

export function getRecommendedProjects(
  branchId: string,
  careerId: string,
  stage: AcademicStage
): RecommendedProject[] {
  const isEarly = stage.startsWith('1st Year') || stage.startsWith('2nd Year');
  const career = ALL_CAREERS.find((c) => c.id === careerId);

  if (career?.domain === 'software') {
    return isEarly
      ? [
          {
            id: 'p_sw_1',
            title: 'CLI Task Manager & Data File Engine',
            stageSuitability: '1st & 2nd Year Foundation',
            category: 'Core Programming',
            shortSummary: 'Build an interactive console application in Java/C++/Python that parses structured CSV/JSON data, performs sorting/filtering, and persists data without a GUI.',
            tools: ['Java / C++', 'File I/O', 'Git & GitHub', 'OOP'],
            deliverableProof: 'Public GitHub repo with comprehensive README, setup instructions, and commit history.',
            whyThisMatters: 'Proves to interviewers that you master syntax, arrays, loops, and file persistence without relying on boilerplate web frameworks.',
          },
          {
            id: 'p_sw_2',
            title: 'Full-Stack Student Notes & Resource Portal',
            stageSuitability: '2nd & 3rd Year Transition',
            category: 'Full-Stack Web',
            shortSummary: 'Develop a responsive web application with user registration, subject categorization, PDF notes uploading, and search query filters.',
            tools: ['React / Vite', 'Node.js / Express', 'PostgreSQL or SQLite', 'Tailwind CSS'],
            deliverableProof: 'Live deployed URL (Vercel/Render) and public repository with API documentation.',
            whyThisMatters: 'Demonstrates end-to-end client-server architecture, database schema design, and live deployment capability.',
          },
        ]
      : [
          {
            id: 'p_sw_3',
            title: 'High-Concurrency URL Shortener & Analytics API',
            stageSuitability: '3rd & 4th Year Placement Standard',
            category: 'Backend & Systems',
            shortSummary: 'Build a production-grade REST API that generates encoded short URLs, caches frequent redirects in Redis, and stores click analytics in PostgreSQL.',
            tools: ['Go / Node.js / Java Spring', 'PostgreSQL', 'Redis Cache', 'Docker'],
            deliverableProof: 'Dockerized repo with automated test suite, Locust load test benchmarks, and API documentation.',
            whyThisMatters: 'Directly addresses system design interview questions on caching, database indexes, and API rate limiting.',
          },
          {
            id: 'p_sw_4',
            title: 'Collaborative Real-time Canvas or Markdown Editor',
            stageSuitability: '3rd & 4th Year Placement Standard',
            category: 'Distributed Systems / WebSockets',
            shortSummary: 'Develop a multi-user workspace where multiple users can collaborate simultaneously over WebSockets with conflict resolution.',
            tools: ['TypeScript', 'WebSocket / Socket.io', 'React', 'Redis Pub/Sub'],
            deliverableProof: 'Live deployed application tested with 2 simultaneous browser windows and demonstrable sync speed.',
            whyThisMatters: 'Demonstrates handling asynchronous concurrency, state synchronization, and modern event-driven architectures.',
          },
        ];
  }

  if (career?.domain === 'data') {
    return isEarly
      ? [
          {
            id: 'p_ds_1',
            title: 'Telangana Engineering Admission Data Explorer',
            stageSuitability: '1st & 2nd Year Foundation',
            category: 'Data Wrangling & Analytics',
            shortSummary: 'Clean, normalize, and visualize Telangana EAPCET allotment ranks across districts and branches to discover median cutoff trends.',
            tools: ['Python', 'Pandas', 'Matplotlib / Seaborn', 'Jupyter Notebook'],
            deliverableProof: 'Documented Jupyter Notebook on GitHub with clear commentary and exported PDF summary report.',
            whyThisMatters: 'Shows prospective employers that you can take raw, imperfect datasets and derive meaningful human insights.',
          },
          {
            id: 'p_ds_2',
            title: 'Interactive Sales / Financial Dashboard in Streamlit',
            stageSuitability: '2nd & 3rd Year Transition',
            category: 'Applied Analytics',
            shortSummary: 'Build an interactive web dashboard allowing users to filter monthly revenue, customer churn, and category performance with live charts.',
            tools: ['Python', 'Streamlit', 'Plotly', 'SQLite / PostgreSQL'],
            deliverableProof: 'Live Streamlit Community Cloud URL and GitHub repository with sample dataset.',
            whyThisMatters: 'Bridges technical data analysis with business stakeholder presentation and UI delivery.',
          },
        ]
      : [
          {
            id: 'p_ds_3',
            title: 'End-to-End Loan Default Predictor with Model Explainability',
            stageSuitability: '3rd & 4th Year Placement Standard',
            category: 'Production Machine Learning',
            shortSummary: 'Train and tune an XGBoost classifier on banking data, handle class imbalance via SMOTE, and explain individual predictions using SHAP values.',
            tools: ['Scikit-learn', 'XGBoost', 'SHAP', 'FastAPI', 'Docker'],
            deliverableProof: 'Containerized REST endpoint that accepts loan applicant features and returns probability score plus SHAP top drivers.',
            whyThisMatters: 'Demonstrates strict model evaluation discipline beyond accuracy, addressing real-world bias and explainability.',
          },
          {
            id: 'p_ds_4',
            title: 'Retrieval-Augmented Academic Paper Q&A Assistant (RAG)',
            stageSuitability: '3rd & 4th Year Placement Standard',
            category: 'Applied GenAI & Search',
            shortSummary: 'Ingest research PDFs, generate semantic chunk embeddings, index them in a local vector database, and answer questions grounded strictly in citations.',
            tools: ['Python', 'Gemini API', 'ChromaDB / FAISS', 'LangChain', 'Streamlit'],
            deliverableProof: 'Working application with verified citations, source text highlights, and zero hallucination guardrails.',
            whyThisMatters: 'Shows practical command over modern GenAI architectures that tech recruiters are actively seeking.',
          },
        ];
  }

  if (career?.domain === 'embedded' || career?.domain === 'vlsi') {
    return [
      {
        id: 'p_emb_1',
        title: 'Environmental Telemetry Logger with I2C Sensor & OLED',
        stageSuitability: '2nd & 3rd Year Core',
        category: 'Microcontroller Firmware',
        shortSummary: 'Interface an STM32 or ESP32 with a BME280 temperature/pressure sensor over I2C, log timestamps to an SD card via SPI, and display values on an OLED.',
        tools: ['Embedded C', 'STM32CubeIDE / ESP-IDF', 'I2C / SPI', 'KiCad'],
        deliverableProof: 'GitHub repository with clean C driver code, KiCad schematic PDF, and a 30-second hardware video demo.',
        whyThisMatters: 'Proves your capability to read datasheets, configure register clocks, and handle timing protocols without libraries.',
      },
      {
        id: 'p_emb_2',
        title: 'Custom USB-Powered Sensor Gateway PCB in KiCad',
        stageSuitability: '3rd & 4th Year Placement Standard',
        category: 'Hardware & PCB Design',
        shortSummary: 'Design a complete 2-layer PCB with USB-C power delivery, 3.3V LDO regulator, ESP32 microcontroller module, and sensor break-outs.',
        tools: ['KiCad', 'Schematic Capture', 'Footprint Assignment', 'Gerber Generation'],
        deliverableProof: '3D PCB render, schematic PDF, bill of materials (BOM), and DRC verification log in GitHub.',
        whyThisMatters: 'Physical hardware proof distinguishes you immediately from candidates who only possess software theory.',
      },
    ];
  }

  if (career?.domain === 'mechanical') {
    return [
      {
        id: 'p_mech_1',
        title: 'Modular Gearbox / Robotic Arm Joint CAD with GD&T',
        stageSuitability: '2nd & 3rd Year Mechanical',
        category: 'Mechanical Design & DFM',
        shortSummary: 'Model a planetary gear reduction mechanism in SolidWorks, conduct interference checks, create detailed manufacturing drawings, and calculate gear stresses.',
        tools: ['SolidWorks / Fusion 360', 'GD&T (ASME Y14.5)', 'Stress Calculation'],
        deliverableProof: 'Assembly drawing PDF with title block, bill of materials (BOM), 3D STL files, and stress report.',
        whyThisMatters: 'Demonstrates to automotive and robotics hiring managers that your designs can actually be manufactured.',
      },
      {
        id: 'p_mech_2',
        title: 'Structural Optimization & FEA of an Automotive Control Arm',
        stageSuitability: '3rd & 4th Year Placement Standard',
        category: 'CAE & Simulation',
        shortSummary: 'Perform structural static FEA on a suspension wishbone in ANSYS, analyze Von Mises stress concentrations, and lightweight the geometry by 15%.',
        tools: ['ANSYS Mechanical', 'SolidWorks', 'Mesh Convergence', 'Material Yield'],
        deliverableProof: 'Comprehensive FEA report detailing boundary conditions, mesh independence study, and safety factor comparison.',
        whyThisMatters: 'Demonstrates scientific simulation rigor rather than naive button-clicking.',
      },
    ];
  }

  if (career?.domain === 'civil') {
    return [
      {
        id: 'p_civ_1',
        title: 'G+4 Commercial Building Analysis & RCC Detailing',
        stageSuitability: '3rd & 4th Year Placement Standard',
        category: 'Structural Design',
        shortSummary: 'Model a multi-story commercial reinforced concrete frame in ETABS/STAAD.Pro, apply IS 875 wind and IS 1893 earthquake combinations, and design critical columns.',
        tools: ['ETABS / STAAD.Pro', 'AutoCAD', 'IS 456:2000', 'IS 1893:2016'],
        deliverableProof: 'Structural calculation report with beam/column schedules and AutoCAD reinforcement detailing sheets.',
        whyThisMatters: 'Directly maps to the daily tasks of entry-level structural and consulting engineers.',
      },
    ];
  }

  // Fallback
  return [
    {
      id: 'p_def_1',
      title: 'Domain Engineering Prototype & Technical Repository',
      stageSuitability: 'Universal Core',
      category: 'Technical Portfolio',
      shortSummary: 'Develop an end-to-end technical project addressing a real problem in your branch, thoroughly documented with verifiable public files.',
      tools: ['Domain CAD / Code', 'Git / Cloud Drive', 'Technical Documentation'],
      deliverableProof: 'Public repository or portfolio link with video walkthrough and calculations.',
      whyThisMatters: 'Provides recruiters with immediate empirical evidence of self-driven competence.',
    },
  ];
}

/**
 * Backward compatibility helpers
 */
export function getBranch(id: string) {
  const b = ALL_BRANCHES.find((x) => x.id === id);
  return (
    b || {
      id,
      name: id.toUpperCase(),
      category: 'other' as const,
      description: 'Engineering specialisation',
    }
  );
}

export function getCareer(id: string) {
  return ALL_CAREERS.find((x) => x.id === id);
}

// Retain legacy aliases so existing components continue to compile cleanly
export const BRANCHES = ALL_BRANCHES.map((b) => ({
  id: b.id,
  name: b.name,
  description: b.description,
  careers: getCareersForBranch(b.id).map((c) => c.id),
  domainSkills: [
    { id: 'core', name: 'Core Foundations', category: 'Core', description: 'Branch foundational subjects.' },
    { id: 'tools', name: 'Domain Tools & Software', category: 'Tools', description: 'Industry software and environments.' },
    { id: 'projects', name: 'Verifiable Projects', category: 'Applied', description: 'Hands-on practical implementation.' },
  ],
}));

export const CAREERS = ALL_CAREERS.map((c) => ({
  id: c.id,
  branchId: 'all',
  direction: 'industry' as const,
  title: c.title,
  shortDescription: c.description,
  skills: [
    { skillId: 'core', target: 'intermediate' as SkillLevel, weight: 3, why: 'Essential knowledge', next: 'Practice' },
  ],
  questions: [],
  projects: [c.description],
}));

export const ENTREPRENEUR_SKILLS = [
  { id: 'problem_validation', name: 'Problem Discovery & Customer Interviews', description: 'Validating real pain points before writing code.' },
  { id: 'lean_mvp', name: 'Rapid Prototyping & Lean MVP', description: 'Launching a functional minimal prototype in under 2 weeks.' },
  { id: 'business_model', name: 'Unit Economics & Monetization', description: 'Understanding margins, CAC, and pricing models.' },
];

export const ENTREPRENEUR_QUESTIONS = [
  { skillId: 'problem_validation', question: 'How many potential customers or users have you spoken to about their daily problems?' },
  { skillId: 'lean_mvp', question: 'Can you ship a working demo or prototype to test demand within 7 days?' },
  { skillId: 'business_model', question: 'Do you understand how your solution will generate revenue or pay for servers?' },
];
