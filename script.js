// Your config (same as before, fully correct)
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

// Presence logic
const userId = "user_" + Math.floor(Math.random() * 1000000);
const presenceRef = database.ref("presence/" + userId);
presenceRef.set(true).then(() => {
  presenceRef.onDisconnect().remove();
});

const statusText = document.getElementById("statusText");
const audioPlayer = document.getElementById("audioPlayer");

const alonePlaylist = [
  "Alone/I'm tired.mp3",
  "Alone/song2.mp3"
];
const togetherPlaylist = [
  "Together/tum hi aana.mp3",
  "Together/song2.mp3"
];

database.ref("presence").on("value", snapshot => {
  let usersOnline = 0;
  if (snapshot.exists()) {
    usersOnline = snapshot.numChildren();
  }
  console.log("Users online:", usersOnline);

  if (usersOnline > 1) {
    statusText.textContent = "Both online! 💕 Playing romantic playlist.";
    playPlaylist(togetherPlaylist);
  } else {
    statusText.textContent = "You are alone 😢 Playing alone playlist.";
    playPlaylist(alonePlaylist);
    sendNotification();
  }
});

function playPlaylist(playlist) {
  let current = 0;
  function playNext() {
    audioPlayer.src = playlist[current];
    audioPlayer.play();
    current = (current + 1) % playlist.length;
  }
  playNext();
  audioPlayer.onended = playNext;
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
