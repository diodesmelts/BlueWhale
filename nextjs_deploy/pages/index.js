import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Blue Whale Competitions</title>
        <meta name="description" content="Blue Whale Competitions - Your competition tracking platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Blue Whale Competitions
        </h1>

        <p className="description">
          Your premier destination for discovering and participating in exciting competitions and prize draws.
        </p>

        <div className="grid">
          <div className="card">
            <h2>Discover Competitions</h2>
            <p>Browse through a curated list of verified competitions across various platforms and categories.</p>
          </div>

          <div className="card">
            <h2>Track Deadlines</h2>
            <p>Never miss an entry deadline with our real-time countdown timers for each competition.</p>
          </div>

          <div className="card">
            <h2>Personalized Experience</h2>
            <p>Create a profile to track your competition entries, wins, and receive personalized recommendations.</p>
          </div>
        </div>

        <div className="api-test">
          <h2>API Status</h2>
          <p>Check if the API is working by visiting: <code>/api/status</code></p>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 Blue Whale Competitions</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f0f8ff;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          text-align: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #006590;
          color: white;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          color: #0092d1;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 1rem 0 2rem;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 2rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          background-color: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          color: #0092d1;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .api-test {
          margin-top: 3rem;
          padding: 1.5rem;
          width: 100%;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        code {
          background: #f0f0f0;
          border-radius: 5px;
          padding: 0.5rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }

          .title {
            font-size: 2.5rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}