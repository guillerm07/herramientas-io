// js/combinar-textos.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const firstText = document.getElementById('firstText');
    const secondText = document.getElementById('secondText');
    const outputText = document.getElementById('outputText');
    const customSeparator = document.getElementById('customSeparator');
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    
    // Radio buttons y checkboxes
    const separatorRadios = document.getElementsByName('separator');
    const trimSpacesCheckbox = document.getElementById('trimSpaces');
    const skipEmptyCheckbox = document.getElementById('skipEmpty');
    const alternateOrderCheckbox = document.getElementById('alternateOrder');
    const numberLinesCheckbox = document.getElementById('numberLines');
    
    // Contadores
    const firstCount = document.querySelector('.first-count');
    const secondCount = document.querySelector('.second-count');
    const combinedCount = document.querySelector('.combined-count');
    const remainingCount = document.querySelector('.remaining-count');

    // Función para obtener el separador seleccionado
    function getSelectedSeparator() {
        const selected = Array.from(separatorRadios).find(radio => radio.checked);
        switch (selected.value) {
            case 'space': return ' ';
            case 'tab': return '\t';
            case 'comma': return ',';
            case 'newline': return '\n';
            case 'custom': return customSeparator.value || ' ';
            default: return ' ';
        }
    }

    // Función principal para procesar el texto
    function processText() {
        if (!firstText.value && !secondText.value) {
            showNotification('Por favor, introduce al menos un texto', 'error');
            return;
        }

        const separator = getSelectedSeparator();
        
        // Obtener líneas de ambos textos
        let firstLines = firstText.value.split('\n');
        let secondLines = secondText.value.split('\n');
        
        // Aplicar trim si está activado
        if (trimSpacesCheckbox.checked) {
            firstLines = firstLines.map(line => line.trim());
            secondLines = secondLines.map(line => line.trim());
        }

        // Filtrar líneas vacías si está activado
        if (skipEmptyCheckbox.checked) {
            firstLines = firstLines.filter(line => line.length > 0);
            secondLines = secondLines.filter(line => line.length > 0);
        }

        // Determinar la longitud máxima
        const maxLength = Math.max(firstLines.length, secondLines.length);
        const combinedLines = [];
        let processedCount = 0;

        // Combinar líneas
        for (let i = 0; i < maxLength; i++) {
            let first = firstLines[i] || '';
            let second = secondLines[i] || '';
            
            // Si ambas líneas están vacías y skipEmpty está activado, continuar
            if (skipEmptyCheckbox.checked && !first && !second) {
                continue;
            }

            let combinedLine = '';
            
            // Alternar orden si está activado
            if (alternateOrderCheckbox.checked && i % 2 === 1) {
                [first, second] = [second, first];
            }

            // Añadir numeración si está activado
            if (numberLinesCheckbox.checked) {
                combinedLine = `${(i + 1).toString().padStart(3, '0')}. `;
            }

            // Combinar las líneas con el separador
            if (separator === '\n') {
                if (first) combinedLines.push(combinedLine + first);
                if (second) combinedLines.push(combinedLine + second);
            } else {
                combinedLines.push(combinedLine + first + (first && second ? separator : '') + second);
            }

            processedCount++;
        }

        // Actualizar texto de salida
        outputText.value = combinedLines.join('\n');

        // Actualizar contadores
        updateCounters(firstLines.length, secondLines.length, processedCount);

        showNotification('¡Textos combinados con éxito!', 'success');
    }

    // Función para actualizar contadores
    function updateCounters(first, second, combined) {
        firstCount.textContent = `${first} líneas`;
        secondCount.textContent = `${second} líneas`;
        combinedCount.textContent = `${combined} combinadas`;
        remainingCount.textContent = `${combined} líneas`;
    }

    // Función para limpiar campos
    function clearFields() {
        firstText.value = '';
        secondText.value = '';
        outputText.value = '';
        customSeparator.value = '';
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

    // Actualizar contadores al escribir
    firstText.addEventListener('input', function() {
        const lines = this.value.split('\n');
        firstCount.textContent = `${lines.length} líneas`;
    });

    secondText.addEventListener('input', function() {
        const lines = this.value.split('\n');
        secondCount.textContent = `${lines.length} líneas`;
    });

    // Event Listeners
    processButton.addEventListener('click', processText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Habilitar/deshabilitar campo de separador personalizado
    separatorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            customSeparator.disabled = this.value !== 'custom';
            if (this.value === 'custom') {
                customSeparator.focus();
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

    // Ajustar altura de los textareas
    function matchTextareaHeights() {
        const maxHeight = Math.max(firstText.offsetHeight, secondText.offsetHeight);
        firstText.style.height = `${maxHeight}px`;
        secondText.style.height = `${maxHeight}px`;
        outputText.style.height = `${maxHeight}px`;
    }

    // Observer para cambios en la altura de los textareas
    const resizeObserver = new ResizeObserver(matchTextareaHeights);
    resizeObserver.observe(firstText);
    resizeObserver.observe(secondText);
});