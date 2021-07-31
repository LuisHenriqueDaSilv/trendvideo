from flask import Blueprint, render_template, Response, send_file

#controllers
from .controllers import account_controller, video_controller

#middlewares
from .middlewares.verify_token import verify_token


router = Blueprint('router', __name__)


#accounts controller routes

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



#videos controller routes

@router.route('/video/create', methods=['POST'])
@verify_token
def video_create(user):
    return video_controller.create(user)


@router.route('/video/delete', methods=['DELETE'])
@verify_token
def video_update(user):
    return video_controller.delete(user)



#static files routes

@router.route('/video/<path:filename>', methods=['GET'])
def get_video(filename):

    def render_video():

        try:

            with open(
                f'app/database/files/videos/{filename}',
                "rb"
            ) as video:
                data = video.read(1024)
                while data:
                    yield data
                    data = video.read(1024)
            
        except:

            with open(
                f'app/database/files/videos/default.ogv',
                "rb"
            ) as video:
                data = video.read(1024)
                while data:
                    yield data
                    data = video.read(1024)

    return Response(render_video(), mimetype="video/ogg")


@router.route('/account/userimage/<path:filename>', methods=['GET'])
def get_userimage(filename):

    try:

        return send_file(f'database/files/user_image/{filename}')
    except:
        
        return send_file(f'database/files/user_image/default.jpg')