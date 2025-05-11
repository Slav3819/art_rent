from django.shortcuts import render
from rest_framework.views import APIView
from .models import UserRent
from .serializer import UserRentSerializer
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