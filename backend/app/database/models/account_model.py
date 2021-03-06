from app import db
from datetime import datetime

class Account(db.Model):
    

    __tablename__ = "accounts"

    id = db.Column(
        db.Integer, 
        primary_key=True, 
        autoincrement=True, 
        unique=True
    )
    
    username = db.Column(db.Text,  unique=True)
    email = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    followers = db.Column(db.Integer)
    status = db.Column(db.Text)
    image_name = db.Column(db.Text)
    created_at = db.Column(db.Text)

    videos = db.relationship('Video', backref='owner')
    likes = db.relationship('Like', backref='user')
    comments = db.relationship('Comment', backref='owner')
    change_password_requests = db.relationship(
        'ChangePasswordRequest', 
        backref='user'
    )
    confirm_account_process = db.relationship(
        'ConfirmAccountProcess',
        backref='owner'
    )

    def __init__(
        self, 
        username, 
        email, 
        password, 
        image_name
    ):

        self.followers = 0
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.status= 'awaiting confirmation'

        self.email = email
        self.username = username
        self.password = password
        self.image_name = image_name

    def __repr__(self):
        return f"<Account {self.username}>"
