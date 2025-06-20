from rest_framework import serializers
from .models import *

class UserRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRent
        fields = ['name', 'title']


class DeviceRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceRent
        fields = '__all__'


class BasketSerializer(serializers.ModelSerializer):
    device = DeviceRentSerializer()  # Вложенный сериализатор
    class Meta:
        model = Basket
        fields = '__all__'



