# E-Commerce Web App

A full-stack e-commerce application built with MERN stack (MongoDB, Express.js, React, Node.js) that provides a complete online shopping experience with user authentication, product management, cart functionality, and order processing.

## Project Overview

### Key Features

- User authentication (Register, Login, Password management)
- Role-based access control (Admin, Retailer, User)
- Product catalog with search, filter, and sort capabilities
- Shopping cart management
- Wishlist functionality
- Order processing and management
- Product review and rating system
- User profile management
- Admin dashboard for user management
- Retailer dashboard for order management

### Technology Stack

#### Frontend
- React.js (v19.1.0)
- React Router DOM (v7.5.0)
- React Bootstrap
- Framer Motion for animations
- JWT Decode for authentication

#### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator
- Helmet for security
- CORS

## Project Structure
```plaintext
├── backend/
│   ├── middleware/     # Authentication and authorization middleware
│   ├── models/         # MongoDB schema models
│   ├── routes/         # API route handlers
│   ├── .env            # Environment variables
│   ├── db.js          # Database connection
│   ├── index.js       # Server entry point
│   └── package.json   # Backend dependencies
├── public/            # Static files
├── src/
│   ├── components/    # React components
│   ├── context/       # Context API states
│   ├── Style/         # CSS stylesheets
│   └── App.js         # Main React component
└── package.json       # Project dependencies
```

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd e-commerce-web-app
```

2. **Install dependencies for both frontend and backend:**
```bash
npm install
cd backend
npm install
```

3. **Create environment variables:**
Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=4000
JWT_SECRET=your_jwt_secret_key
```

## Usage

1. **Start the development server:**
```bash
npm run both
```
This will start both frontend and backend servers concurrently.
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

2. **API Documentation:** A complete Postman collection is included in the project (`E-Commerce Web App.postman_collection.json`) for testing all API endpoints.

## Environment Variables Required

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Backend server port (default: 4000)
- `JWT_SECRET`: Secret key for JWT token generation

### Frontend
The frontend uses a proxy configuration to connect to the backend (configured in package.json)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC License

---

This project demonstrates a complete e-commerce solution with modern web technologies and best practices for security and scalability. The codebase is organized into clear frontend and backend structures, making it easy to maintain and extend.