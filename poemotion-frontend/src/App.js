import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import { motion } from "framer-motion";
import Prompt from "./components/Prompt";
import { Input } from "./components/Input";
import EmotionPiechart from "./components/EmotionPiechart";

function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [emotionData, setEmotionData] = useState(null);


  const [messages, setMessages] = useState([]); // Ensure this line is present
  const [websocket, setWebsocket] = useState(null); // Ensure this line is present
  const [expanded, setExpanded] = useState(false);

  const connectWebSocket = (prompt) => {
    // Close existing connection if any
    if (websocket) {
      websocket.close();
    }

    const ws = new WebSocket("ws://localhost:5001");

    ws.onopen = () => {
      console.log("Connected to the server");
      // Send a message to the server to start the OpenAI stream
      ws.send(
        JSON.stringify({
          prompt: `Write a small 6 line poem about ${prompt}`,
        })
      );
    };

    ws.onmessage = (event) => {
      console.log("new message");
      console.log(event);
      let data = JSON.parse(event.data)
      console.log(data)
      // console.log(typeof(event.data))
      
      if (data.type == "emotionAnalysis") {
        console.log("emotionAnalysis")
        console.log(data.content)
        // const data = JSON.parse(data.data);
        console.log(data)
        // const contentJson = JSON.parse(data.emotionAnalysis.content);

        // console.log(contentJson)

          setEmotionData(data.content); // Update state with emotion data
      } else {
          setMessages((prev) => prev + data.content); // Handle other messages
      }
      // ws.send(JSON.stringify({ prompt: prompt }));
    };

    ws.onclose = () => {
      console.log("Disconnected from the server");
      setWebsocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setWebsocket(null);
    };

    setWebsocket(ws);
  };

  const toggleExpand = (prompt) => {
    if(!expanded){
      setExpanded(!expanded);
    }
    
    // generateText()
    setMessages([]);
    connectWebSocket(prompt);
  };

  return (
    <div className="App bg-zinc-800 h-full">
      <header></header>
      <Prompt expanded={expanded} toggleExpand={toggleExpand} />
      <div className="h-full">
      <motion.div
      className={`relative bg-gray-100 h-full w-1/2 left-1/2 transition-all  ${
        messages.length > 0
          ? "items-start"
          : "max-w-screen-md mx-auto "
      }`}
      initial={{ 
        scale: 0
       }}
      animate={{
        scale: messages.length > 0 ? "1" : "0",
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex w-full h-full flex-col items-center justify-center ">
        <div className=" text-lg p-4 basis-1/2 text-center align-center flex items-center whitespace-pre-line">
          {messages}
          
        </div>
        <div className="w-full basis-1/2">
        {emotionData && <EmotionPiechart emotionData={emotionData} />}
        </div>
        </div>
        </motion.div>
        </div>
    </div>
  );
}

export default App;
