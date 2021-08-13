from app import db


class Like(db.Model):

    __tablename__ = "likes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'))
    
    
    def __init__(self, user_id, video_id):
        self.user_id = user_id
        self.video_id = video_id

    def __repr__(self):
        return f"<Like {self.user_id} in {self.video_id}>"