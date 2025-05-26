# Boutique - MERN Stack E-Commerce Application

A full-featured e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js).

![Boutique App Screenshot](https://i.ibb.co/JRgnkL4/boutique-logo.png)

## Features

- Modern, responsive UI with Tailwind CSS
- Product browsing by category and search
- Product reviews and ratings
- Product pagination
- User authentication with JWT
- User profile with order history
- Shopping cart functionality
- Checkout process
- PayPal / credit card integration
- Admin product & user management
- Admin order details page
- Database seeder (products & users)
- Full API documentation

## Technology Stack

### Frontend
- React.js with Hooks
- React Router for navigation
- Redux for state management
- Tailwind CSS for styling
- React Toastify for notifications
- Vite for building and development

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- RESTful API architecture

## Quick Start

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mern-boutique.git
cd mern-boutique
```

2. Install dependencies for backend and frontend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Create a .env file in the server directory with the following content
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

4. Run the application
```bash
# Run backend and frontend concurrently
cd ..
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Deployment

This application can be deployed using platforms like Heroku, Netlify, Vercel, or AWS.

## License

MIT

## Acknowledgements

- Design inspiration from various premium e-commerce websites
- All product images sourced from Unsplash 