const { roles } = require('../config/roles')

exports.grantAccess = function(action, resource){
    return (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource)
            if (!permission.granted) {
                return res.status(400).json({message:'Permission is denied'})
            } 
            res.locals.permission = permission;
            next()
        } catch (error){
            next(error)
        }
    }
}

exports.ACTION = {
    CREATE_OWN: 'createOwn',
    READ_OWN: 'readOwn',
    UPDATE_OWN: 'updateOwn',
    DELETE_OWN: 'deleteOwn',
    CREATE_ANY: 'createAny',
    READ_ANY: 'readAny',
    UPDATE_ANY: 'updateAny',
    DELETE_ANY: 'deleteAny',
}

exports.RESOURCE = {
    PROFILE : 'profile',
    ARTICLE : 'article',
}