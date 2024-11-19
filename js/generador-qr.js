// js/generador-qr.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const qrType = document.getElementById('qrType');
    const dynamicFields = document.getElementById('dynamicFields');
    const generateButton = document.getElementById('generateButton');
    const resultSection = document.querySelector('.result-section');
    const qrContainer = document.getElementById('qrCode');
    const downloadPNG = document.getElementById('downloadPNG');
    const downloadSVG = document.getElementById('downloadSVG');

    // Opciones de personalización
    const qrSize = document.getElementById('qrSize');
    const errorCorrection = document.getElementById('errorCorrection');
    const foregroundColor = document.getElementById('foregroundColor');
    const backgroundColor = document.getElementById('backgroundColor');

    // Definición de campos para cada tipo de QR
    const typeFields = {
        text: [
            { type: 'textarea', id: 'content', label: 'Texto o URL', placeholder: 'Introduce el texto o URL' }
        ],
        email: [
            { type: 'email', id: 'email', label: 'Dirección de email', placeholder: 'ejemplo@dominio.com' },
            { type: 'text', id: 'subject', label: 'Asunto (opcional)', placeholder: 'Asunto del email' },
            { type: 'textarea', id: 'body', label: 'Mensaje (opcional)', placeholder: 'Contenido del email' }
        ],
        tel: [
            { type: 'tel', id: 'phone', label: 'Número de teléfono', placeholder: '+34600000000' }
        ],
        sms: [
            { type: 'tel', id: 'phone', label: 'Número de teléfono', placeholder: '+34600000000' },
            { type: 'textarea', id: 'message', label: 'Mensaje (opcional)', placeholder: 'Mensaje del SMS' }
        ],
        wifi: [
            { type: 'text', id: 'ssid', label: 'Nombre de red (SSID)', placeholder: 'Nombre de la red WiFi' },
            { type: 'password', id: 'password', label: 'Contraseña', placeholder: 'Contraseña de la red' },
            { type: 'select', id: 'encryption', label: 'Tipo de seguridad', 
              options: [
                  { value: 'WPA', label: 'WPA/WPA2' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'Sin contraseña' }
              ]
            }
        ],
        vcard: [
            { type: 'text', id: 'name', label: 'Nombre completo', placeholder: 'Nombre y apellidos' },
            { type: 'text', id: 'org', label: 'Empresa (opcional)', placeholder: 'Nombre de la empresa' },
            { type: 'tel', id: 'phone', label: 'Teléfono', placeholder: '+34600000000' },
            { type: 'email', id: 'email', label: 'Email', placeholder: 'ejemplo@dominio.com' },
            { type: 'text', id: 'url', label: 'Sitio web (opcional)', placeholder: 'https://ejemplo.com' },
            { type: 'textarea', id: 'address', label: 'Dirección (opcional)', placeholder: 'Dirección completa' }
        ]
    };

    // Generar campos dinámicos según el tipo
    function generateFields(type) {
        dynamicFields.innerHTML = '';
        typeFields[type].forEach(field => {
            const div = document.createElement('div');
            div.className = 'input-group';

            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.textContent = field.label;
            div.appendChild(label);

            let input;
            if (field.type === 'select') {
                input = document.createElement('select');
                field.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    input.appendChild(opt);
                });
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }

            input.id = field.id;
            input.placeholder = field.placeholder || '';
            div.appendChild(input);
            dynamicFields.appendChild(div);
        });
    }

    // Generar contenido según el tipo
    function generateContent() {
        const type = qrType.value;
        const fields = {};
        typeFields[type].forEach(field => {
            fields[field.id] = document.getElementById(field.id).value;
        });

        switch(type) {
            case 'text':
                return fields.content;
            case 'email':
                let email = `mailto:${fields.email}`;
                if (fields.subject || fields.body) {
                    email += '?';
                    if (fields.subject) email += `subject=${encodeURIComponent(fields.subject)}`;
                    if (fields.body) email += `${fields.subject ? '&' : ''}body=${encodeURIComponent(fields.body)}`;
                }
                return email;
            case 'tel':
                return `tel:${fields.phone}`;
            case 'sms':
                return `sms:${fields.phone}${fields.message ? `?body=${encodeURIComponent(fields.message)}` : ''}`;
            case 'wifi':
                return `WIFI:T:${fields.encryption};S:${fields.ssid};P:${fields.password};;`;
            case 'vcard':
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${fields.name}\n${fields.org ? `ORG:${fields.org}\n` : ''}TEL:${fields.phone}\nEMAIL:${fields.email}\n${fields.url ? `URL:${fields.url}\n` : ''}${fields.address ? `ADR:;;${fields.address}\n` : ''}END:VCARD`;
        }
    }

    // Generar código QR
    function generateQR() {
        try {
            const content = generateContent();
            console.log('Contenido a generar:', content); // Debug

            if (!content) {
                showNotification('Por favor, completa los campos requeridos', 'error');
                return;
            }

            // Limpiar contenedor anterior
            qrContainer.innerHTML = '';

            // Crear nuevo código QR
            const qr = new QRCode(qrContainer, {
                text: content,
                width: parseInt(qrSize.value),
                height: parseInt(qrSize.value),
                colorDark: foregroundColor.value,
                colorLight: backgroundColor.value,
                correctLevel: QRCode.CorrectLevel[errorCorrection.value]
            });

            resultSection.style.display = 'block';
            console.log('QR generado correctamente'); // Debug
        } catch (error) {
            console.error('Error al generar QR:', error);
            showNotification('Error al generar el código QR', 'error');
        }
    }

    // Descargar como PNG
    function downloadQRAsPNG() {
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) {
            showNotification('No hay código QR para descargar', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = canvas.toDataURL();
        link.click();
        showNotification('Código QR descargado como PNG');
    }

    // Descargar como SVG
    function downloadQRAsSVG() {
        const svg = qrContainer.querySelector('svg');
        if (!svg) {
            showNotification('No hay código QR para descargar', 'error');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const link = document.createElement('a');
        link.download = 'qr-code.svg';
        link.href = URL.createObjectURL(svgBlob);
        link.click();
        URL.revokeObjectURL(link.href);
        showNotification('Código QR descargado como SVG');
    }

    // Mostrar notificaciones
    function showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Event Listeners
    qrType.addEventListener('change', () => {
        generateFields(qrType.value);
        resultSection.style.display = 'none';
    });

    generateButton.addEventListener('click', generateQR);
    downloadPNG.addEventListener('click', downloadQRAsPNG);
    downloadSVG.addEventListener('click', downloadQRAsSVG);

    // Inicializar campos
    generateFields(qrType.value);
});