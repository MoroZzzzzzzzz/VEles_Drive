import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, Video, MoreVertical, Paperclip, 
  Smile, X, MinusCircle, Maximize2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI } from '../../services/api';

export const ChatWindow = ({ 
  conversation, 
  isOpen, 
  onClose, 
  onMinimize,
  isMinimized = false 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await messagesAPI.getConversationMessages(conversation.id);
      setMessages(data.messages || mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      conversation_id: conversation.id,
      message: newMessage,
      type: 'text'
    };

    // Optimistic update
    const tempMessage = {
      id: Date.now(),
      ...messageData,
      sender: user,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await messagesAPI.sendMessage(messageData);
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    }
  };

  const handleVideoCall = () => {
    console.log('Starting video call...');
  };

  const handleVoiceCall = () => {
    console.log('Starting voice call...');
  };

  const MessageBubble = ({ message }) => {
    const isOwn = message.sender?.id === user?.id;
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          <p className="text-sm">{message.message}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-75">
              {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isOwn && (
              <span className="text-xs opacity-75">
                {message.status === 'sending' && '⏳'}
                {message.status === 'sent' && '✓'}
                {message.status === 'delivered' && '✓✓'}
                {message.status === 'failed' && '❌'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-gray-800 border-gray-700">
          <CardHeader className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {conversation?.participant?.name?.[0] || 'D'}
                  </span>
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold">
                    {conversation?.participant?.name || 'Дилер'}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-gray-400">онлайн</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMinimize?.(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[500px] bg-gray-800 border-gray-700 flex flex-col">
        {/* Chat Header */}
        <CardHeader className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {conversation?.participant?.name?.[0] || 'D'}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {conversation?.participant?.name || 'Дилер'}
                </h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-400">онлайн</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceCall}
                className="text-gray-400 hover:text-white p-2"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVideoCall}
                className="text-gray-400 hover:text-white p-2"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMinimize?.(true)}
                className="text-gray-400 hover:text-white p-2"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {conversation?.vehicle && (
            <div className="mt-3 p-2 bg-gray-700/50 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-gray-600 rounded"></div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {conversation.vehicle.make} {conversation.vehicle.model}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {conversation.vehicle.year} • {conversation.vehicle.price?.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Загрузка сообщений...</div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white p-2"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 bg-gray-700 border-gray-600 text-white"
            />
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white p-2"
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 p-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Mock data
const mockMessages = [
  {
    id: 1,
    message: 'Здравствуйте! Интересует данный автомобиль. Можно узнать подробности?',
    sender: { id: 'buyer', name: 'Покупатель' },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'delivered'
  },
  {
    id: 2,
    message: 'Добро пожаловать! Конечно, с удовольствием расскажу. Что именно вас интересует?',
    sender: { id: 'dealer', name: 'Дилер' },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    status: 'delivered'
  },
  {
    id: 3,
    message: 'Хотел бы узнать про техническое состояние и историю обслуживания',
    sender: { id: 'buyer', name: 'Покупатель' },
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'delivered'
  },
  {
    id: 4,
    message: 'Автомобиль в идеальном состоянии, один владелец. Полная сервисная история у официального дилера. Могу показать все документы при встрече.',
    sender: { id: 'dealer', name: 'Дилер' },
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'delivered'
  }
];