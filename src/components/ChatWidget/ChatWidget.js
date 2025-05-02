import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Paper, 
  Typography, 
  TextField, 
  Avatar,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Button,
  CircularProgress,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Chat as ChatIcon,
  Send as SendIcon, 
  Close as CloseIcon,
  EmojiEmotions,
  AttachFile,
  MoreVert,
  LocationOn,
  Phone,
  HomeWork,
  Email,
  Info
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const ChatBubble = styled(Box)(({ theme, sender }) => ({
  maxWidth: '85%',
  padding: theme.spacing(1.5),
  borderRadius: sender === 'user' 
    ? '18px 18px 0 18px' 
    : '18px 18px 18px 0',
  backgroundColor: sender === 'user' 
    ? theme.palette.primary.main 
    : theme.palette.grey[100],
  color: sender === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  wordBreak: 'break-word',
  position: 'relative',
  marginBottom: theme.spacing(1),
  animation: sender === 'user' 
    ? 'slideInRight 0.3s ease' 
    : 'slideInLeft 0.3s ease',
  '@keyframes slideInRight': {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  },
  '@keyframes slideInLeft': {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  }
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  opacity: 0.8
}));

const SupportOption = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: 'none',
  padding: theme.spacing(1.5),
  justifyContent: 'flex-start',
  fontWeight: 'normal',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
}));

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Xin chào! Bạn cần hỗ trợ gì về bất động sản? Hãy để lại tin nhắn, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.', 
      sender: 'support',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showContactPrompt, setShowContactPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const supportOptions = [
    { text: 'Tôi muốn tìm hiểu về dự án', icon: <HomeWork fontSize="small" /> },
    { text: 'Tôi cần tư vấn mua/bán BĐS', icon: <Info fontSize="small" /> },
    { text: 'Tôi muốn được gọi lại', icon: <Phone fontSize="small" /> },
    { text: 'Tôi cần gặp nhân viên tư vấn', icon: <LocationOn fontSize="small" /> }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const userMessage = { 
      id: messages.length + 1, 
      text: newMessage, 
      sender: 'user',
      time: timeString
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Focus back on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    // After first message, ask for contact info if not provided yet
    if (!contactInfo && !showContactPrompt && !messageSent) {
      setTimeout(() => {
        setShowContactPrompt(true);
        const promptMessage = { 
          id: messages.length + 2, 
          text: 'Vui lòng để lại số điện thoại hoặc email để chúng tôi có thể liên hệ với bạn.', 
          sender: 'support',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setMessages(prev => [...prev, promptMessage]);
      }, 1000);
    }
  };

  const handleSubmitContactInfo = () => {
    if (contactInfo.trim() === '') return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const contactMessage = { 
      id: messages.length + 1, 
      text: contactInfo, 
      sender: 'user',
      time: timeString
    };
    
    setMessages([...messages, contactMessage]);
    
    // Simulate sending to server
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setMessageSent(true);
      
      const thankYouMessage = { 
        id: messages.length + 2, 
        text: 'Cảm ơn bạn đã liên hệ! Chúng tôi đã nhận được yêu cầu và sẽ phản hồi trong thời gian sớm nhất.', 
        sender: 'support',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, thankYouMessage]);
      setContactInfo('');
      setShowContactPrompt(false);
      setShowAlert(true);
    }, 2000);
  };

  const handleOptionClick = (optionText) => {
    setNewMessage(optionText);
    
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  const resetChat = () => {
    setMessages([
      { 
        id: 1, 
        text: 'Xin chào! Bạn cần hỗ trợ gì về bất động sản? Hãy để lại tin nhắn, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.', 
        sender: 'support',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    ]);
    setNewMessage('');
    setContactInfo('');
    setMessageSent(false);
    setShowContactPrompt(false);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowAlert(false)}
          sx={{ width: '100%' }}
        >
          Yêu cầu hỗ trợ đã được gửi thành công!
        </Alert>
      </Snackbar>
      
      <Zoom in={open} unmountOnExit>
        <Paper 
          elevation={8} 
          sx={{ 
            width: { xs: 320, sm: 350 }, 
            height: 480, 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            overflow: 'hidden',
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Chat Header */}
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'primary.dark'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src="/logo192.png" 
                alt="Support" 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  mr: 1.5,
                  border: '2px solid white'
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  Hỗ trợ khách hàng
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Trả lời trong vòng 24 giờ
                </Typography>
              </Box>
            </Box>
            <Box>
              {messageSent && (
                <Tooltip title="Gửi yêu cầu mới">
                  <IconButton size="small" sx={{ color: 'white', mr: 0.5 }} onClick={resetChat}>
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Đóng">
                <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Chat Body */}
          <Box 
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#f5f8fb'
            }}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {messages.map((message) => (
                <Box 
                  key={message.id} 
                  sx={{ 
                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    mb: 1
                  }}
                >
                  {message.sender === 'support' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        src="/logo192.png" 
                        alt="Support" 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Hỗ trợ khách hàng
                      </Typography>
                    </Box>
                  )}
                  
                  <ChatBubble sender={message.sender}>
                    <Typography variant="body2">{message.text}</Typography>
                  </ChatBubble>
                  
                  <MessageTime align={message.sender === 'user' ? 'right' : 'left'}>
                    {message.time}
                  </MessageTime>
                </Box>
              ))}
              
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src="/logo192.png" 
                    alt="Support" 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      mr: 1
                    }}
                  />
                  <Box 
                    sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1.5, 
                      borderRadius: '18px 18px 18px 0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <CircularProgress size={20} thickness={5} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Đang xử lý...
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Support Options */}
              {messages.length <= 2 && !messageSent && !showContactPrompt && (
                <Fade in={messages.length <= 2} timeout={500}>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                      Chọn dịch vụ hỗ trợ:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {supportOptions.map((option, index) => (
                        <SupportOption
                          key={index}
                          variant="outlined"
                          startIcon={option.icon}
                          onClick={() => handleOptionClick(option.text)}
                          fullWidth
                        >
                          {option.text}
                        </SupportOption>
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}
              
              <div ref={messagesEndRef} />
            </Box>
          </Box>
          
          {/* Chat Footer */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              bgcolor: 'white'
            }}
          >
            {showContactPrompt ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Số điện thoại hoặc email của bạn..."
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitContactInfo()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ display: 'flex', mr: 1 }}>
                        <Phone fontSize="small" color="primary" />
                      </Box>
                    ),
                    endAdornment: (
                      <Button 
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitContactInfo}
                        disabled={!contactInfo.trim() || loading}
                        size="small"
                        sx={{ 
                          borderRadius: '20px',
                          minWidth: 'auto',
                          mr: -0.5
                        }}
                      >
                        {loading ? <CircularProgress size={20} /> : 'Gửi'}
                      </Button>
                    )
                  }}
                />
              </Box>
            ) : messageSent ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Cảm ơn bạn đã liên hệ với chúng tôi!
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  size="small" 
                  onClick={resetChat}
                  sx={{ mt: 1 }}
                >
                  Gửi yêu cầu mới
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Nhập tin nhắn cần hỗ trợ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  inputRef={inputRef}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        edge="end" 
                        color="primary" 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        sx={{
                          bgcolor: newMessage.trim() ? 'primary.main' : 'grey.300',
                          color: 'white',
                          width: 32,
                          height: 32,
                          mr: -0.5,
                          '&:hover': {
                            bgcolor: newMessage.trim() ? 'primary.dark' : 'grey.300',
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'grey.300',
                            color: 'white',
                          }
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Zoom>
      
      <Tooltip title={open ? "Đóng hỗ trợ" : "Liên hệ hỗ trợ"} placement="left">
        <Badge 
          color="error" 
          overlap="circular" 
          badgeContent="1"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          invisible={open || messageSent}
        >
          <IconButton
            onClick={toggleChat}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 56,
              height: 56,
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              animation: !open ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)'
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)'
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
                }
              }
            }}
          >
            {open ? <CloseIcon /> : <ChatIcon />}
          </IconButton>
        </Badge>
      </Tooltip>
    </Box>
  );
};

export default ChatWidget;