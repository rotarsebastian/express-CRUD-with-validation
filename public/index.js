const addUserToDom = (id, name, age) => {
    const userCard = 
        `<div class="user" data-id="${id}">
            <div>${name ? name : 'No name'}</div>
            <div>${age ? age : 'No age'}</div>
            <div class="user-edit">Edit</div>
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

const showError = (errorFor) => {
    $(`.error.error-${errorFor}`).fadeIn();
}

const showValidInput = (inputType) => {
    $(`#add-user-form #user-${inputType}-input`).addClass('valid-input');
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

$(document).on('click', '.user .user-delete', (event) => {
    event.preventDefault();
    const { parentElement: userContainer } = event.target.parentElement;
    const id = $(userContainer).data('id');
    console.log(id, userContainer)
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

$(document).on('click', '.add-user-trigger', (event) => {
    event.preventDefault();
    const { target: addUserTrigger } = event;
    $(addUserTrigger).addClass('hide').removeClass('show');
    $('#add-user-form').fadeIn();
    $('.error').fadeOut();
});

$(document).on('click', '.add-user-submit', (event) => {
    event.preventDefault();
    if(!validateForm()) {
        return;
    } else {
        let newUser = {};
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
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
});






