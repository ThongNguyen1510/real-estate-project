import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Paper, 
  Typography, 
  TextField, 
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText 
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Send as SendIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'support' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const userMessage = { id: messages.length + 1, text: newMessage, sender: 'user' };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Giả lập phản hồi tự động sau 1 giây
    setTimeout(() => {
      const replyMessage = { 
        id: messages.length + 2, 
        text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!', 
        sender: 'support' 
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {open ? (
        <Paper elevation={10} sx={{ width: 300, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <Typography variant="subtitle1">Hỗ trợ trực tuyến</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, height: 300 }}>
            <List>
              {messages.map((message) => (
                <ListItem 
                  key={message.id} 
                  sx={{ 
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    px: 1
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 32 }}>
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main'
                      }}
                    >
                      {message.sender === 'user' ? 'B' : 'S'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                          borderRadius: message.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0'
                        }}
                      >
                        <Typography variant="body2">{message.text}</Typography>
                      </Paper>
                    }
                    sx={{ 
                      textAlign: message.sender === 'user' ? 'right' : 'left',
                      ml: message.sender === 'user' ? 0 : 1,
                      mr: message.sender === 'user' ? 1 : 0
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    edge="end" 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
        </Paper>
      ) : (
        <Badge 
          color="primary" 
          overlap="circular" 
          badgeContent=" " 
          variant="dot"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <IconButton
            color="primary"
            aria-label="chat"
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              width: 56,
              height: 56
            }}
          >
            <ChatIcon />
          </IconButton>
        </Badge>
      )}
    </Box>
  );
};

export default ChatWidget;