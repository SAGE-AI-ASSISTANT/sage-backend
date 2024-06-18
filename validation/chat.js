const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateChatInput(data) {
    let errors = {};


    data.creator = !isEmpty(data.creator) ? data.creator : '';
    data.course = !isEmpty(data.course) ? data.course : '';

    if(Validator.isEmpty(data.creator)) {
        errors.creator = 'Creator ID is required';
    }

    if(Validator.isEmpty(data.course)) {
        errors.course = 'Course ID is required';
    }

    try {
        if((data.messages !== undefined) && data.messages?.length > 0 && Array.isArray(data.messages) ){
            data.messages.forEach((element, i) => {
                if(Validator.isEmpty(element?.role)) {
                    errors.messages = 'Error in messages';
                }
                if(!(element.role === "user") && !(element.role === "system")) {
                    errors.messages = 'Error in messages roles';
                }
                if(Validator.isEmpty(element?.content)) {
                    errors.messages = 'Error in messages content';
                }
            });
            
        } else {
            errors.messages = 'A Message is required';
        }

    } catch(error) {
        errors.messages = 'A Message is required';
    }
    


    return {
        errors,
        isValid: isEmpty(errors)
    }
}