from app import db

class ChangePasswordRequest(db.Model):
    
    __tablename__ = "change_password_requests"
    
    id = db.Column(
        db.Integer, 
        primary_key=True, 
        autoincrement=True, 
        unique=True
    )
    
    uuid = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    
    def __init__(self, uuid, user_id):
        self.uuid = uuid
        self.user_id = user_id
