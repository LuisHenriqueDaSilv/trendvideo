from flask import Blueprint, send_file, send_from_directory, request
from uuid import uuid4
from datetime import date
import sqlalchemy
import cv2
import math
import os
import json

# Middlewares
from ..middlewares.verify_token import verify_token

#Models
from ..database.models import Video, Like, Comment, Account

videos_router = Blueprint(
    'video_crud',
    __name__
)

@videos_router.route('/video/create', methods=['POST'])
@verify_token
def create(user):

    try:

        if user.status != 'OK':
            return {
                'status': 'error',
                'message': f'To post one video you need confirm your email first'
            }, 400

        description = request.form.get('description')

        if not description:
            description = ''

        if len(description) > 200:
            return {
                'status': 'error',
                'message': 'Invalid description length'
            }, 400

        video = request.files.get('video')

        if not video:
            return {
                'status': 'error',
                'message': 'Invalid video'
            }, 400

        allowed_video_mimetypes = [
            'video/webm', 
            'video/ogg', 
            'video/mp4'
        ]

        if video.mimetype not in allowed_video_mimetypes:
            return {
                'status': 'error',
                'message': 'Invalid video format'
            }, 400

        video_name = f'{uuid4().hex}-{date.today()}.ogv'
        video.save(f'./app/database/files/videos/{video_name}')

        video_cv2 = cv2.VideoCapture(
            f'./app/database/files/videos/{video_name}'
        )
        video_fps = video_cv2.get(cv2.CAP_PROP_FPS)
        video_frames = video_cv2.get(cv2.CAP_PROP_FRAME_COUNT)
        video_duration = math.floor(float(video_frames) / float(video_fps))

        if video_duration > 60 * 2:  # 2 minutes
            os.remove(f'./app/database/files/videos/{video_name}')

            return {
                'status': 'error',
                'message': 'video length too long'
            }, 400

        video_thumbnail = request.files.get('thumbnail')

        thumbnail_name = f'{uuid4().hex}-{date.today()}.png'

        if video_thumbnail:
            allowed_thumbnail_mimetypes = [
                "image/png", 
                "image/jpeg"
            ]
            
            if video_thumbnail.mimetype not in allowed_thumbnail_mimetypes:
                return {
                    'status': 'error',
                    'message': 'Invalid thumbnail format'
                }, 400
                
            else: 
                video_thumbnail.save(
                    f'./app/database/files/thumbnails/{thumbnail_name}'
                )

        else:
            video_cv2.set(
                1,
                video_frames/3
            ) # 1 Frame in 1 third of the video
            
            ret, frame = video_cv2.read()
            cv2.imwrite(
                f'./app/database/files/thumbnails/{thumbnail_name}',
                frame
            )

        video_to_save = Video(
            name=video_name,
            owner_id=user.id,
            description=description,
            thumbnail=thumbnail_name
        )

        db.session.add(video_to_save)
        db.session.commit()

        return {'status': 'ok'}

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'Something unexpected happened'
        }, 500

@videos_router.route('/video/delete', methods=['DELETE'])
@verify_token
def delete(user):

    try:

        video_id = request.form.get('video_id')
        
        if not video_id:
            return {
                'status': 'error',
                'message': 'Video id not provided'
            } 

        try:
            video_id = int(video_id)
        except:
            return {
                'status': 'error',
                'message': 'Invalid video id'
            }, 400

        video = Video.query.filter_by(
            id=video_id
        ).first()

        if not video:
            return {
                'status': 'error',
                'message': 'Video not found'
            }, 400

        if video.owner_id == user.id:
            
            Comment.query.filter_by(
                video_id=video_id
            ).delete()
            
            db.session.delete(video)
            db.session.commit()

            os.remove(f'./app/database/files/videos/{video.name}')

            return {'status': 'ok'}
        else:
            return {
                'status': 'error',
                'message': 'this video is not yours'
            }, 401

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'Something unexpected happened'
        }, 500

@videos_router.route('/videos', methods=['GET'])
@verify_token
def get_videos_list(user):

    try:

        args = dict(request.args)

        order_by = args.get('order_by') or 'latest'  # default news
        start = args.get('start') or 0  # default 0

        try:
            start = int(start)
        except Exception:
            return {
                'status': 'error',
                'message': 'Start param not is a number'
            }, 400

        if order_by == 'oldest':

            videos = Video.query.order_by(
                Video.created_at
            ).limit(
                25
            ).offset(
                start
            ).all()

        elif order_by == 'most_liked':
            
            videos = Video.query.all()
                            
            def sort_by_key(video):
                return len(video.likes)
            
            videos.sort(key=sort_by_key, reverse=True)
            
            videos = videos[start:start+25:1]

        else:

            videos = Video.query.order_by(
                sqlalchemy.desc(Video.created_at)
            ).limit(
                25
            ).offset(
                start
            ).all()

        followeds_users_ids = [
            follow.followed_user_id for follow in user.follows
        ]
        
        liked_videos_ids = [
            like.video_id for like in user.likes
        ]

        videos_list = []

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

            is_following_video_owner = video.owner.id in followeds_users_ids

            videos_list.append({
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
                    'followed': is_following_video_owner,
                    'id': video.owner.id
                }
            })

        if len(videos_list) < 1:
            return {
                'status': 'error',
                'message': 'Could not find any video'
            }, 404

        return json.dumps(videos_list)

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'Something unexpected happened'
        }, 500

@videos_router.route('/videos/followeds', methods=['GET'])
@verify_token
def get_from_followeds(user):
    
    try:
        
        args = dict(request.args)

        start = args.get('start') or 0  # default 0
        
        try: 
            pass
        except:
            return {
                'status': 'error',
                'message': 'Start param not is a number'
            }, 400
        
        followeds_userd_id = [follow.followed_user_id for follow in user.follows]
        
        videos = Video.query.filter(
            Video.owner_id.in_(followeds_userd_id)
        ).limit(
            25
        ).offset(
            start
        ).all()
        
        
        liked_videos_ids = [
            like.video_id for like in user.likes
        ]
        
        videos_list = []
        
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

            videos_list.append({
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
                    'followed': True,
                    'id': video.owner.id
                }
            })
        
        if not videos_list:
            return {
                'status': 'error',
                'message': 'Could not find any video'
            }, 404
            
            
        return json.dumps(videos_list)
        
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'Something unexpected happened'
        }, 500
        
@videos_router.route('/video/like', methods=['POST'])
@verify_token
def like(user):

    try:
        
        if user.status != 'OK':
            return {
                'status': 'error',
                'message': f'To like one video you need to confirm your email first.'
            }, 400

        video_id = request.form.get('videoId')

        if not video_id:
            return {
                'status': 'error',
                'message': 'Video id not provided'
            }, 400

        video = Video.query.filter_by(id=video_id).first()
        
        if not video:
            return {
                'status': 'error',
                'message': 'Video not found'
            }, 404

        like = Like.query.filter_by(
            video_id=video_id, user_id=user.id
        ).first()

        if like:

            db.session.delete(like)
            db.session.commit()

            return {
                'status': 'ok',
                'message': 'unlike'
            }
        else:
            

            like = Like(
                video_id=video_id,
                user_id=user.id
            )
            db.session.add(like)
            db.session.commit()

            return {
                'status': 'ok',
                'message': 'like'
            }

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'Something unexpected happened'
        }, 500

@videos_router.route('/videos/<path:username>')
@verify_token
def get_from_username(user, username):
    
    try:
    
        args = dict(request.args)

        start = args.get('start') or 0  # default 0
        
        try: 
            start = int(start)
        except:
            return {
                'status': 'error',
                'message': 'Start param not is a number'
            }, 400
        
        if not username:
            return {
                'status': 'error',
                'message': 'Username is not provided'
            }, 400
                        
        videos_owner = Account.query.filter_by(username=username).first()
        
        if not videos_owner:
            return {
                'status': 'error',
                'message': 'User not found'
            }, 404
        
        videos = Video.query.filter_by(
            owner_id=videos_owner.id
        ).order_by(
            sqlalchemy.desc(Video.created_at)
        ).limit(
            25
        ).offset(
            start
        ).all()
        
        followeds_users_ids = [
            follow.followed_user_id for follow in user.follows
        ]
        liked_videos_ids = [
            like.video_id for like in user.likes
        ]
        
        videos_list = []
        
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

            is_following_video_owner = video.owner.id in followeds_users_ids

            videos_list.append({
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
                    'followed': is_following_video_owner,
                    'id': video.owner.id
                }
            })

        if len(videos_list) < 1:
            return {
                'status': 'error',
                'message': 'Could not find any video'
            }, 404

        return json.dumps(videos_list)
        

    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'Something unexpected happened'
        }, 500

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
