import Groq from "groq-sdk";
import dotenv from "dotenv";
import {tavily} from "@tavily/core"
dotenv.config(); 
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
console.log(process.env.TAVILY_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export async function generate(userMessage){
const messages = [
  {
    role: 'system',
    content: `You are Nova, an intelligent and polite personal assistant. 
You provide accurate, up-to-date information and can access real-time data from the internet using the tools available to you. 
Always respond clearly, courteously, and helpfully. 
Tools you can use: 
1. webSearch({query}): {query: string} use this to search the internet for current or unknown information.
decide when to use your own knowledge and when to use the tool.
Don't mention the tool unless needed
Current date and time: ${new Date().toUTCString()}`
  },
];

 messages.push({
  role: 'user',
  content: userMessage,
 })
  while(true){
const completion = await groq.chat.completions.create({
  temperature: 0, 
  model: 'llama-3.3-70b-versatile',
  messages: messages,
  tools: [
    {
      "type": "function",
      "function": {
        "name": "webSearch",
        "description": "Search the latest information and real time data on the internet.",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "The search query to perform search on"
            },
          },
          "required": ["query"]
        }
      }
    }
  ],
  tool_choice: 'auto'
 })


  messages.push(completion.choices[0].message)
 const tollCalls = completion.choices[0].message.tool_calls;
 if(!tollCalls){
  return completion.choices[0].message.content;
 }
for(let tool of tollCalls){
  const functionName = tool.function.name;
  const functionParams = tool.function.arguments;
  if(functionName === 'webSearch'){
  const toolResult = await webSearch(JSON.parse(functionParams))
  messages.push({
    tool_call_id: tool.id,
    role: 'tool',
    name: functionName,
    content: toolResult,
  })
  }
}
}



}
async function webSearch({query}){
 const response = await tvly.search(query);
 const finalResult = response.results.map(result => result.content).join('\n\n')
  return finalResult;

}


