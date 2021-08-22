from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging

app = Flask(
    __name__, 
    static_folder="../publics",
    static_url_path = '/static'
)


#App config
app.config.from_object('config')

CORS(app)


#Logger configs
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

log_format = '%(asctime)s:%(levelname)s:%(filename)s:%(message)s'
logging.basicConfig(
    filename='app/logs/logs.log',
    filemode='a+',
    level=logging.DEBUG,
    format=log_format
)


#Database config
db = SQLAlchemy(app)
migrate = Migrate(app, db, directory='./app/database/models/migrations')


#Blueprints
from .controllers.VideoController.routes import videos_router
from .controllers.AccountController.routes import accounts_router
from .controllers.CommentsController.routes import comments_router

app.register_blueprint(videos_router)
app.register_blueprint(accounts_router)
app.register_blueprint(comments_router)


#Database models
from .database.models import account_model, video_model, like_model, follow_model, comment_model, change_password_request_model #Used in database migration