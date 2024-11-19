// js/prefijo-sufijo.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const prefixText = document.getElementById('prefixText');
    const suffixText = document.getElementById('suffixText');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Checkboxes de opciones
    const trimSpacesCheckbox = document.getElementById('trimSpaces');
    const skipEmptyCheckbox = document.getElementById('skipEmpty');
    const addNewLineCheckbox = document.getElementById('addNewLine');
    const numberLinesCheckbox = document.getElementById('numberLines');
    const preserveIndentCheckbox = document.getElementById('preserveIndent');
    
    // Contadores
    const lineCount = document.querySelector('.line-count');
    const processedCount = document.querySelector('.processed-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        // Obtener líneas del texto
        let lines = inputText.value.split('\n');
        const originalCount = lines.length;
        let processedLines = 0;

        // Procesar cada línea
        lines = lines.map((line, index) => {
            // Si está activado saltar líneas vacías y la línea está vacía
            if (skipEmptyCheckbox.checked && (!line.trim() || line.length === 0)) {
                return line;
            }

            let processedLine = line;
            let indent = '';

            // Preservar indentación si está activado
            if (preserveIndentCheckbox.checked) {
                indent = processedLine.match(/^[\s\t]*/)[0];
                processedLine = processedLine.substring(indent.length);
            }

            // Eliminar espacios al inicio y final si está activado
            if (trimSpacesCheckbox.checked) {
                processedLine = processedLine.trim();
            }

            // Añadir numeración si está activado
            let lineNumber = '';
            if (numberLinesCheckbox.checked && (processedLine.length > 0 || !skipEmptyCheckbox.checked)) {
                lineNumber = `${(index + 1).toString().padStart(3, '0')}. `;
            }

            // Añadir prefijo y sufijo
            if (processedLine.length > 0 || !skipEmptyCheckbox.checked) {
                processedLine = indent + lineNumber + prefixText.value + processedLine + suffixText.value;
                processedLines++;
            }

            return processedLine;
        });

        // Añadir línea nueva al final si está activado
        if (addNewLineCheckbox.checked && lines[lines.length - 1] !== '') {
            lines.push('');
        }

        // Actualizar texto de salida
        outputText.value = lines.join('\n');

        // Actualizar contadores
        updateCounters(originalCount, processedLines);

        showNotification('¡Texto procesado con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(total, processed) {
        lineCount.textContent = `${total} líneas`;
        processedCount.textContent = `${processed} procesadas`;
        remainingCount.textContent = `${total} líneas`;
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        prefixText.value = '';
        suffixText.value = '';
        updateCounters(0, 0);
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

    // Actualizar contador de líneas al escribir
    inputText.addEventListener('input', function() {
        const lines = this.value.split('\n');
        lineCount.textContent = `${lines.length} líneas`;
    });

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

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