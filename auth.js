


const API_URL = "http://localhost:5000/api"

const registerUser = async (formData) => {

    showLoader()
    try {
        const response = await fetch(API_URL + "/users/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.status === 201) {
            hideLoader()
            showOTPVerification(formData.email)
        } else {
            // Handle API errors
            const errorData = await response.json();
            alert(`Registration failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        hideLoader()
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

function showOTPVerification(email) {
    // Hide registration form
    document.getElementById('register-content').style.display = 'none';
    document.getElementById('lightbox-content').style.height = '320px';
    document.getElementById('lightbox-content').style.width = '420px';

    // Create OTP verification section
    const otpSection = document.createElement('div');
    otpSection.id = 'otp-verification';
    otpSection.innerHTML = `
        <div class="otp-container">
            <h2>Verify Your Account</h2>
            <p>Enter the 6-digit OTP sent to ${email}</p>
            <div class="otp-input-container">
                ${[1, 2, 3, 4, 5, 6].map(i => `
                    <input type="text" maxlength="1" class="login-otp-input" id="otp${i}">
                `).join('')}
            </div>
            <div id="error-message" class="error-message"></div>
            <button onclick="verifyOTP('${email}')">Verify</button>
            
        </div>
    `;

    // Add OTP section to lightbox content
    document.getElementById('lightbox-content').appendChild(otpSection);

    // Start OTP input event listeners
    setupOTPInputListeners();

}

// OTP input event listeners
function setupOTPInputListeners() {
    document.querySelectorAll('.login-otp-input').forEach((input, index) => {
        input.addEventListener('input', function () {
            if (this.value.length === 1) {
                if (index < 5) {
                    document.querySelectorAll('.login-otp-input')[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value.length === 0) {
                if (index > 0) {
                    document.querySelectorAll('.login-otp-input')[index - 1].focus();
                }
            }
        });
    });
}

async function checkValidToken() {
    showLoader()
    try {
        const token = localStorage.getItem("token")
        const response = await fetch(API_URL + "/auth/check-token", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            hideLoader()
            document.getElementById('content').style.display = 'flex';
            document.getElementsByTagName("body")[0].style = 'overflow:auto';
            InitialStart()

        } else {
            hideLoader()
            localStorage.removeItem("")
            document.getElementById('lightbox').style.display = 'flex';
            document.getElementById('lightbox-content').style.height = "430px";
            document.getElementById('default-content').style.display = 'none'
            document.getElementById('login-content').style.display = 'block';

        }
    } catch (error) {
        hideLoader()
        console.error('token validation error:', error);
        alert('An error occurred during token validation. Please try again.');
    }
}

// OTP Verification Function
async function verifyOTP(email) {
    const otpInputs = document.querySelectorAll('.login-otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    const errorMsg = document.getElementById('error-message');

    if (otp.length !== 6) {
        errorMsg.textContent = 'Please enter complete OTP';
        return;
    }
    showLoader()
    try {
        const response = await fetch(API_URL + '/users/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                otp,

            })
        });

        if (response.status === 200) {
            console.log('res', response)
            const responseData = await response.json(); // Parse the response body as JSON
            console.log('res', responseData);
            // OTP Verified Successfully
            localStorage.setItem("token", responseData.token)
            localStorage.setItem('userSubmitted', 'true');
            document.getElementById('lightbox').style.display = 'none';
            document.getElementsByTagName("body")[0].style = 'overflow:auto';
            document.getElementById('content').style.display = 'block';
            hideLoader()
            InitialStart();
        } else {
            hideLoader()
            const errorData = await response.json();
            errorMsg.textContent = errorData.message || 'Invalid OTP. Please try again.';
        }
    } catch (error) {
        hideLoader()
        console.error('OTP Verification error:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
    }
}

async function login(formData) {
    showLoader()
    try {
        const response = await fetch(API_URL + "/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.status === 200) {
            hideLoader()
            console.log('res', response)
            const responseData = await response.json(); // Parse the response body as JSON
            console.log('res', responseData);
            localStorage.setItem("token", responseData.token)
            localStorage.setItem('userSubmitted', 'true');
            document.getElementById('lightbox').style.display = 'none';
            document.getElementsByTagName("body")[0].style = 'overflow:auto';
            document.getElementById('content').style.display = 'block';
            InitialStart()
        } else {
            // Handle API errors
            hideLoader()
            const errorData = await response.json();
            alert(`Login failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        hideLoader()
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }

}

function showLoader() {
    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'loader-overlay';
    loaderOverlay.innerHTML = "<div class='spinner'></div>";
    document.body.appendChild(loaderOverlay);
}

function hideLoader() {
    const loaderOverlay = document.querySelector('.loader-overlay');
    if (loaderOverlay) {
        loaderOverlay.remove();
    }
}


async function sendOTP() {
    const email = document.getElementById('forgot-email').value.toLowerCase().trim();

    if (!email) {
        alert('Please enter email');
        return;
    }

    showLoader();

    try {
        const response = await fetch(API_URL + '/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        hideLoader();

        if (response.ok) {
            const data = await response.json();
            userEmail = email;
            otpToken = data.otpToken;

            document.getElementById('email-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';

            startOTPTimer();
        } else {
            const errorData = await response.json();
            alert('Failed to send OTP');
        }
    } catch (error) {
        hideLoader();
        alert('Network error. Try again.');
    }
}

async function verifyResetOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        alert('Enter complete OTP');
        return;
    }

    showLoader();

    try {
        const response = await fetch(API_URL + "/auth/verify-reset-otp", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                otp,
                otpToken
            })
        });

        hideLoader();

        if (response.ok) {
            document.getElementById('otp-section').style.display = 'none';
            document.getElementById('password-section').style.display = 'grid';

        } else {
            const errorData = await response.json();
            alert('Invalid OTP');
        }
    } catch (error) {
        hideLoader();
        alert('Verification failed');
    }
}

async function resetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }

    showLoader();

    try {
        const response = await fetch(API_URL + '/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                password: newPassword
            })
        });

        hideLoader();

        if (response.status === 200) {
            alert('Password Reset Successfully');
            document.getElementById('password-section').style.display = 'none'
            document.getElementById('lightbox').style.display = 'flex';
            document.getElementById('lightbox-content').style.height = "450px";
            document.getElementById('login-content').style.display = 'block';
            // Redirect to login or show login modal
        } else {
            const errorData = await response.json();
            alert('Password reset failed');
        }
    } catch (error) {
        hideLoader();
        alert('Reset failed. Try again.');
    }
}

function startOTPTimer() {
    let timeLeft = 120;
    const timerElement = document.getElementById('timer');

    const timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent =
            `Resend OTP in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = 'Resend OTP';
            timerElement.onclick = sendOTP;
        }
    }, 1000);
}