function addbloomnow(amount_to_add){
  if (localStorage.bloom_s == undefined) {
    localStorage.bloom_s = amount_to_add;
  } else {
    localStorage.bloom_s = Number(localStorage.bloom_s) + amount_to_add;
  }
}
