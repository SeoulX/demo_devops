import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              Test = "_document";
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
