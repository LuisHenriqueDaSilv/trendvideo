from flask import Blueprint

#Middlewares
from ...middlewares.verify_token import verify_token

#Controllers
from .controller import CommentsController

comments_router = Blueprint(
    'comments_crud', 
    __name__
)

@comments_router.route('/comments/create', methods=['POST'])
@verify_token
def create(user):
    return CommentsController.create(user)


@comments_router.route('/comments/video', methods=['POST'])
@verify_token
def index():
    return CommentsController.index()