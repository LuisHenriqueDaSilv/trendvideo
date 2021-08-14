from flask import request

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
                'status': 'ok'
            }

            
        except Exception as error:

            app.logger.error(error)

            return {
                'status': 'error',
                'message': 'something unexpected happened'
            }, 500
            
    def index(user):
        return 'ok'    
    