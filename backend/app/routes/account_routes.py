from flask import Blueprint, render_template, send_from_directory, request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import date, datetime, timedelta
from uuid import uuid4
from dotenv import dotenv_values
import bcrypt
import jwt
import sqlalchemy
import json
import os

from app import db, app

# Services
from ..services.smtp_server import smtp_server

# Utils
from ..utils import get_public_video_data, format_number

# Emails
from ..emails import confirm_account_email, change_password_email

# Database Models
from ..database.models import (
    Account, 
    Follow, 
    Video, 
    ChangePasswordRequest,
    ConfirmAccountProcess
) 

# Middlewares
from ..middlewares.verify_token import verify_token

# Getting dotenv variables
dotenv_variables = dotenv_values('.env')
SERVER_EMAIL = dotenv_variables.get('SERVER_EMAIL')
JWT_SECRET_KEY = dotenv_variables.get('JWT_SECRET_KEY')

accounts_router = Blueprint(
    'account_crud',
    __name__
)

@accounts_router.route('/account/create', methods=['POST'])
def create_account():

    try:

        username = request.form.get('username')
        user_email = request.form.get('email')
        password = request.form.get('password')


        username_is_invalid = not username or len(
            username
        ) > 20 or len(
            username
        ) < 5 or " " in username.strip()
        if username_is_invalid:
            return {
                'status': 'error',
                'message': 'Invalid username'
            }, 400

        password_is_invalid = not password or len(
            password
        ) >= 30 or len(
            password
        ) < 8 or " " in password.strip()
        if password_is_invalid:
            return {
                'status': 'error',
                'message': 'Invalid password'
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
                'message': 'There is already an account using the provided email'
            }, 400

        account_using_same_username = Account.query.filter_by(
            username=username
        ).first()
        if account_using_same_username:
            return {
                'status': 'error',
                'message': 'There is already an account using the provided username'
            }, 400


        profile_image = request.files.get('profile_image')
        if profile_image:
            
            allowed_image_mimetypes = [
                "image/png",
                "image/jpeg"
            ]             
            if profile_image.mimetype not in allowed_image_mimetypes:
                return {
                    'status': 'error',
                    'message': 'Invalid image'
                }, 400


        email = MIMEMultipart()
        email['Subject'] = 'Confirm your TrendVideo account'

        confirmation_uuid = f"{uuid4().hex}{uuid4().hex}"
        
        email_body = confirm_account_email.body(
            confirm_account_page_url=f"{request.url_root}/account/create/confirm/email?uuid={confirmation_uuid}",
            server_url=request.url_root
        )
        email.attach(
            MIMEText(email_body, 'html')
        )
        
        try:
            smtp_server.sendmail(
                from_addr=SERVER_EMAIL,
                to_addrs=user_email,
                msg=email.as_bytes()
            )
        except:
            return {
                'status': 'error',
                'message': 'Something went wrong in the process to send the email to confirm your account'
            }, 400
        
            
        if not profile_image:
            profile_image_name = 'default.jpg'
        else:
            profile_image_name = f'{uuid4().hex}-{date.today()}.png'
            profile_image.save(
                f'./app/database/files/profile_image/{profile_image_name}'
            )


        encrypted_password = bcrypt.hashpw(
            password.encode(), bcrypt.gensalt()
        )

        user_account = Account(
            username=username,
            email=user_email,
            password=encrypted_password,
            image_name=profile_image_name
        )
        db.session.add(user_account)
        db.session.commit()
        
        confirm_create_process = ConfirmAccountProcess(
            uuid=confirmation_uuid,
            owner_id=user_account.id
        )

        db.session.add(confirm_create_process)
        db.session.commit()

        return {'status': 'ok'}

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/create/confirm/email', methods=['GET'])
def static_confirm_create_account_page():
    return render_template('confirm_email.html')

@accounts_router.route('/account/create/confirm', methods=['POST'])
def confirm_create_account():

    try:

        password_sended_by_user = request.form.get('confirm_password')
        uuid = request.form.get('uuid')
        
        if not password_sended_by_user or not uuid:
            return {
                'status': 'error',
                'message': 'Password or uuid not provided'
            }, 400

        
        confirm_account_process = ConfirmAccountProcess.query.filter_by(
            uuid=uuid, 
        ).first()
        
        if not confirm_account_process:
            return {
                'status': 'error',
                'message': 'Not exist account waiting for confirmation with the uuid provided'
            }, 400
            
        
        account_password = confirm_account_process.owner.password
        user_password_match = bcrypt.checkpw(
            password=password_sended_by_user.encode(),
            hashed_password=account_password
        )
        if not user_password_match:
            return {
                'status': 'error',
                'message': 'Incorrect password'
            }, 400
            
            
        account_to_confirm_create = Account.query.filter_by(
            id=confirm_account_process.owner_id
        ).first()
        
        account_to_confirm_create.status = 'OK'
        db.session.delete(confirm_account_process)
        db.session.commit()

        return {'status': 'ok'}

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/login', methods=['POST'])
def login_account():

    try:

        user_email = request.form.get('email')
        user_password = request.form.get('password')

        if not user_email or not user_password:
            return {
                'status': 'error',
                'message': 'Password or email not provided'
            }, 400


        account_to_login = Account.query.filter_by(
            email=user_email
        ).first()
        if not account_to_login:
            return {
                'status': 'error',
                'message': 'Not exist any account with provided email.'
            }, 404
            
        
        passwords_match = bcrypt.checkpw(
            user_password.encode(),
            account_to_login.password
        )
        if not passwords_match:
            return {
                'status': 'error',
                'message': 'Invalid password'
            }, 400


        jwt_payload = {
            "id": account_to_login.id,
            "exp": datetime.utcnow() + timedelta(days=3)  # 72 hours
        }
        token_jwt = jwt.encode(
            payload=jwt_payload,
            key=JWT_SECRET_KEY, 
            algorithm="HS256"
        )
                
        user_public_infos = {
            'username': account_to_login.username,
            'image_url': f'{request.url_root}/account/image/{account_to_login.image_name}',
            'followers': account_to_login.followers,
            'status': account_to_login.status
        }

        return {
            'status': 'ok',
            'token': token_jwt,
            'user': user_public_infos,
        }

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/follow', methods=['POST'])
@verify_token
def follow(user):

    try:
        
        if user.status == 'awaiting confirmation':
            return {
                'status': 'error',
                'message': f'To follow one account you need confirm create account first. Check your email'
            }, 400

        id_of_user_to_follow = request.form.get('followed_user_id')
        if not id_of_user_to_follow:
            return {
                'status': 'error',
                'message': 'ID of user to follow not provided'
            }, 400

        if id_of_user_to_follow == user.id:
            return {
                'status': 'error',
                'message': "You can't follow yourself"
            }, 400
            
        
        user_to_follow = Account.query.filter_by(
            id=id_of_user_to_follow
        ).first()
        if not user_to_follow:
            return {
                'status': 'error',
                'message': 'User not found'
            }, 404
        
            
        existing_follow = Follow.query.filter_by(
            user_id=user.id, 
            followed_user_id=user_to_follow.id
        ).first()
        
        if existing_follow:
            db.session.delete(existing_follow)
            user_to_follow.followers = user_to_follow.followers - 1
            db.session.commit()

            return {
                'status': 'ok',
                'message': 'Unfollow'
            }
        else:
            follow = Follow(
                user_id=user.id,
                followed_user_id=user_to_follow.id
            )

            db.session.add(follow)
            user_to_follow.followers = user_to_follow.followers + 1
            db.session.commit()

            return {
                'status': 'ok',
                'message': 'Follow'
            }

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/infos/<path:searched_user_username>')
@verify_token
def get_infos(user, searched_user_username):
    
    try:
        
        if not searched_user_username:
            return {
                'status': 'error',
                'message': 'Username not provided'
            }, 400
        
        searched_user = Account.query.filter_by(
            username=searched_user_username
        ).first()
        if not searched_user:
            return {
                'status': 'error',
                'message': 'Account not found'
            }, 404
        
        # Get 25 lasts videos, to show most infos in front end with most speed
        videos = Video.query.filter_by(
            owner_id=searched_user.id
        ).order_by(
            sqlalchemy.desc(Video.created_at)
        ).limit(
            25
        ).offset(
            0
        ).all()
        
        latests_video_by_searched_user = []
        for video in videos:

            video_data = get_public_video_data(
                video=video,
                user=user,
                request=request
            )
            latests_video_by_searched_user.append(video_data)
        
        
        followed_users_ids = [follow.followed_user_id for follow in user.follows]
        followed = searched_user.id in followed_users_ids
        
        followers = format_number(searched_user.followers)
        
        public_user_data = {
            'followed': followed,
            'username': searched_user.username,
            'followers': followers,
            'videos': len(searched_user.videos),
            'image_url': f'{request.url_root}/account/image/{searched_user.image_name}',
            'id': searched_user.id,
            'this_account_is_your': searched_user.id == user.id
        }
        
        return {
            'status': 'ok',
            'userinfos': public_user_data,
            'videos': latests_video_by_searched_user or False
        }
            
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/following', methods=['GET'])
@verify_token     
def get_followed_accounts(user):
    try: 
        
        followed_accounts = []
        for follow in user.follows:
            followed_accounts.append({
                'username': follow.followed_user.username,
                'image_url': f'{request.url_root}/account/image/{follow.followed_user.image_name}'
            })
        
        return json.dumps(followed_accounts)
        
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/accounts/search')
@verify_token
def search_accounts(user):
    
    try:
        
        args = dict(request.args)
        search_terms = args.get('s')
        
        if not search_terms:
            return {
                'status': 'error',
                'message': 'Search terms not provided'
            }, 400
            
        accounts = Account.query.filter(
            Account.username.contains(search_terms)
        ).all()
        
        results_list = []
        for account in accounts:
            results_list.append({
                'username': account.username,
                'videos': len(account.videos),
                'followers': account.followers,
                'image_url': f'{request.url_root}/account/image/{account.image_name}'
            })
            
        if not results_list:
            return {
                'status': 'error',
                'message': 'Could not find any user with provided search terms'
            }, 404
        
        return {
            'status': 'ok',
            'results': results_list
        }
        
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/update/password', methods=['POST'])
def change_password():
            
    try: 
        
        email_from_account_to_change_password = request.form.get('email')
        
        if not email_from_account_to_change_password:
            return {
                'status': 'error',
                'message': 'Email not provided'
            }, 400
            
        account_to_change_password = Account.query.filter_by(
            email=email_from_account_to_change_password
        ).first()
        if not account_to_change_password:
            return {
                'status': 'error',
                'message': 'Could not find any account with this email.'
            }, 404
        
        change_password_uuid = f"{uuid4().hex}{uuid4().hex}"
        change_password_request = ChangePasswordRequest(
            uuid=change_password_uuid,
            user_id=account_to_change_password.id
        )
        db.session.add(change_password_request)
        db.session.commit()
                
        email = MIMEMultipart()
        email['Subject'] = 'Change Password'
        email_body = change_password_email.body(
            change_password_page_url= (
                f"{request.url_root}/account/change-password?uuid={change_password_uuid}"
            ),
            server_url=request.url_root
        )
        email.attach(
            MIMEText(email_body, 'html')
        )
        try:
            smtp_server.sendmail(
                from_addr=SERVER_EMAIL,
                to_addrs=email_from_account_to_change_password,
                msg=email.as_bytes()
            )
        except:
            return {
                'status': 'error',
                'message': 'Error to send change password email'
            }, 400
        
        return {
            'status': 'ok'
        }
        
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/change-password', methods=['GET'])
def change_password_page():
    return render_template('change_password.html')

@accounts_router.route('/account/update/password/confirm', methods=['POST'])
def confirm_change_password():
            
    try:
        
        uuid = request.form.get('uuid')
        user_email = request.form.get('email')
        new_password = request.form.get('new_password')
        
        if not uuid:
            return {
                'status': 'error',
                'message': 'Uuid not provided'
            }, 400
        if not user_email or not new_password:
            return {
                'status': 'error',
                'message': 'Email or new password not provided'
            }, 400
                    
        change_password_requests = ChangePasswordRequest.query.filter_by(
            uuid=uuid
        ).join(
            ChangePasswordRequest.user
        ).filter_by(
            email=user_email
        ).all()
        if not change_password_requests:
            return {
                'status': 'error',
                'message': 'There is no password change request for the account using the email or uuid entered.'
            }, 404
        
        account_to_change_password = Account.query.filter_by(
            id=change_password_requests[0].user_id
        ).first()
        if not account_to_change_password:
            return {
                'status': 'error',
                'message': 'Account not found'
            }, 404
        
        hashed_new_password = bcrypt.hashpw(
            new_password.encode(), 
            bcrypt.gensalt()
        )
        account_to_change_password.password = hashed_new_password
        
        for change_password_request in change_password_requests:
            db.session.delete(change_password_request)
            
        db.session.commit()
    
        return {
            'status': 'ok'
        }
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500
        
@accounts_router.route('/account/update', methods=['POST'])
@verify_token
def update(user):
        
        try: 
            
            new_username = request.form.get('new_username')
            remove_profile_file = request.form.get('remove_profile_image')
            new_profile_image = request.files.get('new_profile_image')
            
            if not new_username and not new_profile_image and not remove_profile_file:
                
                return {
                    'status': 'error',
                    'message': 'Nothing are updated'
                }, 400
            
            account_to_update = Account.query.filter_by(
                id=user.id
            ).first()
            
            if new_username:
                account_using_the_same_username = Account.query.filter_by(
                    username=new_username
                ).first()
                
                if account_using_the_same_username:
                    if account_using_the_same_username.id == account_to_update.id:
                        return {
                            'status': 'error',
                            'message': 'The new username needs to be different from current'
                        }, 400
                    else:
                        return {
                            'status': 'error',
                            'message': 'The username entered is already in use'
                        }, 400
                
                new_username = new_username.strip()
                invalid_username = len(
                    new_username
                ) > 20 or len(
                    new_username
                ) < 5 or " " in new_username
                if invalid_username:
                    return {
                        'status': 'error',
                        'message': 'Invalid username' 
                    }, 400
                
                account_to_update.username = new_username
            
            if remove_profile_file:
                if account_to_update.image_name != 'default.jpg':
                    os.remove(f'./app/database/files/profile_image/{account_to_update.image_name}')
                    account_to_update.image_name = 'default.jpg'
                    
            elif new_profile_image:
                allowed_image_mimetypes = [
                    "image/png",
                    "image/jpeg"
                ]            
                if new_profile_image.mimetype not in allowed_image_mimetypes:

                    return {
                        'status': 'error',
                        'message': 'Invalid new profile image'
                    }, 400
                    
                if account_to_update.image_name != 'default.jpg':
                    os.remove(f'./app/database/files/profile_image/{account_to_update.image_name}')
                    
                new_profile_image_name = f'{uuid4().hex}-{date.today()}.png'
                new_profile_image.save(
                    f'./app/database/files/profile_image/{new_profile_image_name}'
                )
                
                account_to_update.image_name = new_profile_image_name
            
            db.session.commit()
            
            new_public_infos_to_send = {
                'username': account_to_update.username,
                'image_url': f'{request.url_root}/account/image/{account_to_update.image_name}'
            }
            
            return {
                'status': 'ok',
                'new_userdata': new_public_infos_to_send
            }
            
        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'something unexpected happened'
            }, 500

@accounts_router.route('/account/image/<path:filename>', methods=['GET'])
def get_profile_image(filename):

    try:
        return send_from_directory('database/files/profile_image/', filename)
    except:
        return send_from_directory('database/files/profile_image/', 'default.jpg')


# To do: Create new table in database to confirm account process and 
# remove confirm_uuid row in Account table