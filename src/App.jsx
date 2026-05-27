import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { motion } from "framer-motion";
import DeepARCamera from "./DeepARCamera";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TOKEN = null;
const CHANNEL = "room";

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localTracks = useRef({ audioTrack: null, videoTrack: null });

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("room");
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [filter, setFilter] = useState("normal");
  const [beautyLevel, setBeautyLevel] = useState(100);
  const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
const [reactions, setReactions] = useState([]);
  const [blurBackground, setBlurBackground] = useState(false);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    let interval;

    if (joined) {
      interval = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [joined]);

  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        const remoteContainer = document.getElementById("remote-video");
        if (remoteContainer) {
          user.videoTrack.play(remoteContainer);
        }
      }

      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    };

    const handleUserUnpublished = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = "";
      }
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
    };
  }, []);

  const joinCall = async () => {
    if (
  joined ||
  client.connectionState === "CONNECTING" ||
  client.connectionState === "CONNECTED"
) {
  return;
}

    try {
      await client.join(APP_ID, room, TOKEN, null);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      localTracks.current.audioTrack = audioTrack;
      localTracks.current.videoTrack = videoTrack;

      if (videoTrack && localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMic = async () => {
    const audioTrack = localTracks.current.audioTrack;
    if (!audioTrack) return;

    await audioTrack.setEnabled(!micOn);
    setMicOn((current) => !current);
  };

  const toggleCamera = async () => {
    const videoTrack = localTracks.current.videoTrack;
    if (!videoTrack) return;

    await videoTrack.setEnabled(!cameraOn);
    setCameraOn((current) => !current);
  };

  const leaveCall = async () => {
    const audioTrack = localTracks.current.audioTrack;
    const videoTrack = localTracks.current.videoTrack;

    if (audioTrack) {
      audioTrack.stop();
      audioTrack.close();
      localTracks.current.audioTrack = null;
    }

    if (videoTrack) {
      videoTrack.stop();
      videoTrack.close();
      localTracks.current.videoTrack = null;
    }

    await client.leave();
    setJoined(false);
    setCallTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const filterClass = `
brightness-[${beautyLevel}%]
contrast-[105%]
saturate-[130%]
`;

  const backgroundBlurClass = blurBackground ? "backdrop-blur-2xl" : "";

  if (!joined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white/10 p-10 rounded-3xl text-white w-[350px]">
          <h1 className="text-4xl font-bold mb-6 text-center">Dreamy Call</h1>

          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 rounded-2xl bg-black/30 mb-4"
          />

          <input
            type="text"
            placeholder="Room code"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-4 rounded-2xl bg-black/30 mb-6"
          />

          <button
            onClick={joinCall}
            className="w-full bg-pink-500 py-4 rounded-2xl"
          >
            Join Call
          </button>
        </div>
      </div>
    );
  }
const sendMessage = () => {
  if (!message.trim()) return;

  setMessages([
    ...messages,
    {
      user: username || "You",
      text: message,
    },
  ]);

  setMessage("");
};
const sendReaction = (emoji) => {
  const id = Date.now();

  setReactions((prev) => [
    ...prev,
    { id, emoji },
  ]);

  setTimeout(() => {
    setReactions((prev) =>
      prev.filter((r) => r.id !== id)
    );
  }, 4000);
};
  return (
    <div className={`min-h-screen overflow-hidden relative bg-black flex items-center justify-center ${backgroundBlurClass}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: 800,
              x: Math.random() * window.innerWidth,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: -200,
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            className="absolute text-pink-400 text-2xl"
          >
            💖
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
        className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]"
      />

      <motion.div
        animate={{
          x: [0, -120, 120, 0],
          y: [0, 80, -80, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
        className="absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]"
      />

      <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
  {reactions.map((reaction) => (
    <motion.div
      key={reaction.id}
      initial={{
        y: 300,
        opacity: 0,
        scale: 0.5,
        x: Math.random() * window.innerWidth,
      }}
      animate={{
        y: -400,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.3, 1],
      }}
      transition={{
        duration: 4,
      }}
      className="absolute text-5xl"
    >
      {reaction.emoji}
    </motion.div>
  ))}
</div>
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -1000],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 shadow-[0_0_80px_rgba(255,0,120,0.25)] p-8 rounded-[40px] bg-black/80"
      >
        <h1 className="text-white text-6xl font-bold mb-8 tracking-wide">Dreamy Call</h1>

        <div className="text-white text-xl mb-4 text-center">⏳ {formatTime(callTime)}</div>

        <div className="flex flex-col md:flex-row gap-6 flex-wrap justify-center">
          <div className="relative">
            <div className={filterClass}>
              <DeepARCamera filter={filter} />
            </div>
            <div className="absolute top-4 left-4 bg-pink-500 px-4 py-1 rounded-full text-white text-sm">YOU</div>
          </div>

          <div className="relative">
            <div
              id="remote-video"
              ref={remoteVideoRef}
              className="w-[320px] h-[450px] rounded-[30px] overflow-hidden border border-white/20 bg-black"
            />
            <div className="absolute top-4 left-4 bg-blue-500 px-4 py-1 rounded-full text-white text-sm">FRIEND</div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={toggleMic}
            className={`px-5 py-3 rounded-full text-white ${micOn ? "bg-pink-500" : "bg-gray-600"}`}
          >
            {micOn ? "Mic ON" : "Mic OFF"}
          </button>

          <button
            onClick={toggleCamera}
            className={`px-5 py-3 rounded-full text-white ${cameraOn ? "bg-blue-500" : "bg-gray-600"}`}
          >
            {cameraOn ? "Camera ON" : "Camera OFF"}
          </button>

          <button
            onClick={leaveCall}
            className="px-5 py-3 rounded-full bg-red-500 text-white"
          >
            End Call
          </button>
        </div>

        <div className="flex gap-4 mt-6 overflow-x-auto max-w-[700px] pb-2">

  {[
  { name: "Natural", value: "normal", emoji: "✨" },
  { name: "Beauty", value: "beauty", emoji: "💄" },
  { name: "Soft", value: "soft", emoji: "🌸" },
  { name: "Glow", value: "glow", emoji: "💫" },
].map((item) => (
              <button
      key={item.value}
      onClick={() => setFilter(item.value)}
      className={`min-w-[110px] px-4 py-4 rounded-3xl transition-all text-white border ${
        filter === item.value
          ? "bg-pink-500 border-pink-300 scale-105"
          : "bg-white/10 border-white/10"
      }`}
    >
      
      <div className="text-2xl mb-1">
        {item.emoji}
      </div>

      <div className="text-sm">
        {item.name}
      </div>
    </button>
  ))}
</div>
<div className="mt-4 w-full max-w-[400px]">

  <div className="text-white mb-2 text-center">
    Beauty Level ✨ {beautyLevel}
  </div>

  <input
    type="range"
    min="80"
    max="140"
    value={beautyLevel}
    onChange={(e) =>
      setBeautyLevel(e.target.value)
    }
    className="w-full"
  />
</div>
<div className="mt-6 w-full max-w-[700px] bg-white/10 rounded-3xl p-4">

  <div className="h-[200px] overflow-y-auto mb-4">
    {messages.map((msg, index) => (
      <div
        key={index}
        className="text-white mb-2"
      >
        <span className="font-bold">
          {msg.user}:
        </span>{" "}
        {msg.text}
      </div>
    ))}
  </div>

  <div className="flex gap-3">
    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Type message..."
      className="flex-1 p-3 rounded-2xl bg-black/20 text-white outline-none"
    />

    <button
      onClick={sendMessage}
      className="bg-pink-500 px-5 rounded-2xl text-white"
    >
      Send
    </button>
    
  </div>
  <div className="flex gap-3 mt-4 justify-center">
  {["❤️", "✨", "😭", "🔥", "🌸"].map((emoji) => (
    <button
      key={emoji}
      onClick={() => sendReaction(emoji)}
      className="text-3xl hover:scale-125 transition"
    >
      {emoji}
    </button>
  ))}
</div>
</div>
      </motion.div>
    </div>
  );
}
