import joi = require('@hapi/joi')

 const studentSchema = joi.object({
    reg_name: joi.string().required(),
    initials: joi.string().uppercase(),
    first_name: joi.string().min(3).required(),
    last_name: joi.string().min(3),
    guardian_name: joi.string().min(3).required(),
    street_no: joi.string(),
    first_lane: joi.string().min(3).required(),
    second_lane: joi.string().min(3),
    city: joi.string().min(3),
    gender: joi.string().valid('MALE','FEMALE').required(),
    contact: joi.string().regex(/^07[0-9]{8}$/),
    active: joi.string().valid('YES','NO'),
    grade: joi.number().min(1).max(13).required(),
    section: joi.string().valid('A','B','C','D','E','F','G').required(),
    year: joi.number().min(2010).max(2100).required()
});
const resetPasswordSchema = joi.object({
    reg_name: joi.string().required(),
    password: joi.string().required(),
    newPassword: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required()
});

export {studentSchema,resetPasswordSchema};
