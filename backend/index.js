import Groq from "groq-sdk";
import dotenv from "dotenv";
import {tavily} from "@tavily/core"
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
dotenv.config(); 
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



async function main(){
  const rl = readline.createInterface({ input, output });
  const messages = [
    {
     role: 'system',
     content: `Your are Pinku and you are a personal assistant and always be polite. Search the latest information and real time data on the internet. you have access to follow tools. 1. webSearch({query}): {query: string}.
     current date and time: ${new Date().toUTCString()}
     `
    },
  ];


while(true){
 const question = await rl.question('You: ')
 messages.push({
  role: 'user',
  content: question,
 })
 if(question === 'bye'){
  break;
 }
  while(true){
const completion = await groq.chat.completions.create({
  //don't use temperature and top_p both at a time
  temperature: 0,  // {range 0 - 2}
  // top_p: 0, // range (0 - 1)
  // max_completion_tokens: '',
  // max_tokens: '',
  // frequency_penalty: '',
  // presence_penalty: '',
  model: 'llama-3.3-70b-versatile',
  // response_format: {type: 'json_object'},
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
  console.log('Assistant:', completion.choices[0].message.content)
  break;
 }
for(let tool of tollCalls){
  // console.log(`tool:`, tool)
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
  // console.log('tool result:', toolResult)
  }
}
}
}


 rl.close();

//  console.log(JSON.stringify(completion.choices[0].message, null, 2))

}
main()


async function webSearch({query}){
 const response = await tvly.search(query);
 const finalResult = response.results.map(result => result.content).join('\n\n')
//  console.log(finalResult)
  return finalResult;

}


