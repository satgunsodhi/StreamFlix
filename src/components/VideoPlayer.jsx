import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Users, X, Send, ThumbsUp } from 'lucide-react';
import { movies } from '../data/movies';

const VideoPlayer = () => {
  const { movieId } = useParams();
  const [roomId, setRoomId] = useState(null);
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

  const allMovies = [...movies.trending, ...movies.action, ...movies.comedy];
  const movie = allMovies.find(m => m.id === parseInt(movieId));

  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    const link = `${window.location.origin}/watch/${movieId}?room=${newRoomId}`;
    setInviteLink(link);
    setShowModal(true);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
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
    }
  }, []);

  return (
    <div className="video-player-container">
      <div className="video-section">
        {/* Movie title */}
        <div className="video-info">
          <h1 className="video-title">{movie?.title}</h1>
        </div>

        {/* Video player */}
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
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