from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging


app = Flask(__name__)


#App config
app.config.from_object('config')

CORS(app)


#Logger configs
log_format = '%(asctime)s:%(levelname)s:%(filename)s:%(message)s'
logging.basicConfig(
    filename='app/logs/logs.log',
    filemode='a+',
    level=logging.DEBUG,
    format=log_format
)


#Database config
db = SQLAlchemy(app)
migrate = Migrate(app, db, directory='./app/models/migrations')


#Blueprints
from .routes import router
app.register_blueprint(router)


#Database models
from .models import account_model, video_model #Used in database migration