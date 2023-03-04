const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
// geoCoder will contain the 2 methods we need in order to work with map
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
  const camps = await Campground.find({});
  res.render("campgrounds/index", { camps });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const newCamp = new Campground(req.body.campground);
  newCamp.geometry = geoData.body.features[0].geometry;
  newCamp.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  newCamp.author = req.user._id;
  await newCamp.save();
  req.flash("success", "Successfully created a campground");
  res.redirect(`/campgrounds/${newCamp.id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  const foundCamp = await Campground.findById(id);
  if (!foundCamp) {
    req.flash("error", "Cannot find that Campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { foundCamp });
};

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.images.push(...imgs);
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  await campground.save();
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampgrounds = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the campground");
  res.redirect("/campgrounds");
};
