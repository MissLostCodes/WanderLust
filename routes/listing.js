const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const {isLoggedIn} = require("../middleware.js");
const { listingSchema } = require('../schema');
const {isOwner , validateListing} = require("../middleware.js");
//const username = require("../models/user.js");
console.log('Listing Schema:', Listing);


// Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

// New Route
router.get("/new", isLoggedIn , (req, res) => {
  console.log(req.user);
  res.render("listings/new");
});

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // Populates the author field in each review
        model: "User",
      },
    }).populate("owner");
    if(!listing){
        req.flash("error" , "Listing Does Not Exist");
        res.redirect("/listings");
    }
    res.render("listings/show", { listing });
  })
);

// Create Route
router.post(
  "/", 
  isLoggedIn , 
  validateListing ,
 
  wrapAsync(async (req, res ,  next ) => {
    console.log('req.body:', req.body);
    const { error } = listingSchema.validate(req.body);
    if (error) {
      console.error('Validation Error:', error.details);
      return res.status(400).send('Validation Failed');
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id ;
    await newListing.save();
    req.flash("success" , "New Listing Created")
    res.redirect("/listings");
  })
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn , 
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "This Listing Does Not Exist");
        res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
  })
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner , 
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    await Listing.findByIdAndUpdate(id, req.body.listing  , {
        new: true,
      } );
    req.flash("success" , "Listing Updated");
    res.redirect(`/listings/${id}`);
  })
 
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn ,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , "Listing Deleted");
    res.redirect("/listings");
  })
);

module.exports = router;
