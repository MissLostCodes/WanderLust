const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const Review = require("../models/reviews");
const { reviewSchema } = require("../schema");
const { validateReview , isReviewAuthor }=require("../middleware.js");
const {isLoggedIn} = require("../middleware.js");

console.log('Listing Schema:', Review);
console.log('Listing Schema:', Listing);



// Add Review
router.post(
  "/", isLoggedIn , 
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id ;
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success" , "New Review Created");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review
router.delete(
  "/:reviewId", isLoggedIn , isReviewAuthor ,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review ID from the reviews array in the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review document from the database
    await Review.findByIdAndDelete(reviewId);
    req.flash("success" , "Review Deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
