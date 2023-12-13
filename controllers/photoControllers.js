const Photo = require('../models/Photo')
const fs = require('fs')

exports.getAllPhotes = async (req, res) => {
  try {
    const photos = await Photo.find({}).sort('-dateCreated'); // Fetch photos from the database
    res.render('index', { photos }); // Pass the photos array to the template
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', {
    photo,
  });
};

exports.createPhoto = async (req, res) => {
  console.log('Received POST request for /photos');
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadImage = req.files.image;
  let uploadPath = __dirname + '/../public/uploads/' + uploadImage.name;
  uploadImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadImage.name,
    });
    res.redirect('/');
  });
};

exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  res.redirect(`/photos/${req.params.id}`);
};

exports.deletePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  let deletedImage = __dirname + '/../public' + photo.image;
  if (fs.existsSync(deletedImage)) {
    fs.unlinkSync(deletedImage);
  }
  await Photo.findOneAndDelete(req.params.id);
  res.redirect('/');
};
