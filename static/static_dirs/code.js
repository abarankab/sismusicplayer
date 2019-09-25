var play_now = -1;
var page = 1;
var play_id = -1;
var songs_arr = [];
var last_query = "";

$(document).ready(function() {
    test();
    var audio = document.getElementById("audio1");
    var play_button = document.getElementById("play_btn");
    var play_header = document.getElementById("play_header");
    var line = document.getElementById("play_line");
    $("#addSong").submit(function() {
        $("#subm_song").prop("disabled", true);
    });
    audio.addEventListener("timeupdate", function() {
        update_pos();
    });
    audio.addEventListener("ended", function(){
        $("#playpause" + play_now).css({"box-shadow": "0px 0px 0px 0px #FAA41A"});
        if (play_id < songs_arr.length - 1){
            play(songs_arr[play_id + 1]);
        } else {
            play_id = -1;
            play_now = -1;
        }
    });

    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {

            page += 1;
            var query = $("#query").val();
            if (query !== last_query && page !== 1) {
                cont.innerHTML = "";
                page = 1;
                last_query = query;
            }
            $.get("/search/?page=" + page.toString() + "&query=" + query, function (data) {
                var parsed_res = JSON.parse(data);
                if (parsed_res['songs'].length === 0) {
                    page = Math.max(1, page - 1);
                } else {
                    var cont = document.getElementById("cont");
                    for (var i = 0; i < parsed_res['songs'].length; i++) {
                        cont.innerHTML += get_html(parsed_res['songs'][i], i);
                        songs_arr.push(parsed_res['songs'][i]['id']);
                    }
                }
            });
        }
    });

    function update_pos() {
        var duration = getDuration();
        var play_pos = audio.currentTime;
        var percent = play_pos / duration;
        play_header.style.left = percent * getLength() + "px";
    }
    function set_time(time) {
        audio.currentTime = time;
    }
    play_line.addEventListener("click", function (event) {
        var duration = getDuration();
        var x = event.clientX - $("#play_line").offset().left - $("#play_header").width() / 2;
        var percent = x / getLength();
        console.log(percent * duration);
        update_pos();
        set_time(percent * duration);
    });
    function getLength() {
        return $("#play_line").width() - $("#play_header").width();
    }
    function getDuration() {
        return audio.duration;
    }
    $.get("/search/", function (data) {
        var parsed_res = JSON.parse(data);
        var cont = document.getElementById("cont");
        cont.innerHTML = "";
        songs_arr = [];
        for (var i = 0; i < parsed_res['songs'].length; i++) {
            cont.innerHTML += get_html(parsed_res['songs'][i], i);
            songs_arr.push(parsed_res['songs'][i]['id']);
        }
    });

    $('#loadmore').on('click', function () {
        page += 1;
    });
    function get_html(mas, i) {
        if (play_now == mas['id'])
        {
            return `<div onclick="play(${mas['id']})" id="playpause${mas['id']}" style="height: 100%; background-color: #f7f7f7; padding: 5px 15px; margin-bottom: 5px; box-shadow: 0px 0px 0px 1px #FAA41A" box-sizing: border-box;">
                        <font class="card-title" style="font-size: 25px; width: 100%; display: inline-block; margin: 0">${mas['name']}</font>
                        <font class="text text-muted"> ${mas['author']} </font>
                        <input type='hidden' id='path${mas['id']}' value='${mas['path']}'>
                    </div id="playpause${mas['id']}">`;
        }
        else
        {
            return `<div onclick="play(${mas['id']})" id="playpause${mas['id']}" style="height: 100%; background-color: #f7f7f7; padding: 5px 15px; margin-bottom: 5px; box-sizing: border-box;">
                <font class="card-title" style="font-size: 25px; width: 100%; display: inline-block; margin: 0">${mas['name']}</font>
                <font class="text text-muted"> ${mas['author']} </font>
                <input type='hidden' id='path${mas['id']}' value='${mas['path']}'>
            </div>`;
        }
    }
    function search() {
        var query = $("#query").val();
        if (query != ""){
            page = 1;
        }
        $.get(`/search/?query=${query}`, function (data) {
            var parsed_res = JSON.parse(data);
            var cont = document.getElementById("cont");
            cont.innerHTML = "";
            if (parsed_res['songs'].length === 0) {
                $("#not_found").show();
            } else {
                $("#not_found").hide();
            }
            songs_arr = [];
            for (var i = 0; i < parsed_res['songs'].length; i++) {
                cont.innerHTML += get_html(parsed_res['songs'][i], i);
                songs_arr.push(parsed_res['songs'][i]['id']);
            }
        });
    }
    $("#search").click(search);
    $("#query").on("input", search);
});
function play(id) {
    var audio = document.getElementById("audio1");
    var gap = document.getElementById("gap");
    gap.style.display = "block";

    if (play_now !== id) {
        var audio = document.getElementById("audio1");
        audio.src = document.getElementById(`path${id}`).value;
        $("#playpause" + play_now).css({"box-shadow": "0px 0px 0px 0px #FAA41A"});
        play_now = id;
        for (var i = 0; i < songs_arr.length; i++){
            if (songs_arr[i] === id){
                play_id = i;
                break;
            }
        }
        $("#ftr").show();
        $("#play_btn").html("<img class='p_img' src='/static/pause.png'>");
        $("#playpause" + play_now).css({"box-shadow": "0px 0px 0px 1px #FAA41A"});
        audio.play();
    } else if (play_now === id && audio.paused) {
        $("#play_btn").html("<img class='p_img' src='/static/pause.png'>");
        audio.play();
    } else if (play_now === id && !audio.paused) {
        $("#play_btn").html("<img class='p_img' src='/static/play.png'>");
        audio.pause();
    }
}
function pause() {
    var audio = document.getElementById("audio1");

}
function trim(s){
  return ( s || '' ).replace( /^\s+|\s+$/g, '' );
}
function play_audio() {
     var audio = document.getElementById("audio1");
     if (audio.paused) {
         audio.play();
         $("#play_btn").html("<img class='p_img' src='/static/pause.png'>");

     } else {
         audio.pause();
         $("#play_btn").html("<img class='p_img' src='/static/play.png'>");
     }
}
function set_volume() {
    var audio = document.getElementById("audio1");
    var val = $("#volume").val() / 100;
    audio.volume = val;
}
var is_file_selected = false;
function test() {
    if(!is_file_selected || trim($("#formGroupExampleInput").val()) === "" || trim($("#formGroupExampleInput2").val()) === "") {
        $("#subm_song").prop("disabled", true);
    } else {
        $("#subm_song").prop("disabled", false);
    }
}