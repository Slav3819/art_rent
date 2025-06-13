from rest_framework import serializers
from .models import DeviceRent
from .models import UserRent

class UserRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRent
        fields = ['name', 'title']

class DeviceRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceRent
        fields = ['title', 'img', 'desc', 'category', 'price']