from app import db

class Comment(db.Model):
    
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    video_id = db.Column(db.Integer)
    content = db.Column(db.Text)
    
    def __init__(self, content, owner_id, video_id):
        
        self.owner_id = owner_id
        self.video_id = video_id
        self.content = content
        
    def __repr__(self):
        return f'<Comment "{self.content}">'