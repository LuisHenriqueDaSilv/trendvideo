from flask import Blueprint, render_template, send_file, send_from_directory, request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import date, datetime, timedelta
from uuid import uuid4
from dotenv import dotenv_values
from operator import or_
import bcrypt
import jwt
import sqlalchemy
import json
import os

from app import db, app

# Services
from ..services.smtp_server import smtp_server

# Emails
from ..emails import confirm_account_email, change_password_email

# Database Models
from ..database.models import Account, Follow, Video, ChangePasswordRequest

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
def create():

    try:

        username = request.form.get('username')
        user_email = request.form.get('email')
        password = request.form.get('password')

        invalid_username = not username or len(
            username
        ) > 20 or len(
            username
        ) < 5 or " " in username.strip()
        
        if invalid_username:
            return {
                'status': 'error',
                'message': 'Invalid username'
            }, 400

        invalid_password = not password or len(
            password
        ) >= 30 or len(
            password
        ) < 8 or " " in password.strip()
        if invalid_password:
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


        # check if the image sent by the user is valid
        user_image = request.files.get('profile_image')
        
        if user_image:
            
            allowed_image_mimetypes = [
                "image/png",
                "image/jpeg"
            ]            
                
            if user_image.mimetype not in allowed_image_mimetypes:

                return {
                    'status': 'error',
                    'message': 'Invalid image'
                }, 400

        # Send confirmation email
        uuid = f"{uuid4().hex}{uuid4().hex}"

        email = MIMEMultipart()
        email['Subject'] = 'Confirm your email'

        confirmation_email_body = confirm_account_email.email_body(
            confirm_account_page_url=f"{request.url_root}/account/create/confirm/email?uuid={uuid}",
            server_url=request.url_root
        )
        email.attach(
            MIMEText(confirmation_email_body, 'html')
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
                'message': 'Error to send confirmation email'
            }, 400

        # save user image
        if not user_image:
            user_image_name = 'default.jpg'
        else:
            user_image_name = f'{uuid4().hex}-{date.today()}.png'
            user_image.save(
                f'./app/database/files/profile_image/{user_image_name}'
            )

        # encrypting the password and saving in database
        hashed_password = bcrypt.hashpw(
            password.encode(), bcrypt.gensalt()
        )

        user_account = Account(
            username=username,
            email=user_email,
            password=hashed_password,
            confirmation_uuid=uuid,
            image_name=user_image_name
        )

        db.session.add(user_account)
        db.session.commit()

        return {'status': 'ok'}

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/create/confirm/email', methods=['GET'])
def confirm_create_page():
    return render_template('confirm_email.html')

@accounts_router.route('/account/create/confirm', methods=['POST'])
def confirm_create():

    try:

        confirm_password = request.form.get('confirm_password')
        uuid = request.form.get('uuid')

        if not confirm_password or not uuid:
            return {
                'status': 'error',
                'message': 'Password or uuid not provided'
            }, 400

        user_account = Account.query.filter_by(
            confirmation_uuid=uuid, 
            status='awaiting confirmation'
        ).first()

        if user_account:

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
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/create/cancel', methods=['POST'])
def cancel_create():

    try:

        user_email = request.form.get('email')
        uuid = request.form.get('uuid')

        if not user_email or not uuid:
            return {
                'status': 'error',
                'message': 'Email or uuid not provided'
            }, 400

        user_account = Account.query.filter_by(
            email=user_email, 
            status='awaiting confirmation', 
            confirmation_uuid=uuid
        ).first()

        if user_account:
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
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/login', methods=['POST'])
def login():

    try:

        user_email = request.form.get('email')
        user_password = request.form.get('password')

        if not user_email or not user_password:
            return {
                'status': 'error',
                'message': 'Password or email not provided'
            }, 400

        user_account = Account.query.filter_by(
            email=user_email
        ).first()

        if not user_account:
            return {
                'status': 'error',
                'message': 'No account was found with this email.'
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
            "exp": datetime.utcnow() + timedelta(days=3)  # 72 hours
        }

        token_jwt = jwt.encode(
            payload=jwt_payload,
            key=JWT_SECRET_KEY, 
            algorithm="HS256"
        )

        user_infos_to_send = {
            'username': user_account.username,
            'image_url': f'{request.url_root}/account/image/{user_account.image_name}',
            'followers': user_account.followers,
            'status': user_account.status
        }

        return {
            'status': 'ok',
            'token': token_jwt,
            'user': user_infos_to_send,
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
        
        if user.status != 'OK':
            return {
                'status': 'error',
                'message': f'To follow one user you need to confirm your email first'
            }, 400

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

        followed_user = Account.query.filter_by(
            id=followed_user_id
        ).first()

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
            'message': 'something unexpected happened'
        }, 500

@accounts_router.route('/account/infos/<path:username>')
@verify_token
def get_infos(user, username):
    
    try:
        if not username:
            return {
                'status': 'error',
                'message': 'Username not provided'
            }, 400
            
        account = Account.query.filter_by(
            username=username
        ).first()
        
        if not account:
            return {
                'status': 'error',
                'message': 'Account not found'
            }, 404
            
        videos = Video.query.filter_by(
            owner_id=account.id
        ).order_by(
            sqlalchemy.desc(Video.created_at)
        ).limit(
            25
        ).offset(
            0
        ).all()

        liked_videos_ids = [
            like.video_id for like in user.likes
        ]
        followeds_users_ids = [
            follow.followed_user_id for follow in user.follows
        ]
        followed = account.id in followeds_users_ids
        
        first_videos_list = []
        
        for video in videos:

            likes_str = str(len(video.likes))
            likes_complement = ''

            if len(likes_str) > 9:
                likes_complement = 'b'
                likes_str = likes_str[:-9]
            elif len(likes_str) > 6:
                likes_complement = 'mi'
                likes_str = likes_str[:-6]
            elif len(likes_str) > 3:
                likes_complement = 'k'
                likes_str = likes_str[:-3]

            liked = video.id in liked_videos_ids

            first_videos_list.append({
                'url': f'{request.url_root}/video/{video.name}',
                'video_data': {
                    'likes': f'{likes_str}{likes_complement}',
                    'description': video.description,
                    'created_at': video.created_at,
                    'thumbnail_url': f'{request.url_root}/videos/thumbnail/{video.thumbnail}',
                    'id': video.id,
                    'name': video.name,
                    'liked': liked,
                    'comments': len(video.comments)
                },
                'owner': {
                    'username': video.owner.username,
                    'created_at': video.owner.created_at,
                    'followers': video.owner.followers,
                    'image_url': f'{request.url_root}/account/image/{video.owner.image_name}',
                    'followed': followed,
                    'id': video.owner.id
                }
            })
            

        user_data = {
            'followed': followed,
            'username': account.username,
            'followers': account.followers,
            'videos': len(account.videos),
            'image_url': f'{request.url_root}/account/image/{account.image_name}',
            'id': account.id,
            'this_account_is_your': account.id == user.id
        }
        
        return {
            'status': 'ok',
            'userinfos': user_data,
            'videos': first_videos_list or False
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
        
        search_terms = args.get('q')
        
        if not search_terms:
            return {
                'status': 'error',
                'message': 'Search terms not provided'
            }, 400
            
        accounts_list = []
        
        accounts = Account.query.filter(
            Account.username.contains(search_terms)
        ).all()
        
        for account in accounts:
            accounts_list.append({
                'username': account.username,
                'videos': len(account.videos),
                'followers': account.followers,
                'image_url': f'{request.url_root}/account/image/{account.image_name}'
            })
            
        if not accounts_list:
            return {
                'status': 'error',
                'message': 'Could not find any user with this terms'
            }, 404
        
        return {
            'status': 'ok',
            'results': accounts_list
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
        user_email = request.form.get('email')
        
        if not user_email:
            return {
                'status': 'error',
                'message': 'Email not provided'
            }, 400
            
            
        user_account = Account.query.filter_by(
            email=user_email
        ).first()
        
        if not user_account:
            return {
                'status': 'error',
                'message': 'Could not find any account with this email.'
            }, 404
            
        uuid = f"{uuid4().hex}{uuid4().hex}"
        
        email = MIMEMultipart()
        email['Subject'] = 'Change Password'
        
        email_body = change_password_email.email_body(
            change_password_page_url=f"{request.url_root}/account/change-password?uuid={uuid}",
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
                'message': 'Error to send change password email'
            }, 400
            
            
        change_password_request = ChangePasswordRequest(
            uuid=uuid,
            user_id=user_account.id
        )
        
        db.session.add(change_password_request)
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
        
        user_account = Account.query.filter_by(
            id=change_password_requests[0].user_id
        ).first()
        
        if not user_account:
            return {
                'status': 'error',
                'message': 'Account not found'
            }, 404
        
        hashed_new_password = bcrypt.hashpw(
            new_password.encode(), 
            bcrypt.gensalt()
        )
        
        user_account.password = hashed_new_password
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
            
            user_account = Account.query.filter_by(
                id=user.id
            ).first()
            
            if new_username:
                account_using_the_same_username = Account.query.filter_by(
                    username=new_username
                ).first()
                
                if account_using_the_same_username:
                    
                    if account_using_the_same_username.id == user_account.id:
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
                        'mesage': 'Invalid username' 
                    }, 400
                user_account.username = new_username
            
            if remove_profile_file:
                
                if user_account.image_name != 'default.jpg':
                    os.remove(f'./app/database/files/profile_image/{user_account.image_name}')
                    user_account.image_name = 'default.jpg'
                    
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
                    
                if user_account.image_name != 'default.jpg':
                    os.remove(f'./app/database/files/profile_image/{user_account.image_name}')
                    
                new_profile_image_name = f'{uuid4().hex}-{date.today()}.png'
                new_profile_image.save(
                    f'./app/database/files/profile_image/{new_profile_image_name}'
                )
                
                user_account.image_name = new_profile_image_name
            
            db.session.commit()
            
            new_user_infos_to_send = {
                'username': user_account.username,
                'image_url': f'{request.url_root}/account/image/{user_account.image_name}'
            }
            
            return {
                'status': 'ok',
                'new_userdata': new_user_infos_to_send
            }
            
        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'something unexpected happened'
            }, 500

@accounts_router.route('/account/image/<path:filename>', methods=['GET'])
def read_profile_image(filename):

    try:
        return send_from_directory('database/files/profile_image/', filename)
    except:

        return send_from_directory('database/files/profile_image/', 'default.jpg')