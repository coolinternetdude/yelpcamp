const mongoose = require("mongoose");
const Review = require("./review");
const opts = { toJSON: { virtuals: true } };
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundShcema = new Schema(
  {
    title: String,
    price: Number,
    images: [imageSchema],
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundShcema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="\ /campgrounds/${this._id}"\> ${this.title}</a></strong>`;
});

CampgroundShcema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const res = await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", CampgroundShcema);
