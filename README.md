# Canteen Apocalypse 🍽️

A real-time canteen crowd monitoring and notification system that helps students make informed decisions about when to visit campus canteens.

## 📌 Project Overview

Canteen Apocalypse monitors crowd conditions through student-submitted reports. It calculates a **Chaos Score** based on people count, queue length, and waiting time, classifies the crowd level, and provides suitable notifications.

The application provides separate dashboards and access permissions for students and administrators.

## ✨ Features

- **Crowd Reporting:** Students can submit crowd observations.
- **Chaos Score:** Calculates congestion using a weighted formula.
- **Crowd Classification:** Categorizes conditions as LOW, MODERATE, HIGH, or CRITICAL.
- **Notifications:** Provides crowd updates and recommendations.
- **Analytics Dashboard:** Displays canteen crowd statistics.
- **Role-Based Access:** Separate permissions for STUDENT and ADMIN.
- **Feedback System:** Allows students to submit feedback.
- **Alert Management:** Updates existing active alerts to prevent repeated notifications for unchanged crowd levels.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend and backend |
| TypeScript | Application logic |
| Tailwind CSS | UI styling |
| MySQL | Relational database |
| MongoDB | Feedback storage |
| Node.js | Runtime environment |
| JWT & bcryptjs | Authentication and password security |

## 🧮 Chaos Score

The Chaos Score considers three parameters:

- People count – 40%
- Queue length – 30%
- Waiting time – 30%

Each parameter is normalized against canteen capacity or a 60-minute waiting-time reference and capped at 100.

| Score | Crowd Level |
|---|---|
| 0–25 | LOW |
| 26–50 | MODERATE |
| 51–75 | HIGH |
| 76–100 | CRITICAL |

## 🗄️ Database Concepts

### SQL – MySQL
Stores structured information such as users, canteens, counters, observations, and alerts.

### NoSQL – MongoDB
Stores student feedback in a flexible document-based format.

### Advanced SQL
- **Transactions:** Maintain consistency while inserting observations and managing alerts.
- **Views:** `canteen_daily_summary` provides aggregated daily canteen statistics.
- **Stored Procedures:** `sp_canteen_analytics` and `sp_get_canteen_alerts` retrieve analytics and alert information.
- **Triggers:** `trg_calculate_chaos_score` automatically calculates the Chaos Score before an observation is inserted.

## 📂 Project Structure

```text
canteen-apocalypse-project/
├── src/
│   └── app/
│       ├── alerts/
│       ├── analytics/
│       ├── api/
│       ├── feedback/
│       ├── login/
│       ├── report/
│       └── ...
├── public/
├── .env.local
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

**1. Clone the repository**

```bash
git clone https://github.com/Pavithran839/CANTEEN-APOCALYPSE.git
```

**2. Navigate to the project**

```bash
cd canteen-apocalypse-project
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env.local` file with the required MySQL, MongoDB, and authentication credentials.

**5. Set up the databases**

- Create the MySQL database `canteen_apocalypse` and configure its tables.
- Ensure MongoDB is running and accessible to the application.

**6. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 User Roles

| Student | Administrator |
|---|---|
| Submit crowd reports | View crowd analytics |
| View analytics | View notifications |
| Receive crowd notifications | Monitor crowd conditions |
| Submit feedback | Access administrative features |

## 🎯 Project Objective

To reduce uncertainty and waiting time in campus canteens through real-time crowd reporting, data-driven congestion analysis, and timely notifications.

---

**Course:** Database Management Systems (DBMS)  
**Project:** Canteen Apocalypse  
**Repository:** [GitHub – Canteen Apocalypse](https://github.com/Pavithran839/CANTEEN-APOCALYPSE)
