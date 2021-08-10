from flask import request
from uuid import uuid4
from datetime import date
import sqlalchemy 
import cv2
import math
import os
import json

from app import app, db

#Models
from ...database.models import Video, Like

class VideoController():


    @staticmethod
    def create(user):

        try:

            if user.status != 'OK':
                
                return {
                    'status': 'error',
                    'message': f'Unable to post video with {user.status} account status '
                }, 400


            description = request.form.get('description')

            if description is None:
                description = ''

            if len(description) >= 200:
                return {
                    'status': 'error',
                    'message': 'Invalid description'
                }, 400


            
            video = request.files.get('video')

            if video is None:
                return {
                    'status': 'error',
                    'message': 'Invalid video'
                }, 400

            allowed_video_mimetypes = [
                'video/webm', 'video/ogg', 'video/mp4'
            ]

            if video.mimetype not in allowed_video_mimetypes:
                return {
                    'status': 'error',
                    'message': 'Invalid video format'
                }, 400


            video_name = f'{uuid4().hex}-{date.today()}.ogv'
            video.save(f'./app/database/files/videos/{video_name}')

            video_cv2 = cv2.VideoCapture(f'./app/database/files/videos/{video_name}')

            video_fps = video_cv2.get(cv2.CAP_PROP_FPS)
            video_frames = video_cv2.get(cv2.CAP_PROP_FRAME_COUNT)

            video_duration = math.floor(float(video_frames) / float(video_fps))

            if video_duration > 60* 2: # 2 minutes

                os.remove(f'./app/database/files/videos/{video_name}')

                return {
                    'status': 'error',
                    'message': 'video length too long'
                }, 400


            allowed_thumbnail_mimetypes = [
                "image/png", "image/jpeg"
            ]

            video_thumbnail = request.files.get('thumbnail')
            
            thumbnail_name =  f'{uuid4().hex}-{date.today()}.png'

            if video_thumbnail:

                if video_thumbnail.mimetype not in allowed_thumbnail_mimetypes:
                    return  {
                        'status': 'error',
                        'message': 'Invalid thumbnail format'
                    }, 400

                video_thumbnail.save(f'./app/database/files/thumbnails/{thumbnail_name}')

            else: 
                video_cv2.set(1, video_frames/3)
                ret, frame = video_cv2.read()
                cv2.imwrite(f'./app/database/files/thumbnails/{thumbnail_name}', frame)
                


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

    @staticmethod
    def delete(user):
        
        try:

            video_id = request.form.get('video_id')

            try:
                video_id = int(video_id)
            except:
                return {
                    'status': 'error',
                    'message': 'invalid video id'
                }, 400
            


            video = Video.query.filter_by(id=video_id).first()

            if video is None:
                return {
                    'status': 'error',
                    'message': 'Video not found'
                }, 400

            if video.owner_id != user.id:
                return {
                    'status': 'error',
                    'message': 'this video is not yours'
                }
            


            db.session.delete(video)
            db.session.commit()

            os.remove(f'./app/database/files/videos/{video.name}')


            return {'status': 'ok'}

        except Exception as error:
            
            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'Something unexpected happened'
            }, 500

    @staticmethod
    def getVideosList(user):

        try:

            args = dict(request.args)

            order_by = args.get('order_by') or 'latest'  # default news
            start = args.get('start') or 0 # default 0

            try:
                start = int(start)
            except Exception:
                return {
                    'status': 'error', 
                    'message': 'Start not is a number'
                }, 400

            videos_list = []

            if order_by == 'oldest':

                videos = Video.query.order_by(
                    Video.created_at
                ).limit(
                    25
                ).offset(
                    start
                ).all()

            elif order_by == 'most_liked':

                videos = Video.query.order_by(
                    sqlalchemy.desc(Video.likes)
                ).limit(
                    25
                ).offset(
                    start
                ).all()

            else:
            
                videos = Video.query.order_by(
                    sqlalchemy.desc(Video.created_at)
                ).limit(
                    25
                ).offset(
                    start
                ).all()

            for video in videos:

                likes_str = str(video.likes)
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

                    
                liked = False

                for like in user.likes:
                    if like.video_id == video.id:
                        liked = True

                ### to do: add followed<boolean>

                videos_list.append({
                    'url': f'{request.url_root}/video/{video.name}',
                    'video_data': {
                        'likes': f'{likes_str}{likes_complement}',
                        'description': video.description,
                        'created_at': video.created_at,
                        'thumbnail_url': f'{request.url_root}/videos/thumbnail/{video.thumbnail}',
                        'id': video.id,
                        'name': video.name,
                        'liked': liked
                    },
                    'owner': {
                        'username': video.owner.username,
                        'created_at': video.owner.created_at,
                        'followers': video.owner.followers,
                        'image_url': f'{request.url_root}/account/image/{video.owner.image_name}'
                    }
                })

            if len(videos_list) < 1:
                return {
                    'status': 'error',
                    'message': 'Could not find any video'
                }, 404
                
            return  json.dumps(videos_list)
            

        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'Something unexpected happened'
            }, 500

    @staticmethod
    def like(user):
        
        # Get video id from request
        # Test if video id is valid
        # add more 1 in video likes
        # add video in liked videos 

        try: 

            video_id = request.form.get('videoId')

            if not video_id:
                return {
                    'status': 'error',
                    'message': 'Video id not provided'
                }

            
            video = Video.query.filter_by(id=video_id).first()
            if not video:
                return {
                    'status': 'error',
                    'message': 'video not found'
                }

            like = Like.query.filter_by(video_id=video_id, user_id=user.id).first()

            if like:

                video.likes = video.likes - 1
                db.session.delete(like)
                db.session.commit()

                return {
                    'status': 'ok',
                    'message': 'unlike'
                }


            video.likes = video.likes + 1

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