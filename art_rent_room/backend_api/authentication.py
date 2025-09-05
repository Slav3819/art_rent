import jwt
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from users.models import User


def get_user_from_token(request):
    token = request.COOKIES.get('token')

    if not token:
        raise AuthenticationFailed('Unauthenticated!')
    try:
        payload = jwt.decode(token, 'secret', algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token has expired!')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token!')

    user = User.objects.filter(id=payload['id']).first()
    if user is None:
        raise AuthenticationFailed('User not found!')

    return user