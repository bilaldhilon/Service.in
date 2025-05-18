$(document).ready(() => {
  // Toggle sidebar on mobile
  $(".sidebar-toggle").on("click", () => {
    $(".sidebar").toggleClass("sidebar-open")
    $(".main-content").toggleClass("main-content-shifted")
  })

  // Collapse/expand sidebar sections
  $(".sidebar-section-header").on("click", function () {
    $(this).next(".sidebar-section-content").slideToggle(200)
    $(this).find(".sidebar-section-icon").toggleClass("rotate-icon")
  })

  // Handle active menu item
  const currentPath = window.location.pathname
  $(".sidebar-menu-item a").each(function () {
    const linkPath = $(this).attr("href")
    if (currentPath === linkPath || (currentPath.startsWith(linkPath) && linkPath !== "/")) {
      $(this).addClass("active")
      // Expand the parent section if it's collapsed
      $(this).closest(".sidebar-section-content").show()
    }
  })

  // Check user role and update sidebar accordingly
  function updateSidebarByRole() {
    $.ajax({
      url: "/api/auth/me",
      method: "GET",
      success: (response) => {
        const user = response.user

        // Update user info in sidebar
        $(".sidebar-user-name").text(user.name)
        $(".sidebar-user-email").text(user.email)
        $(".sidebar-user-role").text(user.role.charAt(0).toUpperCase() + user.role.slice(1))

        // Show role-specific sections
        $(`.sidebar-section[data-role="${user.role}"]`).show()
        $(`.sidebar-section[data-role="all"]`).show()
      },
      error: (error) => {
        console.error("Error fetching user data:", error)
      },
    })
  }

  // Call the function to update sidebar
  updateSidebarByRole()
})
