
const input = document.querySelector('#text');
const chatContainer = document.querySelector('#chat-container')
const btn = document.querySelector('#btn')
const Id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
input.addEventListener('keyup', handleEvent);
btn.addEventListener('click', handleClick);

// loading-----
const loading = document.createElement('div');
loading.className = 'my-6 text-gray-400 italic text-sm animate-pulse';
loading.textContent = 'Thinking...';




async function generate(text){
const msg = document.createElement('div');
msg.className = `bg-neutral-800 max-w-fit ml-auto rounded-xl p-3 my-6 lg:my-10`;
msg.textContent = text;
chatContainer?.appendChild(msg)
input.value = ''
chatContainer.appendChild(loading);
window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
const assistant = await callServer(text);
console.log(assistant)
const assistantMsg = document.createElement('div');
assistantMsg.className = `max-w-fit my-5 lg:my-10`;
assistantMsg.textContent = assistant;
loading.remove();
chatContainer?.appendChild(assistantMsg)
window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}


async function callServer(text){
  const response = await fetch('http://localhost:3000/chat',{
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({Id, message: text})
  })
if (!response.ok) {
  const errorMsg = document.createElement('div');
  errorMsg.className = `
    bg-red-500/30 
    border border-red-500 
    text-red-300 
    rounded-xl 
    p-3 
    max-w-fit 
    my-5 
    text-sm 
    font-medium
    backdrop-blur-sm
  `;
  errorMsg.textContent = "⚠️ Oops! Something went wrong. Please try again later.";
  chatContainer?.appendChild(errorMsg);

  throw new Error(`Request failed with status ${response.status}`);
}

  const result = await response.json();
  return result.data;
}


async function handleClick(e){
  const text = input?.value.trim();
      if(!text){
      return;
    }
    await generate(text)
}




async function handleEvent(e) {
  if (e.key === 'Enter') {
    const text = input?.value.trim();
    if(!text){
      return;
    }
    await generate(text)
  }
  
}
