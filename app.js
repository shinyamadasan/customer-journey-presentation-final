// Customer Journey Presentation Controller - Enhanced Version

class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 8;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideDisplay = document.getElementById('currentSlide');
        this.totalSlidesDisplay = document.getElementById('totalSlides');

        // Analytics tracking
        this.startTime = Date.now();
        this.slideViewTimes = {};
        this.slideEnterTimes = {};

        this.init();
    }

    init() {
        // Set initial state
        this.updateDisplay();
        this.updateButtonStates();
        this.trackSlideEnter(1);

        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeypress(e));

        // Touch/swipe support for mobile
        this.setupTouchNavigation();

        // Set total slides display
        this.totalSlidesDisplay.textContent = this.totalSlides;

        // Setup consultation button if exists
        this.setupConsultationButton();

        // Auto-hide cursor during presentation
        this.setupCursorHiding();

        console.log('🚀 Customer Journey Presentation Ready!');
        console.log(`📊 Total slides: ${this.totalSlides}`);
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.trackSlideExit(this.currentSlide);
            this.currentSlide++;
            this.updateDisplay();
            this.updateButtonStates();
            this.trackSlideEnter(this.currentSlide);
            this.logProgress();
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.trackSlideExit(this.currentSlide);
            this.currentSlide--;
            this.updateDisplay();
            this.updateButtonStates();
            this.trackSlideEnter(this.currentSlide);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides && slideNumber !== this.currentSlide) {
            this.trackSlideExit(this.currentSlide);
            this.currentSlide = slideNumber;
            this.updateDisplay();
            this.updateButtonStates();
            this.trackSlideEnter(this.currentSlide);
        }
    }

    updateDisplay() {
        // Hide all slides with fade effect
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Show current slide with animation
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (currentSlideElement) {
            setTimeout(() => {
                currentSlideElement.classList.add('active');
            }, 100);
        }

        // Update slide counter
        this.currentSlideDisplay.textContent = this.currentSlide;

        // Update page title for better tracking
        document.title = `Customer Journey Automation - Slide ${this.currentSlide}`;
    }

    updateButtonStates() {
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;

        // Update button text for better UX
        if (this.currentSlide === 1) {
            this.nextBtn.innerHTML = 'Start Journey →';
        } else if (this.currentSlide === this.totalSlides) {
            this.prevBtn.innerHTML = '← Back';
            this.nextBtn.innerHTML = 'Finished ✓';
        } else {
            this.prevBtn.innerHTML = '← Previous';
            this.nextBtn.innerHTML = 'Next →';
        }
    }

    handleKeypress(e) {
        // Prevent default behavior for presentation keys
        const presentationKeys = ['ArrowRight', 'ArrowLeft', ' ', 'Enter', 'Escape'];
        if (presentationKeys.includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
                this.nextSlide();
                break;
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'Escape':
                this.exitFullscreen();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
            default:
                // Number keys for direct slide navigation
                const num = parseInt(e.key);
                if (num >= 1 && num <= this.totalSlides) {
                    this.goToSlide(num);
                }
        }
    }

    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const diffX = startX - endX;
            const diffY = startY - endY;

            // Minimum swipe distance
            if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) return;

            // Horizontal swipe is more significant
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }

            // Reset
            startX = 0;
            startY = 0;
        });
    }

    setupConsultationButton() {
        // Look for consultation buttons and add click handlers
        const consultationButtons = document.querySelectorAll('.cta-button, [onclick*="consultation"]');
        consultationButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleConsultationClick();
            });
        });
    }

    handleConsultationClick() {
        // Track the conversion action
        this.trackEvent('consultation_clicked', {
            slide: this.currentSlide,
            time_in_presentation: this.getTotalPresentationTime(),
            slides_viewed: Object.keys(this.slideViewTimes).length
        });

        // You can customize this URL to your actual booking calendar
        const consultationURL = 'https://calendly.com/your-calendar-link';

        // Show a nice confirmation before redirecting
        if (confirm('Ready to schedule your free consultation? This will open your calendar booking page.')) {
            window.open(consultationURL, '_blank');
        }
    }

    setupCursorHiding() {
        let cursorTimeout;

        const hideCursor = () => {
            document.body.style.cursor = 'none';
        };

        const showCursor = () => {
            document.body.style.cursor = 'default';
            clearTimeout(cursorTimeout);
            cursorTimeout = setTimeout(hideCursor, 3000);
        };

        // Show cursor on movement
        document.addEventListener('mousemove', showCursor);
        document.addEventListener('mousedown', showCursor);

        // Initial cursor hide timer
        cursorTimeout = setTimeout(hideCursor, 3000);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => console.log('📺 Entered fullscreen mode'))
                .catch(() => console.log('❌ Fullscreen not supported'));
        } else {
            document.exitFullscreen()
                .then(() => console.log('📱 Exited fullscreen mode'))
                .catch(() => console.log('❌ Exit fullscreen failed'));
        }
    }

    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    // Analytics and tracking methods
    trackSlideEnter(slideNumber) {
        this.slideEnterTimes[slideNumber] = Date.now();
        console.log(`📍 Viewing slide ${slideNumber}`);
    }

    trackSlideExit(slideNumber) {
        if (this.slideEnterTimes[slideNumber]) {
            const timeSpent = Date.now() - this.slideEnterTimes[slideNumber];
            this.slideViewTimes[slideNumber] = (this.slideViewTimes[slideNumber] || 0) + timeSpent;
            console.log(`⏱️ Spent ${Math.round(timeSpent/1000)}s on slide ${slideNumber}`);
        }
    }

    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            timestamp: Date.now(),
            presentation_time: this.getTotalPresentationTime(),
            current_slide: this.currentSlide,
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Here you could send to your analytics service
        // Example: send to GoHighLevel webhook
        // this.sendToWebhook('https://your-ghl-webhook-url', eventData);
    }

    getTotalPresentationTime() {
        return Date.now() - this.startTime;
    }

    logProgress() {
        const progress = Math.round((this.currentSlide / this.totalSlides) * 100);
        console.log(`📈 Presentation progress: ${progress}% (${this.currentSlide}/${this.totalSlides})`);

        // Track significant milestones
        if (this.currentSlide === Math.ceil(this.totalSlides / 2)) {
            this.trackEvent('presentation_halfway');
        }
        if (this.currentSlide === this.totalSlides) {
            this.trackEvent('presentation_completed', {
                total_time: this.getTotalPresentationTime(),
                slides_viewed: Object.keys(this.slideViewTimes).length
            });
        }
    }

    // Method to send data to webhook (optional)
    async sendToWebhook(url, data) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log('✅ Data sent to webhook');
        } catch (error) {
            console.log('❌ Webhook error:', error);
        }
    }

    // Get presentation summary (useful for debugging)
    getPresentationSummary() {
        return {
            currentSlide: this.currentSlide,
            totalSlides: this.totalSlides,
            totalTime: this.getTotalPresentationTime(),
            slideViewTimes: this.slideViewTimes,
            slidesViewed: Object.keys(this.slideViewTimes).length,
            averageTimePerSlide: Object.values(this.slideViewTimes).reduce((a, b) => a + b, 0) / Object.keys(this.slideViewTimes).length || 0
        };
    }
}

// Global function for consultation button (can be called from HTML)
function scheduleConsultation() {
    if (window.presentationController) {
        window.presentationController.handleConsultationClick();
    } else {
        // Fallback if controller isn't loaded
        window.open('https://calendly.com/your-calendar-link', '_blank');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.presentationController = new PresentationController();

    // Add some helpful console messages
    console.log('🎯 Customer Journey Presentation Loaded!');
    console.log('💡 Keyboard shortcuts:');
    console.log('   → or Space: Next slide');
    console.log('   ←: Previous slide');
    console.log('   F: Toggle fullscreen');
    console.log('   1-8: Jump to specific slide');
    console.log('   Esc: Exit fullscreen');
    console.log('📱 Mobile: Swipe left/right to navigate');
});

// Handle page visibility changes (useful for tracking)
document.addEventListener('visibilitychange', () => {
    if (window.presentationController) {
        const event = document.hidden ? 'presentation_hidden' : 'presentation_visible';
        window.presentationController.trackEvent(event);
    }
});

// Handle beforeunload to track early exits
window.addEventListener('beforeunload', () => {
    if (window.presentationController) {
        const summary = window.presentationController.getPresentationSummary();
        console.log('📊 Final presentation summary:', summary);
        // Could send final analytics here
    }
});