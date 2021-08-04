from flask import Blueprint, Response, send_file

#Middlewares
from ..middlewares.verify_token import verify_token

from ..controllers import video_controller

router = Blueprint(
    'video_crud',
    __name__
)


@router.route('/videos', methods=['GET'])
@verify_token
def get_video_list(user):
    videos = video_controller.get_videos_list(user)
    return videos

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

@router.route('/videos/thumbnail/<path:filename>', methods=['GET'])
def get_video_thumbnail(filename):

    try:
        return send_file(f'database/files/thumbnails/{filename}')
    except:
        return {
            'status': 'error',
            'message': 'Image not found'
        }, 404

