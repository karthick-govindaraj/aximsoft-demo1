import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
// import logo from "../../../public/images/axim-logo.svg";
import logoMini from "../../../public/images/logo-white.svg";
import { sendQueryToAPI } from "../../utils/chatApi";
import { v4 as uuidv4 } from "uuid";
import btnGrey from "../../../public/images/btn-grey.svg";
import btnClr from "../../../public/images/btn-clr.svg";

const ChatWindow = ({ onClose, isVisible }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef(null);

  // Session ID stored in sessionStorage
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem("chatSessionId");
    if (existing) return existing;
    const newId = uuidv4();
    sessionStorage.setItem("chatSessionId", newId);
    return newId;
  });

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  };

  //typewriter effect
  const typeWriterEffect = (message) => {
    let i = 0;
    const batchSize = 8;
    const total = message.length;

    const interval = setInterval(() => {
      if (i < total) {
        i += batchSize;
        const nextText = message.slice(0, i);
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1),
          { text: nextText, sender: 'bot' }
        ]);
      } else {
        clearInterval(interval);
      }
    }, 1);
  };


  const sendMessage = async (message, sender) => {
    if (message.trim() === "") return;

    if (showIntro && sender === "user") {
      setShowIntro(false);
    }

    setMessages((prev) => [...prev, { text: message, sender }]);

    if (sender === "user") {
      setLoading(true);

      const loadingMsgIndex = messages.length + 1;
      const newBotMessage = { text: "", sender: "bot", isStreaming: true };
      setMessages((prev) => [...prev, newBotMessage]);
      try {
        const stream = await sendQueryToAPI(message, sessionId);
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");

        let done = false;
        let buffer = "";
        let fullMessage = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (let line of lines) {
            line = line.trim();
            if (line.startsWith("data:")) {
              const content = line.replace(/^data:\s*/, "");

              if (content) {
                fullMessage += content + " ";
              }
            }
          }
        }

        // Now display using the typewriter effect
        typeWriterEffect(fullMessage.trim());

      } catch (error) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[loadingMsgIndex] = {
            text: "Something went wrong. Try again later.",
            sender: "bot",
          };
          return updated;
        });
      } finally {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[loadingMsgIndex]) {
            updated[loadingMsgIndex].isStreaming = false;
          }
          return updated;
        });
        setLoading(false);
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

  return (
    <>
      <div className="header w-full flex justify-between absolute z-10">
        <div className="axim-logo">
          <Image src={logoMini} alt="logo" />
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
                  {msg.isLoading || msg.isStreaming ? (
                    <div className="loader d-flex align-items-center justify-content-between">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  ) : (
                    <div className="text-msg">{msg.text}</div>
                  )}
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
            <Image
              src={inputMessage.trim() === "" ? btnGrey : btnClr}
              onClick={handleButtonClick}
              alt="button"
              className="btn-img"
            />

          </div>
          {/* <div className="btn-wrp">
            <button
              className="btn p-0 c-point"
              onClick={handleButtonClick}
              disabled={loading || inputMessage.trim() === ""}
            >
              SEND
            </button>
          </div> */}

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