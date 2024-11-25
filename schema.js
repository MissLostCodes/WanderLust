const Joi = require('joi'); 

const listingSchema = Joi.object({
    listing: Joi.object({                                       // 
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().uri().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
       
       
       
    }).required(),
});



const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

module.exports = { reviewSchema , listingSchema };
// inko export issi format mein karna padega nahi toh koi ek hi model work karega 
