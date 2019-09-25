from django.forms import ModelForm
from django import forms
from musicplayer.models import Song

class FileUploadForm(ModelForm):

    class meta:
        model = Song