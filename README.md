# Anna Pay – Payroll Notification System

## 1. Sprint Zero – Architectural Planning Foundation
Anna Pay is designed as a standalone payroll notification system, not a full payroll engine. The planning problem was clear: payroll-related jobs can fail silently, retries can become noisy, and different teams often receive unstructured or delayed alerts. The Sprint Zero objective was to build a deterministic, local system that captures payroll-adjacent events and routes them to the right stakeholders with clear state transitions.

The primary stakeholders are Employee, Admin, Finance, and System operations (background scheduler and resilience controls). Key risks identified during planning were alert flooding from unstable jobs, uncontrolled retry loops, and state inconsistency across cross-role workflows. Non-functional requirements were defined as traceability of events, reliability under simulated failures, and strict role isolation in notification visibility.

The architecture decision was to use a layered backend with a notification engine abstraction. This keeps HTTP transport, business logic, event creation, and persistence concerns separated, while allowing fault tolerance simulation to evolve without rewriting request handlers.

## 2. Business Context
Delayed or silent payroll failures directly affect HR and Finance operations. HR cannot respond to employee compensation concerns if payroll anomalies are not visible. Finance cannot protect liquidity and compliance if GL thresholds and tax validation issues are hidden or fragmented across tools. A notification-centric system improves transparency by making event states explicit, improves accountability through role-targeted routing, and supports audit readiness through structured metadata and acknowledgement state.


## 3. System Architecture (Narrative Description)
The UI layer contains role-specific screens for Employee, Admin, and Finance, plus a shared notifications page. Each UI sends REST requests to the Express backend and polls notifications on a fixed interval. Requests first pass through authentication middleware that resolves user identity from `x-user-id`, then through role-based authorization checks.

Controllers orchestrate request-response behavior and delegate business rules to the service layer. Services perform workflow execution such as salary revision submission, salary modification, ledger transfer, and job outcome handling. The notification engine is used by both user-driven services and background jobs to generate structured events and apply role-based routing rules.

A scheduler simulation runs background jobs with `setInterval`. Job outcomes feed fault tolerance simulation (retry policy, escalation hierarchy, circuit breaker simulation, throttling), and generated alerts are persisted in an in-memory data store. The data layer stores users, payroll, notifications, requests, job state, GL accounts, and ledger entries. Data flows top-down from UI to services and bottom-up from store back to role-filtered UI polling.

## 4. Core Functional Flow
An employee submits a salary revision request from the employee dashboard. The request is persisted as a structured object, and a notification is generated with `roleTarget: "admin"`. Admin users then receive this event through periodic polling of the notifications endpoint.

When an admin updates salary, the service recalculates salary components, writes a new payroll cycle for that employee, and dispatches an employee-specific notification using `roleTarget: "employee:<id>"`. On the next employee polling cycle, the salary update notification appears. Acknowledgement is tracked by mutating the `acknowledged` flag from `false` to `true` only when the notification is visible to the requesting role/user.

## 5. Job Scheduler & System Alerts
Five simulated jobs run continuously: Attendance integration, Payroll execution, Tax validation, GL monitoring, and Bank interface. Each run can randomly succeed or fail. On failure, retry counters increment and escalation level may increase. Once retry thresholds are reached, circuit breaker simulation moves the job state to open and temporarily suspends execution until cooldown.

Alert throttling reduces repeated notifications for the same fault pattern inside a configured window. Job state tracking captures failure count, retry count, escalation level, circuit state, and last run timestamp, enabling deterministic observation of system behavior under instability.

## 6. Notification Engine Design
Notification creation is event-driven. Events originate from user workflows (for example salary revision or salary change) or from scheduler failures/success side effects. Each notification includes structured metadata: source system, severity, role target, related entity id, timestamp, acknowledgement status, and escalation level.

Role-based filtering occurs at read time: role-wide targets (`admin`, `finance`, `employee`) and employee-specific targets (`employee:<id>`) are both supported. Persistence is in-memory and append/prepend based for quick retrieval. UI polling periodically fetches notifications and updates badges and tables. Acknowledgement updates are authorized by visibility scope, preventing cross-role mutation.

## 7. Data Layer Design
The in-memory store includes `users`, `payrollByEmployee`, `notifications`, `salaryRequests`, `jobStates`, `glAccounts`, and transfer/alert support structures. This model is optimized for runtime simulation and reset-on-restart behavior.

```json
{
  "user": {
    "id": "emp-1",
    "name": "Prof. Meera Rao",
    "role": "employee"
  },
  "payrollCycle": {
    "cycleId": "emp-1-C6",
    "basic": 62000,
    "hra": 12400,
    "da": 6200,
    "bonus": 5000,
    "itDeduction": 8560,
    "netSalary": 77040,
    "timestamp": "2026-02-21T07:00:00.000Z"
  },
  "notification": {
    "id": "notif-123",
    "title": "Salary Updated",
    "message": "Your salary was updated by 5%.",
    "sourceSystem": "Admin Console",
    "severity": "medium",
    "roleTarget": "employee:emp-1",
    "relatedEntityId": "emp-1",
    "timestamp": "2026-02-21T07:10:00.000Z",
    "acknowledged": false,
    "escalationLevel": 0
  },
  "request": {
    "id": "req-001",
    "employeeId": "emp-1",
    "title": "Salary Revision Request",
    "message": "Requesting revision based on additional duties.",
    "proposedIncrementPct": 5,
    "status": "pending",
    "timestamp": "2026-02-21T07:05:00.000Z"
  },
  "jobState": {
    "failureCount": 1,
    "retryCount": 1,
    "escalationLevel": 1,
    "circuitState": "closed",
    "openUntil": null,
    "lastRunAt": "2026-02-21T07:15:00.000Z"
  },
  "glAccount": {
    "id": "gl-ops",
    "name": "Operations Payroll GL",
    "balance": 450000,
    "threshold": 180000,
    "ledger": [
      {
        "id": "led-001",
        "type": "debit",
        "amount": 12000,
        "referenceId": "txn-441",
        "timestamp": "2026-02-21T06:55:00.000Z"
      }
    ]
  }
}
```

## 8. Folder Structure
```text
server/
  routes/
  controllers/
  services/
  middleware/
  data/
  jobs/
  utils/
  server.js
public/
  css/
  js/
  login.html
  employee.html
  admin.html
  finance.html
  notifications.html
```

## 9. Technology Stack
Node.js and Express power the HTTP backend and static hosting. Business workflows are implemented through a service abstraction layer. Persistence is an in-memory JavaScript data store. Background execution uses `setInterval` scheduler simulation. All interactions are exposed as REST APIs and consumed by vanilla JavaScript frontend polling.

## 10. Installation & Setup Guide
Use Node.js 18+.

```bash
npm install
npm start
```

The server defaults to port `5001` unless `PORT` is set.

```bash
# Windows PowerShell
$env:PORT=5001
npm start
```

```bash
# macOS/Linux
PORT=5001 npm start
```

Open `http://localhost:5001/login.html`. Select a seeded user from the login dropdown to simulate Employee, Admin, or Finance behavior.

## 11. API Documentation
All protected endpoints require `x-user-id` header.

### Submit Salary Revision
```http
POST /api/employee/revision-request
x-user-id: emp-1
Content-Type: application/json
```

```json
{
  "title": "Salary Revision Request",
  "message": "Requesting a 5% revision.",
  "proposedIncrementPct": 5
}
```

```json
{
  "id": "req-123",
  "employeeId": "emp-1",
  "title": "Salary Revision Request",
  "message": "Requesting a 5% revision.",
  "proposedIncrementPct": 5,
  "timestamp": "2026-02-21T07:20:00.000Z",
  "status": "pending"
}
```

### Modify Salary
```http
POST /api/admin/modify-salary
x-user-id: admin-1
Content-Type: application/json
```

```json
{
  "employeeId": "emp-1",
  "percentage": 5
}
```

```json
{
  "success": true,
  "employee": {
    "id": "emp-1",
    "name": "Prof. Meera Rao",
    "role": "employee"
  },
  "payrollCycle": {
    "cycleId": "emp-1-C1700000000000",
    "basic": 65100,
    "hra": 13020,
    "da": 6510,
    "bonus": 5000,
    "itDeduction": 8963,
    "netSalary": 80667,
    "timestamp": "2026-02-21T07:25:00.000Z"
  }
}
```

### Get Notifications
```http
GET /api/notifications
x-user-id: admin-1
```

```json
[
  {
    "id": "notif-123",
    "title": "Employee Salary Revision Request",
    "message": "Asst. Prof. Kavya Sen submitted a salary revision request.",
    "sourceSystem": "Employee Portal",
    "severity": "medium",
    "roleTarget": "admin",
    "relatedEntityId": "emp-3",
    "timestamp": "2026-02-21T07:30:00.000Z",
    "acknowledged": false,
    "escalationLevel": 1
  }
]
```

### Acknowledge Notification
```http
POST /api/notifications/:id/ack
x-user-id: admin-1
```

```json
{
  "success": true,
  "notification": {
    "id": "notif-123",
    "acknowledged": true
  }
}
```

### Trigger Job Manually
Manual trigger endpoint is not implemented in this version. Jobs are interval-driven by design and can be observed through generated notifications and job state transitions.

## 12. Testing the Full Flow
Start with an employee login (`emp-1`) and submit a salary revision request from the employee dashboard. Then log out and log in as admin (`admin-1`) to validate that the request notification appears in admin notifications and request views.

Apply a salary update from the admin panel, then return to the employee login. On employee dashboard/notifications polling, verify that the salary update notification appears and can be acknowledged.

To observe scheduler failures and escalation, keep the system running for multiple intervals and monitor admin/finance notifications. Repeated failures on the same job will increase escalation and may open circuit state based on configured retry thresholds.

## 13. Failure Simulation & Resilience
Failure simulation uses randomized job outcomes to emulate operational instability. Retry policy increments counters up to a defined maximum before circuit breaker open-state behavior is applied. Escalation hierarchy raises event criticality as failures persist. Alert throttling suppresses repeated notifications in short windows to prevent flooding while preserving fault visibility.

## 14. Limitations
The system uses an in-memory data store, so all state resets on server restart. There is no durable event history, no distributed worker model, and no real external integration for payroll, tax, attendance, or banking channels.

## 15. Future Enhancements
A production path would include Redis-backed caching/state coordination, message queues for asynchronous event processing, durable database persistence, and a real cron or queue-based scheduler. Additional improvements include centralized audit logs, configurable alert policies, and policy-driven role authorization.

## 16. Conclusion
Anna Pay demonstrates a focused notification system for payroll-adjacent operations using deterministic layered architecture, role-filtered event delivery, and fault tolerance simulation. It provides a reproducible local foundation for evaluating payroll monitoring workflows before integrating enterprise-grade persistence and infrastructure.
