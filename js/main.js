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

    // ============== SISTEMA DE PERSONALIZACIÓN COMO EL CATÁLOGO ==============

    /**
     * 🎯 Generar slug desde nombre completo (MEJORADO - Idéntico al sistema del catálogo)
     * @param {string} fullName - Nombre completo del usuario
     * @returns {string} Slug amigable
     */
    function generarSlugDesdNombre(fullName) {
        if (!fullName) return null;

        try {
            console.log('🔧 Generando slug para:', fullName);

            // Extraer primer nombre + primer apellido
            const parts = fullName.trim().split(' ').filter(part => part.length > 0);

            let nombreParaSlug;
            if (parts.length >= 2) {
                nombreParaSlug = `${parts[0]} ${parts[1]}`;
            } else {
                nombreParaSlug = parts[0] || '';
            }

            console.log('📝 Nombre para slug:', nombreParaSlug);

            // Convertir a slug amigable (proceso robusto)
            const slug = nombreParaSlug
                .toLowerCase()
                .trim()
                // Reemplazar caracteres especiales manualmente
                .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
                .replace(/à/g, 'a').replace(/è/g, 'e').replace(/ì/g, 'i').replace(/ò/g, 'o').replace(/ù/g, 'u')
                .replace(/ä/g, 'a').replace(/ë/g, 'e').replace(/ï/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
                .replace(/ñ/g, 'n').replace(/ç/g, 'c')
                // Remover caracteres no alfanuméricos excepto espacios
                .replace(/[^a-z0-9\s]/g, '')
                // Espacios múltiples a uno solo
                .replace(/\s+/g, ' ')
                // Espacios a guiones
                .replace(/\s/g, '-')
                // Múltiples guiones a uno
                .replace(/-+/g, '-')
                // Remover guiones al inicio y final
                .replace(/^-+|-+$/g, '');

            console.log('✅ Slug generado:', slug);
            return slug;

        } catch (error) {
            console.error('❌ Error generando slug:', error);
            return null;
        }
    }

    /**
     * 🔗 Configurar enlaces personalizados con distribuidor
     */
    function setupPersonalizedLinks() {
        const params = new URLSearchParams(window.location.search);
        const distribuidorSlug = params.get('distribuidor');

        console.log('🔗 Configurando enlaces personalizados...');
        console.log('🔗 Parámetro distribuidor:', distribuidorSlug);

        // Personalizar enlace de WhatsApp
        if (ui.whatsappLink) {
            let whatsappUrl = "https://wa.me/";
            let message = "Hola, vi la presentación de la oportunidad y me gustaría participar, ¿qué debo hacer?";

            // Buscar parámetro 'socio' primero (compatibilidad)
            const socioPhone = params.get('socio');

            if (socioPhone) {
                whatsappUrl = `https://wa.me/${socioPhone}?text=${encodeURIComponent(message)}`;
                console.log('📱 WhatsApp configurado con parámetro socio:', socioPhone);
            } else if (distribuidorSlug) {
                // Usar sistema de distribuidores conocidos para obtener el WhatsApp del distribuidor
                configurarWhatsAppPorDistribuidor(distribuidorSlug);
            } else {
                console.log('📱 WhatsApp con configuración por defecto');
            }

            ui.whatsappLink.href = whatsappUrl;
        }

        // Personalizar enlace del catálogo
        if (ui.catalogLink && distribuidorSlug) {
            const catalogUrl = `https://catalogo.4millones.com/?distribuidor=${distribuidorSlug}`;
            ui.catalogLink.href = catalogUrl;
            console.log('📋 Enlace de catálogo personalizado:', catalogUrl);
        }
    }

    /**
     * 📱 Configurar WhatsApp por distribuidor usando sistema completo como el catálogo
     */
    async function configurarWhatsAppPorDistribuidor(slug) {
        try {
            console.log('📱 ==========================================');
            console.log('📱 CONFIGURANDO WHATSAPP PERSONALIZADO');
            console.log('📱 Slug del distribuidor:', slug);
            console.log('📱 ==========================================');

            // 🔧 Configuración de Supabase (CREDENCIALES ACTUALIZADAS)
            const SUPABASE_URL = 'https://ovsvocjvjnqfaaugwnxg.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92c3ZvY2p2am5xZmFhdWd3bnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODYzODksImV4cCI6MjA1MjQ2MjM4OX0.VGZreq-e-f7O1Rz5Eo8JSDMNFsIbGLT8lY3UKKbNv5w';

            // Verificar si Supabase está disponible
            if (typeof window.supabase === 'undefined') {
                console.warn('⚠️ Supabase no disponible, usando distribuidores conocidos');
                return configurarWhatsAppConocidos(slug);
            }

            // Inicializar cliente Supabase
            const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Buscar en Supabase
            const distribuidor = await buscarDistribuidorEnSupabase(supabaseClient, slug);

            if (distribuidor) {
                const message = `Hola ${distribuidor.primer_nombre}, muy buena la información, me gustaría participar, ¿qué debo hacer?`;
                const whatsappUrl = `https://wa.me/${distribuidor.whatsapp}?text=${encodeURIComponent(message)}`;

                ui.whatsappLink.href = whatsappUrl;

                console.log('📱 WhatsApp configurado desde Supabase:');
                console.log('📱   Nombre completo:', distribuidor.nombre_completo);
                console.log('📱   Primer nombre:', distribuidor.primer_nombre);
                console.log('📱   WhatsApp:', distribuidor.whatsapp);
                console.log('📱   Mensaje:', message);

                return;
            }

            // Fallback a distribuidores conocidos
            console.log('📱 Distribuidor no encontrado en Supabase, usando conocidos...');
            configurarWhatsAppConocidos(slug);

        } catch (error) {
            console.error('❌ Error configurando WhatsApp:', error);
            configurarWhatsAppConocidos(slug);
        }
    }

    /**
     * 🔍 Buscar distribuidor en Supabase con lógica mejorada
     */
    async function buscarDistribuidorEnSupabase(supabaseClient, slugBuscado) {
        try {
            console.log('🔍 Consultando base de datos Supabase...');

            const { data: perfiles, error } = await supabaseClient
                .from('profiles')
                .select('full_name, whatsapp, email')
                .not('full_name', 'is', null);

            if (error) {
                console.error('❌ Error en consulta Supabase:', error);
                return null;
            }

            console.log('📊 Perfiles encontrados:', perfiles?.length || 0);

            if (!perfiles || perfiles.length === 0) {
                console.warn('⚠️ No se encontraron perfiles');
                return null;
            }

            // Buscar coincidencia de slug
            for (const perfil of perfiles) {
                const slugGenerado = generarSlugDesdNombre(perfil.full_name);

                console.log(`🔍 Comparando: "${slugGenerado}" vs "${slugBuscado}"`);

                if (slugGenerado && slugGenerado === slugBuscado) {
                    // Formatear WhatsApp
                    let whatsappFormateado = perfil.whatsapp;
                    if (whatsappFormateado) {
                        const numeroLimpio = whatsappFormateado.replace(/[^\d]/g, '');
                        if (numeroLimpio.length === 10 && !numeroLimpio.startsWith('57')) {
                            whatsappFormateado = '+57' + numeroLimpio;
                        } else if (!whatsappFormateado.startsWith('+')) {
                            whatsappFormateado = '+' + numeroLimpio;
                        }
                    }

                    // Extraer primer nombre
                    const nombreParts = perfil.full_name.trim().split(' ').filter(part => part.length > 0);
                    const primerNombre = nombreParts[0] || '';

                    console.log('✅ Distribuidor encontrado:', {
                        nombre: perfil.full_name,
                        primer_nombre: primerNombre,
                        whatsapp: whatsappFormateado
                    });

                    return {
                        nombre_completo: perfil.full_name,
                        primer_nombre: primerNombre,
                        whatsapp: whatsappFormateado,
                        email: perfil.email,
                        slug: slugBuscado
                    };
                }
            }

            console.log('❌ No se encontró distribuidor para slug:', slugBuscado);
            return null;

        } catch (error) {
            console.error('❌ Error en búsqueda Supabase:', error);
            return null;
        }
    }

    /**
     * 📱 Configurar WhatsApp con distribuidores conocidos (fallback)
     */
    function configurarWhatsAppConocidos(slug) {
        console.log('📱 Usando distribuidores conocidos para slug:', slug);

        // Datos conocidos actualizados
        const distribuidoresConocidos = {
            'ganocafe-online': { nombre: 'Ganocafé', whatsapp: '+573118870682' },
            'luis-cabrejo': { nombre: 'Luis', whatsapp: '+573203415438' }
        };

        const distribuidor = distribuidoresConocidos[slug];

        if (distribuidor && ui.whatsappLink) {
            const message = `Hola ${distribuidor.nombre}, muy buena la información, me gustaría participar, ¿qué debo hacer?`;
            const whatsappUrl = `https://wa.me/${distribuidor.whatsapp}?text=${encodeURIComponent(message)}`;

            ui.whatsappLink.href = whatsappUrl;

            console.log('📱 WhatsApp configurado con distribuidor conocido:');
            console.log('📱   Nombre:', distribuidor.nombre);
            console.log('📱   WhatsApp:', distribuidor.whatsapp);
        } else {
            console.log('📱 Aplicando configuración genérica');
            const genericMessage = "Hola, vi la presentación de la oportunidad y me gustaría participar, ¿qué debo hacer?";
            ui.whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(genericMessage)}`;
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

    // ============== FUNCIONES DE TESTING Y DEBUGGING ==============

    /**
     * 🧪 Función de testing para verificar generación de slugs
     */
    function testearGeneracionSlugs() {
        console.log('🧪 ==========================================');
        console.log('🧪 TESTING GENERACIÓN DE SLUGS');
        console.log('🧪 ==========================================');

        const casosTest = [
            'Ganocafé Online',
            'Luis Cabrejo Parra',
            'María González López',
            'José Antonio Rodríguez',
            'Ana Sofía Pérez',
            'Carlos Andrés Martínez'
        ];

        casosTest.forEach(nombre => {
            const slug = generarSlugDesdNombre(nombre);
            console.log(`🧪 "${nombre}" → "${slug}"`);
        });

        console.log('🧪 ==========================================');
    }

    /**
     * 🔍 Función de debugging para verificar el estado del sistema
     */
    function debugSistemaDistribuidor() {
        const params = new URLSearchParams(window.location.search);
        const distribuidorSlug = params.get('distribuidor');

        console.log('🔍 ==========================================');
        console.log('🔍 DEBUG DEL SISTEMA DE DISTRIBUIDOR');
        console.log('🔍 ==========================================');
        console.log('🔍 URL actual:', window.location.href);
        console.log('🔍 Parámetros:', {
            distribuidor: distribuidorSlug,
            socio: params.get('socio'),
            todos: Object.fromEntries(params)
        });
        console.log('🔍 Elementos DOM encontrados:');
        console.log('🔍   whatsappLink:', !!ui.whatsappLink);
        console.log('🔍   catalogLink:', !!ui.catalogLink);
        console.log('🔍 WhatsApp href actual:', ui.whatsappLink?.href || 'No configurado');
        console.log('🔍 ==========================================');

        if (distribuidorSlug) {
            console.log('🔍 Probando configuración para slug:', distribuidorSlug);
            configurarWhatsAppPorDistribuidor(distribuidorSlug);
        }
    }
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

    // ============== FUNCIÓN DE INICIALIZACIÓN MEJORADA ==============
    function initialize() {
        console.log('🚀 ==========================================');
        console.log('🚀 SISTEMA DE OPORTUNIDAD V2.0 CON WHATSAPP MEJORADO');
        console.log('🚀 Timestamp:', new Date().toISOString());
        console.log('🚀 ==========================================');

        // Verificar disponibilidad de Supabase
        if (typeof window.supabase !== 'undefined') {
            console.log('✅ Supabase disponible para consultas');
        } else {
            console.warn('⚠️ Supabase no disponible, usando fallback');
        }

        // Testing en modo desarrollo
        const isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.search.includes('debug=true') ||
                             window.location.search.includes('test=true');

        if (isDevelopment) {
            console.log('🔧 MODO DESARROLLO ACTIVADO');
            testearGeneracionSlugs();

            // Exponer funciones para debugging
            window.debugOportunidad = {
                generarSlug: generarSlugDesdNombre,
                configurarWhatsApp: configurarWhatsAppPorDistribuidor,
                debugSistema: debugSistemaDistribuidor,
                testSlugs: testearGeneracionSlugs
            };
            console.log('🔧 Funciones de debug disponibles en window.debugOportunidad');
        }

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

        // Configurar enlaces personalizados (incluyendo WhatsApp mejorado)
        console.log('🔗 Iniciando configuración de enlaces personalizados...');
        setupPersonalizedLinks();

        // Crear gráficos
        if(ui.binaryChartCanvas) createBinaryChart();
        if(ui.trendsRadarChart) createTrendsRadarChart();

        // Configuración inicial
        if(ui.packageButtons && ui.packageButtons.ESP3) selectPackage('ESP3');
        setCurrency('COP');

        console.log('✅ SISTEMA INICIALIZADO CORRECTAMENTE');

        // Debug automático en desarrollo
        if (isDevelopment) {
            setTimeout(() => {
                console.log('🔍 Ejecutando debug automático...');
                debugSistemaDistribuidor();
            }, 2000);
        }
    }

    initialize();
});

// ============== MENSAJE DE CONFIRMACIÓN Y NOTAS TÉCNICAS ==============
console.log('🎯 ==========================================');
console.log('✅ SISTEMA DE OPORTUNIDAD CARGADO (V2.0)');
console.log('📱 + WhatsApp personalizado con Supabase');
console.log('🖼️ + Modal de productos mejorado');
console.log('🔍 + Sistema de debugging avanzado');
console.log('🎯 ==========================================');

/**
 * 📋 NOTAS TÉCNICAS DEL SISTEMA V2.0
 *
 * 🔧 CONFIGURACIÓN ACTUALIZADA:
 * - Credenciales Supabase: ovsvocjvjnqfaaugwnxg.supabase.co
 * - Tabla: profiles (full_name, whatsapp, email)
 * - Fallback: distribuidores conocidos hardcoded
 *
 * 🧪 TESTING DISPONIBLE:
 * - URL con ?debug=true para modo desarrollo
 * - window.debugOportunidad.* para funciones de testing
 * - Logs detallados en consola para debugging
 *
 * 📱 URLS DE PRUEBA:
 * - oportunidad.4millones.com/?distribuidor=luis-cabrejo
 * - oportunidad.4millones.com/?distribuidor=ganocafe-online
 * - oportunidad.4millones.com/?socio=573203415438 (modo compatibilidad)
 *
 * ✅ RESULTADOS ESPERADOS:
 * - WhatsApp personalizado con mensaje correcto
 * - Enlaces de catálogo con parámetro distribuidor
 * - Fallback automático si no encuentra distribuidor
 *
 * 🎯 OBJETIVO: Replicar el éxito del sistema del catálogo
 */
