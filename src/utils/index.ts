export const isSSH = (url : string) => {
    return !(url.startsWith('http://') || url.startsWith('https://'));
}

export const hashCode = (str : string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + (((hash << 4) + hash * 2) >> 2);
    }
    return hash;
}