document.getElementById('loadPdf').addEventListener('click', () => {
    const pdfFileInput = document.getElementById('pdfFile');
    const file = pdfFileInput.files[0];
    if (file) {
        const fileUrl = URL.createObjectURL(file);
        document.getElementById('pdf-viewer').innerHTML = `
            <iframe src="${fileUrl}" width="100%" height="500px" type="application/pdf"></iframe>
        `;
    }
});

document.getElementById('signPdf').addEventListener('click', async () => {
    const pdfFileInput = document.getElementById('pdfFile');
    const signatureImageInput = document.getElementById('signatureImage');
    const pdfFile = pdfFileInput.files[0];
    const signatureImageFile = signatureImageInput.files[0];
    const xPosition = document.getElementById('xPosition').value;
    const yPosition = document.getElementById('yPosition').value;
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;

    if (pdfFile && signatureImageFile) {
        const formData = new FormData();
        formData.append('pdfFile', pdfFile);
        formData.append('signatureImage', signatureImageFile);
        formData.append('xPosition', xPosition);
        formData.append('yPosition', yPosition);
        formData.append('width', width);
        formData.append('height', height);

        const response = await fetch('/sign-pdf', {
            method: 'POST',
            body: formData
        });

        const result = await response.text();
        document.getElementById('downloadLink').innerHTML = result;
    } else {
        alert('Vui lòng chọn cả PDF và hình ảnh chữ ký!');
    }
});
