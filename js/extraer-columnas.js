// js/extraer-columnas.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const columnsInput = document.getElementById('columnsInput');
    const customDelimiter = document.getElementById('customDelimiter');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Radio buttons y checkboxes
    const delimiterRadios = document.getElementsByName('delimiter');
    const skipEmptyCheckbox = document.getElementById('skipEmpty');
    const trimSpacesCheckbox = document.getElementById('trimSpaces');
    const keepHeaderCheckbox = document.getElementById('keepHeader');
    const removeEmptyCheckbox = document.getElementById('removeEmpty');
    
    // Contadores
    const lineCount = document.querySelector('.line-count');
    const extractedCount = document.querySelector('.extracted-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Función para obtener el delimitador seleccionado
    function getSelectedDelimiter() {
        const selected = Array.from(delimiterRadios).find(radio => radio.checked);
        switch (selected.value) {
            case 'tab': return '\t';
            case 'comma': return ',';
            case 'semicolon': return ';';
            case 'space': return ' ';
            case 'custom': return customDelimiter.value || '\t';
            default: return '\t';
        }
    }

    // Función para parsear la entrada de columnas
    function parseColumnInput(input) {
        if (!input.trim()) return [];
        
        const columns = new Set();
        const parts = input.split(',').map(part => part.trim());
        
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(num => parseInt(num));
                if (isNaN(start) || isNaN(end)) continue;
                for (let i = start; i <= end; i++) {
                    columns.add(i - 1); // Convertir a base 0
                }
            } else {
                const num = parseInt(part);
                if (!isNaN(num)) {
                    columns.add(num - 1); // Convertir a base 0
                }
            }
        }
        
        return Array.from(columns).sort((a, b) => a - b);
    }

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        if (!columnsInput.value) {
            showNotification('Por favor, especifica las columnas a extraer', 'error');
            return;
        }

        const delimiter = getSelectedDelimiter();
        const columnIndexes = parseColumnInput(columnsInput.value);
        
        if (columnIndexes.length === 0) {
            showNotification('Por favor, especifica columnas válidas', 'error');
            return;
        }

        // Dividir el texto en líneas
        let lines = inputText.value.split('\n');
        const originalCount = lines.length;
        let processedLines = 0;
        let header = null;

        // Procesar la cabecera si está activada la opción
        if (keepHeaderCheckbox.checked && lines.length > 0) {
            header = lines[0];
            lines = lines.slice(1);
        }

        // Procesar cada línea
        lines = lines.map(line => {
            if (skipEmptyCheckbox.checked && !line.trim()) {
                return line;
            }

            if (trimSpacesCheckbox.checked) {
                line = line.trim();
            }

            if (!line) return '';

            const columns = line.split(delimiter);
            const selectedColumns = columnIndexes
                .map(i => columns[i] || '')
                .filter(col => !removeEmptyCheckbox.checked || col.trim());

            processedLines++;
            return selectedColumns.join(delimiter);
        });

        // Filtrar líneas vacías si está activada la opción
        if (skipEmptyCheckbox.checked) {
            lines = lines.filter(line => line.trim());
        }

        // Añadir cabecera si estaba activada la opción
        if (header) {
            const headerColumns = header.split(delimiter);
            const selectedHeaderColumns = columnIndexes
                .map(i => headerColumns[i] || '')
                .filter(col => !removeEmptyCheckbox.checked || col.trim());
            lines.unshift(selectedHeaderColumns.join(delimiter));
        }

        // Actualizar texto de salida
        outputText.value = lines.join('\n');

        // Actualizar contadores
        updateCounters(originalCount, processedLines);

        showNotification('¡Columnas extraídas con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(total, processed) {
        lineCount.textContent = `${total} líneas`;
        extractedCount.textContent = `${processed} extraídas`;
        remainingCount.textContent = `${total} líneas`;
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        columnsInput.value = '';
        customDelimiter.value = '';
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

    // Habilitar/deshabilitar campo de delimitador personalizado
    delimiterRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            customDelimiter.disabled = this.value !== 'custom';
            if (this.value === 'custom') {
                customDelimiter.focus();
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