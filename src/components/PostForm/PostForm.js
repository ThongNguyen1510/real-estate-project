import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  MenuItem, 
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  RadioGroup,
  Radio,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Chip,
  InputAdornment,
  FormHelperText,
  ImageList,
  ImageListItem,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Tooltip,
  CircularProgress,
  Autocomplete,
  useTheme
} from '@mui/material';
import { 
  AddPhotoAlternate, 
  Home, 
  Apartment, 
  Villa, 
  Landscape, 
  Delete,
  LocalParking,
  Security,
  Wifi,
  Pool,
  Elevator,
  AcUnit,
  Kitchen,
  Pets,
  DirectionsCar,
  FitnessCenter,
  Deck,
  Weekend,
  ArrowForward,
  ArrowBack,
  Business,
  Storefront,
  MeetingRoom,
  Navigation,
  Assignment,
  ContactPhone,
  Info,
  LocationOn,
  Description,
  PermMedia,
  Check,
  Close,
  VerifiedUser
} from '@mui/icons-material';

const PostForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'apartment',
    propertyStatus: 'for-sale',
    category: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: '',
    district: '',
    ward: '',
    street: '',
    projectName: '',
    direction: '',
    legalStatus: '',
    interiorStatus: '',
    balconyDirection: '',
    frontage: '',
    entryWidth: '',
    floors: '',
    amenities: {
      parking: false,
      security: false,
      wifi: false,
      pool: false,
      elevator: false,
      airConditioner: false,
      kitchen: false,
      petFriendly: false,
      garage: false,
      gym: false,
      garden: false,
      furnished: false
    },
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    images: [],
    verificationDocuments: [],
    requestVerification: false
  });

  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewVerificationDocs, setPreviewVerificationDocs] = useState([]);

  const theme = useTheme();

  const propertyTypes = [
    { value: 'apartment', label: 'Căn hộ', icon: <Apartment /> },
    { value: 'house', label: 'Nhà ở', icon: <Home /> },
    { value: 'villa', label: 'Biệt thự', icon: <Villa /> },
    { value: 'land', label: 'Đất', icon: <Landscape /> },
    { value: 'office', label: 'Văn phòng', icon: <Business /> },
    { value: 'shophouse', label: 'Nhà phố thương mại', icon: <Storefront /> },
    { value: 'motel', label: 'Phòng trọ', icon: <MeetingRoom /> }
  ];

  const propertyCategories = [
    { value: 'residential', label: 'Nhà ở' },
    { value: 'commercial', label: 'Thương mại' },
    { value: 'industrial', label: 'Công nghiệp' },
    { value: 'agricultural', label: 'Nông nghiệp' }
  ];

  const directionOptions = [
    { value: 'east', label: 'Hướng Đông' },
    { value: 'west', label: 'Hướng Tây' },
    { value: 'south', label: 'Hướng Nam' },
    { value: 'north', label: 'Hướng Bắc' },
    { value: 'northeast', label: 'Đông Bắc' },
    { value: 'northwest', label: 'Tây Bắc' },
    { value: 'southeast', label: 'Đông Nam' },
    { value: 'southwest', label: 'Tây Nam' }
  ];

  const legalStatusOptions = [
    { value: 'redbook', label: 'Sổ đỏ/Sổ hồng' },
    { value: 'pinkbook', label: 'Sổ hồng' },
    { value: 'waiting', label: 'Đang chờ sổ' },
    { value: 'contract', label: 'Hợp đồng mua bán' },
    { value: 'deposit', label: 'Đặt cọc' },
    { value: 'other', label: 'Khác' }
  ];

  const interiorStatusOptions = [
    { value: 'empty', label: 'Nhà trống' },
    { value: 'basic', label: 'Nội thất cơ bản' },
    { value: 'full', label: 'Full nội thất' },
    { value: 'highend', label: 'Nội thất cao cấp' }
  ];

  const amenitiesOptions = [
    { value: 'parking', label: 'Bãi đậu xe', icon: <LocalParking /> },
    { value: 'security', label: 'An ninh 24/7', icon: <Security /> },
    { value: 'wifi', label: 'Wifi', icon: <Wifi /> },
    { value: 'pool', label: 'Hồ bơi', icon: <Pool /> },
    { value: 'elevator', label: 'Thang máy', icon: <Elevator /> },
    { value: 'airConditioner', label: 'Điều hòa', icon: <AcUnit /> },
    { value: 'kitchen', label: 'Nhà bếp', icon: <Kitchen /> },
    { value: 'petFriendly', label: 'Thân thiện thú cưng', icon: <Pets /> },
    { value: 'garage', label: 'Gara ô tô', icon: <DirectionsCar /> },
    { value: 'gym', label: 'Phòng tập thể dục', icon: <FitnessCenter /> },
    { value: 'garden', label: 'Sân vườn', icon: <Deck /> },
    { value: 'furnished', label: 'Đầy đủ nội thất', icon: <Weekend /> }
  ];

  // Populate form data when initialData is provided for editing
  useEffect(() => {
    if (initialData) {
      // Initialize default amenities object if not present in initialData
      const amenities = initialData.amenities || {
        parking: false,
        security: false,
        wifi: false,
        pool: false,
        elevator: false,
        airConditioner: false,
        kitchen: false,
        petFriendly: false,
        garage: false,
        gym: false,
        garden: false,
        furnished: false
      };
      
      setFormData(prevData => ({
        ...prevData,
        ...initialData,
        amenities
      }));
      
      // Generate preview images if initialData has images
      if (initialData.images && initialData.images.length > 0) {
        const newPreviewImages = initialData.images.map(file => ({
          file,
          url: URL.createObjectURL(file)
        }));
        setPreviewImages(newPreviewImages);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [amenity]: !formData.amenities[amenity]
      }
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Generate preview URLs
    const newPreviewImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    setPreviewImages([...previewImages, ...newPreviewImages]);
    
    setFormData({
      ...formData,
      images: [...formData.images, ...files]
    });
  };

  const handleRemoveImage = (index) => {
    // Free up the URL object to avoid memory leaks
    URL.revokeObjectURL(previewImages[index].url);
    
    const updatedPreviewImages = previewImages.filter((_, i) => i !== index);
    const updatedImages = formData.images.filter((_, i) => i !== index);
    
    setPreviewImages(updatedPreviewImages);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const handleVerificationDocUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Generate preview URLs
    const newPreviewDocs = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    setPreviewVerificationDocs([...previewVerificationDocs, ...newPreviewDocs]);
    
    setFormData({
      ...formData,
      verificationDocuments: [...formData.verificationDocuments, ...files]
    });
  };

  const handleRemoveVerificationDoc = (index) => {
    // Free up the URL object to avoid memory leaks
    URL.revokeObjectURL(previewVerificationDocs[index].url);
    
    const updatedPreviewDocs = previewVerificationDocs.filter((_, i) => i !== index);
    const updatedDocs = formData.verificationDocuments.filter((_, i) => i !== index);
    
    setPreviewVerificationDocs(updatedPreviewDocs);
    setFormData({
      ...formData,
      verificationDocuments: updatedDocs
    });
  };

  const handleToggleVerification = (e) => {
    setFormData({
      ...formData,
      requestVerification: e.target.checked
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    else if (formData.title.length < 10) newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    else if (formData.title.length > 99) newErrors.title = 'Tiêu đề không được vượt quá 99 ký tự';
    
    if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
    else if (formData.description.length < 100) newErrors.description = 'Mô tả phải có ít nhất 100 ký tự';
    else if (formData.description.length > 3000) newErrors.description = 'Mô tả không được vượt quá 3000 ký tự';
    
    if (!formData.price) newErrors.price = 'Vui lòng nhập giá';
    if (!formData.area) newErrors.area = 'Vui lòng nhập diện tích';
    if (!formData.location.trim()) newErrors.location = 'Vui lòng nhập địa chỉ';
    if (!formData.category) newErrors.category = 'Vui lòng chọn loại';
    if (!formData.type) newErrors.type = 'Vui lòng chọn loại bất động sản';
    
    // Specific validations based on property type
    if (formData.type === 'apartment' || formData.type === 'house' || formData.type === 'villa') {
      if (!formData.bedrooms) newErrors.bedrooms = 'Vui lòng nhập số phòng ngủ';
      if (!formData.bathrooms) newErrors.bathrooms = 'Vui lòng nhập số phòng tắm';
      if (!formData.direction) newErrors.direction = 'Vui lòng chọn hướng nhà';
    }
    
    if (formData.type === 'house' || formData.type === 'villa' || formData.type === 'shophouse') {
      if (!formData.floors) newErrors.floors = 'Vui lòng nhập số tầng';
    }
    
    if (formData.type !== 'apartment') {
      if (!formData.frontage) newErrors.frontage = 'Vui lòng nhập mặt tiền (m)';
    }
    
    // Contact validation
    if (!formData.contactName.trim()) newErrors.contactName = 'Vui lòng nhập tên liên hệ';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Vui lòng nhập số điện thoại';
    
    // Phone validation
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (formData.contactPhone && !phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Số điện thoại không hợp lệ';
    }
    
    // Email validation
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email không hợp lệ';
    }
    
    // Image validation
    if (formData.images.length < 3) {
      newErrors.images = 'Vui lòng tải lên ít nhất 3 hình ảnh';
    } else if (formData.images.length > 24) {
      newErrors.images = 'Không được vượt quá 24 hình ảnh';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    if (validateForm()) {
      // Count selected amenities
      const selectedAmenities = Object.values(formData.amenities).filter(value => value).length;
      
      const enrichedFormData = {
        ...formData,
        amenitiesCount: selectedAmenities,
        createdAt: new Date().toISOString()
      };
      
      onSubmit(enrichedFormData);
    } else {
      setIsSubmitting(false);
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstError);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const handleNext = () => {
    // Only validate the current step
    let stepValid = true;
    const newErrors = {};
    
    if (activeStep === 0) {
      // Basic info validation
      if (!formData.title.trim()) {
        newErrors.title = 'Vui lòng nhập tiêu đề';
        stepValid = false;
      } else if (formData.title.length < 10) {
        newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
        stepValid = false;
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Vui lòng nhập mô tả';
        stepValid = false;
      }
      
      if (!formData.category) {
        newErrors.category = 'Vui lòng chọn danh mục';
        stepValid = false;
      }
      
      if (!formData.type) {
        newErrors.type = 'Vui lòng chọn loại bất động sản';
        stepValid = false;
      }
    } else if (activeStep === 1) {
      // Details validation
      if (!formData.price) {
        newErrors.price = 'Vui lòng nhập giá';
        stepValid = false;
      }
      
      if (!formData.area) {
        newErrors.area = 'Vui lòng nhập diện tích';
        stepValid = false;
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Vui lòng nhập địa chỉ';
        stepValid = false;
      }
    } else if (activeStep === 2) {
      // Images validation
      if (formData.images.length < 3) {
        newErrors.images = 'Vui lòng tải lên ít nhất 3 hình ảnh';
        stepValid = false;
      }
    } else if (activeStep === 3) {
      // Contact validation
      if (!formData.contactName.trim()) {
        newErrors.contactName = 'Vui lòng nhập tên liên hệ';
        stepValid = false;
      }
      
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'Vui lòng nhập số điện thoại';
        stepValid = false;
      } else {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(formData.contactPhone)) {
          newErrors.contactPhone = 'Số điện thoại không hợp lệ';
          stepValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    
    if (stepValid) {
      setActiveStep((prevStep) => prevStep + 1);
      setFormProgress((prevProgress) => prevProgress + 25);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setFormProgress((prevProgress) => prevProgress - 25);
    window.scrollTo(0, 0);
  };
  
  const steps = [
    {
      label: 'Thông tin cơ bản',
      description: 'Nhập các thông tin cơ bản về bất động sản',
      icon: <Info />
    },
    {
      label: 'Thông tin chi tiết',
      description: 'Mô tả chi tiết về bất động sản',
      icon: <Description />
    },
    {
      label: 'Hình ảnh',
      description: 'Tải lên hình ảnh bất động sản',
      icon: <PermMedia />
    },
    {
      label: 'Thông tin liên hệ',
      description: 'Thông tin người đăng tin',
      icon: <ContactPhone />
    },
    {
      label: 'Xác nhận',
      description: 'Xem lại và đăng tin',
      icon: <Assignment />
    }
  ];

  return (
    <Box sx={{ 
      maxWidth: 900, 
      mx: 'auto', 
      mt: 4, 
      mb: 8,
      position: 'relative'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f9f9f9)'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme.palette.primary.main
          }}
        >
          {initialData ? 'Chỉnh sửa bài đăng' : 'Đăng tin bất động sản'}
        </Typography>
        
        {/* Progress Bar */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ position: 'relative', height: '8px', backgroundColor: '#eee', borderRadius: '4px' }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                height: '100%', 
                width: `${formProgress}%`, 
                backgroundColor: theme.palette.primary.main,
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            {steps.map((step, index) => (
              <Box 
                key={index}
                sx={{ 
                  textAlign: 'center', 
                  width: '20%',
                  opacity: activeStep >= index ? 1 : 0.5,
                  cursor: 'pointer',
                  px: { xs: 0.5, sm: 1 }
                }}
                onClick={() => activeStep > index && setActiveStep(index)}
              >
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    display: 'block',
                    whiteSpace: 'normal',
                    lineHeight: 1.2
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Info sx={{ mr: 1 }} /> Thông tin cơ bản
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="title"
                  fullWidth
                  label="Tiêu đề"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={!!errors.title}
                  helperText={errors.title || 'Tiêu đề tối thiểu 10 ký tự, tối đa 99 ký tự'}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" color={formData.title.length >= 10 && formData.title.length <= 99 ? 'success.main' : 'error'}>
                          {formData.title.length}/99
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="description"
                  fullWidth
                  label="Mô tả chi tiết"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  required
                  error={!!errors.description}
                  helperText={errors.description || 'Mô tả các thông tin về bất động sản như: Vị trí, đặc điểm, tiện ích, tình trạng pháp lý...'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" color={formData.description.length <= 3000 ? 'success.main' : 'error'}>
                          {formData.description.length}/3000
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                  FormHelperTextProps={{
                    sx: { 
                      whiteSpace: 'normal',
                      mb: 1
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.propertyStatus}>
                  <FormLabel id="property-status-label">Nhu cầu</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="property-status-label"
                    name="propertyStatus"
                    value={formData.propertyStatus}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="for-sale" control={<Radio />} label="Bán" />
                    <FormControlLabel value="for-rent" control={<Radio />} label="Cho thuê" />
                  </RadioGroup>
                  {errors.propertyStatus && <FormHelperText>{errors.propertyStatus}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="category"
                  select
                  fullWidth
                  label="Danh mục"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  error={!!errors.category}
                  helperText={errors.category}
                >
                  {propertyCategories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="type"
                  select
                  fullWidth
                  label="Loại bất động sản"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  error={!!errors.type}
                  helperText={errors.type}
                >
                  {propertyTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {option.icon}
                        <span style={{ marginLeft: 8 }}>{option.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="projectName"
                  fullWidth
                  label="Tên dự án (nếu có)"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  helperText="Nhập tên dự án nếu bất động sản thuộc dự án"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="legalStatus"
                  select
                  fullWidth
                  label="Tình trạng pháp lý"
                  name="legalStatus"
                  value={formData.legalStatus}
                  onChange={handleChange}
                  error={!!errors.legalStatus}
                  helperText={errors.legalStatus || "Chọn tình trạng pháp lý của bất động sản"}
                  FormHelperTextProps={{
                    sx: { 
                      whiteSpace: 'normal',
                      mb: 1
                    }
                  }}
                >
                  {legalStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          )}
          
          {/* Step 2: Detailed Information */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Description sx={{ mr: 1 }} /> Thông tin chi tiết
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="location"
                  fullWidth
                  label="Địa chỉ"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  error={!!errors.location}
                  helperText={errors.location || "Nhập địa chỉ đầy đủ của bất động sản"}
                  FormHelperTextProps={{
                    sx: { 
                      whiteSpace: 'normal'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="price"
                  fullWidth
                  label="Giá (VNĐ)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    endAdornment: formData.propertyStatus === 'for-rent' ? 
                      <InputAdornment position="end">/tháng</InputAdornment> : 
                      <InputAdornment position="end">VNĐ</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="area"
                  fullWidth
                  label="Diện tích (m²)"
                  name="area"
                  type="number"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  error={!!errors.area}
                  helperText={errors.area}
                  InputProps={{ 
                    inputProps: { min: 0 },
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>
                  }}
                />
              </Grid>
              
              {/* Show fields based on property type */}
              {(formData.type === 'apartment' || formData.type === 'house' || formData.type === 'villa') && (
                <>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      id="bedrooms"
                      fullWidth
                      label="Số phòng ngủ"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      error={!!errors.bedrooms}
                      helperText={errors.bedrooms}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <TextField
                      id="bathrooms"
                      fullWidth
                      label="Số phòng tắm"
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      error={!!errors.bathrooms}
                      helperText={errors.bathrooms}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <TextField
                      id="direction"
                      select
                      fullWidth
                      label="Hướng nhà"
                      name="direction"
                      value={formData.direction}
                      onChange={handleChange}
                      error={!!errors.direction}
                      helperText={errors.direction}
                    >
                      {directionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <TextField
                      id="balconyDirection"
                      select
                      fullWidth
                      label="Hướng ban công"
                      name="balconyDirection"
                      value={formData.balconyDirection}
                      onChange={handleChange}
                    >
                      {directionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
              
              {(formData.type === 'house' || formData.type === 'villa' || formData.type === 'shophouse') && (
                <>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      id="floors"
                      fullWidth
                      label="Số tầng"
                      name="floors"
                      type="number"
                      value={formData.floors}
                      onChange={handleChange}
                      error={!!errors.floors}
                      helperText={errors.floors}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <TextField
                      id="frontage"
                      fullWidth
                      label="Mặt tiền (m)"
                      name="frontage"
                      type="number"
                      value={formData.frontage}
                      onChange={handleChange}
                      error={!!errors.frontage}
                      helperText={errors.frontage}
                      InputProps={{ 
                        inputProps: { min: 0, step: 0.1 },
                        endAdornment: <InputAdornment position="end">m</InputAdornment>
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <TextField
                      id="entryWidth"
                      fullWidth
                      label="Đường vào (m)"
                      name="entryWidth"
                      type="number"
                      value={formData.entryWidth}
                      onChange={handleChange}
                      InputProps={{ 
                        inputProps: { min: 0, step: 0.1 },
                        endAdornment: <InputAdornment position="end">m</InputAdornment>
                      }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="interiorStatus"
                  select
                  fullWidth
                  label="Tình trạng nội thất"
                  name="interiorStatus"
                  value={formData.interiorStatus}
                  onChange={handleChange}
                >
                  {interiorStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Tiện ích</Typography>
                <FormGroup row>
                  {amenitiesOptions.map((amenity) => (
                    <Grid item xs={12} sm={6} md={4} key={amenity.value}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={formData.amenities[amenity.value]}
                            onChange={() => handleAmenityChange(amenity.value)}
                            icon={amenity.icon}
                            checkedIcon={amenity.icon}
                            color="primary"
                          />
                        }
                        label={amenity.label}
                        sx={{
                          mr: 0,
                          '& .MuiFormControlLabel-label': {
                            whiteSpace: 'nowrap'
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          )}
          
          {/* Step 3: Images */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <PermMedia sx={{ mr: 1 }} /> Hình ảnh
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    border: '2px dashed',
                    borderColor: errors.images ? 'error.main' : 'primary.light',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternate />}
                    fullWidth
                    sx={{ py: 5 }}
                  >
                    Tải lên hình ảnh
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Vui lòng tải lên ít nhất 3 hình ảnh (tối đa 24 hình)
                  </Typography>
                  {errors.images && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {errors.images}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              {previewImages.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      Đã tải lên {previewImages.length} hình
                      {previewImages.length >= 3 && previewImages.length <= 24 ? (
                        <Check color="success" sx={{ ml: 1 }} />
                      ) : (
                        <Close color="error" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <ImageList cols={3} gap={12} sx={{ maxHeight: 500, overflow: 'auto' }}>
                      {previewImages.map((image, index) => (
                        <ImageListItem key={index} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
                          <img
                            src={image.url}
                            alt={`Preview ${index + 1}`}
                            loading="lazy"
                            style={{ height: '100%', objectFit: 'cover' }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'rgba(0,0,0,0.3)',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': { opacity: 1 }
                            }}
                          >
                            <IconButton
                              onClick={() => handleRemoveImage(index)}
                              sx={{ 
                                color: 'white',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VerifiedUser color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Xác thực tin đăng
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.requestVerification} 
                      onChange={handleToggleVerification}
                      color="primary"
                    />
                  }
                  label="Tôi muốn xác thực tin đăng này"
                  sx={{ mb: 2 }}
                />
                
                {formData.requestVerification && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Tin đăng được xác thực sẽ có thêm dấu hiệu xác thực và được ưu tiên hiển thị. Vui lòng tải lên hình ảnh giấy tờ chứng minh quyền sở hữu/đại diện (Sổ đỏ, Hợp đồng đại lý, Giấy ủy quyền,...). Thông tin này chỉ được sử dụng để xác thực và sẽ được bảo mật.
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        border: '2px dashed',
                        borderColor: 'primary.light',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'background.paper',
                        mb: 2
                      }}
                    >
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<VerifiedUser />}
                        color="primary"
                        sx={{ py: 3 }}
                      >
                        Tải lên giấy tờ xác thực
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleVerificationDocUpload}
                        />
                      </Button>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Hỗ trợ định dạng: JPG, PNG, JPEG. Kích thước tối đa: 5MB/ảnh
                      </Typography>
                    </Box>
                    
                    {previewVerificationDocs.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Đã tải lên {previewVerificationDocs.length} giấy tờ
                        </Typography>
                        <ImageList cols={3} gap={12} sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {previewVerificationDocs.map((doc, index) => (
                            <ImageListItem key={index} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
                              <img
                                src={doc.url}
                                alt={`Giấy tờ ${index + 1}`}
                                loading="lazy"
                                style={{ height: '100%', objectFit: 'cover' }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  background: 'rgba(0,0,0,0.3)',
                                  opacity: 0,
                                  transition: 'opacity 0.3s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  '&:hover': { opacity: 1 }
                                }}
                              >
                                <IconButton
                                  onClick={() => handleRemoveVerificationDoc(index)}
                                  sx={{ 
                                    color: 'white',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </ImageListItem>
                          ))}
                        </ImageList>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          <strong>Lưu ý:</strong> Thông tin bạn cung cấp chỉ được sử dụng để xác thực tin đăng và sẽ được bảo mật. 
                          Vui lòng che đi các thông tin nhạy cảm không cần thiết trên giấy tờ (số CMND, địa chỉ cá nhân, v.v.).
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          )}
          
          {/* Step 4: Contact Information */}
          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <ContactPhone sx={{ mr: 1 }} /> Thông tin liên hệ
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="contactName"
                  fullWidth
                  label="Tên liên hệ"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  error={!!errors.contactName}
                  helperText={errors.contactName}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  id="contactPhone"
                  fullWidth
                  label="Số điện thoại"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone || 'Nhập đúng định dạng số điện thoại Việt Nam'}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="contactEmail"
                  fullWidth
                  label="Email liên hệ"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="contactAddress"
                  fullWidth
                  label="Địa chỉ liên hệ"
                  name="contactAddress"
                  value={formData.contactAddress}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}
          
          {/* Step 5: Review & Submit */}
          {activeStep === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 1 }} /> Xem lại và đăng tin
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{formData.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{formData.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        label={formData.propertyStatus === 'for-sale' ? 'Bán' : 'Cho thuê'} 
                        color="primary" 
                        size="small"
                      />
                      <Chip 
                        label={propertyTypes.find(t => t.value === formData.type)?.label} 
                        variant="outlined" 
                        size="small"
                      />
                      <Chip 
                        label={`${formData.area} m²`} 
                        variant="outlined" 
                        size="small"
                      />
                      {formData.bedrooms && <Chip label={`${formData.bedrooms} phòng ngủ`} variant="outlined" size="small" />}
                    </Box>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      {new Intl.NumberFormat('vi-VN').format(formData.price)} VNĐ
                      {formData.propertyStatus === 'for-rent' && '/tháng'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {formData.description.substring(0, 250)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ContactPhone fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">{formData.contactName}: {formData.contactPhone}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {previewImages.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Hình ảnh ({previewImages.length})</Typography>
                  <ImageList cols={4} gap={8} sx={{ maxHeight: 200 }}>
                    {previewImages.slice(0, 4).map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Tin đăng sẽ được kiểm duyệt trước khi hiển thị. Vui lòng đảm bảo thông tin chính xác và tuân thủ quy định.
                </Alert>
              </Grid>
              
              {formData.requestVerification && (
                <Grid item xs={12}>
                  <Alert 
                    icon={<VerifiedUser />} 
                    severity="info"
                    sx={{ mb: 2 }}
                  >
                    Bạn đã yêu cầu xác thực tin đăng. Tin đăng sẽ được đánh dấu là "Đang xác thực" cho đến khi được quản trị viên xác nhận.
                    {previewVerificationDocs.length === 0 && (
                      <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                        <strong>Chú ý:</strong> Bạn chưa tải lên giấy tờ xác thực. Vui lòng quay lại bước Hình ảnh để tải lên giấy tờ.
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              variant="outlined"
              startIcon={<ArrowBack />}
              disabled={activeStep === 0}
            >
              Quay lại
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Đăng tin'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{ minWidth: 120 }}
              >
                Tiếp theo
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PostForm;