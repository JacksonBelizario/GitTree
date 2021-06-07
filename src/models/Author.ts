import * as crypto from 'crypto'
import { getMaterialColors } from "../Support/Colors";
import { IRepo } from '../Support/Interfaces';

export class Author {

  static getAcronym = (author: string) => {
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

  static getColors = (email) => {
    const authorColor = getMaterialColors(email);
    return {
      backgroundColor: authorColor.backgroundColor,
      color: authorColor.color,
    };
  };

  static getAvatar = (
    gitHubRepository: IRepo | null,
    email: string
  ) => {
    // TODO: Verify if endpoint is from Github
    return `https://avatars.githubusercontent.com/u/e?email=${encodeURIComponent(
      email
    )}&s=60`

    // return Author.generateGravatarUrl(email);
  }
  
  /**
   * Convert an email address to a Gravatar URL format
   *
   * @param email The email address associated with a user
   * @param size The size (in pixels) of the avatar to render
   */
  static generateGravatarUrl(email: string, size: number = 60): string {
    const input = email.trim().toLowerCase()
    const hash = crypto
      .createHash('md5')
      .update(input)
      .digest('hex')

    return `https://www.gravatar.com/avatar/${hash}?s=${size}`
  }
}