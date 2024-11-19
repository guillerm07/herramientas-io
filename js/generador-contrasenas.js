// js/generador-contrasenas.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const passwordOutput = document.getElementById('passwordOutput');
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const generateButton = document.getElementById('generateButton');
    const copyButton = document.getElementById('copyButton');
    const refreshButton = document.getElementById('refreshButton');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Checkboxes
    const includeUppercase = document.getElementById('includeUppercase');
    const includeLowercase = document.getElementById('includeLowercase');
    const includeNumbers = document.getElementById('includeNumbers');
    const includeSymbols = document.getElementById('includeSymbols');
    const excludeSimilar = document.getElementById('excludeSimilar');
    const excludeAmbiguous = document.getElementById('excludeAmbiguous');

    // Conjuntos de caracteres
    const CHARS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*-_=+?',
        similar: 'il1Lo0O',
        ambiguous: '{}[]()/\\\'"`~,;:.<>',
    };

    // Actualizar valor del slider
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Función para generar contraseña
    function generatePassword() {
        let chars = '';
        let password = '';

        // Verificar que al menos una opción está seleccionada
        if (!includeUppercase.checked && !includeLowercase.checked && 
            !includeNumbers.checked && !includeSymbols.checked) {
            showNotification('Selecciona al menos un tipo de caracteres', 'error');
            return;
        }

        // Construir conjunto de caracteres
        if (includeUppercase.checked) chars += CHARS.uppercase;
        if (includeLowercase.checked) chars += CHARS.lowercase;
        if (includeNumbers.checked) chars += CHARS.numbers;
        if (includeSymbols.checked) chars += CHARS.symbols;

        // Excluir caracteres si está seleccionado
        if (excludeSimilar.checked) {
            CHARS.similar.split('').forEach(char => {
                chars = chars.replace(new RegExp(char, 'g'), '');
            });
        }
        if (excludeAmbiguous.checked) {
            CHARS.ambiguous.split('').forEach(char => {
                chars = chars.replace(new RegExp('\\' + char, 'g'), '');
            });
        }

        // Generar contraseña
        const length = parseInt(lengthSlider.value);
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Verificar requisitos mínimos
        let hasUpper = /[A-Z]/.test(password);
        let hasLower = /[a-z]/.test(password);
        let hasNumber = /[0-9]/.test(password);
        let hasSymbol = /[!@#$%^&*\-_=+?]/.test(password);

        // Regenerar si no cumple con los requisitos seleccionados
        if ((includeUppercase.checked && !hasUpper) ||
            (includeLowercase.checked && !hasLower) ||
            (includeNumbers.checked && !hasNumber) ||
            (includeSymbols.checked && !hasSymbol)) {
            return generatePassword();
        }

        passwordOutput.value = password;
        updateStrengthMeter(password);
    }

    // Función para actualizar el medidor de seguridad
    function updateStrengthMeter(password) {
        let strength = 0;
        const checks = {
            length: password.length >= 12,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password),
        };

        // Calcular puntuación
        strength += password.length >= 8 ? 1 : 0;
        strength += password.length >= 12 ? 1 : 0;
        strength += password.length >= 16 ? 1 : 0;
        strength += checks.upper ? 1 : 0;
        strength += checks.lower ? 1 : 0;
        strength += checks.number ? 1 : 0;
        strength += checks.symbol ? 1 : 0;

        // Actualizar UI
        const percentage = (strength / 7) * 100;
        strengthBar.style.width = `${percentage}%`;
        strengthBar.style.background = 
            percentage <= 25 ? '#ef4444' :
            percentage <= 50 ? '#f59e0b' :
            percentage <= 75 ? '#10b981' :
            '#22c55e';

        strengthText.textContent = 
            percentage <= 25 ? 'Muy débil' :
            percentage <= 50 ? 'Débil' :
            percentage <= 75 ? 'Fuerte' :
            'Muy fuerte';
    }

    // Función para copiar al portapapeles
    function copyToClipboard() {
        if (!passwordOutput.value) {
            showNotification('Genera una contraseña primero', 'error');
            return;
        }

        navigator.clipboard.writeText(passwordOutput.value)
            .then(() => {
                showNotification('¡Contraseña copiada!');
            })
            .catch(() => {
                showNotification('Error al copiar la contraseña', 'error');
            });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        // Eliminar notificación existente si la hay
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event Listeners
    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyToClipboard);
    refreshButton.addEventListener('click', generatePassword);

    // Generar contraseña inicial
    generatePassword();

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para generar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generatePassword();
        }
        
        // Ctrl/Cmd + C para copiar
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement !== passwordOutput) {
            e.preventDefault();
            copyToClipboard();
        }
    });
});