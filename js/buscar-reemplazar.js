// js/buscar-reemplazar.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const searchText = document.getElementById('searchText');
    const replaceText = document.getElementById('replaceText');
    const findButton = document.getElementById('findButton');
    const replaceButton = document.getElementById('replaceButton');
    const replaceAllButton = document.getElementById('replaceAllButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Checkboxes de opciones
    const caseSensitiveCheckbox = document.getElementById('caseSensitive');
    const wholeWordCheckbox = document.getElementById('wholeWord');
    const useRegexCheckbox = document.getElementById('useRegex');
    const multilineCheckbox = document.getElementById('multiline');
    
    // Contadores
    const charCount = document.querySelector('.char-count');
    const matchCount = document.querySelector('.match-count');
    const replacedCount = document.querySelector('.replaced-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Variables para el seguimiento de coincidencias
    let matches = [];
    let currentMatchIndex = -1;

    // Función para escapar caracteres especiales de regex
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Función para crear el patrón de búsqueda
    function createSearchPattern(searchStr) {
        if (!searchStr) return null;

        let pattern = searchStr;
        
        if (!useRegexCheckbox.checked) {
            pattern = escapeRegExp(pattern);
        }

        if (wholeWordCheckbox.checked) {
            pattern = `\\b${pattern}\\b`;
        }

        try {
            const flags = [
                !caseSensitiveCheckbox.checked ? 'i' : '',
                multilineCheckbox.checked ? 'm' : '',
                'g'
            ].join('');

            return new RegExp(pattern, flags);
        } catch (e) {
            showNotification('Error en la expresión regular: ' + e.message, 'error');
            return null;
        }
    }

    // Función para buscar coincidencias
    function findMatches() {
        if (!inputText.value || !searchText.value) {
            showNotification('Por favor, introduce texto y un término de búsqueda', 'error');
            return;
        }

        const pattern = createSearchPattern(searchText.value);
        if (!pattern) return;

        matches = [...inputText.value.matchAll(pattern)];
        currentMatchIndex = matches.length > 0 ? 0 : -1;
        
        // Actualizar contador de coincidencias
        matchCount.textContent = `${matches.length} coincidencias`;

        if (matches.length === 0) {
            showNotification('No se encontraron coincidencias', 'warning');
            return;
        }

        // Resaltar primera coincidencia
        highlightMatch();
        showNotification(`Se encontraron ${matches.length} coincidencias`, 'success');
    }

    // Función para resaltar coincidencia actual
    function highlightMatch() {
        if (currentMatchIndex === -1 || matches.length === 0) return;

        const match = matches[currentMatchIndex];
        const text = inputText.value;
        
        // Crear texto con resaltado
        const beforeMatch = text.slice(0, match.index);
        const matchText = text.slice(match.index, match.index + match[0].length);
        const afterMatch = text.slice(match.index + match[0].length);

        // Actualizar texto de salida con resaltado
        outputText.value = `${beforeMatch}【${matchText}】${afterMatch}`;
    }

    // Función para reemplazar coincidencia actual
    function replaceMatch() {
        if (currentMatchIndex === -1 || matches.length === 0) {
            showNotification('No hay coincidencia seleccionada para reemplazar', 'error');
            return;
        }

        const match = matches[currentMatchIndex];
        const replacement = replaceText.value;
        
        // Realizar reemplazo
        const text = inputText.value;
        inputText.value = text.slice(0, match.index) + replacement + 
                         text.slice(match.index + match[0].length);

        // Actualizar búsqueda
        findMatches();
        updateCounters(1);
    }

    // Función para reemplazar todas las coincidencias
    function replaceAllMatches() {
        if (matches.length === 0) {
            showNotification('No hay coincidencias para reemplazar', 'error');
            return;
        }

        const pattern = createSearchPattern(searchText.value);
        if (!pattern) return;

        const replacement = replaceText.value;
        const originalText = inputText.value;
        const newText = originalText.replace(pattern, replacement);
        
        // Actualizar texto
        inputText.value = newText;
        outputText.value = newText;

        // Actualizar contadores
        const replacedCount = matches.length;
        updateCounters(replacedCount);

        // Resetear búsqueda
        matches = [];
        currentMatchIndex = -1;
        matchCount.textContent = '0 coincidencias';

        showNotification(`Se reemplazaron ${replacedCount} coincidencias`, 'success');
    }

    // Función para actualizar contadores
    function updateCounters(replacedCount) {
        const total = inputText.value.length;
        charCount.textContent = `${total} caracteres`;
        remainingCount.textContent = `${total} caracteres`;
        
        const currentReplaced = parseInt(replacedCount.textContent) || 0;
        replacedCount.textContent = `${currentReplaced + replacedCount} reemplazos`;
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        searchText.value = '';
        replaceText.value = '';
        matches = [];
        currentMatchIndex = -1;
        matchCount.textContent = '0 coincidencias';
        replacedCount.textContent = '0 reemplazos';
        charCount.textContent = '0 caracteres';
        remainingCount.textContent = '0 caracteres';
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
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 
                          'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event Listeners
    findButton.addEventListener('click', findMatches);
    replaceButton.addEventListener('click', replaceMatch);
    replaceAllButton.addEventListener('click', replaceAllMatches);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Actualizar búsqueda cuando cambian las opciones
    [caseSensitiveCheckbox, wholeWordCheckbox, useRegexCheckbox, multilineCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (searchText.value) {
                findMatches();
            }
        });
    });

    // Búsqueda en tiempo real mientras se escribe
    searchText.addEventListener('input', () => {
        if (searchText.value) {
            findMatches();
        } else {
            matches = [];
            currentMatchIndex = -1;
            matchCount.textContent = '0 coincidencias';
            outputText.value = inputText.value;
        }
    });

    // Actualizar contador de caracteres al escribir
    inputText.addEventListener('input', function() {
        charCount.textContent = `${this.value.length} caracteres`;
        if (searchText.value) {
            findMatches();
        }
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para buscar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            findMatches();
        }
        
        // Ctrl/Cmd + Shift + R para reemplazar todo
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            replaceAllMatches();
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