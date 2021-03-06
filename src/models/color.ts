export const colors = [
  "#15a0bf",
  "#0669f7",
  "#8e00c2",
  "#c517b6",
  "#d90171",
  "#cd0101",
  "#f25d2e",
  "#f2ca33",
  "#7bd938",
  "#2ece9d",
];

export class Color {
  r: number;
  g: number;
  b: number;
  static parseHex(inString: string): Color {
    let color = new Color(0, 0, 0);
    color.setHex(inString);
    return color;
  }

  constructor(r: any, g: any, b: any) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  setHex(value: string): void {
    let parsed = value.split("#");
    if (parsed.length > 1 && parsed[1].length === 6) {
      let segment1 = parsed[1].substring(0, 2);
      let segment2 = parsed[1].substring(2, 4);
      let segment3 = parsed[1].substring(4, 6);
      this.r = parseInt(segment1, 16);
      this.g = parseInt(segment2, 16);
      this.b = parseInt(segment3, 16);
    }
  }
  get stringValue() {
    return `rgba(${this.r},${this.g},${this.b},1)`;
  }
}
