from django.contrib import admin

# Register your models here.
from musicplayer.models import Song


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = [
        'author',
        'name',
        'path'
    ]