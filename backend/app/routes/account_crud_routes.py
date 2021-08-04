from flask import Blueprint, render_template, send_file

#controller
from ..controllers import account_controller

router = Blueprint(
    'account_crud', 
    __name__
)


@router.route('/account/create', methods=['POST'])
def create():
    return account_controller.create()


@router.route('/account/create/confirm/email', methods=['GET'])
def confirm_template():
    return render_template('confirm_email.html')


@router.route('/account/create/confirm', methods=['POST'])
def account_confirm_process():
    return account_controller.confirm()


@router.route('/account/create/cancel', methods=['POST'])
def cancel_account_confirm_process():
    return account_controller.cancel_confirm()


@router.route('/account/login', methods=['POST'])
def login():
    return account_controller.login()


#Static files
@router.route('/account/image/<path:filename>', methods=['GET'])
def get_userimage(filename):

    try:

        return send_file(f'database/files/user_image/{filename}')
    except:
        
        return send_file(f'database/files/user_image/default.jpg')