const Groq = require("groq-sdk");
require("dotenv").config()

const groq = new Groq({apiKey: process.env.GROQ_API_KEY})


async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

async function getGroqChatCompletion(messages) {
  return groq.chat.completions.create({
    messages: [
      ...messages
    ],
    model: "llama3-8b-8192",
  });
}

module.exports = {main, getGroqChatCompletion}


