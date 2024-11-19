// js/eliminar-duplicados.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    const caseSensitiveCheckbox = document.getElementById('caseSensitive');
    const trimSpacesCheckbox = document.getElementById('trimSpaces');
    const sortAlphabeticallyCheckbox = document.getElementById('sortAlphabetically');
    
    // Contadores
    const itemCount = document.querySelector('.item-count');
    const removedCount = document.querySelector('.removed-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value.trim()) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        // Obtener opciones seleccionadas
        const caseSensitive = caseSensitiveCheckbox.checked;
        const trimSpaces = trimSpacesCheckbox.checked;
        const sortAlphabetically = sortAlphabeticallyCheckbox.checked;

        // Dividir el texto en líneas
        let lines = inputText.value.split('\n');
        const originalCount = lines.length;

        // Procesar cada línea según las opciones
        if (trimSpaces) {
            lines = lines.map(line => line.trim());
        }

        // Eliminar líneas vacías
        lines = lines.filter(line => line.length > 0);

        // Crear conjunto para eliminar duplicados
        let uniqueLines;
        if (caseSensitive) {
            uniqueLines = [...new Set(lines)];
        } else {
            // Usar un Map para mantener la capitalización original de la primera ocurrencia
            const caseMap = new Map();
            lines.forEach(line => {
                const lowerLine = line.toLowerCase();
                if (!caseMap.has(lowerLine)) {
                    caseMap.set(lowerLine, line);
                }
            });
            uniqueLines = Array.from(caseMap.values());
        }

        // Ordenar si es necesario
        if (sortAlphabetically) {
            uniqueLines.sort((a, b) => {
                if (!caseSensitive) {
                    a = a.toLowerCase();
                    b = b.toLowerCase();
                }
                return a.localeCompare(b, 'es');
            });
        }

        // Actualizar texto de salida
        outputText.value = uniqueLines.join('\n');

        // Actualizar contadores
        const removedItems = originalCount - uniqueLines.length;
        updateCounters(originalCount, removedItems, uniqueLines.length);

        showNotification('¡Texto procesado con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(original, removed, remaining) {
        itemCount.textContent = `${original} elementos`;
        removedCount.textContent = `${removed} eliminados`;
        remainingCount.textContent = `${remaining} únicos`;
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

    // Actualizar contador de elementos al escribir
    inputText.addEventListener('input', function() {
        const lines = this.value.split('\n').filter(line => line.trim().length > 0);
        itemCount.textContent = `${lines.length} elementos`;
    });

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Procesar automáticamente cuando cambian las opciones
    [caseSensitiveCheckbox, trimSpacesCheckbox, sortAlphabeticallyCheckbox].forEach(checkbox => {
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