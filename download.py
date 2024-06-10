import pytube
import re
import concurrent.futures
import eel


def get_video(url:str) ->dict:
    video=pytube.YouTube(url)
    return {url:[video,video.title,video.thumbnail_url]}

def get_videos_from_urls(list_of_urls:list)->dict:
    videosDict = {}
    for url in list_of_urls:
        videosDict.update(get_video(url))
    return videosDict

def get_videos_from_playlist(playlist_url:str)->dict:
    playlist = pytube.Playlist(playlist_url)
    playlist._video_regex = re.compile(r"\"url\":\"(/watch\?v=[\w-]*)")
    videosDict={}
    for video in playlist.videos:
        videosDict[video.watch_url]=[video,video.title,video.thumbnail_url]

    return videosDict

def download_video(video:pytube.YouTube, OUTPUT_PATH:str, video_quality:str, download_mp4:bool =True, filename:str=None):
    if download_mp4:
        download_stream = video.streams.filter(res=video_quality).first()
    else:
        download_stream= video.streams.filter(only_audio=True).first()
        if ".mp4" in download_stream.default_filename:
            return download_stream.download(output_path=OUTPUT_PATH,filename=download_stream.default_filename.replace(".mp4",".mp3"))

    
    out_file= download_stream.download(output_path=OUTPUT_PATH, filename=filename)
    return out_file

def download_videos_in_parallel(videos_dict:dict, OUTPUT_PATH:str, video_quality:str, download_mp4:bool =True, use_thread:bool =False):

    if use_thread:
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=len(videos_dict))
    else:
        executor = concurrent.futures.ProcessPoolExecutor(max_workers=len(videos_dict))

    with executor:
        future_objects=[]
        for video in videos_dict.items():
            x = executor.submit(download_video,video,OUTPUT_PATH,video_quality,download_mp4,filename=None)
            future_objects.append(x)
        
        results=[]
        for future in concurrent.futures.as_completed(future_objects):
             results.append(future.result())
    
    return results

def download_videos_synchronous(videos_list:list, OUTPUT_PATH:str, video_quality:str, download_mp4:bool =True):
    files=[]
    for video in videos_list:
        files.append(download_video(video,OUTPUT_PATH))
    return files
