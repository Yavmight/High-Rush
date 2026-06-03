const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const submitAuthBtn = document.getElementById("submitAuthBtn");
const authMessage = document.getElementById("authMessage");
const toggleAuthMode = document.getElementById("toggleAuthMode");
const authTitle = document.getElementById("authTitle");
const authToggleText = document.getElementById("authToggleText");

let isLoginMode = true;

toggleAuthMode.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;

  authTitle.innerText = isLoginMode ? "Login to High Rush" : "Create Account";
  submitAuthBtn.innerText = isLoginMode ? "Login" : "Register";
  authToggleText.innerText = isLoginMode
    ? "Need an account?"
    : "Already have an account?";
  toggleAuthMode.innerText = isLoginMode ? "Register here" : "Login here";
  authMessage.innerText = "";
});

submitAuthBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password)
    return (authMessage.innerText = "Please fill in all fields.");

  const endpoint = isLoginMode ? "/login" : "/register";

  try {
    const response = await fetch(`http://127.0.0.1:3000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      if (isLoginMode && data.user) {
        localStorage.setItem("high_rush_user", data.user.username);
        // THE REDIRECT: Send them to the game!
        window.location.href = "/public/index.html";
      } else {
        authMessage.style.color = "#00ff00";
        authMessage.innerText = "Registration successful! Please login.";
        setTimeout(() => toggleAuthMode.click(), 1500); // Switch to login mode
      }
    } else {
      authMessage.style.color = "#ff4500";
      authMessage.innerText =
        data.error || data.message || "An error occurred.";
    }
  } catch (error) {
    authMessage.innerText = "Server error. Try again later.";
  }
});
