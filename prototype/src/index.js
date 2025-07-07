require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let channel;
async function initQueue() {
  const conn = await amqp.connect(process.env.AMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('zoho_events');
}
initQueue().catch(console.error);

app.post('/zoho/webhook', async (req, res) => {
  await channel.sendToQueue('zoho_events', Buffer.from(JSON.stringify(req.body)));
  res.sendStatus(200);
});

app.get('/projects/:id', async (req, res) => {
  res.json({ projectId: req.params.id, message: 'stub' });
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Listening on ${port}`)); 