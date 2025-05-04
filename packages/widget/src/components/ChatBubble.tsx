import React from 'react';
import styled from 'styled-components';
import { BotIcon } from 'lucide-react';

const Bubble = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 40px;
    height: 40px;
  }
`;

interface ChatBubbleProps {
  onClick: () => void;
}

// Explicit cast to avoid TS2786 error
const Icon = BotIcon as React.FC<React.SVGProps<SVGSVGElement>>;

const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick }) => {
  return (
    <Bubble onClick={onClick} aria-label="Open chat widget">
      <Icon />
    </Bubble>
  );
};

export default ChatBubble;
