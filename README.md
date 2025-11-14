#### 🚀 Full Travel Booking App Inside ChatGPT

ChatGPT released its **Apps SDK**, marking a major evolution in how people interact with AI!  
Now, ChatGPT is not just a chatbot — it’s a **full platform** where developers can build and run **interactive apps directly inside the chat**.

With an audience of over 1 billion weekly users, apps have the potential to be seen by an exceptionally large user base.

#### 🎯 In this video, we’ll explore

- 🌍 How we built a **full Travel Booking app inside ChatGPT**, accessible to over 1 billion weekly users
- 🏨 How the app connects to the **Booking.com API via RapidAPI** to search destinations and hotels
- 💳 How we integrated **Stripe Checkout** for secure test-mode payments
- 🔐 How **OAuth + Google Sign-In** authenticate users directly inside ChatGPT
- 🧭 How prompts dynamically load multiple **UI views** (destinations, hotels, payments) inside the conversation
- 🧩 How the **MCP route** renders widgets and connects tools to your backend
- 🐞 A live walkthrough of **debugging the entire flow** from ChatGPT prompts to backend tool execution
- 🌐 How **ngrok** connects the local MCP server to ChatGPT during development
- 📂 How bookings and payments are **stored in MongoDB** and retrieved inside ChatGPT

#### 👉 Links & Resources

- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/)
- [Multi-Modal MCP Server/Client](https://github.com/Ashot72/Multi-Modal-MCP-Server-Client)
- [Vercel Labs Next.js Starter Template](https://github.com/vercel-labs/chatgpt-apps-sdk-nextjs-starter)
- [Ngrok](https://ngrok.com/)

#### 💡 Requirements

You’ll need a **ChatGPT Plus or Pro plan** to develop and test your app — free users don’t yet have access to the Apps SDK environment.

---

---

#### 🚀 Clone and Run

```bash
# Clone the repository
git clone https://github.com/Ashot72/chatgpt-full-travel-booking-app

# Navigate into the project directory
cd chatgpt-full-travel-booking-app

# Copy the environment template and add your actual API keys
cp env-template.txt .env.local

# Install dependencies
pnpm install

# Start the development server
pnpm run dev

# The app will be available at http://localhost:3000
```

#### 🛠 Debugging in VS Code

- Open the **Run** view (`View → Run` or `Ctrl+Shift+D`) to access all debug configurations.

📺 **Video:** [Watch on YouTube](https://youtu.be/IE90MgQJ0FA)
