from datetime import datetime

from app import db

class Video(db.Model):


    __tablename__ = "videos"

    id = db.Column(db.Integer, autoincrement=True, primary_key=True, unique=True)
    name = db.Column(db.Text)
    description = db.Column(db.Text)
    created_at = db.Column(db.Text)
    thumbnail = db.Column(db.Text)
    
    owner_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    
    likes = db.relationship('Like', backref='video')

    def __init__(self, name, owner_id, description, thumbnail):
        self.name = name
        self.owner_id = owner_id
        self.description = description
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.thumbnail = thumbnail

    def __repr__(self):
        return f"<Video {self.name}>"