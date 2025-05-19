import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken } from '../../services/api/authUtils';

const API_URL = '/api';

interface Report {
  id: number;
  property_id: number;
  property_title: string;
  user_id: number;
  user_name: string;
  reason: string;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
}

const ReportsManagementPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalReports, setTotalReports] = useState<number>(0);
  
  // Dialog state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/admin/reports`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      
      if (response.data.success) {
        // Safely set reports with empty array fallback
        setReports(response.data.data?.reports || []);
        
        // Safely set total count with proper fallbacks
        const paginationData = response.data.data?.pagination;
        setTotalReports(paginationData?.total || 0);
      } else {
        setError('Không thể tải danh sách báo cáo');
        setReports([]);
        setTotalReports(0);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setReports([]);
      setTotalReports(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || '');
    setNewStatus(report.status);
    setDialogOpen(true);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;
    
    setUpdateLoading(true);
    setUpdateError(null);
    
    try {
      const response = await axios.put(
        `${API_URL}/admin/reports/${selectedReport.id}`,
        {
          status: newStatus,
          admin_notes: adminNotes
        },
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        }
      );
      
      if (response.data.success) {
        setUpdateSuccess(true);
        
        // Update the reports list
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === selectedReport.id 
              ? { ...report, status: newStatus, admin_notes: adminNotes } 
              : report
          )
        );
      } else {
        setUpdateError(response.data.message || 'Không thể cập nhật báo cáo');
      }
    } catch (error: any) {
      console.error('Error updating report:', error);
      setUpdateError(error.message || 'Có lỗi xảy ra khi cập nhật báo cáo');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getReasonText = (reason: string): string => {
    const reasonMap: { [key: string]: string } = {
      'spam': 'Tin đăng spam/lừa đảo',
      'duplicate': 'Tin đăng trùng lặp',
      'wrong_info': 'Thông tin sai sự thật',
      'sold': 'Bất động sản đã bán/cho thuê',
      'expired': 'Tin đã hết hạn',
      'inappropriate': 'Nội dung không phù hợp',
      'other': 'Lý do khác'
    };
    
    return reasonMap[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'resolved': 'Đã xử lý',
      'rejected': 'Đã từ chối'
    };
    
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý báo cáo tin đăng
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Xem và xử lý các báo cáo từ người dùng về tin đăng bất động sản
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : reports.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">Không có báo cáo nào</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tin đăng</TableCell>
                  <TableCell>Người báo cáo</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Ngày báo cáo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>
                      <Link to={`/bat-dong-san/${report.property_id}`} target="_blank">
                        {report.property_title || `Tin #${report.property_id}`}
                      </Link>
                    </TableCell>
                    <TableCell>{report.user_name || `User #${report.user_id}`}</TableCell>
                    <TableCell>{getReasonText(report.reason)}</TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(report.status)} 
                        color={getStatusColor(report.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(report)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalReports}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </TableContainer>
      </Paper>
      
      {/* Report Detail Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedReport && (
          <>
            <DialogTitle>
              Chi tiết báo cáo #{selectedReport.id}
            </DialogTitle>
            <DialogContent dividers>
              {updateError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {updateError}
                </Alert>
              )}
              
              {updateSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Cập nhật báo cáo thành công!
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tin đăng
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <Link to={`/bat-dong-san/${selectedReport.property_id}`} target="_blank">
                      {selectedReport.property_title || `Tin #${selectedReport.property_id}`}
                    </Link>
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người báo cáo
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedReport.user_name || `User #${selectedReport.user_id}`}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lý do báo cáo
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {getReasonText(selectedReport.reason)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày báo cáo
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedReport.created_at)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả chi tiết
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedReport.description}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Trạng thái
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={newStatus}
                      label="Trạng thái"
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={updateLoading}
                    >
                      <MenuItem value="pending">Chờ xử lý</MenuItem>
                      <MenuItem value="resolved">Đã xử lý</MenuItem>
                      <MenuItem value="rejected">Đã từ chối</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ghi chú của admin
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Nhập ghi chú về cách xử lý báo cáo này"
                    disabled={updateLoading}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={updateLoading}>
                Đóng
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateReport}
                disabled={updateLoading}
                startIcon={updateLoading ? <CircularProgress size={20} /> : null}
              >
                {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ReportsManagementPage; 