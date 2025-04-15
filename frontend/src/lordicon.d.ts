declare global {
    namespace JSX {
      interface IntrinsicElements {
        'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
    interface Window {
      Lordicon: any;
    }
  }
  