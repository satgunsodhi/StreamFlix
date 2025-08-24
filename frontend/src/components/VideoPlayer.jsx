import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Users, X, Send, ThumbsUp, User } from 'lucide-react';
import { movies } from '../data/movies';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const VideoPlayer = () => {
  const [searchParams] = useSearchParams();
  const { movieId } = useParams();
  const initialRoomId = searchParams.get("room") || uuidv4();
  const [roomId, setRoomId] = useState(initialRoomId);
  const [isHost, setIsHost] = useState(!searchParams.get("room")); // If no room param, you're the host
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [UserNo, setUserNo] = useState(null);
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

  const notify = (message) => {
    toast.success(message, {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

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

  const createRoomTimer = async (roomId) => {
    try {
      const response = await axios.post("/api/timers/", {
        name: roomId,
        time: 0,
        count: 1,
        limit: 5
      });
      console.log("Room timer created:", response.data);
    } catch (error) {
      console.error("Error creating room timer:", error.response?.data || error.message);
    }
  };

  const requestCurrenttime = async () => {
    const parentIframe = document.getElementById("video-player"); // Replace with the actual ID of the parent iframe

    // Ensure the parent iframe has loaded before accessing its content
    parentIframe.onload = function () {
        const parentDocument = parentIframe.contentDocument || parentIframe.contentWindow.document;
        const nestedIframe = parentDocument.getElementById("ve-iframe"); // Now accessing the inner iframe
    
        console.log("Nested iframe:", nestedIframe);
    };
  }

  const configureUser = async () => {
    try {
      // Fetch current data
      const response = await axios.get(`/api/timers/${roomId}`);
      let countUser = response.data.data.count;
      console.log("Count Fetched:", countUser);

      if(countUser >= response.data.data.limit) {
        kickUser();
        return; 
      }
      const updatedResponse = await axios.put(`/api/timers/${roomId}`, { count: (countUser + 1) });
  
      // Log the updated count from the server response
      const updatedCount = updatedResponse.data.count; // Assuming the updated count is in response.data.data.count
      console.log("Count updated for room:", roomId, "with count:", updatedCount);
  
      // Update the state with the new count after server confirmation
      setUserNo(updatedCount);
  
      // Optionally log the new state
      console.log("Updated User No.", updatedCount);
    } catch (error) {
      console.error("Error updating room timer:", error.response?.data || error.message);
    }
  };
  
  const kickUser = async () => {
    setRoomId(null);
    setIsHost(true);
    toast.error("Max User Limit Exceeded!", {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    setUserNo(1);
  }
  const syncWithServerTime = async () => {
    if (!roomId) return;
    console.log("Syncing with server time, isHost:", isHost);
    try {
      const response = await axios.get(`/api/timers/${roomId}`);
      const serverTime = response.data.data.time;
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

  const updateServerTime = async (currentTime) => {
    if (!isHost || !roomId) return;

    try {
      await axios.put(`/api/timers/${roomId}`, { time: currentTime });
      console.log("Timer updated for room:", roomId, "with time:", currentTime);
    } catch (error) {
      console.error("Error updating timer:", error.response?.data || error.message);
    }
  };

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

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    notify('Copied to clipboard!');
    setShowModal(false);
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

  useEffect(() => {
    let hostTimerInterval;
    let syncTimerInterval;

    if (isHost) {
      console.log("Setting up host timer intervals");
      hostTimerInterval = setInterval(() => {
        console.log("Host requesting current time");

        requestCurrenttime();
        setTimeout(() => {
          updateServerTime(currentPlayerTime);
        }, 1000);
      }, 5000);
    } else {
      console.log("Setting up client sync intervals");
      syncTimerInterval = setInterval(() => {
        console.log("Client syncing with server time");
        syncWithServerTime();
      }, 5000);
    }

    return () => {
      if (hostTimerInterval) clearInterval(hostTimerInterval);
      if (syncTimerInterval) clearInterval(syncTimerInterval);
      console.log("Cleared timer intervals");
    };
  }, [isHost, roomId]);

  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Received message:", event.data, "from origin:", event.origin);

      try {
        if (event.data && event.data.action === 'timeUpdate') {
          const newTime = parseFloat(event.data.time);
          console.log("Received timeUpdate:", newTime);

          if (!isNaN(newTime)) {
            setCurrentPlayerTime(newTime);

            if (isHost) {
              updateServerTime(newTime);
            }
          } else {
            console.warn("Received invalid time value:", event.data.time);
          }
        }

        if (event.data && event.data.action === 'currentTimeResponse') {
          const reportedTime = parseFloat(event.data.time);
          console.log("Received currentTimeResponse:", reportedTime);

          if (!isNaN(reportedTime)) {
            setCurrentPlayerTime(reportedTime);

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


  useEffect(() => {
    const iframe = document.querySelector('#video-player');

    const handleIframeLoad = () => {
      console.log("Iframe loaded, initializing communication");
      setTimeout(() => {
        if (!isHost) {
          syncWithServerTime();
        }
      }, 1000);
    };

    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      return () => iframe.removeEventListener('load', handleIframeLoad);
    }
  }, [roomId, isHost]);

  useEffect(() => {
    console.log("Component mounted, isHost:", isHost, "roomId:", roomId);

    const link = `${window.location.origin}/watch/${movieId}?room=${roomId}`;
    setInviteLink(link);

    if (isHost) {
      createRoomTimer(roomId)
        .then(() => console.log("Room timer created on mount"))
        .catch(error => console.error("Failed to create room on mount:", error));
    } else {
      syncWithServerTime()
        .then(() => console.log("Initial sync with server completed"))
        .catch(error => console.error("Initial sync failed:", error));
    }

    if(!UserNo) {
      configureUser();
    }
    setTimeout(() => {
      axios.get(`/api/timers/${roomId}`)
        .then(response => console.log("Room exists:", response.data))
        .catch(error => {
          console.error("Room doesn't exist, creating it:", error);
          if (isHost) createRoomTimer(roomId);
        });
    }, 2000);
  }, []);

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
            src={`https://uflix.to/mPlayer?movieid=${movieId}&stream=stream3`}
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

      <ToastContainer className="ToastContainer"/>
    </div>
  );
};

export default VideoPlayer;