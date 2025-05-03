import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx' // Remove default App
import WidgetContainer from './components/WidgetContainer' // Import our widget
import './index.css' // Keep global styles if needed, or remove

// Find or create a target element for the widget
let widgetRoot = document.getElementById('chat-widget-root');
if (!widgetRoot) {
  widgetRoot = document.createElement('div');
  widgetRoot.id = 'chat-widget-root';
  document.body.appendChild(widgetRoot);
}

// Render the WidgetContainer into the target element
ReactDOM.createRoot(widgetRoot).render(
  <React.StrictMode>
    <WidgetContainer />
  </React.StrictMode>,
)

// Clean up the old default root if it exists
const defaultRoot = document.getElementById('root');
if (defaultRoot) {
  // Optional: You might want to remove it or leave it 
  // depending on whether the host page uses it.
  // For a purely embeddable widget, removing it might be cleaner.
  // defaultRoot.remove(); 
} 