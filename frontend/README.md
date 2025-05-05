# Real Estate Frontend

Frontend for a real estate website, modeled after batdongsan.com.vn, built with React, TypeScript, and Material-UI.

## Features

- Modern, responsive UI design
- Property listing and search functionality
- Interactive property details
- User authentication system
- Favorites and saved searches
- Map-based property browsing
- Multi-language support

## Tech Stack

- **React** - Frontend library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - API requests
- **Sass** - Styling
- **Leaflet** - Maps
- **React Slick** - Carousels

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/real-estate-project.git
cd real-estate-project/frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable components
│   │   ├── layout/     # Layout components
│   │   ├── property/   # Property related components
│   │   ├── home/       # Home page components
│   │   └── common/     # Common components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   └── App.tsx         # Main app component
└── package.json        # Project dependencies
```

## API Integration

The frontend integrates with a RESTful API backend that provides data for:
- User authentication
- Property listings
- Property searches
- Favorites
- Appointments
- Messaging

## Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or suggestions, please feel free to contact us at example@domain.com. 