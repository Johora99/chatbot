import express from 'express';
import { generate } from './chatbot.js';
import cors from 'cors'
const app = express();
const port = 3000;

app.use(express.json())
app.use(cors())
app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.post('/chat', async(req, res)=>{
  const {message, Id} = req.body;
  if(!message || !Id){
    return res.status(400).json({message: 'All field are required'})
  }
  // console.log(message)
  const result = await generate(message, Id);
  res.json({data: result})
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
