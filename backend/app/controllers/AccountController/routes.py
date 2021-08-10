from flask import Blueprint, render_template, send_file

#controller
from .controller import AccountController

accounts_router = Blueprint(
    'account_crud', 
    __name__
)


@accounts_router.route('/account/create', methods=['POST'])
def create():
    return AccountController.create()


@accounts_router.route('/account/create/confirm/email', methods=['GET'])
def confirm_create_page():
    return render_template('confirm_email.html')


@accounts_router.route('/account/create/confirm', methods=['POST'])
def confirm_create():
    return AccountController.confirm_create


@accounts_router.route('/account/create/cancel', methods=['POST'])
def cancel_create():
    return AccountController.cancel_create()


@accounts_router.route('/account/login', methods=['POST'])
def read():
    return AccountController.read()


#Static files
@accounts_router.route('/account/image/<path:filename>', methods=['GET'])
def get_userimage(filename):

    try:
        return send_file(f'database/files/user_image/{filename}')
    except:
        
        return send_file(f'database/files/user_image/default.jpg')