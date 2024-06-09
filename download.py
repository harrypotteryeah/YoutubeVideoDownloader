import pytube
import re
import concurrent.futures
import eel


def get_video(url:str) ->pytube.YouTube:
    return pytube.YouTube(url)

def get_videos_from_urls(list_of_urls:list)->list:
    videos = []
    for url in list_of_urls:
        video = pytube.YouTube(url)
        videos.append(video)

    return videos

def get_videos_from_playlist(playlist_url:str)->list:
    playlist = pytube.Playlist(playlist_url)
    playlist._video_regex = re.compile(r"\"url\":\"(/watch\?v=[\w-]*)")
    videos = []
    for video in playlist.videos:
        videos.append(video)

    return videos

def download_video(video:pytube.YouTube, OUTPUT_PATH:str, video_quality:str, download_mp4:bool =True):
    if download_mp4:
        download_stream = video.streams.filter(res=video_quality).first()
    else:
        download_stream= video.streams.filter(only_audio=True).first()
        if ".mp4" in download_stream.default_filename:
            return download_stream.download(output_path=OUTPUT_PATH,filename=download_stream.default_filename.replace(".mp4",".mp3"))

    
    out_file= download_stream.download(output_path=OUTPUT_PATH)
    return out_file

def download_videos_in_parallel(videos_list:list, OUTPUT_PATH:str, use_thread:bool =False):

    if use_thread:
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=len(videos_list))
    else:
        executor = concurrent.futures.ProcessPoolExecutor(max_workers=len(videos_list))

    with executor:
        future_objects=[]
        for video in videos_list:
            x = executor.submit(download_video,video,OUTPUT_PATH)
            future_objects.append(x)
        
        results=[]
        for future in concurrent.futures.as_completed(future_objects):
             results.append(future.result())
    
    return results

def download_videos_synchronous(videos_list,OUTPUT_PATH):
    files=[]
    for video in videos_list:
        files.append(download_video(video,OUTPUT_PATH))
    return files
