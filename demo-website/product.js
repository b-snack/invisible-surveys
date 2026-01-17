// Product page functionality for TechStore demo
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    let cartCount = 0;
    const cartCountElement = document.querySelector('.cart-count');
    
    // Quantity selector functionality
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.querySelector('.quantity-input');
    
    decreaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > 10) {
            this.value = 10;
        }
    });
    
    // Add to cart functionality
    const addToCartBtn = document.getElementById('add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        const quantity = parseInt(quantityInput.value);
        cartCount += quantity;
        updateCartCount();
        
        // Show feedback
        showNotification(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
        
        // Simulate API call delay
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        setTimeout(() => {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }, 1000);
    });
    
    // Buy now functionality
    const buyNowBtn = document.getElementById('buy-now');
    buyNowBtn.addEventListener('click', function() {
        const quantity = parseInt(quantityInput.value);
        cartCount += quantity;
        updateCartCount();
        
        // Show purchase modal
        showPurchaseModal(quantity);
    });
    
    // View buttons for related products
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.parentElement.querySelector('h3').textContent;
            showNotification(`Viewing details for: ${productName}`);
            
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
    // Helper functions
    function updateCartCount() {
        cartCountElement.textContent = cartCount;
        if (cartCount > 0) {
            cartCountElement.style.display = 'inline-block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--accent-green);
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    function showPurchaseModal(quantity) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'purchase-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Complete Your Purchase</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="purchase-summary">
                        <i class="fas fa-shopping-bag"></i>
                        <h4>QuantumSound Pro Wireless Headphones</h4>
                        <p>Quantity: ${quantity}</p>
                        <p class="total-price">Total: $${(299.99 * quantity).toFixed(2)}</p>
                    </div>
                    <p>You will be redirected to our secure checkout page...</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn">Cancel</button>
                    <button class="modal-btn confirm-btn">Proceed to Checkout</button>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background-color: var(--background-primary);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            max-width: 500px;
            width: 90%;
            box-shadow: var(--shadow-lg);
            animation: scaleIn 0.3s ease;
        `;
        
        // Add animations
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(modalStyle);
        
        document.body.appendChild(modal);
        
        // Modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        function closeModal() {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Simulate checkout process
            setTimeout(() => {
                closeModal();
                showNotification('Purchase completed successfully!');
            }, 2000);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Initialize cart count display
    updateCartCount();
    
    console.log('TechStore product page initialized');
    console.log('Pulse Tracker is automatically tracking user behavior');
});
