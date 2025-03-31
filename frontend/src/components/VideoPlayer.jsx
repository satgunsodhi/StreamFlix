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
  const [isHost, setIsHost] = useState(true); 
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState(roomId);
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
  const [notification, setNotification] = useState(null); // Add state for notification

  const allMovies = [...movies.trending, ...movies.action, ...movies.comedy];
  const movie = allMovies.find(m => m.id === (movieId));

    const createRoomTimer = async (roomId) => {
      try {
          const response = await axios.post("/api/timers", { name: roomId, time: 0 }); // Ensure payload matches backend expectations
          console.log("Room timer created:", response.data);
      } catch (error) {
          console.error("Error creating room timer:", error.response?.data || error.message);
      }
    };
  
    const createRoom = async () => {
      if(isHost) {
        setRoomId(roomId);
        const link = `${window.location.origin}/watch/${movieId}?room=${roomId}`;
        setInviteLink(link);
        setShowModal(true);
        try {
            await createRoomTimer(roomId);
        } catch(error) {
          console.log(error);
        }
      }
    };

    const sendMessageToIframe = (message) => {
      const iframe = document.querySelector('.video-frame');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, '*'); // Send message to the iframe
      }
    };
  
    const incrementTimer = (roomId) => {
      const message = { action: 'getCurrentTime' }; // Message to request current time
      sendMessageToIframe(message);
    };
  
    const getOldTime = async (roomId) => {
      try {
        const response = await axios.get(`/api/timers/${roomId}`);
        return response.data.time || 0; // Return old time or default to 0
      } catch (error) {
        console.error("Error fetching old time:", error.response?.data || error.message);
        return 0; // Default to 0 if fetching fails
      }
    };

  const setIframeTime = async (roomId) => {
    try {
      const response = await axios.get(`/api/timers/${roomId}`);
      const timerTime = response.data.time || 0;
      if (timerTime === 0) {
        console.log("Timer time is 0, not updating iframe time.");
        return; // Do not change the iframe time if timer time is 0
      }
      const message = { action: 'setCurrentTime', time: timerTime }; // Message to set current time
      sendMessageToIframe(message);
      console.log("Iframe time adjusted to:", timerTime);
    } catch (error) {
      console.error("Error setting iframe time:", error.response?.data || error.message);
    }
  };
    
  useEffect(() => {
    let timerInterval;

    if (isHost) {
      timerInterval = setInterval(() => {
        incrementTimer(roomId); // Increment timer for host
      }, 2000); // 2 seconds for demonstration
    } else {
      timerInterval = setInterval(() => {
        setIframeTime(roomId); // Periodically set iframe time for non-host users
      }, 2000); // 2 seconds for demonstration
    }

    return () => clearInterval(timerInterval); // Cleanup interval on unmount or dependency change
  }, [isHost, roomId]); // Dependencies to re-run the effect

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data?.action === 'currentTime') {
        const currentTime = event.data.time || 0;
        const timeToUpdate = currentTime !== 0 ? currentTime : await getOldTime(roomId);
        try {
          await axios.put(`/api/timers/${roomId}`, { time: timeToUpdate });
          console.log("Timer updated for room:", roomId, "with time:", timeToUpdate);
        } catch (error) {
          console.error("Error updating timer:", error.response?.data || error.message);
        }
      }
    };
  
    window.addEventListener('message', handleMessage);
  
    return () => {
      window.removeEventListener('message', handleMessage); // Cleanup listener on unmount
    };
  }, [roomId]); // Dependency to re-run the effect when roomId changes

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setNotification('Invite link copied to clipboard!'); // Set notification message
    setTimeout(() => setNotification(null), 3000); // Clear notification after 3 seconds
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setIsHost(false); // Update `isHost` state
    }
  }, []);
  console.log(roomId)
  
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
            src={`https://uflix.to/mPlayer?movieid=${movieId}&stream=stream1`}
            title={movie?.title}
            className="video-frame"
            allowFullScreen
          />
          <div className="video-controls">
            <button onClick={createRoom} className="create-room-btn">
              <Users size={20} />
              Invite People
            </button>
          </div>
        </div>

        {/* Room status */}
        {roomId && (
          <div className="room-status">
            <p>Watch Party Room: Active</p>
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
              <p><strong>Starring:</strong> John Doe, Jane Smith, Robert Johnson ${roomId}</p>
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