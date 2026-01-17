// Payment buttons functionality with intentional non-responsive buttons
document.addEventListener('DOMContentLoaded', function() {
    const paymentButtonsContainer = document.getElementById('payment-buttons');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Payment methods data
    const paymentMethods = [
        { id: 'visa', name: 'Visa', icon: 'fab fa-cc-visa', color: '#1a1f71', responsive: true },
        { id: 'mastercard', name: 'Mastercard', icon: 'fab fa-cc-mastercard', color: '#eb001b', responsive: true },
        { id: 'amex', name: 'American Express', icon: 'fab fa-cc-amex', color: '#2e77bc', responsive: true },
        { id: 'paypal', name: 'PayPal', icon: 'fab fa-cc-paypal', color: '#003087', responsive: true },
        { id: 'applepay', name: 'Apple Pay', icon: 'fab fa-apple-pay', color: '#000000', responsive: false }, // Non-responsive
        { id: 'googlepay', name: 'Google Pay', icon: 'fab fa-google-pay', color: '#5f6368', responsive: false }, // Non-responsive
        { id: 'amazonpay', name: 'Amazon Pay', icon: 'fab fa-amazon-pay', color: '#ff9900', responsive: false }, // Non-responsive
        { id: 'bitcoin', name: 'Bitcoin', icon: 'fab fa-bitcoin', color: '#f7931a', responsive: false }, // Non-responsive
        { id: 'banktransfer', name: 'Bank Transfer', icon: 'fas fa-university', color: '#34a853', responsive: true },
        { id: 'cashondelivery', name: 'Cash on Delivery', icon: 'fas fa-money-bill-wave', color: '#0f9d58', responsive: true },
        { id: 'giftcard', name: 'Gift Card', icon: 'fas fa-gift', color: '#ea4335', responsive: false }, // Non-responsive
        { id: 'cryptowallet', name: 'Crypto Wallet', icon: 'fas fa-wallet', color: '#4285f4', responsive: false } // Non-responsive
    ];
    
    let selectedPaymentMethod = null;
    
    // Generate payment buttons
    paymentMethods.forEach(method => {
        const button = document.createElement('button');
        button.className = `payment-btn ${method.responsive ? '' : 'disabled'}`;
        button.id = `payment-${method.id}`;
        button.innerHTML = `
            <i class="${method.icon}"></i>
            <span>${method.name}</span>
        `;
        
        // Add click handler
        button.addEventListener('click', function() {
            if (!method.responsive) {
                // Non-responsive button - trigger rage click scenario
                handleNonResponsiveButton(this, method);
                return;
            }
            
            // Select responsive button
            selectPaymentButton(this, method);
        });
        
        paymentButtonsContainer.appendChild(button);
    });
    
    // Checkout button handler
    checkoutBtn.addEventListener('click', function() {
        if (!selectedPaymentMethod) {
            showPaymentError('Please select a payment method first');
            return;
        }
        
        // Simulate checkout process
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
        
        setTimeout(() => {
            if (Math.random() > 0.3) { // 70% success rate
                showPaymentSuccess('Payment successful! Your order is being processed.');
                this.innerHTML = '<i class="fas fa-check"></i> Payment Complete!';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-lock"></i> Complete Purchase - $299.99';
                    resetPaymentSelection();
                }, 3000);
            } else {
                showPaymentError('Payment failed. Please try another method.');
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-lock"></i> Complete Purchase - $299.99';
            }
        }, 2000);
    });
    
    // Helper functions
    function selectPaymentButton(button, method) {
        // Remove active class from all buttons
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        button.classList.add('active');
        selectedPaymentMethod = method;
        
        // Update checkout button text
        checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Pay with ${method.name} - $299.99`;
        
        // Show selection feedback
        showPaymentFeedback(`Selected: ${method.name}`);
    }
    
    function handleNonResponsiveButton(button, method) {
        // Add visual feedback for non-responsive button
        button.classList.add('error');
        button.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${method.name} (Unavailable)</span>
        `;
        
        // Show error message
        showPaymentError(`${method.name} is currently unavailable. Please try another payment method.`);
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.classList.remove('error');
            button.innerHTML = `
                <i class="${method.icon}"></i>
                <span>${method.name}</span>
            `;
        }, 2000);
        
        // Track rage click potential
        trackRageClickAttempt(button, method);
    }
    
    function trackRageClickAttempt(button, method) {
        // This would be tracked by the Pulse Tracker automatically
        // Additional logging for demo purposes
        console.log(`Non-responsive button clicked: ${method.name}`);
        console.log('This may trigger rage click detection if clicked multiple times');
    }
    
    function showPaymentFeedback(message) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'payment-feedback';
        feedback.textContent = message;
        
        // Style the feedback
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--accent-blue);
            color: white;
            padding: 10px 20px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-md);
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(feedback);
        
        // Remove after 2 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }
    
    function showPaymentError(message) {
        // Create error element
        const error = document.createElement('div');
        error.className = 'payment-error';
        error.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        // Style the error
        error.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--accent-red);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDownError 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDownError {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes slideUpError {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(error);
        
        // Remove after 3 seconds
        setTimeout(() => {
            error.style.animation = 'slideUpError 0.3s ease';
            setTimeout(() => {
                if (error.parentNode) {
                    error.parentNode.removeChild(error);
                }
            }, 300);
        }, 3000);
    }
    
    function showPaymentSuccess(message) {
        // Create success element
        const success = document.createElement('div');
        success.className = 'payment-success';
        success.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        // Style the success
        success.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--accent-green);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDownError 0.3s ease;
        `;
        
        document.body.appendChild(success);
        
        // Remove after 3 seconds
        setTimeout(() => {
            success.style.animation = 'slideUpError 0.3s ease';
            setTimeout(() => {
                if (success.parentNode) {
                    success.parentNode.removeChild(success);
                }
            }, 300);
        }, 3000);
    }
    
    function resetPaymentSelection() {
        selectedPaymentMethod = null;
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Purchase - $299.99';
    }
    
    // Add CSS for error state
    const paymentStyles = document.createElement('style');
    paymentStyles.textContent = `
        .payment-btn.error {
            border-color: var(--accent-red) !important;
            background-color: rgba(255, 59, 48, 0.1) !important;
            color: var(--accent-red) !important;
        }
        
        .payment-btn.error:hover {
            border-color: var(--accent-red) !important;
            background-color: rgba(255, 59, 48, 0.2) !important;
        }
        
        .payment-btn.active {
            border-color: var(--accent-blue) !important;
            background-color: rgba(0, 122, 255, 0.1) !important;
            color: var(--accent-blue) !important;
        }
        
        .payment-btn.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .payment-btn.disabled:hover {
            border-color: var(--border-color) !important;
            background-color: var(--background-primary) !important;
        }
    `;
    document.head.appendChild(paymentStyles);
    
    console.log('Payment buttons initialized');
    console.log('Non-responsive buttons: Apple Pay, Google Pay, Amazon Pay, Bitcoin, Gift Card, Crypto Wallet');
    console.log('These will trigger rage click scenarios for testing Pulse Tracker');
});
