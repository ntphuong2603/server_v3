const AccessControl = require('accesscontrol')
// const { RESOURCE } = require('../middleware/roles')

let grandOjb = {
    admin:{
        profile:{
            'create:any':['*'],
            'read:any':['*'],
            'update:any':['*'],
            'delete:any':['*'],
        },
        article:{
            'create:any':['*'],
            'read:any':['*'],
            'update:any':['*'],
            'delete:any':['*'],
        }
    },
    user:{
        profile:{
            // 'create:any':['*'],
            'read:own':['*','!password','!_id','!date'],
            'update:own':['*'],
            // 'delete:own':['*'],
        }
    }
}

const roles = new AccessControl(grandOjb)

module.exports = { roles }