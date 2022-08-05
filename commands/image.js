const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const https = require('https');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monke')
    .setDescription('wallpaper for your monke!')
    .addIntegerOption((option) =>
      option
        .setName('id')
        .setDescription('the id of your monke!')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('color')
        .setDescription('color of the background')
        .setRequired(true)
        .addChoices(
          { name: 'yellow', value: 'yellow' },
          { name: 'orange', value: 'orange' },
          { name: 'pink', value: 'pink' },
          { name: 'purple', value: 'purple' },
          { name: 'blue', value: 'blue' },
          { name: 'green', value: 'green' }
        )
    ),
  async execute(interaction) {
    await fullImage(interaction);
  },
};

async function bufferToCanvas(buffer) {
  return await Canvas.loadImage(buffer);
}

async function fullImage(interaction) {
  const id = interaction.options.getInteger('id');
  const user = interaction.user;
  if (id < 1 || id > 5000) {
    await interaction.reply(
      `hey <@${user.id}>, id must be between 1 and 5000!`
    );
    return;
  }

  await interaction.reply(
    `hey <@${user.id}>, hang tight! monke #${id} will swing around soon!`
  );
  const options_monke = {
    hostname: 'raw.githubusercontent.com',
    path: `/web3sum/monke-24px/main/${id}.png`,
  };

  const canvas = Canvas.createCanvas(1170, 2532);
  const ctx = canvas.getContext('2d');

  const monke_req = https.get(options_monke, (res) => {
    const monke_data = [];
    res
      .on('data', (d) => {
        monke_data.push(d);
      })
      .on('end', async () => {
        const monke_buffer = Buffer.concat(monke_data);
        const monke_canvas = await bufferToCanvas(monke_buffer);

        const color = interaction.options.getString('color');
        const options_phone = {
          hostname: 'raw.githubusercontent.com',
          path: `/web3sum/monke-1170px/main/ip12-${color}.png`,
        };
        const phone_req = https.get(options_phone, (res) => {
          const phone_data = [];
          res
            .on('data', (d) => {
              phone_data.push(d);
            })
            .on('end', async () => {
              const phone_buffer = Buffer.concat(phone_data);
              const phone_canvas = await bufferToCanvas(phone_buffer);

              ctx.drawImage(phone_canvas, 0, 0);
              ctx.drawImage(monke_canvas, 0, 1362, 1170, 1170);

              const attachment = new AttachmentBuilder(
                await canvas.encode('png'),
                {
                  name: `${id}.png`,
                }
              );
              await interaction.followUp({ files: [attachment] });
            });
        });
        phone_req.end();
      });
  });
  monke_req.end();
}

// imageSmoothingEnabled is broken on mac darwin (arm i think) so possibly will be fine on render (assuming linux)
