from functools import wraps
from flask import request
import jwt
import dotenv

#Database Models
from ..database.models import Account

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


        #check if the token is valid and if account is in database
        try:
            token = token.replace("Bearer ", "")

            decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])

            user_id = decoded['id']
            
            user_account = Account.query.filter_by(id=user_id).first()
            
            if not user_account:
                raise

        except Exception as error:
            return {
                'status': 'error',
                'message': 'Invalid authorization token'
            }, 401

        else:
            return function(user=user_account, *args, **kargs)
        
    return wrapper