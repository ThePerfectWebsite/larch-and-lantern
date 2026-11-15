/* Contact (demo): validates, then confirms without sending or storing anything. */
(function () {
  "use strict";
  var LL = window.LL;
  var f = document.getElementById("contact-form"), box = document.getElementById("contact-errors"), status = document.getElementById("contact-status");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var errs = [];
    var name = f.elements.name, email = f.elements.email, msg = f.elements.message;
    [name, email, msg].forEach(function (i) { i.removeAttribute("aria-invalid"); });
    if (!name.value.trim()) errs.push([name, "Enter your name."]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errs.push([email, "Enter an email address like name@example.com."]);
    if (!msg.value.trim()) errs.push([msg, "Enter a message."]);
    if (errs.length) {
      errs.forEach(function (x) { x[0].setAttribute("aria-invalid", "true"); });
      box.innerHTML = '<div class="error-summary" role="alert" tabindex="-1"><h2>Please check the following</h2><ul>' + errs.map(function (x) { return '<li><a href="#' + x[0].id + '">' + LL.esc(x[1]) + "</a></li>"; }).join("") + "</ul></div>";
      box.firstChild.focus();
      status.textContent = "";
      return;
    }
    box.innerHTML = "";
    var first = name.value.trim().split(" ")[0];
    f.reset();
    status.className = "cal-msg is-ok";
    status.textContent = "Thanks, " + first + ". This is a demo, so your message hasn't been sent anywhere. On the real site, the owners would reply within a day.";
  });
})();
