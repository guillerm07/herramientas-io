// js/generador-letra-dni.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const dniInput = document.getElementById('dniNumber');
    const calculateButton = document.getElementById('calculateButton');
    const copyButton = document.getElementById('copyButton');
    const resultSection = document.querySelector('.result-section');
    const displayNumber = document.getElementById('displayNumber');
    const displayLetter = document.getElementById('displayLetter');

    // Letras válidas para DNI
    const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

    // Función para calcular la letra del DNI
    function calculateDNILetter(number) {
        const position = number % 23;
        return DNI_LETTERS.charAt(position);
    }

    // Función para validar el número de DNI
    function isValidDNINumber(number) {
        return /^[0-9]{1,8}$/.test(number);
    }

    // Función para formatear el número de DNI
    function formatDNINumber(number) {
        return number.padStart(8, '0');
    }

    // Función para mostrar el resultado
    function showResult(number, letter) {
        displayNumber.textContent = formatDNINumber(number);
        displayLetter.textContent = letter;
        resultSection.style.display = 'block';
    }

    // Función para copiar al portapapeles
    function copyToClipboard() {
        const dniComplete = `${displayNumber.textContent}${displayLetter.textContent}`;
        
        navigator.clipboard.writeText(dniComplete)
            .then(() => {
                showNotification('¡DNI copiado al portapapeles!');
            })
            .catch(() => {
                showNotification('Error al copiar el DNI', 'error');
            });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        // Eliminar notificación existente si la hay
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event Listener para el input (permitir solo números)
    dniInput.addEventListener('input', function(e) {
        // Eliminar cualquier carácter que no sea número
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Limitar a 8 dígitos
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
    });

    // Event Listener para el botón de calcular
    calculateButton.addEventListener('click', function() {
        const number = dniInput.value;

        if (!number) {
            showNotification('Por favor, introduce un número de DNI', 'error');
            return;
        }

        if (!isValidDNINumber(number)) {
            showNotification('El número de DNI no es válido', 'error');
            return;
        }

        const letter = calculateDNILetter(parseInt(number));
        showResult(number, letter);
    });

    // Event Listener para el botón de copiar
    copyButton.addEventListener('click', copyToClipboard);

    // Event Listener para calcular al presionar Enter
    dniInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateButton.click();
        }
    });

    // Event Listeners para atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para calcular
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            calculateButton.click();
        }
        
        // Ctrl/Cmd + C para copiar (si hay resultado)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && resultSection.style.display !== 'none') {
            e.preventDefault();
            copyButton.click();
        }
    });

    // Enfocar el input al cargar la página
    dniInput.focus();
});