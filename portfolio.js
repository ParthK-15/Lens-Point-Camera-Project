/* GLOBAL VARIABLES */
let stars = [];
let selectedRating = 0;

/* WAIT FOR PAGE LOAD */
document.addEventListener("DOMContentLoaded", function(){

  stars = document.querySelectorAll(".stars-input i");

  /* STAR CLICK */
  stars.forEach((star, index)=>{
    star.addEventListener("click", ()=>{
      selectedRating = index + 1;

      stars.forEach(s=>s.classList.remove("active"));

      for(let i=0;i<=index;i++){
        stars[i].classList.add("active");
      }
    });
  });

});

/* ADD REVIEW FUNCTION (GLOBAL) */
window.addReview = function(){

  const name = document.getElementById("nameInput").value.trim();
  const text = document.getElementById("reviewInput").value.trim();
  const reviewList = document.getElementById("reviewList");

  if(name === "" || text === ""){
    alert("Please fill all fields");
    return;
  }

  if(selectedRating === 0){
    alert("Please select rating");
    return;
  }

  const starsDisplay = "★".repeat(selectedRating) + "☆".repeat(5-selectedRating);

  const div = document.createElement("div");
  div.className = "review-item";

  div.innerHTML = `
    <p>"${text}"</p>
    <div class="review-stars">${starsDisplay}</div>
    <p class="review-name">- ${name}</p>
  `;

  reviewList.appendChild(div);

  /* RESET */
  document.getElementById("nameInput").value = "";
  document.getElementById("reviewInput").value = "";
  selectedRating = 0;
  stars.forEach(s=>s.classList.remove("active"));
};

/* DARK / LIGHT MODE */
const toggle = document.getElementById("modeToggle");

toggle.addEventListener("click", function(){
  document.body.classList.toggle("light");

  if(document.body.classList.contains("light")){
    toggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    toggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});