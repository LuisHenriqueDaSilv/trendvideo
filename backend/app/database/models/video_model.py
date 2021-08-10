from app import db
from datetime import datetime

class Video(db.Model):


    __tablename__ = "videos"

    id = db.Column(db.Integer, autoincrement=True, primary_key=True, unique=True)
    name = db.Column(db.Text)
    description = db.Column(db.Text)
    created_at = db.Column(db.Text)
    thumbnail = db.Column(db.Text)
    likes = db.Column(db.Integer)
    
    owner_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))

    def __init__(self, name, owner_id, description, thumbnail):
        self.name = name
        self.owner_id = owner_id
        self.description = description
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.thumbnail = thumbnail
        self.likes = 0

    def __repr__(self):
        return f"<Video {self.name}>"