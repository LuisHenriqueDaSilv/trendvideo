from flask import request
import json
import sqlalchemy

from app import app, db

from ...database.models import Comment, Video

class CommentsController():
    
    
    @staticmethod
    def create(user):
        
        try: 
            
            video_id = request.form.get('video_id')
            content = request.form.get('content')
            
            if not video_id:
                return {
                    'status': 'error',
                    'message': 'Video id is not provided'
                }, 400
                
            try:
                video_id = int(video_id)
            except:
                return {
                    'status': 'error',
                    'message': 'Invalid video id'
                } 
                
                
            if not content:
                return {
                    'status': 'error',
                    'message': 'Comment content is not provided'
                }
                
            if user.status != 'OK':
                return {
                    'status': 'error',
                    'message': f'To make a comment you need to confirm your email first'
                }
                
            video = Video.query.filter_by(id=video_id).first()
            
            if not video:
                return {
                    'status': 'error',
                    'message': 'Video not found'
                }
                

            comment = Comment(
                content=str(content),
                owner_id=user.id,
                video_id=video_id
            )
                        
            db.session.add(comment)
            db.session.commit()
                        
            return {
                'status': 'ok',
                'comment': {
                    'content': comment.content,
                    'id': comment.id,
                    'comment_is_your': comment.owner.id == user.id,
                    'owner': {
                        'username': comment.owner.username,
                        'id': comment.owner.id,
                        'image_url': f'{request.url_root}/account/image/{comment.owner.image_name}'
                    }
                }
            }

            
        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'something unexpected happened'
            }, 500
            
    def index(user):
        
        try:
            
            args = dict(request.args)

            video_id = args.get('video_id')
            start = args.get('start') or 0  # default 0
            
            if not video_id:
                return {
                    'status': 'error',
                    'message': 'Video id is not provided'
                },400
                
            try:
                video_id = int(video_id)
                start = int(start)
            except:
                return {
                    'status': 'error',
                    'message': 'Video id or start value is invalid'
                }, 400
                
            video = Video.query.filter_by(
                id=video_id
            ).first()
            
            if not video:
                return  {
                    'status': 'error',
                    'message': 'Video not found'
                }, 404
                
            comments = Comment.query.filter_by(
                video_id=video_id 
            ).order_by(
                sqlalchemy.desc(Comment.id)
            ).limit(
                30
            ).offset(
                start
            ).all()
            
            if not comments:
                return {
                    'status': 'error',
                    'message': 'Could not find any comment'
                }, 404
                
            comments_list = []
            for comment in comments:
                comments_list.append({
                    'content': comment.content,
                    'id': comment.id,
                    'comment_is_your': comment.owner.id == user.id,
                    'owner': {
                        'username': comment.owner.username,
                        'id': comment.owner.id,
                        'image_url': f'{request.url_root}/account/image/{comment.owner.image_name}'
                    }
                })
                                
            return json.dumps(comments_list)
            
        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'something unexpected happened'
            }, 500
        