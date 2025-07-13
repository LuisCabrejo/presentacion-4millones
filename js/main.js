document.addEventListener('DOMContentLoaded', function() {
    // ============== CONFIGURACIÓN INICIAL ==============
    const CONFIG = {
        packages: {
            'ESP1': { investment: 200, gen5Bonuses: [25, 5, 5, 5, 10], cv: 100 },
            'ESP2': { investment: 500, gen5Bonuses: [75, 10, 10, 10, 20], cv: 250 },
            'ESP3': { investment: 1000, gen5Bonuses: [150, 20, 20, 20, 40], cv: 500 }
        },
        exchangeRate: 4500,
        binary: { cvPerPerson: 50, percentage: 0.17 }
    };

    let state = { currency: 'COP', selectedPackage: 'ESP3' };
    let binaryChartInstance;

    const ui = {
        partnersSlider: document.getElementById('partnersSlider'),
        partnersValue: document.getElementById('partnersValue'),
        fastStartBonusEl: document.getElementById('fastStartBonus'),
        netResultEl: document.getElementById('netResult'),
        teamSlider: document.getElementById('teamSlider'),
        teamSizeEl: document.getElementById('teamSize'),
        binaryIncomeEl: document.getElementById('binaryIncome'),
        btnUSD: document.getElementById('btn-USD'),
        btnCOP: document.getElementById('btn-COP'),
        packageButtons: { 'ESP1': document.getElementById('btn-ESP1'), 'ESP2': document.getElementById('btn-ESP2'), 'ESP3': document.getElementById('btn-ESP3') },
        priceLabels: document.querySelectorAll('[data-price-usd]'),
        gen5TableBody: document.getElementById('gen5-table-body'),
        gen5Total: document.getElementById('gen5-total'),
        binaryChartCanvas: document.getElementById('binaryChart'),
        goalForm: document.getElementById('goal-form'),
        formError: document.getElementById('form-error'),
        generatePlanBtn: document.getElementById('generate-plan-btn'),
        planLoaderContainer: document.getElementById('plan-loader-container'),
        actionPlanResult: document.getElementById('action-plan-result'),
        planActions: document.getElementById('plan-actions'),
        copyPlanBtn: document.getElementById('copy-plan-btn'),
        copyFeedback: document.getElementById('copy-feedback'),
        trendsRadarChart: document.getElementById('trendsRadarChart'),
        tabsContainer: document.getElementById('tabs-container'),
        tabContents: document.querySelectorAll('.tab-content'),
        incomeGoalRadios: document.querySelectorAll('input[name="income"]'),
        whatsappLink: document.getElementById('whatsapp-link'),
        catalogLink: document.getElementById('catalog-link'),
        // Modal elements
        productModal: document.getElementById('product-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalImage: document.getElementById('modal-image'),
        closeModal: document.getElementById('close-modal'),
    };

    // ============== SISTEMA DE WHATSAPP SIMPLIFICADO Y ROBUSTO ==============

    /**
     * 🔥 CONFIGURAR WHATSAPP - VERSIÓN SIMPLIFICADA QUE FUNCIONA
     */
    function configurarWhatsAppFinal() {
        console.log('🔥 ==========================================');
        console.log('🔥 CONFIGURACIÓN FINAL DE WHATSAPP');
        console.log('🔥 ==========================================');

        const params = new URLSearchParams(window.location.search);
        const distribuidorSlug = params.get('distribuidor');
        const socioPhone = params.get('socio');

        console.log('🔥 URL completa:', window.location.href);
        console.log('🔥 Parámetro distribuidor:', distribuidorSlug);
        console.log('🔥 Parámetro socio:', socioPhone);

        if (!ui.whatsappLink) {
            console.error('❌ No se encontró botón de WhatsApp (#whatsapp-link)');
            return;
        }

        // MAPA DIRECTO DE DISTRIBUIDORES (más confiable que Supabase)
        const distribuidorMap = {
            'luis-cabrejo': {
                nombre: 'Luis',
                whatsapp: '+573203415438',
                mensaje: 'Hola Luis, muy buena la información, me gustaría participar, ¿qué debo hacer?'
            },
            'ganocafe-online': {
                nombre: 'Ganocafé',
                whatsapp: '+573118870682',
                mensaje: 'Hola Ganocafé, muy buena la información, me gustaría participar, ¿qué debo hacer?'
            }
        };

        let whatsappConfig = null;

        // 1. Prioridad: parámetro socio directo
        if (socioPhone) {
            let numeroFormateado = socioPhone;
            if (!numeroFormateado.startsWith('+')) {
                numeroFormateado = '+57' + numeroFormateado.replace(/[^\d]/g, '');
            }
            whatsappConfig = {
                whatsapp: numeroFormateado,
                mensaje: 'Hola, vi la presentación de la oportunidad y me gustaría participar, ¿qué debo hacer?'
            };
            console.log('🔥 Usando parámetro socio:', numeroFormateado);
        }

        // 2. Segunda prioridad: distribuidor conocido
        else if (distribuidorSlug && distribuidorMap[distribuidorSlug]) {
            whatsappConfig = distribuidorMap[distribuidorSlug];
            console.log('🔥 Distribuidor encontrado:', whatsappConfig.nombre, '-', whatsappConfig.whatsapp);
        }

        // 3. Fallback: configuración por defecto
        else {
            whatsappConfig = {
                whatsapp: '+573118870682',
                mensaje: 'Hola, vi la presentación de la oportunidad y me gustaría participar, ¿qué debo hacer?'
            };
            console.log('🔥 Usando configuración por defecto');
        }

        // APLICAR CONFIGURACIÓN FINAL
        if (whatsappConfig) {
            const whatsappUrl = `https://wa.me/${whatsappConfig.whatsapp}?text=${encodeURIComponent(whatsappConfig.mensaje)}`;

            // FORZAR la configuración del href
            ui.whatsappLink.href = whatsappUrl;
            ui.whatsappLink.setAttribute('href', whatsappUrl);

            console.log('🔥 ==========================================');
            console.log('✅ WHATSAPP CONFIGURADO EXITOSAMENTE');
            console.log('📱 Número:', whatsappConfig.whatsapp);
            console.log('💬 Mensaje:', whatsappConfig.mensaje);
            console.log('🔗 URL final:', whatsappUrl);
            console.log('🔗 Href aplicado:', ui.whatsappLink.href);
            console.log('🔥 ==========================================');

            // Personalizar enlace de catálogo también
            if (ui.catalogLink && distribuidorSlug) {
                const catalogUrl = `https://catalogo.4millones.com/?distribuidor=${distribuidorSlug}`;
                ui.catalogLink.href = catalogUrl;
                console.log('📋 Catálogo personalizado:', catalogUrl);
            }
        }
    }

    // ============== FUNCIONALIDAD DEL MODAL DE PRODUCTOS ==============

    const productCategories = {
        'bebidas': {
            title: 'Bebidas Enriquecidas con Ganoderma',
            image: '/images/bebidas.png'
        },
        'capsulas': {
            title: 'Suplementos Potentes con Ganoderma',
            image: '/images/capsulas.png'
        },
        'cuidado-personal': {
            title: 'Cuidado Personal con Ganoderma',
            image: '/images/cuidado-personal.png'
        }
    };

    /**
     * 🖼️ Abrir modal de categoría de productos
     */
    window.openModal = function(category) {
        const categoryData = productCategories[category];

        if (categoryData && ui.productModal) {
            ui.modalTitle.textContent = categoryData.title;
            ui.modalImage.src = categoryData.image;
            ui.modalImage.alt = categoryData.title;

            ui.productModal.classList.remove('hidden');
            ui.productModal.classList.add('modal-show');

            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';

            console.log('🖼️ Modal abierto para categoría:', category);
        }
    };

    /**
     * ❌ Cerrar modal
     */
    function closeModal() {
        if (ui.productModal) {
            ui.productModal.classList.add('modal-hide');

            setTimeout(() => {
                ui.productModal.classList.remove('modal-show', 'modal-hide');
                ui.productModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }, 300);

            console.log('❌ Modal cerrado');
        }
    }

    /**
     * 🎯 Configurar eventos del modal
     */
    function setupModalEvents() {
        // Cerrar con botón X
        if (ui.closeModal) {
            ui.closeModal.addEventListener('click', closeModal);
        }

        // Cerrar al hacer clic fuera del modal
        if (ui.productModal) {
            ui.productModal.addEventListener('click', (e) => {
                if (e.target === ui.productModal) {
                    closeModal();
                }
            });
        }

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !ui.productModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    // ============== FUNCIONES DE RENDERIZADO Y CÁLCULO ==============
    const formatCurrency = (value) => {
        const options = { style: 'currency', currency: state.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 };
        const currencyValue = state.currency === 'COP' ? value * CONFIG.exchangeRate : value;
        return new Intl.NumberFormat(state.currency === 'COP' ? 'es-CO' : 'en-US', options).format(currencyValue);
    };

    function setCurrency(currency) {
        state.currency = currency;
        ui.btnUSD.classList.toggle('currency-btn-active', currency === 'USD');
        ui.btnUSD.classList.toggle('currency-btn-inactive', currency !== 'USD');
        ui.btnCOP.classList.toggle('currency-btn-active', currency === 'COP');
        ui.btnCOP.classList.toggle('currency-btn-inactive', currency !== 'COP');
        renderAll();
    }

    function selectPackage(pkg) {
        state.selectedPackage = pkg;
        Object.values(ui.packageButtons).forEach(btn => btn.classList.remove('border-blue-600', 'bg-blue-50', 'border-2'));
        ui.packageButtons[pkg].classList.add('border-blue-600', 'bg-blue-50', 'border-2');
        renderAll();
    }

    function renderAll() {
        renderPackagePrices();
        renderFastStart();
        renderGen5Projection();
        if(ui.teamSlider) renderBinary();
        updateIncomeGoalLabels();
    }

    function renderPackagePrices() { ui.priceLabels.forEach(label => { const usdPrice = parseFloat(label.dataset.priceUsd); label.textContent = `Inversión: ${formatCurrency(usdPrice)}`; }); }

    function renderFastStart() {
        if (!ui.partnersSlider) return;
        const numPartners = parseInt(ui.partnersSlider.value);
        ui.partnersValue.textContent = numPartners;
        const packageInfo = CONFIG.packages[state.selectedPackage];
        const totalBonusUSD = numPartners * packageInfo.gen5Bonuses[0];
        const netResultUSD = totalBonusUSD - packageInfo.investment;
        ui.fastStartBonusEl.textContent = formatCurrency(totalBonusUSD);
        ui.netResultEl.textContent = formatCurrency(netResultUSD);
        ui.netResultEl.classList.toggle('text-red-600', netResultUSD < 0);
        ui.netResultEl.classList.toggle('text-green-600', netResultUSD >= 0);
    }

    function renderGen5Projection() {
        if (!ui.gen5TableBody) return;
        let accumulatedIncome = 0, tableHTML = '';
        const { gen5Bonuses, cv } = CONFIG.packages[state.selectedPackage];
        for (let i = 0; i < 5; i++) {
            const generation = i + 1;
            const newPartners = Math.pow(2, generation);
            const gen5Income = newPartners * gen5Bonuses[i];
            const binaryIncome = Math.pow(2, i) * cv * CONFIG.binary.percentage;
            accumulatedIncome += gen5Income + binaryIncome;
            tableHTML += `<tr class="border-b border-slate-200"><td class="table-cell text-left font-semibold text-slate-700">Generación ${generation}</td><td class="table-cell">${newPartners}</td><td class="table-cell">${formatCurrency(gen5Income)}</td><td class="table-cell">${formatCurrency(binaryIncome)}</td><td class="table-cell font-bold text-blue-700">${formatCurrency(accumulatedIncome)}</td></tr>`;
        }
        ui.gen5TableBody.innerHTML = tableHTML;
        ui.gen5Total.textContent = formatCurrency(accumulatedIncome);
    }

    const calculateBinaryIncome = (teamMembers) => CONFIG.binary.cvPerPerson * teamMembers * CONFIG.binary.percentage;

    function renderBinary() {
        if (!ui.teamSlider) return;
        const teamMembers = parseInt(ui.teamSlider.value);
        ui.teamSizeEl.textContent = teamMembers;
        const incomeUSD = calculateBinaryIncome(teamMembers);
        ui.binaryIncomeEl.textContent = formatCurrency(incomeUSD);
        if (binaryChartInstance) updateChartData(teamMembers);
    }

    function updateChartData(maxTeamSize) {
         if (!binaryChartInstance) return;
        const labels = [];
        const data = [];
        const step = Math.max(10, Math.floor(maxTeamSize / 10));

        for (let i = 10; i <= maxTeamSize; i += step) {
            labels.push(i);
            data.push(calculateBinaryIncome(i));
        }
        if (labels[labels.length - 1] < maxTeamSize) {
             labels.push(maxTeamSize);
             data.push(calculateBinaryIncome(maxTeamSize));
        }

        binaryChartInstance.data.labels = labels;
        binaryChartInstance.data.datasets[0].data = data;
        binaryChartInstance.update();
    }

    function createBinaryChart() {
        if (!ui.binaryChartCanvas) return;
        const ctx = ui.binaryChartCanvas.getContext('2d');
        binaryChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Ingreso Binario Mensual', data: [], fill: true, borderColor: 'rgb(75, 192, 192)', tension: 0.1, backgroundColor: 'rgba(75, 192, 192, 0.2)' }] },
            options: { scales: { y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value) } }, x: { title: { display: true, text: 'Personas por Equipo' } } }, plugins: { legend: { display: false } } }
        });
        updateChartData(parseInt(ui.teamSlider.value));
    }

    function createTrendsRadarChart() {
        if (!ui.trendsRadarChart) return;
        const ctx = ui.trendsRadarChart.getContext('2d');
        const labels = [['Industria del', 'Bienestar'], ['Economía', 'Colaborativa'], ['Industria', 'del Café']];
        new Chart(ctx, {
            type: 'radar',
            data: { labels: labels, datasets: [{ label: 'Posicionamiento de Gano Excel', data: [9, 8, 9.5], backgroundColor: 'rgba(67, 90, 119, 0.2)', borderColor: 'rgb(67, 90, 119)', pointBackgroundColor: 'rgb(67, 90, 119)', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgb(67, 90, 119)' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: function(tooltipItems) { const item = tooltipItems[0]; let label = item.chart.data.labels[item.dataIndex]; return Array.isArray(label) ? label.join(' ') : label; } } } }, scales: { r: { angleLines: { color: '#dee2e6' }, grid: { color: '#e5e7eb' }, pointLabels: { font: { size: window.innerWidth < 640 ? 12 : 14, weight: '600' }, color: '#1b263b' }, ticks: { display: false, stepSize: 2 } } } }
        });
    }

    function handleTabs() {
        if (!ui.tabsContainer) return;
        ui.tabsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.tab')) {
                const tabNumber = e.target.dataset.tab;
                ui.tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
                e.target.classList.add('tab-active');
                ui.tabContents.forEach(c => { c.classList.remove('tab-content-active'); if (c.id === `content-${tabNumber}`) { c.classList.add('tab-content-active'); } });
            }
        });
    }

    function updateIncomeGoalLabels() {
        ui.incomeGoalRadios.forEach(radio => {
            const labelSpan = document.getElementById(radio.nextElementSibling.id);
            let text = radio.value;
            if(text.includes('{val}')) { text = text.replace('{val}', formatCurrency(radio.dataset.usd)); }
            if(text.includes('{val1}')) { text = text.replace('{val1}', formatCurrency(radio.dataset.usd1)); }
             if(text.includes('{val2}')) { text = text.replace('{val2}', formatCurrency(radio.dataset.usd2)); }
            labelSpan.textContent = text;
        });
    }

    // ============== FUNCIÓN PARA COPIAR CON MEJOR UX ==============
    function copyPlanToClipboard() {
        const planText = ui.actionPlanResult.innerText;
        navigator.clipboard.writeText(planText).then(() => {
            ui.copyPlanBtn.textContent = '✅ ¡Copiado!';
            ui.copyFeedback.textContent = 'Ahora puedes pegarlo en tu app de notas, WhatsApp o un documento (Word, Google Docs).';
            ui.copyFeedback.style.display = 'block';

            setTimeout(() => {
                ui.copyPlanBtn.textContent = 'Copiar Plan';
                ui.copyFeedback.style.display = 'none';
            }, 4000);
        }).catch(err => {
            console.error('Error al copiar el plan: ', err);
            alert("No se pudo copiar el plan.");
        });
    }

    // ============== FUNCIÓN CLAVE (SIN CAMBIOS EN LA LÓGICA DE API) ==============
    async function generateActionPlan() {
        const form = ui.goalForm;
        const formData = {
            userName: form.elements['user-name'].value,
            selectedPackage: form.elements['package'].value,
            motivation: form.elements['motivation'].value,
            incomeGoal: form.elements['income'].value,
            personalGoal: form.elements['personal-goal'].value || "No especificado",
            healthGoal: form.elements['health-goal'].value,
            commitment: form.elements['commitment'].value,
        };

        if (!formData.userName || !formData.healthGoal) {
            ui.formError.style.display = 'block';
            return;
        }

        ui.formError.style.display = 'none';
        ui.actionPlanResult.style.display = 'none';
        ui.planActions.style.display = 'none';
        ui.planLoaderContainer.style.display = 'block';
        ui.actionPlanResult.innerHTML = '';

        const apiUrl = '/api/generate-plan';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor.' }));
                throw new Error(errData.error || `La petición a la API falló con estado ${response.status}`);
            }

            const result = await response.json();

            if (result.plan) {
                ui.actionPlanResult.innerHTML = parseMarkdownToHTML(result.plan);
                ui.actionPlanResult.style.display = 'block';
                ui.planActions.style.display = 'block';
            } else {
                throw new Error("No se recibió un plan de la API.");
            }

        } catch (error) {
            console.error("API Error:", error);
            ui.actionPlanResult.innerHTML = `<p class="text-red-600">Lo sentimos, no se pudo generar el plan de acción en este momento. Por favor, intente de nuevo más tarde.</p>`;
            ui.actionPlanResult.style.display = 'block';
        } finally {
            ui.planLoaderContainer.style.display = 'none';
            ui.actionPlanResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function parseMarkdownToHTML(text) {
        text = text.replace(/^####\s+(.*$)/gim, '<h4 class="text-lg font-bold text-sky-800 mt-4 mb-2">$1</h4>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/^\s*\*\s+(.*$)/gim, '<li class="mb-1">$1</li>');
        text = text.replace(/((<li>.*<\/li>\s*)+)/g, '<ul class="list-disc list-inside text-sky-700 space-y-1">$1</ul>');
        return text;
    }

    // ============== FUNCIÓN DE INICIALIZACIÓN ==============
    function initialize() {
        console.log('🚀 ==========================================');
        console.log('🚀 SISTEMA DE OPORTUNIDAD - VERSIÓN SIMPLIFICADA');
        console.log('🚀 Enfoque: WhatsApp que FUNCIONA');
        console.log('🚀 ==========================================');

        // Eventos de calculadora
        if(ui.btnUSD) ui.btnUSD.addEventListener('click', () => setCurrency('USD'));
        if(ui.btnCOP) ui.btnCOP.addEventListener('click', () => setCurrency('COP'));
        if(ui.packageButtons) {
            Object.values(ui.packageButtons).forEach(btn => btn.addEventListener('click', () => selectPackage(btn.id.replace('btn-', ''))));
        }
        if(ui.partnersSlider) ui.partnersSlider.addEventListener('input', renderFastStart);
        if(ui.teamSlider) ui.teamSlider.addEventListener('input', renderBinary);

        // Eventos de formulario
        if(ui.generatePlanBtn) ui.generatePlanBtn.addEventListener('click', generateActionPlan);
        if(ui.copyPlanBtn) ui.copyPlanBtn.addEventListener('click', copyPlanToClipboard);

        // Eventos de radio buttons
        document.querySelectorAll('input[name="package"], input[name="income"], input[name="commitment"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => {
                    r.parentElement.classList.remove('selected');
                });
                if (radio.checked) {
                    radio.parentElement.classList.add('selected');
                }
            });
        });

        // Configurar funcionalidades
        handleTabs();
        setupModalEvents();

        // 🔥 CONFIGURAR WHATSAPP - PRIORIDAD MÁXIMA
        console.log('🔥 Configurando WhatsApp - ÚLTIMO PASO');
        configurarWhatsAppFinal();

        // Crear gráficos
        if(ui.binaryChartCanvas) createBinaryChart();
        if(ui.trendsRadarChart) createTrendsRadarChart();

        // Configuración inicial
        if(ui.packageButtons && ui.packageButtons.ESP3) selectPackage('ESP3');
        setCurrency('COP');

        console.log('✅ SISTEMA INICIALIZADO');

        // VERIFICACIÓN FINAL DEL WHATSAPP
        setTimeout(() => {
            console.log('🔍 VERIFICACIÓN FINAL:');
            console.log('🔍 WhatsApp href actual:', ui.whatsappLink?.href || 'NO ENCONTRADO');

            if (ui.whatsappLink?.href && !ui.whatsappLink.href.includes('3203415438') && window.location.search.includes('luis-cabrejo')) {
                console.error('❌ ERROR: WhatsApp no está configurado para Luis');
                console.log('🔄 Reintentando configuración...');
                configurarWhatsAppFinal();
            }
        }, 2000);
    }

    initialize();
});

// ============== VERIFICACIÓN DE CARGA ==============
console.log('🎯 ==========================================');
console.log('✅ ARCHIVO MAIN.JS SIMPLIFICADO CARGADO');
console.log('🔥 Prioridad: WhatsApp personalizado FUNCIONAL');
console.log('🎯 ==========================================');
