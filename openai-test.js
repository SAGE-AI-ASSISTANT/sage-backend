const  OpenAI = require('openai');
require("dotenv").config()

const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(configuration);


async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();