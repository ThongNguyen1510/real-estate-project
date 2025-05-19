import React, { useState, useEffect, FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Divider,
  FormHelperText,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Card,
  CardMedia,
  Dialog
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddIcon,
  CloudUpload as CloudUploadIcon,
  LocationOn as MapIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { propertyService, locationService } from '../services/api';
import { geocodeAddress } from '../services/api/geocodingService';
import MapPicker from '../components/map/MapPicker';
import defaultCoordinatesConfig from '../configFixes.json';

// Define form validation interface
interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  area?: string;
  property_type?: string;
  listing_type?: string;
  city?: string;
  district?: string;
  address?: string;
}

// Define location interfaces
interface LocationItem {
  id: string | number;
  name: string;
}

// Define LocationData interface with all location properties including coordinates
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

// Function để lấy tọa độ mặc định cho địa chỉ cụ thể
const getDefaultCoordinates = (addressKey: string) => {
  try {
    const config = defaultCoordinatesConfig as any;
    if (config && config.defaultCoordinates && config.defaultCoordinates[addressKey]) {
      return {
        latitude: config.defaultCoordinates[addressKey].latitude,
        longitude: config.defaultCoordinates[addressKey].longitude,
        address: config.defaultCoordinates[addressKey].address
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading default coordinates:', error);
    return null;
  }
};

const CreateListingPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Check if we're in edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  
  // Extract property id from URL if in edit mode
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editParam = searchParams.get('edit');
    
    if (editParam) {
      setIsEditMode(true);
      setPropertyId(editParam);
    }
  }, [location]);
  
  // Load property data if in edit mode
  const loadPropertyData = async () => {
    if (propertyId) {
      try {
        setLoading(true);
        // Don't try to parseInt the propertyId here as it's already a string
        const propertyData = await propertyService.getProperty(propertyId);
        
        if (propertyData.success && propertyData.data && propertyData.data.property) {
          // Extract property data
          const property = propertyData.data.property;
          
          // Extract existing images
          let existingImages: string[] = [];
          if (propertyData.data.images && Array.isArray(propertyData.data.images)) {
            existingImages = propertyData.data.images;
          } else if (property.images && typeof property.images === 'string') {
            try {
              existingImages = JSON.parse(property.images);
            } catch (e) {
              console.error('Error parsing images JSON:', e);
            }
          }
          
          // Set existing images - use directly in setPreviewImages
          setPreviewImages(existingImages);
          
          // Format the property data to match form structure
          setFormData({
            title: property.title || '',
            description: property.description || '',
            price: property.price ? property.price.toString() : '',
            area: property.area ? property.area.toString() : '',
            property_type: property.property_type || '',
            bedrooms: property.bedrooms ? property.bedrooms.toString() : '',
            bathrooms: property.bathrooms ? property.bathrooms.toString() : '',
            listing_type: property.listing_type || 'sale',
            city: property.city || '',
            city_name: property.city_name || property.city || '',
            district: property.district || '',
            district_name: property.district_name || property.district || '',
            ward: property.ward || '',
            ward_name: property.ward_name || property.ward || '',
            address: property.address || '',
            contact_info: property.contact_info || user?.phone || '',
            amenities: property.amenities ? property.amenities.split(',') : [],
            latitude: property.latitude || null,
            longitude: property.longitude || null
          });
          
          // Cập nhật giá tiền đã định dạng
          if (property.price) {
            setDisplayPrice(formatPriceInput(property.price.toString()));
          }
          
          // Load location data
          if (property.city) {
            // Fetch districts for city
            setLoadingDistricts(true);
            try {
              const districtResponse = await locationService.getDistricts(property.city);
              if (districtResponse && districtResponse.success && Array.isArray(districtResponse.data)) {
                const formattedDistricts = districtResponse.data
                  .filter((district: any) => district)
                  .map((district: any) => ({
                    id: district.id?.toString() || district.name?.toString() || '',
                    name: district.name?.toString() || district.id?.toString() || ''
                  }))
                  .filter((district: LocationItem) => district.id && district.name);
                
                setDistricts(formattedDistricts);
                
                // Fetch wards if district is available
                if (property.district) {
                  setLoadingWards(true);
                  try {
                    const wardResponse = await locationService.getWards(property.district);
                    if (wardResponse && wardResponse.success && Array.isArray(wardResponse.data)) {
                      const formattedWards = wardResponse.data
                        .filter((ward: any) => ward)
                        .map((ward: any) => ({
                          id: ward.id?.toString() || ward.name?.toString() || '',
                          name: ward.name?.toString() || ward.id?.toString() || ''
                        }))
                        .filter((ward: LocationItem) => ward.id && ward.name);
                      
                      setWards(formattedWards);
                    }
                  } catch (error) {
                    console.error('Error loading wards:', error);
                  } finally {
                    setLoadingWards(false);
                  }
                }
              }
            } catch (error) {
              console.error('Error loading districts:', error);
            } finally {
              setLoadingDistricts(false);
            }
          }
        } else {
          setErrorMessage('Không thể tải thông tin bất động sản');
          navigate('/user/my-properties');
        }
      } catch (err: any) {
        console.error('Error loading property:', err);
        setErrorMessage(err.message || 'Có lỗi xảy ra khi tải thông tin bất động sản');
        navigate('/user/my-properties');
      } finally {
        setLoading(false);
      }
    }
  };
  
  useEffect(() => {
    loadPropertyData();
  }, [propertyId, navigate]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    listing_type: 'sale', // Default to sale
    city: '',
    city_name: '',
    district: '',
    district_name: '',
    ward: '',
    ward_name: '',
    address: '',
    contact_info: user?.phone || '',
    amenities: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null
  });
  
  // Thêm state để hiển thị giá tiền định dạng có dấu phẩy
  const [displayPrice, setDisplayPrice] = useState('');
  
  // Images state
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Location data
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Location loading states
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = ['Thông tin cơ bản', 'Vị trí', 'Hình ảnh & Tiện ích', 'Xác nhận'];
  
  // Available amenities
  const availableAmenities = [
    'Bể bơi', 'Phòng gym', 'Bảo vệ 24/7', 'Sân vườn', 
    'Ban công', 'Thang máy', 'Máy lạnh', 'Nội thất', 
    'Chỗ đậu xe', 'Internet', 'Truyền hình cáp', 'Điện dự phòng'
  ];
  
  // Add these state variables near the other state declarations
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Add this state variable back near the other UI state variables
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Thêm state cho việc hiển thị modal chọn vị trí trên bản đồ
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [mapPosition, setMapPosition] = useState<{lat: number, lng: number}>({
    lat: 10.8231, // Mặc định TP.HCM
    lng: 106.6297
  });
  
  // First, add a new state for the confirmation dialog
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
  
  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        console.log('Fetching cities from API');
        const response = await locationService.getCities();
        if (response && response.success) {
          console.log('Original cities data:', response.data);
          
          // Kiểm tra cấu trúc dữ liệu
          if (!Array.isArray(response.data)) {
            console.error('Cities data is not an array:', response.data);
            setErrorMessage('Dữ liệu tỉnh/thành phố không đúng định dạng');
            return;
          }
          
          // Format dữ liệu để đảm bảo có name và id dạng chuỗi
          const formattedCities = response.data
            .filter((city: any) => city) // Lọc bỏ null/undefined
            .map((city: any) => {
              // Kiểm tra nếu city là null hoặc undefined
              if (!city) {
                console.error('Found null/undefined city in data');
                return { id: '', name: 'Lỗi dữ liệu' };
              }
              
              // Đảm bảo city.id và city.name tồn tại
              const id = city.id ? city.id.toString() : '';
              const name = city.name ? city.name.toString() : '';
              
              return { id, name };
            })
            .filter((city: LocationItem) => city.id && city.name); // Lọc bỏ các item không hợp lệ
          
          setCities(formattedCities);
          console.log('Formatted cities data loaded:', formattedCities.length);
        } else {
          setErrorMessage('Không thể tải danh sách tỉnh/thành phố');
          console.error('Failed to load cities:', response?.message);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setErrorMessage('Lỗi khi tải danh sách tỉnh/thành phố');
      } finally {
        setLoadingCities(false);
      }
    };
    
    fetchCities();
  }, []);
  
  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.city) {
        setDistricts([]);
        setWards([]); // Clear wards when city changes
        return;
      }
      
      setLoadingDistricts(true);
      try {
        console.log('Fetching districts for city ID:', formData.city);
        const response = await locationService.getDistricts(formData.city);
        if (response && response.success) {
          console.log('Original districts data:', response.data);
          
          // Kiểm tra cấu trúc dữ liệu
          if (!Array.isArray(response.data)) {
            console.error('Districts data is not an array:', response.data);
            setErrorMessage('Dữ liệu quận/huyện không đúng định dạng');
            return;
          }
          
          // Format dữ liệu để đảm bảo có name và id dạng chuỗi
          const formattedDistricts = response.data
            .filter((district: any) => district) // Lọc bỏ null/undefined  
            .map((district: any) => {
              // Kiểm tra nếu district là null hoặc undefined
              if (!district) {
                console.error('Found null/undefined district in data');
                return { id: '', name: 'Lỗi dữ liệu' };
              }
              
              // Đảm bảo district.id và district.name tồn tại
              const id = district.id ? district.id.toString() : district.name ? district.name.toString() : '';
              const name = district.name ? district.name.toString() : district.id ? district.id.toString() : '';
              
              return { id, name };
            })
            .filter((district: any) => district.id && district.name); // Lọc bỏ các item không hợp lệ
          
          setDistricts(formattedDistricts);
          console.log('Formatted districts data loaded:', formattedDistricts.length);
          
          // Trong chế độ chỉnh sửa, nếu đã có district được chọn, tìm tên của nó
          if (isEditMode && formData.district) {
            const selectedDistrict = formattedDistricts.find((d: LocationItem) => d.id === formData.district);
            if (selectedDistrict) {
              // Cập nhật district_name nếu tìm thấy
              setFormData(prev => ({
                ...prev,
                district_name: selectedDistrict.name
              }));
            }
          }
        } else {
          setErrorMessage('Không thể tải danh sách quận/huyện');
          console.error('Failed to load districts:', response?.message);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        setErrorMessage('Lỗi khi tải danh sách quận/huyện');
      } finally {
        setLoadingDistricts(false);
      }
    };
    
    fetchDistricts();
    
    // Chỉ reset district và ward nếu không phải đang ở chế độ chỉnh sửa hoặc đang thay đổi city
    if (!isEditMode || formData.district === '') {
      setFormData(prev => ({ ...prev, district: '', district_name: '', ward: '', ward_name: '' }));
      setWards([]); // Clear wards when city changes
    }
  }, [formData.city, isEditMode]);
  
  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.district) {
        setWards([]);
        return;
      }
      
      setLoadingWards(true);
      try {
        console.log('Fetching wards for district ID:', formData.district);
        const response = await locationService.getWards(formData.district);
        if (response && response.success) {
          console.log('Original wards data:', response.data);
          
          // Kiểm tra cấu trúc dữ liệu
          if (!Array.isArray(response.data)) {
            console.error('Wards data is not an array:', response.data);
            setErrorMessage('Dữ liệu phường/xã không đúng định dạng');
            return;
          }
          
          // Format dữ liệu để đảm bảo có name và id dạng chuỗi
          const formattedWards = response.data
            .filter((ward: any) => ward) // Lọc bỏ null/undefined
            .map((ward: any) => {
              // Kiểm tra nếu ward là null hoặc undefined
              if (!ward) {
                console.error('Found null/undefined ward in data');
                return { id: '', name: 'Lỗi dữ liệu' };
              }
              
              // Đảm bảo ward.id và ward.name tồn tại
              const id = ward.id ? ward.id.toString() : ward.name ? ward.name.toString() : '';
              const name = ward.name ? ward.name.toString() : ward.id ? ward.id.toString() : '';
              
              return { id, name };
            })
            .filter((ward: any) => ward.id && ward.name); // Lọc bỏ các item không hợp lệ
          
          setWards(formattedWards);
          console.log('Formatted wards data loaded:', formattedWards.length);
          
          // Trong chế độ chỉnh sửa, nếu đã có ward được chọn, tìm tên của nó
          if (isEditMode && formData.ward) {
            const selectedWard = formattedWards.find((w: LocationItem) => w.id === formData.ward);
            if (selectedWard) {
              // Cập nhật ward_name nếu tìm thấy
              setFormData(prev => ({
                ...prev,
                ward_name: selectedWard.name
              }));
            }
          }
        } else {
          setErrorMessage('Không thể tải danh sách phường/xã');
          console.error('Failed to load wards:', response?.message);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
        setErrorMessage('Lỗi khi tải danh sách phường/xã');
      } finally {
        setLoadingWards(false);
      }
    };
    
    fetchWards();
    
    // Chỉ reset ward nếu không phải đang ở chế độ chỉnh sửa hoặc đang thay đổi district
    if (!isEditMode || formData.ward === '') {
      setFormData(prev => ({ ...prev, ward: '', ward_name: '' }));
    }
  }, [formData.district, isEditMode]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    // Bỏ qua các trường địa điểm đã được xử lý riêng
    if (name === 'city' || name === 'district' || name === 'ward') {
      return;
    }
    
    // Tăng cường log để debug trong trường hợp cần thiết
    console.log(`Field changed: ${name}, value:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Handle amenities selection
  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      if (prev.amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: prev.amenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...prev.amenities, amenity]
        };
      }
    });
  };
  
  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviewImages = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    // Reset file input
    e.target.value = '';
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Thêm validation yêu cầu tọa độ trước khi submit
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.title) errors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.description) errors.description = 'Vui lòng nhập mô tả';
    if (!formData.price) errors.price = 'Vui lòng nhập giá';
    if (!formData.area) errors.area = 'Vui lòng nhập diện tích';
    if (!formData.property_type) errors.property_type = 'Vui lòng chọn loại bất động sản';
    if (!formData.city) errors.city = 'Vui lòng chọn thành phố';
    if (!formData.district) errors.district = 'Vui lòng chọn quận/huyện';
    if (!formData.address) errors.address = 'Vui lòng nhập địa chỉ chi tiết';
    
    // Thêm validation cho tọa độ vị trí
    if (formData.latitude === null || formData.longitude === null) {
      errors.address = 'Vui lòng chọn vị trí chính xác trên bản đồ';
      setShowMapPicker(true); // Hiển thị bản đồ để người dùng chọn vị trí
      setErrorMessage('Vui lòng chọn vị trí chính xác trên bản đồ trước khi đăng tin');
    }
    
    // Validate images
    if (images.length === 0 && previewImages.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất một hình ảnh');
      // If we're at step 3 (confirmation) but have no images, go back to step 2
      if (activeStep === 3) {
        setActiveStep(2);
      }
      return false;
    }
    
    setErrors(errors);
    
    // If there are errors, scroll to the top to show the error message
    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step
    let isValid = true;
    
    if (activeStep === 0) {
      // Validate basic info
      if (!formData.title || !formData.description || !formData.price || 
          !formData.area || !formData.property_type || !formData.listing_type) {
        isValid = false;
        setErrorMessage('Vui lòng điền đầy đủ thông tin cơ bản');
      }
    } else if (activeStep === 1) {
      // Validate location
      if (!formData.city || !formData.district || !formData.address) {
        isValid = false;
        setErrorMessage('Vui lòng điền đầy đủ thông tin địa chỉ');
      }
    } else if (activeStep === 2) {
      // Validate images
      if (images.length === 0) {
        isValid = false;
        setErrorMessage('Vui lòng tải lên ít nhất một hình ảnh');
      }
    }
    
    if (isValid) {
      setErrorMessage(null);
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setErrorMessage(null);
    setActiveStep(prev => prev - 1);
  };
  
  // Format currency for display
  const formatCurrency = (value: string): string => {
    const numberValue = parseInt(value.replace(/[^\d]/g, ''), 10);
    if (isNaN(numberValue)) return '';
    
    // Hiển thị theo đơn vị lớn
    if (numberValue >= 1000000000) {
      return (numberValue / 1000000000).toLocaleString('vi-VN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }) + ' tỷ';
    } else if (numberValue >= 1000000) {
      return (numberValue / 1000000).toLocaleString('vi-VN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }) + ' triệu';
    } else if (numberValue >= 1000) {
      return (numberValue / 1000).toLocaleString('vi-VN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }) + ' nghìn';
    } else {
      return numberValue.toLocaleString('vi-VN') + ' đồng';
    }
  };
  
  // Định dạng giá tiền khi nhập vào với dấu phẩy ngăn cách hàng nghìn
  const formatPriceInput = (inputValue: string): string => {
    // Loại bỏ tất cả các ký tự không phải số
    const rawValue = inputValue.replace(/[^\d]/g, '');
    if (!rawValue) return '';
    
    // Chuyển thành số và định dạng với dấu phẩy ngăn cách hàng nghìn
    return Number(rawValue).toLocaleString('vi-VN');
  };
  
  // Add the uploadSelectedImages function before the handleSubmit function
  const uploadSelectedImages = async (propertyId: string | number) => {
    try {
      // Create FormData
      const formData = new FormData();
      
      // Append all images
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      // Upload images
      const uploadResponse = await propertyService.uploadImages(propertyId.toString(), formData);
      
      if (!uploadResponse.success) {
        setSubmitError('Tải lên hình ảnh không thành công: ' + uploadResponse.message);
      }
      
      return uploadResponse.success;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setSubmitError('Lỗi khi tải lên hình ảnh: ' + error.message);
      return false;
    }
  };
  
  // Thêm hàm mới để xử lý tọa độ
  const getValidCoordinates = () => {
    // Ưu tiên lấy từ formData
    if (formData.latitude && formData.longitude) {
      return {
      latitude: formData.latitude,
      longitude: formData.longitude
      };
    }

    // Thử lấy từ mapPosition
    if (mapPosition && typeof mapPosition.lat === 'number' && typeof mapPosition.lng === 'number') {
      return {
        latitude: mapPosition.lat,
        longitude: mapPosition.lng
      };
    }
    
    // Nếu là địa chỉ Hoàng Minh Giám, dùng tọa độ mặc định
    if (formData.address.toLowerCase().includes('hoàng minh giám')) {
      return {
        latitude: 10.79695,
        longitude: 106.68820
      };
    }

    return null;
  };

  // Hàm xử lý khi người dùng chọn vị trí trên bản đồ
  const handleMapPositionChange = (position: {lat: number, lng: number}) => {
    console.log('User selected map position:', position);
    
    if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
      console.error('Invalid position received:', position);
      return;
    }

    // Update map position state
    setMapPosition(position);

    // IMPORTANT: Immediately update formData with the new coordinates
    // Use a callback form of setState to ensure we're working with the latest state
    setFormData(prevState => ({
      ...prevState,
      latitude: position.lat,
      longitude: position.lng
    }));
    
    console.log('Updated formData with coordinates:', {
      latitude: position.lat,
      longitude: position.lng
    });
  };
      
  // Thêm useEffect để theo dõi thay đổi của mapPosition và đảm bảo formData luôn được cập nhật
  useEffect(() => {
    if (mapPosition && typeof mapPosition.lat === 'number' && typeof mapPosition.lng === 'number') {
      console.log('mapPosition changed, updating formData:', mapPosition);
      setFormData(prev => ({
        ...prev,
        latitude: mapPosition.lat,
        longitude: mapPosition.lng
      }));
    }
  }, [mapPosition]);

  // Add confirmation handlers to the existing state declarations section
  const handleOpenConfirmation = () => {
    if (validateForm()) {
      setShowConfirmationDialog(true);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationDialog(false);
  };

  // Sửa lại phần xử lý trong handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      setErrorMessage('Vui lòng chọn vị trí trên bản đồ trước khi đăng tin.');
      setShowMapPicker(true);
      return false;
    }

    // Validate required address fields
    if (!formData.city || !formData.district || !formData.address) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin địa chỉ (Thành phố, Quận/Huyện, Địa chỉ cụ thể)');
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Get location information with both IDs and names
      const cityInfo = cities.find(c => c.id === formData.city);
      const districtInfo = districts.find(d => d.id === formData.district);
      const wardInfo = formData.ward ? wards.find(w => w.id === formData.ward) : null;

      if (!cityInfo || !districtInfo) {
        setErrorMessage('Không thể xác định thông tin địa chỉ. Vui lòng chọn lại.');
          setIsSubmitting(false);
          return;
        }
      
      // Construct detailed address components
      const streetAddress = formData.address.trim();
      const wardName = wardInfo?.name || '';
      const districtName = districtInfo.name;
      const cityName = cityInfo.name;
      
      // Create full address with proper formatting and ensure all components are included
      const addressParts = [];
      if (streetAddress) addressParts.push(streetAddress.trim());
      
      // Only add ward if available and not already in the street address
      if (wardName && !streetAddress.toLowerCase().includes(wardName.toLowerCase())) {
        // Remove duplicate "Phường" prefix if it exists
        const formattedWard = wardName.startsWith('Phường ') || wardName.startsWith('Phường') 
          ? wardName 
          : `Phường ${wardName}`;
        addressParts.push(formattedWard.trim());
      }
      
      // Add district if not already in the street address
      if (districtName && !streetAddress.toLowerCase().includes(districtName.toLowerCase())) {
        addressParts.push(districtName.trim());
      }
      
      // Add city
      addressParts.push(cityName.trim());
      
      // Join all parts with commas
      const fullAddress = addressParts.filter(Boolean).join(', ');
      
      console.log('Constructed full address:', fullAddress);
      console.log('Address components:', {
        street: streetAddress,
        ward: wardName,
        district: districtName,
        city: cityName
      });
      
      // Prepare location data with both IDs and names
      const locationData = {
        address: fullAddress,
        street: streetAddress,
        city: formData.city, // ID
        city_name: cityName, // Name
        district: formData.district, // ID
        district_name: districtName, // Name
        ward: formData.ward || '', // ID
        ward_name: wardName, // Name
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      };
      
      // Log location data for debugging
      console.log('Location data being sent:', locationData);
      console.log('Coordinates being sent:', {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      });

      // Prepare property data
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.replace(/[^\d]/g, '')) || 0,
        area: parseFloat(formData.area) || 0,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        status: formData.listing_type === 'rent' ? 'for_rent' : 'for_sale',
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        amenities: formData.amenities.join(','),
        owner_id: user?.id,
        contact_info: formData.contact_info?.trim() || user?.phone || '',
        location: locationData,
        // Also include coordinates at root level for backward compatibility
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      };
      
      // Log final data for debugging
      console.log('Final property data:', propertyData);
      
      // Send request
      if (isEditMode && propertyId) {
          const response = await propertyService.updateProperty(propertyId, propertyData);
          if (response.success) {
            if (images.length > 0) {
              await uploadSelectedImages(propertyId);
            }
            navigate(`/bat-dong-san/${propertyId}`);
          } else {
          throw new Error(response.message || 'Có lỗi xảy ra khi cập nhật bất động sản');
          }
      } else {
        const response = await propertyService.createProperty(propertyData);
        if (response.success) {
          if (images.length > 0) {
            await uploadSelectedImages(response.data.id);
          }
          navigate(`/bat-dong-san/${response.data.id}`);
        } else {
          throw new Error(response.message || 'Có lỗi xảy ra khi tạo bất động sản');
        }
      }
    } catch (error: any) {
      console.error('Error submitting property:', error);
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message || error.message
        });
      }
        setSubmitError(error.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Hàm geolocate để định vị người dùng hiện tại
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Hàm tìm kiếm tọa độ từ địa chỉ và cập nhật map
  const searchLocation = async () => {
    if (!formData.address || !formData.district || !formData.city) {
      setErrorMessage('Vui lòng nhập đầy đủ địa chỉ trước khi tìm vị trí');
      return;
    }

    const fullAddress = [
      formData.address,
      formData.ward_name,
      formData.district_name,
      formData.city_name
    ].filter(Boolean).join(', ');

    console.log('Geocoding address for map:', fullAddress);

    try {
      setLoading(true);
      const geocodeResult = await geocodeAddress(fullAddress);

      if (geocodeResult.success && geocodeResult.data) {
        console.log('Geocoding successful:', geocodeResult.data);
        const newPosition = {
          lat: geocodeResult.data.latitude,
          lng: geocodeResult.data.longitude
        };
        
        setMapPosition(newPosition);
        setFormData(prev => ({
          ...prev,
          latitude: geocodeResult.data?.latitude || null,
          longitude: geocodeResult.data?.longitude || null
        }));
        
        // Mở map picker sau khi đã tìm được vị trí
        setShowMapPicker(true);
      } else {
        setErrorMessage('Không thể tìm thấy vị trí cho địa chỉ này. Vui lòng chọn thủ công trên bản đồ.');
        setShowMapPicker(true); // Vẫn hiển thị bản đồ để người dùng chọn thủ công
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      setErrorMessage('Có lỗi xảy ra khi tìm vị trí. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm đóng map picker
  const handleCloseMapPicker = () => {
    setShowMapPicker(false);
  };

  // Hàm lưu vị trí đã chọn trên bản đồ
  const handleSaveMapPosition = () => {
    console.log('Saving map position:', mapPosition);
    // Đảm bảo mapPosition có giá trị hợp lệ
    if (mapPosition && typeof mapPosition.lat === 'number' && typeof mapPosition.lng === 'number') {
      const lat = Number(mapPosition.lat);
      const lng = Number(mapPosition.lng);
      
      // Kiểm tra giá trị sau khi chuyển đổi
      if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates after Number conversion:', { lat, lng });
        setErrorMessage('Tọa độ không hợp lệ. Vui lòng chọn lại vị trí trên bản đồ.');
        return;
      }
      
      // Cập nhật formData với tọa độ mới
      setFormData(prevState => {
        const newState = {
          ...prevState,
        latitude: lat,
        longitude: lng
      };
        console.log('Updated formData with new coordinates:', newState);
        return newState;
      });
      
      // Hiển thị thông báo thành công
      setErrorMessage(null);
      alert(`Đã lưu tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setShowMapPicker(false);
    } else {
      console.error('Invalid map position:', mapPosition);
      setErrorMessage('Vị trí không hợp lệ. Vui lòng chọn lại trên bản đồ.');
    }
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá"
                name="price"
                value={displayPrice}
                onChange={(e) => {
                  // Lấy giá trị từ input
                  const inputValue = e.target.value;
                  
                  // Lọc chỉ lấy số
                  const numericValue = inputValue.replace(/[^\d]/g, '');
                  
                  // Cập nhật formData với giá trị số
                  setFormData({
                    ...formData,
                    price: numericValue
                  });
                  
                  // Cập nhật displayPrice với giá trị đã định dạng
                  setDisplayPrice(formatPriceInput(numericValue));
                }}
                error={!!errors.price}
                helperText={errors.price || "Nhập giá trị bằng số, đơn vị VNĐ"}
                InputProps={{
                  endAdornment: formData.listing_type === 'rent' ? (
                    <InputAdornment position="end">/tháng</InputAdornment>
                  ) : null
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Diện tích"
                name="area"
                value={formData.area}
                onChange={handleChange}
                error={!!errors.area}
                helperText={errors.area}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.property_type}>
                <InputLabel>Loại bất động sản</InputLabel>
                <Select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  label="Loại bất động sản"
                >
                  <MenuItem value="apartment">Căn hộ chung cư</MenuItem>
                  <MenuItem value="house">Nhà riêng</MenuItem>
                  <MenuItem value="villa">Biệt thự</MenuItem>
                  <MenuItem value="land">Đất nền</MenuItem>
                  <MenuItem value="office">Văn phòng</MenuItem>
                  <MenuItem value="shop">Mặt bằng kinh doanh</MenuItem>
                </Select>
                {errors.property_type && <FormHelperText>{errors.property_type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Hình thức</InputLabel>
                <Select
                  name="listing_type"
                  value={formData.listing_type}
                  onChange={handleChange}
                  label="Hình thức"
                >
                  <MenuItem value="sale">Bán</MenuItem>
                  <MenuItem value="rent">Cho thuê</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số phòng ngủ"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số phòng tắm"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={2}>
            {/* Debug formData */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 1, 
                border: '1px dashed grey', 
                borderRadius: 1, 
                mb: 2, 
                bgcolor: '#f5f5f5', 
                fontSize: '0.75rem',
                display: process.env.NODE_ENV === 'development' && false ? 'block' : 'none'
              }}>
                <Typography variant="caption" fontWeight="bold">Debug Values:</Typography>
                <pre>
                  {JSON.stringify({ 
                    formData: {
                      city: formData.city,
                      district: formData.district,
                      ward: formData.ward
                    }, 
                    cities: {
                      count: cities.length,
                      sample: cities.slice(0, 2)
                    },
                    districts: {
                      count: districts.length,
                      sample: districts.slice(0, 2)
                    },
                    wards: {
                      count: wards.length,
                      sample: wards.slice(0, 2)
                    },
                    loadingStates: {
                      loadingCities,
                      loadingDistricts, 
                      loadingWards
                    }
                  }, null, 2)}
                </pre>
                
                {/* Test buttons */}
                <Box sx={{ 
                  mt: 1, 
                  gap: 1, 
                  display: process.env.NODE_ENV === 'development' && false ? 'flex' : 'none' 
                }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => {
                      console.log('Test: Refetching cities');
                      locationService.getCities().then(
                        data => console.log('Cities refetch result:', data)
                      );
                    }}
                  >
                    Reload Cities
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.city}>
                <InputLabel>Thành phố</InputLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    console.log('City selection changed to:', e.target.value);
                    // Tìm tên của thành phố được chọn
                    const selectedCity = cities.find(city => city.id === e.target.value);
                    const cityName = selectedCity ? selectedCity.name : '';
                    
                    // Cập nhật cả city và city_name
                    setFormData(prev => ({
                      ...prev,
                      city: e.target.value as string,
                      city_name: cityName,
                      district: '', // Reset district when city changes
                      district_name: '',
                      ward: '', // Reset ward when city changes
                      ward_name: ''
                    }));
                    
                    // Clear errors
                    if (errors.city) {
                      setErrors(prev => ({
                        ...prev,
                        city: undefined
                      }));
                    }
                  }}
                  label="Thành phố"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                  disabled={loadingCities}
                  startAdornment={
                    loadingCities ? (
                      <InputAdornment position="start">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null
                  }
                >
                  {loadingCities ? (
                    <MenuItem disabled>Đang tải...</MenuItem>
                  ) : cities.length > 0 ? (
                    cities.map(city => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Không có dữ liệu</MenuItem>
                  )}
                </Select>
                {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.district} disabled={!formData.city || loadingDistricts}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  name="district"
                  value={formData.district}
                  onChange={(e) => {
                    console.log('District selection changed to:', e.target.value);
                    // Tìm tên của quận/huyện được chọn
                    const selectedDistrict = districts.find(district => district.id === e.target.value);
                    const districtName = selectedDistrict ? selectedDistrict.name : '';
                    
                    // Cập nhật cả district và district_name
                    setFormData(prev => ({
                      ...prev,
                      district: e.target.value as string,
                      district_name: districtName,
                      ward: '', // Reset ward when district changes
                      ward_name: ''
                    }));
                    
                    // Clear errors
                    if (errors.district) {
                      setErrors(prev => ({
                        ...prev,
                        district: undefined
                      }));
                    }
                  }}
                  label="Quận/Huyện"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                  startAdornment={
                    loadingDistricts ? (
                      <InputAdornment position="start">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null
                  }
                  onClick={() => {
                    if (!formData.city) {
                      console.log('District dropdown clicked but no city selected');
                    } else if (districts.length === 0 && !loadingDistricts) {
                      console.log('District dropdown clicked but no districts loaded for city:', formData.city);
                      // Try reloading districts
                      console.log('Attempting to reload districts...');
                      setLoadingDistricts(true);
                      locationService.getDistricts(formData.city)
                        .then(response => {
                          console.log('Manual district reload response:', response);
                          if (response && response.success && Array.isArray(response.data)) {
                            const formattedDistricts = response.data
                              .filter((district: any) => district)
                              .map((district: any) => ({
                                id: district.id ? district.id.toString() : '',
                                name: district.name ? district.name.toString() : ''
                              }))
                              .filter((district: any) => district.id && district.name);
                            
                            setDistricts(formattedDistricts);
                            console.log('Manual district reload successful:', formattedDistricts.length);
                          }
                        })
                        .catch(error => {
                          console.error('Error in manual district reload:', error);
                        })
                        .finally(() => {
                          setLoadingDistricts(false);
                        });
                    }
                  }}
                >
                  {loadingDistricts ? (
                    <MenuItem disabled>Đang tải...</MenuItem>
                  ) : districts.length > 0 ? (
                    districts.map(district => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Không có dữ liệu</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.district || loadingWards}>
                <InputLabel>Phường/Xã</InputLabel>
                <Select
                  name="ward"
                  value={formData.ward}
                  onChange={(e) => {
                    console.log('Ward selection changed to:', e.target.value);
                    // Tìm tên của phường/xã được chọn
                    const selectedWard = wards.find(ward => ward.id === e.target.value);
                    const wardName = selectedWard ? selectedWard.name : '';
                    
                    // Cập nhật cả ward và ward_name
                    setFormData(prev => ({
                      ...prev,
                      ward: e.target.value as string,
                      ward_name: wardName
                    }));
                  }}
                  label="Phường/Xã"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                  startAdornment={
                    loadingWards ? (
                      <InputAdornment position="start">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null
                  }
                  onClick={() => {
                    if (!formData.district) {
                      console.log('Ward dropdown clicked but no district selected');
                    } else if (wards.length === 0 && !loadingWards) {
                      console.log('Ward dropdown clicked but no wards loaded for district:', formData.district);
                      // Try reloading wards
                      console.log('Attempting to reload wards...');
                      setLoadingWards(true);
                      locationService.getWards(formData.district)
                        .then(response => {
                          console.log('Manual ward reload response:', response);
                          if (response && response.success && Array.isArray(response.data)) {
                            const formattedWards = response.data
                              .filter((ward: any) => ward)
                              .map((ward: any) => ({
                                id: ward.id ? ward.id.toString() : '',
                                name: ward.name ? ward.name.toString() : ''
                              }))
                              .filter((ward: any) => ward.id && ward.name);
                            
                            setWards(formattedWards);
                            console.log('Manual ward reload successful:', formattedWards.length);
                          }
                        })
                        .catch(error => {
                          console.error('Error in manual ward reload:', error);
                        })
                        .finally(() => {
                          setLoadingWards(false);
                        });
                    }
                  }}
                >
                  {loadingWards ? (
                    <MenuItem disabled>Đang tải...</MenuItem>
                  ) : wards.length > 0 ? (
                    wards.map(ward => (
                      <MenuItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Không có dữ liệu</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ cụ thể"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address || 'Nhập số nhà, tên đường, khu vực,...'}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<LocationIcon />}
                  onClick={searchLocation}
                  disabled={loading || !formData.address || !formData.district || !formData.city}
                >
                  {loading ? <CircularProgress size={20} /> : 'Tìm vị trí trên bản đồ'}
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MapIcon />}
                  onClick={() => setShowMapPicker(true)}
                >
                  Chọn vị trí thủ công
                </Button>
              </Box>
              
              {/* Hiển thị tọa độ nếu đã có */}
              {formData.latitude && formData.longitude && (
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'primary.main', 
                    borderRadius: 1, 
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Đã chọn vị trí: 
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => setShowMapPicker(true)}
                  >
                    Thay đổi
                  </Button>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thông tin liên hệ"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                helperText="Số điện thoại hoặc email liên hệ"
              />
            </Grid>
            
            {/* Modal để chọn vị trí trên bản đồ */}
            <Dialog
              open={showMapPicker}
              onClose={handleCloseMapPicker}
              fullWidth
              maxWidth="md"
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Chọn vị trí chính xác trên bản đồ
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={getUserLocation}
                    startIcon={<LocationIcon />}
                    sx={{ mr: 1 }}
                  >
                    Vị trí hiện tại
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={searchLocation}
                    disabled={!formData.address || !formData.district || !formData.city}
                  >
                    Tìm theo địa chỉ
                  </Button>
                </Box>
                
                <Box sx={{ height: 400, width: '100%', mb: 2 }}>
                  <MapPicker 
                    position={mapPosition}
                    onPositionChange={handleMapPositionChange}
                  />
                </Box>
                
                {/* Hiển thị tọa độ hiện tại */}
                <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    Tọa độ đã chọn:
                  </Typography>
                  <Typography variant="body2">
                    Lat: {mapPosition.lat.toFixed(6)}, Lng: {mapPosition.lng.toFixed(6)}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {formData.latitude && formData.longitude ? '✓ Đã lưu vào form' : ''}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                  <Button onClick={handleCloseMapPicker}>
                    Hủy
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSaveMapPosition}
                    disabled={!mapPosition || !mapPosition.lat || !mapPosition.lng}
                  >
                    {formData.latitude && formData.longitude ? 'Cập nhật vị trí' : 'Lưu vị trí'}
                  </Button>
                </Box>
              </Box>
            </Dialog>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Hình ảnh
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tải lên hình ảnh bất động sản (tối đa 10 hình)
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                  disabled={images.length >= 10}
                >
                  Tải lên hình ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handleImageSelect}
                  />
                </Button>
              </Box>
              
              {/* Image previews */}
              <Grid container spacing={1}>
                {previewImages.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={image}
                        alt={`Hình ${index + 1}`}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tiện ích
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Chọn các tiện ích có sẵn của bất động sản
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {availableAmenities.map(amenity => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    clickable
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                    onClick={() => handleAmenityToggle(amenity)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );
      
      case 3:
        // Summary/Confirmation step
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Thông tin bất động sản
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formData.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                  <LocationIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {formData.address}
                  </Typography>
                </Box>
                
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {formData.listing_type === 'rent' 
                    ? `${formatCurrency(formData.price)}/tháng` 
                    : formatCurrency(formData.price)}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Diện tích:</strong> {formData.area} m²
                  </Typography>
                  
                  {formData.bedrooms && (
                    <Typography variant="body2">
                      <strong>Phòng ngủ:</strong> {formData.bedrooms}
                    </Typography>
                  )}
                  
                  {formData.bathrooms && (
                    <Typography variant="body2">
                      <strong>Phòng tắm:</strong> {formData.bathrooms}
                    </Typography>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {formData.description}
                </Typography>
                
                {formData.amenities.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Tiện ích:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.amenities.map(amenity => (
                        <Chip key={amenity} label={amenity} size="small" />
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Hình ảnh ({images.length})
              </Typography>
              
              <Grid container spacing={1}>
                {previewImages.map((image, index) => (
                  <Grid item xs={4} sm={3} md={2} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image}
                        alt={`Hình ${index + 1}`}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEditMode 
            ? 'Chỉnh sửa thông tin bất động sản của bạn' 
            : 'Đăng tin bất động sản để tiếp cận với người mua/thuê tiềm năng'}
        </Typography>
      </Paper>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Error messages */}
      {(errorMessage || submitError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage === 'Cannot read properties of undefined (reading \'id\')' ? 
            'Đang xử lý...' : 
            (errorMessage || submitError)}
        </Alert>
      )}
      
      {/* Success message - replaced with immediate redirect */}
      {submitSuccess ? null : (
        <Box component="form" onSubmit={handleSubmit}>
          {/* Step content */}
          <Box sx={{ mb: 3 }}>
            {getStepContent(activeStep)}
          </Box>
          
          {/* Step navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Quay lại
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenConfirmation}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isEditMode ? 'Xem lại & Xác nhận' : 'Xem lại & Xác nhận'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Tiếp theo
                </Button>
              )}
            </Box>
          </Box>

          {/* Confirmation Dialog */}
          <Dialog 
            open={showConfirmationDialog} 
            onClose={handleCloseConfirmation}
            maxWidth="md"
            fullWidth
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Xác nhận {isEditMode ? 'cập nhật' : 'đăng'} tin</Typography>
              
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                Bạn có chắc chắn muốn {isEditMode ? 'cập nhật' : 'đăng'} tin bất động sản này không?
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Vui lòng kiểm tra lại thông tin trước khi xác nhận. Sau khi xác nhận, tin sẽ được gửi lên hệ thống.
              </Alert>

              <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  {formData.title}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Loại BDS:</strong> {{
                    'apartment': 'Căn hộ chung cư',
                    'house': 'Nhà riêng',
                    'villa': 'Biệt thự',
                    'land': 'Đất nền',
                    'office': 'Văn phòng',
                    'shop': 'Mặt bằng kinh doanh'
                  }[formData.property_type] || formData.property_type}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Hình thức:</strong> {formData.listing_type === 'rent' ? 'Cho thuê' : 'Bán'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Giá:</strong> {formatCurrency(formData.price)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Địa chỉ:</strong> {formData.address}, {districts.find(d => d.id === formData.district)?.name || ''}, {cities.find(c => c.id === formData.city)?.name || ''}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Diện tích:</strong> {formData.area} m²
                </Typography>
                {formData.amenities.length > 0 && (
                  <Typography variant="body2">
                    <strong>Tiện ích:</strong> {formData.amenities.join(', ')}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 1 }}>
                <Button onClick={handleCloseConfirmation} variant="outlined">
                  Quay lại chỉnh sửa
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={(e) => {
                    handleCloseConfirmation();
                    handleSubmit(e as React.FormEvent);
                  }}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isEditMode ? 'Xác nhận cập nhật' : 'Xác nhận đăng tin'}
                </Button>
              </Box>
            </Box>
          </Dialog>
        </Box>
      )}
    </Container>
  );
};

export default CreateListingPage; 