document.addEventListener('DOMContentLoaded', async function() {
    const videoUrlInput = document.getElementById('videoUrl');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const videoList = document.getElementById('videoList');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clipboardModeBtn = document.getElementById('clipboardModeBtn');
    const fileFormatBtn = document.getElementById('fileFormatBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const videoQualityOption = document.getElementById('videoQualityOption');
    const videoQualityOptions = document.getElementById('videoQualityOptions');
    const saveVideoQualityBtn = document.getElementById('saveVideoQualityBtn');
    const outputPathOption = document.getElementById('outputPathOption');
    const outputPathInputContainer = document.getElementById('outputPathInputContainer');
    const pickDirectoryBtn = document.getElementById('pickDirectoryBtn');
    const saveOutputPathBtn = document.getElementById('saveOutputPathBtn');
    const languageOption = document.getElementById('languageOption');
    const languageOptions = document.getElementById('languageOptions');
    const languageSelect = document.getElementById('languageSelect');

    async function loadSettings(){
        let settingsDict = await eel.loadSettings()();
        return settingsDict;
    }

    let clipboardModeActivated = false;
    let fileFormat = "mp4";
    let currentOpenOptions = null;
    let videoQuality = "360p";
    let settingsDict = await loadSettings();

    document.getElementById('outputPathInput').value = settingsDict["output_path"];

    const translations = {
        en: {
            title: "Video Downloader",
            videoQuality: "Video Quality",
            outputPath: "Output Path",
            languageSettings: "Language Settings",
            addVideo: "Add Video",
            downloadAll: "Download All",
            save: "Save",
            pickDirectory: "Pick Directory",
            urlPlaceholder: "Enter video or playlist URL",
            outputPathPlaceholder: "Enter output path",
            download: "Download",
            alertEnterValidUrl: "Please enter a valid URL",
            alertErrorDownloading: "An error occurred while downloading the video below:",
            alertFailedFetchThumbnail: "Failed to fetch video thumbnail",
            alertDownloadingVideos: "Downloading all videos...",
            alertClipboardModeActivated: "Clipboard mode activated",
            alertClipboardModeDeactivated: "Clipboard mode deactivated",
            alertSelectedVideoQuality: "Selected Video Quality:",
            alertOutputPath: "Output Path:",
            alertOpeningFileExplorer: "Opening file explorer to pick output path...",
            alertConfirmDelete: "Are you sure you want to delete this video?",
            tooltipSettings: "Open Settings",
            tooltipVideoQuality: "Choose video quality",
            tooltipOutputPath: "Set output path",
            tooltipLanguage: "Change language",
            tooltipClipboardMode: "Automatically paste from clipboard when you copy",
            tooltipFileFormat: "Toggle between MP4 and MP3 format",
            tooltipPickDirectory: "Select a directory"
        },
        tr: {
            title: "Video İndirici",
            videoQuality: "Video Kalitesi",
            outputPath: "İndirilecek klasör",
            languageSettings: "Dil Ayarları",
            addVideo: "Video Ekle",
            downloadAll: "Hepsini İndir",
            save: "Kaydet",
            pickDirectory: "İndirilecek klasörü seçin",
            urlPlaceholder: "Video veya playlist URL'sini girin",
            outputPathPlaceholder: "İndirilecek klasör adresini girin",
            download: "İndir",
            alertEnterValidUrl: "Lütfen geçerli bir URL girin",
            alertErrorDownloading: "Aşağıdaki video indirilirken bir hata oluştu:",
            alertFailedFetchThumbnail: "Video kapak resmi alınamadı",
            alertDownloadingVideos: "Videolar indiriliyor...",
            alertClipboardModeActivated: "Panoya kopyalama modu etkinleştirildi",
            alertClipboardModeDeactivated: "Panoya kopyalama modu devre dışı bırakıldı",
            alertSelectedVideoQuality: "Seçilen Video Kalitesi:",
            alertOutputPath: "Çıkış Yolu:",
            alertOpeningFileExplorer: "Çıkış yolunu seçmek için dosya gezgini açılıyor...",
            alertConfirmDelete: "Bu videoyu silmek istediğinize emin misiniz?",
            tooltipSettings: "Ayarları Aç",
            tooltipVideoQuality: "Video kalitesini seçin",
            tooltipOutputPath: "Dosyaların bilgisyarınızdaki hangi klasöre indirileceğini ayarlayın",
            tooltipLanguage: "Dili değiştir",
            tooltipClipboardMode: "Kopyaladığınızda otomatik olarak panodan yapıştırın",
            tooltipFileFormat: "MP4 ve MP3 formatları arasında geçiş yapın",
            tooltipPickDirectory: "Bir klasör seçmek için dosya gezginini aç"
        }
    };

    function translatePage(language) {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = translations[language][key];
        });
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            element.placeholder = translations[language][key];
        });
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.getAttribute('data-translate-title');
            element.title = translations[language][key];
        });

        languageSelect.value = language;
        settingsDict["default_language"] = language;
    }

    addVideoBtn.addEventListener('click', inputVideoOrPlaylist);
    videoUrlInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            inputVideoOrPlaylist();
        }
    });

    downloadAllBtn.addEventListener('click', downloadAllVideos);
    clipboardModeBtn.addEventListener('click', toggleClipboardMode);
    fileFormatBtn.addEventListener('click', toggleFileFormat);
    settingsBtn.addEventListener('click', toggleSettingsMenu);
    videoQualityOption.addEventListener('click', () => toggleOptions(videoQualityOptions));
    saveVideoQualityBtn.addEventListener('click', saveVideoQuality);
    outputPathOption.addEventListener('click', () => toggleOptions(outputPathInputContainer));
    pickDirectoryBtn.addEventListener('click', pickOutputPathFileExplorer);
    saveOutputPathBtn.addEventListener('click', () => saveOutputPath("None"));
    languageOption.addEventListener('click', () => toggleOptions(languageOptions));
    languageSelect.addEventListener('change', () => translatePage(languageSelect.value));


    async function inputVideoOrPlaylist() {
        const url = videoUrlInput.value.trim();
        if (!url) {
            alert(translations[languageSelect.value].alertEnterValidUrl);
            return;
        }
        videoUrlInput.value = '';
        eel.getVideoOrPlaylist(url);
    }

    eel.expose(addVideo,"addVideo");
    async function addVideo(videoName, thumbnail_url) {

        fetchThumbnail(thumbnail_url).then(thumbnailUrl => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');

            const thumbnail = document.createElement('img');
            thumbnail.src = thumbnailUrl;

            const videoInfo = document.createElement('div');
            videoInfo.classList.add('video-info');

            const urlText = document.createElement('span');
            urlText.textContent = videoName;
            urlText.classList.add('video-url');

            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('video-actions');

            const downloadStatus = document.createElement('span');
            downloadStatus.classList.add('download-status');
            downloadStatus.style.display = 'none';
            actionsContainer.appendChild(downloadStatus);

            const renameBtn = document.createElement('button');
            renameBtn.innerHTML = '✏️';
            renameBtn.addEventListener('click', () => renameVideo(urlText));

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.addEventListener('click', () => deleteVideo(videoItem));


            actionsContainer.appendChild(renameBtn);
            actionsContainer.appendChild(deleteBtn);

            videoInfo.appendChild(urlText);
            videoInfo.appendChild(actionsContainer);
            videoItem.appendChild(thumbnail);
            videoItem.appendChild(videoInfo);
            videoList.appendChild(videoItem);

            
        }).catch(error => {
            console.error(error);
            alert(translations[languageSelect.value].alertFailedFetchThumbnail);
        });
    }

    async function fetchThumbnail(thumbnailUrl) {
        return Promise.resolve(thumbnailUrl);
    }

    function renameVideo(urlText) {
        if (!urlText) {
            alert(translations[languageSelect.value].alertEnterValidUrl);
            return;
        }
        const originalText = urlText.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.classList.add('rename-input');

        input.addEventListener('blur', () => {
            urlText.textContent = input.value;
            eel.renameVideo(originalText, input.value);
            urlText.style.display = 'inline';
            input.remove();
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                input.blur();
            }
            if (event.key === 'Escape') {
                urlText.textContent = originalText;
                urlText.style.display = 'inline';
                input.remove();
            }
        });

        urlText.style.display = 'none';
        urlText.parentNode.insertBefore(input, urlText.nextSibling);
        input.focus();
        input.select();
    }

    function deleteVideo(videoItem) {
        const confirmation = confirm(translations[languageSelect.value].alertConfirmDelete);
        if (confirmation) {
            eel.deleteVideo(videoItem.querySelector('.video-url').textContent);
            videoItem.remove();
        }
    }

    function downloadAllVideos() {
        alert(translations[languageSelect.value].alertDownloadingVideos);
        const videos = videoList.querySelectorAll('.video-item');
        videos.forEach(video => {
            video.classList.add('hide-actions');
        });
        eel.downloadAllVideos(fileFormat,videoQuality);
    }

    function toggleClipboardMode() {
        clipboardModeActivated = !clipboardModeActivated;
        if (clipboardModeActivated){
            clipboardModeBtn.classList.add('active');
        }
        else {
            clipboardModeBtn.classList.remove('active');
        }
        const message = clipboardModeActivated ?
            translations[languageSelect.value].alertClipboardModeActivated :
            translations[languageSelect.value].alertClipboardModeDeactivated;
        alert(message);
    }

    function toggleFileFormat() {
        fileFormat = fileFormat === 'mp4' ? 'mp3' : 'mp4';
        fileFormatBtn.textContent = fileFormat.toUpperCase();
        if (fileFormat === 'mp3') {
            fileFormatBtn.classList.add('mp3'); // Apply MP3 style
        } 
        else {
            fileFormatBtn.classList.remove('mp3'); // Remove MP3 style
        }
    }

    function toggleSettingsMenu() {
        settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
    }

    function toggleOptions(optionContainer) {
        if (currentOpenOptions && currentOpenOptions !== optionContainer) {
            currentOpenOptions.style.display = 'none';
        }
        optionContainer.style.display = optionContainer.style.display === 'none' ? 'block' : 'none';
        currentOpenOptions = optionContainer;
    }

    function saveVideoQuality() {
        const selectedQuality = document.querySelector('input[name="videoQuality"]:checked');
        if (selectedQuality) {
            videoQuality=selectedQuality;
        }
    }

    async function pickOutputPathFileExplorer() {
        let path = await eel.getOutputPath()();
        saveOutputPath(path);
    }

    function saveOutputPath(path = '') {
        if (path!="None") {
            document.getElementById('outputPathInput').value=path;
            settingsDict["output_path"] = path;
            eel.saveSettings(settingsDict);
        }
        else{
            const outputPath = document.getElementById('outputPathInput').value;
            settingsDict["output_path"] = outputPath;
            eel.saveSettings(settingsDict);
        }
        
    }

    eel.expose(videoStartedDownloading, "videoStartedDownloading");
    function videoStartedDownloading(url) {
        console.log("start",url)
        const videoItem = Array.from(videoList.children).find(item => item.querySelector('.video-url').textContent === url);
        if (videoItem) {
            const downloadStatus = videoItem.querySelector('.download-status');
            downloadStatus.style.display = 'inline';
            downloadStatus.innerHTML = '🔵';
        }
    }
    
    eel.expose(videoFinishedDownloading, "videoFinishedDownloading");
    function videoFinishedDownloading(url) {
        console.log("finish",url)
        const videoItem = Array.from(videoList.children).find(item => item.querySelector('.video-url').textContent === url);
        if (videoItem) {
            const downloadStatus = videoItem.querySelector('.download-status');
            downloadStatus.style.display = 'inline';
            downloadStatus.innerHTML = '🟢';
        }
    }

    eel.expose(videoFailedDownloading, "videoFailedDownloading");
    function videoFailedDownloading(url) {
        console.log("failed",url)
        alert(translations[languageSelect.value].alertErrorDownloading +"\n"+url);
        const videoItem = Array.from(videoList.children).find(item => item.querySelector('.video-url').textContent === url);
        if (videoItem) {
            const downloadStatus = videoItem.querySelector('.download-status');
            downloadStatus.style.display = 'inline';
            downloadStatus.innerHTML = '🔴';
        }
    }

    if (settingsDict["default_language"] === 'tr') {
        languageSelect.value = 'tr';
    } else {
        languageSelect.value = 'en';
    }
    translatePage(languageSelect.value);
});
