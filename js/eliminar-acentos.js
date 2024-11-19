// js/eliminar-acentos.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Checkboxes de opciones
    const removeAccentsCheckbox = document.getElementById('removeAccents');
    const removeDieresisCheckbox = document.getElementById('removeDieresis');
    const removeSpecialNCheckbox = document.getElementById('removeSpecialN');
    const removeOtherDiacriticsCheckbox = document.getElementById('removeOtherDiacritics');
    const preserveCaseCheckbox = document.getElementById('preserveCase');
    
    // Contadores
    const charCount = document.querySelector('.char-count');
    const convertedCount = document.querySelector('.converted-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Mapas de caracteres para conversión
    const accentMap = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y',
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
        'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
        'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
        'Ý': 'Y', 'Ÿ': 'Y'
    };

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        const originalText = inputText.value;
        let processedText = originalText;
        let convertedChars = 0;

        // Función para contar caracteres convertidos
        function replaceAndCount(text, from, to) {
            const count = (text.match(new RegExp(from, 'g')) || []).length;
            convertedChars += count;
            return text.replace(new RegExp(from, 'g'), to);
        }

        // Eliminar acentos
        if (removeAccentsCheckbox.checked) {
            Object.entries(accentMap).forEach(([accented, normal]) => {
                processedText = replaceAndCount(processedText, accented, normal);
            });
        }

        // Eliminar ñ/Ñ
        if (removeSpecialNCheckbox.checked) {
            processedText = replaceAndCount(processedText, 'ñ', 'n');
            processedText = replaceAndCount(processedText, 'Ñ', 'N');
        }

        // Eliminar otros diacríticos si está activado
        if (removeOtherDiacriticsCheckbox.checked) {
            processedText = processedText.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        }

        // Si no se preserva el caso, convertir todo a minúsculas
        if (!preserveCaseCheckbox.checked) {
            processedText = processedText.toLowerCase();
        }

        // Actualizar texto de salida
        outputText.value = processedText;

        // Actualizar contadores
        updateCounters(originalText.length, convertedChars, processedText.length);

        showNotification('¡Texto procesado con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(original, converted, remaining) {
        charCount.textContent = `${original} caracteres`;
        convertedCount.textContent = `${converted} convertidos`;
        remainingCount.textContent = `${remaining} caracteres`;
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        updateCounters(0, 0, 0);
        showNotification('Campos limpiados', 'success');
    }

    // Función para copiar al portapapeles
    function copyToClipboard() {
        if (!outputText.value) {
            showNotification('No hay texto para copiar', 'error');
            return;
        }

        navigator.clipboard.writeText(outputText.value)
            .then(() => {
                showNotification('¡Texto copiado al portapapeles!', 'success');
            })
            .catch(() => {
                showNotification('Error al copiar el texto', 'error');
            });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        // Eliminar notificación existente si la hay
        const existingNotification = document.querySelector('.copy-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `copy-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Actualizar contador de caracteres al escribir
    inputText.addEventListener('input', function() {
        charCount.textContent = `${this.value.length} caracteres`;
    });

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Procesar automáticamente cuando cambian las opciones
    [removeAccentsCheckbox, removeDieresisCheckbox, removeSpecialNCheckbox, 
     removeOtherDiacriticsCheckbox, preserveCaseCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (inputText.value.trim()) {
                processText();
            }
        });
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para procesar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processText();
        }
        
        // Ctrl/Cmd + Shift + C para copiar
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyToClipboard();
        }
    });

    // Ajustar altura del textarea de salida para que coincida con el de entrada
    function matchTextareaHeights() {
        outputText.style.height = `${inputText.offsetHeight}px`;
    }

    // Observer para cambios en la altura del textarea de entrada
    const resizeObserver = new ResizeObserver(matchTextareaHeights);
    resizeObserver.observe(inputText);
});