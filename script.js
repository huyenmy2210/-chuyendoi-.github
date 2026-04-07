const elements = {
    uploadInput: document.getElementById('uploadInput'),
    originalPreview: document.getElementById('originalPreview'),
    convertedPreview: document.getElementById('convertedPreview'),
    convertBtn: document.getElementById('convertBtn'),
    formatSelect: document.getElementById('formatSelect'),
    qualityRange: document.getElementById('qualityRange'),
    qualityValue: document.getElementById('qualityValue'),
    downloadLink: document.getElementById('downloadLink'),
    controls: document.getElementById('controls'),
    comparisonArea: document.getElementById('comparisonArea'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    info: {
        origFormat: document.getElementById('orig-format'),
        origSize: document.getElementById('orig-size'),
        origRes: document.getElementById('orig-res'),
        origTrans: document.getElementById('orig-trans'),
        convFormat: document.getElementById('conv-format'),
        convSize: document.getElementById('conv-size'),
        convRes: document.getElementById('conv-res'),
        convQuality: document.getElementById('conv-quality'),
        convTrans: document.getElementById('conv-trans'), 
        convSaving: document.getElementById('conv-saving'),
        convTime: document.getElementById('conv-time')    
    }
};

let originalFile = null;
let currentBlobUrl = null;
let originalImageData = null;

// Debounce cho quality range
let debounceTimer;
elements.qualityRange.addEventListener('input', (e) => {
    elements.qualityValue.textContent = e.target.value;
});


const imageLoader = {
    load(src, callback) {
        const img = new Image();
        img.onload = () => callback(img);
        img.src = src;
    }
};


elements.uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    originalFile = file;
    const src = URL.createObjectURL(file);
    
    imageLoader.load(src, (img) => {
        elements.originalPreview.src = src;
        elements.controls.style.display = 'flex';
        elements.comparisonArea.style.display = 'grid';
        
        elements.info.origFormat.textContent = file.type.split('/')[1].toUpperCase();
        elements.info.origSize.textContent = (file.size / 1024).toFixed(2) + " KB";
        elements.info.origRes.textContent = `${img.width} x ${img.height} px`;
        elements.info.origTrans.textContent = file.type === 'image/png' ? "Có" : "Không";
        
        elements.downloadLink.style.display = 'none';
        elements.convertedPreview.src = '';
        originalImageData = img;
    });
});


elements.convertBtn.addEventListener('click', () => {
    if (!originalImageData) return alert("Vui lòng chọn ảnh!");

    elements.loadingOverlay.style.display = 'flex';
    const startTime = performance.now();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = originalImageData.width;
    canvas.height = originalImageData.height;
    ctx.drawImage(originalImageData, 0, 0);
    
    const format = elements.formatSelect.value;
    const quality = parseInt(elements.qualityRange.value) / 100;
    
    canvas.toBlob((blob) => {
        const endTime = performance.now();
        const processTime = ((endTime - startTime) / 1000).toFixed(3) + "s";
        
        if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = URL.createObjectURL(blob);
        elements.convertedPreview.src = currentBlobUrl;
        
        
        elements.info.convFormat.textContent = format.split('/')[1].toUpperCase();
        elements.info.convSize.textContent = (blob.size / 1024).toFixed(2) + " KB";
        elements.info.convRes.textContent = `${originalImageData.width} x ${originalImageData.height} px`;
        elements.info.convQuality.textContent = format === 'image/png' ? "N/A" : elements.qualityRange.value + "%";
        elements.info.convTrans.textContent = format === 'image/png' ? "Có" : "Không";
        elements.info.convTime.textContent = processTime;
        
        const saving = (1 - blob.size / originalFile.size) * 100;
        elements.info.convSaving.textContent = saving > 0 ? `Tiết kiệm ${saving.toFixed(1)}%` : `Tăng ${Math.abs(saving).toFixed(1)}%`;
        
        elements.downloadLink.href = currentBlobUrl;
        elements.downloadLink.download = `optimized_${Date.now()}.${format.split('/')[1]}`;
        elements.downloadLink.style.display = 'block';
        
        elements.loadingOverlay.style.display = 'none';
    }, format, quality);
});