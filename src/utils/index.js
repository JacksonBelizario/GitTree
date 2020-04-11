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

export const intToRGB = i => {
    let c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

export const generateColor = (text) => {
    return `#${intToRGB(hashCode(text))}`;
}