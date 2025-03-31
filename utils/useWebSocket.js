import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import config from './Config';

export const useWebSocket = (url) => {
  const { userData } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [stories, setStories] = useState([]);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    if (!userData?.user_id) return;
    
    // Create WebSocket connection
    const fullUrl = `${config.wsUrl}${url}${userData.user_id}/`;
    socketRef.current = new WebSocket(fullUrl);
    
    // Connection opened
    socketRef.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
      // Reset reconnect attempts on successful connection
      reconnectAttempts.current = 0;
    };
    
    // Listen for messages
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.job) {
        // Update single job status
        setCurrentJob(data.job);
      } else if (data.jobs) {
        // Update stories list
        setStories(data.jobs);
      }
    };
    
    // Connection closed
    socketRef.current.onclose = (event) => {
      setIsConnected(false);
      console.log('WebSocket Disconnected');

      // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
      if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
        reconnectAttempts.current += 1;
        
        // Try to reconnect after 5 seconds
        setTimeout(() => {
          setupWebSocket();
        }, 5000);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('Maximum reconnection attempts reached');
      }
    };
    
    // Connection error
    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }, [userData?.user_id, url]);

  // Connect to the WebSocket
  useEffect(() => {
    setupWebSocket();
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userData?.user_id, url, setupWebSocket]);
  
  // Send message function
  const sendMessage = (message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  // Track a specific job
  const trackJob = (jobId) => {
    if (socketRef.current && isConnected) {
      sendMessage({ 
        action: 'fetch_job',
        job_id: jobId
      });
    }
  };
  
  // Fetch all stories
  const fetchStories = () => {
    if (socketRef.current && isConnected) {
      sendMessage({ 
        action: 'fetch_stories'
      });
    }
  };
  
  // Clear current job
  const clearCurrentJob = () => {
    setCurrentJob(null);
  };
  
  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };
  
  return { 
    isConnected, 
    messages, 
    currentJob,
    stories,
    sendMessage, 
    trackJob,
    fetchStories,
    clearCurrentJob,
    clearMessages 
  };
};