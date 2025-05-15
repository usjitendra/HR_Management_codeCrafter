import { body, validationResult } from "express-validator";

const employeMiddleware = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("mobile is required")
    .isNumeric()
    .withMessage("mobile number must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("mobile number must be exactly 10 digits"),
  // body("dob")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("dob date is required")
  //   .isISO8601()
  //   .withMessage("Invalid date format. Use YYYY-MM-DD"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export default employeMiddleware;
