# Service.in

![Service.in Logo](public/assets/logo.png)

**Service.in** is a web platform that connects customers with verified service providers (e.g., plumbers, electricians, technicians) for household, office, and organizational maintenance tasks. It offers a seamless interface for browsing, booking, and reviewing services, ensuring reliability and trust.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Secure registration and login for customers and providers using JWT.
- **Service Browsing**: Filter services by category, location, or provider rating.
- **Booking System**: Book services with a user-friendly form and receive confirmation.
- **Provider Profiles**: View verified provider details, skills, and reviews.
- **AI Recommendations**: Gemini API-powered service and provider suggestions.
- **Reviews and Ratings**: Submit feedback to build trust in the platform.
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS.

## Tech Stack
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **External API**: Gemini API for AI-driven features
- **Authentication**: JWT, bcrypt
- **Environment**: dotenv for configuration

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/service-in.git
   cd service-in
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas (cloud).
   - Create a database named `service_in`.

4. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add the following:
     ```
     MONGODB_URI=mongodb://localhost:27017/service_in
     JWT_SECRET=your_jwt_secret
     GEMINI_API_KEY=your_gemini_api_key
     PORT=5000
     ```

5. **Run the Application**:
   ```bash
   npm run dev
   ```
   - The backend runs on `http://localhost:5000`.
   - The frontend is served from the `public` directory.

## Usage
1. **Access the Application**:
   - Open `http://localhost:5000` in your browser.
   - Register as a customer or provider.
   - Browse services, book a provider, or manage your profile.

2. **Admin Features**:
   - Contact the project admin to gain access to the admin dashboard.
   - Verify providers and monitor platform activity.

3. **API Testing**:
   - Use Postman or cURL to test API endpoints (see below).

## API Endpoints
- **Auth**:
  - `POST /api/auth/register`: Register a new user.
  - `POST /api/auth/login`: Login and receive a JWT.
- **Services**:
  - `GET /api/services`: List all services.
  - `POST /api/services`: Create a new service (admin only).
- **Bookings**:
  - `POST /api/bookings`: Create a booking.
  - `GET /api/bookings/:id`: View booking details.
- **Providers**:
  - `GET /api/providers/:id`: Get provider details.
  - `PUT /api/providers/:id`: Update provider profile (provider only).
- **Reviews**:
  - `POST /api/reviews`: Submit a review.
  - `GET /api/reviews/:providerId`: List reviews for a provider.

## Environment Variables
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT signing.
- `GEMINI_API_KEY`: API key for Gemini API.
- `PORT`: Port for the Express server (default: 5000).

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.