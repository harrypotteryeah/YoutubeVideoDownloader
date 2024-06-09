import json
import tkinter.filedialog
import download
import eel


with open(r"C:\Users\cagri\OneDrive\Masaüstü\Programming\python projects\YoutubeVideoDownloader\settings.json","r+") as f:
    settings_dict=json.loads(f.read())



eel.init(r"C:\Users\cagri\OneDrive\Masaüstü\Programming\python projects\YoutubeVideoDownloader\web")
eel.start("index.html",mode="chrome",size=(settings_dict["window_width"],settings_dict["window_height"]))