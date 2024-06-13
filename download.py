import pytube
import re
import concurrent.futures


def get_video(url:str)->dict:
    video=pytube.YouTube(url)
    return {video.title:[video,video.thumbnail_url]}

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
        videosDict[video.title]=[video,video.thumbnail_url]

    return videosDict

def download_video(video:pytube.YouTube, OUTPUT_PATH:str, video_quality:str, download_mp4:bool, filename:str, download_started_callback:callable =None, download_finished_callback:callable =None, downloading_error_callback:callable =None)->str:
    filename=filename+(".mp4" if download_mp4 else ".mp3")
    try:
        if download_started_callback!=None:
            download_started_callback(filename[:-4])#filename without extension
        else:
            print(f"Downlaoding {filename}")

        if download_mp4:
            download_stream = video.streams.filter(res=video_quality,progressive=True).first()
        else:
            download_stream= video.streams.filter(only_audio=True).first()
        

        out_file= download_stream.download(output_path=OUTPUT_PATH, filename=filename)

        if download_finished_callback!=None: 
            download_finished_callback(filename[:-4])
        else:
            print(f"Downloaded {filename}")
        return out_file
    except Exception as e:
        if downloading_error_callback!=None:
            downloading_error_callback(filename)
        #print(f"Error downloading {filename[:-4]}: {e}")
        raise e

def download_videos_in_parallel(videos_dict:dict, OUTPUT_PATH:str, video_quality:str, download_mp4:bool =True, use_thread:bool =False)->list:

    if use_thread:
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=len(videos_dict))
    else:
        executor = concurrent.futures.ProcessPoolExecutor(max_workers=len(videos_dict))

    with executor:
        future_objects=[]
        for video in videos_dict.items():    # video = (video.title, [video, video.thumbnail_url])
            x = executor.submit(download_video, video[1][0], OUTPUT_PATH, video_quality, download_mp4, filename=video[0])
            future_objects.append(x)
        
        results=[]
        for future in concurrent.futures.as_completed(future_objects):
             results.append(future.result())
    
    return results

def download_videos_synchronous(videos_dict:dict, OUTPUT_PATH:str, video_quality:str, download_mp4:bool =True, download_started_callback:callable =None, download_finished_callback:callable =None, downloading_error_callback:callable =None)->list:
    files=[]
    for video in videos_dict.items(): # video = (video.title, [video, video.thumbnail_url])
        files.append(download_video(video[1][0], OUTPUT_PATH, video_quality, download_mp4, filename=video[0], download_started_callback=download_started_callback, download_finished_callback=download_finished_callback, downloading_error_callback=downloading_error_callback))
    return files
