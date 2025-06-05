# MoveInSync Visitor Management System Documentation

## Overview
The MoveInSync Visitor Management System is a comprehensive solution designed to streamline and secure the visitor management process. The system consists of three main portals: Admin Portal, Security Guard Portal, and Employee Portal, each serving specific roles in the visitor management workflow.

## System Architecture

### Frontend
- **Technology Stack:**
  - React.js
  - TypeScript
  - Material-UI (MUI)
  - HTML5QrCode for QR scanning
  - React Router for navigation
  - Axios for API calls

### Backend
- **Technology Stack:**
  - Node.js
  - Express.js
  - MongoDB
  - JWT for authentication
  - Bcrypt for password hashing

## Portal Descriptions

### 1. Admin Portal
- **Purpose:** System administration and management
- **Key Features:**
  - User management (employees and security guards)
  - System configuration
  - Analytics and reporting
  - Access control management

### 2. Security Guard Portal
- **Purpose:** On-ground visitor management
- **Key Features:**
  - QR code scanning for visitor check-in/out
  - Visitor registration
  - Real-time visitor tracking
  - Emergency alerts
  - Visitor history

### 3. Employee Portal
- **Purpose:** Employee self-service and visitor management
- **Key Features:**
  - Visitor invitation
  - Visitor approval
  - Check-in/out status tracking
  - Visitor history

## Key Components

### QR Scanner
- **Technology:** HTML5QrCode
- **Features:**
  - Real-time QR code detection
  - Camera integration
  - Error handling
  - Status feedback
- **Configuration:**
  - Environment camera support
  - 10 FPS scanning rate
  - 250x250px scan area
  - Aspect ratio maintenance

### Authentication System
- JWT-based authentication
- Role-based access control
- Secure password handling
- Session management

### Database Schema
- **Collections:**
  - Users (Employees, Security Guards, Admins)
  - Visitors
  - Check-ins/Check-outs
  - Invitations
  - System Logs

## Security Features
1. **Authentication:**
   - JWT token-based authentication
   - Password encryption
   - Session management
   - Role-based access control

2. **Data Protection:**
   - Encrypted data transmission
   - Secure password storage
   - Input validation
   - XSS protection

3. **Access Control:**
   - Role-based permissions
   - Portal-specific access
   - Feature-level authorization

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Modern web browser
- Camera access for QR scanning

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Start the development server:
   ```bash
   npm start
   ```

## Development Guidelines

### Code Structure
- Component-based architecture
- Modular design
- TypeScript for type safety
- Consistent coding standards

### Best Practices
1. **Code Quality:**
   - TypeScript for type safety
   - ESLint for code linting
   - Prettier for code formatting
   - Component documentation

2. **Performance:**
   - Lazy loading
   - Code splitting
   - Optimized assets
   - Efficient state management

3. **Testing:**
   - Unit tests
   - Integration tests
   - End-to-end testing
   - Performance testing

## API Documentation

### Authentication Endpoints
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token

### Visitor Management Endpoints
- POST /api/visitors/register
- GET /api/visitors/:id
- PUT /api/visitors/:id
- DELETE /api/visitors/:id

### Check-in/Check-out Endpoints
- POST /api/checkin
- POST /api/checkout
- GET /api/visits/history

## Troubleshooting

### Common Issues
1. **QR Scanner Issues:**
   - Camera access denied
   - Scanner not detecting codes
   - Performance issues

2. **Authentication Issues:**
   - Token expiration
   - Login failures
   - Session timeouts

3. **Performance Issues:**
   - Slow loading times
   - Scanner lag
   - API response delays

### Solutions
1. **QR Scanner:**
   - Check camera permissions
   - Ensure good lighting
   - Verify QR code quality
   - Clear browser cache

2. **Authentication:**
   - Clear browser cache
   - Check token validity
   - Verify credentials
   - Reset password if needed

## Future Enhancements
1. **Planned Features:**
   - Mobile app integration
   - Advanced analytics
   - Automated visitor notifications
   - Integration with access control systems

2. **Technical Improvements:**
   - Performance optimization
   - Enhanced security measures
   - Better error handling
   - Improved user experience

## Support and Maintenance
- Regular updates and patches
- Security updates
- Performance monitoring
- User support system

## License and Legal
- Proprietary software
- Usage terms and conditions
- Data privacy compliance
- Security standards compliance

---

*This documentation is maintained by the MoveInSync development team. Last updated: [Current Date]* 