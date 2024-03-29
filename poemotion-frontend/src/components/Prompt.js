/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import {
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";

const moods = [
  {
    name: "Excited",
    value: "excited",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-500",
  },
  {
    name: "Loved",
    value: "loved",
    icon: HeartIcon,
    iconColor: "text-white",
    bgColor: "bg-pink-400",
  },
  {
    name: "Happy",
    value: "happy",
    icon: FaceSmileIcon,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Sad",
    value: "sad",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Thumbsy",
    value: "thumbsy",
    icon: HandThumbUpIcon,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
  },
  {
    name: "I feel nothing",
    value: null,
    icon: XMarkIcon,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Example = ({ toggleExpand, expanded }) => {
  const [selected, setSelected] = useState(moods[5]);

  const [messages, setMessages] = useState([]); // Ensure this line is present
  const [websocket, setWebsocket] = useState(null); // Ensure this line is present

  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");

  const [response, setResponse] = useState("");

  //   useEffect(() => {
  //     const ws = new WebSocket('ws://localhost:5001');

  //     ws.onopen = () => {
  //         console.log('Connected to the server');
  //         // You can send messages to the server here
  //         // ws.send('Hello from the client!');
  //     };

  //     ws.onmessage = (event) => {
  //         setMessages(prev => [...prev, event.data]);
  //     };

  //     ws.onclose = () => {
  //         console.log('Disconnected from the server');
  //     };

  //     setWebsocket(ws);

  //     return () => {
  //         ws.close();
  //     };
  // }, []);

  const generateText = async () => {
    try {
      const response = await axios.post("http://localhost:5001/generate-text", {
        prompt,
      });
      // Assuming your Express route sends back plain text, you can update the state with the response data
      setResponse(response.data);
    } catch (error) {
      console.error("Failed to generate text:", error);
    }
  };

  return (
    <motion.div
      className={`absolute p-4 z-10 ${
        expanded ? "items-start w-full" : "max-w-screen-md mx-auto"
      }`}
      initial={{
        width: "50%",
        left: "25%",
        top: "40%",
      }}
      animate={{
        width: expanded ? "40%" : "50%",
        left: expanded ? "5%" : "25%",
        top: expanded ? "30%" : "40%",
      }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`flex items-start space-x-4 w-full ${expanded ? "" : ""}`}
      >
        <div className="w-1/2 flex-1">
          <div className="relative">
            <div className="overflow-hidden bg-stone-900 shadow-lg rounded-lg text-lg">
              <label htmlFor="comment" className="sr-only">
                Describe the poem you want to generate ...
              </label>
              {/* <motion.textarea
          rows={1}
          className={`animated-text-area ${expanded ? 'expanded' : ''}`}
          placeholder="Describe the poem you want to generate ..."
          animate={{ width: expanded ? '50%' : '100%' }}
          transition={{ duration: 0.5 }}
        /> */}
              <textarea
                rows={expanded ? 4 : 1}
                name="comment"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                id="comment"
                className="block w-full resize-none border-0 bg-transparent py-2.5 text-gray-700 placeholder:text-gray-400 focus:ring-0 sm:font-medium sm:text-xl sm:leading-6"
                placeholder="Describe the poem you want to generate ..."
                defaultValue={""}
              />

              {/* Spacer element to match the height of the toolbar */}
              <div className="py-2" aria-hidden="true">
                {/* Matches height of button in toolbar (1px border + 36px content height) */}
                <div className="py-px">
                  <div className="h-9" />
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
              <div className="flex items-center space-x-5">
                <div className="flex items-center"></div>
              </div>
              <div className="flex-shrink-0 flex items-center">
                <button
                  type="button"
                  className={`inline-flex items-center rounded-md border border-orange-500 mr-4 cursor-pointer text-white hover:bg-orange-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 px-3 py-2 text-sm font-semibold  shadow-sm`}
                  onClick={() => toggleExpand(prompt)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                    />
                  </svg>
                  Random
                </button>
                <button
                  type="button"
                  disabled={prompt == ""}
                  className={`inline-flex items-center rounded-md ${
                    prompt == ""
                      ? "bg-gray-200 text-gray-400"
                      : "bg-orange-500 text-white cursor-pointer hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  } px-3 py-2 text-sm font-semibold  shadow-sm`}
                  onClick={() => toggleExpand(prompt)}
                >
                  Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Example;
