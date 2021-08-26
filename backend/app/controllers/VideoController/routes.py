from flask import Blueprint, send_file, send_from_directory

# Middlewares
from ...middlewares.verify_token import verify_token

from .controller import VideoController

videos_router = Blueprint(
    'video_crud',
    __name__
)


@videos_router.route('/video/create', methods=['POST'])
@verify_token
def create(user):
    return VideoController.create(user)


@videos_router.route('/videos', methods=['GET'])
@verify_token
def index(user):
    return VideoController.get_videos_list(user)

@videos_router.route('/videos/followeds', methods=['GET'])
@verify_token
def get_videos_from_followeds_user(user):
    return VideoController.get_from_followeds(user)


@videos_router.route('/video/<path:filename>', methods=['GET'])
def read(filename):

    try:
        return send_from_directory(f'database/files/videos/', filename)
    except:
        return send_from_directory(f'database/files/videos/', 'default.ogv')


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


@videos_router.route('/videos/<path:username>')
@verify_token
def get_videos_from_username(user, username):
    return VideoController.get_from_username(user, username)