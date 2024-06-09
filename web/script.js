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
            alertFailedFetchThumbnail: "Video kapak resmi alınamadı",
            alertDownloadingVideo: "Video indiriliyor:",
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

            const videoInfo = document.createElement('div');
            videoInfo.classList.add('video-info');

            const urlText = document.createElement('span');
            urlText.textContent = url;
            urlText.classList.add('video-url');

            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('video-actions');

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

            videoUrlInput.value = '';
        }).catch(error => {
            console.error(error);
            alert(translations[languageSelect.value].alertFailedFetchThumbnail);
        });
    }

    function fetchThumbnail(url) {
        // This function should return a promise that resolves with the thumbnail URL
        // For demonstration purposes, we'll use a placeholder image
        return Promise.resolve('https://via.placeholder.com/120x90');
    }

    function renameVideo(urlText) {
        const originalText = urlText.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.classList.add('rename-input');

        input.addEventListener('blur', () => {
            urlText.textContent = input.value;
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
            videoItem.remove();
        }
    }

    function downloadAllVideos() {
        const videos = videoList.querySelectorAll('.video-item');
        videos.forEach(video => {
            const url = video.querySelector('.video-url').textContent;
            console.log(translations[languageSelect.value].alertDownloadingVideo, url);
            // Add your download logic here
        });
    }

    function toggleClipboardMode() {
        clipboardModeActivated = !clipboardModeActivated;
        const message = clipboardModeActivated ?
            translations[languageSelect.value].alertClipboardModeActivated :
            translations[languageSelect.value].alertClipboardModeDeactivated;
        alert(message);
    }

    function toggleFileFormat() {
        fileFormat = fileFormat === 'mp4' ? 'mp3' : 'mp4';
        fileFormatBtn.textContent = fileFormat.toUpperCase();
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
            alert(translations[languageSelect.value].alertSelectedVideoQuality + ' ' + selectedQuality.value);
        }
    }

    function pickOutputPathFileExplorer() {
        alert(translations[languageSelect.value].alertOpeningFileExplorer);
        // Add logic to open file explorer and pick a directory
    }

    function saveOutputPath() {
        const outputPath = document.getElementById('outputPathInput').value;
        alert(translations[languageSelect.value].alertOutputPath + ' ' + outputPath);
    }
    

    if (navigator.language.startsWith('tr')) {
        languageSelect.value = 'tr';
    } else {
        languageSelect.value = 'en';
    }
    translatePage(languageSelect.value);
});
