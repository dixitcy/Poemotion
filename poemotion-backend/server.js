require("dotenv").config();
const OpenAI = require("openai");

console.log(`process.env.OPENAI_API_KEY`, process.env.OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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



app.post("/generate-count", async (req, res) => {
  console.log(`generate-count api`);
  try {
    const completion = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          {
            role: "user",
            content:
              "Write a small poem about singing in the bathroom",
          },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0,
        stream: true, // Stream the response
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        responseType: "stream", // Stream the response
      }
    );

    

    const sseClient = res;

    // Function to send data to the SSE client
    const sendToClient = (chunkMessage) => {
      if (chunkMessage) {
        console.log(`chunkMessage`, chunkMessage)
        sseClient.write(`data: ${chunkMessage}\n\n`);
      }
    };

    // Continuously send data to the SSE client as it arrives
    let mainMessage = ''

    completion.data.on("data", (chunk) => {
      // Convert the binary chunk to a string
      const chunkMessage2 = chunk.toString().trim();
    
      // Check if the chunk starts with "data:"
      if (chunkMessage2.startsWith("data:")) {
        // Extract the JSON part after "data:"
        const jsonData = chunkMessage2.substring("data:".length);

        console.log(`jsonData`, jsonData)
        console.log(`jsonData`, jsonData)
    
        try {
          const chunkData = JSON.parse(jsonData);

          console.log(`chunkData`, chunkData)
          if (chunkData.choices && chunkData.choices[0].delta && chunkData.choices[0].delta.content) {
            const content = chunkData.choices[0].delta.content;
            if (content) {
              console.log(`Received content:`, content);
              mainMessage += content;
            }
          }
        } catch (error) {
          console.error("Error parsing chunk:", error);
          // Handle JSON parsing error here if needed
        }
      }
    });

    // On completion of streaming, close the response stream
    completion.data.on("end", () => {
      console.log(`mainMessage`, mainMessage)
      sseClient.end();
    });
  } catch (error) {
    console.log(`error with openai chat completion api`);
    res.status(500).json({ error: "Failed to generate text." });
  }
});

app.post("/generate-text", async (req, res) => {
  console.log(`generate-text api`);
  try {
    const { prompt } = req.body;

    

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Write a small poem about singing in the bathroom" },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 20,
      stream: true
    });

    
    console.log(completion.toString());

            // Set headers for SSE
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
          });


        // Iterate through the stream of events
        for await (const chunk of completion) {
          // Handle each chunk
          console.log("chunk");
          console.log(chunk);
          const message = chunk.choices[0].delta;
          if (message) {
              console.log("message");
              console.log(message);
              console.log(message.content);
              res.write(`data: ${JSON.stringify(message.content)}\n\n`);

          }
      }

  } catch (error) {
    console.log(`error with openai chat completion api`);
    res.status(500).json({ error: "Failed to generate text." });
  }
});


wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
      console.log('Received message:', message);
      
      // Parse the received message as JSON
      const { prompt } = JSON.parse(message);

      console.log("prompt")
      console.log(prompt)

      // Call OpenAI API
      try {
          const completion = await openai.chat.completions.create({
              messages: [
                  { role: "system", content: "You are a helpful assistant." },
                  { role: "user", content: prompt },
              ],
              model: "gpt-3.5-turbo",
              max_tokens: 100,
              stream: true
          });

          console.log("completion")
          console.log(completion)

          for await (const chunk of completion) {
            console.log(`chunk`)
            console.log(chunk)
              const content = chunk.choices[0].delta?.content;
              if (content) {
                console.log('content')
                console.log(chunk.choices[0].delta)
                console.log(content)
                  ws.send(content);
              }
          }
      } catch (error) {
          console.error('Error with OpenAI chat completion:', error);
          ws.send(JSON.stringify({ error: "Failed to generate text." }));
      }
  });

  ws.on('close', () => {
      console.log('Client disconnected');
  });
});

app.post("/generate-and-stream", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Generate text from OpenAI
    const genResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        prompt,
        max_tokens: 50, // Adjust token limit as per your requirement
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        responseType: "stream", // Stream the response
      }
    );

    // Pipe the generated text stream back to the client
    genResponse.data.pipe(res, { end: false }); // Use { end: false } to keep the response open for additional data

    // On completion of streaming, perform sentiment analysis
    genResponse.data.on("end", async () => {
      try {
        // Extract the generated text from the prompt
        const generatedPoem = genResponse.data.read().toString().trim();

        // Perform sentiment analysis on the generated poem using an external sentiment analysis API
        const sentimentAnalysis = await axios.post(
          "https://api.some-sentiment-analysis-service.com/analyze", // Replace with your sentiment analysis API endpoint
          {
            text: generatedPoem,
          },
          {
            headers: {
              "Content-Type": "application/json",
              // Add any necessary headers or authentication for the sentiment analysis service
            },
          }
        );

        // Send the emotional content JSON back to the client
        res.json(sentimentAnalysis.data);
      } catch (error) {
        res.status(500).json({ error: "Failed to analyze text." });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate text." });
  }
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
