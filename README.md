# Sprint Zero – Architectural Planning Foundation
During Sprint Zero, an IT professional was consulted to understand what is expected from a robust payroll notification system in a real-world enterprise environment. The discussion focused not on UI features, but on operational reliability, system integrity, compliance visibility, and controlled alerting mechanisms.

# Anna Pay – Payroll Notification & Monitoring System

Anna Pay is a role-based payroll monitoring and notification system designed to simulate real-world payroll workflows, system failures, and financial alerts.

This is not a full payroll engine, but a structured, event-driven notification layer built to demonstrate:

## Role-based access control (RBAC)

* Event-driven notification routing
* Background job simulation
* Failure handling with retry & escalation
* Circuit breaker simulation
* GL account monitoring
* Threshold alerts
* Income tax validation alerts
<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/47c28c33-05ce-4c58-a22f-91ae637cd505" />

# Role-Based System Design

## The system supports three login roles:

1) Admin

* Receives employee salary revision requests
* Modifies salary
* Receives payroll job failure alerts
* Monitors system instability<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/7698d718-f77b-4893-b201-16521bf8d244" />


2) Employee

* Views payroll breakdown
* Views payroll history (multiple cycles)
* Submits salary hike request
* Receives salary update notifications<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/74b583e9-e6c9-430b-bc9d-25b7ee7b07aa" />



3️) Finance

* Monitors GL accounts
* Transfers between GL accounts
* Receives GL threshold alerts
* Receives Income Tax validation alerts
* Receives system job failures<img width="800" height="600" alt="image" src="https://github.com/user-attachments/assets/8ee4016b-eeec-4a10-aa0d-5b438e4f1815" />

# System Architecture (Conceptual)

## The system follows a layered architecture:

*UI Layer (Role-specific dashboards)
*Controller Layer (REST endpoints)
*Service Layer (Business workflows)
*Notification Engine (Event creation & routing)
*Scheduler Simulation (Background jobs)
*In-Memory Data Store (Mock persistence)
*All components are modular and separated using clear concerns.
<img width="1929" height="1452" alt="Arch_Dia3 drawio" src="https://github.com/user-attachments/assets/aabfb4b1-5e78-4989-acac-c76dccd54512" />

# Core Notification Workflow

## Employee Salary Revision Workflow
The Employee Salary Revision workflow is an event-driven, role-based process. When an employee submits a salary revision request, the system persists the request as a structured entity in the in-memory data store and immediately generates a notification event targeted to the Admin role using role-based routing logic (RBAC). The Admin dashboard retrieves notifications via periodic polling. Upon salary modification, the system recalculates compensation components and creates a new payroll cycle instance, implementing payroll versioning. A subsequent notification is dispatched to the specific employee (scoped targeting), and acknowledgement state is tracked to ensure visibility control and audit traceability.
<img width="2080" height="78" alt="image" src="https://github.com/user-attachments/assets/b8a0c1af-97fc-471d-b7ea-59d8dd599541" />
<img width="2520" height="352" alt="image" src="https://github.com/user-attachments/assets/081141da-23b0-409d-9e71-ccfd6156b19b" />



## Background Job Failure Simulation
The system includes a scheduler-driven background job engine that simulates Attendance Integration, Payroll Execution, Tax Validation, GL Monitoring, and Bank Interface processes. Each job executes at fixed intervals and may generate randomized failure states to emulate operational instability. On failure, retry logic is triggered and failure counters increment. Escalation levels increase progressively based on retry thresholds. If failures exceed configured limits, a circuit breaker mechanism transitions the job into an open state to prevent cascading faults. Alert throttling controls duplicate notification bursts within defined time windows. This models resilience patterns including retry policy, escalation hierarchy, circuit breaker pattern, and fault tolerance simulation.
<img width="2478" height="1070" alt="image" src="https://github.com/user-attachments/assets/b5755751-3ff6-47d2-92c1-b372915a9654" />


## GL Monitoring & Finance Workflow
The Finance module implements real-time General Ledger (GL) monitoring with threshold-based alerting. GL accounts such as Operations Payroll GL, Tax Withholding GL, and Cash Reserve GL maintain balance and threshold metadata. The system continuously evaluates threshold conditions and generates notifications when balances approach risk boundaries. Finance users can initiate inter-GL transfers, which are recorded in a structured ledger with transaction reference identifiers for traceability. Transfer completion events generate confirmation notifications. This workflow demonstrates financial ledger modeling, threshold-triggered event generation, and transaction auditing within a simulated financial control environment.

The Income Tax Validation process operates as a scheduled compliance-check job within the background engine. Validation failures trigger escalation logic, retry mechanisms, and structured notification events targeted to Finance stakeholders. The system tracks circuit state transitions to prevent repetitive instability and ensures progressive severity classification. This module simulates compliance monitoring, exception handling, and regulatory alerting within a payroll-adjacent operational framework.

## GL Transfer & Ledger History
<img width="2519" height="1061" alt="image" src="https://github.com/user-attachments/assets/f0ec3c86-cadf-494a-abeb-c14bd570668e" />
<img width="2559" height="736" alt="image" src="https://github.com/user-attachments/assets/5cc47506-c474-4e8f-b48a-659f713ebe3d" />

## Finance Notifications (Threshold + Tax Alerts)
<img width="2544" height="1368" alt="image" src="https://github.com/user-attachments/assets/d593d9e4-325c-4fbb-b05c-cc81e837fd14" />

# TechStack used
* Node.js 
* Express.js 
* REST Architecture
* HTML5
* CSS3
## "NOTE : INSTALL NECESSARY DEPENDENCIES" 

# Team Memebers
* A Mohammed Saalih
* R Deepak
* M Nethaji
* S Santhakumar







