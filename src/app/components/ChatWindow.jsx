import React, { useState, useEffect, useRef } from "react";
import logo from "../../../public/images/axim-logo.svg";
import Image from "next/image";

const ChatWindow = ({ onClose, isVisible }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const username = "User";


  const messagesEndRef = useRef(null);

  const defaultBotReply = `Aximsoft facilitates startups to build the future. Our incubation program is conceptualized to bring ideas to life and to be always with you through the startup lifecycle. We strive to build extraordinary technology products and solutions that drive some of the brightest ideas and innovations.
  Founded in 2005, Aximsoft is a full-scale technology firm headquartered in the USA with an offshore development center in India.
  Aximsoft helps push the limits of what’s possible. We research, collaborate and innovate to put the latest technologies to work for you.`;

  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chatMessages");
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages);

      if (parsedMessages.some(msg => msg.sender === "user")) {
        setShowIntro(false);
      }
    }
  }, []);


  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chatMessages", JSON.stringify(messages));
      scrollToBottom();
    }
  }, [messages]);

  // 🔸 Typewriter effect function (not used but kept for later use)
  const typeWriterEffect = (message) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1),
          { text: message.slice(0, i + 1), sender: "bot" },
        ]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 10);
  };

  const sendMessage = async (message, sender) => {
    if (message.trim() !== "") {
      if (showIntro && sender === 'user') {
        setShowIntro(false);
      }

      setMessages((prevMessages) => [...prevMessages, { text: message, sender }]);

      if (sender === "user") {
        setLoading(true);

        const allowedQuestions = [
          "About",
          "About you",
          "About aximsoft",
          "Tell me about Aximsoft",
          "About us",
          "Tell me about you",
          "Tell me about yourself"
        ];

        // Normalize function: lowercase + remove spaces
        const normalize = str => str.toLowerCase().replace(/\s+/g, "");

        // try {
        //   const normalizedInput = normalize(message);
        //   const match = allowedQuestions.some(q => normalize(q) === normalizedInput);

        //   const reply = match
        //     ? defaultBotReply
        //     : "I'm here to help! Can you please be more specific or ask something else?";

        //   setMessages((prevMessages) => [...prevMessages, { text: reply, sender: "bot" }]);
        // } 
        try {
          const input = message.toLowerCase();

          const keywords = ["about", "aximsoft", "yourself", "you", "aboutus"];

          const isMatch = keywords.some((keyword) => input.includes(keyword));

          const reply = isMatch
            ? defaultBotReply
            : "I'm here to help! Can you please be more specific or ask something else?";

          setMessages((prevMessages) => [...prevMessages, { text: reply, sender: "bot" }]);
        }
        catch (error) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: "Sorry, something went wrong. Please try again.", sender: "bot" }
          ]);
        } finally {
          setLoading(false);
        }
      }
    }
  };



  const handleButtonClick = () => {
    if (inputMessage.trim() !== "") {
      sendMessage(inputMessage, "user");
      setInputMessage("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleButtonClick();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  };

  return (
    <>
      <div className="header w-full flex justify-between absolute z-10">
        <div className="axim-logo">
          <Image src={logo} alt="logo" />
        </div>
        <div onClick={onClose} aria-label="Close" className="c-point close-icon">
          <img src="/images/close-icon.svg" alt="close" className="h-8 w-auto" />
        </div>
      </div>

      <div className="fixed inset-0 z-0 backdrop-blur-lg bg-black/30 transition-opacity duration-300" />
      <div
        className={`chat-bot transition-all duration-300 transform ${isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
          }`}
      >
        <div className="absolute w-full chatbot-wrp">
          <div className="messages overflow-y-auto">
            <div className={`msg-wrp ${showIntro ? "msg-intro-wrap" : ""}`}>
              {showIntro && (
                <div className="flex items-center gap-2 mb-3 bot-message justify-start">
                  <div className="text-msg intro-msg">How can I help you?</div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 mb-3 ${msg.sender === "user"
                    ? "user-message justify-end"
                    : "bot-message justify-start"
                    }`}
                >
                  <div className="text-msg">{msg.text}</div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="chat__txt--wrp flex flex-col justify-center items-center">
            <input
              type="text"
              value={inputMessage}
              placeholder="TYPE HERE"
              className="chat-input text-center"
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
          </div>
          <div className="btn-wrp">
            <button
              className="btn p-0 c-point"
              onClick={handleButtonClick}
              disabled={loading || inputMessage.trim() === ""}
            >
              SEND
            </button>
          </div>

          <div className="flex icon-wrp items-center justify-center">
            <img src='/images/fb-icon.svg' alt="Facebook" />
            <img src='/images/link-icon.svg' alt="LinkedIn" />
            <img src='/images/twit-icon.svg' alt="Twitter" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
