from django.shortcuts import render
from rest_framework.views import APIView
from .models import UserRent
from .serializer import UserRentSerializer
from .models import DeviceRent
from .serializer import DeviceRentSerializer
from rest_framework.response import Response

# Create your views here.
class UserRentView(APIView):
    def get(self, request):
        output = [
            {
                "name": output.name,
                "title": output.title
            } for output in UserRent.objects.all()
        ]
        return Response(output)

    def post(self, request):
        serializer = UserRentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

class DeviceRentView(APIView):
    def get(self, request):
        output = [
            {
                "id": output.id,
                "title": output.title,
                "img": output.img,
                "desc": output.desc,
                "category": output.category,
                "price": output.price
            } for output in DeviceRent.objects.all()
        ]
        return Response(output)

    def post(self, request):
        serializer = DeviceRentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)