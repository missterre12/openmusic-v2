const { SongPayloadSchema } = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    return validationResult;
  },
};
<<<<<<< HEAD
module.exports = SongsValidator;
=======
module.exports = SongsValidator;
>>>>>>> de9a78b3570f4fe59bfa05ac0df35b5f95e6ed13
