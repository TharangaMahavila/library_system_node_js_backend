import joi = require('@hapi/joi')

 const staffSchema = joi.object({
    nic: joi.string().regex(/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/).required(),
    name: joi.string().min(3).required(),
    contact: joi.string().regex(/^07[0-9]{8}$/),
    street_no: joi.string(),
    first_lane: joi.string().min(3).required(),
    second_lane: joi.string().min(3),
    city: joi.string().min(3),
    gender: joi.string().valid('MALE','FEMALE').required(),
    salary_no: joi.string().min(3).required(),
    active: joi.string().valid('YES','NO')
});
const resetPasswordSchema = joi.object({
    nic: joi.string().regex(/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/).required(),
    password: joi.string().required(),
    newPassword: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required()
});

export {staffSchema,resetPasswordSchema};
