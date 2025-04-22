// HTML landing page content
const landingPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blue Whale Competitions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a192f;
      --text-primary: #ffffff;
      --accent: #64ffda;
      --secondary: #8892b0;
      --gradient-start: #4a00e0;
      --gradient-end: #8e2de2;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    header {
      padding: 2rem 1rem;
      display: flex;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--accent);
    }
    
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      text-align: center;
    }
    
    .container {
      max-width: 800px;
      width: 100%;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }
    
    p {
      font-size: 1.125rem;
      color: var(--secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .status {
      background: rgba(100, 255, 218, 0.1);
      padding: 1rem 2rem;
      border-radius: 4px;
      border-left: 4px solid var(--accent);
      font-size: 1rem;
      margin-bottom: 2rem;
      text-align: left;
    }
    
    .status h2 {
      color: var(--accent);
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }
    
    .status p {
      font-size: 0.875rem;
      margin-bottom: 0;
      color: var(--text-primary);
      opacity: 0.8;
    }
    
    .competitions-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 3rem;
    }
    
    .competition-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .competition-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .card-image {
      height: 180px;
      width: 100%;
      background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .card-title {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      color: var(--text-primary);
    }
    
    .card-category {
      display: inline-block;
      font-size: 0.75rem;
      background-color: rgba(100, 255, 218, 0.2);
      color: var(--accent);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .card-price {
      font-weight: 700;
      color: var(--accent);
      display: block;
      margin-bottom: 1rem;
    }
    
    .coming-soon {
      margin-top: 2rem;
      font-size: 1.25rem;
      color: var(--accent);
      font-weight: 600;
    }
    
    footer {
      padding: 2rem 1rem;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--secondary);
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      
      .competitions-preview {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">Blue Whale Competitions</div>
  </header>
  
  <main>
    <div class="container">
      <h1>Your Source for Amazing Competitions</h1>
      <p>Discover and participate in exciting competitions. Win incredible prizes including electronics, cash rewards, family experiences, and much more!</p>
      
      <div class="status">
        <h2>Deployment Status</h2>
        <p>We're currently updating our platform to bring you the best competition experience. Check back soon to see our full collection of competitions.</p>
      </div>
      
      <div class="competitions-preview">
        <div class="competition-card">
          <div class="card-image">Air Fryer</div>
          <div class="card-content">
            <span class="card-category">Appliances</span>
            <h3 class="card-title">Win a Ninja Air Fryer</h3>
            <span class="card-price">£4.99 per ticket</span>
          </div>
        </div>
        
        <div class="competition-card">
          <div class="card-image">Cash Prize</div>
          <div class="card-content">
            <span class="card-category">Cash</span>
            <h3 class="card-title">£500 Cash Giveaway</h3>
            <span class="card-price">£3.49 per ticket</span>
          </div>
        </div>
        
        <div class="competition-card">
          <div class="card-image">Family Holiday</div>
          <div class="card-content">
            <span class="card-category">Family</span>
            <h3 class="card-title">Family Trip to Disneyland</h3>
            <span class="card-price">£9.99 per ticket</span>
          </div>
        </div>
      </div>
      
      <div class="coming-soon">Full Platform Coming Soon</div>
    </div>
  </main>
  
  <footer>
    &copy; 2025 Blue Whale Competitions. All rights reserved.
  </footer>
</body>
</html>
`;

module.exports = landingPage;