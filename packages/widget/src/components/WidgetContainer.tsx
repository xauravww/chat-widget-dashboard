import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

// Define message structure
interface Message {
  id: string; // Or use timestamp, or server-generated ID
  sender: 'user' | 'ai' | 'system';
  text: string;
}

// For Gemini API history format
interface GeminiMessagePart { text: string; }
interface GeminiHistoryMessage { role: "user" | "model"; parts: GeminiMessagePart[]; }

// --- Storage Keys --- 
const WIDGET_MESSAGES_KEY = 'chatwidget_messages';
const WIDGET_SESSION_ID_KEY = 'chatwidget_session_id';
const WIDGET_USERNAME_KEY = 'chatwidget_username'; // <-- Key for username

const WidgetWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999; // Ensure it's above most content
`;

// Update the server URL and path
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'https://cdn.jsdelivr.net/gh/sauravtechno/main-d/assets/test/chat-widget.iife.js'; // Point to standalone socket server
console.log(`Using socket env: ${JSON.stringify(import.meta.env)}`); // Log the server URL
console.log(`Using socket url: ${SOCKET_SERVER_URL}`); // Log the server URL
const AI_API_ENDPOINT = import.meta.env.VITE_AI_API_URL || 'https://chat-widget-dashboard-dashboard.vercel.app/api/ai'; // Keep pointing to dashboard

// Function to get or create session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem(WIDGET_SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    // Check if sessionId is not null before setting
    if (sessionId) { 
        localStorage.setItem(WIDGET_SESSION_ID_KEY, sessionId);
    }
  }
  // Ensure we always return a string, generate again if somehow still null (unlikely)
  return sessionId ?? uuidv4(); 
};

const WidgetContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  // Load initial messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const storedMessages = localStorage.getItem(WIDGET_MESSAGES_KEY);
      // Add null check for storedMessages before parsing
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch (error) {
      console.error("Error loading messages from localStorage:", error);
      return [];
    }
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [sessionId] = useState<string>(getSessionId()); // Get/create session ID on mount

  // Effect to save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(WIDGET_MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  }, [messages]);

  // Effect to initialize socket connection
  useEffect(() => {
    console.log(`Connecting socket to ${SOCKET_SERVER_URL} ...`); // Remove path from log
    setConnectionStatus('connecting');
    const newSocket: Socket<DefaultEventsMap, DefaultEventsMap> = io(SOCKET_SERVER_URL, { 
      query: { sessionId } // Send session ID during connection
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', (reason: Socket.DisconnectReason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('disconnected');
    });

    // Handle incoming messages (now potentially filtered by server using session ID)
    newSocket.on('chat message', (message: Omit<Message, 'id'>) => {
      console.log('Received message via broadcast:', message);
      if (message.sender !== 'user') {
        const messageExists = messages.some(m => m.text === message.text && m.sender === message.sender);
        if (!messageExists) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...message, id: Date.now().toString() } 
          ]);
        }
      }
    });

    // Handle potential initial messages sent by server for this session
    newSocket.on('load history', (history: Message[]) => {
       console.log('Received message history:', history);
    });

    // Cleanup on component unmount
    return () => {
      console.log('Disconnecting socket...');
      newSocket.disconnect();
    };
  }, [sessionId]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  // Update getAiResponse to accept askForName flag
  const getAiResponse = async (
      userMessage: string, 
      currentMessages: Message[],
      askForName: boolean // <-- Added parameter
  ): Promise<string> => {
    console.log(`Fetching AI response for: "${userMessage}" (askForName: ${askForName})`);
    setIsAiResponding(true);
    
    const history: GeminiHistoryMessage[] = currentMessages
      .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
      .slice(-6)
      .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
    
    console.log("Sending history:", history);

    try {
      const response = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, history, askForName }), 
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.response) {
         throw new Error("Invalid response format from AI API");
      }
      
      return data.response; // Return the text from the AI

    } catch (error) {
       console.error("Error calling AI API:", error);
       throw new Error("Failed to get response from AI assistant.");
    } finally {
        setIsAiResponding(false);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (socket && text.trim() && connectionStatus === 'connected' && !isAiResponding) {
      const senderUser: 'user' = 'user'; 
      const userMessageData = { sender: senderUser, text, sessionId }; 
      console.log('Sending user message:', userMessageData);
      
      // Check if username exists before adding message
      let askForNameFlag = false;
      const storedUsername = localStorage.getItem(WIDGET_USERNAME_KEY);
      if (!storedUsername) {
        console.log("Username not found, setting flag and storing current message as username.");
        askForNameFlag = true;
        localStorage.setItem(WIDGET_USERNAME_KEY, text);
      }
      
      // Add user message locally immediately
      const userMessageId = Date.now().toString();
      let currentMessagesForHistory: Message[] = [];
      setMessages((prevMessages) => {
        currentMessagesForHistory = [...prevMessages]; 
        return [
          ...prevMessages,
          { sender: senderUser, text, id: userMessageId } 
        ];
      });
      
      // Send user message to server
      socket.emit('chat message', userMessageData);

      try {
        // Pass askForName flag to getAiResponse
        const aiText = await getAiResponse(text, currentMessagesForHistory, askForNameFlag); 
        const senderAi: 'ai' = 'ai'; 
        const aiMessageData = { sender: senderAi, text: aiText, sessionId }; 
        
        console.log('Sending AI message to server:', aiMessageData);
        
        // Add AI message locally immediately
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...aiMessageData, id: Date.now().toString() + '-ai' } // Add unique ID
        ]);

        socket.emit('chat message', aiMessageData); 

      } catch (error) {
        const errorText = error instanceof Error ? error.message : "Failed to reach AI.";
        console.error("Error getting or sending AI response:", errorText);
        const senderSystem: 'system' = 'system'; 
        const errorMessageData = { sender: senderSystem, text: errorText, sessionId }; 
        setMessages((prevMessages) => [
            ...prevMessages,
            { ...errorMessageData, id: Date.now().toString() + '-err' } 
        ]);
      }
    }
  }, [socket, connectionStatus, isAiResponding, sessionId, getAiResponse]);

  return (
    <WidgetWrapper>
      {isOpen ? (
        <ChatWindow 
          messages={messages} 
          onSendMessage={sendMessage} 
          onClose={toggleWidget} 
          connectionStatus={connectionStatus}
          isAiResponding={isAiResponding}
        />
      ) : (
        <ChatBubble onClick={toggleWidget} />
      )}
    </WidgetWrapper>
  );
};

export default WidgetContainer;
