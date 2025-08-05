import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.messages import HumanMessage, AIMessage

from ..config import settings
from ..models.message import Message as MessageModel

class LangChainService:
    def __init__(self):
        try:
            self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=settings.GOOGLE_API_KEY)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize LangChain LLM: {e}")

    def generate_response(self, chat_history: list[MessageModel], prompt: str) -> dict:
        """
        Generates a response from the AI using the conversation history.
        """
        print(f"🧠 [LangChain] Generating response for prompt: '{prompt}'") # <-- ADD THIS LINE
        memory = ConversationBufferMemory()
        
        # Load previous messages into memory
        for msg in chat_history:
            if msg.role == 'user':
                memory.chat_memory.add_message(HumanMessage(content=msg.content))
            elif msg.role == 'assistant':
                memory.chat_memory.add_message(AIMessage(content=msg.content))

        conversation = ConversationChain(
            llm=self.llm,
            memory=memory,
            verbose=False # Set to True for debugging
        )
        
        start_time = time.time()
        try:
            response = conversation.predict(input=prompt)
            end_time = time.time()
            
            return {
                "content": response,
                "metadata": {
                    "model": "gemini-pro",
                    "responseTime": round(end_time - start_time, 2)
                }
            }
        except Exception as e:
            # Handle potential API errors gracefully
            print(f"Error calling Gemini API: {e}")
            return {
                "content": "I'm sorry, I encountered an error and couldn't process your request.",
                "metadata": {
                    "model": "gemini-pro",
                    "error": str(e)
                }
            }