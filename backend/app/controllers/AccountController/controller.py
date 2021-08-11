from flask import request, jsonify
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from uuid import uuid4
from dotenv import dotenv_values
from datetime import date, datetime, timedelta
import bcrypt
import jwt

from ...services.smtp_server import smtp_server

from ...emails.confirmation_email import gen_confirmation_email_body 

from app import db, app

#Database Models
from ...database.models import Account, Follow

#Getting dotenv variables
dotenv_variables = dotenv_values('.env')
SERVER_EMAIL = dotenv_variables.get('SERVER_EMAIL')
JWT_SECRET_KEY = dotenv_variables.get('JWT_SECRET_KEY')

class AccountController():
    

    @staticmethod
    def create():

        try:

            username = request.form.get('username')
            user_email = request.form.get('email')
            password = request.form.get('password')

            invalid_username = not username or len(username) > 20 or len(username) < 5 or " " in username.strip()
            if invalid_username:
                return {
                    'status':'error', 
                    'message':'Invalid username'
                }, 400


            invalid_password = not password or len(password) >= 30 or len(password) < 8 or " " in password.strip()
            if invalid_password:
                return {
                    'status':'error',
                    'message':'Invalid password'
                }, 400

            username = username.strip()
            password = password.strip()

            if not user_email:
                return {
                    'status': 'error',
                    'message': 'Invalid email'
                }, 400

            
            account_using_same_email = Account.query.filter_by(
                email=user_email
            ).first()

            if account_using_same_email:
                return {
                    'status': 'error',
                    'message': 'There is already an account using this email'
                }, 400


            account_using_same_username = Account.query.filter_by(
                username=username
            ).first()

            if account_using_same_username:
                return {
                    'status': 'error', 
                    'message': 'There is already an account using this username'
                }, 400


            #check if the image sent by the user is valid
            user_image = request.files.get('userimage')

            allowed_image_mimetypes = [
                "image/png", 
                "image/jpeg"
            ]

            if user_image is not None:
                if user_image.mimetype not in allowed_image_mimetypes:

                    return {
                        'status':'error', 
                        'message': 'Invalid image'
                    }, 400


            #Send confirmation email
            confirmation_uuid = f"{uuid4().hex}{uuid4().hex}"        
            
            confirmation_email = MIMEMultipart()
            confirmation_email['Subject'] = 'Confirm your email'

            confirmation_email_body = gen_confirmation_email_body(
                confirm_url=f"{request.url_root}/account/create/confirm/email?uuid={confirmation_uuid}",
                server_url=request.url_root
            )
            confirmation_email.attach(MIMEText(confirmation_email_body,'html')) 

            try:

                smtp_server.sendmail(
                    from_addr=SERVER_EMAIL, 
                    to_addrs=user_email,
                    msg=confirmation_email.as_bytes()
                )

            except Exception:
                
                return {
                    'status': 'error', 
                    'message': 'Error to send confirmation email'
                }, 400


            # save user image
            if user_image is None:
                user_image_name = 'default.jpg'
            else:
                user_image_name = f'{uuid4().hex}-{date.today()}.png'
                user_image.save(f'./app/database/files/user_image/{user_image_name}')


            # encrypting the password and saving in database
            hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
            
            user_account = Account(
                username=username,
                email=user_email,
                password = hashed_password,
                confirmation_uuid=confirmation_uuid,
                image_name=user_image_name
            )

            db.session.add(user_account)
            db.session.commit()
            
            return {'status': 'ok'}

        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error', 
                'message':'something unexpected happened'
            }, 500

    @staticmethod
    def confirm_create():

        try:
        
            confirm_password = request.form.get('confirm_password')
            uuid = request.form.get('uuid')

            if not confirm_password or not uuid :
                return  {
                    'status': 'error',
                    'message': 'Password or uuid not provided'
                }, 400

            user_account = Account.query.filter_by(confirmation_uuid=uuid, status='awaiting confirmation').first()

            if user_account is not None:
                
                user_password = user_account.password

                user_password_match = bcrypt.checkpw(
                    password=confirm_password.encode(),
                    hashed_password=user_password
                )

                if user_password_match:

                    user_account.status = 'OK'
                    user_account.confirmation_uuid = 'None' 
                    db.session.commit()

                else:
                    return {
                        'status': 'error',
                        'message': 'Incorrect password'
                    }, 400

            else:
                return {
                    'status': 'error', 
                    'message': 'Invalid uuid'
                }, 400

            return {'status': 'ok'}

        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error', 
                'message':'something unexpected happened'
            }, 500

    @staticmethod
    def cancel_create():

        try:
            
            user_email = request.form.get('email')
            uuid = request.form.get('uuid')

            if not user_email  or not uuid:

                return {
                    'status': 'error',
                    'message': 'Email or uuid not provided'
                }, 400

                
            user_account = Account.query.filter_by(email=user_email, status='awaiting confirmation', confirmation_uuid=uuid).first()

            if user_account is not None:
                
                db.session.delete(user_account)
                db.session.commit()

                return {'status': 'ok'}
                
            else:
                return {
                    'status': 'error',
                    'message': 'There is no confirmation process with this email and uuid.'
                }, 404

        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error', 
                'message':'something unexpected happened'
            }, 500
    
    @staticmethod
    def login():

        try:

            user_email = request.form.get('email')
            user_password = request.form.get('password')

            if not user_email or not user_password :
                return {
                    'status': 'error',
                    'message': 'Password or email not provided'
                }, 400

            user_account = Account.query.filter_by(email=user_email).first()

            if user_account is None:
                return {
                    'status': 'error',
                    'message':'No account was found with this email.'
                }, 404

            user_password_match = bcrypt.checkpw(
                user_password.encode(),
                user_account.password
            )

            if not user_password_match:
                return {
                    'status': 'error',
                    'message': 'Invalid password'
                }, 400
            
            jwt_payload = {
                "id": user_account.id,
                "exp": datetime.utcnow() + timedelta(days=3) #72 hours
            }

            token = jwt.encode(payload=jwt_payload, key=JWT_SECRET_KEY, algorithm="HS256")

            user_infos_to_send = {
                'username': user_account.username,
                'image_url': f'{request.url_root}/account/image/{user_account.image_name}',
                'followers': user_account.followers,
                'status': user_account.status
            }

            return {
                'status': 'ok',
                'token': token,
                'user': user_infos_to_send,
            }

        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error', 
                'message':'something unexpected happened'
            }, 500

    @staticmethod
    def follow(user):

        try: 

            followed_user_id = request.form.get('followed_user_id')

            try: 
                
                followed_user_id = int(followed_user_id)
            except:
                return {
                    'status': 'error',
                    'message': 'Invalid followed user id'
                }, 400

            if not followed_user_id:
                return {
                    'status': 'error',
                    'message': 'Followed user id is not provided'
                }, 400

            if followed_user_id == user.id:
                return {
                    'status': 'error',
                    'message': "You can't follow yourself"
                }, 400

            followed_user = Account.query.filter_by(id=followed_user_id).first()

            if not followed_user:
                return {
                    'status': 'error',
                    'message': 'User not found'
                }, 404


            existing_follow = Follow.query.filter_by(
                user_id=user.id, followed_user_id=followed_user.id
            ).first()

            

            if existing_follow:


                db.session.delete(existing_follow)
                followed_user.followers = followed_user.followers - 1
                db.session.commit()

                return {
                    'status': 'ok',
                    'message': 'Unfollow'
                }

            else:

                follow = Follow(
                    user_id=user.id,
                    followed_user_id=followed_user.id
                )

                followed_user.followers = followed_user.followers + 1
                db.session.add(follow)
                db.session.commit()

                return {
                    'status': 'ok', 
                    'message': 'Follow'
                }


        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error', 
                'message':'something unexpected happened'
            }, 500


