// Store products array
let products = [];

// Drag and drop functionality
const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

// Setup drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

dropZone.addEventListener('drop', handleDrop);
dropZone.addEventListener('click', (e) => {
    if (e.target === dropZone || e.target.tagName === 'P' || e.target.tagName === 'I') {
        if (!dropZone.querySelector('.image-url-input')) {
            imageInput.click();
        }
    }
});

imageInput.addEventListener('change', handleFileSelect);

function handleDrop(e) {
    const file = e.dataTransfer.files[0];
    handleFile(file);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    handleFile(file);
}

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                imagePreview.src = img.src;
                imagePreview.dataset.isLocal = 'true';
                imagePreview.hidden = false;
                dropZone.hidden = true;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Add new function to handle image URL input
function addImageUrlInput() {
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'Paste image URL here';
    urlInput.className = 'image-url-input';
    
    const urlButton = document.createElement('button');
    urlButton.textContent = 'Use URL';
    urlButton.className = 'url-button';
    
    urlButton.onclick = (e) => {
        e.preventDefault();
        if (urlInput.value) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                imagePreview.src = urlInput.value;
                imagePreview.dataset.isLocal = 'false';
                imagePreview.hidden = false;
                dropZone.hidden = true;
                urlInput.remove();
                urlButton.remove();
            };
            img.onerror = () => {
                alert('Error loading image. Please check the URL and try again.');
            };
            img.src = urlInput.value;
        }
    };
    
    dropZone.appendChild(urlInput);
    dropZone.appendChild(urlButton);
}

// Form submission
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('productName').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        image: imagePreview.src,
        isLocalImage: imagePreview.dataset.isLocal === 'true'
    };
    
    products.push(product);
    updateCatalog();
    resetForm();
    setupRealTimePreview(); // Setup real-time preview after adding product
});

function resetForm() {
    document.getElementById('productForm').reset();
    imagePreview.hidden = true;
    dropZone.hidden = false;
}

function updateCatalog() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = product.image;
        img.alt = product.name;
        
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p class="price">$${product.price}</p>
            <p class="description">${product.description}</p>
            <button class="delete-btn" onclick="deleteProduct(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        productCard.insertBefore(img, productCard.firstChild);
        
        productList.appendChild(productCard);
    });
    
    generateMessage();
}

function deleteProduct(index) {
    products.splice(index, 1);
    updateCatalog();
}

// Add Dark Mode Toggle
const toggleSwitch = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme);

// Add Real-time Preview
function setupRealTimePreview() {
    const inputs = ['productName', 'price', 'description'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            if (products.length > 0) {
                // Update last product in real-time
                const lastIndex = products.length - 1;
                products[lastIndex] = {
                    ...products[lastIndex],
                    name: document.getElementById('productName').value || products[lastIndex].name,
                    price: document.getElementById('price').value || products[lastIndex].price,
                    description: document.getElementById('description').value || products[lastIndex].description
                };
            }
            generateMessage();
        });
    });
}

// Update generateMessage function to show real-time status
function generateMessage() {
    const previewElement = document.getElementById('messagePreview');
    
    if (products.length === 0) {
        previewElement.innerHTML = `
            <span class="preview-badge">Preview</span>
            <div style="margin-top: 10px;">Add products to generate message</div>
        `;
        return;
    }
    
    // Create header for the message
    let message = `🛍️ *Product Catalog*\n\n`;
    
    // Add products with numbering
    message += products.map((product, index) => {
        const imageText = product.isLocalImage ? 
            '[Image Attached]' : 
            `[View Image](${product.image})`;
            
        return `*Product ${index + 1}:*\n` +
               `━━━━━━━━━━━━━━━\n` +
               `🏷️ *Name:* ${product.name}\n` +
               `💰 *Price:* $${product.price}\n` +
               `📝 *Description:* ${product.description}\n` +
               `🖼️ *Image:* ${imageText}`;
    }).join('\n\n');
    
    // Add footer
    message += '\n\n━━━━━━━━━━━━━━━\n' +
               '💬 *Contact us to order!*\n' +
               '🛒 Fast & Reliable Service';
    
    previewElement.innerHTML = `
        <span class="preview-badge">Live Preview</span>
        <div style="margin-top: 10px;">${message.replace(/\n/g, '<br>')}</div>
    `;
    
    updateWhatsAppButton(message);
}

function updateWhatsAppButton(message) {
    const phoneNumber = ''; // Add default phone number here if needed
    const encodedMessage = encodeURIComponent(message);
    const whatsappButton = document.getElementById('whatsappButton');
    whatsappButton.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// Copy button functionality
document.getElementById('copyButton').addEventListener('click', copyMessage);

// Typing indicator
let typingTimeout;
function setupTypingIndicator() {
    const inputs = document.querySelectorAll('input, textarea');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
        Typing<span></span><span></span><span></span>
    `;
    document.querySelector('.preview-container h2').appendChild(typingIndicator);

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(typingTimeout);
            typingIndicator.classList.add('active');
            
            typingTimeout = setTimeout(() => {
                typingIndicator.classList.remove('active');
            }, 1000);
        });
    });
}

// Character count
function setupCharacterCount() {
    const messagePreview = document.getElementById('messagePreview');
    const charCount = document.createElement('div');
    charCount.className = 'char-count';
    messagePreview.after(charCount);

    function updateCharCount() {
        const text = messagePreview.textContent;
        const count = text.length;
        const limit = 1024; // WhatsApp message limit
        const remaining = limit - count;
        
        charCount.textContent = `${count}/${limit} characters`;
        
        if (remaining < 100) {
            charCount.className = 'char-count danger';
        } else if (remaining < 200) {
            charCount.className = 'char-count warning';
        } else {
            charCount.className = 'char-count';
        }
    }

    // Update on message changes
    const observer = new MutationObserver(updateCharCount);
    observer.observe(messagePreview, { childList: true, characterData: true, subtree: true });
}

// Preview mode toggle
function setupPreviewModes() {
    const previewControls = document.createElement('div');
    previewControls.className = 'preview-controls';
    
    const toggleButtons = document.createElement('div');
    toggleButtons.className = 'preview-toggle';
    toggleButtons.innerHTML = `
        <button class="active" data-mode="formatted">
            <i class="fas fa-eye"></i> Formatted
        </button>
        <button data-mode="raw">
            <i class="fas fa-code"></i> Raw
        </button>
    `;
    
    previewControls.appendChild(toggleButtons);
    document.querySelector('.preview-container h2').after(previewControls);

    let currentMode = 'formatted';
    toggleButtons.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        toggleButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentMode = button.dataset.mode;
        updatePreviewMode();
    });

    function updatePreviewMode() {
        const message = document.querySelector('.message-preview div').textContent;
        if (currentMode === 'raw') {
            document.querySelector('.message-preview div').textContent = message;
        } else {
            document.querySelector('.message-preview div').innerHTML = message.replace(/\n/g, '<br>');
        }
    }
}

// Empty state
function updateEmptyState() {
    const messagePreview = document.getElementById('messagePreview');
    
    if (products.length === 0) {
        messagePreview.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>No Products Added</h3>
                <p>Add your first product to generate a WhatsApp message</p>
            </div>
        `;
    }
}

// Initialize new features
document.addEventListener('DOMContentLoaded', () => {
    setupTypingIndicator();
    setupCharacterCount();
    setupPreviewModes();
    updateEmptyState();
    initializeDarkMode();
});

// Update success feedback
function showSuccessAnimation(element) {
    element.classList.add('success-animation');
    setTimeout(() => {
        element.classList.remove('success-animation');
    }, 300);
}

// Update copy message function with feedback
function copyMessage() {
    const messageText = document.getElementById('messagePreview').textContent;
    navigator.clipboard.writeText(messageText).then(() => {
        const copyButton = document.getElementById('copyButton');
        copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        showSuccessAnimation(copyButton);
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Message';
        }, 2000);
    });
}

// PDF Export functionality
document.getElementById('exportPdfButton').addEventListener('click', exportToPDF);

function exportToPDF() {
    if (products.length === 0) {
        alert('Please add products before generating PDF');
        return;
    }

    // Show loading state
    const exportButton = document.getElementById('exportPdfButton');
    const originalText = exportButton.innerHTML;
    exportButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    exportButton.disabled = true;

    // Create PDF content
    const content = document.createElement('div');
    content.style.padding = '20px';

    // Add title
    content.innerHTML = `
        <h1 style="text-align: center; color: #075e54; margin-bottom: 20px;">
            Product Catalog
        </h1>
    `;

    // Add products
    products.forEach(product => {
        const productHtml = `
            <div style="margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                <img src="${product.image}" 
                     style="width: 100%; 
                            max-height: 200px; 
                            object-fit: contain; 
                            margin-bottom: 10px;"
                     crossorigin="anonymous">
                <h2 style="color: #075e54; margin: 10px 0;">${product.name}</h2>
                <p style="font-weight: bold; color: #128c7e;">Price: $${product.price}</p>
                <p style="margin-top: 10px;">${product.description}</p>
            </div>
        `;
        content.innerHTML += productHtml;
    });

    // PDF options
    const opt = {
        margin: [10, 10],
        filename: 'product-catalog.pdf',
        image: { type: 'jpeg' },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollY: 0,
            letterRendering: true,
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    // Generate PDF
    html2pdf()
        .from(content)
        .set(opt)
        .save()
        .then(() => {
            // Reset button state
            exportButton.innerHTML = originalText;
            exportButton.disabled = false;
            showSuccessAnimation(exportButton);
        })
        .catch(error => {
            console.error('PDF Generation Error:', error);
            alert('Error generating PDF. Please try again.');
            exportButton.innerHTML = originalText;
            exportButton.disabled = false;
        });
}

// Add this function to initialize dark mode on page load
function initializeDarkMode() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const toggleSwitch = document.querySelector('#checkbox');
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Add loading spinner styles
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .fa-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

// Add separate function for adding URL input
function addUrlOption() {
    const urlText = document.createElement('p');
    urlText.textContent = 'Or';
    urlText.className = 'url-text';
    
    if (!dropZone.querySelector('.image-url-input')) {
        addImageUrlInput();
        dropZone.insertBefore(urlText, dropZone.lastChild);
    }
}

// Add a separate button for URL option
const urlOptionButton = document.createElement('button');
urlOptionButton.type = 'button'; // Prevent form submission
urlOptionButton.className = 'url-option-button';
urlOptionButton.textContent = 'Use Image URL Instead';
dropZone.appendChild(urlOptionButton);

urlOptionButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the dropZone click
    addUrlOption();
});

// Update the styles for the new button