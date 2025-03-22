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
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isNumeric()
    .withMessage("Phone number must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits"),
  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isString()
    .withMessage("Department must be a string"),
  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isString()
    .withMessage("Designation must be a string"),
  body("salary")
    .trim()
    .notEmpty()
    .withMessage("Salary is required")
    .isNumeric()
    .withMessage("Salary must be a number"),
  body("joiningDate")
    .trim()
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid date format. Use YYYY-MM-DD"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export default {employeMiddleware};
