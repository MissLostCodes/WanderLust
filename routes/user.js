const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport =  require("passport");
const { saveRedirectUrl} = require("../middleware.js");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post(
    "/signup",
    wrapAsync(async (req, res) => {
        try {
            let { username, email, password } = req.body; // Correct destructuring
            const newUser = new User({ email, username }); // Proper variable name
            const registeredUser = await User.register(newUser, password); // Await async operation
            console.log(registeredUser);
            req.login(registeredUser , (err) =>{
            if(err){
                return next(err) ;
            }

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
        } catch (e) {
            req.flash("error", e.message); // Handle errors with a flash message
            res.redirect("/signup");
        }
    })
);

router.get("/login" , (req , res) => {
    res.render("users/login.ejs");
});

router.post("/login" ,
    saveRedirectUrl , 
     passport.authenticate("local" , {
     failureRedirect: '/login' , 
     failureFlash:  true }) , async(req , res)=> {
        
        console.log("Session After Login:", req.session);
        let redirectUrl = res.locals.redirectUrl || "/listings" ;
        delete req.session.redirectUrl;

        req.flash("success" ,"Login Successful ! Welcome to WanderLust !")
        res.redirect(redirectUrl);
    }  );

    router.get("/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You are logged out!");
            res.redirect("/listings");
        });
    });
    

module.exports = router;
