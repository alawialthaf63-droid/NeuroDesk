# 🧠 NeuroDesk

### Modern Workspace & Task Management Application

NeuroDesk is a modern web-based workspace application designed to help users organize tasks, manage their workflow, and improve productivity through an intuitive dashboard.

Built with Laravel, React, and Inertia.js, NeuroDesk combines a robust backend with a responsive and interactive user interface.

---

## ✨ Features

- 🔐 **Authentication System** — User registration, login, logout, and password reset.
- 📊 **Dashboard** — Centralized workspace for authenticated users.
- ✅ **Task Management** — Manage and organize tasks.
- 👤 **Profile Management** — Update user profile information.
- 🔒 **Security Settings** — Password management and two-factor authentication support.
- 📱 **Responsive UI** — Modern interface designed for different screen sizes.
- 🧪 **Automated Testing** — Tested authentication, dashboard, and account settings functionality.

---

## 🛠️ Tech Stack

| Technology | Description |
|---|---|
| Laravel | Backend framework |
| PHP | Server-side programming language |
| React | Frontend library |
| TypeScript | Frontend programming language |
| Inertia.js | Laravel and React integration |
| Tailwind CSS | Utility-first CSS framework |
| Vite | Frontend build tool |
| SQLite / MySQL | Database |
| Git & GitHub | Version control |

---

## 📸 Screenshots

Screenshots of the application will be added here.

<!-- Add screenshots after capturing the application -->

---

## ⚙️ Installation

### Prerequisites

Make sure you have installed:

- PHP
- Composer
- Node.js
- npm
- Database supported by Laravel

### 1. Clone the Repository

```bash
git clone https://github.com/alawialthaf63-droid/NeuroDesk.git
```

### 2. Navigate to the Project

```bash
cd NeuroDesk
```

### 3. Install Dependencies

```bash
composer install
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Configure your database connection in the `.env` file.

### 5. Run Database Migrations

```bash
php artisan migrate
```

### 6. Build Frontend Assets

```bash
npm run build
```

### 7. Start the Application

```bash
composer run dev
```

Open the local URL provided in your terminal.

---

## 🧪 Testing

NeuroDesk includes automated tests covering authentication, dashboard access, profile management, and security settings.

Run the test suite:

```bash
php artisan test
```

### Latest Test Results

| Metric | Result |
|---|---:|
| Tests Passed | 40 |
| Assertions | 138 |
| Failures | 0 |
| Duration | 13.69 seconds |

---

## 🚀 Project Status

NeuroDesk is a personal development project focused on building practical web development skills and exploring modern application architecture.

---

## 👨‍💻 Developer

**Althaf Alawi**

- GitHub: [@alawialthaf63-droid](https://github.com/alawialthaf63-droid)

---

<p align="center">
  Developed with Laravel, React, and Inertia.js
</p>
