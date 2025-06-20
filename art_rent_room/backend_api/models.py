from django.db import models
from users.models import User
# Create your models here.
class UserRent(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)


class DeviceRent(models.Model):
    title = models.CharField(max_length=100)
    img = models.CharField(max_length=100)
    desc = models.TextField(max_length=100)
    category = models.CharField(max_length=100)
    price = models.FloatField()

class Basket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    device = models.ForeignKey(DeviceRent, on_delete=models.CASCADE)


