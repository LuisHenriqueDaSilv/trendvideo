from flask import request, Blueprint
import json
import sqlalchemy

from app import app, db

#Models
from ..database.models import Comment, Video

#Middlewares
from ..middlewares.verify_token import verify_token


comments_router = Blueprint(
    'comments_crud', 
    __name__
)
    
@comments_router.route('/comments/create', methods=['POST'])
@verify_token
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
            }, 400
            
            
        if not content:
            return {
                'status': 'error',
                'message': 'Comment content is not provided'
            }, 400
            
        if len(content) > 500:
            return {
                'status': 'error',
                'message': 'Invalid comment content length'
            }, 400
            
        if user.status != 'OK':
            return {
                'status': 'error',
                'message': f'To make a comment you need to confirm your email first'
            }, 401
            
        video = Video.query.filter_by(id=video_id).first()
        
        if not video:
            return {
                'status': 'error',
                'message': 'Video not found'
            }, 404
            

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

@comments_router.route('/comments/video', methods=['GET'])
@verify_token 
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

@comments_router.route('/comments/delete', methods=['DELETE'])
@verify_token
def delete(user):
    
    try:
        
        comment_id = request.form.get('comment_id')
        
        if not comment_id:
            return {
                'status': 'error',
                'message': 'Comment id is not provided'
            }, 400
            
        try: 
            comment_id = int(comment_id)
        except:
            return {
                'status': 'error',
                'message': 'Comment id is invalid'
            }, 400
        
        comment = Comment.query.filter_by(
            id=comment_id
        ).first()
        
        if not comment:
            return {
                'status': 'error',
                'message': 'Comment not found'
            }, 404
            
        if comment.owner_id != user.id:
            return {
                'status': 'error',
                'message': 'This comment is not yours'
            }, 401
            
        comment_data = {
            'content': comment.content,
            'id': comment.id,
            'comment_is_your': comment.owner.id == user.id,
            'owner': {
                'username': comment.owner.username,
                'id': comment.owner.id,
                'image_url': f'{request.url_root}/account/image/{comment.owner.image_name}'
            }
        }
        
        db.session.delete(comment)
        db.session.commit()
        
        return {
            'status': 'ok',
            'deleted_comment': comment_data
        }
        
        
    except Exception as error:

        app.logger.error(error)

        return {
            'status': 'error',
            'message': 'something unexpected happened'
        }, 500
