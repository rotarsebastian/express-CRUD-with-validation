const addUserToDom = (id, name, age) => {
    const userCard = 
        `<div class="user" data-id="${id}">
            <div class="user-editable user-name" contenteditable="false" data-editable="name" onkeypress="return /[a-z]/i.test(event.key)">${name ? name : 'No name'}</div>
            <div class="user-editable user-age" contenteditable="false" data-editable="age" onkeypress="return /[0-9]/i.test(event.key)">${age ? age : 'No age'}</div>
            <div class="user-edit">Edit</div>
            <span class="user-save-button">Save</span>
            <div class="user-delete-container">
                <button class="user-delete">&#10060;</button>
            </div>
        </div>`;
    $('#users-list').append(userCard);
}

const validateForm = () => {
    let formIsValid = true;
    $('#add-user-form input').each((index, input) => {
        const inputType =  $(input).attr('name');
        const valueToValidate = $(`#add-user-form #user-${inputType}-input`).val();
        if(!validateInput(inputType, valueToValidate)) {
            formIsValid = false;
            showError(inputType);
        }
    });
    return formIsValid ? true : false;
}

const validateInput = (type, value) => {
    switch (type) {
        case 'name':
            return value.length >= 2 && value.length <= 20 && /^[a-zA-Z]+$/.test(value);
        case 'age':
            return parseInt(value, 10) >= 1 && parseInt(value) <= 130 && /^\d+$/.test(value);
        default:
            console.log(`Validation failed! No validation for ${type}!`);
            break;
    }
}

const validateLength = (type, value, el) => {
    switch (type) {
        case 'name':
            if (value.length > 20) {
                $(el).text(value.slice(0, -1));
            }
            break;
        case 'age':
            if (value.length > 3) {
                $(el).text(value.slice(0, -1));
            }
            break;
        default:
            console.log(`Validation failed! No validation for ${type}!`);
            break;
    }
}

const showError = (errorFor) => {
    $(`.error.error-${errorFor}`).fadeIn();
}

const showValidInput = (inputType, editable) => {
    if(editable) {
        $(editable).removeClass('invalid-input').addClass('valid-input');
    } else {
        $(`#add-user-form #user-${inputType}-input`).addClass('valid-input');
    }
}

const showInvalidInput = (element) => {
    $(element).removeClass('valid-input').addClass('invalid-input');
}

$(document).ready(() => {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    $.get('users', users => {
        users.map(user => {
            const { name, age, id } = user;
            addUserToDom(id, name, age);
        });
    });
});

$(document).on('click', '.user .user-delete', (e) => {
    e.preventDefault();
    const { parentElement: userContainer } = e.target.parentElement;
    const id = $(userContainer).data('id');
    $.ajax({
        type: 'DELETE',
        url: '/delete/' + id,
        success: (data) => {
            data.status === 1 ? userContainer.remove() : null;
        },
        error: (err) => {
            console.log(err);
        }
    });
});

$(document).on('click', '.user .user-edit', (e) => {
    e.preventDefault();
    const { parentElement: userContainer } = e.target;
    if($(e.target).html() === 'Cancel') {
        $.get('users/' + $(e.target.parentElement).data('id'), user => {
            $(e.target.parentElement).find('.user-editable').each((index, el) => {
                const data = $(el).data('editable');
                const value = user[data];
                $(el).html(value);
                $(e.target).next().css({'display': 'none'});
            });
        });
    }
    $(e.target).html() === 'Edit' ? $(e.target).html('Cancel') : $(e.target).html('Edit');
    $(userContainer).children('.user-name').toggleClass('editable').toggleClass('valid-input').attr('contenteditable') === 'true' ? $(userContainer).find('.user-name').attr('contenteditable','false') : $(userContainer).find('.user-name').attr('contenteditable', 'true');
    $(userContainer).children('.user-age').toggleClass('editable').toggleClass('valid-input').attr('contenteditable') === 'true' ? $(userContainer).find('.user-age').attr('contenteditable','false') : $(userContainer).find('.user-age').attr('contenteditable', 'true');

});

$(document).on('click', '.user .user-save-button', (e) => {
    e.preventDefault();
    let allEditsAreValid = true;
    const newUser = {};
    $(e.target.parentElement).find('.user-editable').each((index, el) => {
        const isElValid = validateInput($(el).data('editable'), $(el).html());
        isElValid ? newUser[$(el).data('editable')] = $(el).html(): allEditsAreValid = false;
    });

    if(allEditsAreValid) {  
        const id = $(e.target.parentElement).data('id');  
        $.ajax({
            type: 'PUT',
            url: '/users/' + id,
            data: JSON.stringify(newUser),
            contentType: 'application/json',
            success: (res) => {
                if(res.status === 1) {
                    $(e.target.parentElement).find('.user-editable').removeClass('editable').removeClass('valid-input').attr('contenteditable', 'false');
                    $(e.target).prev().html('Edit');
                    $(e.target).css({ 'display': 'none' });
                } else {
                    console.log(`Error creating user! Error: ${res.error}`);
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
});

$(document).on('input', '#add-user-form input', (e) => {
    e.preventDefault();
    const { target: inputDOM } = e;
    const inputType = $(inputDOM).attr('name');
    $(`#add-user-form #user-${inputType}-input`).removeClass('valid-input');
    $('.error').fadeOut();
});

$(document).on('focusout', '#add-user-form input', (e) => {
    e.preventDefault();
    const { target: inputDOM } = e;
    const inputType = $(inputDOM).attr('name');
    const inputValue = $(inputDOM).val();
    const isInputValid = validateInput(inputType, inputValue);
    isInputValid ? showValidInput(inputType) : null;
});

$(document).on('input', '#users-list .user .user-editable', (e) => {
    e.preventDefault();
    const { target: elDOM } = e;
    const type = $(elDOM).data('editable');
    const value = $(elDOM).text();
    validateLength(type, value, elDOM);
    const isValid = validateInput(type, value);
    isValid ? showValidInput(type, elDOM) : showInvalidInput(elDOM);

    isValid ? $(e.target.parentElement).find('.user-save-button').css({ 'display': 'block' }) : $(e.target.parentElement).find('.user-save-button').css({ 'display': 'none' });
});

$(document).on('click', '.add-user-trigger', (e) => {
    e.preventDefault();
    const { target: addUserTrigger } = e;
    $(addUserTrigger).addClass('hide').removeClass('show');
    $('#add-user-form').fadeIn();
    $('.error').fadeOut();
});

$(document).on('click', '.add-user-submit', (e) => {
    e.preventDefault();
    if(!validateForm()) {
        return;
    } else {
        const newUser = {};
        const data = $('#add-user-form').serialize();
        const inputsArray = data.split('&');
        inputsArray.map(input => {
            const keyAndValues = input.split('=');
            newUser[keyAndValues[0]] = keyAndValues[1];
        })
        $.ajax({
            type: 'POST',
            url: '/users/',
            data: JSON.stringify(newUser),
            contentType: 'application/json',
            success: (res) => {
                if(res.status === 1) {
                    $('.add-user-trigger').removeClass('hide').addClass('show');
                    $('#add-user-form').fadeOut();
                    $('#add-user-form').find('input[type=text], textarea').val('').removeClass('valid-input');
                    const { id, name, age } = res.createdUser;
                    addUserToDom(id, name, age);
                    toastr.success('User successfully added!');
                } else {
                    console.log(`Error creating user! Error: ${res.error}`)
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
});






