export function checkUsername(username:string){

    if(!username){
        return('Username not provided')
    }
    if(username.length >20){
        return('Username cannot be longer than 20 characters')
    }
    if(username.length < 5){
        return('Username cannot be lowest than 5 characters')
    }
    if (username.trim().includes(' ')){
        return('Username cannot have blank spaces')
    }

    return('OK')
}

export function checkPassword(password: string){

    if(!password){
        return('Password not provided')
    }
    if(password.length > 30){
        return('Password cannot be longer than 30 characters')
    }
    if(password.length <8){
        return('Password cannot be lowest than 8 characters')
    }
    if(password.trim().includes(' ')){
        return('Password cannot have blank spaces')
    }

    return('OK')

}