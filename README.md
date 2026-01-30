# Linguard Blockchain Viewer

A modern Angular application for viewing and exploring blockchain transactions from the Linguard Passporting API.

## Features

- **Dashboard** - Overview with transaction statistics (Total, KYC, Audit)
- **Transaction List** - Browse all blockchain transactions with filtering
- **Search** - Search by name (KYC records), actor name (Audit), or transaction ID
- **Filtering** - Filter by transaction type (All, KYC, Audit)
- **Sorting** - Toggle between newest/oldest first
- **Transaction Details** - View full transaction data including:
  - Personal information (KYC)
  - Contact information (KYC)
  - Identity documents (KYC)
  - Vault documents with MIME types (KYC)
  - Audit event details and actor information (Audit)
  - Block signatures and blockchain metadata
  - Raw JSON data

## Prerequisites

- Node.js 18+ (LTS version recommended)
- npm 9+
- Linguard API key (obtain from Linguard Platform administrator)

## Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:Incept5/blockchain-viewer-angular.git
   cd blockchain-viewer-angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API credentials**

   Copy the template configuration file:
   ```bash
   cp src/app/config/api.config.template.ts src/app/config/api.config.ts
   ```

   Edit `src/app/config/api.config.ts` and add your API key:
   ```typescript
   export const apiConfig = {
     apiUrl: 'https://api.linguard-sandbox.incept5.dev/api/v1',
     apiKey: 'YOUR_API_KEY_HERE'  // Replace with your actual API key
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open the application**

   Navigate to `http://localhost:4200` in your browser.

## Development

### Development server

```bash
npm start
```

Runs the app in development mode with a proxy to handle CORS. The app will automatically reload when you make changes.

### Network access (remote devices)

To access the dev server from other devices on your network (e.g., mobile testing, Tailscale):

```bash
npm start -- --host 0.0.0.0
```

You'll also need to add your hostname to the `allowedHosts` in `angular.json`:

```json
"serve": {
  "options": {
    "allowedHosts": [
      "localhost",
      "your-hostname",
      "your-hostname.tailnet-name.ts.net"
    ]
  }
}
```

### Build for production

```bash
npm run build
```

Builds the app for production to the `dist/` folder.

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Main dashboard component
│   │   ├── header/             # Header with search and controls
│   │   ├── transaction-list/   # Transaction list component
│   │   └── transaction-detail/ # Transaction detail panel
│   ├── config/
│   │   ├── api.config.ts           # API configuration (gitignored)
│   │   └── api.config.template.ts  # Configuration template
│   ├── models/
│   │   └── transaction.model.ts    # TypeScript interfaces
│   └── services/
│       └── blockchain.service.ts   # API service
├── environments/
│   ├── environment.ts          # Development environment
│   └── environment.prod.ts     # Production environment
└── proxy.conf.json             # Development proxy configuration
```

## API Integration

This application integrates with the Linguard Passporting API v0.1:

- **Authentication**: JWT token-based authentication
- **Transactions**: Fetches blockchain transactions with `expandData=true` for full data
- **Pagination**: Uses `pageSize=1000` to fetch all transactions

### Transaction Types

| Type | Description |
|------|-------------|
| KYC | Know Your Customer records with personal information and identity documents |
| AUDIT | System audit trail capturing actions, actors, and context |

## Security

- API keys are stored in `src/app/config/api.config.ts` which is gitignored
- Never commit actual API keys to the repository
- Use the template file as a reference for required configuration

## Technologies

- **Angular 19** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **SCSS** - Styling

## License

Proprietary - All rights reserved.
