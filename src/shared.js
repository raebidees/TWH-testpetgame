function getDissolvingRS(parent, amount, chance){
  return function () {
    if(Math.random() > chance){
      return;
    }
    addbloomnow(amount);
    let p = document.createElement("p");
    p.innerHTML = "+" + amount + " blooms";
    p.className = "blooms_message";
    //p.style.position = 'absolute';
    //p.style.top = `${e.clientY}`;
    //p.style.left = `${e.clientX}`;
    parent.appendChild(p);
    const anim = p.animate([
      {
        transform: `translate(0px, 0px)`,
        opacity: 1
      },
      {
        transform: `translate(0px, -50px)`,
        opacity: 0
      }
    ], {
      duration: 1000,
      easing: 'linear',
    });
    anim.onfinish = () => { p.remove() };
  }.bind(parent, amount, chance);
}


function addbloomnow(amount_to_add){
  if (localStorage.bloom_s == undefined) {
    localStorage.bloom_s = amount_to_add;
  } else {
    localStorage.bloom_s = Number(localStorage.bloom_s) + amount_to_add;
  }
}
