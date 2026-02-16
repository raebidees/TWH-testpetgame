function addfoodpoints(amount_to_add){
  if (localStorage.food_points == undefined) {
    localStorage.food_points = amount_to_add;
  } else {
    localStorage.food_points = Number(localStorage.food_points) + amount_to_add;
  }
}


function getfoodpoints(){
  if (localStorage.food_points == undefined) {
    localStorage.food_points = 10;
  }
  return Number(localStorage.food_points);
}
