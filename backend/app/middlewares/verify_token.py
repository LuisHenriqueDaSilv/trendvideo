from functools import wraps
from flask import request
import jwt
import dotenv

#Database Models
from ..database.models import Account

#Getting dotenv values
dotenv_variables = dotenv.dotenv_values('.env')
JWT_SECRET_KEY = dotenv_variables['JWT_SECRET_KEY']

def verify_token(function):

    @wraps(function)
    def wrapper(*args, **kargs):

        token = request.headers.get('authorization')

        if not token:
            return {
                'status':'error',
                'message':'Invalid authorization token'
            }, 401
        
        if 'Bearer ' not in token:
            return {
                'status':'error',
                'message':'Invalid authorization token'
            }, 401

        try:
            token = token.replace("Bearer ", "")
            decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            user_id = decoded['id']
            
            # Check if the account that owns this token 
            # exists in database
            user_account = Account.query.filter_by(id=user_id).first()
            if not user_account:
                raise

        except:
            return {
                'status': 'error',
                'message': 'Invalid authorization token'
            }, 401
        else:
            return function(user=user_account, *args, **kargs)
        
    return wrapper
