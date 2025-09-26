import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Send, MessageCircle, User, Clock, Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const MessagesModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && user) {
      loadConversations();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await messagesAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      setIsLoading(true);
      const data = await messagesAPI.getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await messagesAPI.sendMessage({
        recipient_id: selectedUser.user_id,
        vehicle_id: selectedUser.vehicle_id,
        content: newMessage.trim(),
        message_type: 'text'
      });

      setNewMessage('');
      loadMessages(selectedUser.user_id);
      loadConversations(); // Refresh conversations list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 bg-gray-900 border-gray-700">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-700 flex flex-col">
            <DialogHeader className="p-4 border-b border-gray-700">
              <DialogTitle className="text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Сообщения
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="text-gray-400 text-center py-8">Загрузка...</div>
              ) : conversations.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>У вас пока нет сообщений</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.user_id}
                      onClick={() => setSelectedUser(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.user_id === conversation.user_id
                          ? 'bg-amber-500/20 border-amber-500/50 border'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{conversation.user_name}</p>
                            <p className="text-gray-400 text-xs capitalize">
                              {conversation.user_role === 'dealer' ? 'Дилер' : 'Покупатель'}
                            </p>
                          </div>
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </div>
                        )}
                      </div>

                      {conversation.vehicle_title && (
                        <div className="flex items-center text-amber-400 text-xs mb-2">
                          <Car className="w-3 h-3 mr-1" />
                          {conversation.vehicle_title}
                        </div>
                      )}

                      <p className="text-gray-300 text-sm truncate mb-1">
                        {conversation.last_message}
                      </p>
                      <p className="text-gray-500 text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(conversation.last_message_time), {
                          addSuffix: true,
                          locale: ru
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{selectedUser.user_name}</h3>
                      <p className="text-gray-400 text-sm capitalize">
                        {selectedUser.user_role === 'dealer' ? 'Дилер' : 'Покупатель'}
                      </p>
                    </div>
                  </div>
                  {selectedUser.vehicle_title && (
                    <div className="flex items-center text-amber-400 text-sm mt-2">
                      <Car className="w-4 h-4 mr-2" />
                      Обсуждается: {selectedUser.vehicle_title}
                    </div>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-amber-100' : 'text-gray-400'
                          }`}>
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Напишите сообщение..."
                      className="flex-1 bg-gray-800 border-gray-600 text-white"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Выберите разговор для просмотра сообщений</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};