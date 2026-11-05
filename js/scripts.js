// 1. DATOS
    const commands = [
      { id: 'new-file', icon: '📄', label: 'Nuevo archivo',       description: 'Crear un documento vacío' },
      { id: 'search',   icon: '🔍', label: 'Buscar en proyecto',  description: 'Buscar texto en el código' },
      { id: 'theme',    icon: '🎨', label: 'Cambiar tema',        description: 'Alternar entre claro y oscuro' },
      { id: 'save',     icon: '💾', label: 'Guardar',             description: 'Guardar el archivo actual' },
      { id: 'format',   icon: '✨', label: 'Formatear código',    description: 'Aplicar formato automático' },
      { id: 'terminal', icon: '⚡', label: 'Abrir terminal',      description: 'Abrir una nueva terminal' },
      { id: 'settings', icon: '⚙️', label: 'Configuración',       description: 'Abrir ajustes del editor' },
      { id: 'logout',   icon: '🚪', label: 'Cerrar sesión',       description: 'Salir de la cuenta actual' },
    ];

    // 2. REFERENCIAS
    const overlay     = document.getElementById('overlay');
    const searchInput = document.getElementById('searchInput');
    const listEl      = document.getElementById('list');
    const toastsEl    = document.getElementById('toasts');

    // 3. ESTADO
    let filteredCommands = [...commands];
    let activeIndex = 0;
    let isOpen = false;

    // 4. TOASTS
    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<span>✅</span><span>${message}</span>`;
      toastsEl.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
      }, 2500);
    }

    // 5. RENDERIZAR LISTA
    function renderList() {
      if (filteredCommands.length === 0) {
        listEl.innerHTML = '<div class="palette-empty">No se encontraron comandos</div>';
        return;
      }
      listEl.innerHTML = filteredCommands
        .map((cmd, index) => `
          <div class="palette-item ${index === activeIndex ? 'active' : ''}" data-index="${index}">
            <span class="palette-icon">${cmd.icon}</span>
            <div>
              <div style="font-weight:500">${highlightMatch(cmd.label)}</div>
              <div style="font-size:0.85rem;color:#6b7280">${cmd.description}</div>
            </div>
          </div>
        `)
        .join('');

      listEl.querySelector('.palette-item.active')
            ?.scrollIntoView({ block: 'nearest' });
    }

    // 6. RESALTAR COINCIDENCIAS
    function highlightMatch(text) {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return text;
      const i = text.toLowerCase().indexOf(q);
      if (i === -1) return text;
      return (
        text.slice(0, i) +
        `<mark style="background:#fef3c7;color:inherit;padding:0 2px;border-radius:2px">` +
        text.slice(i, i + q.length) +
        `</mark>` +
        text.slice(i + q.length)
      );
    }

    // 7. FILTRAR
    function filterCommands() {
      const q = searchInput.value.trim().toLowerCase();
      filteredCommands = q
        ? commands.filter(c =>
            c.label.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
          )
        : [...commands];
      activeIndex = 0;
      renderList();
    }

    // 8. ABRIR / CERRAR
    function openPalette() {
      isOpen = true;
      overlay.classList.add('open');
      searchInput.value = '';
      filteredCommands = [...commands];
      activeIndex = 0;
      renderList();
      setTimeout(() => searchInput.focus(), 50);
    }
    function closePalette() {
      isOpen = false;
      overlay.classList.remove('open');
      searchInput.blur();
    }

    // 9. EJECUTAR COMANDO
    function executeCommand(cmd) {
      closePalette();
      showToast(`Ejecutado: ${cmd.label}`);
      // Aquí iría la lógica real de cada comando:
      // switch (cmd.id) { case 'new-file': ... }
    }

    // 10. ACTUALIZAR SOLO LA CLASE ACTIVA (sin re-render)
    function updateActiveItem() {
      const items = listEl.querySelectorAll('.palette-item');
      items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }

    // ================= EVENTOS =================

    // Atajo global
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? closePalette() : openPalette();
      }
    });

    // Teclado dentro del input
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && filteredCommands.length) {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, filteredCommands.length - 1);
        updateActiveItem();
      } else if (e.key === 'ArrowUp' && filteredCommands.length) {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActiveItem();
      } else if (e.key === 'Enter' && filteredCommands[activeIndex]) {
        e.preventDefault();
        executeCommand(filteredCommands[activeIndex]);
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    searchInput.addEventListener('input', filterCommands);

    // Click en un item
    listEl.addEventListener('click', (e) => {
      const item = e.target.closest('.palette-item');
      if (item) executeCommand(filteredCommands[Number(item.dataset.index)]);
    });

    // Hover para actualizar el activo (sin re-render)
    listEl.addEventListener('mousemove', (e) => {
      const item = e.target.closest('.palette-item');
      if (!item) return;
      const idx = Number(item.dataset.index);
      if (idx !== activeIndex) {
        activeIndex = idx;
        updateActiveItem();
      }
    });

    // Click fuera del modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });