const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');

exports.resizeAndUpload = (data, context) => {
  const storage = new Storage();
  const { bucket, name } = data;

  if (!name.startsWith('original')) return 1;

  const filename = name.split('/').at(-1);
  const ext = filename.split('.').at(-1).toLowerCase();
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext; // sharp에서는 jpg 대신 jpeg사용합니다
  console.log('name', name, 'ext', ext);

  const file = storage.bucket(bucket).file(name);
  const readStream = file.createReadStream();

  const newFile = storage.bucket(bucket).file(`thumb/${filename}`);
  const writeStream = newFile.createWriteStream();

  readStream
    .pipe(
      sharp()
        .resize(200, 200, { fit: 'inside' })
        .toFormat(requiredFormat)
    )
    .pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve(`thumb/${filename}`);
    });
    writeStream.on('error', reject);
  });
};
