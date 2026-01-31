// Toast notification utility
let toastContainer = null;
let toastId = 0;

const ensureContainer = () => {
    if (!toastContainer) {
        toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }
    return toastContainer;
};

const toast = {
    success: (message, duration = 4000) => {
        return showToast(message, 'success', duration);
    },

    error: (message, duration = 5000) => {
        return showToast(message, 'error', duration);
    },

    warning: (message, duration = 4000) => {
        return showToast(message, 'warning', duration);
    },

    info: (message, duration = 4000) => {
        return showToast(message, 'info', duration);
    },
};

function showToast(message, type = 'info', duration = 4000) {
    const container = ensureContainer();
    const id = ++toastId;

    const toastElement = document.createElement('div');
    toastElement.className = `toast toast-${type}`;
    toastElement.setAttribute('data-toast-id', id);

    const icon = getIcon(type);
    toastElement.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

    container.appendChild(toastElement);

    // Trigger animation
    setTimeout(() => {
        toastElement.classList.add('toast-show');
    }, 10);

    // Auto remove
    setTimeout(() => {
        removeToast(id);
    }, duration);

    return id;
}

function removeToast(id) {
    const toast = document.querySelector(`[data-toast-id="${id}"]`);
    if (toast) {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

function getIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };
    return icons[type] || icons.info;
}

export default toast;
