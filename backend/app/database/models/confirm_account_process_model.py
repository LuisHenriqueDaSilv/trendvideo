from app import db

class ConfirmAccountProcess(db.Model):
    
    __tablename__ = 'confirm_account_process'
    
    id = db.Column(
        db.Integer, 
        primary_key=True, 
        autoincrement=True, 
        unique=True
    )
    uuid = db.Column(db.Text, unique=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    
    def __init__(self, uuid, owner_id):
        self.uuid = uuid
        self.owner_id = owner_id
    
    def __repr__(self):
        return f''