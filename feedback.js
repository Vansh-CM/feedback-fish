(function() {
    'use strict';

    // This is the hardcoded API endpoint where the feedback will be sent.
    const API_ENDPOINT = 'https://your-backend-api.com/v1/feedback';

    /**
     * This function runs once the host page's DOM is fully loaded.
     * It's the main entry point for creating and activating the feedback tool.
     */
    function initializeFeedbackWidget() {

        // 1. --- INJECT CSS ---
        // All necessary styles are defined here and injected into the page's <head>.
        // Note: Styles for the trigger button have been removed as you will provide your own.
        const css = `
            :root {
                --feedback-primary-color: #007bff;
                --feedback-primary-hover: #0056b3;
                --feedback-success-color: #28a745;
                --feedback-error-color: #dc3545;
            }
            .feedback-modal {
                display: none;
                position: fixed;
                z-index: 9999;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: hidden; /* Prevent scrollbars during animation */
                background-color: rgba(0,0,0,0.5);
                -webkit-animation: fadeIn 0.3s;
                animation: fadeIn 0.3s;
            }
            .feedback-modal-content {
                position: absolute;
                top: 20px;
                right: 20px;
                background-color: #fefefe;
                padding: 25px;
                border: 1px solid #888;
                width: 90%;
                max-width: 450px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                -webkit-animation: slideInFromRight 0.4s;
                animation: slideInFromRight 0.4s;
            }
            .feedback-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .feedback-modal-header h2 {
                margin: 0;
                font-size: 22px;
                color: #333;
            }
            .feedback-close-btn {
                color: #aaa;
                font-size: 32px;
                font-weight: bold;
                cursor: pointer;
                transition: color 0.2s ease;
            }
            .feedback-close-btn:hover,
            .feedback-close-btn:focus {
                color: #333;
                text-decoration: none;
            }
            #feedback-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            #feedback-form label {
                font-weight: bold;
                font-size: 14px;
                color: #555;
            }
            #feedback-form textarea, #feedback-form input[type="file"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
                font-size: 16px;
                font-family: inherit;
            }
            #feedback-form textarea {
                resize: vertical;
                min-height: 100px;
            }
            #feedback-form button[type="submit"] {
                background-color: var(--feedback-primary-color);
                color: white;
                padding: 12px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: background-color 0.2s ease-in-out;
            }
            #feedback-form button[type="submit"]:hover {
                background-color: var(--feedback-primary-hover);
            }
            #feedback-form button[type="submit"]:disabled {
                background-color: #999;
                cursor: not-allowed;
            }
            .feedback-message {
                text-align: center;
                font-size: 14px;
                padding: 10px;
                border-radius: 4px;
                display: none;
            }
            .feedback-message.success {
                color: var(--feedback-success-color);
                background-color: #e9f7ef;
                display: block;
            }
            .feedback-message.error {
                color: var(--feedback-error-color);
                background-color: #fce8e6;
                display: block;
            }
            @-webkit-keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
            @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
            @-webkit-keyframes slideInFromRight { from {transform: translateX(100%);} to {transform: translateX(0);} }
            @keyframes slideInFromRight { from {transform: translateX(100%);} to {transform: translateX(0);} }
        `;
        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.appendChild(document.createTextNode(css));
        document.head.appendChild(styleTag);


        // 2. --- INJECT HTML ---
        // The HTML for the modal is created here. The trigger button is NOT injected.
        const html = `
            <div id="feedback-modal" class="feedback-modal">
                <div class="feedback-modal-content">
                    <div class="feedback-modal-header">
                        <h2>Submit Feedback</h2>
                        <span id="feedback-close-btn" class="feedback-close-btn">&times;</span>
                    </div>
                    <form id="feedback-form" novalidate>
                        <label for="feedback-text">Your Feedback:</label>
                        <textarea id="feedback-text" name="feedbackText" rows="5" required placeholder="Tell us what you think..."></textarea>
                        <label for="feedback-image">Attach an image (optional):</label>
                        <input type="file" id="feedback-image" name="feedbackImage" accept="image/*">
                        <div id="feedback-message" class="feedback-message"></div>
                        <button type="submit">Send Feedback</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);


        // 3. --- ATTACH EVENT LISTENERS AND LOGIC ---
        // Find the user-provided trigger button and attach the event listener.
        const triggerButton = document.getElementById('open-feedback-widget-button');
        const modal = document.getElementById('feedback-modal');
        const closeBtn = document.getElementById('feedback-close-btn');
        const form = document.getElementById('feedback-form');
        const messageDiv = document.getElementById('feedback-message');
        const submitButton = form.querySelector('button[type="submit"]');

        // Function to open the modal
        const openModal = (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        };

        // Function to close the modal and reset its state
        const closeModal = () => {
            modal.style.display = 'none';
            messageDiv.textContent = '';
            messageDiv.className = 'feedback-message';
            form.reset();
        };

        // --- Event Handlers ---

        if (triggerButton) {
            triggerButton.addEventListener('click', openModal);
        } else {
            console.warn('Feedback Widget: A trigger element with id="open-feedback-widget-button" was not found. The feedback modal cannot be opened.');
            return; // Stop execution if no trigger is found
        }
        
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        // Form submission handler
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission (page reload)

            // Basic validation
            if (form.feedbackText.value.trim() === '') {
                messageDiv.textContent = 'Feedback text cannot be empty.';
                messageDiv.className = 'feedback-message error';
                return;
            }
            
            // Construct FormData from the form element
            const formData = new FormData(form);
            // Append the current page URL as specified
            formData.append('pageUrl', window.location.href);

            // Update UI to show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            messageDiv.textContent = '';
            messageDiv.className = 'feedback-message';

            // Perform the API call
            fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData, // Browser automatically sets the correct Content-Type for FormData
            })
            .then(response => {
                if (!response.ok) {
                    // If the server returns an error, create an error object to be caught below
                    return response.json().then(err => { throw new Error(err.message || 'Server responded with an error.') });
                }
                return response.json();
            })
            .then(data => {
                // Handle success
                messageDiv.textContent = 'Thank you for your feedback!';
                messageDiv.className = 'feedback-message success';
                form.reset(); // Clear the form fields

                // Close the modal after a short delay
                setTimeout(closeModal, 2000);
            })
            .catch(error => {
                // Handle failure (network error or server error)
                console.error('Feedback submission failed:', error);
                messageDiv.textContent = 'Failed to send feedback. Please try again.';
                messageDiv.className = 'feedback-message error';
            })
            .finally(() => {
                // Always re-enable the button, regardless of outcome
                submitButton.disabled = false;
                submitButton.textContent = 'Send Feedback';
            });
        });
    }

    // Ensure the script runs after the main document is loaded to avoid DOM errors.
    // This works with `defer` and also if the script is placed at the end of the body.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFeedbackWidget);
    } else {
        // DOMContentLoaded has already fired
        initializeFeedbackWidget();
    }

})();