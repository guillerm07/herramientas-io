// js/eliminar-espacios.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Checkboxes de opciones
    const trimSpacesCheckbox = document.getElementById('trimSpaces');
    const multipleSpacesCheckbox = document.getElementById('multipleSpaces');
    const lineBreaksCheckbox = document.getElementById('lineBreaks');
    const tabsCheckbox = document.getElementById('tabs');
    const nonBreakingSpacesCheckbox = document.getElementById('nonBreakingSpaces');
    
    // Contadores
    const charCount = document.querySelector('.char-count');
    const removedCount = document.querySelector('.removed-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        const originalLength = inputText.value.length;
        let processedText = inputText.value;

        // Convertir espacios especiales si está activado
        if (nonBreakingSpacesCheckbox.checked) {
            processedText = processedText
                .replace(/\u00A0/g, ' ')  // Espacio no rompible
                .replace(/\u2007/g, ' ')  // Figure space
                .replace(/\u202F/g, ' ')  // Narrow no-break space
                .replace(/\u2060/g, '')   // Word joiner
                .replace(/\uFEFF/g, '');  // Zero width no-break space
        }

        // Eliminar tabulaciones si está activado
        if (tabsCheckbox.checked) {
            processedText = processedText.replace(/\t/g, ' ');
        }

        // Eliminar saltos de línea si está activado
        if (lineBreaksCheckbox.checked) {
            processedText = processedText.replace(/\r?\n|\r/g, ' ');
        }

        // Reducir espacios múltiples si está activado
        if (multipleSpacesCheckbox.checked) {
            processedText = processedText.replace(/\s+/g, ' ');
        }

        // Eliminar espacios al inicio y final si está activado
        if (trimSpacesCheckbox.checked) {
            processedText = processedText.trim();
        }

        // Actualizar texto de salida
        outputText.value = processedText;

        // Actualizar contadores
        const removedChars = originalLength - processedText.length;
        updateCounters(originalLength, removedChars, processedText.length);

        showNotification('¡Texto procesado con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(original, removed, remaining) {
        charCount.textContent = `${original} caracteres`;
        removedCount.textContent = `${removed} eliminados`;
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
    [trimSpacesCheckbox, multipleSpacesCheckbox, lineBreaksCheckbox, tabsCheckbox, nonBreakingSpacesCheckbox].forEach(checkbox => {
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