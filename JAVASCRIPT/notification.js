export function showNotification(message, iconType) {
    console.log("Notification triggered:", message);

    const iconDetails = {
        success: { background: '#4CAF50', icon: '&#10004;' }, 
        warning: { background: '#FFC107', icon: '&#9888;' }, 
        error: { background: '#F44336', icon: '&#10006;' },
        info: { background: '#2196F3', icon: '&#8505;' } 
    };

    let notification = document.getElementById('custom-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'custom-notification';
        notification.style.position = 'fixed';
        notification.style.top = '2%';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)'; 
        notification.style.padding = '2vw'; 
        notification.style.maxWidth = '90%'; 
        notification.style.width = 'auto';
        notification.style.backgroundColor = 'white';
        notification.style.color = '#333';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.5)';
        notification.style.borderRadius = '12px'; 
        notification.style.fontSize = '1.2vw'; 
        notification.style.textAlign = 'center';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.justifyContent = 'center';
        notification.style.gap = '10px'; 
        notification.style.zIndex = '1000';
        notification.style.flexWrap = 'wrap'; 
        document.body.appendChild(notification);
    }

    notification.innerHTML = '';

    const iconElement = document.createElement('div');
    iconElement.style.width = '8vw'; 
    iconElement.style.height = '8vw';
    iconElement.style.maxWidth = '40px';
    iconElement.style.maxHeight = '40px';
    iconElement.style.minWidth = '25px'; 
    iconElement.style.minHeight = '25px';
    iconElement.style.display = 'flex';
    iconElement.style.alignItems = 'center';
    iconElement.style.justifyContent = 'center';
    iconElement.style.borderRadius = '50%';
    iconElement.style.backgroundColor = iconDetails[iconType].background;
    iconElement.style.color = 'white';
    iconElement.innerHTML = iconDetails[iconType].icon;

    const messageElement = document.createElement('div');
    messageElement.style.flex = '1';
    messageElement.style.alignItems = 'center';
    messageElement.textContent = message;

    notification.appendChild(iconElement);
    notification.appendChild(messageElement);

    notification.style.display = 'flex';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}