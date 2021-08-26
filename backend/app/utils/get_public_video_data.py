from app.utils import format_number

def get_public_video_data(video, user, request):
    
    likes = format_number(len(video.likes))
    followers = format(video.owner.followers)
    
    liked_videos_ids = [like.video_id for like in user.likes]
    liked = video.id in liked_videos_ids
    
    followeds_users_ids = [
        follow.followed_user_id for follow in user.follows
    ]
    followed = video.owner.id in followeds_users_ids
    
    
    return {
        'url': f'{request.url_root}/video/{video.name}',
        'video_data': {
            'likes': likes,
            'description': video.description,
            'created_at': video.created_at,
            'thumbnail_url': f'{request.url_root}/videos/thumbnail/{video.thumbnail}',
            'id': video.id,
            'name': video.name,
            'liked': liked,
            'comments': len(video.comments)
        },
        'owner': {
            'username': video.owner.username,
            'created_at': video.owner.created_at,
            'followers': followers,
            'image_url': f'{request.url_root}/account/image/{video.owner.image_name}',
            'followed': followed,
            'id': video.owner.id
        }
    }