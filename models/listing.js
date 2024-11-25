const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js"); 
const listingSchema = new mongoose.Schema({
  title:String,
  description: String,
  image: String,
  price: Number,
  location: String,
  country: String,
  reviews :[{  // array 
        type: Schema.Types.ObjectId ,
        ref : "Review" , 
  }] ,
  owner : {
    type: Schema.Types.ObjectId,
    ref: "User" , 
  }
});

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    // Delete all reviews associated with the listing
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});


module.exports = mongoose.model("Listing", listingSchema);;

