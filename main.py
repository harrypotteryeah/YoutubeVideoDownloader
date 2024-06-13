import json
import tkinter.filedialog
import tkinter as tk
import download
import os
import pyperclip
import gevent.monkey
gevent.monkey.patch_all()
import eel


with open(r"settings.json","r+") as f:
    settings_dict=json.loads(f.read())
    if settings_dict["output_path"]=="":
        settings_dict["output_path"] = os.path.normpath(os.path.expanduser("~/Desktop/videos"))

@eel.expose
def loadSettings():
    return settings_dict

@eel.expose
def saveSettings(settingsDict:dict):
    global settings_dict
    settings_dict=settingsDict
    with open(r"settings.json","w+") as f:
        f.write(json.dumps(settingsDict))

saveSettings(settings_dict)
@eel.expose
def getOutputPath():
    window = tk.Tk()#To open filedialog on top
    window.wm_attributes('-topmost', 1)
    window.withdraw()
    return tkinter.filedialog.askdirectory()

videosDict={}

@eel.expose
def getVideoOrPlaylist(url:str)->dict:
    if "playlist?list=" in url:
        xDict=download.get_videos_from_playlist(url)
        videosDict.update(xDict)
        for i in xDict.items():
            eel.addVideo(i[0],i[1][1])
    else:
        xDict=download.get_video(url)
        videosDict.update(xDict)
        i=list(xDict.items())[0]
        eel.addVideo(i[0],i[1][1])

@eel.expose
def getThumbnailUrl(name:str)->str:
    return videosDict[name][1]

@eel.expose
def renameVideo(oldName,newName):
    newDict={newName:videosDict[oldName]}
    del videosDict[oldName]
    videosDict.update(newDict)

@eel.expose
def deleteVideo(name:str):
    del videosDict[name]

@eel.expose
def downloadAllVideos(fileFormat:str, videoQuality:str):
    download.download_videos_synchronous(videosDict, settings_dict["output_path"], videoQuality, fileFormat=="mp4",download_started_callback=eel.videoStartedDownloading,download_finished_callback=eel.videoFinishedDownloading, downloading_error_callback=eel.videoFailedDownloading)


clipboardModeActivated = True
@eel.expose
def enableClipboardMode():
    while True:
        global clipboardModeActivated
        if not clipboardModeActivated:
            break
        try:
            pyperclip.waitForNewPaste(timeout=1)
            copied_text=pyperclip.paste()
            getVideoOrPlaylist(copied_text)
            
        except pyperclip.PyperclipTimeoutException:
            pass

@eel.expose
def disableClipboardMode():
    global clipboardModeActivated
    clipboardModeActivated = False


eel.init(r"web")
eel.start("index.html",mode="chrome",size=(settings_dict["window_width"],settings_dict["window_height"]))