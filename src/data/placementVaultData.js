// ============================================================================
// MAN OF STUDY PLACEMENT VIVA FLASHCARDS (50 HIGH-FREQUENCY INTERVIEW QUESTIONS)
// Categories: OOPs (10), DBMS (10), OS (10), Computer Networks (10), DSA (10)
// ============================================================================

export const VIVA_FLASHCARDS = [
  // --------------------------------------------------------------------------
  // 1. OBJECT-ORIENTED PROGRAMMING (OOPs) - 10 CARDS
  // --------------------------------------------------------------------------
  {
    id: 'oops-1',
    category: 'OOPs',
    difficulty: 'High Yield',
    question: 'What is the difference between Method Overloading and Method Overriding?',
    answer:
      'Method Overloading occurs within the SAME class where multiple methods share the same name but differ in parameters (type, number, or order). It is resolved at compile time (Static Polymorphism).\n\nMethod Overriding occurs between Base and Derived classes where a child class provides its own implementation of a parent method with the exact same name and signature. It is resolved at runtime (Dynamic Polymorphism) using a virtual table (vtable).',
    keyPoints: [
      'Overloading: Same class, different arguments, compile-time binding.',
      'Overriding: Inheritance hierarchy, identical signature, runtime binding.',
      'Return type alone cannot differentiate overloaded functions.'
    ]
  },
  {
    id: 'oops-2',
    category: 'OOPs',
    difficulty: 'Core',
    question: 'Explain Abstraction vs Encapsulation with a real-world Car example.',
    answer:
      'Abstraction means hiding implementation complexity and exposing only essential interfaces. For a car, the driver interacts with the steering wheel, accelerator, and brake without knowing how the ECU injects fuel or internal pistons ignite.\n\nEncapsulation means bundling data (attributes) and methods that operate on them together while restricting direct access using access specifiers (private, protected). In a car, engine oil and battery voltage are encapsulated under the hood and modified only through controlled mechanisms.',
    keyPoints: [
      'Abstraction = "What" the object does (Interface level).',
      'Encapsulation = "How" data is shielded inside (Data hiding level).',
      'Encapsulation is achieved via private variables with public getters/setters.'
    ]
  },
  {
    id: 'oops-3',
    category: 'OOPs',
    difficulty: 'High Yield',
    question: 'What are Virtual Functions and Pure Virtual Functions in C++?',
    answer:
      'A Virtual Function is a member function in a base class declared with the `virtual` keyword that you expect to override in derived classes. It guarantees that the derived version runs even when called through a base class pointer (runtime dispatch).\n\nA Pure Virtual Function has no implementation in the base class and is assigned `= 0` (e.g., `virtual void draw() = 0;`). Any class containing at least one pure virtual function becomes an Abstract Class and cannot be instantiated directly.',
    keyPoints: [
      'Virtual function: has default base body; can be overridden.',
      'Pure virtual function: `virtual void f() = 0;` has no base body; MUST be overridden.',
      'Classes with pure virtual functions are Abstract Classes.'
    ]
  },
  {
    id: 'oops-4',
    category: 'OOPs',
    difficulty: 'Core',
    question: 'Explain Multiple Inheritance and how the Diamond Problem is resolved.',
    answer:
      'The Diamond Problem happens when Class D inherits from both Class B and Class C, which both inherit from a common ancestor Class A. If Class A defines a variable `val` or method `foo()`, Class D inherits two ambiguous copies.\n\nResolution:\n• In C++, resolve using `virtual` inheritance (`class B : virtual public A`). This ensures only ONE shared instance of A is constructed.\n• In Java, multiple class inheritance is disallowed; interfaces with explicit disambiguation (`Interface.super.foo()`) are used instead.',
    keyPoints: [
      'Ambiguity occurs when multiple paths lead to a single root ancestor.',
      'C++: Solved with `virtual` base classes.',
      'Java: Disallows multiple class inheritance, allows multiple interface implementation.'
    ]
  },
  {
    id: 'oops-5',
    category: 'OOPs',
    difficulty: 'High Yield',
    question: 'What is the difference between Shallow Copy and Deep Copy?',
    answer:
      'Shallow Copy copies all field values bit-by-bit. If an object contains pointers to dynamically allocated heap memory, only the address is copied, meaning both original and copy point to the exact same memory (risk of double-free and unwanted mutation).\n\nDeep Copy allocates fresh separate memory on the heap for all dynamic members and duplicates the actual underlying values, making the two objects completely independent.',
    keyPoints: [
      'Shallow Copy: Copies pointer addresses (shared memory danger).',
      'Deep Copy: Allocates new memory and duplicates underlying data.',
      'Default copy constructors in C++ perform a shallow copy.'
    ]
  },
  {
    id: 'oops-6',
    category: 'OOPs',
    difficulty: 'Core',
    question: 'What is an Abstract Class vs an Interface?',
    answer:
      'An Abstract Class can contain both abstract methods (without body) and concrete methods (with body), along with member variables and constructors. A class can inherit from only one abstract class in single-inheritance languages.\n\nAn Interface defines a pure contract containing only method declarations (and default/static methods in modern Java/C#). A class can implement multiple interfaces, providing a way to support polymorphic contracts across unrelated classes.',
    keyPoints: [
      'Abstract Class: Can have state (instance variables) and concrete methods.',
      'Interface: Pure contract; supports multiple implementation.',
      'Use Abstract Class for code reuse in closely related hierarchies; Interface for behavioral contracts.'
    ]
  },
  {
    id: 'oops-7',
    category: 'OOPs',
    difficulty: 'Core',
    question: 'What is Object Slicing in C++ and how do you prevent it?',
    answer:
      'Object Slicing occurs when a derived class object is assigned or passed by value to a base class object (`Base b = d;`). The compiler slices off the derived portion, retaining only the base class members. Virtual function dispatch is lost.\n\nPrevention: Always pass objects by reference (`const Base&`) or by pointer (`Base*`), preserving the full derived instance and dynamic runtime polymorphism.',
    keyPoints: [
      'Slicing happens when passing derived objects by value to base objects.',
      'Derived member variables and virtual behavior are stripped.',
      'Fix: Pass by reference (`Base&`) or pointer (`Base*`).'
    ]
  },
  {
    id: 'oops-8',
    category: 'OOPs',
    difficulty: 'Core',
    question: 'What is the order of Constructor and Destructor execution in Inheritance?',
    answer:
      'Constructors are executed in Top-Down order (from Base class to Derived class) because the child class depends on the initialized state of the parent.\n\nDestructors are executed in exact Reverse / Bottom-Up order (from Derived class to Base class) to safely tear down child resources before the base class collapses. Always declare base class destructors as `virtual` to prevent memory leaks when deleting via base pointers.',
    keyPoints: [
      'Constructor: Base -> Derived (Top to Bottom).',
      'Destructor: Derived -> Base (Bottom to Top).',
      'Base destructors MUST be declared `virtual`.'
    ]
  },
  {
    id: 'oops-9',
    category: 'OOPs',
    difficulty: 'High Yield',
    question: 'What is the purpose of Static variables and Static methods in a Class?',
    answer:
      'A static variable belongs to the class itself rather than to individual instances. Only a single copy exists in memory, shared across all instantiated objects (e.g., an object counter).\n\nA static method can be invoked directly on the class without creating an instance (e.g., `Math.sqrt()` or `ClassName::getCount()`). Static methods can ONLY access static member variables and cannot use the `this` pointer.',
    keyPoints: [
      'Static variable: Single shared copy for the whole class.',
      'Static method: Can be called without instantiating an object.',
      'Static methods cannot access non-static members or `this`.'
    ]
  },
  {
    id: 'oops-10',
    category: 'OOPs',
    difficulty: 'High Yield',
    question: 'What are the SOLID design principles in software engineering?',
    answer:
      '• S - Single Responsibility: A class should have one, and only one, reason to change.\n• O - Open/Closed: Open for extension, closed for modification.\n• L - Liskov Substitution: Subclasses must be substitutable for their base classes without breaking behavior.\n• I - Interface Segregation: Clients should not be forced to depend on methods they do not use.\n• D - Dependency Inversion: Depend on abstractions, not concretions.',
    keyPoints: [
      'Single Responsibility, Open/Closed, Liskov Substitution.',
      'Interface Segregation, Dependency Inversion.',
      'Core foundation for writing clean, scalable, decoupled code.'
    ]
  },

  // --------------------------------------------------------------------------
  // 2. DATABASE MANAGEMENT SYSTEMS (DBMS & SQL) - 10 CARDS
  // --------------------------------------------------------------------------
  {
    id: 'dbms-1',
    category: 'DBMS',
    difficulty: 'High Yield',
    question: 'Explain ACID properties with a Bank Money Transfer example.',
    answer:
      'Consider transferring ₹5,000 from Account A to Account B:\n• Atomicity: Either both operations (debit A and credit B) succeed, or if a crash occurs midway, the entire transaction rolls back.\n• Consistency: Total money before and after the transfer remains unchanged; account balance never drops below zero.\n• Isolation: Concurrent transactions cannot see intermediate deducted balances until committed.\n• Durability: Once the transaction commits, the ₹5,000 transfer is permanently recorded on non-volatile disk even during power outage.',
    keyPoints: [
      'Atomicity: All or nothing.',
      'Consistency: Data adheres to all rules/constraints.',
      'Isolation: Concurrent execution without dirty reads.',
      'Durability: Committed data survives hardware crashes.'
    ]
  },
  {
    id: 'dbms-2',
    category: 'DBMS',
    difficulty: 'Core',
    question: 'Primary Key vs Unique Key vs Super Key: What are the differences?',
    answer:
      '• Super Key: Any set of attributes that uniquely identifies a row in a table (can include redundant columns).\n• Candidate Key: A minimal Super Key with zero redundant attributes.\n• Primary Key: The single chosen Candidate Key that uniquely identifies rows; NEVER allows NULL values (only one PK per table).\n• Unique Key: A column constraint ensuring all values are distinct; ALLOWS one NULL value (or multiple depending on SQL dialect), and a table can have multiple unique keys.',
    keyPoints: [
      'Super Key: Any column combination that guarantees uniqueness.',
      'Primary Key: One per table, strictly NOT NULL.',
      'Unique Key: Multiple allowed per table, allows NULL.'
    ]
  },
  {
    id: 'dbms-3',
    category: 'DBMS',
    difficulty: 'High Yield',
    question: 'What is the difference between Clustered and Non-Clustered Indexes?',
    answer:
      'A Clustered Index physically reorders the actual rows on disk to match the index structure (like a phone directory alphabetized by name). Because data can only be physically arranged in one order, there can be only ONE clustered index per table (usually the Primary Key).\n\nA Non-Clustered Index is stored in a separate location and contains pointers (row addresses) to the actual data pages (like the index at the back of a textbook). A table can have multiple non-clustered indexes.',
    keyPoints: [
      'Clustered: Determines physical storage order; only 1 per table.',
      'Non-Clustered: Separate lookup structure pointing to data rows; multiple per table.',
      'Clustered index provides faster range queries (`BETWEEN`).'
    ]
  },
  {
    id: 'dbms-4',
    category: 'DBMS',
    difficulty: 'High Yield',
    question: 'Summarize Database Normalization: 1NF, 2NF, 3NF, and BCNF.',
    answer:
      '• 1NF: Eliminate repeating groups; every attribute must contain only atomic (indivisible) values, and each record must be unique.\n• 2NF: Must be in 1NF + remove partial dependencies (every non-prime attribute must depend on the whole candidate key, not just part of it).\n• 3NF: Must be in 2NF + remove transitive dependencies (non-prime attributes must depend solely on candidate keys, not on other non-prime attributes: X -> Y -> Z).\n• BCNF (Boyce-Codd): A stricter 3NF where for every functional dependency X -> Y, X must be a super key.',
    keyPoints: [
      '1NF: Atomic values only, no repeated groups.',
      '2NF: No partial dependency on composite keys.',
      '3NF: No transitive dependency (A -> B -> C).',
      'BCNF: Determinant X in X -> Y must strictly be a Super Key.'
    ]
  },
  {
    id: 'dbms-5',
    category: 'DBMS',
    difficulty: 'Core',
    question: 'What is the difference between DELETE, TRUNCATE, and DROP?',
    answer:
      '• DELETE (DML): Deletes specific or all rows one-by-one based on a `WHERE` clause. It can be rolled back inside a transaction and fires database triggers. Slower for big tables.\n• TRUNCATE (DDL): Quickly deallocates all data pages in a table. It cannot use a `WHERE` clause, resets identity/auto-increment counters, and does not fire row triggers.\n• DROP (DDL): Completely destroys both table data AND the table schema from the database dictionary. Table ceases to exist.',
    keyPoints: [
      'DELETE: DML, row-by-row, supports `WHERE`, fires triggers, rollable.',
      'TRUNCATE: DDL, deallocates pages, resets auto-increment, fast.',
      'DROP: DDL, removes both data and table structure entirely.'
    ]
  },
  {
    id: 'dbms-6',
    category: 'DBMS',
    difficulty: 'Core',
    question: 'Explain SQL Joins: INNER, LEFT, RIGHT, and FULL OUTER.',
    answer:
      '• INNER JOIN: Returns only records where matching join keys exist in BOTH tables.\n• LEFT JOIN: Returns ALL records from the left table, plus matched values from the right table (unmatched right columns fill with NULL).\n• RIGHT JOIN: Returns ALL records from the right table, plus matched values from the left table.\n• FULL OUTER JOIN: Returns all records when there is a match in either left or right table, filling missing sides with NULL.',
    keyPoints: [
      'INNER: Intersection of matching keys only.',
      'LEFT: All left rows + matching right rows.',
      'FULL: Union of both tables with NULLs for unmatched keys.'
    ]
  },
  {
    id: 'dbms-7',
    category: 'DBMS',
    difficulty: 'High Yield',
    question: 'What is the difference between a View and a Materialized View?',
    answer:
      'A View is a virtual table defined by a SQL query. It stores NO physical data on disk; whenever queried, the underlying SELECT statement runs dynamically.\n\nA Materialized View physically saves and persists the query result set on disk. It provides ultra-fast read performance on expensive aggregations/joins, but requires periodic refresh triggers to synchronize when base tables update.',
    keyPoints: [
      'View: Virtual table, zero disk storage, executed on each query.',
      'Materialized View: Physically cached query result on disk.',
      'Use Materialized Views for heavy reporting/analytics queries.'
    ]
  },
  {
    id: 'dbms-8',
    category: 'DBMS',
    difficulty: 'Core',
    question: 'What is a Foreign Key and what are ON DELETE CASCADE options?',
    answer:
      'A Foreign Key enforces referential integrity by linking a column in a child table to the Primary Key of a parent table. It prevents invalid parent-child references.\n\n`ON DELETE CASCADE` specifies that if a parent record is deleted, all associated child rows are automatically deleted by the database engine. Alternatives include `ON DELETE SET NULL` (sets foreign key to NULL) and `ON DELETE RESTRICT` (rejects parent deletion if child exists).',
    keyPoints: [
      'Enforces referential integrity between tables.',
      'CASCADE: Child records are automatically removed with parent.',
      'SET NULL / RESTRICT: Alternative safety policies.'
    ]
  },
  {
    id: 'dbms-9',
    category: 'DBMS',
    difficulty: 'High Yield',
    question: 'Explain Transaction Isolation Levels and Read Phenomena.',
    answer:
      'Isolation levels control visibility of concurrent changes:\n1. Read Uncommitted: Allows Dirty Reads (reading uncommitted data that might rollback).\n2. Read Committed: Prevents Dirty Reads; allows Non-Repeatable Reads (row modified by another transaction midway).\n3. Repeatable Read: Prevents Non-Repeatable Reads; allows Phantom Reads (new rows inserted matching range).\n4. Serializable: Highest level; transactions execute as if sequentially, eliminating all anomalies at the cost of concurrency speed.',
    keyPoints: [
      'Dirty Read: Reading uncommitted changes.',
      'Non-Repeatable Read: Same query gets different data values.',
      'Phantom Read: Same range query gets different row count.',
      'Serializable provides complete safety via strict locking.'
    ]
  },
  {
    id: 'dbms-10',
    category: 'DBMS',
    difficulty: 'Core',
    question: 'What is the difference between a Stored Procedure and a Trigger?',
    answer:
      'A Stored Procedure is a pre-compiled collection of SQL statements that must be explicitly called by an application or user (`EXEC procedure_name`). It accepts input/output parameters and can commit or rollback transactions.\n\nA Trigger is an event-driven block of code executed automatically by the database engine in response to specific events (BEFORE/AFTER INSERT, UPDATE, or DELETE on a table). Triggers cannot be called manually and cannot take arguments.',
    keyPoints: [
      'Stored Procedure: Explicitly invoked; accepts parameters.',
      'Trigger: Automatically fired on DML events (INSERT/UPDATE/DELETE).',
      'Use triggers for audit logs and automated constraint enforcement.'
    ]
  },

  // --------------------------------------------------------------------------
  // 3. OPERATING SYSTEMS (OS) - 10 CARDS
  // --------------------------------------------------------------------------
  {
    id: 'os-1',
    category: 'OS',
    difficulty: 'High Yield',
    question: 'What is the difference between a Process and a Thread?',
    answer:
      'A Process is an executing program instance with its own private, isolated address space (code, data, heap, and open file descriptors). Context switching between processes is heavy as it requires invalidating CPU caches and TLB entries.\n\nA Thread (Lightweight Process) is a unit of CPU execution inside a process. Threads of the same process share code, data, and heap, but each maintains its own private Stack, Program Counter (PC), and CPU registers. Thread context switching is significantly faster.',
    keyPoints: [
      'Process: Separate memory address space, heavy context switch.',
      'Thread: Shares process memory, private stack & PC, light context switch.',
      'One crashing thread can bring down the whole process.'
    ]
  },
  {
    id: 'os-2',
    category: 'OS',
    difficulty: 'High Yield',
    question: 'What are the 4 Coffman Conditions necessary for a Deadlock?',
    answer:
      'Deadlock can occur if and only if ALL four conditions hold simultaneously:\n1. Mutual Exclusion: At least one resource is held in a non-shareable mode.\n2. Hold and Wait: A process holds at least one resource while waiting to acquire additional resources held by others.\n3. No Preemption: Resources cannot be forcibly seized; only released voluntarily by the holding process.\n4. Circular Wait: A closed chain of processes exists where P0 waits for P1, P1 waits for P2... and Pn waits for P0.',
    keyPoints: [
      'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
      'Deadlock prevention works by invalidating any ONE of these four conditions.',
      'Circular wait is commonly prevented by imposing strict resource ordering.'
    ]
  },
  {
    id: 'os-3',
    category: 'OS',
    difficulty: 'High Yield',
    question: 'What is Paging, Segmentation, and what causes a Page Fault?',
    answer:
      '• Paging: A memory management scheme that divides logical memory into fixed-size blocks called Pages and physical memory into matching Frames, eliminating external fragmentation.\n• Segmentation: Divides memory into variable-sized logical segments reflecting user perspective (Code, Stack, Heap, Data).\n• Page Fault: An interrupt raised by the Memory Management Unit (MMU) when a program accesses a virtual page whose valid-invalid bit indicates it is not currently resident in physical RAM. The OS must fetch the page from swap disk.',
    keyPoints: [
      'Paging: Fixed-size blocks (Pages & Frames); avoids external fragmentation.',
      'Segmentation: Variable-sized logical modules.',
      'Page Fault: Trap triggered when referenced page is on disk, not RAM.'
    ]
  },
  {
    id: 'os-4',
    category: 'OS',
    difficulty: 'Core',
    question: 'Preemptive vs Non-Preemptive CPU Scheduling: Explain the difference.',
    answer:
      'In Non-Preemptive Scheduling (e.g., FCFS, Non-preemptive SJF), once a process receives CPU allocation, it keeps the CPU until it terminates or yields for I/O. A long CPU-bound process can starve all others.\n\nIn Preemptive Scheduling (e.g., Round Robin, SRTF), the OS can forcefully interrupt a running process based on timer interrupts (Time Quantum) or when a higher priority process enters the ready queue, ensuring fair response times for interactive systems.',
    keyPoints: [
      'Non-Preemptive: Process voluntarily relinquishes CPU; risk of convoy effect.',
      'Preemptive: OS preempts running process via timer interrupt or priority.',
      'Round Robin and Priority Preemptive are essential for interactive OS.'
    ]
  },
  {
    id: 'os-5',
    category: 'OS',
    difficulty: 'High Yield',
    question: 'What is the difference between a Mutex and a Semaphore?',
    answer:
      'A Mutex (Mutual Exclusion) is a locking mechanism with ownership. Only the single thread that acquired the lock can release it (binary: locked/unlocked).\n\nA Semaphore is a signaling mechanism using an integer counter:\n• Binary Semaphore: Value is 0 or 1, similar to a mutex but lacks ownership (any thread can signal it).\n• Counting Semaphore: Counter tracks available units of a shared resource (e.g., 5 available database connections). `wait()` decrements counter; `signal()` increments counter.',
    keyPoints: [
      'Mutex: Locking mechanism with strict thread ownership.',
      'Semaphore: Signaling mechanism with integer counter (no ownership).',
      'Use counting semaphores to manage pools of identical resources.'
    ]
  },
  {
    id: 'os-6',
    category: 'OS',
    difficulty: 'High Yield',
    question: 'What is Thrashing in Operating Systems and how is it prevented?',
    answer:
      'Thrashing occurs when the system spends more time swapping pages in and out of disk than executing actual instructions. It happens when active processes demand more total frames than physical RAM can supply, triggering continuous page faults and near-zero CPU utilization.\n\nPrevention: Implement the Working Set Model (track each process active working set and suspend processes if total working set exceeds RAM) or use Local Page Replacement algorithms.',
    keyPoints: [
      'High paging activity causing CPU utilization to collapse.',
      'Caused by over-allocation of processes relative to physical RAM.',
      'Prevented using the Working Set Model and Page Fault Frequency (PFF).'
    ]
  },
  {
    id: 'os-7',
    category: 'OS',
    difficulty: 'Core',
    question: 'What is the Critical Section Problem and what are its 3 requirements?',
    answer:
      'The Critical Section is a segment of code where shared resources (variables, files) are accessed, which can lead to race conditions if executed concurrently.\n\nA valid solution MUST satisfy 3 criteria:\n1. Mutual Exclusion: If process Pi is executing in its critical section, no other process can enter.\n2. Progress: If no process is in its critical section, only processes wanting to enter can participate in deciding who enters next.\n3. Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter after a process requested entry (prevents starvation).',
    keyPoints: [
      'Critical section: Shared memory access requiring synchronized entry.',
      '3 Requirements: Mutual Exclusion, Progress, Bounded Waiting.',
      'Peterson algorithm satisfies all 3 for 2-process synchronization.'
    ]
  },
  {
    id: 'os-8',
    category: 'OS',
    difficulty: 'Core',
    question: 'What is the Translation Lookaside Buffer (TLB) and how does it work?',
    answer:
      'The TLB is a high-speed hardware associative cache located inside the CPU MMU that stores recent Virtual Page Number to Physical Frame Number translations.\n\nWithout TLB, every memory access requires two physical memory lookups (one for the Page Table and one for actual data). On a TLB Hit, translation occurs in a single clock cycle. On a TLB Miss, the CPU must walk the in-RAM page table and update the TLB entry.',
    keyPoints: [
      'Hardware cache for fast virtual-to-physical address translation.',
      'TLB Hit: Instant single-cycle address translation.',
      'TLB Miss: Incurs memory lookup penalty to walk page table.'
    ]
  },
  {
    id: 'os-9',
    category: 'OS',
    difficulty: 'Core',
    question: 'What is Internal vs External Fragmentation in Memory Management?',
    answer:
      '• Internal Fragmentation: Occurs when memory is allocated in fixed-size blocks (e.g., 4KB pages). If a process requests 1KB, a full 4KB page is given; the remaining 3KB within the allocated block is wasted and inaccessible to other processes.\n• External Fragmentation: Occurs in dynamic contiguous memory allocation. Over time, enough total free memory exists to satisfy a request, but it is split into non-contiguous scattered holes, leaving no single contiguous block large enough.',
    keyPoints: [
      'Internal: Unused memory INSIDE an assigned fixed block (e.g., paging).',
      'External: Free memory scattered in non-contiguous fragments outside blocks.',
      'Paging eliminates external fragmentation; compaction resolves dynamic fragmentation.'
    ]
  },
  {
    id: 'os-10',
    category: 'OS',
    difficulty: 'Core',
    question: 'Monolithic Kernel vs Microkernel Architecture: How do they compare?',
    answer:
      '• Monolithic Kernel (e.g., Linux, Windows NT core): All OS services (File System, IPC, Memory Management, Device Drivers, Network Stack) run together in privileged Kernel Space. Offers maximum speed and throughput, but a bug in a single device driver can crash the entire OS.\n• Microkernel (e.g., Minix, QNX, seL4): Only the bare minimum (IPC, basic scheduling, low-level memory) stays in kernel space. File systems and drivers run as user-space daemons. High crash resilience and modularity, but slower due to frequent IPC context switches.',
    keyPoints: [
      'Monolithic: All services in kernel space; maximum speed; single point of crash.',
      'Microkernel: Minimal kernel space; drivers in user space; high stability.',
      'Modern OS often use Hybrid approaches.'
    ]
  },

  // --------------------------------------------------------------------------
  // 4. COMPUTER NETWORKS (CN) - 10 CARDS
  // --------------------------------------------------------------------------
  {
    id: 'cn-1',
    category: 'Computer Networks',
    difficulty: 'High Yield',
    question: 'Explain the 7 Layers of the OSI Model and their key protocols.',
    answer:
      '1. Physical: Raw bit transmission over physical media (Cables, Hubs, DSL, RJ45).\n2. Data Link: Node-to-node framing, MAC addressing, error detection (Ethernet, Wi-Fi, Switches, ARP).\n3. Network: Logical routing, packet IP addressing (IP, ICMP, OSPF, Routers).\n4. Transport: End-to-end reliability, segment delivery, port numbers (TCP, UDP).\n5. Session: Managing dialogues and sessions between applications (NetBIOS, RPC).\n6. Presentation: Data syntax, encryption, compression (SSL/TLS, JSON, JPEG).\n7. Application: User-facing network interfaces (HTTP, HTTPS, DNS, SMTP, FTP).',
    keyPoints: [
      'Mnemonic: Please Do Not Throw Sausage Pizza Away.',
      'Transport = Segments (TCP/UDP); Network = Packets (IP); Data Link = Frames (MAC).',
      'Routers operate at Layer 3; Switches at Layer 2.'
    ]
  },
  {
    id: 'cn-2',
    category: 'Computer Networks',
    difficulty: 'High Yield',
    question: 'Explain the TCP 3-Way Handshake and 4-Way Connection Termination.',
    answer:
      'Handshake (Connection Establishment):\n1. Client -> Server: Sends `SYN` (Synchronize) with an initial sequence number `seq = x`.\n2. Server -> Client: Replies with `SYN-ACK` (`seq = y, ack = x + 1`).\n3. Client -> Server: Confirms with `ACK` (`ack = y + 1`). Connection is now ESTABLISHED.\n\nTermination (Connection Teardown):\n1. Client -> Server: `FIN` (Finished sending data).\n2. Server -> Client: `ACK` (Acknowledged).\n3. Server -> Client: `FIN` (Server ready to close).\n4. Client -> Server: `ACK` (Client waits 2*MSL TIME_WAIT to guarantee final ACK arrives).',
    keyPoints: [
      'Handshake: SYN -> SYN-ACK -> ACK.',
      'Termination: FIN -> ACK -> FIN -> ACK.',
      'TIME_WAIT prevents delayed duplicate packets from corrupting new connections.'
    ]
  },
  {
    id: 'cn-3',
    category: 'Computer Networks',
    difficulty: 'High Yield',
    question: 'What are the core differences between TCP and UDP?',
    answer:
      '• TCP (Transmission Control Protocol): Connection-oriented, guaranteed delivery with retransmissions, ordered packet sequencing, error checking, flow control (sliding window), and congestion control. Slower overhead. Used in Web (HTTP/HTTPS), Email (SMTP), and File Transfers (FTP).\n• UDP (User Datagram Protocol): Connectionless, unreliable (fire-and-forget, no acknowledgments or retransmissions), unordered, minimal header overhead (8 bytes vs 20+ bytes). Used in real-time gaming, live video streaming, DNS lookups, and VoIP.',
    keyPoints: [
      'TCP: Reliable, ordered, heavy overhead, connection-oriented.',
      'UDP: Fast, unordered, zero retransmissions, 8-byte lightweight header.',
      'Real-time apps prefer UDP to avoid head-of-line blocking.'
    ]
  },
  {
    id: 'cn-4',
    category: 'Computer Networks',
    difficulty: 'High Yield',
    question: 'What happens under the hood when you type a URL into a browser?',
    answer:
      '1. DNS Resolution: Browser checks local cache -> OS cache -> Router cache -> Recursive DNS resolver to resolve domain to an IP address.\n2. TCP Handshake: Browser initiates a 3-way TCP handshake (SYN, SYN-ACK, ACK) on port 443 (HTTPS).\n3. TLS Handshake: Client and server exchange certificates, verify cipher suites, and establish symmetric session keys.\n4. HTTP Request: Browser sends `GET /` HTTP request with headers.\n5. Server Processing & Response: Server processes request and responds with status code (200 OK) and HTML payload.\n6. DOM Rendering: Browser parses HTML, constructs DOM tree, executes JS, and fetches CSS/assets.',
    keyPoints: [
      'DNS lookup -> TCP 3-Way handshake -> TLS encryption negotiation.',
      'HTTP GET request -> Server response -> Browser DOM & CSSOM render.',
      'Crucial end-to-end full-stack interview question.'
    ]
  },
  {
    id: 'cn-5',
    category: 'Computer Networks',
    difficulty: 'Core',
    question: 'IPv4 vs IPv6 and Public vs Private IP Addresses: Explain.',
    answer:
      '• IPv4: 32-bit address represented in dotted decimal (e.g., `192.168.1.1`), providing ~4.3 billion addresses (exhausted).\n• IPv6: 128-bit address represented in hexadecimal separated by colons (e.g., `2001:0db8::8a2e`), providing 3.4 x 10^38 unique addresses.\n• Public IP: Globally unique, routable across the internet, assigned by ISP.\n• Private IP: Reserved for local LAN use (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), translated to public IP via Network Address Translation (NAT).',
    keyPoints: [
      'IPv4: 32-bit (4 octets); IPv6: 128-bit (hexadecimal).',
      'Public IP: Globally routable; Private IP: Internal LAN only.',
      'NAT maps multiple private internal IPs to a single public IP.'
    ]
  },
  {
    id: 'cn-6',
    category: 'Computer Networks',
    difficulty: 'High Yield',
    question: 'HTTP vs HTTPS: How does the SSL/TLS Handshake work?',
    answer:
      'HTTP sends plaintext over port 80, vulnerable to man-in-the-middle packet sniffing. HTTPS encrypts traffic over port 443 using SSL/TLS.\n\nTLS Handshake Summary:\n1. Client Hello: Client sends supported cipher suites and a client random number.\n2. Server Hello: Server selects cipher suite, sends digital certificate with public key, and server random.\n3. Certificate Validation: Client verifies certificate against trusted Certificate Authorities (CAs).\n4. Key Exchange: Client creates Pre-Master Secret encrypted with server public key.\n5. Symmetric Encryption: Both derive identical symmetric session keys (AES) for fast bulk data encryption.',
    keyPoints: [
      'HTTP is plaintext (port 80); HTTPS is encrypted via TLS (port 443).',
      'Asymmetric encryption is used solely to securely negotiate a Symmetric session key.',
      'Symmetric encryption (AES) performs actual payload encryption.'
    ]
  },
  {
    id: 'cn-7',
    category: 'Computer Networks',
    difficulty: 'Core',
    question: 'What is Flow Control vs Congestion Control in TCP?',
    answer:
      '• Flow Control: Ensures that a fast sender does not overwhelm a slow receiver. Managed via the Receive Window (`rwnd`) field advertised in TCP headers, indicating how many bytes of buffer space the receiver has left.\n• Congestion Control: Ensures that senders do not overwhelm the intermediate network routers. Managed via the Congestion Window (`cwnd`) calculated at the sender using algorithms like Slow Start, Congestion Avoidance, and Fast Recovery.',
    keyPoints: [
      'Flow Control: End-to-end receiver protection (Receive Window `rwnd`).',
      'Congestion Control: Network intermediate router protection (`cwnd`).',
      'Effective window = min(`rwnd`, `cwnd`).'
    ]
  },
  {
    id: 'cn-8',
    category: 'Computer Networks',
    difficulty: 'Core',
    question: 'How does DNS Resolution work (Recursive vs Iterative queries)?',
    answer:
      'DNS maps human-readable domains (google.com) to IP addresses.\n• Recursive Query: The client requests the Local DNS Resolver to find the IP. The resolver assumes full responsibility, querying servers on behalf of the client until it returns the final answer or an error.\n• Iterative Query: The querying server asks other DNS servers (Root -> TLD -> Authoritative). Each server returns either the IP or a referral address to the next authoritative server down the chain.',
    keyPoints: [
      'Recursive: "Give me the answer directly" (delegated lookup).',
      'Iterative: "I don\'t know, but ask this server next" (step-by-step referrals).',
      'Hierarchy: Root (.) -> TLD (.com) -> Authoritative Nameserver.'
    ]
  },
  {
    id: 'cn-9',
    category: 'Computer Networks',
    difficulty: 'Core',
    question: 'What is the difference between a MAC Address and an IP Address?',
    answer:
      '• MAC Address (Physical / Hardware Address): 48-bit hex address (e.g., `00:1A:2B:3C:4D:5E`) burned permanently into the Network Interface Card (NIC). Works at Data Link Layer (Layer 2) for local hop-to-hop communication within the same LAN segment.\n• IP Address (Logical Address): 32-bit (IPv4) or 128-bit (IPv6) address assigned dynamically by network routers. Works at Network Layer (Layer 3) to route packets across disparate global networks.\n• Address Resolution Protocol (ARP) translates an IP address into its corresponding local MAC address.',
    keyPoints: [
      'MAC: Layer 2 physical address, LAN delivery only.',
      'IP: Layer 3 logical address, global internet routing.',
      'ARP bridges IP address to physical MAC address.'
    ]
  },
  {
    id: 'cn-10',
    category: 'Computer Networks',
    difficulty: 'Core',
    question: 'What is Subnetting and how does CIDR Notation work?',
    answer:
      'Subnetting is the practice of dividing a large physical network into smaller, logical sub-networks to reduce broadcast traffic, optimize IP allocation, and enhance security.\n\nCIDR (Classless Inter-Domain Routing) notation replaces rigid Class A/B/C systems by appending a `/n` suffix indicating the number of fixed network bits (e.g., `192.168.1.0/24`). Here, the first 24 bits are network ID, leaving 32 - 24 = 8 bits for host IDs (2^8 - 2 = 254 usable host addresses).',
    keyPoints: [
      'Subnetting isolates broadcast domains and conserves IP addresses.',
      'CIDR `/n` indicates the number of mask bits dedicated to the Network prefix.',
      'Usable hosts = 2^(32 - n) - 2 (subtracting Network ID and Broadcast address).'
    ]
  },

  // --------------------------------------------------------------------------
  // 5. DATA STRUCTURES & ALGORITHMS (DSA) - 10 CARDS
  // --------------------------------------------------------------------------
  {
    id: 'dsa-1',
    category: 'DSA',
    difficulty: 'High Yield',
    question: 'Explain Big O Notation: O(1), O(log n), O(n), and O(n log n) with examples.',
    answer:
      '• O(1) Constant Time: Execution time does not grow with input size (e.g., Array index lookup `arr[i]`, Hash table lookup, Stack push/pop).\n• O(log n) Logarithmic Time: Input size is halved at each step (e.g., Binary Search on sorted array, Balanced BST lookup).\n• O(n) Linear Time: Execution time scales directly with input size (e.g., Linear search, counting array elements).\n• O(n log n) Linearithmic Time: Splitting into halves log n times and performing n operations per level (e.g., Merge Sort, Heap Sort, Quick Sort average case).',
    keyPoints: [
      'O(1): Instant access (Array indexing, Hash Map).',
      'O(log n): Divide-and-conquer search (Binary Search).',
      'O(n): Single pass scan.',
      'O(n log n): Optimal comparison-based sorting.'
    ]
  },
  {
    id: 'dsa-2',
    category: 'DSA',
    difficulty: 'High Yield',
    question: 'What are the trade-offs between an Array and a Linked List?',
    answer:
      '• Array: Stored contiguously in memory. Provides O(1) random index access and outstanding CPU cache locality. Disadvantages: Fixed size, expensive O(n) insertion/deletion due to element shifting.\n• Linked List: Non-contiguous nodes connected by pointers. Provides O(1) insertion/deletion at known nodes and dynamic resizing. Disadvantages: O(n) sequential access (no indexing), extra memory overhead for pointers, and poor CPU cache performance due to memory scattering.',
    keyPoints: [
      'Array: Contiguous, O(1) access, high cache locality, expensive shifts.',
      'Linked List: Non-contiguous, O(1) insert at head, pointer memory overhead.',
      'Modern CPU cache lines favor arrays for most general operations.'
    ]
  },
  {
    id: 'dsa-3',
    category: 'DSA',
    difficulty: 'Core',
    question: 'Stack vs Queue and their real Operating System applications.',
    answer:
      '• Stack (LIFO - Last In First Out): Elements inserted and removed from the same end (top). OS Applications: Function call stack frames, recursion management, expression evaluation, and Undo/Redo browser history.\n• Queue (FIFO - First In First Out): Elements inserted at rear and removed from front. OS Applications: CPU scheduling ready queues (Round Robin), printer spooling buffers, disk I/O request queues, and asynchronous event message brokers.',
    keyPoints: [
      'Stack = LIFO; Queue = FIFO.',
      'Stack OS application: Function call activation records and recursion.',
      'Queue OS application: CPU ready queue and asynchronous buffer streaming.'
    ]
  },
  {
    id: 'dsa-4',
    category: 'DSA',
    difficulty: 'Core',
    question: 'What is the difference between a Tree and a Graph?',
    answer:
      'A Tree is a restricted, connected, directed or undirected Graph that has NO cycles (acyclic) and exactly one designated Root node. A tree with N vertices strictly has N - 1 edges, and exactly one unique path exists between any two vertices.\n\nA Graph is a non-linear data structure consisting of vertices connected by edges that CAN contain cycles, self-loops, disconnected components, and has no concept of a root node.',
    keyPoints: [
      'Tree: Connected, acyclic graph with N nodes and N - 1 edges.',
      'Graph: Can contain cycles, disconnected components, and bidirectional loops.',
      'All Trees are Graphs, but not all Graphs are Trees.'
    ]
  },
  {
    id: 'dsa-5',
    category: 'DSA',
    difficulty: 'High Yield',
    question: 'What are Stable vs Unstable Sorting Algorithms?',
    answer:
      'A sorting algorithm is Stable if it preserves the relative order of elements that have identical keys. For example, if sorting employees by salary, two employees earning ₹50,000 will maintain their original input order.\n\n• Stable Algorithms: Merge Sort, Insertion Sort, Bubble Sort.\n• Unstable Algorithms: Quick Sort, Heap Sort, Selection Sort (due to long-range element swaps).',
    keyPoints: [
      'Stable: Preserves original input order of duplicate elements.',
      'Merge Sort and Insertion Sort are stable.',
      'Quick Sort and Heap Sort are inherently unstable.'
    ]
  },
  {
    id: 'dsa-6',
    category: 'DSA',
    difficulty: 'Core',
    question: 'Binary Search Tree (BST) vs Self-Balancing AVL Tree.',
    answer:
      'A Binary Search Tree maintains the property: left subtree values < node value < right subtree values. However, if elements are inserted in sorted order (1, 2, 3, 4), a standard BST degenerates into a skewed linked list with poor O(n) search time.\n\nAn AVL Tree is a self-balancing BST where the balance factor (height(left) - height(right)) for every node is strictly between -1, 0, and +1. On insertion or deletion that violates balance, it automatically executes tree rotations (LL, RR, LR, RL) to guarantee strictly O(log n) worst-case search time.',
    keyPoints: [
      'BST worst-case time degrades to O(n) on sorted input.',
      'AVL Tree self-balances using tree rotations.',
      'Guarantees strict O(log n) lookup, insertion, and deletion.'
    ]
  },
  {
    id: 'dsa-7',
    category: 'DSA',
    difficulty: 'High Yield',
    question: 'How do Hash Maps resolve Hash Collisions (Chaining vs Open Addressing)?',
    answer:
      'A hash function maps keys to array buckets. When two distinct keys hash to the identical bucket index, a collision occurs.\n\n1. Separate Chaining: Each bucket holds a linked list (or balanced red-black tree in Java 8+). Colliding elements are simply appended to the bucket chain.\n2. Open Addressing: All elements reside in the table array itself. When a collision occurs, the algorithm probes alternative slots:\n• Linear Probing: Checks index + 1, index + 2 (causes primary clustering).\n• Quadratic Probing: Checks index + 1^2, index + 2^2.\n• Double Hashing: Uses a secondary hash function to calculate step jump.',
    keyPoints: [
      'Chaining: Buckets store linked lists/trees; handles high load factors well.',
      'Open Addressing: Probes alternative array slots; no extra pointers.',
      'Average lookup is O(1); worst-case degraded to O(n) under heavy collisions.'
    ]
  },
  {
    id: 'dsa-8',
    category: 'DSA',
    difficulty: 'Core',
    question: 'Breadth-First Search (BFS) vs Depth-First Search (DFS): Explain.',
    answer:
      '• BFS (Breadth-First Search): Explores neighbors level-by-level before moving deeper. Uses a FIFO Queue. Finds the SHORTEST path on unweighted graphs. Memory complexity is O(V) at the widest level.\n• DFS (Depth-First Search): Plunges as deep as possible along a single branch before backtracking. Uses a LIFO Stack or recursion. Ideal for cycle detection, topological sorting, and solving mazes. Memory complexity is O(h) where h is max tree depth.',
    keyPoints: [
      'BFS: Level-order traversal using a Queue; guarantees shortest unweighted path.',
      'DFS: Branch-depth traversal using a Stack/Recursion; ideal for cycle detection.',
      'Time complexity for both on graphs is O(V + E).'
    ]
  },
  {
    id: 'dsa-9',
    category: 'DSA',
    difficulty: 'Core',
    question: 'What is a Heap and how is a Priority Queue implemented with it?',
    answer:
      'A Binary Heap is a complete binary tree stored compactly inside a standard array (no node pointers). For index `i`, left child is at `2i + 1` and right child at `2i + 2`.\n\n• Min-Heap: Parent node value <= child node values (minimum at root `arr[0]`).\n• Max-Heap: Parent node value >= child node values (maximum at root `arr[0]`).\n\nA Priority Queue utilizes a heap to deliver O(1) peek at highest priority, O(log n) insertion (`heapify-up`), and O(log n) extraction (`heapify-down`).',
    keyPoints: [
      'Complete binary tree efficiently represented in a flat array.',
      'Root is always min or max element (O(1) peek).',
      'Insert and extract-min operate in O(log n).'
    ]
  },
  {
    id: 'dsa-10',
    category: 'DSA',
    difficulty: 'High Yield',
    question: 'Dynamic Programming vs Divide and Conquer: What is the core difference?',
    answer:
      'Both techniques break down a complex problem into smaller subproblems.\n\n• Divide and Conquer: Solves INDEPENDENT, non-overlapping subproblems, recursively solving them and combining results (e.g., Merge Sort, Binary Search). No caching needed.\n• Dynamic Programming: Solves problems with OVERLAPPING subproblems and OPTIMAL substructure (e.g., Fibonacci, 0/1 Knapsack, Longest Common Subsequence). DP saves previously computed subproblem results in a memoization table (top-down) or tabulation array (bottom-up), avoiding redundant exponential recalculation.',
    keyPoints: [
      'Divide and Conquer: Independent subproblems (no caching required).',
      'Dynamic Programming: Overlapping subproblems; relies on memoization/tabulation.',
      'Transforms exponential O(2^n) algorithms into polynomial O(n) or O(n^2).'
    ]
  }
];

// ============================================================================
// MAN OF STUDY 25+ SELF-CONTAINED PRACTICAL CODE SNIPPETS
// Languages: Python (9), C (9), C++ (9) = 27 Templates
// Strict rule: 100% self-executable, zero interactive input loops, expected output in comments
// ============================================================================

export const CODE_SNIPPETS = [
  // --------------------------------------------------------------------------
  // A. PYTHON SNIPPETS (Clean, Practical & Self-Contained)
  // --------------------------------------------------------------------------
  {
    id: 'py-1',
    title: 'Simple Arithmetic Calculator Functions',
    language: 'Python',
    category: 'Fundamentals',
    description: 'Clean mathematical functions without interactive blocking loops.',
    code: `def add(a, b): return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b):
    return a / b if b != 0 else "Error: Division by zero"

# Self-contained test cases
n1, n2 = 24, 6
print(f"{n1} + {n2} = {add(n1, n2)}")
print(f"{n1} - {n2} = {subtract(n1, n2)}")
print(f"{n1} * {n2} = {multiply(n1, n2)}")
print(f"{n1} / {n2} = {divide(n1, n2)}")
print(f"{n1} / 0 = {divide(n1, 0)}")

# Expected Output:
# 24 + 6 = 30
# 24 - 6 = 18
# 24 * 6 = 144
# 24 / 6 = 4.0
# 24 / 0 = Error: Division by zero`
  },
  {
    id: 'py-2',
    title: 'Monthly Calendar Generator',
    language: 'Python',
    category: 'Built-in Modules',
    description: 'Generates a formatted monthly calendar using standard calendar module.',
    code: `import calendar

year = 2026
month = 9  # September

# Clean formatting using standard library
cal_text = calendar.month(year, month)
print(f"=== Calendar for {calendar.month_name[month]} {year} ===")
print(cal_text)

# Expected Output:
# === Calendar for September 2026 ===
#    September 2026
# Mo Tu We Th Fr Sa Su
#     1  2  3  4  5  6
#  7  8  9 10 11 12 13
# 14 15 16 17 18 19 20
# 21 22 23 24 25 26 27
# 28 29 30`
  },
  {
    id: 'py-3',
    title: 'Strong Random Password Generator',
    language: 'Python',
    category: 'Security & Utilities',
    description: 'Cryptographically secure password generator using secrets module.',
    code: `import secrets
import string

def generate_password(length=14):
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    # Ensure at least one of each category
    pwd = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*")
    ]
    pwd += [secrets.choice(chars) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(pwd)
    return "".join(pwd)

# Generate sample password
password = generate_password(14)
print(f"Secure Password Generated: {password}")
print(f"Length: {len(password)} characters | Entropy: Cryptographically Secure")

# Expected Output:
# Secure Password Generated: K9#mR7$vQ2xP!w
# Length: 14 characters | Entropy: Cryptographically Secure`
  },
  {
    id: 'py-4',
    title: 'Student Grade Card & SGPA Calculator',
    language: 'Python',
    category: 'Academic Utilities',
    description: 'Calculates weighted grade points and SGPA across engineering subjects.',
    code: `def get_grade_point(marks):
    if marks >= 90: return 10, "O"
    elif marks >= 80: return 9, "A+"
    elif marks >= 70: return 8, "A"
    elif marks >= 60: return 7, "B+"
    elif marks >= 50: return 6, "B"
    else: return 0, "F"

# Dictionary of Subject: (Marks, Credits)
results = {
    "Data Structures": (88, 4),
    "Operating Systems": (74, 3),
    "DBMS": (92, 3),
    "Computer Networks": (65, 3),
    "DSA Lab": (95, 2)
}

total_points = 0
total_credits = 0

print("Subject            | Marks | Grade | Points | Credits")
print("-" * 52)
for sub, (marks, cred) in results.items():
    gp, grade = get_grade_point(marks)
    total_points += gp * cred
    total_credits += cred
    print(f"{sub:<18} | {marks:<5} | {grade:<5} | {gp:<6} | {cred}")

sgpa = total_points / total_credits
print("-" * 52)
print(f"Total Credits: {total_credits} | Semester SGPA: {sgpa:.2f}")

# Expected Output:
# Subject            | Marks | Grade | Points | Credits
# ----------------------------------------------------
# Data Structures    | 88    | A+    | 9      | 4
# Operating Systems  | 74    | A     | 8      | 3
# DBMS               | 92    | O     | 10     | 3
# Computer Networks  | 65    | B+    | 7      | 3
# DSA Lab            | 95    | O     | 10     | 2
# ----------------------------------------------------
# Total Credits: 15 | Semester SGPA: 8.87`
  },
  {
    id: 'py-5',
    title: 'Palindrome & Anagram Checker',
    language: 'Python',
    category: 'String Algorithms',
    description: 'In-place slicing and character frequency mapping.',
    code: `def is_palindrome(text):
    clean = "".join(ch.lower() for ch in text if ch.isalnum())
    return clean == clean[::-1]

def is_anagram(str1, str2):
    c1 = "".join(sorted(str1.lower().replace(" ", "")))
    c2 = "".join(sorted(str2.lower().replace(" ", "")))
    return c1 == c2

# Self-contained validations
p1 = "A man a plan a canal Panama"
p2 = "MANOFSTUDY"
print(f"'{p1}' is palindrome: {is_palindrome(p1)}")
print(f"'{p2}' is palindrome: {is_palindrome(p2)}")

a1, a2 = "listen", "silent"
print(f"'{a1}' and '{a2}' are anagrams: {is_anagram(a1, a2)}")

# Expected Output:
# 'A man a plan a canal Panama' is palindrome: True
# 'MANOFSTUDY' is palindrome: False
# 'listen' and 'silent' are anagrams: True`
  },
  {
    id: 'py-6',
    title: 'Text Word Frequency Counter',
    language: 'Python',
    category: 'Data Processing',
    description: 'Counts word occurrences and ranks top keywords without external packages.',
    code: `sample_text = """
Data structures and algorithms form the core of placement interviews.
Algorithms require practice, and data structures require deep understanding.
"""

# Clean and tokenize words
words = [w.strip(".,\\n").lower() for w in sample_text.split() if w.strip()]
frequency = {}

for word in words:
    frequency[word] = frequency.get(word, 0) + 1

# Sort by frequency descending
sorted_words = sorted(frequency.items(), key=lambda item: item[1], reverse=True)

print(f"Total Words: {len(words)} | Unique Words: {len(frequency)}")
print("Top 4 Frequent Words:")
for word, count in sorted_words[:4]:
    print(f"• {word:<12}: {count} times")

# Expected Output:
# Total Words: 19 | Unique Words: 13
# Top 4 Frequent Words:
# • and         : 2 times
# • data        : 2 times
# • structures  : 2 times
# • algorithms  : 2 times`
  },
  {
    id: 'py-7',
    title: 'Matrix Transpose & Multiplication',
    language: 'Python',
    category: 'Linear Algebra',
    description: 'Clean matrix operations using list comprehensions.',
    code: `A = [[1, 2],
     [3, 4]]

B = [[5, 6],
     [7, 8]]

# Transpose of A
transpose_A = [[row[i] for row in A] for i in range(len(A[0]))]

# Matrix Multiplication A x B
result = [[sum(a * b for a, b in zip(A_row, B_col)) 
          for B_col in zip(*B)] for A_row in A]

print(f"Matrix A: {A}")
print(f"Transpose of A: {transpose_A}")
print(f"Multiplication (A x B): {result}")

# Expected Output:
# Matrix A: [[1, 2], [3, 4]]
# Transpose of A: [[1, 3], [2, 4]]
# Multiplication (A x B): [[19, 22], [43, 50]]`
  },
  {
    id: 'py-8',
    title: 'Binary Search on Sorted List',
    language: 'Python',
    category: 'Algorithms',
    description: 'Iterative binary search returning the index of target value in O(log n).',
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

numbers = [12, 24, 32, 45, 56, 67, 78, 89, 99]
target = 67
index = binary_search(numbers, target)

print(f"Array: {numbers}")
print(f"Target {target} found at index: {index}")
print(f"Target 100 found at index: {binary_search(numbers, 100)}")

# Expected Output:
# Array: [12, 24, 32, 45, 56, 67, 78, 89, 99]
# Target 67 found at index: 5
# Target 100 found at index: -1`
  },
  {
    id: 'py-9',
    title: 'Fibonacci Sequence Generator (Memoized)',
    language: 'Python',
    category: 'Dynamic Programming',
    description: 'Computes first N Fibonacci numbers in O(n) time using memoization.',
    code: `def fibonacci_series(n):
    if n <= 0: return []
    if n == 1: return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i - 1] + fib[i - 2])
    return fib

count = 10
series = fibonacci_series(count)
print(f"First {count} Fibonacci numbers: {series}")
print(f"10th Fibonacci number: {series[-1]}")

# Expected Output:
# First 10 Fibonacci numbers: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
# 10th Fibonacci number: 34`
  },

  // --------------------------------------------------------------------------
  // B. C LANGUAGE SNIPPETS (Self-Contained, Zero Infinite Loops)
  // --------------------------------------------------------------------------
  {
    id: 'c-1',
    title: 'Simple Arithmetic Calculator in C',
    language: 'C',
    category: 'Fundamentals',
    description: 'Clean modular functions with division-by-zero protection.',
    code: `#include <stdio.h>

float calculate(float a, float b, char op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return (b != 0) ? (a / b) : 0.0f;
        default: return 0.0f;
    }
}

int main() {
    float x = 20.0f, y = 4.0f;
    printf("%.1f + %.1f = %.2f\\n", x, y, calculate(x, y, '+'));
    printf("%.1f - %.1f = %.2f\\n", x, y, calculate(x, y, '-'));
    printf("%.1f * %.1f = %.2f\\n", x, y, calculate(x, y, '*'));
    printf("%.1f / %.1f = %.2f\\n", x, y, calculate(x, y, '/'));
    return 0;
}

/* Expected Output:
20.0 + 4.0 = 24.00
20.0 - 4.0 = 16.00
20.0 * 4.0 = 80.00
20.0 / 4.0 = 5.00
*/`
  },
  {
    id: 'c-2',
    title: 'Matrix Addition and Multiplication',
    language: 'C',
    category: 'Arrays & Math',
    description: '2x2 matrix operations with pre-initialized values.',
    code: `#include <stdio.h>

int main() {
    int A[2][2] = {{1, 2}, {3, 4}};
    int B[2][2] = {{5, 6}, {7, 8}};
    int Add[2][2], Mul[2][2] = {0};

    // Matrix Addition & Multiplication
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            Add[i][j] = A[i][j] + B[i][j];
            for (int k = 0; k < 2; k++) {
                Mul[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    printf("Addition A + B:\\n[%d %d]\\n[%d %d]\\n", Add[0][0], Add[0][1], Add[1][0], Add[1][1]);
    printf("Multiplication A x B:\\n[%d %d]\\n[%d %d]\\n", Mul[0][0], Mul[0][1], Mul[1][0], Mul[1][1]);
    return 0;
}

/* Expected Output:
Addition A + B:
[6 8]
[10 12]
Multiplication A x B:
[19 22]
[43 50]
*/`
  },
  {
    id: 'c-3',
    title: 'Reverse a String & Palindrome Check',
    language: 'C',
    category: 'Strings & Pointers',
    description: 'Two-pointer in-place string reversal with pointer manipulation.',
    code: `#include <stdio.h>
#include <string.h>

int is_palindrome(const char *str) {
    int left = 0, right = strlen(str) - 1;
    while (left < right) {
        if (str[left] != str[right]) return 0;
        left++; right--;
    }
    return 1;
}

int main() {
    char word[] = "radar";
    char rev[10];
    int len = strlen(word);
    
    for (int i = 0; i < len; i++) {
        rev[i] = word[len - 1 - i];
    }
    rev[len] = '\\0';

    printf("Original: %s\\n", word);
    printf("Reversed: %s\\n", rev);
    printf("Is Palindrome: %s\\n", is_palindrome(word) ? "YES" : "NO");
    return 0;
}

/* Expected Output:
Original: radar
Reversed: radar
Is Palindrome: YES
*/`
  },
  {
    id: 'c-4',
    title: 'Singly Linked List: Insertion & Display',
    language: 'C',
    category: 'Data Structures',
    description: 'Clean node struct, head insertion, display, and memory deallocation.',
    code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

void insert_head(struct Node** head, int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = *head;
    *head = newNode;
}

int main() {
    struct Node* head = NULL;
    insert_head(&head, 30);
    insert_head(&head, 20);
    insert_head(&head, 10);

    printf("Linked List: ");
    struct Node* temp = head;
    while (temp != NULL) {
        printf("%d -> ", temp->data);
        struct Node* toFree = temp;
        temp = temp->next;
        free(toFree); // Safe memory cleanup
    }
    printf("NULL\\n");
    return 0;
}

/* Expected Output:
Linked List: 10 -> 20 -> 30 -> NULL
*/`
  },
  {
    id: 'c-5',
    title: 'Dynamic Array Allocation with Malloc & Free',
    language: 'C',
    category: 'Memory Management',
    description: 'Allocates heap buffer, computes sum, and deallocates memory.',
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int*)malloc(n * sizeof(int));
    if (arr == NULL) return 1;

    int sum = 0;
    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
        sum += arr[i];
    }

    printf("Allocated array of size %d: ", n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\nSum = %d | Average = %.1f\\n", sum, (float)sum / n);

    free(arr); // Free allocated heap buffer
    arr = NULL;
    return 0;
}

/* Expected Output:
Allocated array of size 5: 10 20 30 40 50 
Sum = 150 | Average = 30.0
*/`
  },
  {
    id: 'c-6',
    title: 'Bubble Sort and Binary Search on Integers',
    language: 'C',
    category: 'Algorithms',
    description: 'Sorts array in ascending order and executes iterative binary search.',
    code: `#include <stdio.h>

void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int binary_search(int arr[], int n, int key) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == key) return m;
        if (arr[m] < key) l = m + 1;
        else r = m - 1;
    }
    return -1;
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubble_sort(arr, n);

    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\nTarget 25 found at index: %d\\n", binary_search(arr, n, 25));
    return 0;
}

/* Expected Output:
Sorted: 11 12 22 25 34 64 90 
Target 25 found at index: 3
*/`
  },
  {
    id: 'c-7',
    title: 'Swap Two Numbers Using Pointers (Call by Reference)',
    language: 'C',
    category: 'Pointers',
    description: 'Demonstrates memory address manipulation via dereference operator.',
    code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int num1 = 45, num2 = 90;
    printf("Before Swap: num1 = %d, num2 = %d\\n", num1, num2);
    swap(&num1, &num2);
    printf("After Swap:  num1 = %d, num2 = %d\\n", num1, num2);
    return 0;
}

/* Expected Output:
Before Swap: num1 = 45, num2 = 90
After Swap:  num1 = 90, num2 = 45
*/`
  },
  {
    id: 'c-8',
    title: 'Count Vowels, Consonants, and Digits in String',
    language: 'C',
    category: 'Strings',
    description: 'Iterates through string characters and categorizes types.',
    code: `#include <stdio.h>
#include <ctype.h>

int main() {
    char str[] = "MAN OF STUDY 2026!";
    int vowels = 0, consonants = 0, digits = 0, spaces = 0;

    for (int i = 0; str[i] != '\\0'; i++) {
        char ch = tolower(str[i]);
        if (ch >= 'a' && ch <= 'z') {
            if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u')
                vowels++;
            else
                consonants++;
        } else if (ch >= '0' && ch <= '9') {
            digits++;
        } else if (ch == ' ') {
            spaces++;
        }
    }

    printf("String: '%s'\\n", str);
    printf("Vowels: %d | Consonants: %d | Digits: %d | Spaces: %d\\n", 
           vowels, consonants, digits, spaces);
    return 0;
}

/* Expected Output:
String: 'MAN OF STUDY 2026!'
Vowels: 3 | Consonants: 7 | Digits: 4 | Spaces: 3
*/`
  },
  {
    id: 'c-9',
    title: 'Armstrong Number Checker',
    language: 'C',
    category: 'Math Algorithms',
    description: 'Checks if sum of digits raised to power equals original number.',
    code: `#include <stdio.h>
#include <math.h>

int is_armstrong(int n) {
    int temp = n, sum = 0, digits = 0;
    while (temp > 0) { digits++; temp /= 10; }
    temp = n;
    while (temp > 0) {
        int r = temp % 10;
        sum += (int)pow(r, digits);
        temp /= 10;
    }
    return (sum == n);
}

int main() {
    int test1 = 153, test2 = 371, test3 = 120;
    printf("%d is Armstrong: %s\\n", test1, is_armstrong(test1) ? "YES" : "NO");
    printf("%d is Armstrong: %s\\n", test2, is_armstrong(test2) ? "YES" : "NO");
    printf("%d is Armstrong: %s\\n", test3, is_armstrong(test3) ? "YES" : "NO");
    return 0;
}

/* Expected Output:
153 is Armstrong: YES
371 is Armstrong: YES
120 is Armstrong: NO
*/`
  },

  // --------------------------------------------------------------------------
  // C. C++ MODERN & OOP SNIPPETS
  // --------------------------------------------------------------------------
  {
    id: 'cpp-1',
    title: 'Class & Object Encapsulation (BankAccount)',
    language: 'C++',
    category: 'OOP Concepts',
    description: 'Private balance with validated deposit/withdraw public methods.',
    code: `#include <iostream>
#include <string>

class BankAccount {
private:
    std::string owner;
    double balance;

public:
    BankAccount(std::string name, double initial) : owner(name), balance(initial) {}

    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    bool withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }

    void display() const {
        std::cout << "Account: " << owner << " | Balance: ₹" << balance << "\\n";
    }
};

int main() {
    BankAccount acc("Rahul Varma", 15000.0);
    acc.display();
    acc.deposit(5000.0);
    acc.withdraw(3200.0);
    acc.display();
    return 0;
}

/* Expected Output:
Account: Rahul Varma | Balance: ₹15000
Account: Rahul Varma | Balance: ₹16800
*/`
  },
  {
    id: 'cpp-2',
    title: 'Function Overloading vs Overriding (Virtual Functions)',
    language: 'C++',
    category: 'Polymorphism',
    description: 'Static compile-time overloading alongside dynamic virtual overriding.',
    code: `#include <iostream>

// Overloading demo
class MathUtil {
public:
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
};

// Overriding demo
class BaseAnimal {
public:
    virtual void speak() { std::cout << "Animal makes a sound\\n"; }
};

class Dog : public BaseAnimal {
public:
    void speak() override { std::cout << "Dog barks: Woof!\\n"; }
};

int main() {
    MathUtil m;
    std::cout << "Overload int: " << m.add(5, 10) << "\\n";
    std::cout << "Overload double: " << m.add(2.5, 4.5) << "\\n";

    BaseAnimal* ptr = new Dog();
    ptr->speak(); // Calls Dog::speak at runtime
    delete ptr;
    return 0;
}

/* Expected Output:
Overload int: 15
Overload double: 7
Dog barks: Woof!
*/`
  },
  {
    id: 'cpp-3',
    title: 'Generic Stack Implementation Using C++ Templates',
    language: 'C++',
    category: 'Templates & Generic Code',
    description: 'Type-agnostic stack supporting both integers and strings.',
    code: `#include <iostream>
#include <vector>
#include <string>

template <typename T>
class SimpleStack {
private:
    std::vector<T> elements;
public:
    void push(T val) { elements.push_back(val); }
    void pop() { if (!elements.empty()) elements.pop_back(); }
    T top() const { return elements.back(); }
    bool isEmpty() const { return elements.empty(); }
};

int main() {
    SimpleStack<int> intStack;
    intStack.push(10);
    intStack.push(20);
    std::cout << "Top of intStack: " << intStack.top() << "\\n";

    SimpleStack<std::string> strStack;
    strStack.push("Study");
    strStack.push("Macha");
    std::cout << "Top of strStack: " << strStack.top() << "\\n";
    return 0;
}

/* Expected Output:
Top of intStack: 20
Top of strStack: Macha
*/`
  },
  {
    id: 'cpp-4',
    title: 'Vector Operations and STL Sorting',
    language: 'C++',
    category: 'Standard Template Library (STL)',
    description: 'Demonstrates std::vector, std::sort, lambda comparator, and iterators.',
    code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {45, 12, 89, 23, 67, 10};

    // Ascending sort
    std::sort(nums.begin(), nums.end());
    std::cout << "Sorted: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << "\\n";

    // Descending sort with lambda
    std::sort(nums.begin(), nums.end(), [](int a, int b) { return a > b; });
    std::cout << "Descending: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << "\\n";

    return 0;
}

/* Expected Output:
Sorted: 10 12 23 45 67 89 
Descending: 89 67 45 23 12 10 
*/`
  },
  {
    id: 'cpp-5',
    title: 'Queue Implementation Using STL std::queue',
    language: 'C++',
    category: 'STL Data Structures',
    description: 'First-In-First-Out FIFO queue operations push, pop, front.',
    code: `#include <iostream>
#include <queue>
#include <string>

int main() {
    std::queue<std::string> printQueue;

    printQueue.push("Document_1.pdf");
    printQueue.push("HallTicket.pdf");
    printQueue.push("Resume_ATS.pdf");

    std::cout << "Queue Size: " << printQueue.size() << "\\n";
    
    while (!printQueue.empty()) {
        std::cout << "Processing: " << printQueue.front() << "\\n";
        printQueue.pop();
    }
    
    std::cout << "Queue is now empty.\\n";
    return 0;
}

/* Expected Output:
Queue Size: 3
Processing: Document_1.pdf
Processing: HallTicket.pdf
Processing: Resume_ATS.pdf
Queue is now empty.
*/`
  },
  {
    id: 'cpp-6',
    title: 'Dijkstra Shortest Path Core Logic Snippet',
    language: 'C++',
    category: 'Graph Algorithms',
    description: 'Priority queue implementation of single-source shortest path algorithm.',
    code: `#include <iostream>
#include <vector>
#include <queue>

const int INF = 1e9;

void dijkstra(int start, const std::vector<std::vector<std::pair<int, int>>>& adj, int V) {
    std::vector<int> dist(V, INF);
    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    std::cout << "Shortest distances from node " << start << ":\\n";
    for (int i = 0; i < V; ++i)
        std::cout << "Node " << i << " : " << dist[i] << "\\n";
}

int main() {
    int V = 4;
    std::vector<std::vector<std::pair<int, int>>> adj(V);
    adj[0].push_back({1, 4});
    adj[0].push_back({2, 1});
    adj[2].push_back({1, 2});
    adj[1].push_back({3, 1});
    adj[2].push_back({3, 5});

    dijkstra(0, adj, V);
    return 0;
}

/* Expected Output:
Shortest distances from node 0:
Node 0 : 0
Node 1 : 3
Node 2 : 1
Node 3 : 4
*/`
  },
  {
    id: 'cpp-7',
    title: 'Tic-Tac-Toe Win Condition Checker',
    language: 'C++',
    category: 'Game Logic',
    description: 'Evaluates 3x3 board rows, columns, and diagonals for a winning player.',
    code: `#include <iostream>

char check_winner(char b[3][3]) {
    // Check rows & columns
    for (int i = 0; i < 3; i++) {
        if (b[i][0] != ' ' && b[i][0] == b[i][1] && b[i][1] == b[i][2]) return b[i][0];
        if (b[0][i] != ' ' && b[0][i] == b[1][i] && b[1][i] == b[2][i]) return b[0][i];
    }
    // Check diagonals
    if (b[0][0] != ' ' && b[0][0] == b[1][1] && b[1][1] == b[2][2]) return b[0][0];
    if (b[0][2] != ' ' && b[0][2] == b[1][1] && b[1][1] == b[2][0]) return b[0][2];
    return ' ';
}

int main() {
    char board[3][3] = {
        {'X', 'O', 'X'},
        {'O', 'X', ' '},
        {'O', ' ', 'X'}
    };

    char winner = check_winner(board);
    if (winner != ' ')
        std::cout << "Player " << winner << " wins!\\n";
    else
        std::cout << "Game is ongoing / Draw.\\n";
    return 0;
}

/* Expected Output:
Player X wins!
*/`
  },
  {
    id: 'cpp-8',
    title: 'Exception Handling with Try, Throw, and Catch',
    language: 'C++',
    category: 'Error Handling',
    description: 'Safe division handling with std::runtime_error and exception propagation.',
    code: `#include <iostream>
#include <stdexcept>

double safe_divide(double numerator, double denominator) {
    if (denominator == 0.0) {
        throw std::runtime_error("Math Error: Division by zero is undefined.");
    }
    return numerator / denominator;
}

int main() {
    try {
        std::cout << "100 / 5 = " << safe_divide(100.0, 5.0) << "\\n";
        std::cout << "50 / 0 = " << safe_divide(50.0, 0.0) << "\\n";
    } catch (const std::exception& e) {
        std::cout << "Caught Exception: " << e.what() << "\\n";
    }
    std::cout << "Program recovered and continues normally.\\n";
    return 0;
}

/* Expected Output:
100 / 5 = 20
Caught Exception: Math Error: Division by zero is undefined.
Program recovered and continues normally.
*/`
  },
  {
    id: 'cpp-9',
    title: 'Smart Pointers (std::unique_ptr Automatic Cleanup)',
    language: 'C++',
    category: 'Modern C++ (C++11/14/17)',
    description: 'Eliminates memory leaks by automatically deleting heap objects on scope exit.',
    code: `#include <iostream>
#include <memory>

class Resource {
public:
    Resource() { std::cout << "Resource Acquired\\n"; }
    ~Resource() { std::cout << "Resource Destroyed (Automatic Free)\\n"; }
    void use() { std::cout << "Resource is in active use\\n"; }
};

int main() {
    std::cout << "Entering inner scope...\\n";
    {
        std::unique_ptr<Resource> res = std::make_unique<Resource>();
        res->use();
    } // Out of scope -> destructor automatically called here
    std::cout << "Exited inner scope without manual delete.\\n";
    return 0;
}

/* Expected Output:
Entering inner scope...
Resource Acquired
Resource is in active use
Resource Destroyed (Automatic Free)
Exited inner scope without manual delete.
*/`
  }
];
