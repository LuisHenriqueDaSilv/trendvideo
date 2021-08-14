from app import db
from datetime import datetime

class Account(db.Model):

    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    username = db.Column(db.Text,  unique=True)
    email = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    followers = db.Column(db.Integer)
    confirmation_uuid = db.Column(db.Text)
    status = db.Column(db.Text)
    image_name = db.Column(db.Text)
    created_at = db.Column(db.Text)

    videos = db.relationship('Video', backref='owner')
    likes = db.relationship('Like', backref='user')
    follows = db.relationship('Follow', backref='follower')
    comments = db.relationship('Comment', backref='owner')


    def __init__(self, username, email, password, confirmation_uuid, image_name):

        self.followers = 0
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.status= 'awaiting confirmation'

        self.email = email
        self.username = username
        self.password = password
        self.image_name = image_name
        self.confirmation_uuid = confirmation_uuid

    def __repr__(self):
        return f"<Account {self.username}>"