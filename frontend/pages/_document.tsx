import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.NEXT_PUBLIC_API_URL = "${process.env.NEXT_PUBLIC_API_URL}";
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
