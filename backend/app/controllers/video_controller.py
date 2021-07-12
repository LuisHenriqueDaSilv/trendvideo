from logging import exception
from flask import request
from uuid import uuid4
from datetime import date
import cv2
import math
import os

from app import app, db

#Models
from ..models import Video


def create(user):

    try:


        if user is None:
            raise Exception('Something wrong happened in token verification')

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

        if video.mimetype in allowed_video_mimetypes:
            
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
            
        else:
            return {
                'status': 'error',
                'message': 'Invalid video format'
            }, 400
        
        

        video_to_save = Video(
            name=video_name, 
            owner_id=user.id,
            description=description
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

def delete(user):
    
    try:

        if user is None:
            raise Exception('Something wrong happened in token verification')

        
        
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