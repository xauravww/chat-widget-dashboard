import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SendHorizonal } from 'lucide-react';

// Re-use Message interface (ideally move to a shared types file later)
interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
}

// Basic chat window styling
const Window = styled.div`
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  background-color: #007bff; // Example color
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  position: relative; // For status indicator
`;

// New component for status indicator
// Use transient prop ($status) to avoid passing it to the DOM
const StatusIndicator = styled.span<{ $status: 'connecting' | 'connected' | 'disconnected' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 8px;
  background-color: ${({ $status }) => 
    $status === 'connected' ? '#2ecc71' : 
    $status === 'connecting' ? '#f1c40f' : 
    '#e74c3c'}; 
  transition: background-color 0.3s ease;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const MessageList = styled.div`
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
`;

// Styled component for individual messages
// Use transient prop ($sender) to avoid passing it to the DOM
const MessageBubble = styled.div<{ $sender: 'user' | 'ai' | 'system' }>`
  max-width: 75%;
  padding: 8px 12px;
  border-radius: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  word-wrap: break-word;
  align-self: ${props => (props.$sender === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${props => (props.$sender === 'user' ? '#007bff' : '#e9ecef')};
  color: ${props => (props.$sender === 'user' ? 'white' : '#495057')};
  border-bottom-left-radius: ${props => (props.$sender === 'ai' || props.$sender === 'system' ? '0' : '15px')};
  border-bottom-right-radius: ${props => (props.$sender === 'user' ? '0' : '15px')};
`;

// Styled component for the input area container
const Footer = styled.div`
  padding: 10px;
  border-top: 1px solid #eee;
`;

// Styled form for input and button
const InputArea = styled.form` 
  display: flex;
  align-items: center;
`;

// Styled input element
const TextInput = styled.input` 
  flex-grow: 1;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 8px 12px;
  margin-right: 8px; 
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
  &:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
  }
`;

// Styled send button element
const SendButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 10px; /* Adjusted padding for icon */
  cursor: pointer;
  font-size: 14px;
  display: flex; /* Align icon */
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  isAiResponding: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, onClose, connectionStatus, isAiResponding }) => {
  const [input, setInput] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic - Updated
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      // Scroll the container to the bottom
      messageList.scrollTop = messageList.scrollHeight;
    }
    // Dependencies: run whenever messages array or isAiResponding state changes
  }, [messages, isAiResponding]); 

  const handleSend = (e: React.FormEvent | React.KeyboardEvent<HTMLInputElement>) => {
    if ('preventDefault' in e) { e.preventDefault(); }
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(e);
    }
  };

  return (
    <Window>
      <Header>
        <h2>Healthcare Assistant</h2>
        <span>
          Status: 
          <StatusIndicator 
            $status={connectionStatus} 
            title={`Status: ${connectionStatus}`}
          />
        </span>
        <CloseButton onClick={onClose} aria-label="Close chat">&times;</CloseButton>
      </Header>
      <MessageList ref={messageListRef}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} $sender={msg.sender}>
            {msg.text}
          </MessageBubble>
        ))}
        {isAiResponding && (
          <MessageBubble $sender="system"><i>Assistant is thinking...</i></MessageBubble>
        )}
      </MessageList>
      <Footer>
        <InputArea onSubmit={handleSend}>
          <TextInput 
             type="text"
             placeholder={isAiResponding ? "Assistant is responding..." : "Ask a health question..."}
             value={input}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
             onKeyPress={handleKeyPress}
             disabled={connectionStatus !== 'connected' || isAiResponding}
          />
          <SendButton 
            type="submit" 
            disabled={!input.trim() || connectionStatus !== 'connected' || isAiResponding}
          >
            <SendHorizonal size={18} />
          </SendButton>
        </InputArea>
      </Footer>
    </Window>
  );
};

export default ChatWindow; 