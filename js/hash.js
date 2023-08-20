function graph(content, postItem) {
    let width = postItem.clientWidth / 3;
    for (let index = 0; index < min(content.length, width); index++) {
        let num = min(content.charCodeAt(index), 128);
        num = normalize(num);
        let div = document.createElement("div");
        div.style.width = "1px";
        div.style.height = `${num}px`;
        div.style.backgroundColor = "black";
        div.style.borderRadius = "0 0 7px 7px";
        postItem.appendChild(div);
    }
}

function display(content, klass) {
    const postItem = document.getElementsByClassName(klass)[0];
    return graph(content, postItem);
}

function normalize(number) {
    let scale = window.innerHeight < 500 ? 5 : 9;
    scale = window.innerWidth < 500 ? 5 : scale;
    return Math.floor((number / 128) * scale);
}

function min(x, y) {
    return x > y ? y : x;
}