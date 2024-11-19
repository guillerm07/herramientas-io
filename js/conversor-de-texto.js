// js/conversor-de-texto.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    const conversionButtons = document.querySelectorAll('.conversion-btn');

    // Funciones de conversión
    const conversions = {
        uppercase: (text) => text.toUpperCase(),
        
        lowercase: (text) => text.toLowerCase(),
        
        capitalize: (text) => {
            return text.split(' ').map(word => {
                if (word.length === 0) return word;
                return word[0].toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
        },
        
        sentence: (text) => {
            return text.split(/([.!?]+)/).map((sentence, index, array) => {
                // Si es un signo de puntuación, devuélvelo tal cual
                if (/^[.!?]+$/.test(sentence)) return sentence;
                // Si es una oración, capitaliza su primera palabra
                sentence = sentence.trim();
                if (sentence.length === 0) return sentence;
                return sentence[0].toUpperCase() + sentence.slice(1).toLowerCase();
            }).join('');
        },
        
        alternate: (text) => {
            return text.split('').map((char, i) => 
                i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
            ).join('');
        },
        
        inverse: (text) => {
            return text.split('').map(char => {
                if (char === char.toUpperCase()) {
                    return char.toLowerCase();
                }
                return char.toUpperCase();
            }).join('');
        }
    };

    // Función para convertir texto
    function convertText(conversionType) {
        if (!inputText.value.trim()) {
            showNotification('Por favor, introduce algún texto', 'error');
            return;
        }

        // Desactivar botón activo anterior
        document.querySelector('.conversion-btn.active')?.classList.remove('active');
        
        // Activar botón actual
        document.querySelector(`[data-conversion="${conversionType}"]`).classList.add('active');

        // Realizar conversión
        const convertedText = conversions[conversionType](inputText.value);
        outputText.value = convertedText;

        // Mostrar notificación
        showNotification('¡Texto convertido!', 'success');
    }

    // Función para limpiar campos
    function clearFields() {
        inputText.value = '';
        outputText.value = '';
        document.querySelector('.conversion-btn.active')?.classList.remove('active');
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

    // Event Listeners
    conversionButtons.forEach(button => {
        button.addEventListener('click', () => {
            convertText(button.dataset.conversion);
        });
    });

    clearButton.addEventListener('click', clearFields);
    copyButton.addEventListener('click', copyToClipboard);

    // Conversión automática cuando se escribe
    let lastConversion = null;
    inputText.addEventListener('input', () => {
        if (lastConversion) {
            convertText(lastConversion);
        }
    });

    // Actualizar última conversión cuando se hace clic en un botón
    conversionButtons.forEach(button => {
        button.addEventListener('click', () => {
            lastConversion = button.dataset.conversion;
        });
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
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