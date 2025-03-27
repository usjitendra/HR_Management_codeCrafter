import { body, validationResult } from "express-validator";

const registrationMiddleware = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .matches(/^[a-zA-Z ]+$/).withMessage("Name must contain only letters and spaces"),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email")
        .normalizeEmail(),

    body("mobile")
        .notEmpty().withMessage("Mobile number is required")
        .isMobilePhone().withMessage("Enter a valid mobile number")
        .isLength({ min: 10, max: 15 }).withMessage("Mobile number must be between 10 to 15 digits"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),

   

    body("role")
        .optional()
        .isIn(["admin", "user","employee"]).withMessage("Role must be either 'admin' or 'user'"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export { registrationMiddleware };
