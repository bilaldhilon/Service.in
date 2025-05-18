// Check if user is logged in
function checkAuth() {
  const token = getCookie("token")
  if (token) {
    $.ajax({
      url: "/api/auth/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        // User is logged in
        const user = response.user

        // Update UI based on role
        if (user.role === "customer") {
          $(".auth-buttons").html(`
            <a href="/customer/dashboard" class="login-btn">Dashboard</a>
            <a href="#" id="logoutBtn" class="signup-btn">Logout</a>
          `)
        } else if (user.role === "provider") {
          $(".auth-buttons").html(`
            <a href="/provider/dashboard" class="login-btn">Dashboard</a>
            <a href="#" id="logoutBtn" class="signup-btn">Logout</a>
          `)
        } else if (user.role === "admin") {
          $(".auth-buttons").html(`
            <a href="/admin/dashboard" class="login-btn">Admin Panel</a>
            <a href="#" id="logoutBtn" class="signup-btn">Logout</a>
          `)
        }

        // Add logout event listener
        $("#logoutBtn").click((e) => {
          e.preventDefault()
          logout()
        })
      },
      error: (error) => {
        // Token invalid or expired, clear it
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      },
    })
  }
}

// Logout function
function logout() {
  $.ajax({
    url: "/api/auth/logout",
    method: "GET",
    success: (response) => {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      window.location.href = "/"
    },
    error: (error) => {
      console.error("Logout error:", error)
    },
  })
}

// Get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
}

// Show alert message
function showAlert(message, type = "success") {
  const alertBox = $('<div class="alert"></div>')
  alertBox.addClass(type === "success" ? "alert-success" : "alert-danger")
  alertBox.text(message)

  // Check if there's a .form-group or form to prepend the alert to
  const container = $(".form-group").first().parent()
  if (container.length > 0) {
    container.prepend(alertBox)
  } else {
    $("form").first().prepend(alertBox)
  }

  // Auto hide after 5 seconds
  setTimeout(() => {
    alertBox.fadeOut("slow", () => {
      alertBox.remove()
    })
  }, 5000)
}

// Form validation
function validateForm(form) {
  let isValid = true

  form.find("input, select, textarea").each(function () {
    const input = $(this)
    const value = input.val().trim()

    // Skip validation for checkboxes and non-required fields
    if (input.attr("type") === "checkbox" || !input.prop("required")) {
      return
    }

    // Email validation
    if (input.attr("type") === "email" && value !== "") {
      const emailRegex = /\S+@\S+\.\S+/
      if (!emailRegex.test(value)) {
        markInvalid(input, "Please enter a valid email address")
        isValid = false
        return
      }
    }

    // Required fields
    if (input.prop("required") && value === "") {
      markInvalid(input, "This field is required")
      isValid = false
      return
    }

    // Password match validation (if there's a confirm password field)
    if (input.attr("id") === "confirmPassword") {
      const password = $("#password").val()
      if (value !== password) {
        markInvalid(input, "Passwords do not match")
        isValid = false
        return
      }
    }

    // Clear any previous validation errors
    markValid(input)
  })

  // Check checkbox agreement if exists
  const agreeTerms = form.find('input[name="agreeTerms"]')
  if (agreeTerms.length && !agreeTerms.prop("checked")) {
    const feedbackElement = $('<div class="invalid-feedback">You must agree to the terms and conditions</div>')
    agreeTerms.addClass("is-invalid")

    if (agreeTerms.next(".invalid-feedback").length === 0) {
      agreeTerms.after(feedbackElement)
    }

    isValid = false
  }

  return isValid
}

// Mark form field as invalid
function markInvalid(input, message) {
  input.addClass("is-invalid")

  // Remove any existing feedback
  if (input.next(".invalid-feedback").length > 0) {
    input.next(".invalid-feedback").text(message)
  } else {
    const feedbackElement = $('<div class="invalid-feedback"></div>').text(message)
    input.after(feedbackElement)
  }
}

// Mark form field as valid
function markValid(input) {
  input.removeClass("is-invalid")
  if (input.next(".invalid-feedback").length > 0) {
    input.next(".invalid-feedback").remove()
  }
}

// Get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
  const results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

$(document).ready(() => {
  // Check authentication status
  checkAuth()

  // Mobile menu toggle
  $("#mobileMenuToggle").click(() => {
    $("#navLinks").toggleClass("show")
  })

  // Set current year for copyright
  $("#currentYear").text(new Date().getFullYear())

  // Active link highlighting
  const currentPath = window.location.pathname
  $(".nav-links a").each(function () {
    const linkHref = $(this).attr("href")
    if (linkHref === currentPath || (currentPath.startsWith(linkHref) && linkHref !== "/")) {
      $(this).addClass("active")
    } else {
      $(this).removeClass("active")
    }
  })

  // Check URL for success or error messages
  const successMsg = getUrlParameter("success")
  const errorMsg = getUrlParameter("error")

  if (successMsg) {
    showAlert(decodeURIComponent(successMsg), "success")
  }

  if (errorMsg) {
    showAlert(decodeURIComponent(errorMsg), "danger")
  }
})
