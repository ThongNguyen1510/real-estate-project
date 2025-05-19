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

## Setting Up Google Maps API

To display property locations on a map, you need to set up a Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy your new API Key
8. Create a file named `.env` in the `frontend` directory with the following content:

```
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

9. Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key
10. Restart your development server with `npm start`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed! 