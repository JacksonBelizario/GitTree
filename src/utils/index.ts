export const isSSH = (url: string) => {
  return !(url.startsWith("http://") || url.startsWith("https://"));
};

export const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + (((hash << 4) + hash * 2) >> 2);
  }
  return hash;
};

export const scrollTo = (hash: string) => {
  const element = document.getElementById(hash);
  // if (element) element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
  const container = document.querySelector(".scrollbar-container");
  if (container && element) {
    //container.scrollTop = element.offsetTop;
    container.scrollTo({ top: element.offsetTop, behavior: "smooth" });
  }
};

export const getAuthor = (author: string) => {
  let firstChars = author
    .split(" ")
    .map((n) => (n.length > 0 ? n[0].toUpperCase() : ""));
  let name = "";
  firstChars.forEach((f) => {
    if (f > "A" && f < "Z" && name.length < 2) {
      name += f;
    }
  });
  return name;
};