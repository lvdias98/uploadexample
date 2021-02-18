const routes = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerConfig = require('./config/multer.js');

const Post = require('./models/Posts.js');


routes.get('/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

routes.post('/posts', multer(multerConfig).single('file'), async (req, res) => {
  console.log(req.file);
  const { originalname: name, size, key, location: urlOriginal = '' } = req.file;
  const urlResized = (`${key.split('.')[0]}.jpg`).replace('-original.','-resized.');

  await sharp(req.file.path)
    .resize(500)
    .jpeg({ quality: 70 })
    .toFile(
      path.resolve(__dirname,'..', 'tmp', 'uploads', urlResized)
    );

  //fs.unlinkSync(req.file.path);

  const post = await Post.create({
    name,
    size,
    key,
    urlOriginal,
    urlResized
  });

  res.json(post);
});

routes.delete('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);

  await post.remove();

  return res.send();
});

module.exports = routes;
