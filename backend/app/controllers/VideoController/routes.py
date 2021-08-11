from flask import Blueprint, Response, send_file

#Middlewares
from ...middlewares.verify_token import verify_token

from .controller import  VideoController

videos_router = Blueprint(
    'video_crud',
    __name__
)

@videos_router.route('/videos', methods=['GET'])
@verify_token
def index(user):
    videos = VideoController.getVideosList(user)
    return videos

@videos_router.route('/video/create', methods=['POST'])
@verify_token
def create(user):
    return VideoController.create(user)

@videos_router.route('/video/<path:filename>', methods=['GET'])
def read(filename):

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


@videos_router.route('/videos/thumbnail/<path:filename>', methods=['GET'])
def read_thumbnail(filename):

    try:
        return send_file(f'database/files/thumbnails/{filename}')
    except:
        return {
            'status': 'error',
            'message': 'Image not found'
        }, 404

@videos_router.route('/video/delete', methods=['DELETE'])
@verify_token
def delete(user):
    return VideoController.delete(user)

@videos_router.route('/video/like', methods=['POST'])
@verify_token
def like(user):
    return VideoController.like(user)