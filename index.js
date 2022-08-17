const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');

const storage = new Storage();
exports.resizeAndUpload = (data, context) => {
  const { bucket, name } = data;

  if (!name.startsWith('original')) return 1;

  const ext = name.split('.').at(-1).toLowerCase();
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext; // sharp에서는 jpg 대신 jpeg사용합니다
  console.log('bucket', bucket, 'name', name, 'ext', ext);

  const file = storage.bucket(bucket).file(name);
  const readStream = file.createReadStream();

  const newFile = storage.bucket(bucket).file(name.replace(/^original/, 'thumb'));
  const writeStream = newFile.createWriteStream();

  sharp(readStream)
    .resize(200, 200, { fit: 'inside' })
    .toFormat(requiredFormat)
    .pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve(`thumb/${name}`);
    });
    writeStream.on('error', reject);
  });
};
