from app import db

class Follow(db.Model):

    __tablename__ = 'follows'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    followed_user_id = db.Column(db.Integer)

    def __init__(self, user_id, followed_user_id):
        self.user_id = user_id
        self.followed_user_id = followed_user_id

    def __repr__(self):
        return f'<Follow {self.user_id} following {self.followed_user_id}>'