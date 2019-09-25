import os

from django.core.files.storage import FileSystemStorage
from django.db.models import Q
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render, redirect
import random

# Create your views here.
from django.utils.decorators import method_decorator
from django.views import View
import json
from sismusicplayer import settings

from django.views.decorators.csrf import csrf_protect

from .forms import FileUploadForm

from musicplayer.models import Song

COUNT_ON_PAGE = 10
SUPPORTED_TYPES = ['mp3', 'wav', 'ogg', 'flac']


class MainView(View):
    def get(self, request):
        return render(request, 'main.html')

def send_audio(request):
    name = request.GET.get('name', '')
    if name != "" and name.split('.')[-1] in SUPPORTED_TYPES and os.path.exists(os.path.join(settings.BASE_DIR, 'media', name)):
        ext = name.split('.')[-1]
        namef = os.path.join(settings.BASE_DIR, 'media', name)
        f = open(namef, "rb")
        resp = HttpResponse(content_type='audio/' + ext)
        resp.write(f.read())
        resp['Content-Range'] = 'bytes 1-' + str(os.path.getsize(namef))
        resp['Content-Length'] = os.path.getsize(namef)
        return resp


class SearchView(View):
    def get(self, request):
        query = request.GET.get('query', '').lower()
        page = int(request.GET.get('page', '1'))
        print(page)
        if query:
            songs = Song.objects.filter(Q(formatted_author__icontains=query) | Q(formatted_name__icontains=query)).order_by("-id")
        else:
            songs = Song.objects.all().order_by("-id")
        songs = songs[(page - 1) * COUNT_ON_PAGE:page * COUNT_ON_PAGE]
        print(songs)
        result = {"songs": []}
        for song in songs:
            name = song.name
            author = song.author
            path = song.path.url
            result['songs'].append({"id": song.id, "name": name, "author": author, "path": path})
        return HttpResponse(json.dumps(result, ensure_ascii=False).encode('utf-8'))

class AddView(View):
    @method_decorator(csrf_protect)
    def post(self, request):
        file = request.FILES['path']
        author = request.POST.get('author')
        formatted_author = author.lower()
        name = request.POST.get('name')
        formatted_name = name.lower()

        if author.strip() == '':
            return HttpResponseBadRequest
        if name.strip() == '':
            return HttpResponseBadRequest
        if file == None:
            return HttpResponseBadRequest

        ext = file.name.split('.')[-1]
        if not (ext in SUPPORTED_TYPES):
            return HttpResponseBadRequest

        newSong = Song()
        newSong.author = author
        newSong.formatted_author = formatted_author
        newSong.name = name
        newSong.formatted_name = formatted_name
        newSong.path = file
        newSong.save()

        return redirect('/')