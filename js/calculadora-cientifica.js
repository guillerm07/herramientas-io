// js/calculadora-cientifica.js
document.addEventListener('DOMContentLoaded', function() {
    // Estado de la calculadora
    const state = {
        expression: '0',
        result: '',
        history: '',
        memory: 0,
        isRadians: true,
        lastAnswer: 0
    };

    // Elementos del DOM
    const display = {
        expression: document.getElementById('expression'),
        result: document.getElementById('result'),
        history: document.getElementById('history')
    };

    // Constantes matemáticas
    const CONSTANTS = {
        pi: Math.PI,
        e: Math.E
    };

    // Actualizar display
    function updateDisplay() {
        display.expression.textContent = state.expression;
        display.result.textContent = state.result;
        display.history.textContent = state.history;
    }

    // Formatear número
    function formatNumber(num) {
        if (typeof num !== 'number') return num;
        const maxDecimals = 10;
        return Number(num.toPrecision(maxDecimals)).toString();
    }

    // Funciones matemáticas
    const mathFunctions = {
        sin: (x) => state.isRadians ? Math.sin(x) : Math.sin(x * Math.PI / 180),
        cos: (x) => state.isRadians ? Math.cos(x) : Math.cos(x * Math.PI / 180),
        tan: (x) => state.isRadians ? Math.tan(x) : Math.tan(x * Math.PI / 180),
        log: (x) => Math.log10(x),
        ln: (x) => Math.log(x),
        sqrt: (x) => Math.sqrt(x),
        abs: (x) => Math.abs(x),
        exp: (x) => Math.exp(x),
        fact: (x) => {
            if (x < 0) return NaN;
            if (x === 0) return 1;
            let result = 1;
            for (let i = 2; i <= x; i++) result *= i;
            return result;
        },
        inv: (x) => 1 / x
    };

    // Evaluar expresión
    function evaluateExpression(expr) {
        try {
            // Reemplazar constantes
            expr = expr.replace(/π/g, Math.PI).replace(/e/g, Math.E);

            // Reemplazar funciones matemáticas
            for (const [func, implementation] of Object.entries(mathFunctions)) {
                const regex = new RegExp(`${func}\\((.*?)\\)`, 'g');
                expr = expr.replace(regex, (_, args) => {
                    const value = evaluateExpression(args);
                    return implementation(value);
                });
            }

            // Reemplazar operadores
            expr = expr.replace(/×/g, '*').replace(/÷/g, '/');

            // Evaluar
            const result = Function(`'use strict'; return (${expr})`)();
            return typeof result === 'number' ? result : NaN;
        } catch (error) {
            return NaN;
        }
    }

    // Manejar entrada de teclas
    function handleKeyPress(key) {
        const isNumber = /[0-9.]/.test(key);
        const isOperator = /[+\-×÷^%]/.test(key);
        const isParenthesis = /[()]/.test(key);

        // Reiniciar si hay error
        if (state.result === 'Error' && key !== 'ac') {
            state.expression = '0';
            state.result = '';
        }

        switch (key) {
            case 'ac':
                state.expression = '0';
                state.result = '';
                state.history = '';
                break;

            case 'del':
                if (state.expression.length > 1) {
                    state.expression = state.expression.slice(0, -1);
                } else {
                    state.expression = '0';
                }
                break;

            case '=':
                try {
                    const result = evaluateExpression(state.expression);
                    if (isNaN(result)) throw new Error('Invalid expression');
                    state.history = state.expression;
                    state.lastAnswer = result;
                    state.result = formatNumber(result);
                    state.expression = formatNumber(result);
                } catch (error) {
                    state.result = 'Error';
                }
                break;

            case 'ans':
                if (state.expression === '0') {
                    state.expression = state.lastAnswer.toString();
                } else {
                    state.expression += state.lastAnswer;
                }
                break;

            case 'mc':
                state.memory = 0;
                break;

            case 'mr':
                if (state.expression === '0') {
                    state.expression = state.memory.toString();
                } else {
                    state.expression += state.memory;
                }
                break;

            case 'm+':
                try {
                    const result = evaluateExpression(state.expression);
                    state.memory += result;
                } catch (error) {
                    state.result = 'Error';
                }
                break;

            case 'm-':
                try {
                    const result = evaluateExpression(state.expression);
                    state.memory -= result;
                } catch (error) {
                    state.result = 'Error';
                }
                break;

            case 'rad':
                state.isRadians = true;
                break;

            case 'deg':
                state.isRadians = false;
                break;

            default:
                if (isNumber || isOperator || isParenthesis) {
                    if (state.expression === '0' && isNumber) {
                        state.expression = key;
                    } else {
                        state.expression += key;
                    }
                } else if (Object.keys(mathFunctions).includes(key)) {
                    state.expression += `${key}(`;
                } else if (Object.keys(CONSTANTS).includes(key)) {
                    if (state.expression === '0') {
                        state.expression = CONSTANTS[key].toString();
                    } else {
                        state.expression += CONSTANTS[key];
                    }
                }
        }

        // Actualizar display
        updateDisplay();
    }

    // Event listeners para los botones
    document.querySelectorAll('.key').forEach(button => {
        button.addEventListener('click', () => {
            const key = button.getAttribute('data-key');
            handleKeyPress(key);
            
            // Efecto visual
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 100);
        });
    });

    // Event listener para el teclado
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        const keyMap = {
            'Enter': '=',
            'Backspace': 'del',
            'Escape': 'ac',
            '*': '×',
            '/': '÷'
        };

        if (keyMap[key]) {
            handleKeyPress(keyMap[key]);
        } else if (/[0-9.+\-()]/.test(key)) {
            handleKeyPress(key);
        }
    });

    // Inicializar display
    updateDisplay();
});