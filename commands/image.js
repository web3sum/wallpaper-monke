const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('node:path');
const https = require('https');
const { URL } = require('node:url');
const fetch = require('node-fetch');

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
    const id = interaction.options.getInteger('id');
    const user = interaction.user;
    // console.log(id);
    if (id < 1 || id > 5000) {
      await interaction.reply(
        `hey <@${user.id}>, id must be between 1 and 5000!`
      );
      return;
    }
    await interaction.reply(
      `hey <@${user.id}>, hang tight! monke #${id} will swing around soon!`
    );

    const canvas = Canvas.createCanvas(1170, 2532);
    const ctx = canvas.getContext('2d');
    console.log('yo');
    // const url = await fetch('https://github.com/web3sum/wallpaper-monke/blob/main/1170/1.png')
    const buffer = await getBufferFromUrl(
      // 'https://github.com/web3sum/wallpaper-monke/blob/main/1170/1.png'
      'https://drive.google.com/file/d/156YX_aC0duPJ9Zb7JYMEDgD34o1PcXHB/view?usp=sharing'
    );
    // let blob = await fetch(
    //   'https://github.com/web3sum/wallpaper-monke/blob/main/1170/1.png'
    // ).then((r) => r.blob());
    // blob = blob.slice(0, blob.size, 'image/png');
    console.log(buffer);
    const monke = await Canvas.loadImage(buffer);
    // 'https://drive.google.com/file/d/156YX_aC0duPJ9Zb7JYMEDgD34o1PcXHB/view?usp=sharing'

    // path.join(__dirname, '..', '1170', `${id}.png`)
    // `../img/${interaction.options.getString('id')}.png`
    const color = interaction.options.getString('color');
    const background = await Canvas.loadImage(
      path.join(__dirname, '..', 'phone', `ip12-${color}.png`)
    );
    ctx.drawImage(background, 0, 0);
    // ctx.imageSmoothingEnabled = false;
    // ctx.imageSmoothingEnabled = false;

    // ctx.imageSmoothingQuality = 'low';
    ctx.drawImage(monke, 0, 1362);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: `${id}.png`,
    });
    await interaction.followUp({ files: [attachment] });
  },
};

async function getBufferFromUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      const body = [];
      response
        .on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          resolve(Buffer.concat(body));
        });
    });
  });
}
