const { body } = require("express-validator");

const validateScan = [
  body("text")
    .exists()
    .withMessage("Text is required")
    .bail()
    .isString()
    .withMessage("Text must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Text cannot be empty")
    .isLength({ max: 50000 })
    .withMessage("Text cannot exceed 50,000 characters"),
];

module.exports = {
  validateScan,
};