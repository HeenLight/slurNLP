import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
import dotenv from "dotenv";
dotenv.config();
import * as toxicity from "@tensorflow-models/toxicity";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
const model = toxicity.load().then(console.log("Model loaded"));

const toxicityEmbed = new EmbedBuilder();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return false;
  console.log(`Message from ${message.author.username}: ${message.content}`);
  //const predictions = await model.classify(message.content);
  const predictions = (await model)
    .classify(message.content)
    .then((predictions) => {
      predictions.forEach((item) => {
        if (item.results[0].match === true) {
          console.log(`Name: ${item.label}`);
          console.log(
            `Probabilities: ${JSON.stringify(item.results[0].probabilities)}`
          );
          console.log(`Match: ${item.results[0].match}`);
          toxicityEmbed.setTitle(`Toxicity log for ${message.author.username}`);
          toxicityEmbed.setColor("#FF0000");
          toxicityEmbed.setTimestamp();
          toxicityEmbed.addFields(
            { name: `Message:`, value: `${message.content}` },
            {
              name: `Name: ${item.label}`,
              value: `Probabilities: ${JSON.stringify(
                item.results[0].probabilities
              )}`,
            },
            {
              name: `Match:`,
              value: `${item.results[0].match}`,
            }
          );
          message.reply({ embeds: [toxicityEmbed] });
        }
      });
    });
});

client.login(process.env.token);
