const ValidationError = (next, validation) => {
    next({
        message: 'These is some data validation error.',
        status: 422,
        validation,
    })
}

const ErrorMessage = (next, error) => {
    console.log(error)

    if ('errors' in error) {
        let validation = {}

        for (let k in error.errors) {
            validation = {
                ...validation,
                [k]: error.errors[k].message
            }
        }

        ValidationError(next, validation)
    }

    if('code' in error && error.code === 11000) {
        ValidationError(next, {
            email: 'Given email is already registered.'
        })
    } else {
        next({
            message: 'Problem while processing your request.',
        })
    }
}

const DataNotFound = (next, name) => {
    next({
        status: 404,
        message: `${name} not found!`,
    })
}

module.exports = {ValidationError, ErrorMessage, DataNotFound}