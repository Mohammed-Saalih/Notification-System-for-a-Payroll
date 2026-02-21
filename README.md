

## 1. Sprint Zero – Architectural Planning Foundation
Anna Pay is designed as a standalone payroll notification system, not a full payroll engine. The planning problem was clear: payroll-related jobs can fail silently, retries can become noisy, and different teams often receive unstructured or delayed alerts. The Sprint Zero objective was to build a deterministic, local system that captures payroll-adjacent events and routes them to the right stakeholders with clear state transitions.

The primary stakeholders are Employee, Admin, Finance, and System operations (background scheduler and resilience controls). Key risks identified during planning were alert flooding from unstable jobs, uncontrolled retry loops, and state inconsistency across cross-role workflows. Non-functional requirements were defined as traceability of events, reliability under simulated failures, and strict role isolation in notification visibility.

The architecture decision was to use a layered backend with a notification engine abstraction. This keeps HTTP transport, business logic, event creation, and persistence concerns separated, while allowing fault tolerance simulation to evolve without rewriting request handlers.

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

