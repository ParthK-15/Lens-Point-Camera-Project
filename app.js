const check = document.getElementById("check");

check.addEventListener("change", function () {
    if (this.checked) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }
});

const tagline = document.querySelector(".tag_line");

window.addEventListener("load",()=>{
    tagline.style.opacity="0";
    tagline.style.transform="translateY(50px)";

    setTimeout(()=>{
        tagline.style.transition="1s";
        tagline.style.opacity="1";
        tagline.style.transform="translateY(0)";
    },200);
});