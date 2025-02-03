import React, { useState } from 'react';
import FitnessForm from './components/FitnessForm';
import ChatInterface from './components/ChatInterface';

function App() {
  const [messages, setMessages] = useState([]);
  const [fitnessData, setFitnessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId] = useState("user123"); // Mock user ID (replace with real auth system if needed)

  const handleAddFitnessData = async (fitnessDataFromForm) => {
    setFitnessData(fitnessDataFromForm);
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: "Added Fitness Data: " + JSON.stringify(fitnessDataFromForm) },
    ]);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/add-fitness-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, fitness_data: fitnessDataFromForm }),
      });      

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Error saving fitness data." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!fitnessData) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "No fitness data found. Please add your fitness details first." },
      ]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/get-recommendations?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.recommendations },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Error retrieving recommendations." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (chatMessage) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: chatMessage },
    ]);
    setLoading(true);
    try {
      const payload = { user_id: userId, message: chatMessage };
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Error processing your message." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-6 text-center">
        <h1 className="text-4xl font-bold">ChatFit: Personalized Fitness Chatbot</h1>
        <p className="mt-2">
          Get tailored workout and diet recommendations through an interactive chat experience!
        </p>
      </header>
      <div className="flex flex-col lg:flex-row items-stretch">
        <div className="lg:w-1/2 p-6 flex flex-col">
          <div className="w-full">
            <FitnessForm 
              onAddFitnessData={handleAddFitnessData} 
              onGetRecommendations={handleGetRecommendations} 
            />
          </div>
        </div>
        <div className="lg:w-1/2 p-6 flex">
          <div className="w-full">
            <ChatInterface messages={messages} onSendChat={handleChatSubmit} isLoading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
