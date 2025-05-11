from django.db import models

# Create your models here.
class UserRent(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
