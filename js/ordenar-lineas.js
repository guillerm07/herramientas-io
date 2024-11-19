// js/ordenar-lineas.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Opciones de ordenamiento
    const sortTypeInputs = document.getElementsByName('sortType');
    const reverseOrderCheckbox = document.getElementById('reverseOrder');
    const caseSensitiveCheckbox = document.getElementById('caseSensitive');
    const ignoreArticlesCheckbox = document.getElementById('ignoreArticles');
    const trimSpacesCheckbox = document.getElementById('trimSpaces');
    const removeEmptyCheckbox = document.getElementById('removeEmpty');
    
    // Contadores
    const lineCount = document.querySelector('.line-count');
    const sortedCount = document.querySelector('.sorted-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Lista de artículos a ignorar
    const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];

    // Función para obtener el tipo de ordenamiento seleccionado
    function getSelectedSortType() {
        return Array.from(sortTypeInputs).find(input => input.checked).value;
    }

    // Función para remover artículos del inicio de una cadena
    function removeLeadingArticles(text) {
        const words = text.trim().split(/\s+/);
        if (words.length > 1 && articles.includes(words[0].toLowerCase())) {
            return words.slice(1).join(' ');
        }
        return text;
    }

    // Función para extraer número del inicio de una cadena
    function extractLeadingNumber(text) {
        const match = text.match(/^\s*(-?\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : NaN;
    }

    // Función principal para procesar el texto
    function processText() {
        if (!inputText.value) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        // Dividir el texto en líneas
        let lines = inputText.value.split('\n');
        const originalCount = lines.length;

        // Aplicar trim y eliminar líneas vacías si está activado
        if (trimSpacesCheckbox.checked) {
            lines = lines.map(line => line.trim());
        }
        if (removeEmptyCheckbox.checked) {
            lines = lines.filter(line => line.length > 0);
        }

        // Obtener tipo de ordenamiento
        const sortType = getSelectedSortType();

        // Función de comparación personalizada
        function compareLines(a, b) {
            let compareA = a;
            let compareB = b;

            // Aplicar case sensitivity
            if (!caseSensitiveCheckbox.checked) {
                compareA = compareA.toLowerCase();
                compareB = compareB.toLowerCase();
            }

            // Ignorar artículos si está activado
            if (ignoreArticlesCheckbox.checked) {
                compareA = removeLeadingArticles(compareA);
                compareB = removeLeadingArticles(compareB);
            }

            // Aplicar tipo de ordenamiento
            switch (sortType) {
                case 'numerical':
                    const numA = extractLeadingNumber(compareA);
                    const numB = extractLeadingNumber(compareB);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    return compareA.localeCompare(compareB);

                case 'length':
                    return compareA.length - compareB.length;

                case 'random':
                    return Math.random() - 0.5;

                default: // alphabetical
                    return compareA.localeCompare(compareB);
            }
        }

        // Ordenar líneas
        lines.sort(compareLines);

        // Invertir orden si está activado
        if (reverseOrderCheckbox.checked) {
            lines.reverse();
        }

        // Actualizar texto de salida
        outputText.value = lines.join('\n');

        // Actualizar contadores
        updateCounters(originalCount, lines.length);

        showNotification('¡Texto ordenado con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(original, sorted) {
        lineCount.textContent = `${original} líneas`;
        sortedCount.textContent = `${sorted} ordenadas`;
        remainingCount.textContent = `${sorted} líneas`;
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
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
        const lines = this.value.split('\n').filter(line => line.length > 0);
        lineCount.textContent = `${lines.length} líneas`;
    });

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Procesar automáticamente cuando cambian las opciones
    [reverseOrderCheckbox, caseSensitiveCheckbox, ignoreArticlesCheckbox, 
     trimSpacesCheckbox, removeEmptyCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (inputText.value.trim()) {
                processText();
            }
        });
    });

    sortTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
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