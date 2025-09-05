from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .models import User
from rest_framework import status
import jwt, datetime

# Create your views here.
class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        email = request.data['email']
        password = request.data['password']
        user = User.objects.filter(email=email).first()

        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')
        response = Response()
        response.set_cookie(key='token', value=token, httponly=True)
        response.data = {
            'token': token
        }
        return response

class LoginView(APIView):
    def post(self,request):
        email = request.data['email']
        password = request.data['password']
        user = User.objects.filter(email=email).first()

        if user is None:
            raise AuthenticationFailed('User not found!')

        if not user.check_password(password):
            raise AuthenticationFailed('Неверный пароль!')

        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow()+datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')
        response = Response()
        response.set_cookie(key='token', value=token, httponly=True)
        response.data = {
            'token': token
        }

        return response

class UserView(APIView):
    def get(self, request):
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

        serializer = UserSerializer(user)

        return Response(serializer.data)  # Возвращаем данные пользователя

    def patch(self, request):
        # Проверка аутентификации (та же логика, что и в get)
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

        # Частичное обновление данных пользователя
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def get(self,request):
        response = Response()
        response.delete_cookie('token')
        response.data = {
            'message': 'success'
        }
        return response