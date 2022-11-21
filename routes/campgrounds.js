const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { storage } = require('../cloudinary');
const multer = require('multer')
const upload = multer({ storage });

// Campgrounds index
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


// New Campground Route
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Update Camground Routes
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));

// Rendering the edit Route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));

module.exports = router;