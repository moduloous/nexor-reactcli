const axios = require('axios');
const fs = require('fs');
const path = require('path');

const fonts = ['Regular', 'Bold', 'Medium', 'SemiBold', 'Light'];

async function download() {
  for (const font of fonts) {
    const url = `https://raw.githubusercontent.com/coreyhu/Urbanist/main/fonts/ttf/Urbanist-${font}.ttf`;
    const dest = path.join(__dirname, 'assets', 'fonts', `Urbanist-${font}.ttf`);
    console.log(`Downloading ${font}...`);
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });
      const writer = fs.createWriteStream(dest);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      console.log(`Saved ${font}`);
    } catch (e) {
      console.error(`Error downloading ${font}:`, e.message);
    }
  }
}

download();
