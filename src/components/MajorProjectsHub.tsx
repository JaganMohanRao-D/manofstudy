import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Server,
  Database,
  ArrowRight,
  GitBranch,
  Terminal,
  FileCode2,
  Workflow,
  CheckCircle2,
  Boxes,
  Lock,
  Stethoscope,
  Network,
  Activity,
} from 'lucide-react';

export interface MajorProject {
  id: string;
  title: string;
  shortDesc: string;
  category: 'systems' | 'distributed' | 'blockchain' | 'healthcare' | 'aiml' | 'security' | 'iot';
  categoryLabel: string;
  complexity: 'Advanced' | 'Intermediate';
  estimatedHours: string;
  techStack: string[];
  resumeBullet: string;
  architectureDiagram: string;
  keyModules: string[];
  interviewDefenseQuestion: string;
  defenseAnswer: string;
  githubStarterStructure: string[];
}

export const MAJOR_PROJECTS: MajorProject[] = [
  {
    id: 'distributed-url-shortener',
    title: 'Distributed URL Shortener with Bloom Filters & Redis Cache',
    shortDesc: 'High-throughput URL shortener with Base62 encoding, custom Redis L1 caching, and Bloom filters for sub-millisecond collision checks.',
    category: 'distributed',
    categoryLabel: 'Distributed Systems',
    complexity: 'Advanced',
    estimatedHours: '45-60 hrs',
    techStack: ['Go / Node.js', 'Redis', 'PostgreSQL', 'Docker', 'Bloom Filter', 'Base62'],
    resumeBullet: 'Architected distributed URL shortener processing 10k req/sec with Base62 hashing, Redis cache layer (98% hit rate), and Bloom filter eliminating 99.2% redundant database lookups.',
    architectureDiagram: `[ Client App ]
      │ (REST / gRPC)
      ▼
[ Reverse Proxy / Load Balancer (Nginx) ]
      │
      ├──> [ Bloom Filter (Sub-ms Existence Check) ]
      │          ├── Not Found: Return 404 immediately
      │          └── Likely Found: Continue
      │
      ├──> [ Redis L1 Cache (Key-Value) ] ──(Hit: <2ms)──> Return Full URL
      │
      └──> [ PostgreSQL Sharded Store ] ──(Miss)──> Query & Populate Redis Cache`,
    keyModules: [
      'Base62 Bijective Counter Encoding & Snowflake ID Generator',
      'Probabilistic Bloom Filter for Negative Caching',
      'Redis Cache-Aside Strategy with TTL Eviction',
      'Database Connection Pooling and Horizontal Partitioning',
    ],
    interviewDefenseQuestion: 'How do you handle hash collisions and race conditions during high concurrent URL creation?',
    defenseAnswer: 'Used a distributed Snowflake ID generator that encodes timestamp + worker node ID + sequence counter. Converting this 64-bit monotonically increasing integer to Base62 guarantees unique, deterministic short keys without requiring database collision checks or lock contention.',
    githubStarterStructure: [
      'cmd/server/main.go',
      'internal/encoder/base62.go',
      'internal/cache/bloom.go',
      'internal/cache/redis.go',
      'internal/storage/postgres.go',
      'docker-compose.yml',
    ],
  },
  {
    id: 'blockchain-ledger',
    title: 'Blockchain Proof-of-Work Ledger & Distributed Consensus Node',
    shortDesc: 'Custom blockchain node implemented from scratch with SHA-256 mining, difficulty readjustment, P2P gossip, and digital signature verification.',
    category: 'blockchain',
    categoryLabel: 'Blockchain & Cryptography',
    complexity: 'Advanced',
    estimatedHours: '50-70 hrs',
    techStack: ['Rust / TypeScript', 'SHA-256', 'ECDSA', 'WebSockets', 'LevelDB'],
    resumeBullet: 'Engineered peer-to-peer Proof-of-Work blockchain node in TypeScript/Rust supporting ECC digital signature verification, dynamic mining difficulty readjustment, and Merkle tree block integrity audits.',
    architectureDiagram: `[ Transaction Generator ] (Signs payload via ECDSA Private Key)
             │
             ▼
      [ Mempool (Unconfirmed Tx Pool) ]
             │
             ▼
    [ Miner Worker Thread ] ──(SHA-256 Proof-of-Work Hash loop until leading zeros met)
             │
             ▼
    [ Candidate Block Created ] (Header: PrevHash + MerkleRoot + Nonce + Timestamp)
             │
             ▼
    [ P2P Gossip Broadcast (WebSockets) ] ──> Validated by Network Peers & Appended to LevelDB`,
    keyModules: [
      'Elliptic Curve Digital Signature Verification (secp256k1)',
      'Merkle Tree Transaction Aggregation & Root Computation',
      'Proof-of-Work Consensus Engine with Dynamic Target Difficulty',
      'P2P Peer Discovery & Chain Synchronization Protocol',
    ],
    interviewDefenseQuestion: 'What prevents an attacker from modifying a past transaction in block #4 when current block is #10?',
    defenseAnswer: 'Every block header contains the SHA-256 hash of the previous block. Changing even one byte in block #4 alters its hash, cascading down through every subsequent block header and invalidating all nonces. The attacker would have to re-mine blocks 4 through 10 faster than the entire honest network combined (51% attack threshold).',
    githubStarterStructure: [
      'src/core/block.ts',
      'src/core/blockchain.ts',
      'src/crypto/ecc.ts',
      'src/crypto/merkle.ts',
      'src/p2p/node.ts',
      'src/cli/miner.ts',
    ],
  },
  {
    id: 'mini-os-scheduler',
    title: 'Mini OS Process & CPU Scheduler Simulator (MLFQ & Round-Robin)',
    shortDesc: 'Low-level operating system CPU scheduler simulation simulating Multi-Level Feedback Queues, preemptive Round-Robin, context switches, and Starvation avoidance.',
    category: 'systems',
    categoryLabel: 'Systems & OS',
    complexity: 'Advanced',
    estimatedHours: '40-55 hrs',
    techStack: ['C++ / C', 'POSIX Threads', 'Shared Memory', 'Data Structures (Heap/Queue)', 'Valgrind'],
    resumeBullet: 'Developed low-level Multi-Level Feedback Queue (MLFQ) process scheduler simulating preemptive CPU slicing, context switch overhead metrics, and aging algorithms to prevent thread starvation.',
    architectureDiagram: `[ Process Arrival Queue (PCB: PID, Priority, Burst Time, I/O Time) ]
                     │
                     ▼
          ┌─► [ Priority Queue 0 (Quantum: 4ms - High Priority / I/O Bound) ]
          │          │ (Exhausts quantum without I/O)
          │          ▼ Demote
          │   [ Priority Queue 1 (Quantum: 8ms - Medium Priority) ]
          │          │ (Exhausts quantum)
          │          ▼ Demote
          │   [ Priority Queue 2 (Quantum: 16ms / FCFS - CPU Bound) ]
          │
          └── (Aging Rule: Periodically Boost All Low Priority Jobs to Q0 every 500ms)`,
    keyModules: [
      'Process Control Block (PCB) State Machine (Ready, Running, Waiting, Terminated)',
      'Preemptive Time-Slice Interrupt Emulation',
      'Multi-Level Feedback Queue with Dynamic Demotion and Periodic Aging',
      'Context Switch Cost & Cache Thrashing Latency Accounting',
    ],
    interviewDefenseQuestion: 'How does MLFQ differentiate between CPU-intensive batch jobs and interactive I/O bound tasks without prior knowledge?',
    defenseAnswer: 'Tasks enter at highest priority. If a job yields CPU before its quantum expires (waiting on keyboard/network I/O), it stays in high priority for snappy responsiveness. If it exhausts its full quantum doing computation, the scheduler demotes it to lower priority queues with longer quantums, naturally separating interactive from batch jobs.',
    githubStarterStructure: [
      'src/pcb.hpp',
      'src/scheduler.cpp',
      'src/mlfq.cpp',
      'src/metrics.cpp',
      'tests/workload_generator.py',
      'Makefile',
    ],
  },
  {
    id: 'hospital-management',
    title: 'Critical Care Hospital Management & Triage Telemetry System',
    shortDesc: 'Enterprise healthcare workflow system with emergency room acuity triage (ESI 1-5), ICU bed state sync, HL7/FHIR message parser, and doctor on-call pager.',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Systems',
    complexity: 'Intermediate',
    estimatedHours: '45-60 hrs',
    techStack: ['React / TypeScript', 'Node.js', 'PostgreSQL', 'WebSockets', 'HL7/FHIR standard'],
    resumeBullet: 'Created full-stack hospital clinical operations system with real-time emergency triage classification (ESI 1-5), ICU bed occupancy state machine, and HL7 FHIR clinical record parser.',
    architectureDiagram: `[ ER Patient Walk-in / Ambulance Telemetry ]
                     │
                     ▼
       [ Emergency Severity Triage Engine ] (Scores ESI 1 to 5 based on Vital Signs)
                     │
      ┌──────────────┴──────────────┐
      ▼                             ▼
[ Priority 1 (Crash/Cardiac) ]   [ Priority 4/5 (Stable Outpatient) ]
      │                             │
[ Immediate ICU Bed Dispatch ]   [ Queue in Regular Waiting Hall ]
      │                             │
      └──────────────┬──────────────┘
                     ▼
     [ Real-Time Doctor Pager (WebSockets) ]
                     │
     [ HL7 / FHIR Clinical Audit Storage (PostgreSQL) ]`,
    keyModules: [
      'Emergency Severity Index (ESI) Triage Algorithmic Classifier',
      'ICU & Ventilator Real-Time Bed Allocation State Machine',
      'Doctor On-Call Automated Escalation Protocol',
      'HL7 v2 & FHIR v4 Observation and Patient JSON Transformer',
    ],
    interviewDefenseQuestion: 'How do you prevent race conditions when two ER doctors simultaneously attempt to claim the last available ICU bed?',
    defenseAnswer: 'Used database row-level locking with PostgreSQL `SELECT FOR UPDATE` inside an atomic transaction, paired with a Redis distributed mutex lock. Only the first transaction acquires the bed lease; the second receives an immediate `BedUnavailableException` with fallback to nearest affiliated trauma center.',
    githubStarterStructure: [
      'backend/src/triage/esiCalculator.ts',
      'backend/src/beds/allocationService.ts',
      'backend/src/fhir/parser.ts',
      'frontend/src/components/TriageBoard.tsx',
      'frontend/src/components/BedMatrix.tsx',
    ],
  },
  {
    id: 'realtime-canvas',
    title: 'Real-Time Collaborative Whiteboard with Operational Transformation',
    shortDesc: 'Interactive vector canvas allowing multi-cursor live drawing, sticky notes, and conflict-free concurrent editing using CRDTs and WebSockets.',
    category: 'distributed',
    categoryLabel: 'Full-Stack & Systems',
    complexity: 'Advanced',
    estimatedHours: '40-55 hrs',
    techStack: ['React', 'HTML5 Canvas', 'WebSockets', 'Yjs / CRDT', 'Tailwind CSS'],
    resumeBullet: 'Engineered real-time collaborative canvas with 60 FPS vector rendering, multi-user cursor interpolation, and CRDT conflict resolution handling 20+ concurrent users with zero desync.',
    architectureDiagram: `[ Client A (Drawing Path) ] ────┐
                                 ▼
                     [ Yjs / CRDT Document Update ]
                                 │
                     [ WebSocket Server Broadcast ]
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     ▼                                                       ▼
[ Client B Canvas Redraw (60 FPS) ]             [ Client C Canvas Redraw (60 FPS) ]`,
    keyModules: [
      'HTML5 2D Canvas Hardware-Accelerated Path Rendering',
      'Multi-User Viewport & Mouse Cursor Interpolation (Lerp)',
      'Conflict-Free Replicated Data Types (CRDT) for Shape States',
      'Undo/Redo History Stack with Distributed Peer Synchronization',
    ],
    interviewDefenseQuestion: 'Why choose CRDTs over traditional centralized lock-based state for collaborative drawing?',
    defenseAnswer: 'Lock-based state introduces unacceptable latency and prevents offline work. With CRDTs (Conflict-Free Replicated Data Types), edits are applied locally at 60 FPS without waiting for network ACK, and mathematically guaranteed to converge to the identical state across all peers regardless of message delivery order.',
    githubStarterStructure: [
      'src/canvas/renderer.ts',
      'src/crdt/docStore.ts',
      'src/socket/syncEngine.ts',
      'src/ui/Toolbar.tsx',
    ],
  },
  {
    id: 'ats-semantic-matcher',
    title: 'Semantic ATS Resume Ranker & Knowledge Graph Matcher',
    shortDesc: 'Automated recruitment screener extracting text from PDF/DOCX resumes, computing TF-IDF + sentence transformer embeddings, and generating skill gap radar.',
    category: 'aiml',
    categoryLabel: 'AI & Data Science',
    complexity: 'Intermediate',
    estimatedHours: '35-50 hrs',
    techStack: ['Python / FastAPI', 'Sentence-Transformers', 'spaCy', 'Scikit-learn', 'pdfplumber'],
    resumeBullet: 'Built semantic resume-to-job-description ranking engine leveraging spaCy NER entity extraction and vector cosine embeddings, cutting recruiter screening time by 75%.',
    architectureDiagram: `[ Resume PDF / DOCX ] ──> [ pdfplumber / Tika ] ──> [ Raw Text Stream ]
                                                        │
[ Job Description Text ] ────────────────────────────────┤
                                                        ▼
                                     [ spaCy NLP Entity Recognizer ]
                                     (Extracts: Skills, Degrees, Years)
                                                        │
                                                        ▼
                              [ Sentence-BERT Semantic Embedding Generator ]
                                                        │
                                                        ▼
                                [ Cosine Similarity & Skill Radar Calculator ]
                                                        │
                                                        ▼
                                [ Match Score (0-100%) + Missing Keywords List ]`,
    keyModules: [
      'Heuristic PDF Structural Parser & Section Segmenter',
      'Named Entity Recognition (NER) for Technology & Degree Taxonomy',
      'Dense Vector Embedding with Cosine Similarity Ranking',
      'Actionable Missing Keyword Diagnostic Generator',
    ],
    interviewDefenseQuestion: 'Why is dense semantic embedding superior to pure keyword frequency (TF-IDF)?',
    defenseAnswer: 'TF-IDF fails on synonyms; a candidate writing "Kubernetes & microservices" gets 0 match if the JD specifically asks for "container orchestration". Sentence-BERT embeddings map both phrases to close proximity in high-dimensional vector space, capturing conceptual equivalence.',
    githubStarterStructure: [
      'app/main.py',
      'app/parsers/pdf_extractor.py',
      'app/nlp/entity_matcher.py',
      'app/nlp/vectorizer.py',
      'requirements.txt',
    ],
  },
  {
    id: 'iot-smart-agriculture',
    title: 'IoT Precision Agriculture Telemetry & Irrigation Automator',
    shortDesc: 'End-to-end telemetry system capturing soil moisture, ambient temperature, and NPK indices via ESP32, streaming over MQTT to a threshold-driven irrigation controller.',
    category: 'iot',
    categoryLabel: 'IoT & Embedded',
    complexity: 'Intermediate',
    estimatedHours: '35-45 hrs',
    techStack: ['C++ (Arduino/ESP32)', 'MQTT (Mosquitto)', 'InfluxDB', 'Grafana', 'Node.js'],
    resumeBullet: 'Designed automated IoT precision agriculture gateway transmitting soil telemetry over MQTT to InfluxDB time-series database with automated solenoid valve pump triggers.',
    architectureDiagram: `[ Soil Sensors (Moisture, Temp, NPK) ]
                    │
                    ▼ (Analog / I2C)
        [ ESP32 Microcontroller Node ]
                    │ (WiFi / MQTT over Port 1883)
                    ▼
          [ Mosquitto MQTT Broker ]
                    │
                    ▼
      [ Telemetry Ingestion Worker ]
        ├── Write to InfluxDB Time-Series
        └── Check Threshold: If Soil Moisture < 25% ──> [ Publish Pump ON Command ]`,
    keyModules: [
      'ESP32 Low-Power Deep Sleep Cycle and Sensor Polling',
      'MQTT Protocol Quality of Service (QoS 1) Transmission',
      'InfluxDB Time-Series Data Retention and Aggregation',
      'Automated Relay Solenoid Actuator Control with Fail-Safe Timeout',
    ],
    interviewDefenseQuestion: 'How do you safeguard crops against hardware failures where a sensor wires disconnect and reports 0% moisture continuously?',
    defenseAnswer: 'Implemented rate-of-change sanity checks and a hard hardware watchdog timer. If moisture drops instantly faster than physically possible, an anomaly alert is raised rather than engaging the pump. Additionally, pump activation is capped at 15 minutes per cycle regardless of sensor input to prevent waterlogging.',
    githubStarterStructure: [
      'firmware/src/main.cpp',
      'firmware/platformio.ini',
      'server/mqtt_client.py',
      'server/influx_writer.py',
      'dashboard/grafana_config.json',
    ],
  },
  {
    id: 'crypto-steganography-vault',
    title: 'AES-256-GCM Cryptographic Vault with LSB Steganography Engine',
    shortDesc: 'Security application that encrypts confidential documents with authenticated AES-256-GCM and conceals the encrypted payload inside lossless PNG images using Least Significant Bit encoding.',
    category: 'security',
    categoryLabel: 'Cybersecurity',
    complexity: 'Intermediate',
    estimatedHours: '30-45 hrs',
    techStack: ['Python / TypeScript', 'AES-256-GCM', 'PBKDF2 / Argon2', 'Pillow / Canvas API'],
    resumeBullet: 'Developed zero-knowledge file security vault utilizing PBKDF2 key derivation, AES-256-GCM authenticated encryption, and Least Significant Bit (LSB) image steganography.',
    architectureDiagram: `[ Confidential Document ] ──> [ Compressed with Zlib ]
                                     │
                                     ▼
[ User Passphrase ] ──> [ Argon2 Key Derivator (Salt) ] ──> [ 256-Bit Master Key ]
                                     │
                                     ▼
                     [ AES-256-GCM Encryption ]
                     (Outputs: Ciphertext + 128-Bit Auth Tag)
                                     │
                                     ▼
[ Carrier PNG Image ] ──> [ LSB Bit Inserter (Replaces Lowest Bit of RGBA Channels) ]
                                     │
                                     ▼
                    [ Visually Identical Stego-Image ]`,
    keyModules: [
      'Argon2id Memory-Hard Key Derivation Function',
      'AES-256 in Galois/Counter Mode (GCM) for Confidentiality and Integrity',
      'Spatial Domain LSB (Least Significant Bit) Pixel Encoder',
      'Shannon Entropy Detector to Measure Cryptographic Randomness',
    ],
    interviewDefenseQuestion: 'Why does GCM mode need an Authentication Tag in addition to the ciphertext?',
    defenseAnswer: 'Ciphertext alone only guarantees privacy, not integrity. Without authentication (as in pure CBC), an attacker can tamper with bits in transit (bit-flipping attacks) which decrypts into altered data. GCM produces an authentication tag that mathematically verifies the ciphertext has not been modified by any third party.',
    githubStarterStructure: [
      'src/crypto/aes_gcm.ts',
      'src/crypto/kdf.ts',
      'src/stego/lsb_encoder.ts',
      'src/stego/lsb_decoder.ts',
      'tests/integrity.test.ts',
    ],
  },
];

export const MajorProjectsHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProject, setActiveProject] = useState<MajorProject | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All 15+ Projects' },
    { id: 'distributed', label: 'Distributed Systems' },
    { id: 'systems', label: 'Systems & OS' },
    { id: 'blockchain', label: 'Blockchain & Web3' },
    { id: 'healthcare', label: 'Healthcare & BiPC' },
    { id: 'aiml', label: 'AI & Data Science' },
    { id: 'security', label: 'Cybersecurity' },
    { id: 'iot', label: 'IoT & Hardware' },
  ];

  const filteredProjects = MAJOR_PROJECTS.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.shortDesc.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.techStack.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <div id="major-projects-hub" className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/25 p-5 sm:p-7 shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#6366f118_1px,transparent_1px),linear-gradient(to_bottom,#6366f118_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Placements &amp; Tier-1 Resume Arsenal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Campus Placement <span className="text-indigo-400">Major Projects Hub</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            High-impact major projects with architecture diagrams, blueprints, and interview defense answers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, keyword, tech stack (e.g., Redis, Bloom, PoW, ESP32)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            id={`project-card-${proj.id}`}
            className="group relative flex flex-col justify-between bg-slate-900 text-white rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 p-5 space-y-4"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <Workflow className="w-3 h-3" />
                  {proj.categoryLabel}
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {proj.complexity} • {proj.estimatedHours}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-extrabold text-white tracking-tight leading-snug group-hover:text-indigo-300 transition-colors">
                {proj.title}
              </h3>

              {/* Description */}
              <p className="text-slate-200 font-medium text-xs leading-relaxed opacity-95">
                {proj.shortDesc}
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Resume Bullet Preview */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Resume Bullet
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(proj.resumeBullet, proj.id)}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === proj.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                  "{proj.resumeBullet}"
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveProject(proj)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
              >
                <span>View System Architecture &amp; Interview Defense</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deep-Dive Architecture & Defense Modal */}
      {activeProject && (
        <div
          id="project-detail-modal-dimmer"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setActiveProject(null)}
        >
          <div
            id="project-detail-modal-content"
            className="relative w-full max-w-3xl bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
                  <Workflow className="w-3 h-3" />
                  {activeProject.categoryLabel}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {activeProject.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Architecture Diagram Box */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                System Architectural Flow &amp; Data Pipeline
              </span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-200 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed">
                {activeProject.architectureDiagram}
              </pre>
            </div>

            {/* Key Modules */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                Core Engineering Modules to Implement
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeProject.keyModules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Defense Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Placement Interview Defense (Harsh Technical Probe)</span>
              </div>
              <p className="text-xs font-bold text-white">
                Q: "{activeProject.interviewDefenseQuestion}"
              </p>
              <p className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-indigo-400">
                <strong className="text-indigo-300">Model Answer:</strong> {activeProject.defenseAnswer}
              </p>
            </div>

            {/* Suggested Repository Structure */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                Clean GitHub File Layout
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 flex flex-wrap gap-2">
                {activeProject.githubStarterStructure.map((file, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                    {file}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MajorProjectsHub;
