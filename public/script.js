
const API_BASE = window.location.origin;

const elements = {
    urlInput: document.getElementById('urlInput'),
    getInfoBtn: document.getElementById('getInfoBtn'),
    videoInfo: document.getElementById('videoInfo'),
    thumbnail: document.getElementById('thumbnail'),
    videoTitle: document.getElementById('videoTitle'),
    downloadMp3: document.getElementById('downloadMp3'),
    downloadMp4: document.getElementById('downloadMp4'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('errorMessage')
};

let currentVideoUrl = '';

// Event listeners
elements.getInfoBtn.addEventListener('click', getVideoInfo);
elements.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getVideoInfo();
    }
});
elements.downloadMp3.addEventListener('click', () => downloadVideo('mp3'));
elements.downloadMp4.addEventListener('click', () => downloadVideo('mp4'));

async function getVideoInfo() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }

    showLoading();
    hideError();
    hideVideoInfo();

    try {
        const response = await fetch(`${API_BASE}/info?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        currentVideoUrl = url;
        displayVideoInfo(data);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(`Error: ${error.message}`);
    }
}

function displayVideoInfo(data) {
    elements.thumbnail.src = data.thumbnail;
    elements.videoTitle.textContent = data.title;
    elements.videoInfo.classList.remove('hidden');
}

async function downloadVideo(format) {
    if (!currentVideoUrl) {
        showError('Please get video info first');
        return;
    }

    showLoading();
    hideError();

    try {
        const response = await fetch(`${API_BASE}/${format}?url=${encodeURIComponent(currentVideoUrl)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Create download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `video.${format}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(`Download failed: ${error.message}`);
    }
}

function showLoading() {
    elements.loading.classList.remove('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.error.classList.remove('hidden');
}

function hideError() {
    elements.error.classList.add('hidden');
}

function hideVideoInfo() {
    elements.videoInfo.classList.add('hidden');
}
