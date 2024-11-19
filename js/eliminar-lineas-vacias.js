// js/eliminar-lineas-vacias.js
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
    const emptyLinesCheckbox = document.getElementById('emptyLines');
    const whiteSpaceLinesCheckbox = document.getElementById('whiteSpaceLines');
    
    // Contadores
    const lineCount = document.querySelector('.line-count');
    const removedCount = document.querySelector('.removed-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        // Obtener opciones seleccionadas
        const options = {
            trimSpaces: trimSpacesCheckbox.checked,
            multipleSpaces: multipleSpacesCheckbox.checked,
            emptyLines: emptyLinesCheckbox.checked,
            whiteSpaceLines: whiteSpaceLinesCheckbox.checked
        };

        // Dividir el texto en líneas
        let lines = inputText.value.split('\n');
        const originalCount = lines.length;

        // Procesar cada línea según las opciones seleccionadas
        lines = lines.filter((line, index) => {
            // Eliminar espacios al inicio y final si está activado
            if (options.trimSpaces) {
                line = line.trim();
            }

            // Reducir espacios múltiples si está activado
            if (options.multipleSpaces) {
                line = line.replace(/\s+/g, ' ');
            }

            // Actualizar la línea en el array
            lines[index] = line;

            // Determinar si la línea debe mantenerse
            if (options.whiteSpaceLines) {
                // Eliminar líneas que solo contienen espacios
                return line.length > 0;
            } else if (options.emptyLines) {
                // Eliminar solo líneas completamente vacías
                return line.trim().length > 0;
            }
            
            return true;
        });

        // Actualizar texto de salida
        outputText.value = lines.join('\n');

        // Actualizar contadores
        const remainingLines = lines.length;
        const removedLines = originalCount - remainingLines;
        updateCounters(originalCount, removedLines, remainingLines);

        showNotification('¡Texto procesado con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(original, removed, remaining) {
        lineCount.textContent = `${original} líneas`;
        removedCount.textContent = `${removed} eliminadas`;
        remainingCount.textContent = `${remaining} líneas`;
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

    // Actualizar contador de líneas al escribir
    inputText.addEventListener('input', function() {
        const lines = this.value.split('\n');
        lineCount.textContent = `${lines.length} líneas`;
    });

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Procesar automáticamente cuando cambian las opciones
    [trimSpacesCheckbox, multipleSpacesCheckbox, emptyLinesCheckbox, whiteSpaceLinesCheckbox].forEach(checkbox => {
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