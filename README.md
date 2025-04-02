# StreamFlix - A Netflix Clone with Watch Party Feature

StreamFlix is a full-stack web application that emulates Netflix's core functionality while adding a unique watch party feature that allows users to watch content synchronously with friends.

Code live here: https://web-programming-assignment.onrender.com/

## 🚀 Features

- **Content Browsing**: Browse movies categorized as Trending, Action, and Comedy
- **Search Functionality**: Search for specific titles or descriptions
- **Video Playback**: Stream video content through embedded players
- **Watch Party**: Create watch parties and invite friends to watch together
- **Synchronized Playback**: Video playback stays synchronized across all users in a room
- **Chat System**: Comment and engage with other viewers
- **Responsive Design**: Works on various screen sizes

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Lucide React (for icons)
- Axios (for API calls)
- React Toastify (for notifications)
- UUID (for generating unique IDs)
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- RESTful API architecture

## 📋 Project Structure

### Backend

```
backend/
├── config/
│   └── db.js
├── controller/
│   └── timer.controller.js
├── models/
│   └── timer.model.js
├── routes/
│   └── timer.route.js
└── server.js
```

### Frontend

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── MovieRow.jsx
│   │   ├── Navbar.jsx
│   │   └── VideoPlayer.jsx
│   ├── data/
│   │   └── movies.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## 🔧 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/streamflix.git
cd streamflix
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment setup**

Create a `.env` file in the backend directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
```

4. **Run the application**

```bash
# Run backend (from backend directory)
npm start

# Run frontend (from frontend directory)
npm run dev
```

## 💻 Watch Party Functionality

The core feature of this application is the watch party functionality that allows multiple users to watch content synchronously:

1. **Creating a Room**:
   - When a user starts a video, they can click "Invite People" to create a watch party
   - A unique room ID is generated
   - A sharable link is created for inviting others

2. **Joining a Room**:
   - Users can join by clicking on the shared link
   - The system tracks the number of users in a room (limited to 5)

3. **Synchronization**:
   - The host's playback time is continuously synced to a MongoDB Timer collection
   - Client users periodically fetch the updated time from the server
   - If there's a significant time difference (>10 seconds), the client's video position adjusts

4. **Real-time Communication**:
   - Users can comment on videos in real-time
   - A simplified chat system shows all participants' messages

## 🌟 Key Components

### Timer API
Manages watch party synchronization through the following endpoints:
- POST `/api/timers` - Create a new room timer
- GET `/api/timers/:name` - Get timer details by room name
- PUT `/api/timers/:name` - Update timer information

### VideoPlayer Component
The most complex component that:
- Embeds video content
- Manages room creation and joining
- Handles playback synchronization
- Provides the watch party UI

### MovieRow Component
Features a horizontally scrolling list of movies with:
- Automatic card width calculation
- Dynamic visibility based on screen size
- Smooth scrolling animation

## 📱 Responsive Design

The application is fully responsive with:
- Flexible layouts that adapt to different screen sizes
- Mobile-friendly controls and navigation
- Optimized video player for various devices

## 🔒 Limitations

- No authentication system implemented yet
- Watch party rooms limited to 5 concurrent users
- No persistent chat history between sessions

## 🔮 Future Enhancements

- User authentication and profiles
- Enhanced chat features with emojis and reactions
- Screen sharing capabilities
- Custom user avatars and presence indicators
- Video quality selection options
- Private/password protected rooms

## 📄 License

This project is intended for educational purposes only. The Netflix branding and references are used for learning purposes.

## 📬 Contact

For questions or suggestions, please open an issue in this repository.