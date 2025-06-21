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

const alonePlaylist = [
  "Alone/song1.mp3",
  "Alone/song2.mp3"
];
const togetherPlaylist = [
  "Together/song1.mp3",
  "Together/song2.mp3"
];

let currentPlaylist = null;
let currentTrackIndex = 0;

function startPlayback(playlist) {
  currentPlaylist = playlist;
  currentTrackIndex = 0;
  playCurrentTrack();
}

function playCurrentTrack() {
  if (!currentPlaylist) return;
  audioPlayer.src = currentPlaylist[currentTrackIndex];
  audioPlayer.play().catch(err => {
    console.error("Playback failed:", err);
  });
}

audioPlayer.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
  playCurrentTrack();
});

// Initial autoplay trick
audioPlayer.muted = true;
setTimeout(() => { audioPlayer.muted = false; }, 500);

// Monitor presence changes
database.ref("presence").on("value", snapshot => {
  let usersOnline = snapshot.exists() ? snapshot.numChildren() : 0;

  let newPlaylist = (usersOnline > 1) ? togetherPlaylist : alonePlaylist;

  if (newPlaylist !== currentPlaylist) {
    // Switch playlist instantly if status changes
    if (usersOnline > 1) {
      statusText.textContent = "Both online! 💕 Playing romantic playlist.";
    } else {
      statusText.textContent = "You are alone 😢 Playing alone playlist.";
      sendNotification();
    }
    startPlayback(newPlaylist);
  } else {
    console.log("Presence changed but playlist remains same");
  }
});

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
