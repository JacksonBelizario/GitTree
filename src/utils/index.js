export const isSSH = url => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return false;
    } else {
        return true;
    }
}

export const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + (((hash << 4) + hash * 2) >> 2);
    }
    return hash;
}