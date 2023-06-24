declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.less' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*?raw' {
  const content: string;
  export default content;
}

declare module '*?url' {
  const content: string;
  export default content;
}
