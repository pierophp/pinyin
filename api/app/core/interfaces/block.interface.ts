export interface BlockInterface {
  line?: {
    type?: string;
    pinyin_source?: string;
  };
  c: string;
  p: string;
  b?: string;
  v?: number;
  large?: string;
  small?: string;
  trans?: string;
  footnote?: string;
  isBold?: number;
  isItalic?: number;
}
