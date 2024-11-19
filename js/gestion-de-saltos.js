// js/gestion-de-saltos.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const convertButton = document.getElementById('convertButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    const radioOptions = document.getElementsByName('lineBreakOption');

    // Función principal de conversión
    function convertText() {
        const text = inputText.value;
        const selectedOption = Array.from(radioOptions).find(radio => radio.checked).value;
        
        if (text.trim() === '') {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        let result = '';
        
        if (selectedOption === 'add') {
            // Añadir saltos de línea después de cada punto
            result = text
                .replace(/([.!?])\s+/g, '$1\n\n') // Añade doble salto después de puntos, exclamaciones e interrogaciones
                .replace(/([,;:])\s+/g, '$1\n')    // Añade salto simple después de comas, punto y coma, y dos puntos
                .trim();
        } else {
            // Eliminar saltos de línea excesivos
            result = text
                .replace(/[\r\n]+/g, ' ')  // Reemplaza todos los saltos de línea por espacios
                .replace(/\s+/g, ' ')      // Normaliza espacios múltiples
                .trim();
        }

        outputText.value = result;
        showNotification('¡Texto convertido con éxito!', 'success');
    }

    // Función para limpiar los campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        showNotification('Campos limpiados', 'success');
    }

    // Función para copiar el resultado
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

    // Event Listeners
    convertButton.addEventListener('click', convertText);
    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Convertir automáticamente cuando se cambia la opción
    radioOptions.forEach(radio => {
        radio.addEventListener('change', () => {
            if (inputText.value.trim() !== '') {
                convertText();
            }
        });
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para convertir
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convertText();
        }
        
        // Ctrl/Cmd + Shift + C para copiar
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyToClipboard();
        }
    });

    // Prevenir que el formulario se envíe al presionar Enter
    document.querySelector('.tool-container').addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // Ajustar altura del textarea de salida para que coincida con el de entrada
    function matchTextareaHeights() {
        outputText.style.height = `${inputText.offsetHeight}px`;
    }

    // Observer para cambios en la altura del textarea de entrada
    const resizeObserver = new ResizeObserver(matchTextareaHeights);
    resizeObserver.observe(inputText);
});