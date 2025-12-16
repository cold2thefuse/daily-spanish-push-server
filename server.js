import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const app = express();
app.use(cors({
  origin: "https://precious-banoffee-f30011.netlify.app"
}));

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
console.log("PUBLIC:", process.env.VAPID_PUBLIC_KEY ? "LOADED" : "MISSING");
console.log("PRIVATE:", process.env.VAPID_PRIVATE_KEY ? "LOADED" : "MISSING");
console.log("MAILTO:", process.env.MAILTO ? "LOADED" : "MISSING");
webpush.setVapidDetails(
  "mailto:you@example.com",
  process.env.VAPID_PUBLIC_KEY,
process.env.VAPID_PRIVATE_KEY
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
// Endpoint to get VAPID public key for the browser
app.get("/vapidPublicKey", (req, res) => {
  res.type("text/plain").send(process.env.VAPID_PUBLIC_KEY);
});

app.listen(3000, () => console.log("Server running on port 3000"));
