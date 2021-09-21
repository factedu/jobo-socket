const socket = io();

let myVideoStream;
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

/**
 * Create connection to peer
 */
const peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "5000"
});



/*
Get user's media
*/
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    /**
     * on peer called this user
     */
    peer.on("call", (call) => {

        //answer the call with own stream
        call.answer(stream);
        const video = document.createElement("Video");

        /**
         * on stream received from the peer
         */
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });

        socket.on('user-disconnected', () => {
            console.log('user disconnected');
            video.remove();
        });

    });

    socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
    });

});

/**
 * connect to new user who joined the room
 * @param {string} userId 
 * @param {HTMLMediaStream} stream 
 */
const connectToNewUser = (userId, stream) => {
    console.log(`Calling userID:${userId}`);
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        console.log(`Received stream from other user`);
        addVideoStream(video, userVideoStream);
    });
}

//on peer open event get the id and join the room
peer.on("open", (id) => {
    console.log(id);
    socket.emit("join-room", ROOM_ID, id);
})




/**
 * add video stream to given video element
 * @param {HTMLElemnet} video 
 * @param {HTMLMediaStream} stream 
 */
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};


// handle mute , video 
const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
});

inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});