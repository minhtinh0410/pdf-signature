const express = require('express');
const { PDFDocument } = require('pdf-lib');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Cấu hình multer để xử lý tệp tải lên
const upload = multer({ dest: 'uploads/' });

// Đưa các tệp tĩnh vào thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route để ký số PDF
app.post('/sign-pdf', upload.fields([{ name: 'pdfFile' }, { name: 'signatureImage' }]), async (req, res) => {
    try {
        if (!req.files['pdfFile'] || !req.files['signatureImage']) {
            return res.status(400).send('Thiếu tệp PDF hoặc hình ảnh chữ ký');
        }

        const pdfPath = req.files['pdfFile'][0].path;
        const signatureImagePath = req.files['signatureImage'][0].path;
        const xPosition = parseFloat(req.body.xPosition) || 50;
        const yPosition = parseFloat(req.body.yPosition) || 50;
        const width = parseFloat(req.body.width) || 150;
        const height = parseFloat(req.body.height) || 100;

        // Đọc file PDF và hình ảnh chữ ký
        const pdfBytes = fs.readFileSync(pdfPath);
        const signatureImageBytes = fs.readFileSync(signatureImagePath);

        // Tạo PDFDocument từ bytes của PDF
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Thêm hình ảnh chữ ký vào PDF
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Đặt kích thước và vị trí cho hình ảnh chữ ký
        firstPage.drawImage(signatureImage, {
            x: xPosition,
            y: yPosition,
            width: width,
            height: height,
        });

        // Lưu PDF đã ký
        const signedPdfBytes = await pdfDoc.save();
        const signedPdfPath = path.join(__dirname, 'signed_output.pdf');
        fs.writeFileSync(signedPdfPath, signedPdfBytes);

        // Xóa tệp PDF và hình ảnh đã tải lên
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(signatureImagePath);

        // Gửi tệp PDF đã ký cho người dùng
        res.download(signedPdfPath, 'signed_output.pdf', (err) => {
            if (err) {
                console.error('Error sending the file:', err);
                res.status(500).send('Đã xảy ra lỗi khi gửi tệp PDF đã ký');
            }
            // Xóa tệp PDF đã ký sau khi gửi
            fs.unlinkSync(signedPdfPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi ký số PDF');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
