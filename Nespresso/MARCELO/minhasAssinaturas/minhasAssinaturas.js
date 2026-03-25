(function() {
        function customizeContainer(container) {
            // evita duplicar a customização
            if (container.dataset.customized) return;

            var manageBtn = container.querySelector('[data-testid="manageEasyOrder"]');
            var editBtn = container.querySelector('[data-testid="editNextShipment"]');
            var payBtn = container.querySelector('[data-testid="updatePayment"]');
            if (!(manageBtn && editBtn && payBtn)) return;

            // 1) estiliza
            manageBtn.style.backgroundColor = '#17171A';
            manageBtn.style.borderColor = '#17171A';
            manageBtn.style.color = '#FFFFFF';

            // 2) reordena + renomeia
            container.insertBefore(manageBtn, container.firstChild);
            editBtn.textContent = 'Editar apenas a próxima entrega';
            editBtn.setAttribute('aria-label', 'Editar apenas a próxima entrega');
            container.insertBefore(editBtn, container.children[1]);
            // payBtn fica por último

            // 3) dataLayer pushes
            function pushEvent(pos, btn) {
                window.gtmDataObject = window.gtmDataObject || [];
                window.gtmDataObject.push({
                    event: "local_event",
                    event_raised_by: "br",
                    local_event_category: "editar-assinatura",
                    local_event_action: "click" + pos,
                    local_event_label: btn.textContent.trim()
                });
            }
            manageBtn.addEventListener('click', function() {
                pushEvent(1, manageBtn);
            });
            editBtn.addEventListener('click', function() {
                pushEvent(2, editBtn);
            });
            payBtn.addEventListener('click', function() {
                pushEvent(3, payBtn);
            });
            container.dataset.customized = 'true';
        }

        function processAllContainers() {
            var containers = document.querySelectorAll('div[class*="_OrderActions__buttons"]');
            containers.forEach(function(container) {
                customizeContainer(container);
            });
        }

        // Executa imediatamente
        processAllContainers();

        // Observa mudanças no DOM
        var observer = new MutationObserver(function() {
            processAllContainers();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    })();