  const Joi = require('joi');

  const currentYear = new Date().getFullYear();

<<<<<<< HEAD
  const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number().allow(null),
    albumId: Joi.string().allow(null),
  });

  module.exports = { SongPayloadSchema };
=======
module.exports = { SongPayloadSchema };
>>>>>>> de9a78b3570f4fe59bfa05ac0df35b5f95e6ed13
