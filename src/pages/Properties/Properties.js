import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Pagination, 
  CircularProgress, 
  Alert, 
  Skeleton, 
  ToggleButtonGroup, 
  ToggleButton
} from '@mui/material';
import { ViewList, ViewModule } from '@mui/icons-material';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useSearchParams } from 'react-router-dom';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const propertiesPerPage = 8;

  // Mock data - should be replaced with API calls in a real implementation
  const mockProperties = [
    {
      id: 1,
      title: 'Biệt thự ven hồ Đông Nam',
      location: 'Quận 2, TP.HCM',
      price: 12000000000,
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      type: 'villa',
      direction: 'southeast',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?villa'
    },
    {
      id: 2,
      title: 'Căn hộ cao cấp view sông',
      location: 'Quận 7, TP.HCM',
      price: 4500000000,
      bedrooms: 2,
      bathrooms: 2,
      area: 80,
      type: 'apartment',
      direction: 'east',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?apartment'
    },
    {
      id: 3,
      title: 'Nhà phố hiện đại trung tâm',
      location: 'Quận 1, TP.HCM',
      price: 25000000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'house',
      direction: 'west',
      purpose: 'rent',
      image: 'https://source.unsplash.com/random/600x400/?house'
    },
    {
      id: 4,
      title: 'Đất nền mặt tiền đường lớn',
      location: 'Bình Chánh, TP.HCM',
      price: 3200000000,
      bedrooms: 0,
      bathrooms: 0,
      area: 200,
      type: 'land',
      direction: 'north',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?land'
    },
    {
      id: 5,
      title: 'Căn hộ 3 phòng ngủ nội thất đầy đủ',
      location: 'Quận 4, TP.HCM',
      price: 18000000,
      bedrooms: 3,
      bathrooms: 2,
      area: 95,
      type: 'apartment',
      direction: 'south',
      purpose: 'rent',
      image: 'https://source.unsplash.com/random/600x400/?modern-apartment'
    },
    {
      id: 6,
      title: 'Biệt thự sân vườn rộng',
      location: 'Quận 9, TP.HCM',
      price: 15000000000,
      bedrooms: 5,
      bathrooms: 4,
      area: 350,
      type: 'villa',
      direction: 'northeast',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?garden-house'
    },
    {
      id: 7,
      title: 'Nhà phố thương mại 4 tầng',
      location: 'Quận 10, TP.HCM',
      price: 28000000000,
      bedrooms: 4,
      bathrooms: 5,
      area: 160,
      type: 'house',
      direction: 'south',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?commercial-house'
    },
    {
      id: 8,
      title: 'Căn hộ studio nội thất cao cấp',
      location: 'Quận 3, TP.HCM',
      price: 8000000,
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      type: 'apartment',
      direction: 'west',
      purpose: 'rent',
      image: 'https://source.unsplash.com/random/600x400/?studio-apartment'
    },
    {
      id: 9,
      title: 'Biệt thự nghỉ dưỡng ven biển',
      location: 'Vũng Tàu',
      price: 20000000000,
      bedrooms: 4,
      bathrooms: 4,
      area: 400,
      type: 'villa',
      direction: 'east',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?beach-villa'
    },
    {
      id: 10,
      title: 'Đất nền dự án khu đô thị mới',
      location: 'Thủ Đức, TP.HCM',
      price: 4500000000,
      bedrooms: 0,
      bathrooms: 0,
      area: 120,
      type: 'land',
      direction: 'southwest',
      purpose: 'buy',
      image: 'https://source.unsplash.com/random/600x400/?land-plot'
    }
  ];

  // Parse search params from URL to search object
  const getSearchParamsFromUrl = () => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  };

  useEffect(() => {
    // Simulate API fetch
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // await fetch('/api/properties')...
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProperties(mockProperties);
        
        // Apply any URL search params
        const urlParams = getSearchParamsFromUrl();
        if (Object.keys(urlParams).length > 0) {
          // Mark these params as coming from URL to avoid circular updates
          urlParams._source = 'url';
          // Apply filters from URL params
          handleSearch(urlParams);
        } else {
          setFilteredProperties(mockProperties);
          setLoading(false);
        }
      } catch (err) {
        setError('Không thể tải danh sách bất động sản. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);  // Only run on mount, not on searchParams change to avoid loops

  const handleSearch = (searchParams) => {
    setLoading(true);
    
    // Update URL params if this is a user-initiated search
    if (searchParams._source !== 'url') {
      // Create new URLSearchParams object
      const newParams = new URLSearchParams();
      
      // Add non-empty search params
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] && key !== '_source') {
          newParams.set(key, searchParams[key]);
        }
      });
      
      // Update URL without causing a page reload
      setSearchParams(newParams);
    }
    
    // Apply filters
    let results = [...properties];
    
    // Filter by location
    if (searchParams.location) {
      results = results.filter(property => 
        property.location.toLowerCase().includes(searchParams.location.toLowerCase())
      );
    }
    
    // Filter by property type
    if (searchParams.propertyType && searchParams.propertyType !== 'all') {
      results = results.filter(property => property.type === searchParams.propertyType);
    }
    
    // Filter by price range
    if (searchParams.priceMin) {
      results = results.filter(property => property.price >= parseInt(searchParams.priceMin));
    }
    
    if (searchParams.priceMax) {
      results = results.filter(property => property.price <= parseInt(searchParams.priceMax));
    }
    
    // Filter by bedrooms
    if (searchParams.bedrooms) {
      results = results.filter(property => property.bedrooms >= parseInt(searchParams.bedrooms));
    }
    
    // Filter by bathrooms
    if (searchParams.bathrooms) {
      results = results.filter(property => property.bathrooms >= parseInt(searchParams.bathrooms));
    }
    
    // Filter by area
    if (searchParams.areaMin) {
      results = results.filter(property => property.area >= parseInt(searchParams.areaMin));
    }
    
    if (searchParams.areaMax) {
      results = results.filter(property => property.area <= parseInt(searchParams.areaMax));
    }
    
    // Filter by direction
    if (searchParams.direction) {
      results = results.filter(property => property.direction === searchParams.direction);
    }
    
    // Filter by purpose (rent/buy)
    if (searchParams.purpose && searchParams.purpose !== 'all') {
      results = results.filter(property => property.purpose === searchParams.purpose);
    }
    
    // Sort results
    if (searchParams.sortBy) {
      switch (searchParams.sortBy) {
        case 'price_asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'area_asc':
          results.sort((a, b) => a.area - b.area);
          break;
        case 'area_desc':
          results.sort((a, b) => b.area - a.area);
          break;
        default:
          // newest is default, no need to sort for mock data
          break;
      }
    }
    
    setFilteredProperties(results);
    setPage(1);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Pagination logic
  const indexOfLastProperty = page * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          height: '300px',
          width: '100%',
          position: 'relative',
          backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?real-estate)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 5,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Box sx={{ position: 'relative', textAlign: 'center', color: 'white', px: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Tìm kiếm bất động sản
          </Typography>
          <Typography variant="h6">
            Khám phá các căn hộ, nhà ở và bất động sản ưng ý nhất cho bạn
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="xl">
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />
        
        {/* Results Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              {loading
                ? 'Đang tìm kiếm...'
                : filteredProperties.length > 0
                  ? `Tìm thấy ${filteredProperties.length} bất động sản`
                  : 'Không tìm thấy bất động sản nào'}
            </Typography>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModule />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(4)].map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={viewMode === 'grid' ? 4 : 6} lg={viewMode === 'grid' ? 3 : 6}>
                  <Skeleton variant="rectangular" height={viewMode === 'grid' ? 200 : 150} />
                  <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </Grid>
              ))}
            </Grid>
          ) : filteredProperties.length > 0 ? (
            <Grid container spacing={3}>
              {currentProperties.map((property) => (
                <Grid item key={property.id} xs={12} sm={6} md={viewMode === 'grid' ? 4 : 6} lg={viewMode === 'grid' ? 3 : 6}>
                  <PropertyCard 
                    property={property} 
                    mode={viewMode}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Không tìm thấy bất động sản nào phù hợp với tiêu chí tìm kiếm.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Vui lòng thử lại với các tiêu chí khác.
              </Typography>
            </Paper>
          )}
          
          {/* Pagination */}
          {filteredProperties.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Properties;