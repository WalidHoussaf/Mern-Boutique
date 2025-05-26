# MERN E-commerce Boutique

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization
- Product catalog with categories and search
- Shopping cart functionality
- Order management system
- Admin dashboard
- Responsive design
- Real-time notifications
- Payment integration
- Order tracking

## Technologies Used

- **Frontend:**
  - React.js
  - TailwindCSS
  - React Router
  - Context API
  - Axios

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication
  - RESTful API

## Getting Started

1. Clone the repository
```bash
git clone <your-repo-url>
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd client
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory and add:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. Run the development server
```bash
# Run backend
cd server
npm run dev

# Run frontend
cd client
npm start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 