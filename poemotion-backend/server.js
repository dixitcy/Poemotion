require("dotenv").config();
const OpenAI = require("openai");

console.log(`process.env.OPENAI_API_KEY`, process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const cors = require("cors"); // Import the cors middleware

const express = require("express");
const axios = require("axios"); // Import the axios library
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app); // Create a server instance

const port = process.env.PORT || 5001; // Use the port specified in .env or default to 5000

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ server }); // Attach WebSocket to the server

app.get("/", (req, res) => {
  res.send("Hello World!");
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    console.log("Received message:", message);

    // Parse the received message as JSON
    const { prompt } = JSON.parse(message);

    console.log("prompt");
    console.log(prompt);

    // Call OpenAI API
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 100,
        stream: true,
      });

      console.log("completion");
      console.log(completion);

      let generatedText = "";

      for await (const chunk of completion) {
        console.log(`chunk`);
        console.log(chunk);
        const content = chunk.choices[0].delta?.content;
        if (content) {
          console.log("content");
          console.log(chunk.choices[0].delta);
          console.log(content);
          generatedText += content;

          // ws.send(content);
          ws.send(JSON.stringify({ type: "generatedText", content: content }));
        }
      }

      ws.send(JSON.stringify({ type: "poemFinished" }));
      // Emotion Analysis using Twinword API
      const encodedParams = new URLSearchParams();
      encodedParams.set("text", generatedText);

      const options = {
        method: "POST",
        url: "https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key":
            "059a7106e7msh5cf40afc19d999dp16c3a7jsn505d229be5f1",
          "X-RapidAPI-Host": "twinword-emotion-analysis-v1.p.rapidapi.com",
        },
        data: encodedParams,
      };

      const emotionResponse = await axios.request(options);
      console.log("Emotion Analysis: ", emotionResponse.data);

      // Send the emotion analysis to the WebSocket client
      ws.send(
        JSON.stringify({
          type: "emotionAnalysis",
          content: emotionResponse.data,
        })
      );
    } catch (error) {
      console.error("Error with OpenAI chat completion:", error);
      ws.send(JSON.stringify({ error: "Failed to generate text." }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
