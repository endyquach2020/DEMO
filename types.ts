
export interface McqQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface TrueFalseStatement {
  text: string;
  isCorrect: boolean;
}

export interface TrueFalseQuestion {
  question: string;
  statements: TrueFalseStatement[];
}

export interface FillBlankQuestion {
  question: string;
  answer: string;
}

export interface QuizSections {
  trac_nghiem: McqQuestion[];
  dung_sai: TrueFalseQuestion[];
  dien_so: FillBlankQuestion[];
}

export interface Lesson {
  id: number;
  title: string;
  raw_html: string;
  sections: QuizSections;
}

export enum GameMode {
  TRAC_NGHIEM = 'TRAC_NGHIEM',
  DUNG_SAI = 'DUNG_SAI',
  DIEN_SO = 'DIEN_SO',
  LY_THUYET = 'LY_THUYET'
}
