export interface ParserResponseInterface {
  text: any[];
  links?: {
    link: string;
    number: string;
    title: string;
    title_pinyin: string;
  }[];
  audio?: string;
}
