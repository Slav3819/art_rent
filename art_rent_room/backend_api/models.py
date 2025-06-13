from django.db import models

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
