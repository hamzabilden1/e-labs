/**
 _____     _        _    ____  ____  
| ____|   | |      / \  | __ )/ ___| 
|  _| - _ | |     / _ \ |  _ \\___ \ 
| |___ | || |___ / ___ \| |_) |___) |
|_____||_||_____/_/   \_\____/|____/ 

E-LABS - Sanal Deney Laboratuvarı
Bu yazılımın kopyalanması, izinsiz çoğaltılması ve paylaşılması kesinlikle yasaktır.
© 2026 E-LabS Team. Tüm Hakları Saklıdır.
 */
const SecurityUtils = {
    sanitizeHTML: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    sanitizeMarkdown: function(markdown) {
        if (!markdown) return '';
        const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote', 'a', 'br'];
        const parsed = marked.parse(markdown);
        
        const temp = document.createElement('div');
        temp.innerHTML = parsed;
        
        const sanitize = (node) => {
            if (node.nodeType === Node.TEXT_NODE) return node;
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (!allowedTags.includes(node.tagName.toLowerCase())) {
                    return document.createTextNode(node.textContent);
                }
                
                if (node.tagName.toLowerCase() === 'a') {
                    const href = node.getAttribute('href');
                    if (href && !href.match(/^(https?:\/\/|mailto:|#)/i)) {
                        node.removeAttribute('href');
                    }
                    node.setAttribute('rel', 'noopener noreferrer');
                    node.setAttribute('target', '_blank');
                }
                
                Array.from(node.attributes).forEach(attr => {
                    if (!['href', 'rel', 'target', 'class', 'id'].includes(attr.name)) {
                        node.removeAttribute(attr.name);
                    }
                });
                
                Array.from(node.childNodes).forEach(child => {
                    const sanitized = sanitize(child);
                    if (sanitized !== child) {
                        node.replaceChild(sanitized, child);
                    }
                });
            }
            
            return node;
        };
        
        Array.from(temp.childNodes).forEach(sanitize);
        return temp.innerHTML;
    },

    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validateInput: function(input, type = 'text', maxLength = 1000) {
        if (!input || input.length > maxLength) return false;
        
        switch(type) {
            case 'number':
                return !isNaN(parseFloat(input)) && isFinite(input);
            case 'alphanum':
                return /^[a-zA-Z0-9_-]+$/.test(input);
            case 'text':
            default:
                return input.length > 0;
        }
    },

    escapeRegex: function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    generateCSRFToken: function() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
