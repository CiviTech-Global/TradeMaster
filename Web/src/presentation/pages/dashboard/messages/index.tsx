import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../../../components';
import { messageService } from '../../../../infrastructure/api/messageService';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Conversation, Message } from '../../../../domain/types/message';
import './Messages.css';

const Messages: React.FC = () => {
  const user = useAppSelector(selectUser);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (partnerId: number) => {
    setIsLoadingMessages(true);
    try {
      const result = await messageService.getConversationMessages(partnerId, {
        limit: 100,
      });
      setMessages(result.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedPartnerId) {
      loadMessages(selectedPartnerId);
    }
  }, [selectedPartnerId, loadMessages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (!selectedPartnerId || !user?.id || messages.length === 0) return;

    const unreadMessages = messages.filter(
      (msg) => msg.receiver_id === user.id && !msg.is_read
    );

    for (const msg of unreadMessages) {
      messageService.markAsRead(msg.id);
    }

    // Update conversation unread count locally
    if (unreadMessages.length > 0) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.partner.id === selectedPartnerId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  }, [selectedPartnerId, messages, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
      if (selectedPartnerId) {
        loadMessages(selectedPartnerId);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadConversations, loadMessages, selectedPartnerId]);

  // Select a conversation
  const handleSelectConversation = (partnerId: number) => {
    setSelectedPartnerId(partnerId);
    setNewMessage('');
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartnerId || isSending) return;

    setIsSending(true);
    try {
      const sent = await messageService.sendMessage({
        receiver_id: selectedPartnerId,
        content: newMessage.trim(),
      });

      if (sent) {
        setMessages((prev) => [...prev, sent]);
        setNewMessage('');

        // Update conversation list with the new message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.partner.id === selectedPartnerId
              ? { ...conv, lastMessage: sent }
              : conv
          )
        );
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time for messages
  const formatMessageTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format time for conversation list
  const formatConversationTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get initials for avatar
  const getInitials = (firstname: string, lastname: string): string => {
    return `${firstname?.[0] || ''}${lastname?.[0] || ''}`.toUpperCase();
  };

  // Check if we need a date separator
  const shouldShowDateSeparator = (
    currentMsg: Message,
    prevMsg: Message | null
  ): boolean => {
    if (!prevMsg) return true;
    const current = new Date(currentMsg.createdAt).toDateString();
    const prev = new Date(prevMsg.createdAt).toDateString();
    return current !== prev;
  };

  // Format date for separator
  const formatDateSeparator = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedConversation = conversations.find(
    (c) => c.partner.id === selectedPartnerId
  );

  if (isLoadingConversations) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__header">
          <h1 className="dashboard-page__title">Messages</h1>
        </div>
        <div className="dashboard-page__content">
          <div className="loading-spinner">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Messages</h1>
        <p className="dashboard-page__subtitle">
          Communicate with your buyers and partners
        </p>
      </div>

      <div className="dashboard-page__content">
        <div className="messages-container">
          {/* Left Panel: Conversations */}
          <div className="conversations-panel">
            <div className="conversations-panel__header">
              <h3>Conversations</h3>
            </div>

            {conversations.length === 0 ? (
              <div className="conversations-empty">
                <p>No conversations yet.</p>
              </div>
            ) : (
              <ul className="conversations-list">
                {conversations.map((conv) => (
                  <li
                    key={conv.partner.id}
                    className={`conversation-item ${
                      selectedPartnerId === conv.partner.id
                        ? 'conversation-item--active'
                        : ''
                    }`}
                    onClick={() => handleSelectConversation(conv.partner.id)}
                  >
                    <div className="conversation-avatar">
                      {getInitials(
                        conv.partner.firstname,
                        conv.partner.lastname
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-info__top">
                        <span className="conversation-name">
                          {conv.partner.firstname} {conv.partner.lastname}
                        </span>
                        {conv.lastMessage && (
                          <span className="conversation-time">
                            {formatConversationTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="conversation-preview">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="conversation-unread-badge">
                        {conv.unreadCount}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Panel: Message Thread */}
          <div className="message-thread-panel">
            {!selectedPartnerId ? (
              <div className="no-conversation-selected">
                <p>Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                {selectedConversation && (
                  <div className="message-thread__header">
                    <div className="conversation-avatar">
                      {getInitials(
                        selectedConversation.partner.firstname,
                        selectedConversation.partner.lastname
                      )}
                    </div>
                    <div>
                      <div className="message-thread__header-name">
                        {selectedConversation.partner.firstname}{' '}
                        {selectedConversation.partner.lastname}
                      </div>
                      <div className="message-thread__header-email">
                        {selectedConversation.partner.email}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div
                  className="message-thread__messages"
                  ref={messagesContainerRef}
                >
                  {isLoadingMessages ? (
                    <div className="message-thread-empty">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="message-thread-empty">
                      No messages in this conversation yet. Send a message to
                      start the conversation.
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const isSent = msg.sender_id === user?.id;
                        const showSeparator = shouldShowDateSeparator(
                          msg,
                          prevMsg
                        );

                        return (
                          <React.Fragment key={msg.id}>
                            {showSeparator && (
                              <div className="message-date-separator">
                                <span>
                                  {formatDateSeparator(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div
                              className={`message-bubble ${
                                isSent
                                  ? 'message-bubble--sent'
                                  : 'message-bubble--received'
                              }`}
                            >
                              <div>{msg.content}</div>
                              <div className="message-bubble__time">
                                {formatMessageTime(msg.createdAt)}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="message-input-section">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
