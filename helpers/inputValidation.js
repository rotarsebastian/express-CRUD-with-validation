const validateInput = (type, value) => {
    switch (type) {
        case 'name':
            return value.length >= 2 && value.length <= 20 && /^[a-zA-Z]+$/.test(value);
        case 'age':
            return parseInt(value, 10) >= 1 && parseInt(value) <= 130 && /^\d+$/.test(value);
        default:
            console.log(`Validation failed! No validation for ${type} with value ${value}!`);
            break;
    }
}

const bypassInput = (type, value) => {
    switch (type) {
        case 'name':
            return value.toLowerCase();
        case 'age':
            return parseInt(value, 10);
        default:
            console.log(`Bypass failed! No bypass for ${type} with value ${value}!`);
            break;
    }
}

module.exports = {
    validateInput: validateInput,
    bypassInput: bypassInput
}
