// Test file for geocoding

interface LocationData {
  address: string;
  city: string;
  city_name: string;
  district: string;
  district_name: string;
  ward: string;
  ward_name: string;
  street: string;
  latitude: number | null;
  longitude: number | null;
}

// Example response from geocoding API
const geocodeResult = {
  success: true,
  data: {
    latitude: 10.8231,
    longitude: 106.6297,
    display_name: "Ho Chi Minh City, Vietnam"
  }
};

// Sample function to test TypeScript behaviors
function testGeocoding() {
  // Initialize location
  const location: LocationData = {
    address: "123 Main St",
    city: "79",
    city_name: "Ho Chi Minh City",
    district: "760",
    district_name: "District 1",
    ward: "26734",
    ward_name: "Ben Nghe Ward",
    street: "123 Main St",
    latitude: null,
    longitude: null
  };
  
  console.log("Initial location:", location);
  
  // Property data with location
  const propertyData = {
    title: "Test Property",
    price: 1000000,
    location: location
  };
  
  // Update with geocoding results
  if (geocodeResult.success && geocodeResult.data) {
    propertyData.location.latitude = geocodeResult.data.latitude;
    propertyData.location.longitude = geocodeResult.data.longitude;
  }
  
  console.log("Updated location:", propertyData.location);
  
  return propertyData;
}

// Execute test
testGeocoding();

export {}; 