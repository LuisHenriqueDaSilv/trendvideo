from app import db
from datetime import datetime

class Video(db.Model):


    __tablename__ = "videos"

    id = db.Column(db.Integer, autoincrement=True, primary_key=True, unique=True)
    name = db.Column(db.Text)
    owner_id = db.Column(db.Integer)
    likes = db.Column(db.Integer)
    description = db.Column(db.Text)
    created_at = db.Column(db.Text)

    def __init__(self, name, owner_id, description):
        self.name = name
        self.owner_id = owner_id
        self.likes = 0
        self.description = description
        self.created_at = datetime.now().strftime('%d/%m/%Y-%H:%M')

    def __repr__(self):
        return f"<Video {self.name}"