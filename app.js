const check = document.getElementById("check");

check.addEventListener("change", function () {
    if (this.checked) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }
});