import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Users, X, Send, ThumbsUp } from 'lucide-react';
import { movies } from '../data/movies';
import axios from "axios";

const VideoPlayer = () => {
  const [searchParams] = useSearchParams();
  const { movieId } = useParams();
  const initialRoomId = searchParams.get("room") || uuidv4();
  const [roomId, setRoomId] = useState(initialRoomId);
  const [isHost, setIsHost] = useState(!searchParams.get("room")); // If no room param, you're the host
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'MovieBuff',
      text: 'This show is absolutely amazing! The plot twists keep you guessing.',
      likes: 12,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      user: 'SeriesExpert',
      text: 'The character development in this season is outstanding.',
      likes: 8,
      timestamp: '1 hour ago'
    }
  ]);
  const [notification, setNotification] = useState(null);
  const [currentPlayerTime, setCurrentPlayerTime] = useState(0);

  const allMovies = [...movies.trending, ...movies.action, ...movies.comedy];
  const movie = allMovies.find(m => m.id === movieId);

  // Create a room timer on the server
  const createRoomTimer = async (roomId) => {
    try {
      const response = await axios.post("/api/timers/", {
        name: roomId, 
        time: 0 
      });
      console.log("Room timer created:", response.data);
    } catch (error) {
      console.error("Error creating room timer:", error.response?.data || error.message);
    }
  };

  // Create and share a room
  const createRoom = async () => {
    if (isHost) {
      const link = `${window.location.origin}/watch/${movieId}?room=${roomId}`;
      setInviteLink(link);
      setShowModal(true);
      try {
        await createRoomTimer(roomId);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const updateServerTime = async (currentTime) => {
    if (!isHost || !roomId) return;
    
    try {
      await axios.put(`/api/timers/${roomId}`, { time: currentTime });
      console.log("Timer updated for room:", roomId, "with time:", currentTime);
    } catch (error) {
      console.error("Error updating timer:", error.response?.data || error.message);
    }
  };

  const requestCurrenttime = async () => {
    const iframe = document.querySelector('div > iframe');
    iframe.onload = function() {
      const iframeDocument = iframe.contentWindow.document;
      const video = iframeDocument.querySelector('video');
    };

    currentTime = video.currentTime;
  }

  const syncWithServerTime = async () => {
    if (!roomId) return;
    
    console.log("Syncing with server time, isHost:", isHost);
    try {
      const response = await axios.get(`/api/timers/${roomId}`);
      const serverTime = response.data.time || 2;
      console.log("Server time:", serverTime, "Current player time:", currentPlayerTime);
      
      // Only update if there's a significant difference to avoid constant small adjustments
      if (Math.abs(serverTime - currentPlayerTime) > 10) {
        console.log("Significant time difference detected, updating player time");
        video.currentTime = serverTime;
      }
    } catch (error) {
      console.error("Error fetching time:", error.response?.data || error.message);
    }
  };

  // Add a direct timer update function that doesn't depend on iframe messages
  const updateTimerDirectly = async () => {
    if (!isHost || !roomId) return;
    
    try {
      // Get the current tracked time and update server
      console.log("Updating server with current tracked time:", currentPlayerTime);
      await axios.put(`/api/timers/${roomId}`, { time: currentPlayerTime });
    } catch (error) {
      console.error("Error in direct timer update:", error);
    }
  };

  // Timer intervals for host and client
  useEffect(() => {
    let hostTimerInterval;
    let syncTimerInterval;

    if (isHost) {
      console.log("Setting up host timer intervals");
      hostTimerInterval = setInterval(() => {
        console.log("Host requesting current time");  
        
        setTimeout(() => {
          updateServerTime(currentPlayerTime);
        }, 1000);
      }, 5000);
    } else {
      console.log("Setting up client sync intervals");
      // Non-host periodically syncs with server time
      syncTimerInterval = setInterval(() => {
        console.log("Client syncing with server time");
        syncWithServerTime();
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (hostTimerInterval) clearInterval(hostTimerInterval);
      if (syncTimerInterval) clearInterval(syncTimerInterval);
      console.log("Cleared timer intervals");
    };
  }, [isHost, roomId]); // Remove currentPlayerTime from dependencies

  // Add a useEffect to periodically update the timer directly
  // This serves as a fallback mechanism
  useEffect(() => {
    let directUpdateInterval;
    
    if (isHost) {
      directUpdateInterval = setInterval(() => {
        updateTimerDirectly();
      }, 10000); // Every 10 seconds as a fallback
    }
    
    return () => {
      if (directUpdateInterval) clearInterval(directUpdateInterval);
    };
  }, [isHost, roomId]);

  // Listen for messages from iframe with enhanced error handling
  useEffect(() => {
    const handleMessage = (event) => {
      // Log all incoming messages for debugging
      console.log("Received message:", event.data, "from origin:", event.origin);
      
      // Accept messages from the iframe domain or same origin
      if (event.origin !== "https://uflix.to" && event.origin !== window.location.origin) {
        console.warn("Ignored message from unknown origin:", event.origin);
        return;
      }

      try {
        // Handle time update from iframe
        if (event.data && event.data.action === 'timeUpdate') {
          const newTime = parseFloat(event.data.time);
          console.log("Received timeUpdate:", newTime);
          
          if (!isNaN(newTime)) {
            setCurrentPlayerTime(newTime);
            
            // If host, update the server with the new time
            if (isHost) {
              updateServerTime(newTime);
            }
          } else {
            console.warn("Received invalid time value:", event.data.time);
          }
        }
        
        // Handle getCurrentTime response
        if (event.data && event.data.action === 'currentTimeResponse') {
          const reportedTime = parseFloat(event.data.time);
          console.log("Received currentTimeResponse:", reportedTime);
          
          if (!isNaN(reportedTime)) {
            setCurrentPlayerTime(reportedTime);
            
            // If host, update the server
            if (isHost) {
              updateServerTime(reportedTime);
            }
          } else {
            console.warn("Received invalid currentTimeResponse:", event.data.time);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isHost, roomId]);

  // Add iframe load event to initialize communication
  useEffect(() => {
    const iframe = document.querySelector('#video-player');
    
    const handleIframeLoad = () => {
      console.log("Iframe loaded, initializing communication");
      
      // Send an initial message to establish communication
      setTimeout(() => {
        
        // For non-hosts, immediately sync with server time
        if (!isHost) {
          syncWithServerTime();
        }
      }, 1000); // Give iframe time to fully initialize
    };
    
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      return () => iframe.removeEventListener('load', handleIframeLoad);
    }
  }, [roomId, isHost]);

  // Initialize room and timers on component mount
  useEffect(() => {
    console.log("Component mounted, isHost:", isHost, "roomId:", roomId);
    
    // Set up invite link
    const link = `${window.location.origin}/watch/${movieId}?room=${roomId}`;
    setInviteLink(link);
    
    // Attempt initial sync/setup
    if (isHost) {
      createRoomTimer(roomId)
        .then(() => console.log("Room timer created on mount"))
        .catch(error => console.error("Failed to create room on mount:", error));
    } else {
      syncWithServerTime()
        .then(() => console.log("Initial sync with server completed"))
        .catch(error => console.error("Initial sync failed:", error));
    }
    
    // Set up a one-time check to ensure room exists
    setTimeout(() => {
      axios.get(`/api/timers/${roomId}`)
        .then(response => console.log("Room exists:", response.data))
        .catch(error => {
          console.error("Room doesn't exist, creating it:", error);
          if (isHost) createRoomTimer(roomId);
        });
    }, 2000);
  }, []);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setNotification('Invite link copied to clipboard!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      id: uuidv4(),
      user: 'You',
      text: comment,
      likes: 0,
      timestamp: 'Just now'
    };

    setComments([newComment, ...comments]);
    setComment('');
  };

  const handleLike = (commentId) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  return (
    <div className="video-player-container">
      {/* Notification */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      <div className="video-section">
        {/* Movie title */}
        <div className="video-info">
          <h1 className="video-title">{movie?.title}</h1>
        </div>

        {/* Video player */}
        <div className="video-wrapper">
          <iframe
            id="video-player"
            src={`http://uflix.to/mPlayer?movieid=${movieId}`}
            title={movie?.title}
            className="video-frame"
            allowFullScreen
          />
          <div className="video-controls">
            <button onClick={() => { createRoom(); setShowModal(true); }} className="create-room-btn">
              <Users size={20} />
              Invite People
            </button>
          </div>
        </div>

        {/* Room status */}
        {roomId && (
          <div className="room-status">
            <p>Watch Party Room: Active {isHost ? '(Host)' : '(Joined)'}</p>
          </div>
        )}

        {/* Enhanced description section */}
        <div className="show-details">
          <div className="show-info">
            <div className="show-metadata">
              <span className="release-year">2024</span>
              <span className="content-rating">TV-MA</span>
              <span className="duration">1 Season</span>
            </div>
            <p className="show-description">{movie?.description}</p>
            <div className="show-extra-info">
              <p><strong>Starring:</strong> John Doe, Jane Smith, Robert Johnson</p>
              <p><strong>Created by:</strong> Sarah Wilson</p>
              <p><strong>Genres:</strong> Drama, Mystery, Thriller</p>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="comments-section">
          <h2 className="comments-title">Comments</h2>

          {/* Comment form */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit-btn">
              <Send size={20} />
            </button>
          </form>

          {/* Comments list */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-user">{comment.user}</span>
                  <span className="comment-timestamp">{comment.timestamp}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <button
                  className="like-button"
                  onClick={() => handleLike(comment.id)}
                >
                  <ThumbsUp size={16} />
                  <span>{comment.likes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Invite Friends</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <p>Share this link with your friends to watch together:</p>
              <div className="invite-link-container">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="invite-link-input"
                />
                <button onClick={copyInviteLink} className="copy-btn">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;