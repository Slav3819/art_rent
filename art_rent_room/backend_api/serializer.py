from rest_framework import serializers
from .models import UserRent

class UserRentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRent
        fields = ['name', 'title']