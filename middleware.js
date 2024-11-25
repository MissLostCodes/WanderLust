const Listing = require("./models/listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError");
const {listingSchema , reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req ,res , next )=>{
    console.log(req.user);
    console.log("User Authenticated:", req.isAuthenticated());
    console.log("Session Data:", req.session);

    if(!req.isAuthenticated()){
        //  redirect url
        req.session.redirectUrl = req.originalUrl ;
        req.flash("error" , "you must be logged in ! ");
        return res.redirect("/login");
      }
      next();
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // Pass the redirect URL to the response locals
    }
    next(); // Proceed to the next middleware or route handler
};

module.exports.isOwner = async (req , res , next)=>{
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error" , "You don't have permission to Edit this listing ");
      return res.redirect(`/listings/${id}`);
    }
    next();
};
// Validation middleware
module.exports.validateListing = (req, res, next) => {
    console.log('req.body:', req.body);  // Log the body of the request
    console.log('listingSchema:', listingSchema); 
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(", ");
      //next(new ExpressError(msg, 400));
      req.flash('error', msg);
      return res.redirect('/listings/new');
    } else {
      next();
    }
  };
  
  // Validate reviews middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(". ");
      throw new ExpressError(errMsg, 400);
    } else {
      next();
    }
  };
  module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;

    try {
        const review = await Review.findById(reviewId).populate('owner');

        // Ensure review exists
        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect(`/listings/${id}`);
        }

        // Ensure review has an owner
        if (!review.owner) {
            req.flash("error", "Review has no associated owner.");
            return res.redirect(`/listings/${id}`);
        }

        // Ensure the current user is the owner
        if (!review.owner.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the author of this review.");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong.");
        res.redirect(`/listings/${id}`);
    }
};
