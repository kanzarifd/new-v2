# Bank Reclamation System

A full-stack application for managing bank complaints and reclamation requests.

## Features

- User Authentication (Login/Register)
- Role-based Dashboard (Admin/User)
- Complaint Management
- Password Reset

## Tech Stack

- Frontend: React + TypeScript + Material-UI
- Backend: Node.js + Express + TypeScript
- Database: Prisma + PostgreSQL
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd bank-reclam-frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary environment variables (JWT_SECRET, DATABASE_URL, etc.)

4. Run the application:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend development server
   cd ../bank-reclam-frontend
   npm run dev
   ```

## Project Structure

```
bank-reclam-system/
├── backend/           # Node.js Express backend
├── bank-reclam-frontend/  # React frontend
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
