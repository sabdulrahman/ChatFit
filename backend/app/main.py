from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from fastapi.middleware.cors import CORSMiddleware
import ollama
import logging

logging.basicConfig(level=logging.INFO)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FitnessDataRequest(BaseModel):
    age: int
    weight: float       
    height: float      
    fitnessLevel: str
    dietaryPreferences: str = ""
    workoutGoal: str = ""

#In-memory storage for chat history and fitness data
chat_histories: Dict[str, List[Dict[str, str]]] = {}
fitness_data_store: Dict[str, FitnessDataRequest] = {}

class ChatMessageRequest(BaseModel):
    user_id: str  #Unique identifier for chat history tracking, can be used later if needed
    message: str
    
def call_ollama(user_id: str, chat: str, model: str = "deepseek-r1:7b") -> str: #change model name if needed
    """
    Call the Ollama model with the user's chat history and return its response.
    """
    try:
        if user_id not in chat_histories:
            chat_histories[user_id] = []
        
        chat_histories[user_id].append({"role": "user", "content": chat})
        
        response = ""
        stream = ollama.chat(model=model, messages=chat_histories[user_id], stream=True)
        
        for chunk in stream:
            part = chunk['message']['content']
            response += part
        
        chat_histories[user_id].append({"role": "assistant", "content": response})
        return response
    except Exception as e:
        logging.error(f"Ollama model call failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process with Ollama.")

class AddFitnessDataRequest(BaseModel):
    user_id: str
    fitness_data: FitnessDataRequest

@app.post("/add-fitness-data")
async def add_fitness_data(request: AddFitnessDataRequest):
    """
    Store the user's fitness data for future chat interactions.
    """
    fitness_data_store[request.user_id] = request.fitness_data
    return {"message": "Fitness data added successfully."}


@app.post("/get-recommendations")
async def get_recommendations(user_id: str):
    """
    Generate personalized workout and diet recommendations based on stored fitness data.
    """
    if user_id not in fitness_data_store:
        raise HTTPException(status_code=400, detail="No fitness data found for this user.")
    
    fitness_data = fitness_data_store[user_id]
    prompt = (
        "Generate personalized workout and diet recommendations for the following fitness data:\n"
        f"Age: {fitness_data.age}\n"
        f"Weight: {fitness_data.weight} kg\n"
        f"Height: {fitness_data.height} cm\n"
        f"Fitness Level: {fitness_data.fitnessLevel}\n"
        f"Dietary Preferences: {fitness_data.dietaryPreferences}\n"
        f"Workout Goal: {fitness_data.workoutGoal}\n"
    )
    
    recommendations = call_ollama(user_id, prompt, model="deepseek-r1:7b")
    return {"recommendations": recommendations}

@app.post("/chat")
async def chat(chat_request: ChatMessageRequest):
    try:
        user_id = chat_request.user_id
        logging.info(f"Received chat message from {user_id}: {chat_request.message}")
        
        if user_id in fitness_data_store:
            fitness_data = fitness_data_store[user_id]
            fitness_context = (
                f"User's Fitness Data:\n"
                f"Age: {fitness_data.age}\n"
                f"Weight: {fitness_data.weight} kg\n"
                f"Height: {fitness_data.height} cm\n"
                f"Fitness Level: {fitness_data.fitnessLevel}\n"
                f"Dietary Preferences: {fitness_data.dietaryPreferences}\n"
                f"Workout Goal: {fitness_data.workoutGoal}\n"
            )
            prompt = fitness_context + chat_request.message
        else:
            prompt = chat_request.message
        
        reply = call_ollama(user_id, prompt, model="deepseek-r1:7b") #change model name if needed
        return {"reply": reply}
    except Exception as e:
        logging.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat message.")

@app.get("/")
async def root():
    """
    Root endpoint.
    """
    return {"message": "FastAPI backend for ChatFit is running!"}
