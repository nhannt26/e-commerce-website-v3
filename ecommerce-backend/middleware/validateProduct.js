const { validateProductData } = require('../utils/validation');
const { ValidationError } = require('../utils/errors');

const validateProduct = (req, res, next) => {
    const validation = validateProductData(req.body, false);

    if (!validation.isValid) {
        throw new ValidationError('Validation failed', validation.errors);
    }

    next();
};

const validateProductUpdate = (req, res, next) => {
    // Ensure request body is not empty
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ValidationError('No fields provided for update', {
            body: 'At least one field must be provided',
        });
    }

    // true = update mode (all fields optional)
    const validation = validateProductData(req.body, true);

    if (!validation.isValid) {
        throw new ValidationError('Validation failed', validation.errors);
    }

    next();
};

module.exports = { validateProduct, validateProductUpdate };
