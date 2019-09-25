from django.core.files.storage import FileSystemStorage
from django.db import models

# Create your models here.

class Song(models.Model):
    author = models.CharField(max_length=40, unique=False)
    formatted_author = models.CharField(max_length=40, default='', unique=False)
    name = models.CharField(max_length=40, unique=False)
    formatted_name = models.CharField(max_length=40, default='', unique=False)
    path = models.FileField()