import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const app = express();
app.use(cors());
app.use(express.json());

// Spanish words (can be expanded anytime)
const words = [
  { word: "Hola", meaning: "Hello" },
  { word: "Gracias", meaning: "Thank you" },
  { word: "Perro", meaning: "Dog" },
  { word: "Casa", meaning: "House" },
  { word: "Comer", meaning: "To eat" }
];

let pushSubscriptions = [];

// Set VAPID keys with environment variables
webpush.setVapidDetails(
  "mailto:you@example.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  pushSubscriptions.push(subscription);
  res.status(201).json({ message: "Subscribed" });
});

app.get('/send', async (req, res) => {
  const word = words[Math.floor(Math.random() * words.length)];
  
  const payload = JSON.stringify({
    title: word.word,
    body: `Meaning: ${word.meaning}`
  });

  for (const sub of pushSubscriptions) {
    await webpush.sendNotification(sub, payload).catch(() => {});
  }

  res.json({ message: "Notifications sent!" });
});

app.get('/', (req, res) => {
  res.send("Push server running!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
