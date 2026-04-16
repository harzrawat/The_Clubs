# The Clubs 

A comprehensive Club Management System designed to streamline university or organizational club activities, event planning, and member engagement.

## Features

###  User Roles & Access Control
- **Admin**: Oversee all clubs, approve/reject event requests, manage users, and generate analytical reports.
- **Club Head**: Manage specific club details, create and edit events, and monitor member participation.
- **Student/Member**: Browse clubs, join communities, view upcoming events via a calendar, and receive real-time notifications.

### Event Management
- **Workflow**: Events go through a 'Pending -> Approved/Rejected' lifecycle moderated by admins.
- **Interactive Calendar**: View all organizational events in a centralized calendar interface.
- **Gallery**: Event-specific photo galleries to showcase past activities.
- **Attendance Tracking**: Monitor engagement levels for each event.

### System Notifications
- Persistent notification system for event approvals, rejections, and new announcements.
- Individual "Read/Unread" tracking and deletion capabilities.
- Targeted notifications for specific club members or global announcements.

### Analytics & Reporting
- Visual dashboards for admins and club heads.
- PDF report generation for annual club performance and event statistics.
- Leaderboard system to highlight active and top-performing clubs.

---

##  Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Modern CSS
- **UI Components**: Radix UI (Primitives) & Material UI (MUI)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Hooks & Context API
- **Routing**: React Router 7
- **Charts**: Recharts
- **PDF Generation**: jsPDF & html2canvas

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Authentication**: JWT (Flask-JWT-Extended)
- **Migrations**: Flask-Migrate
- **CORS**: Flask-CORS

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL Database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/The_Clubs.git
   cd The_Clubs
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `backend` directory:
```env
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
DATABASE_URL=postgresql://username:password@localhost:5432/the_clubs
```

---

## Running the Application

### 1. Start the Backend
```bash
cd backend
python run.py
```
The API will be available at `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

---

##  Demo Accounts

For testing and demonstration, the system can be seeded with the following default accounts. All accounts use the password: `password` (configurable via `DEMO_PASSWORD` env var).

| Role | Email | Use Case |
| :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | System management & approvals |
| **Club Head** | `head@university.edu` | Managing Tech Club & events |
| **Student** | `student@university.edu` | Browsing & joining clubs |

---

##  Development Tools

### Seeding the Database
To populate the database with initial demo data, ensure your `.env` is configured and run:
```bash
cd backend
python -c "from app import create_app; from app.extensions import db; from app.seed import seed_if_empty; app = create_app(); with app.app_context(): db.create_all(); seed_if_empty()"
```

---

##  Project Structure

```text
The_Clubs/
├── backend/                # Flask API
│   ├── app/                # Application logic
│   │   ├── routes/         # API Endpoints
│   │   ├── models.py       # Database Schemas
│   │   └── seed.py         # Initial data seeding
│   ├── migrations/         # DB Migrations
│   └── run.py              # Entry point
├── frontend/               # React SPA
│   ├── src/
│   │   ├── app/            # Core logic & routing
│   │   ├── components/     # Reusable UI components
│   │   └── pages/          # Full page components
│   └── public/             # Static assets
└── README.md
```

---

##  License
Distributed under the MIT License. See `LICENSE` for more information.
