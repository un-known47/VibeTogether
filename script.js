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

// Autoplay trick: preload muted first
audioPlayer.muted = true;

const alonePlaylist = [
  "Alone/song1.mp3",
  "Alone/song2.mp3"
];
const togetherPlaylist = [
  "Together/song1.mp3",
  "Together/song2.mp3"
];

let selectedPlaylist = [];

database.ref("presence").on("value", snapshot => {
  let usersOnline = 0;
  if (snapshot.exists()) {
    usersOnline = snapshot.numChildren();
  }
  console.log("Users online:", usersOnline);

  if (usersOnline > 1) {
    statusText.textContent = "Both online! 💕 Playing romantic playlist.";
    selectedPlaylist = togetherPlaylist;
  } else {
    statusText.textContent = "You are alone 😢 Playing alone playlist.";
    selectedPlaylist = alonePlaylist;
    sendNotification();
  }

  // Once we know the playlist, start autoplay muted
  if (selectedPlaylist.length > 0) {
    playPlaylist(selectedPlaylist);
  }
});

function playPlaylist(playlist) {
  let current = 0;
  function playNext() {
    audioPlayer.src = playlist[current];
    audioPlayer.play().catch(err => {
      console.error("Autoplay blocked:", err);
    });
    current = (current + 1) % playlist.length;
  }
  playNext();
  audioPlayer.onended = playNext;

  // After short delay unmute
  setTimeout(() => {
    audioPlayer.muted = false;
  }, 500);
}

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
