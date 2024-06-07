document.addEventListener('DOMContentLoaded', function() {
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

    let clipboardModeActivated = false;
    let fileFormat = "mp4";
    let currentOpenOptions = null;

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
            urlPlaceholder: "Enter video URL",
            outputPathPlaceholder: "Enter output path",
            download: "Download",
            alertEnterValidUrl: "Please enter a valid URL",
            alertFailedFetchThumbnail: "Failed to fetch video thumbnail",
            alertDownloadingVideo: "Downloading video from:",
            alertClipboardModeActivated: "Clipboard mode activated",
            alertClipboardModeDeactivated: "Clipboard mode deactivated",
            alertSelectedVideoQuality: "Selected Video Quality:",
            alertOutputPath: "Output Path:",
            alertOpeningFileExplorer: "Opening file explorer to pick output path...",
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
            outputPath: "Çıkış Yolu",
            languageSettings: "Dil Ayarları",
            addVideo: "Video Ekle",
            downloadAll: "Hepsini İndir",
            save: "Kaydet",
            pickDirectory: "Dizin Seç",
            urlPlaceholder: "Video URL'sini girin",
            outputPathPlaceholder: "Çıkış yolunu girin",
            download: "İndir",
            alertEnterValidUrl: "Lütfen geçerli bir URL girin",
            alertFailedFetchThumbnail: "Video küçük resmi alınamadı",
            alertDownloadingVideo: "Video indiriliyor:",
            alertClipboardModeActivated: "Panoya kopyalama modu etkinleştirildi",
            alertClipboardModeDeactivated: "Panoya kopyalama modu devre dışı bırakıldı",
            alertSelectedVideoQuality: "Seçilen Video Kalitesi:",
            alertOutputPath: "Çıkış Yolu:",
            alertOpeningFileExplorer: "Çıkış yolunu seçmek için dosya gezgini açılıyor...",
            tooltipSettings: "Ayarları Aç",
            tooltipVideoQuality: "Video kalitesini seçin",
            tooltipOutputPath: "Çıkış yolunu ayarlayın",
            tooltipLanguage: "Dili değiştir",
            tooltipClipboardMode: "Kopyaladığınızda otomatik olarak panodan yapıştırın",
            tooltipFileFormat: "MP4 ve MP3 formatları arasında geçiş yapın",
            tooltipPickDirectory: "Bir dizin seçin"
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
    }

    addVideoBtn.addEventListener('click', addVideo);
    videoUrlInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addVideo();
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
    saveOutputPathBtn.addEventListener('click', saveOutputPath);
    languageOption.addEventListener('click', () => toggleOptions(languageOptions));
    languageSelect.addEventListener('change', () => translatePage(languageSelect.value));

    function addVideo() {
        const url = videoUrlInput.value.trim();
        if (!url) {
            alert(translations[languageSelect.value].alertEnterValidUrl);
            return;
        }

        fetchThumbnail(url).then(thumbnailUrl => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');

            const thumbnail = document.createElement('img');
            thumbnail.src = thumbnailUrl;

            const urlText = document.createElement('span');
            urlText.textContent = url;
            urlText.classList.add('video-url');

            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = translations[languageSelect.value].download;
            downloadBtn.addEventListener('click', () => downloadVideo(url));

            videoItem.appendChild(thumbnail);
            videoItem.appendChild(urlText);
            videoItem.appendChild(downloadBtn);
            videoList.appendChild(videoItem);

            videoUrlInput.value = '';
        }).catch(error => {
            console.error(error);
            alert(translations[languageSelect.value].alertFailedFetchThumbnail);
        });
    }

    function fetchThumbnail(url) {
        // This function should return a promise that resolves with the thumbnail URL
        // For demonstration purposes, we will use a placeholder image
        return new Promise((resolve) => {
            const placeholderThumbnail = 'https://via.placeholder.com/120x90.png?text=Thumbnail';
            resolve(placeholderThumbnail);
        });
    }

    function downloadVideo(url) {
        alert(translations[languageSelect.value].alertDownloadingVideo + ' ' + url);
    }

    function downloadAllVideos() {
        const videos = document.querySelectorAll('.video-item');
        videos.forEach(videoItem => {
            const url = videoItem.querySelector('.video-url').textContent;
            downloadVideo(url);
        });
    }

    function toggleClipboardMode() {
        clipboardModeActivated = !clipboardModeActivated;
        clipboardModeBtn.classList.toggle('active', clipboardModeActivated);
        alert(clipboardModeActivated ? translations[languageSelect.value].alertClipboardModeActivated : translations[languageSelect.value].alertClipboardModeDeactivated);
    }

    function toggleFileFormat() {
        if (fileFormat === 'mp4') {
            fileFormat = 'mp3';
            fileFormatBtn.textContent = 'MP3';
            fileFormatBtn.classList.add('mp3');
        } else {
            fileFormat = 'mp4';
            fileFormatBtn.textContent = 'MP4';
            fileFormatBtn.classList.remove('mp3');
        }
    }

    function toggleSettingsMenu() {
        if (settingsMenu.style.display === 'block') {
            settingsMenu.style.display = 'none';
            if (currentOpenOptions) currentOpenOptions.style.display = 'none';
            currentOpenOptions = null;
        } else {
            settingsMenu.style.display = 'block';
        }
    }

    function toggleOptions(optionsElement) {
        if (currentOpenOptions && currentOpenOptions !== optionsElement) {
            currentOpenOptions.style.display = 'none';
        }
        optionsElement.style.display = (optionsElement.style.display === 'block') ? 'none' : 'block';
        currentOpenOptions = optionsElement.style.display === 'block' ? optionsElement : null;
    }

    function saveVideoQuality() {
        const selectedQuality = document.querySelector('input[name="videoQuality"]:checked').value;
        alert(translations[languageSelect.value].alertSelectedVideoQuality + ' ' + selectedQuality);
        videoQualityOptions.style.display = 'none';
        currentOpenOptions = null;
    }

    function saveOutputPath() {
        const outputPath = document.getElementById('outputPathInput').value;
        alert(translations[languageSelect.value].alertOutputPath + ' ' + outputPath);
        outputPathInputContainer.style.display = 'none';
        currentOpenOptions = null;
    }

    function pickOutputPathFileExplorer() {
        alert(translations[languageSelect.value].alertOpeningFileExplorer);
    }

    // Initialize with default language (English)
    translatePage('en');
});
