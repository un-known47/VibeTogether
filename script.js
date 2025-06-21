// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBjo2d3LYvMYRrnDSwL8dyy9Nx_iPoUOG8",
  authDomain: "vibetogether-af5b4.firebaseapp.com",
  databaseURL: "https://vibetogether-af5b4-default-rtdb.firebaseio.com",
  projectId: "vibetogether-af5b4",
  storageBucket: "vibetogether-af5b4.appspot.com",
  messagingSenderId: "138239111562",
  appId: "1:138239111562:web:cedad002736e5b99835873",
  measurementId: "G-DR2BPFF2P2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Presence system
const userId = "user_" + Math.floor(Math.random() * 1000000);
const presenceRef = database.ref("presence/" + userId);
presenceRef.set(true).then(() => {
  presenceRef.onDisconnect().remove();
});

const statusText = document.getElementById("statusText");
const audioPlayer = document.getElementById("audioPlayer");

// YOUR FULL PLAYLISTS - just list the actual file paths here:
const alonePlaylist = [
  "Alone/song1.mp3",
  "Alone/sad_song.mp3",
  "Alone/my_lonely_night.mp3"
];

const togetherPlaylist = [
  "Together/our_special_night.mp3",
  "Together/love_song.mp3",
  "Together/romantic_vibe.mp3"
];

let currentPlaylist = null;
let currentTrackIndex = 0;

// Start playing a playlist
function startPlayback(playlist) {
  currentPlaylist = playlist;
  currentTrackIndex = 0;
  playCurrentTrack();
}

// Play current track with auto filename extraction
function playCurrentTrack() {
  if (!currentPlaylist) return;
  audioPlayer.pause();
  audioPlayer.src = currentPlaylist[currentTrackIndex];
  audioPlayer.load();
  audioPlayer.play().catch(err => {
    console.error("Playback failed:", err);
  });

  // Auto-extract and format song name
  const filePath = currentPlaylist[currentTrackIndex];
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
  const formattedName = fileName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  updateNowPlaying(formattedName);
}

// Show now playing text
function updateNowPlaying(songName) {
  if (previousMode === "together") {
    statusText.textContent = `Both online! 💕 Playing romantic playlist. 🎵 Now Playing: ${songName}`;
  } else {
    statusText.textContent = `You are alone 😢 Playing alone playlist. 🎵 Now Playing: ${songName}`;
  }
}

// Automatically go to next song after one finishes
audioPlayer.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  playCurrentTrack();
});

// Autoplay trick
audioPlayer.muted = true;
audioPlayer.autoplay = true;
setTimeout(() => { audioPlayer.muted = false; }, 500);

// Monitor presence changes in realtime
let previousMode = null;

database.ref("presence").on("value", snapshot => {
  let usersOnline = snapshot.exists() ? snapshot.numChildren() : 0;
  let newMode = (usersOnline > 1) ? "together" : "alone";

  if (newMode !== previousMode) {
    previousMode = newMode;

    if (newMode === "together") {
      startPlayback(togetherPlaylist);
    } else {
      startPlayback(alonePlaylist);
      sendNotification();
    }
  }
});

// Notifications
function sendNotification() {
  if (Notification.permission === "granted") {
    new Notification("You're listening alone 🎶");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("You're listening alone 🎶");
      }
    });
  }
}
